import { Injectable } from '@nestjs/common';
import { LoanAccount } from './entities/loan-account.entity';
import { LoanProvision } from './entities/loan-provision.entity';

@Injectable()
export class LoanEventsPublisher {
  async publishDisbursed(account: LoanAccount): Promise<void> {
    // TODO: emit event to message queue
  }

  async publishRepaymentReceived(account: LoanAccount, amount: number): Promise<void> {
    // TODO: emit event to message queue
  }

  async publishDelinquencyUpdated(account: LoanAccount): Promise<void> {
    // TODO: emit event to message queue
  }

  async publishProvisioned(provision: LoanProvision): Promise<void> {
    // TODO: emit event to message queue
  }
}
