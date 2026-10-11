import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum DriverEarningStatus {
  PENDING = 'PENDING',
  POSTED = 'POSTED',
  PAID = 'PAID',
  REVERSED = 'REVERSED',
}

@Entity('driver_earnings')
@Index(['tenantId', 'driverCustomerId'])
@Index(['tenantId', 'tripId'])
@Index(['tenantId', 'status'])
export class DriverEarning extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column()
  driverCustomerId: string;

  @Column()
  tripId: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  tripFare: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  platformCommission: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  partnerCommission: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  netEarnings: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  bonusAmount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  penaltyAmount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  subscriptionDeduction: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  leaseDeduction: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  finalPayout: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'enum', enum: DriverEarningStatus, default: DriverEarningStatus.PENDING })
  status: DriverEarningStatus;

  @Column({ nullable: true })
  journalEntryId?: string;

  @Column({ nullable: true })
  walletTransactionId?: string;

  @Column({ nullable: true })
  settlementReference?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
