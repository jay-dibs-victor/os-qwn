import { AbstractEntity } from '@app/common';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { DpdBucket, LoanAccount } from './loan-account.entity';

@Entity('loan_provisions')
export class LoanProvision extends AbstractEntity {
  @Column()
  loanAccountId: string;

  @ManyToOne(() => LoanAccount)
  @JoinColumn({ name: 'loanAccountId' })
  loanAccount: LoanAccount;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  outstandingPrincipal: number;

  @Column({ type: 'float' })
  provisionRate: number;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  provisionAmount: number;

  @Column({ type: 'varchar', length: 20 })
  dpdBucket: DpdBucket;

  @Column({ default: 0 })
  daysPastDue: number;

  @Column()
  reason: string;

  @Column({ nullable: true })
  ledgerTransactionId?: string;

  @Column()
  tenantId: string;
}
