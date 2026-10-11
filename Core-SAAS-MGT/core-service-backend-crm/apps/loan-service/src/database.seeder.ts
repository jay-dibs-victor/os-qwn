import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanProduct } from './entities/loan-product.entity';
import { LoanApplication, LoanApplicationStatus, InterestMethod, RepaymentFrequency } from './entities/loan-application.entity';
import { LoanAccount, LoanAccountStatus, DpdBucket } from './entities/loan-account.entity';
import { RepaymentSchedule, RepaymentStatus } from './entities/repayment-schedule.entity';

const TENANTS = ['root-admin', 'tenant-001', 'tenant-002', 'acme-corp'];

const DRIVER_IDS_BY_TENANT: Record<string, string[]> = {
  'root-admin': Array.from({ length: 10 }, (_, i) => String(1000000001 + i)),
  'tenant-001': Array.from({ length: 10 }, (_, i) => String(1000000026 + i)),
  'tenant-002': Array.from({ length: 10 }, (_, i) => String(1000000051 + i)),
  'acme-corp':  Array.from({ length: 10 }, (_, i) => String(1000000076 + i)),
};

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(LoanProduct)
    private readonly loanProductRepository: Repository<LoanProduct>,
    @InjectRepository(LoanApplication)
    private readonly loanApplicationRepository: Repository<LoanApplication>,
    @InjectRepository(LoanAccount)
    private readonly loanAccountRepository: Repository<LoanAccount>,
    @InjectRepository(RepaymentSchedule)
    private readonly repaymentScheduleRepository: Repository<RepaymentSchedule>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding loan data...');
    try {
      await this.repaymentScheduleRepository.query('TRUNCATE TABLE repayment_schedules CASCADE');
      await this.loanAccountRepository.query('TRUNCATE TABLE loan_accounts CASCADE');
      await this.loanApplicationRepository.query('TRUNCATE TABLE loan_applications CASCADE');
      await this.loanProductRepository.query('TRUNCATE TABLE loan_products CASCADE');

      const products = await this.seedProducts();
      await this.seedApplications(products);
      this.logger.log('Loan seeding completed successfully');
    } catch (error) {
      this.logger.error('Loan seeding failed:', error);
      this.logger.warn('Service will continue despite seeding failure');
    }
  }

  private async seedProducts(): Promise<LoanProduct[]> {
    const productDefs = [
      { name: 'Standard Loan', code: 'STD-LOAN', defaultInterestMethod: InterestMethod.REDUCING_BALANCE, defaultRepaymentFrequency: RepaymentFrequency.MONTHLY },
      { name: 'Quick Loan', code: 'QUICK-LOAN', defaultInterestMethod: InterestMethod.FLAT_RATE, defaultRepaymentFrequency: RepaymentFrequency.WEEKLY },
      { name: 'Vehicle Finance', code: 'VEHICLE-FIN', defaultInterestMethod: InterestMethod.REDUCING_BALANCE, defaultRepaymentFrequency: RepaymentFrequency.MONTHLY },
    ];

    const products: LoanProduct[] = [];
    for (const tenantId of TENANTS) {
      for (const def of productDefs) {
        const existing = await this.loanProductRepository.findOne({ where: { code: def.code, tenantId } });
        if (existing) {
          products.push(existing);
          continue;
        }
        const product = this.loanProductRepository.create({
          ...def,
          tenantId,
          isActive: true,
        });
        const saved = await this.loanProductRepository.save(product);
        products.push(saved);
      }
    }
    this.logger.log(`  ✓ Seeded ${productDefs.length} loan products for ${TENANTS.length} tenants`);
    return products;
  }

  private async seedApplications(products: LoanProduct[]): Promise<void> {
    const principals = [50000, 100000, 150000, 200000, 300000, 500000];
    const statuses = [LoanApplicationStatus.DISBURSED, LoanApplicationStatus.DISBURSED, LoanApplicationStatus.APPROVED, LoanApplicationStatus.APPLIED];
    const annualRates = [0.15, 0.18, 0.20, 0.22, 0.25];

    for (const [tenantId, driverIds] of Object.entries(DRIVER_IDS_BY_TENANT)) {
      const tenantProducts = products.filter(p => p.tenantId === tenantId);

      for (let i = 0; i < driverIds.length; i++) {
        const driverId = driverIds[i];
        const product = tenantProducts[i % tenantProducts.length];
        const status = statuses[i % statuses.length];
        const principal = principals[i % principals.length];
        const annualRate = annualRates[i % annualRates.length];
        const termMonths = [3, 6, 12][i % 3];

        const app = this.loanApplicationRepository.create({
          customerId: driverId,
          productId: product.id,
          principal,
          annualInterestRate: annualRate,
          termMonths,
          currency: 'NGN',
          interestMethod: product.defaultInterestMethod,
          repaymentFrequency: product.defaultRepaymentFrequency,
          status,
          tenantId,
          approvedBy: status !== LoanApplicationStatus.APPLIED ? 'seeder@queensos.com' : undefined,
        });
        const savedApp = await this.loanApplicationRepository.save(app);

        if (status === LoanApplicationStatus.DISBURSED) {
          const accountNumber = `LOAN-${driverId}-${i}`;
          const outstandingPrincipal = principal * (0.3 + Math.random() * 0.7);
          const totalRepaid = principal - outstandingPrincipal;

          const account = this.loanAccountRepository.create({
            customerId: driverId,
            accountNumber,
            productId: product.id,
            principal,
            outstandingPrincipal,
            accruedInterest: Math.round(principal * annualRate / 12 * 10) / 10,
            totalRepaid: Math.round(totalRepaid * 100) / 100,
            provisionAmount: 0,
            provisionRate: 0,
            currency: 'NGN',
            status: LoanAccountStatus.ACTIVE,
            dpdBucket: DpdBucket.CURRENT,
            daysPastDue: 0,
            disbursedAt: new Date(Date.now() - (30 + i * 15) * 86400000),
            tenantId,
            application: savedApp,
          });
          const savedAccount = await this.loanAccountRepository.save(account);

          const monthlyPrincipal = principal / termMonths;
          const monthlyInterest = principal * annualRate / 12;
          const monthlyTotal = monthlyPrincipal + monthlyInterest;
          const paidMonths = Math.floor(totalRepaid / monthlyTotal);

          for (let m = 0; m < termMonths; m++) {
            const dueDate = new Date(savedAccount.disbursedAt!);
            dueDate.setMonth(dueDate.getMonth() + m + 1);

            let rStatus = RepaymentStatus.DUE;
            let amountPaid = 0;
            if (m < paidMonths) {
              rStatus = RepaymentStatus.PAID;
              amountPaid = monthlyTotal;
            } else if (m === paidMonths && totalRepaid > paidMonths * monthlyTotal) {
              rStatus = RepaymentStatus.PARTIALLY_PAID;
              amountPaid = totalRepaid - paidMonths * monthlyTotal;
            }

            const schedule = this.repaymentScheduleRepository.create({
              installmentNumber: m + 1,
              dueDate,
              principalDue: Math.round(monthlyPrincipal * 100) / 100,
              interestDue: Math.round(monthlyInterest * 100) / 100,
              totalDue: Math.round(monthlyTotal * 100) / 100,
              amountPaid: Math.round(amountPaid * 100) / 100,
              status: rStatus,
              loanAccount: savedAccount,
              tenantId,
            });
            await this.repaymentScheduleRepository.save(schedule);
          }
        }
      }
      this.logger.log(`  ✓ Seeded loan applications for ${tenantId} drivers`);
    }
  }
}
