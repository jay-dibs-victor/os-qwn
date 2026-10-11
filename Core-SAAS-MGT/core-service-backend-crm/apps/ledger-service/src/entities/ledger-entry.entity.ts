import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';
import type { JournalEntry } from './journal-entry.entity';
import { GlAccount } from './gl-account.entity';

export enum EntrySide {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Entity('ledger_entries')
export class LedgerEntry extends AbstractEntity {
  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: EntrySide })
  side: EntrySide;

  @ManyToOne(() => GlAccount)
  @Index()
  account: GlAccount;

  @Column({ nullable: true })
  @Index()
  subLedgerId?: string;

  @Column({ nullable: true })
  subLedgerType?: string;

  @ManyToOne('JournalEntry', 'entries')
  @Index()
  journalEntry: JournalEntry;

  @Column()
  @Index()
  tenantId: string;
}
