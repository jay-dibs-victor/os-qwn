import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum DisputeType {
  CASH_PAYMENT = 'CASH_PAYMENT',
  BANK_TRANSFER = 'BANK_TRANSFER',
  TRIP_FARE = 'TRIP_FARE',
  COMMISSION = 'COMMISSION',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED_DRIVER = 'RESOLVED_DRIVER',
  RESOLVED_RIDER = 'RESOLVED_RIDER',
  RESOLVED_SPLIT = 'RESOLVED_SPLIT',
  DISMISSED = 'DISMISSED',
}

export enum DisputeRaisedBy {
  DRIVER = 'DRIVER',
  RIDER = 'RIDER',
  SYSTEM = 'SYSTEM',
}

@Entity('payment_disputes')
@Index(['tenantId', 'tripId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'driverCustomerId'])
@Index(['tenantId', 'riderCustomerId'])
export class PaymentDispute extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column()
  tripId: string;

  @Column()
  driverCustomerId: string;

  @Column()
  riderCustomerId: string;

  @Column({
    type: 'enum',
    enum: DisputeType,
  })
  disputeType: DisputeType;

  @Column({
    type: 'enum',
    enum: DisputeStatus,
    default: DisputeStatus.OPEN,
  })
  status: DisputeStatus;

  @Column({
    type: 'enum',
    enum: DisputeRaisedBy,
  })
  raisedBy: DisputeRaisedBy;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  disputedAmount: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  resolutionNote?: string;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  resolvedAmount?: number;

  @Column({ nullable: true })
  resolvedById?: string;

  @Column({ nullable: true })
  resolvedAt?: Date;

  @Column({ nullable: true })
  bankTransferId?: string;

  @Column({ type: 'jsonb', nullable: true })
  evidence?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
