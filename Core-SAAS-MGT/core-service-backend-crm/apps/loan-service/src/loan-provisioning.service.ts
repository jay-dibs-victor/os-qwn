import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DpdBucket, LoanAccount } from './entities/loan-account.entity';
import { LoanProduct } from './entities/loan-product.entity';
import { LoanProvision } from './entities/loan-provision.entity';
import { LoanCalculationService } from './loan-calculation.service';
import { LoanLedgerService } from './loan-ledger.service';

@Injectable()
export class LoanProvisioningService {
  constructor(
    @InjectRepository(LoanProvision)
    private readonly provisionRepo: Repository<LoanProvision>,
    private readonly calculationService: LoanCalculationService,
    private readonly loanLedgerService: LoanLedgerService,
  ) {}

  async provision(
    account: LoanAccount,
    product: LoanProduct,
    reason: string,
  ): Promise<LoanProvision> {
    const rate = this.resolveProvisionRate(account.dpdBucket, product);
    const amount = Math.round(account.outstandingPrincipal * rate * 100) / 100;
    const ledgerTransactionId = await this.loanLedgerService.postProvision(
      account,
      product,
      amount,
    );

    const provision = this.provisionRepo.create({
      loanAccountId: account.id,
      outstandingPrincipal: account.outstandingPrincipal,
      provisionRate: rate,
      provisionAmount: amount,
      dpdBucket: account.dpdBucket,
      daysPastDue: account.daysPastDue,
      reason,
      ledgerTransactionId,
      tenantId: account.tenantId,
    });

    account.provisionRate = rate;
    account.provisionAmount = amount;

    return this.provisionRepo.save(provision);
  }

  resolveProvisionRate(bucket: DpdBucket, product: LoanProduct): number {
    switch (bucket) {
      case DpdBucket.CURRENT:
        return product.performingProvisionRate;
      case DpdBucket.DPD_1_30:
        return product.dpd1ProvisionRate;
      case DpdBucket.DPD_31_60:
        return product.dpd31ProvisionRate;
      case DpdBucket.DPD_61_90:
        return product.dpd61ProvisionRate;
      case DpdBucket.DPD_90_PLUS:
        return product.dpd90ProvisionRate;
    }
  }
}
