import { Injectable } from '@nestjs/common';
import { LoanAccount } from './entities/loan-account.entity';
import { LoanProduct } from './entities/loan-product.entity';

@Injectable()
export class LoanLedgerService {
  async postDisbursement(
    account: LoanAccount,
    product: LoanProduct,
  ): Promise<string> {
    // TODO: post double-entry ledger transaction for loan disbursement
    return `ledger-disb-${account.id}`;
  }

  async postRepayment(
    account: LoanAccount,
    amount: number,
  ): Promise<string> {
    // TODO: post double-entry ledger transaction for repayment
    return `ledger-repay-${account.id}-${Date.now()}`;
  }

  async postProvision(
    account: LoanAccount,
    product: LoanProduct,
    provisionAmount: number,
  ): Promise<string> {
    // TODO: post double-entry ledger transaction for loan loss provision
    return `ledger-prov-${account.id}`;
  }
}
