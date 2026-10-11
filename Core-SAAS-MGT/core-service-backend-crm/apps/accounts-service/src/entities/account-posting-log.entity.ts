import { Entity, Column, Index, CreateDateColumn } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum AccountPostingSide {
  DEBIT  = 'DEBIT',
  CREDIT = 'CREDIT',
}

/**
 * Immutable audit log of every balance movement applied to an account.
 * Written once per ledger entry — idempotency key is (accountNumber, ledgerEntryId).
 */
@Entity('account_posting_logs')
@Index(['accountNumber', 'ledgerEntryId'], { unique: true })
@Index(['accountNumber', 'tenantId'])
@Index(['reference'])
export class AccountPostingLog extends AbstractEntity {
  @Column()
  @Index()
  accountNumber: string;

  /** FK to ledger_entries.id — used as idempotency key */
  @Column()
  ledgerEntryId: string;

  @Column()
  reference: string;

  @Column({ type: 'enum', enum: AccountPostingSide })
  side: AccountPostingSide;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column()
  @Index()
  tenantId: string;

  /** Running balance after this posting was applied */
  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  balanceAfter: number;

  /** Running available balance after this posting was applied */
  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  availableBalanceAfter: number;

  @CreateDateColumn()
  postedAt: Date;
}
