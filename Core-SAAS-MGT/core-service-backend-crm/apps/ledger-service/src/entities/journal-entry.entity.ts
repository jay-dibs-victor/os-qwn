import { Entity, Column, OneToMany, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';
import type { LedgerEntry } from './ledger-entry.entity';

@Entity('journal_entries')
export class JournalEntry extends AbstractEntity {
  @Column()
  @Index()
  reference: string;

  @Column()
  description: string;

  @Column({ type: 'timestamp' })
  @Index()
  postingDate: Date;

  @Column()
  @Index()
  tenantId: string;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @OneToMany('LedgerEntry', 'journalEntry', { cascade: true })
  entries: LedgerEntry[];
}
