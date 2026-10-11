import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum WalletTransactionType {
  TRANSFER = 'TRANSFER',
  FUNDING = 'FUNDING',
  WITHDRAWAL = 'WITHDRAWAL',
  QCOIN_EXCHANGE = 'QCOIN_EXCHANGE',
}

export enum WalletTransactionStatus {
  PENDING = 'PENDING',
  POSTED = 'POSTED',
  FAILED = 'FAILED',
}

@Entity('wallet_transactions')
export class WalletTransaction extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column({
    type: 'enum',
    enum: WalletTransactionType,
  })
  type: WalletTransactionType;

  @Column({
    type: 'enum',
    enum: WalletTransactionStatus,
    default: WalletTransactionStatus.PENDING,
  })
  status: WalletTransactionStatus;

  @Column({ unique: true })
  @Index()
  reference: string;

  @Column({ nullable: true })
  fromAccountNumber?: string;

  @Column({ nullable: true })
  toAccountNumber?: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @Column({ nullable: true })
  journalEntryId?: string;

  @Column({ nullable: true })
  failureReason?: string;
}
