import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  DpdBucket,
  LoanAccount,
  LoanAccountStatus,
} from './entities/loan-account.entity';
import {
  InterestMethod,
  LoanApplication,
  LoanApplicationStatus,
  RepaymentFrequency,
} from './entities/loan-application.entity';
import { LoanProduct } from './entities/loan-product.entity';
import { LoanProvision } from './entities/loan-provision.entity';
import {
  RepaymentSchedule,
  RepaymentStatus,
} from './entities/repayment-schedule.entity';
import { LoanCalculationService } from './loan-calculation.service';
import { LoanEventsPublisher } from './loan-events.publisher';
import { LoanLedgerService } from './loan-ledger.service';
import { LoanProvisioningService } from './loan-provisioning.service';
import { LoanServiceService } from './loan-service.service';

describe('LoanServiceService', () => {
  let service: LoanServiceService;
  let application: LoanApplication;
  let account: LoanAccount;
  let product: LoanProduct;
  let provision: LoanProvision;
  let schedules: RepaymentSchedule[];

  const applicationRepo = {
    create: jest.fn((dto) => ({
      id: 'app-1',
      customerId: 'customer-1',
      status: LoanApplicationStatus.APPLIED,
      ...dto,
    })),
    save: jest.fn((entity) => entity),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const accountRepo = {
    create: jest.fn((dto) => ({
      id: 'loan-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...dto,
    })),
    save: jest.fn((entity) => entity),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const scheduleRepo = {
    create: jest.fn((dto) => ({
      id: `sch-${dto.installmentNumber}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...dto,
    })),
    save: jest.fn((entity) => {
      if (Array.isArray(entity)) {
        schedules = entity;
        return entity;
      }
      return entity;
    }),
  };
  const productRepo = {
    create: jest.fn((dto) => ({
      id: 'prod-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...dto,
    })),
    save: jest.fn((entity) => entity),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const provisionRepo = {
    find: jest.fn(),
  };
  const eventsPublisher = {
    publishDisbursed: jest.fn(),
    publishRepaymentReceived: jest.fn(),
    publishDelinquencyUpdated: jest.fn(),
    publishProvisioned: jest.fn(),
  };
  const loanLedgerService = {
    postDisbursement: jest.fn(() => 'ledger-disb-1'),
    postRepayment: jest.fn(),
  };
  const loanProvisioningService = {
    provision: jest.fn(),
  };

  beforeEach(async () => {
    application = {
      id: 'app-1',
      customerId: 'customer-1',
      productId: 'prod-1',
      principal: 120000,
      annualInterestRate: 12,
      termMonths: 12,
      currency: 'NGN',
      interestMethod: InterestMethod.REDUCING_BALANCE,
      repaymentFrequency: RepaymentFrequency.MONTHLY,
      status: LoanApplicationStatus.APPLIED,
      tenantId: 'tenant-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    schedules = [];
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
    account = {
      id: 'loan-1',
      customerId: 'customer-1',
      accountNumber: 'LN-1',
      productId: 'prod-1',
      principal: 120000,
      outstandingPrincipal: 120000,
      accruedInterest: 0,
      totalRepaid: 0,
      provisionAmount: 0,
      provisionRate: 0,
      currency: 'NGN',
      status: LoanAccountStatus.ACTIVE,
      dpdBucket: DpdBucket.CURRENT,
      daysPastDue: 0,
      disbursedAt: new Date(),
      loanReceivableGlAccountId: 'gl-loan-receivable',
      customerDepositGlAccountId: 'gl-customer-deposit',
      provisionExpenseGlAccountId: 'gl-provision-expense',
      loanLossReserveGlAccountId: 'gl-loan-loss-reserve',
      tenantId: 'tenant-1',
      application,
      schedules,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    provision = {
      id: 'prov-1',
      loanAccountId: 'loan-1',
      loanAccount: account,
      outstandingPrincipal: 120000,
      provisionRate: 0.01,
      provisionAmount: 1200,
      dpdBucket: DpdBucket.CURRENT,
      daysPastDue: account.daysPastDue,
      reason: 'TEST_PROVISION',
      tenantId: 'tenant-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    applicationRepo.findOne.mockResolvedValue(application);
    accountRepo.findOne.mockResolvedValue(account);
    productRepo.findOne.mockResolvedValue(product);
    loanProvisioningService.provision.mockResolvedValue(provision);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanServiceService,
        LoanCalculationService,
        {
          provide: getRepositoryToken(LoanApplication),
          useValue: applicationRepo,
        },
        {
          provide: getRepositoryToken(LoanAccount),
          useValue: accountRepo,
        },
        {
          provide: getRepositoryToken(RepaymentSchedule),
          useValue: scheduleRepo,
        },
        {
          provide: getRepositoryToken(LoanProduct),
          useValue: productRepo,
        },
        {
          provide: getRepositoryToken(LoanProvision),
          useValue: provisionRepo,
        },
        {
          provide: LoanEventsPublisher,
          useValue: eventsPublisher,
        },
        {
          provide: LoanLedgerService,
          useValue: loanLedgerService,
        },
        {
          provide: LoanProvisioningService,
          useValue: loanProvisioningService,
        },
      ],
    }).compile();

    service = module.get<LoanServiceService>(LoanServiceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates and approves a loan application', async () => {
    const created = await service.apply({
      customerId: 'customer-1',
      productId: 'prod-1',
      principal: 120000,
      annualInterestRate: 12,
      termMonths: 12,
      tenantId: 'tenant-1',
    });
    const approved = await service.approve('app-1', {
      approvedBy: 'manager-1',
    });

    expect(created.status).toBe(LoanApplicationStatus.APPLIED);
    expect(approved.status).toBe(LoanApplicationStatus.APPROVED);
    expect(approved.approvedBy).toBe('manager-1');
  });

  it('prevents disbursing unapproved applications', async () => {
    await expect(service.disburse('app-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('disburses approved applications and builds schedules', async () => {
    application.status = LoanApplicationStatus.APPROVED;

    const disbursed = await service.disburse('app-1');

    expect(disbursed.outstandingPrincipal).toBe(120000);
    expect(disbursed.schedules).toHaveLength(12);
    expect(disbursed.disbursementLedgerTransactionId).toBe('ledger-disb-1');
    expect(loanProvisioningService.provision).toHaveBeenCalledWith(
      disbursed,
      product,
      'INITIAL_PERFORMING_PROVISION',
    );
    expect(eventsPublisher.publishProvisioned).toHaveBeenCalledWith(provision);
    expect(eventsPublisher.publishDisbursed).toHaveBeenCalledWith(disbursed);
  });

  it('accrues daily interest', async () => {
    const saved = await service.accrueInterest('loan-1', 30);

    expect(saved.accruedInterest).toBeGreaterThan(0);
  });

  it('applies partial repayment to schedules and account balance', async () => {
    account.schedules = [
      {
        id: 'sch-1',
        installmentNumber: 1,
        dueDate: new Date(Date.now() + 86400000),
        principalDue: 10000,
        interestDue: 1200,
        totalDue: 11200,
        amountPaid: 0,
        status: RepaymentStatus.DUE,
        tenantId: 'tenant-1',
        loanAccount: account,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const saved = await service.repay('loan-1', {
      amount: 5000,
      tenantId: 'tenant-1',
    });

    expect(saved.outstandingPrincipal).toBe(115000);
    expect(account.schedules[0].status).toBe(RepaymentStatus.PARTIALLY_PAID);
    expect(eventsPublisher.publishRepaymentReceived).toHaveBeenCalledWith(
      saved,
      5000,
    );
  });

  it('classifies delinquency into DPD buckets', async () => {
    account.schedules = [
      {
        id: 'sch-1',
        installmentNumber: 1,
        dueDate: new Date(Date.now() - 40 * 86400000),
        principalDue: 10000,
        interestDue: 1200,
        totalDue: 11200,
        amountPaid: 0,
        status: RepaymentStatus.DUE,
        tenantId: 'tenant-1',
        loanAccount: account,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const saved = await service.classifyDelinquency('loan-1');

    expect(saved.daysPastDue).toBeGreaterThanOrEqual(39);
    expect(saved.status).toBe(LoanAccountStatus.DELINQUENT);
    expect(eventsPublisher.publishDelinquencyUpdated).toHaveBeenCalledWith(
      saved,
    );
    expect(eventsPublisher.publishProvisioned).toHaveBeenCalled();
  });

  it('creates loan products with GL provisioning mappings', async () => {
    const saved = await service.createProduct({
      name: 'Driver Asset Loan',
      code: 'DRV-ASSET',
      loanReceivableGlAccountId: 'gl-loan-receivable',
      customerDepositGlAccountId: 'gl-customer-deposit',
      provisionExpenseGlAccountId: 'gl-provision-expense',
      loanLossReserveGlAccountId: 'gl-loan-loss-reserve',
      tenantId: 'tenant-1',
    });

    expect(saved.isActive).toBe(true);
    expect(saved.performingProvisionRate).toBe(0.01);
  });

  it('allows explicit provision recalculation', async () => {
    const saved = await service.provisionLoan('loan-1', {
      tenantId: 'tenant-1',
      reason: 'NPL_REVIEW',
    });

    expect(saved).toBe(provision);
    expect(loanProvisioningService.provision).toHaveBeenCalledWith(
      account,
      product,
      'NPL_REVIEW',
    );
    expect(eventsPublisher.publishProvisioned).toHaveBeenCalledWith(provision);
  });
});
