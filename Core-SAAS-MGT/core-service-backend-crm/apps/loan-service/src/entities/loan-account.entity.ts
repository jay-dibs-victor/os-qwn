import { AbstractEntity } from '@app/common';
import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { LoanApplication } from './loan-application.entity';
import { RepaymentSchedule } from './repayment-schedule.entity';

export enum LoanAccountStatus {
  ACTIVE = 'ACTIVE',
  DELINQUENT = 'DELINQUENT',
  CLOSED = 'CLOSED',
  WRITTEN_OFF = 'WRITTEN_OFF',
}

export enum DpdBucket {
  CURRENT = 'CURRENT',
  DPD_1_30 = 'DPD_1_30',
  DPD_31_60 = 'DPD_31_60',
  DPD_61_90 = 'DPD_61_90',
  DPD_90_PLUS = 'DPD_90_PLUS',
}

@Entity('loan_accounts')
export class LoanAccount extends AbstractEntity {
  @Column()
  customerId: string;

  @Column()
  accountNumber: string;

  @Column()
  productId: string;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  principal: number;

  @Column({ type: 'decimal', precision: 20, scale: 4, default: 0 })
  outstandingPrincipal: number;

  @Column({ type: 'decimal', precision: 20, scale: 4, default: 0 })
  accruedInterest: number;

  @Column({ type: 'decimal', precision: 20, scale: 4, default: 0 })
  totalRepaid: number;

  @Column({ type: 'decimal', precision: 20, scale: 4, default: 0 })
  provisionAmount: number;

  @Column({ type: 'float', default: 0 })
  provisionRate: number;

  @Column({ default: 'NGN' })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: LoanAccountStatus.ACTIVE })
  status: LoanAccountStatus;

  @Column({ type: 'varchar', length: 20, default: DpdBucket.CURRENT })
  dpdBucket: DpdBucket;

  @Column({ default: 0 })
  daysPastDue: number;

  @Column({ type: 'timestamptz', nullable: true })
  disbursedAt?: Date;

  @Column({ nullable: true })
  loanReceivableGlAccountId?: string;

  @Column({ nullable: true })
  customerDepositGlAccountId?: string;

  @Column({ nullable: true })
  provisionExpenseGlAccountId?: string;

  @Column({ nullable: true })
  loanLossReserveGlAccountId?: string;

  @Column()
  tenantId: string;

  @Column({ nullable: true })
  disbursementLedgerTransactionId?: string;

  @ManyToOne(() => LoanApplication)
  @JoinColumn({ name: 'applicationId' })
  application: LoanApplication;

  @OneToMany(() => RepaymentSchedule, (s) => s.loanAccount, { cascade: true })
  schedules: RepaymentSchedule[];
}
