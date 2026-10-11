import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum PaystackTransactionStatus {
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum PaystackSplitType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

@Entity('paystack_transactions')
export class PaystackTransaction extends AbstractEntity {
  @Column({ unique: true })
  @Index()
  reference: string;

  @Column({ nullable: true })
  paystackReference?: string;

  @Column({ nullable: true })
  accessCode?: string;

  @Column({ nullable: true })
  authorizationUrl?: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaystackTransactionStatus,
    default: PaystackTransactionStatus.INITIATED,
  })
  status: PaystackTransactionStatus;

  @Column({ nullable: true })
  trialRef?: string;

  @Column({ nullable: true })
  driverCustomerId?: string;

  @Column({ nullable: true })
  riderCustomerId?: string;

  @Column({ nullable: true })
  tenantId?: string;

  @Column({ nullable: true })
  partnerId?: string;

  @Column({ type: 'jsonb', nullable: true })
  splitConfig?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  paystackResponse?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  journalEntryId?: string;
}
