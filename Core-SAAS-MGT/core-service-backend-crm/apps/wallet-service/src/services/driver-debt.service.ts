import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DriverDebt, DriverDebtStatus } from '../entities/driver-debt.entity';
import { DriverLedger, DriverLedgerDirection, DriverLedgerEntryType } from '../entities/driver-ledger.entity';
import { ManualSettlementDto, SettlementMethod } from '../dto/driver-debt.dto';
import { DriverLedgerService } from './driver-ledger.service';

@Injectable()
export class DriverDebtService {
  constructor(
    @InjectRepository(DriverDebt)
    private readonly driverDebtRepository: Repository<DriverDebt>,
    @InjectRepository(DriverLedger)
    private readonly driverLedgerRepository: Repository<DriverLedger>,
    private readonly driverLedgerService: DriverLedgerService,
  ) {}

  async getOrCreateDebt(tenantId: string, driverCustomerId: string): Promise<DriverDebt> {
    const existing = await this.driverDebtRepository.findOne({
      where: { tenantId, driverCustomerId },
    });
    if (existing) return existing;

    const debt = this.driverDebtRepository.create({
      tenantId,
      driverCustomerId,
      totalDebt: 0,
      outstandingBalance: 0,
      totalSettled: 0,
      debtThreshold: 5000,
      status: DriverDebtStatus.ACTIVE,
    });
    return this.driverDebtRepository.save(debt);
  }

  async recordCommissionDebt(
    tenantId: string,
    driverCustomerId: string,
    commissionAmount: number,
    tripId: string,
  ): Promise<DriverDebt> {
    const debt = await this.getOrCreateDebt(tenantId, driverCustomerId);
    const amount = Number(commissionAmount);

    debt.totalDebt = Number(debt.totalDebt) + amount;
    debt.outstandingBalance = Number(debt.outstandingBalance) + amount;

    if (Number(debt.outstandingBalance) >= Number(debt.debtThreshold)) {
      debt.status = DriverDebtStatus.RESTRICTED;
      debt.lastRestrictedAt = new Date();
      debt.restrictedReason = `Debt threshold reached: ${debt.outstandingBalance} >= ${debt.debtThreshold}`;
    }

    await this.driverDebtRepository.save(debt);

    await this.driverLedgerService.recordEntry({
      tenantId,
      driverCustomerId,
      entryType: DriverLedgerEntryType.CASH_RIDE_COMMISSION,
      direction: DriverLedgerDirection.DEBIT,
      amount,
      currency: 'NGN',
      reference: `DEBT-COMM-${uuidv4().slice(0, 8)}`,
      tripId,
      description: `Commission debt for trip ${tripId}`,
    });

    return debt;
  }

  async settleDebt(dto: ManualSettlementDto): Promise<DriverDebt> {
    const debt = await this.driverDebtRepository.findOne({
      where: { tenantId: dto.tenantId, driverCustomerId: dto.driverCustomerId },
    });
    if (!debt) throw new NotFoundException('Driver debt record not found');
    if (debt.status === DriverDebtStatus.SETTLED) {
      throw new BadRequestException('Debt is already fully settled');
    }

    const amount = Number(dto.amount);
    const outstanding = Number(debt.outstandingBalance);

    if (amount > outstanding) {
      throw new BadRequestException(`Settlement amount ${amount} exceeds outstanding balance ${outstanding}`);
    }

    debt.outstandingBalance = outstanding - amount;
    debt.totalSettled = Number(debt.totalSettled) + amount;

    if (Number(debt.outstandingBalance) <= 0) {
      debt.status = DriverDebtStatus.SETTLED;
    } else if (Number(debt.outstandingBalance) < Number(debt.debtThreshold)) {
      debt.status = DriverDebtStatus.ACTIVE;
    }

    await this.driverDebtRepository.save(debt);

    const entryType =
      dto.method === SettlementMethod.EARNING_OFFSET
        ? DriverLedgerEntryType.DEBT_SETTLEMENT
        : dto.method === SettlementMethod.WAIVER
          ? DriverLedgerEntryType.DISPUTE_RESOLUTION
          : DriverLedgerEntryType.MANUAL_ADJUSTMENT;

    await this.driverLedgerService.recordEntry({
      tenantId: dto.tenantId,
      driverCustomerId: dto.driverCustomerId,
      entryType,
      direction: DriverLedgerDirection.CREDIT,
      amount,
      currency: 'NGN',
      reference: `DEBT-SET-${uuidv4().slice(0, 8)}`,
      description: dto.description || `Debt settlement via ${dto.method}`,
    });

    return debt;
  }

  async checkDebtStatus(
    tenantId: string,
    driverCustomerId: string,
  ): Promise<{ allowed: boolean; debt: DriverDebt | null }> {
    const debt = await this.driverDebtRepository.findOne({
      where: { tenantId, driverCustomerId },
    });
    if (!debt) return { allowed: true, debt: null };

    const isRestricted = debt.status === DriverDebtStatus.RESTRICTED;
    return { allowed: !isRestricted, debt };
  }

  async updateThreshold(tenantId: string, driverCustomerId: string, threshold: number): Promise<DriverDebt> {
    const debt = await this.getOrCreateDebt(tenantId, driverCustomerId);
    debt.debtThreshold = threshold;
    return this.driverDebtRepository.save(debt);
  }

  async listDebts(tenantId: string, status?: string, page = 1, pageSize = 25) {
    const qb = this.driverDebtRepository.createQueryBuilder('dd').where('dd.tenantId = :tenantId', { tenantId });

    if (status) {
      qb.andWhere('dd.status = :status', { status });
    }

    qb.orderBy('dd.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    return { data, page, pageSize, totalPages, totalItems, hasMore: page < totalPages };
  }

  async getDebtDetail(tenantId: string, driverCustomerId: string): Promise<DriverDebt> {
    const debt = await this.driverDebtRepository.findOne({
      where: { tenantId, driverCustomerId },
    });
    if (!debt) throw new NotFoundException('Driver debt record not found');
    return debt;
  }
}
