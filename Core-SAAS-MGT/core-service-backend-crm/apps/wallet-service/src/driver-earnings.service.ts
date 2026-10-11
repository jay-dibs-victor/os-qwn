import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  DriverEarning,
  DriverEarningStatus,
} from './entities/driver-earning.entity';
import {
  RecordDriverEarningDto,
  QueryDriverEarningDto,
} from './dto/driver-earnings.dto';

@Injectable()
export class DriverEarningsService {
  private readonly logger = new Logger(DriverEarningsService.name);

  constructor(
    @InjectRepository(DriverEarning)
    private readonly driverEarningRepo: Repository<DriverEarning>,
    private readonly configService: ConfigService,
  ) {}

  private get ledgerBaseUrl() {
    const host = this.configService.get<string>('LEDGER_SERVICE_HOST');
    const port = this.configService.get<number>('LEDGER_SERVICE_PORT');
    return `http://${host}:${port}/ledger`;
  }

  private get accountsBaseUrl() {
    const host = this.configService.get<string>('ACCOUNTS_SERVICE_HOST');
    const port = this.configService.get<number>('ACCOUNTS_SERVICE_PORT');
    return `http://${host}:${port}/accounts`;
  }

  async recordEarning(dto: RecordDriverEarningDto): Promise<DriverEarning> {
    const existing = await this.driverEarningRepo.findOne({
      where: { tripId: dto.tripId, tenantId: dto.tenantId },
    });
    if (existing) {
      return existing;
    }

    const finalPayout =
      Number(dto.netEarnings) +
      Number(dto.bonusAmount || 0) -
      Number(dto.penaltyAmount || 0) -
      Number(dto.subscriptionDeduction || 0) -
      Number(dto.leaseDeduction || 0);

    const earning = this.driverEarningRepo.create({
      tenantId: dto.tenantId,
      driverCustomerId: dto.driverCustomerId,
      tripId: dto.tripId,
      tripFare: dto.tripFare,
      platformCommission: dto.platformCommission,
      partnerCommission: dto.partnerCommission,
      netEarnings: dto.netEarnings,
      bonusAmount: dto.bonusAmount || 0,
      penaltyAmount: dto.penaltyAmount || 0,
      subscriptionDeduction: dto.subscriptionDeduction || 0,
      leaseDeduction: dto.leaseDeduction || 0,
      finalPayout: Math.max(0, finalPayout),
      currency: dto.currency || 'NGN',
      status: DriverEarningStatus.PENDING,
      settlementReference: dto.settlementReference,
      metadata: dto.metadata,
    });

    return this.driverEarningRepo.save(earning);
  }

  async markAsPosted(id: string, journalEntryId: string): Promise<DriverEarning> {
    await this.driverEarningRepo.update(id, {
      status: DriverEarningStatus.POSTED,
      journalEntryId,
    });
    return this.driverEarningRepo.findOneOrFail({ where: { id } });
  }

  async markAsPaid(id: string, walletTxId: string): Promise<DriverEarning> {
    await this.driverEarningRepo.update(id, {
      status: DriverEarningStatus.PAID,
      walletTransactionId: walletTxId,
    });
    return this.driverEarningRepo.findOneOrFail({ where: { id } });
  }

  async payoutDriver(
    driverEarningId: string,
    driverAccountNumber: string,
    tenantId: string,
  ) {
    const earning = await this.driverEarningRepo.findOne({
      where: { id: driverEarningId, tenantId },
    });
    if (!earning) {
      throw new BadRequestException('Driver earning not found');
    }

    if (earning.status === DriverEarningStatus.PAID) {
      throw new BadRequestException('Driver earning already paid');
    }

    const { data: account } = await axios.get(
      `${this.accountsBaseUrl}/${driverAccountNumber}`,
    );
    if (!account?.glAccountId) {
      throw new BadRequestException(
        'Driver account not linked to a GL account',
      );
    }

    const reference = `DRV-PAY-${uuidv4().slice(0, 12)}`;

    const { data: glAccounts } = await axios.get(
      `${this.ledgerBaseUrl}/accounts`,
      { params: { tenantId } },
    );

    const driverPayableGl = (glAccounts as Array<{ code: string; id: string }>).find(
      (a) => a.code === '2302',
    );
    if (!driverPayableGl) {
      throw new BadRequestException('Driver Payable GL account not found');
    }

    const { data: journal } = await axios.post(
      `${this.ledgerBaseUrl}/posting/transaction`,
      {
        reference,
        description: `Driver payout for trip ${earning.tripId}`,
        postingDate: new Date(),
        currency: earning.currency,
        tenantId,
        entries: [
          {
            glAccountId: driverPayableGl.id,
            amount: Number(earning.finalPayout),
            side: 'DEBIT',
            subLedgerId: earning.driverCustomerId,
            subLedgerType: 'DRIVER_ACCOUNT',
          },
          {
            glAccountId: account.glAccountId,
            amount: Number(earning.finalPayout),
            side: 'CREDIT',
            subLedgerId: driverAccountNumber,
            subLedgerType: 'CUSTOMER_ACCOUNT',
          },
        ],
      },
    );

    earning.status = DriverEarningStatus.PAID;
    earning.journalEntryId = journal.id;
    await this.driverEarningRepo.save(earning);

    return {
      success: true,
      message: 'Driver payout completed',
      driverEarningId: earning.id,
      amount: Number(earning.finalPayout),
      journalEntryId: journal.id,
    };
  }

