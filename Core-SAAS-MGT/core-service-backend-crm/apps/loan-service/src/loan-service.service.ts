import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  LoanApplication,
  LoanApplicationStatus,
  InterestMethod,
  RepaymentFrequency,
} from './entities/loan-application.entity';
import {
  LoanAccount,
  LoanAccountStatus,
  DpdBucket,
} from './entities/loan-account.entity';
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

@Injectable()
export class LoanServiceService {
  constructor(
    @InjectRepository(LoanApplication)
    private readonly applicationRepo: Repository<LoanApplication>,
    @InjectRepository(LoanAccount)
    private readonly accountRepo: Repository<LoanAccount>,
    @InjectRepository(RepaymentSchedule)
    private readonly scheduleRepo: Repository<RepaymentSchedule>,
    @InjectRepository(LoanProduct)
    private readonly productRepo: Repository<LoanProduct>,
    @InjectRepository(LoanProvision)
    private readonly provisionRepo: Repository<LoanProvision>,
    private readonly calculationService: LoanCalculationService,
    private readonly eventsPublisher: LoanEventsPublisher,
    private readonly loanLedgerService: LoanLedgerService,
    private readonly loanProvisioningService: LoanProvisioningService,
  ) {}

  async apply(dto: {
    customerId: string;
    productId: string;
    principal: number;
    annualInterestRate: number;
    termMonths: number;
    tenantId: string;
  }): Promise<LoanApplication> {
    const application = this.applicationRepo.create({
      customerId: dto.customerId,
      productId: dto.productId,
      principal: dto.principal,
      annualInterestRate: dto.annualInterestRate,
      termMonths: dto.termMonths,
      tenantId: dto.tenantId,
    });
    return this.applicationRepo.save(application);
  }

  async approve(
    appId: string,
    dto: { approvedBy: string },
  ): Promise<LoanApplication> {
    const app = await this.applicationRepo.findOne({ where: { id: appId } });
    if (!app) throw new BadRequestException('Application not found');

    app.status = LoanApplicationStatus.APPROVED;
    app.approvedBy = dto.approvedBy;
    return this.applicationRepo.save(app);
  }

  async disburse(appId: string): Promise<LoanAccount> {
    const app = await this.applicationRepo.findOne({ where: { id: appId } });
    if (!app) throw new BadRequestException('Application not found');
    if (app.status !== LoanApplicationStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot disburse unapproved application',
      );
    }

