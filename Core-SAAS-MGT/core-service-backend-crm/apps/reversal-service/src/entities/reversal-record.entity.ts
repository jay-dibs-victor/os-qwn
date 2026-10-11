import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum ReversalReason {
  DUPLICATE_PAYMENT = 'DUPLICATE_PAYMENT',
  WRONG_RECIPIENT = 'WRONG_RECIPIENT',
  FRAUD_SUSPECTED = 'FRAUD_SUSPECTED',
  TECHNICAL_ERROR = 'TECHNICAL_ERROR',
  CUSTOMER_REQUEST = 'CUSTOMER_REQUEST',
}

export enum ReversalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ReversalType {
  FULL_REVERSAL = 'FULL_REVERSAL',
  PARTIAL_REVERSAL = 'PARTIAL_REVERSAL',
  CHARGEBACK = 'CHARGEBACK',
}

@Entity('reversal_records')
export class ReversalRecord extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: ReversalType,
    default: ReversalType.FULL_REVERSAL,
  })
  type: ReversalType;

  @Column()
  @Index()
  originalTransactionId: string;

  @Column({ nullable: true })
  reversalTransactionId: string; // The ID of the reversing transaction in ledger

  @Column({
    type: 'enum',
    enum: ReversalReason,
  })
  reason: ReversalReason;

  @Column({ nullable: true })
  reasonDescription: string;

  @Column({
    type: 'enum',
    enum: ReversalStatus,
    default: ReversalStatus.PENDING,
  })
  status: ReversalStatus;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  requestedBy: string;

  @Column({ nullable: true })
  approvedBy: string;
}