  async getDriverEarnings(
    driverCustomerId: string,
    tenantId: string,
    query: { fromDate?: string; toDate?: string; status?: string },
  ) {
    const qb = this.driverEarningRepo
      .createQueryBuilder('de')
      .where('de.driverCustomerId = :driverCustomerId', { driverCustomerId })
      .andWhere('de.tenantId = :tenantId', { tenantId });

    if (query.status) {
      qb.andWhere('de.status = :status', { status: query.status });
    }
    if (query.fromDate) {
      qb.andWhere('de.createdAt >= :fromDate', {
        fromDate: new Date(query.fromDate),
      });
    }
    if (query.toDate) {
      qb.andWhere('de.createdAt <= :toDate', {
        toDate: new Date(query.toDate),
      });
    }

    qb.orderBy('de.createdAt', 'DESC');

    const earnings = await qb.getMany();
    const totals = earnings.reduce(
      (acc, e) => ({
        totalFare: acc.totalFare + Number(e.tripFare),
        totalNetEarnings: acc.totalNetEarnings + Number(e.netEarnings),
        totalCommission: acc.totalCommission + Number(e.platformCommission),
        totalPayout: acc.totalPayout + Number(e.finalPayout),
        totalBonus: acc.totalBonus + Number(e.bonusAmount),
        totalPenalty: acc.totalPenalty + Number(e.penaltyAmount),
      }),
      {
        totalFare: 0,
        totalNetEarnings: 0,
        totalCommission: 0,
        totalPayout: 0,
        totalBonus: 0,
        totalPenalty: 0,
      },
    );

    return {
      driverCustomerId,
      tenantId,
      earnings,
      totals,
    };
  }

  async getEarningsSummary(tenantId: string, driverCustomerId?: string) {
    const qb = this.driverEarningRepo
      .createQueryBuilder('de')
      .where('de.tenantId = :tenantId', { tenantId });

    if (driverCustomerId) {
      qb.andWhere('de.driverCustomerId = :driverCustomerId', { driverCustomerId });
    }

    const result = await qb
      .select([
        'COALESCE(SUM(de.netEarnings), 0) as "totalEarnings"',
        'COALESCE(SUM(de.platformCommission + de.partnerCommission), 0) as "totalCommission"',
        'COALESCE(SUM(de.bonusAmount), 0) as "totalBonus"',
        'COALESCE(SUM(de.penaltyAmount), 0) as "totalPenalty"',
        'COALESCE(SUM(de.subscriptionDeduction + de.leaseDeduction), 0) as "totalDeductions"',
        'COUNT(*) as "totalTrips"',
        'COALESCE(AVG(de.netEarnings), 0) as "averagePerTrip"',
      ])
      .getRawOne();

    const paidResult = await this.driverEarningRepo
      .createQueryBuilder('de')
      .where('de.tenantId = :tenantId', { tenantId })
      .andWhere('de.status = :status', { status: 'PAID' });
    if (driverCustomerId) {
      paidResult.andWhere('de.driverCustomerId = :driverCustomerId', { driverCustomerId });
    }
    const paidRow = await paidResult
      .select('COALESCE(SUM(de.finalPayout), 0) as "totalPaid"')
      .getRawOne();

    const pendingResult = await this.driverEarningRepo
      .createQueryBuilder('de')
      .where('de.tenantId = :tenantId', { tenantId })
      .andWhere('de.status IN (:...statuses)', { statuses: ['PENDING', 'POSTED'] });
    if (driverCustomerId) {
      pendingResult.andWhere('de.driverCustomerId = :driverCustomerId', { driverCustomerId });
    }
    const pendingRow = await pendingResult
      .select('COALESCE(SUM(de.finalPayout), 0) as "totalPending"')
      .getRawOne();

    return {
      totalEarnings: Number(result?.totalEarnings || 0),
      totalPaid: Number(paidRow?.totalPaid || 0),
      totalPending: Number(pendingRow?.totalPending || 0),
      totalCommission: Number(result?.totalCommission || 0),
      totalBonus: Number(result?.totalBonus || 0),
      totalPenalty: Number(result?.totalPenalty || 0),
      totalDeductions: Number(result?.totalDeductions || 0),
      totalTrips: Number(result?.totalTrips || 0),
      averagePerTrip: Number(result?.averagePerTrip || 0),
    };
  }

  async listEarnings(query: QueryDriverEarningDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 25;

    const qb = this.driverEarningRepo
      .createQueryBuilder('de')
      .where('de.tenantId = :tenantId', { tenantId: query.tenantId });

    if (query.driverCustomerId) {
      qb.andWhere('de.driverCustomerId = :driverCustomerId', {
        driverCustomerId: query.driverCustomerId,
      });
    }
    if (query.status) {
      qb.andWhere('de.status = :status', { status: query.status });
    }
    if (query.fromDate) {
      qb.andWhere('de.createdAt >= :fromDate', {
        fromDate: new Date(query.fromDate),
      });
    }
    if (query.toDate) {
      qb.andWhere('de.createdAt <= :toDate', {
        toDate: new Date(query.toDate),
      });
    }

    qb.orderBy('de.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return {
      data,
      page,
      pageSize,
      totalPages,
      totalItems,
      hasMore: page < totalPages,
    };
  }
}
