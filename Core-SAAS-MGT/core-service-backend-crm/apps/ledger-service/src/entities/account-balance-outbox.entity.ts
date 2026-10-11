import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { EntrySide } from './ledger-entry.entity';

export enum OutboxStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

@Entity('account_balance_outbox')
export class AccountBalanceOutbox extends AbstractEntity {
  @Column()
  @Index({ unique: true })
  ledgerEntryId: string;

  @Column({ length: 10 })
  @Index()
  accountNumber: string;

  @Column({ type: 'enum', enum: EntrySide })
  side: EntrySide;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column()
  reference: string;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ type: 'enum', enum: OutboxStatus, default: OutboxStatus.PENDING })
  @Index()
  status: OutboxStatus;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'text', nullable: true })
  lastError: string | null;
}

