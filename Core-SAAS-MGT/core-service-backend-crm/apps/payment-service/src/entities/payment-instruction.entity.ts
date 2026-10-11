import { Entity, Column, Index, OneToMany } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { PaymentStatusLog } from './payment-status-log.entity';

export enum PaymentRail {
  INTERNAL = 'INTERNAL',
  NIBSS = 'NIBSS',
  RTGS = 'RTGS',
  SWIFT = 'SWIFT',
  PAYSTACK = 'PAYSTACK',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
}

@Entity('payment_instructions')
export class PaymentInstruction extends AbstractEntity {
  @Column({ unique: true })
  @Index()
  idempotencyKey: string;

  @Column()
  sourceAccountId: string;

  @Column()
  targetAccountId: string; // Internal or External

  @Column({ nullable: true })
  targetBankCode?: string; // e.g. for NIBSS

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentRail })
  rail: PaymentRail;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ nullable: true })
  approvalId?: string; // Reference to approval service if required

  @Column()
  @Index()
  tenantId: string;

  @Column({ nullable: true })
  reference?: string; // Provider reference

  @OneToMany(() => PaymentStatusLog, (log) => log.paymentInstruction, {
    cascade: true,
  })
  statusLogs: PaymentStatusLog[];
}
