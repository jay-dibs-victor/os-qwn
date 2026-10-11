import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { DriverLedger, DriverLedgerDirection, DriverLedgerEntryType } from '../entities/driver-ledger.entity';
import { DriverDebt, DriverDebtStatus } from '../entities/driver-debt.entity';
import { PaymentDispute, DisputeStatus } from '../entities/payment-dispute.entity';
import { FraudFlag, FraudFlagSeverity, FraudFlagStatus } from '../entities/fraud-flag.entity';

@Injectable()
export class FraudDetectionService {
  constructor(
    @InjectRepository(DriverLedger)
    private readonly driverLedgerRepository: Repository<DriverLedger>,
    @InjectRepository(DriverDebt)
    private readonly driverDebtRepository: Repository<DriverDebt>,
    @InjectRepository(PaymentDispute)
    private readonly disputeRepository: Repository<PaymentDispute>,
    @InjectRepository(FraudFlag)
    private readonly fraudFlagRepository: Repository<FraudFlag>,
  ) {}

  async evaluateDriver(tenantId: string, driverCustomerId: string): Promise<FraudFlag[]> {
    const flags: FraudFlag[] = [];

    const excessiveCashRule = await this.checkExcessiveCashTrips(tenantId, driverCustomerId);
    if (excessiveCashRule) flags.push(excessiveCashRule);

    const repeatedDisputesRule = await this.checkRepeatedDisputes(tenantId, driverCustomerId);
    if (repeatedDisputesRule) flags.push(repeatedDisputesRule);

    const highDebtRule = await this.checkHighDebtRatio(tenantId, driverCustomerId);
    if (highDebtRule) flags.push(highDebtRule);

    return flags;
  }

  private async checkExcessiveCashTrips(tenantId: string, driverCustomerId: string): Promise<FraudFlag | null> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const cashCommissionEntries = await this.driverLedgerRepository.count({
      where: {
        tenantId,
        driverCustomerId,
        entryType: DriverLedgerEntryType.CASH_RIDE_COMMISSION,
        createdAt: MoreThanOrEqual(sevenDaysAgo),
      },
    });

    if (cashCommissionEntries >= 20) {
      return this.createFlag(tenantId, driverCustomerId, {
        ruleName: 'EXCESSIVE_CASH_TRIPS',
        description: `Driver completed ${cashCommissionEntries} cash trips in 7 days (threshold: 20)`,
        severity: cashCommissionEntries >= 50 ? FraudFlagSeverity.HIGH : FraudFlagSeverity.MEDIUM,
        evidence: { cashTripCount: cashCommissionEntries, periodDays: 7, threshold: 20 },
      });
    }

    return null;
  }

  private async checkRepeatedDisputes(tenantId: string, driverCustomerId: string): Promise<FraudFlag | null> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const disputeCount = await this.disputeRepository.count({
      where: {
        tenantId,
        driverCustomerId,
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    if (disputeCount >= 5) {
      return this.createFlag(tenantId, driverCustomerId, {
        ruleName: 'REPEATED_DISPUTES',
        description: `Driver involved in ${disputeCount} disputes in 30 days (threshold: 5)`,
        severity: disputeCount >= 15 ? FraudFlagSeverity.CRITICAL : FraudFlagSeverity.MEDIUM,
        evidence: { disputeCount, periodDays: 30, threshold: 5 },
      });
    }

    return null;
  }

  private async checkHighDebtRatio(tenantId: string, driverCustomerId: string): Promise<FraudFlag | null> {
    const totalEarnings = await this.driverLedgerRepository
      .createQueryBuilder('dl')
      .where('dl.tenantId = :tenantId', { tenantId })
      .andWhere('dl.driverCustomerId = :driverCustomerId', { driverCustomerId })
      .andWhere('dl.direction = :direction', { direction: DriverLedgerDirection.CREDIT })
      .select('COALESCE(SUM(dl.amount), 0)', 'total')
      .getRawOne();

    const debt = await this.driverDebtRepository.findOne({
      where: { tenantId, driverCustomerId },
    });

    if (!debt || Number(debt.outstandingBalance) <= 0 || !totalEarnings) {
      return null;
    }

    const totalEarningsNum = Number(totalEarnings.total);
    const outstanding = Number(debt.outstandingBalance);

    if (totalEarningsNum > 0 && outstanding / totalEarningsNum > 0.5) {
      return this.createFlag(tenantId, driverCustomerId, {
        ruleName: 'HIGH_DEBT_TO_EARNINGS_RATIO',
        description: `Driver debt ratio ${(outstanding / totalEarningsNum * 100).toFixed(1)}% (threshold: 50%)`,
        severity: outstanding / totalEarningsNum > 0.8 ? FraudFlagSeverity.HIGH : FraudFlagSeverity.MEDIUM,
        evidence: { outstandingDebt: outstanding, totalEarnings: totalEarningsNum, ratio: outstanding / totalEarningsNum },
      });
    }

    return null;
  }

  private async createFlag(
    tenantId: string,
    driverCustomerId: string,
    params: {
      ruleName: string;
      description: string;
      severity: FraudFlagSeverity;
      evidence?: Record<string, any>;
    },
  ): Promise<FraudFlag> {
    const existing = await this.fraudFlagRepository.findOne({
      where: {
        tenantId,
        driverCustomerId,
        ruleName: params.ruleName,
        status: FraudFlagStatus.OPEN,
      },
    });
    if (existing) return existing;

    const flag = this.fraudFlagRepository.create({
      tenantId,
      driverCustomerId,
      ruleName: params.ruleName,
      description: params.description,
      severity: params.severity,
      evidence: params.evidence || {},
      status: FraudFlagStatus.OPEN,
    });
    return this.fraudFlagRepository.save(flag);
  }

  async listFlags(tenantId: string, status?: string, page = 1, pageSize = 25) {
    const qb = this.fraudFlagRepository.createQueryBuilder('ff');
    if (tenantId !== 'root-admin') {
      qb.andWhere('ff.tenantId = :tenantId', { tenantId });
    }
    if (status) {
      qb.andWhere('ff.status = :status', { status });
    }
    qb.orderBy('ff.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    return { data, page, pageSize, totalPages, totalItems, hasMore: page < totalPages };
  }

  async reviewFlag(tenantId: string, id: string, status: FraudFlagStatus, reviewNote?: string, reviewedById?: string): Promise<FraudFlag> {
    const where: any = { id };
    if (tenantId !== 'root-admin') where.tenantId = tenantId;
    const flag = await this.fraudFlagRepository.findOne({ where });
    if (!flag) throw new NotFoundException('Fraud flag not found');

    flag.status = status;
    flag.reviewNote = reviewNote;
    flag.reviewedById = reviewedById;
    flag.reviewedAt = new Date();
    return this.fraudFlagRepository.save(flag);
  }
}
