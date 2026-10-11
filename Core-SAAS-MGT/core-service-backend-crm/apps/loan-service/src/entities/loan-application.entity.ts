import { AbstractEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

export enum InterestMethod {
  REDUCING_BALANCE = 'REDUCING_BALANCE',
  FLAT_RATE = 'FLAT_RATE',
}

export enum RepaymentFrequency {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY',
}

export enum LoanApplicationStatus {
  APPLIED = 'APPLIED',
  APPROVED = 'APPROVED',
  DISBURSED = 'DISBURSED',
  REJECTED = 'REJECTED',
}

@Entity('loan_applications')
export class LoanApplication extends AbstractEntity {
  @Column()
  customerId: string;

  @Column()
  productId: string;

  @Column({ type: 'decimal', precision: 20, scale: 4 })
  principal: number;

  @Column({ type: 'float' })
  annualInterestRate: number;

  @Column({ default: 1 })
  termMonths: number;

  @Column({ default: 'NGN' })
  currency: string;

  @Column({ type: 'varchar', length: 30, default: InterestMethod.REDUCING_BALANCE })
  interestMethod: InterestMethod;

  @Column({ type: 'varchar', length: 20, default: RepaymentFrequency.MONTHLY })
  repaymentFrequency: RepaymentFrequency;

  @Column({ type: 'varchar', length: 20, default: LoanApplicationStatus.APPLIED })
  status: LoanApplicationStatus;

  @Column()
  tenantId: string;

  @Column({ nullable: true })
  approvedBy?: string;
}
