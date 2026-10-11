import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

@Entity('trial_balance_snapshots')
export class TrialBalanceSnapshot extends AbstractEntity {
  @Column({ type: 'timestamp' })
  @Index()
  snapshotDate: Date;

  @Column({ type: 'jsonb' })
  balances: Record<string, number>; // glAccountId -> balance

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalDebit: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalCredit: number;

  @Column()
  @Index()
  tenantId: string;
}
