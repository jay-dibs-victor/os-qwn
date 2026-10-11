import { AbstractEntity } from '@app/common';
import { Column, Entity, Unique } from 'typeorm';
import { InterestMethod, RepaymentFrequency } from './loan-application.entity';

@Entity('loan_products')
@Unique(['code', 'tenantId'])
export class LoanProduct extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ type: 'varchar', length: 30, default: InterestMethod.REDUCING_BALANCE })
  defaultInterestMethod: InterestMethod;

  @Column({ type: 'varchar', length: 20, default: RepaymentFrequency.MONTHLY })
  defaultRepaymentFrequency: RepaymentFrequency;

  @Column({ type: 'float', default: 0.01 })
  performingProvisionRate: number;

  @Column({ type: 'float', default: 0.05 })
  dpd1ProvisionRate: number;

  @Column({ type: 'float', default: 0.2 })
  dpd31ProvisionRate: number;

  @Column({ type: 'float', default: 0.5 })
  dpd61ProvisionRate: number;

  @Column({ type: 'float', default: 1 })
  dpd90ProvisionRate: number;

  @Column({ nullable: true })
  loanReceivableGlAccountId?: string;

  @Column({ nullable: true })
  customerDepositGlAccountId?: string;

  @Column({ nullable: true })
  provisionExpenseGlAccountId?: string;

  @Column({ nullable: true })
  loanLossReserveGlAccountId?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  tenantId: string;
}
