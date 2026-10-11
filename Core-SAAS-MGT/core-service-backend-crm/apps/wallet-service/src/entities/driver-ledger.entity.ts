import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum DriverLedgerEntryType {
  TRIP_EARNING = 'TRIP_EARNING',
  CASH_RIDE_COMMISSION = 'CASH_RIDE_COMMISSION',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DEBT_SETTLEMENT = 'DEBT_SETTLEMENT',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
  DISPUTE_RESOLUTION = 'DISPUTE_RESOLUTION',
  PROMO_BONUS = 'PROMO_BONUS',
  PENALTY = 'PENALTY',
}

export enum DriverLedgerDirection {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

@Entity('driver_ledger')
@Index(['tenantId', 'driverCustomerId'])
@Index(['tenantId', 'driverCustomerId', 'entryType'])
@Index(['tenantId', 'reference', 'driverCustomerId'], { unique: true })
export class DriverLedger extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column()
  driverCustomerId: string;

  @Column({
    type: 'enum',
    enum: DriverLedgerEntryType,
  })
  entryType: DriverLedgerEntryType;

  @Column({
    type: 'enum',
    enum: DriverLedgerDirection,
  })
  direction: DriverLedgerDirection;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  runningBalance: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({ unique: true })
  reference: string;

  @Column({ nullable: true })
  tripId?: string;

  @Column({ nullable: true })
  disputeId?: string;

  @Column({ nullable: true })
  journalEntryId?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
