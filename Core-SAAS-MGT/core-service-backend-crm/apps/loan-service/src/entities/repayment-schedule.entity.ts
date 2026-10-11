import { AbstractEntity } from '@app/common';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { LoanAccount } from './loan-account.entity';

export enum RepaymentStatus {
  DUE = 'DUE',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

@Entity('repayment_schedules')
export class RepaymentSchedule extends AbstractEntity {
  @Column()
  installmentNumber: number;

  @Column({ type: 'timestamptz' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  principalDue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  interestDue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalDue: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'varchar', length: 20, default: RepaymentStatus.DUE })
  status: RepaymentStatus;

  @ManyToOne(() => LoanAccount, (a) => a.schedules)
  @JoinColumn({ name: 'loanAccountId' })
  loanAccount: LoanAccount;

  @Column()
  tenantId: string;
}
