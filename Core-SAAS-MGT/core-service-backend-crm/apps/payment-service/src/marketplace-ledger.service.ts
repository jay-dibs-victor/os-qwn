import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MarketplaceLedgerEntry,
  LedgerEntityType,
  LedgerEntryType,
} from './entities/marketplace-ledger.entity';

@Injectable()
export class MarketplaceLedgerService {
  private readonly logger = new Logger(MarketplaceLedgerService.name);

  constructor(
    @InjectRepository(MarketplaceLedgerEntry)
    private readonly repo: Repository<MarketplaceLedgerEntry>,
  ) {}

  async recordEntry(params: {
    tenantId: string;
    entityType: LedgerEntityType;
    entityId: string;
    type: LedgerEntryType;
    amount: number;
    currency?: string;
    tripId?: string;
    description?: string;
  }): Promise<MarketplaceLedgerEntry> {
    const entry = this.repo.create({
      tenantId: params.tenantId,
      entityType: params.entityType,
      entityId: params.entityId,
      type: params.type,
      amount: params.amount,
      currency: params.currency || 'NGN',
      tripId: params.tripId,
      description: params.description,
    });
    return this.repo.save(entry);
  }

  async getBalance(
    tenantId: string,
    entityType: LedgerEntityType,
    entityId: string,
  ): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('ml')
      .select('COALESCE(SUM(ml.amount), 0)', 'balance')
      .where('ml.tenantId = :tenantId', { tenantId })
      .andWhere('ml.entityType = :entityType', { entityType })
      .andWhere('ml.entityId = :entityId', { entityId })
      .getRawOne();
    return Number(result?.balance || 0);
  }

  async getEntries(
    tenantId: string,
    entityType: LedgerEntityType,
    entityId: string,
    skip = 0,
    take = 50,
  ): Promise<{ data: MarketplaceLedgerEntry[]; total: number }> {
    const [data, total] = await this.repo.findAndCount({
      where: { tenantId, entityType, entityId },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
    return { data, total };
  }

  async getPartnersDue(tenantId: string, remittanceSchedule?: string) {
    const query = this.repo
      .createQueryBuilder('ml')
      .select('ml.entityId', 'entityId')
      .addSelect('SUM(ml.amount)', 'balance')
      .where('ml.tenantId = :tenantId', { tenantId })
      .andWhere('ml.entityType = :entityType', { entityType: LedgerEntityType.PARTNER })
      .groupBy('ml.entityId')
      .having('SUM(ml.amount) > 0');

    if (remittanceSchedule) {
      query.andWhere(
        `ml.entityId IN (SELECT fc."partnerId" FROM fleet_contracts fc WHERE fc."tenantId" = :tenantId AND fc."remittanceSchedule" = :schedule AND fc."isActive" = true)`,
        { tenantId, schedule: remittanceSchedule },
      );
    }

    const results = await query.getRawMany();
    return results as Array<{ entityId: string; balance: number }>;
  }

  async getBalancesForDriver(
    tenantId: string,
    driverId: string,
  ): Promise<{
    collectedDebt: number;
    fareCredits: number;
    netBalance: number;
  }> {
    const rows = await this.repo.find({
      where: {
        tenantId,
        entityType: LedgerEntityType.DRIVER,
        entityId: driverId,
      },
    });

    let collectedDebt = 0;
    let fareCredits = 0;
    for (const row of rows) {
      if (row.type === LedgerEntryType.CASH_COLLECTED_DEBIT) {
        collectedDebt += Number(row.amount);
      } else if (row.type === LedgerEntryType.FARE_CREDIT) {
        fareCredits += Number(row.amount);
      }
    }

    return {
      collectedDebt,
      fareCredits,
      netBalance: collectedDebt + fareCredits,
    };
  }

  async markPayoutPending(
    tenantId: string,
    entityId: string,
    amount: number,
    payoutBatchRef: string,
  ): Promise<void> {
    await this.recordEntry({
      tenantId,
      entityType: LedgerEntityType.PARTNER,
      entityId,
      type: LedgerEntryType.PAYOUT_PENDING,
      amount: -amount,
      description: `Payout batch: ${payoutBatchRef}`,
    });
  }

  async markPayoutSuccess(
    tenantId: string,
    entityId: string,
    amount: number,
    payoutBatchRef: string,
    transferCode?: string,
  ): Promise<void> {
    await this.recordEntry({
      tenantId,
      entityType: LedgerEntityType.PARTNER,
      entityId,
      type: LedgerEntryType.PAYOUT_SUCCESS,
      amount: -amount,
      description: `Transfer ${transferCode || payoutBatchRef}`,
    });
  }
}
