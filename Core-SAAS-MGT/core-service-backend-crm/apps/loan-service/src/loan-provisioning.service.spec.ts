import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  DpdBucket,
  LoanAccount,
  LoanAccountStatus,
} from './entities/loan-account.entity';
import {
  InterestMethod,
  RepaymentFrequency,
} from './entities/loan-application.entity';
import { LoanProduct } from './entities/loan-product.entity';
import { LoanProvision } from './entities/loan-provision.entity';
import { LoanCalculationService } from './loan-calculation.service';
import { LoanLedgerService } from './loan-ledger.service';
import { LoanProvisioningService } from './loan-provisioning.service';

describe('LoanProvisioningService', () => {
  let service: LoanProvisioningService;
  let account: LoanAccount;
  let product: LoanProduct;

  const provisionRepo = {
    create: jest.fn((dto) => ({
      id: 'prov-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...dto,
    })),
    save: jest.fn((entity) => entity),
  };
  const loanLedgerService = {
    postProvision: jest.fn(() => 'ledger-prov-1'),
  };

  beforeEach(async () => {
    account = {
      id: 'loan-1',
      customerId: 'customer-1',
      accountNumber: 'LN-1',
      productId: 'prod-1',
      principal: 100000,
      outstandingPrincipal: 100000,
      accruedInterest: 0,
      totalRepaid: 0,
      provisionAmount: 0,
      provisionRate: 0,
      currency: 'NGN',
      status: LoanAccountStatus.ACTIVE,
      dpdBucket: DpdBucket.DPD_31_60,
      daysPastDue: 45,
      disbursedAt: new Date(),
      loanReceivableGlAccountId: 'gl-loan-receivable',
      customerDepositGlAccountId: 'gl-customer-deposit',
      provisionExpenseGlAccountId: 'gl-provision-expense',
      loanLossReserveGlAccountId: 'gl-loan-loss-reserve',
      tenantId: 'tenant-1',
      application: undefined as any,
      schedules: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    product = {
      id: 'prod-1',
      name: 'Driver Asset Loan',
      code: 'DRV-ASSET',
      defaultInterestMethod: InterestMethod.REDUCING_BALANCE,
      defaultRepaymentFrequency: RepaymentFrequency.MONTHLY,
      performingProvisionRate: 0.01,
      dpd1ProvisionRate: 0.05,
      dpd31ProvisionRate: 0.2,
      dpd61ProvisionRate: 0.5,
      dpd90ProvisionRate: 1,
      loanReceivableGlAccountId: 'gl-loan-receivable',
      customerDepositGlAccountId: 'gl-customer-deposit',
      provisionExpenseGlAccountId: 'gl-provision-expense',
      loanLossReserveGlAccountId: 'gl-loan-loss-reserve',
      isActive: true,
      tenantId: 'tenant-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanProvisioningService,
        LoanCalculationService,
        {
          provide: getRepositoryToken(LoanProvision),
          useValue: provisionRepo,
        },
        {
          provide: LoanLedgerService,
          useValue: loanLedgerService,
        },
      ],
    }).compile();

    service = module.get<LoanProvisioningService>(LoanProvisioningService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calculates expected credit loss by DPD bucket and posts reserve GL entries', async () => {
    const provision = await service.provision(
      account,
      product,
      'DPD_RECLASSIFICATION_DPD_31_60',
    );

    expect(provision.provisionRate).toBe(0.2);
    expect(provision.provisionAmount).toBe(20000);
    expect(provision.ledgerTransactionId).toBe('ledger-prov-1');
    expect(account.provisionRate).toBe(0.2);
    expect(account.provisionAmount).toBe(20000);
    expect(loanLedgerService.postProvision).toHaveBeenCalledWith(
      account,
      product,
      20000,
    );
  });

  it('uses full provisioning for 90+ DPD loans', () => {
    expect(service.resolveProvisionRate(DpdBucket.DPD_90_PLUS, product)).toBe(
      1,
    );
  });
});
