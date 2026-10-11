import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum LedgerEntityType {
  DRIVER = 'driver',
  PARTNER = 'partner',
  PLATFORM = 'platform',
}

export enum LedgerEntryType {
  FARE_CREDIT = 'fare_credit',
  COMMISSION_DEBIT = 'commission_debit',
  FLEET_SPLIT_CREDIT = 'fleet_split_credit',
  FLEET_SPLIT_DEBIT = 'fleet_split_debit',
  CASH_COLLECTED_DEBIT = 'cash_collected_debit',
  PAYOUT_PENDING = 'payout_pending',
  PAYOUT_SUCCESS = 'payout_success',
}

@Entity('marketplace_ledger')
@Index('idx_ml_entity', ['entityType', 'entityId'])
@Index('idx_ml_tenant', ['tenantId'])
@Index('idx_ml_trip', ['tripId'])
export class MarketplaceLedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 20 })
  entityType: LedgerEntityType;

  @Column()
  entityId: string;

  @Column({ nullable: true })
  tripId?: string;

  @Column({ type: 'varchar', length: 30 })
  type: LedgerEntryType;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;
}
