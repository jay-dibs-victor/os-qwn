import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DriverLedger, DriverLedgerDirection, DriverLedgerEntryType } from '../entities/driver-ledger.entity';
import { DriverDebt, DriverDebtStatus } from '../entities/driver-debt.entity';
import { RecordDriverLedgerEntryDto, QueryDriverLedgerDto } from '../dto/driver-ledger.dto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DriverLedgerService {
  private readonly logger = new Logger(DriverLedgerService.name);

  constructor(
    @InjectRepository(DriverLedger)
    private readonly driverLedgerRepository: Repository<DriverLedger>,
    @InjectRepository(DriverDebt)
    private readonly driverDebtRepository: Repository<DriverDebt>,
    private readonly configService: ConfigService,
  ) {}

  private get ledgerBaseUrl() {
    const host = this.configService.get<string>('LEDGER_SERVICE_HOST');
    const port = this.configService.get<number>('LEDGER_SERVICE_PORT');
    return `http://${host}:${port}/ledger`;
  }

  async recordEntry(dto: RecordDriverLedgerEntryDto, driverGlAccountId?: string, balancingGlAccountId?: string): Promise<DriverLedger> {
    const reference = dto.reference || `DRV-LDG-${uuidv4().slice(0, 8)}`;
    const amount = Number(dto.amount);

    const lastEntry = await this.driverLedgerRepository.findOne({
      where: { tenantId: dto.tenantId, driverCustomerId: dto.driverCustomerId },
      order: { createdAt: 'DESC' },
    });
    const previousBalance = lastEntry ? Number(lastEntry.runningBalance) : 0;
    const runningBalance =
      dto.direction === DriverLedgerDirection.CREDIT
        ? previousBalance + amount
        : previousBalance - amount;

    const entry = this.driverLedgerRepository.create({
      tenantId: dto.tenantId,
      driverCustomerId: dto.driverCustomerId,
      entryType: dto.entryType,
      direction: dto.direction,
      amount,
      runningBalance,
      currency: dto.currency || 'NGN',
      reference,
      tripId: dto.tripId,
      disputeId: dto.disputeId,
      description: dto.description,
      metadata: {},
    });

    let resolvedDriverGlId = driverGlAccountId;
    if (!resolvedDriverGlId) {
      try {
        const { data: { data: accounts } } = await axios.get(
          `${this.ledgerBaseUrl}/accounts`,
          { params: { tenantId: dto.tenantId } },
        );
        const findByCode = (code: string) => {
          const acc = (accounts as Array<{ code: string; id: string }>).find(
            (a: { code: string }) => a.code === code,
          );
          if (!acc) return null;
          return acc.id;
        };

        if (
          dto.entryType === DriverLedgerEntryType.CASH_RIDE_COMMISSION ||
          dto.entryType === DriverLedgerEntryType.DEBT_SETTLEMENT
        ) {
          resolvedDriverGlId = findByCode('1403') || undefined;
        } else {
          resolvedDriverGlId = findByCode('2301') || undefined;
        }
      } catch (err) {
        this.logger.warn(`Could not resolve driver GL account dynamically: ${err}`);
      }
    }

    if (resolvedDriverGlId) {
      try {
        const journal = await this.postLedgerEntry(reference, dto, resolvedDriverGlId, amount, balancingGlAccountId);
        entry.journalEntryId = journal.id;
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? JSON.stringify(error.response?.data || error.message)
          : String(error);
        throw new BadRequestException(`Ledger posting failed: ${message}`);
      }
    }

    await this.driverLedgerRepository.save(entry);
    return entry;
  }

  async getGlAccountIdByCode(tenantId: string, code: string): Promise<string> {
    const { data: { data: accounts } } = await axios.get(
      `${this.ledgerBaseUrl}/accounts`,
      { params: { tenantId } },
    );
    const acc = (accounts as Array<{ code: string; id: string }>).find(
      (a: { code: string }) => a.code === code,
    );
    if (!acc)
      throw new BadRequestException(`GL Account ${code} not found for tenant ${tenantId}`);
    return acc.id;
  }

  private get accountsBaseUrl() {
    const host = this.configService.get<string>('ACCOUNTS_SERVICE_HOST');
    const port = this.configService.get<number>('ACCOUNTS_SERVICE_PORT');
    return `http://${host}:${port}/accounts`;
  }

  async getDriverWalletAccountNumber(driverCustomerId: string, tenantId: string): Promise<string | null> {
    try {
      const { data: accounts } = await axios.get(
        `${this.accountsBaseUrl}/customer/${driverCustomerId}`,
        { params: { tenantId } }
      );
      const acc = (accounts as Array<{ accountNumber: string; currency: string }>).find(
        (a) => a.currency === 'NGN'
      );
      return acc ? acc.accountNumber : null;
    } catch (err) {
      this.logger.warn(`Could not fetch driver wallet account from accounts-service: ${err}`);
      return null;
    }
  }

  private async postLedgerEntry(
    reference: string,
    dto: RecordDriverLedgerEntryDto,
    glAccountId: string,
    amount: number,
    providedBalancingGlId?: string,
  ) {
    const balancingGlAccountId =
      providedBalancingGlId ??
      (await this.resolveBalancingGlAccount(dto.tenantId, dto.entryType, dto.direction));

    // Resolve GL accounts codes dynamically to find 2301
    const { data: { data: accounts } } = await axios.get(
      `${this.ledgerBaseUrl}/accounts`,
      { params: { tenantId: dto.tenantId } },
    );
    const findIdByCode = (code: string) => {
      const acc = (accounts as Array<{ code: string; id: string }>).find(
        (a: { code: string }) => a.code === code,
      );
      return acc ? acc.id : null;
    };

    const driverWalletGlId = findIdByCode('2301');
    const driverDebtGlId = findIdByCode('1403');

    let driverWalletAccountNumber: string | null = null;
    if (glAccountId === driverWalletGlId || balancingGlAccountId === driverWalletGlId) {
      driverWalletAccountNumber = await this.getDriverWalletAccountNumber(dto.driverCustomerId, dto.tenantId);
    }

    const entries: Array<{
      glAccountId: string;
      amount: number;
      side: string;
      subLedgerId?: string;
      subLedgerType?: string;
    }> = [];

    // First entry: glAccountId
    if (glAccountId === driverWalletGlId && driverWalletAccountNumber) {
      entries.push({
        glAccountId,
        amount,
        side: dto.direction === DriverLedgerDirection.CREDIT ? 'CREDIT' : 'DEBIT',
        subLedgerId: driverWalletAccountNumber,
        subLedgerType: 'CUSTOMER_ACCOUNT',
      });
    } else {
      entries.push({
        glAccountId,
        amount,
        side: dto.direction === DriverLedgerDirection.CREDIT ? 'CREDIT' : 'DEBIT',
        subLedgerId: dto.driverCustomerId,
        subLedgerType: glAccountId === driverDebtGlId ? 'DRIVER_ACCOUNT' : 'DRIVER_ACCOUNT',
      });
    }

    // Second entry: balancingGlAccountId
    if (balancingGlAccountId === driverWalletGlId && driverWalletAccountNumber) {
      entries.push({
        glAccountId: balancingGlAccountId,
        amount,
        side: dto.direction === DriverLedgerDirection.CREDIT ? 'DEBIT' : 'CREDIT',
        subLedgerId: driverWalletAccountNumber,
        subLedgerType: 'CUSTOMER_ACCOUNT',
      });
    } else {
      entries.push({
        glAccountId: balancingGlAccountId,
        amount,
        side: dto.direction === DriverLedgerDirection.CREDIT ? 'DEBIT' : 'CREDIT',
      });
    }

    const { data } = await axios.post(`${this.ledgerBaseUrl}/posting/transaction`, {
      reference,
      description: dto.description || `Driver Ledger: ${reference}`,
      postingDate: new Date(),
      currency: dto.currency || 'NGN',
      tenantId: dto.tenantId,
      entries,
    });
    return data as { id: string; reference: string };
  }

  private async resolveBalancingGlAccount(tenantId: string, entryType: DriverLedgerEntryType, direction: DriverLedgerDirection) {
    const { data: { data: accounts } } = await axios.get(
      `${this.ledgerBaseUrl}/accounts`,
      { params: { tenantId } },
    );

    const findByCode = (code: string) => {
      const acc = (accounts as Array<{ code: string; id: string }>).find(
        (a: { code: string }) => a.code === code,
      );
      if (!acc)
        throw new BadRequestException(`GL Account ${code} not found for tenant ${tenantId}`);
      return acc.id;
    };

    switch (entryType) {
      case DriverLedgerEntryType.CASH_RIDE_COMMISSION:
        return findByCode('4201');
      case DriverLedgerEntryType.DEBT_SETTLEMENT:
        return findByCode('2301');
      case DriverLedgerEntryType.TRIP_EARNING:
      case DriverLedgerEntryType.BANK_TRANSFER:
        return findByCode('2402');
      case DriverLedgerEntryType.PROMO_BONUS:
        return findByCode('5201');
      case DriverLedgerEntryType.PENALTY:
        return findByCode('4403');
      case DriverLedgerEntryType.MANUAL_ADJUSTMENT:
      case DriverLedgerEntryType.DISPUTE_RESOLUTION:
      default:
        return direction === DriverLedgerDirection.CREDIT
          ? findByCode('5303')
          : findByCode('4403');
    }
  }

  async getBalance(tenantId: string, driverCustomerId: string): Promise<{ balance: number; currency: string }> {
    const lastEntry = await this.driverLedgerRepository.findOne({
      where: { tenantId, driverCustomerId },
      order: { createdAt: 'DESC' },
    });
    return {
      balance: lastEntry ? Number(lastEntry.runningBalance) : 0,
      currency: lastEntry?.currency || 'NGN',
    };
  }

  async getLedger(
    tenantId: string,
    driverCustomerId: string,
    query: QueryDriverLedgerDto,
  ) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 25);

    const qb = this.driverLedgerRepository
      .createQueryBuilder('dl')
      .where('dl.tenantId = :tenantId', { tenantId })
      .andWhere('dl.driverCustomerId = :driverCustomerId', { driverCustomerId });

    if (query.entryType) {
      qb.andWhere('dl.entryType = :entryType', { entryType: query.entryType });
    }
    if (query.direction) {
      qb.andWhere('dl.direction = :direction', { direction: query.direction });
    }
    if (query.fromDate) {
      qb.andWhere('dl.createdAt >= :fromDate', { fromDate: new Date(query.fromDate) });
    }
    if (query.toDate) {
      qb.andWhere('dl.createdAt <= :toDate', { toDate: new Date(query.toDate) });
    }

    qb.orderBy('dl.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    return { data, page, pageSize, totalPages, totalItems, hasMore: page < totalPages };
  }
}