    const product = await this.productRepo.findOne({
      where: { id: app.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Loan product ${app.productId} not found`,
      );
    }

    const account = this.accountRepo.create({
      customerId: app.customerId,
      accountNumber: `LN-${uuidv4().slice(0, 8).toUpperCase()}`,
      productId: app.productId,
      principal: app.principal,
      outstandingPrincipal: app.principal,
      currency: app.currency,
      status: LoanAccountStatus.ACTIVE,
      dpdBucket: DpdBucket.CURRENT,
      daysPastDue: 0,
      disbursedAt: new Date(),
      loanReceivableGlAccountId: product?.loanReceivableGlAccountId,
      customerDepositGlAccountId: product?.customerDepositGlAccountId,
      provisionExpenseGlAccountId: product?.provisionExpenseGlAccountId,
      loanLossReserveGlAccountId: product?.loanLossReserveGlAccountId,
      tenantId: app.tenantId,
      application: app,
    });

    const schedules = this.calculationService.computeSchedules(
      app.principal,
      app.annualInterestRate,
      app.termMonths,
      app.interestMethod,
      app.repaymentFrequency,
      account,
      app.tenantId,
    );

    account.schedules = schedules;
    const disbursementTxId = await this.loanLedgerService.postDisbursement(
      account,
      product,
    );
    account.disbursementLedgerTransactionId = disbursementTxId;

    const saved = await this.accountRepo.save(account);
    app.status = LoanApplicationStatus.DISBURSED;
    await this.applicationRepo.save(app);

    if (product) {
      const provision = await this.loanProvisioningService.provision(
        saved,
        product,
        'INITIAL_PERFORMING_PROVISION',
      );
      await this.eventsPublisher.publishProvisioned(provision);
    }

    await this.eventsPublisher.publishDisbursed(saved);
    return saved;
  }

  async accrueInterest(
    loanId: string,
    days: number,
  ): Promise<LoanAccount> {
    const account = await this.accountRepo.findOne({
      where: { id: loanId },
      relations: ['application'],
    });
    if (!account) throw new BadRequestException('Loan account not found');

    const annualRate =
      (account.application as LoanApplication)?.annualInterestRate ?? 12;
    const interest = this.calculationService.accrueInterest(
      account,
      days,
      annualRate,
    );
    account.accruedInterest += interest;
    return this.accountRepo.save(account);
  }

  async repay(
    loanId: string,
    dto: { amount: number; tenantId: string },
  ): Promise<LoanAccount> {
    const account = await this.accountRepo.findOne({
      where: { id: loanId },
      relations: ['schedules'],
    });
    if (!account) throw new BadRequestException('Loan account not found');

    let remaining = dto.amount;

    for (const schedule of account.schedules) {
      if (remaining <= 0) break;
      if (schedule.status === RepaymentStatus.PAID) continue;

      const due = schedule.totalDue - schedule.amountPaid;
      const paid = Math.min(due, remaining);
      schedule.amountPaid += paid;
      remaining -= paid;

      if (schedule.amountPaid >= schedule.totalDue) {
        schedule.status = RepaymentStatus.PAID;
      } else {
        schedule.status = RepaymentStatus.PARTIALLY_PAID;
      }
    }

    const totalRepaid = dto.amount - remaining;
    account.outstandingPrincipal -= totalRepaid;
    account.totalRepaid += totalRepaid;

    await this.loanLedgerService.postRepayment(account, totalRepaid);

    const saved = await this.accountRepo.save(account);
    await this.eventsPublisher.publishRepaymentReceived(saved, totalRepaid);
    return saved;
  }

  async classifyDelinquency(loanId: string): Promise<LoanAccount> {
    const account = await this.accountRepo.findOne({
      where: { id: loanId },
      relations: ['schedules', 'application'],
    });
    if (!account) throw new BadRequestException('Loan account not found');

    const now = new Date();
    let maxDaysPastDue = 0;

    for (const schedule of account.schedules) {
      if (
        schedule.status === RepaymentStatus.DUE ||
        schedule.status === RepaymentStatus.PARTIALLY_PAID
      ) {
        const daysPastDue = Math.floor(
          (now.getTime() - schedule.dueDate.getTime()) / (86400000),
        );
        if (daysPastDue > maxDaysPastDue) {
          maxDaysPastDue = daysPastDue;
        }
      }
    }

    account.daysPastDue = maxDaysPastDue;
    account.dpdBucket = this.calculationService.computeDpdBucket(
      maxDaysPastDue,
    ) as DpdBucket;

    if (maxDaysPastDue > 0) {
      account.status = LoanAccountStatus.DELINQUENT;
    }

    const saved = await this.accountRepo.save(account);

    const product = await this.productRepo.findOne({
      where: { id: account.productId },
    });

    if (product) {
      const provision = await this.loanProvisioningService.provision(
        saved,
        product,
        `DPD_RECLASSIFICATION_${account.dpdBucket}`,
      );
      await this.eventsPublisher.publishProvisioned(provision);
    }

    await this.eventsPublisher.publishDelinquencyUpdated(saved);
    return saved;
  }

  async createProduct(dto: {
    name: string;
    code: string;
    defaultInterestMethod?: InterestMethod;
    defaultRepaymentFrequency?: RepaymentFrequency;
    performingProvisionRate?: number;
    dpd1ProvisionRate?: number;
    dpd31ProvisionRate?: number;
    dpd61ProvisionRate?: number;
    dpd90ProvisionRate?: number;
    loanReceivableGlAccountId?: string;
    customerDepositGlAccountId?: string;
    provisionExpenseGlAccountId?: string;
    loanLossReserveGlAccountId?: string;
    tenantId: string;
  }): Promise<LoanProduct> {
    const product = this.productRepo.create({
      name: dto.name,
      code: dto.code,
      defaultInterestMethod:
        dto.defaultInterestMethod ?? InterestMethod.REDUCING_BALANCE,
      defaultRepaymentFrequency:
        dto.defaultRepaymentFrequency ?? RepaymentFrequency.MONTHLY,
      performingProvisionRate: dto.performingProvisionRate ?? 0.01,
      dpd1ProvisionRate: dto.dpd1ProvisionRate ?? 0.05,
      dpd31ProvisionRate: dto.dpd31ProvisionRate ?? 0.2,
      dpd61ProvisionRate: dto.dpd61ProvisionRate ?? 0.5,
      dpd90ProvisionRate: dto.dpd90ProvisionRate ?? 1,
      loanReceivableGlAccountId: dto.loanReceivableGlAccountId,
      customerDepositGlAccountId: dto.customerDepositGlAccountId,
      provisionExpenseGlAccountId: dto.provisionExpenseGlAccountId,
      loanLossReserveGlAccountId: dto.loanLossReserveGlAccountId,
      isActive: true,
      tenantId: dto.tenantId,
    });
    return this.productRepo.save(product);
  }

  async provisionLoan(
    loanId: string,
    dto: { tenantId: string; reason: string },
  ): Promise<LoanProvision> {
    const account = await this.accountRepo.findOne({
      where: { id: loanId },
    });
    if (!account) throw new BadRequestException('Loan account not found');

    const product = await this.productRepo.findOne({
      where: { id: account.productId },
    });
    if (!product) throw new BadRequestException('Product not found');

    const provision = await this.loanProvisioningService.provision(
      account,
      product,
      dto.reason,
    );

    await this.accountRepo.save(account);
    await this.eventsPublisher.publishProvisioned(provision);
    return provision;
  }
}
