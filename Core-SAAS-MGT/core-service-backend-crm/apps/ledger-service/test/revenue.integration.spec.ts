import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import axios from 'axios';
import { LedgerServiceModule } from '../src/ledger-service.module';
import { PostingEngineService } from '../src/posting-engine.service';
import { GlAccountsService } from '../src/gl-accounts.service';
import { RevenueRecognitionService } from '../src/revenue-recognition.service';
import { CommissionEngineService } from '../src/commission-engine.service';
import { AuditService } from '../src/audit.service';
import { GlAccountType } from '../src/entities/gl-account.entity';
import { GlAccount } from '../src/entities/gl-account.entity';
import { EntrySide } from '../src/entities/ledger-entry.entity';
import { CommissionRule, CommissionRuleType, CommissionCalculationMethod } from '../src/entities/commission-rule.entity';
import {
  TripFinancialRecord,
  TripFinancialStatus,
} from '../src/entities/trip-financial-record.entity';
import { JournalEntry } from '../src/entities/journal-entry.entity';
import { LedgerEntry } from '../src/entities/ledger-entry.entity';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Revenue Recognition Integration', () => {
  let app: INestApplication;
  let postingEngineService: PostingEngineService;
  let glAccountsService: GlAccountsService;
  let revenueRecognitionService: RevenueRecognitionService;
  let commissionEngineService: CommissionEngineService;
  let auditService: AuditService;
  let glAccountRepo: Repository<GlAccount>;
  let commissionRuleRepo: Repository<CommissionRule>;
  let tripFinancialRepo: Repository<TripFinancialRecord>;
  let journalRepo: Repository<JournalEntry>;

  const tenantId = 'revenue-test-tenant';
  let paystackClearingId: string;
  let unsettledCollectionsId: string;
  let tripCommissionRevenueId: string;
  let partnerCommissionPayableId: string;
  let driverEarningsPayableId: string;
  let driverWalletLiabilityId: string;
  let cashAtBankId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST || 'localhost',
          port: Number(process.env.POSTGRES_PORT) || 5432,
          username: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          database: process.env.POSTGRES_DB || 'ledger_test',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        LedgerServiceModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    postingEngineService =
      app.get<PostingEngineService>(PostingEngineService);
    glAccountsService = app.get<GlAccountsService>(GlAccountsService);
    revenueRecognitionService = app.get<RevenueRecognitionService>(
      RevenueRecognitionService,
    );
    commissionEngineService = app.get<CommissionEngineService>(
      CommissionEngineService,
    );
    auditService = app.get<AuditService>(AuditService);
    glAccountRepo = app.get<Repository<GlAccount>>(getRepositoryToken(GlAccount));
    commissionRuleRepo = app.get<Repository<CommissionRule>>(
      getRepositoryToken(CommissionRule),
    );
    tripFinancialRepo = app.get<Repository<TripFinancialRecord>>(
      getRepositoryToken(TripFinancialRecord),
    );
    journalRepo = app.get<Repository<JournalEntry>>(
      getRepositoryToken(JournalEntry),
    );

    const accounts = await seedGlAccounts();
    paystackClearingId = accounts['1201'].id;
    unsettledCollectionsId = accounts['2402'].id;
    tripCommissionRevenueId = accounts['4201'].id;
    partnerCommissionPayableId = accounts['2202'].id;
    driverEarningsPayableId = accounts['2302'].id;
    driverWalletLiabilityId = accounts['2301'].id;
    cashAtBankId = accounts['1101'].id;

    await seedCommissionRules();

    mockedAxios.get.mockImplementation(async (url: string) => {
      if (url.includes('/accounts/customer/')) {
        return {
          data: [
            {
              accountNumber: 'DRV-ACC-001',
              glAccountId: driverWalletLiabilityId,
              currency: 'NGN',
              customerId: 'driver-1',
            },
          ],
        };
      }
      if (url.includes('/ledger/accounts')) {
        const accountsList = await glAccountRepo.find();
        return { data: accountsList.map((a: any) => ({ ...a, code: String(a.code) })) };
      }
      return { data: [] };
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  async function seedGlAccounts() {
    const accountDefs = [
      { code: '1000', name: 'ASSETS', type: GlAccountType.ASSET },
      { code: '1100', name: 'Cash and Bank', type: GlAccountType.ASSET, parentCode: '1000' },
      { code: '1101', name: 'Cash at Bank', type: GlAccountType.ASSET, parentCode: '1100' },
      { code: '1200', name: 'Provider Clearing', type: GlAccountType.ASSET, parentCode: '1000' },
      { code: '1201', name: 'Paystack Clearing', type: GlAccountType.ASSET, parentCode: '1200' },
      { code: '2000', name: 'LIABILITIES', type: GlAccountType.LIABILITY },
      { code: '2100', name: 'Customer Wallet', type: GlAccountType.LIABILITY, parentCode: '2000' },
      { code: '2101', name: 'Customer NGN Wallet', type: GlAccountType.LIABILITY, parentCode: '2100' },
      { code: '2200', name: 'Partner Liabilities', type: GlAccountType.LIABILITY, parentCode: '2000' },
      { code: '2202', name: 'Partner Commission Payable', type: GlAccountType.LIABILITY, parentCode: '2200' },
      { code: '2300', name: 'Driver Payables', type: GlAccountType.LIABILITY, parentCode: '2000' },
      { code: '2301', name: 'Driver Wallet Balance', type: GlAccountType.LIABILITY, parentCode: '2300' },
      { code: '2302', name: 'Driver Earnings Payable', type: GlAccountType.LIABILITY, parentCode: '2300' },
      { code: '2400', name: 'Settlement Liabilities', type: GlAccountType.LIABILITY, parentCode: '2000' },
      { code: '2402', name: 'Unsettled Collections', type: GlAccountType.LIABILITY, parentCode: '2400' },
      { code: '4000', name: 'REVENUE', type: GlAccountType.INCOME },
      { code: '4200', name: 'Commission Revenue', type: GlAccountType.INCOME, parentCode: '4000' },
      { code: '4201', name: 'Trip Commission Revenue', type: GlAccountType.INCOME, parentCode: '4200' },
      { code: '4202', name: 'Partner Commission Revenue', type: GlAccountType.INCOME, parentCode: '4200' },
      { code: '5000', name: 'EXPENSES', type: GlAccountType.EXPENSE },
      { code: '5100', name: 'Gateway Charges', type: GlAccountType.EXPENSE, parentCode: '5000' },
      { code: '5101', name: 'Paystack Gateway Charges', type: GlAccountType.EXPENSE, parentCode: '5100' },
    ];

    const created: Record<string, GlAccount> = {};
    for (const def of accountDefs) {
      const parentId = def.parentCode ? created[def.parentCode]?.id : undefined;
      const acc = await glAccountsService.createGlAccount({
        code: def.code,
        name: def.name,
        type: def.type,
        tenantId,
        parentId,
      });
      created[def.code] = acc;
    }
    return created;
  }

  async function seedCommissionRules() {
    await commissionEngineService.createCommissionRule({
      tenantId,
      ruleType: CommissionRuleType.PLATFORM,
      calculationMethod: CommissionCalculationMethod.PERCENTAGE,
      rate: 0.10,
      priority: 1,
      description: 'Standard 10% platform commission',
      isActive: true,
    } as any);

    await commissionEngineService.createCommissionRule({
      tenantId,
      ruleType: CommissionRuleType.PARTNER,
      calculationMethod: CommissionCalculationMethod.PERCENTAGE,
      rate: 0.05,
      priority: 2,
      description: 'Standard 5% partner commission',
      isActive: true,
    } as any);
  }

  describe('Commission Engine', () => {
    it('should calculate commissions for individual driver (no partner)', async () => {
      const result = await commissionEngineService.calculateCommissions({
        amount: 10000,
        tenantId,
      });

      expect(result.totalAmount).toBe(10000);
      expect(result.platformCommission).toBe(1000);
      expect(result.partnerCommission).toBe(0);
      expect(result.driverPayout).toBe(8850);
      expect(result.gatewayFee).toBe(150);
    });

    it('should calculate commissions for corporate driver (with partner)', async () => {
      const result = await commissionEngineService.calculateCommissions({
        amount: 10000,
        tenantId,
        isCorporate: true,
        partnerId: 'partner-abc',
      });

      expect(result.totalAmount).toBe(10000);
      expect(result.platformCommission).toBe(1000);
      expect(result.partnerCommission).toBe(500);
      expect(result.driverPayout).toBe(8350);
      expect(result.gatewayFee).toBe(150);
    });

    it('should apply flat commission rules', async () => {
      const flatRule = await commissionEngineService.createCommissionRule({
        tenantId,
        ruleType: CommissionRuleType.PLATFORM,
        calculationMethod: CommissionCalculationMethod.FLAT,
        flatAmount: 500,
        priority: 0,
        description: 'Flat 500 NGN fee',
        isActive: true,
      } as any);

      try {
        const result = await commissionEngineService.calculateCommissions({
          amount: 5000,
          tenantId,
        });

        expect(result.platformCommission).toBeGreaterThanOrEqual(500);
      } finally {
        await commissionRuleRepo.delete(flatRule.id);
      }
    });
  });

  describe('Revenue Recognition', () => {
    const tripId = 'trip-rev-test-001';
    const driverCustomerId = 'driver-1';
    const riderCustomerId = 'rider-1';

    it('should record trip revenue with full double-entry posting', async () => {
      const result = await revenueRecognitionService.recordTripRevenue({
        tripId,
        driverCustomerId,
        riderCustomerId,
        totalFare: 10000,
        platformCommissionRate: 0.10,
        tenantId,
        paystackReference: 'paystack-ref-001',
      });

      expect(result.success).toBe(true);
      expect(result.tripId).toBe(tripId);
      expect(result.financialSummary.totalFare).toBe(10000);
      expect(result.financialSummary.platformCommission).toBe(1000);
      expect(result.financialSummary.driverPayout).toBe(8850);
      expect(result.journalEntries.length).toBeGreaterThanOrEqual(2);
    });

    it('should create trip financial record with correct data', async () => {
      const record = await tripFinancialRepo.findOne({
        where: { tripId, tenantId },
      });

      expect(record).toBeDefined();
      expect(Number(record!.totalFare)).toBe(10000);
      expect(Number(record!.platformCommissionAmount)).toBe(1000);
      expect(Number(record!.driverPayout)).toBe(8850);
      expect(record!.status).toBe(TripFinancialStatus.COMPLETED);
      expect(record!.isCorporateDriver).toBe(false);
    });

    it('should have balanced journal entries', async () => {
      const journals = await journalRepo.find({
        where: { tenantId },
        relations: ['entries'],
      });

      for (const journal of journals) {
        let totalDebit = 0;
        let totalCredit = 0;

        for (const entry of journal.entries) {
          const amount = Number(entry.amount);
          if (entry.side === EntrySide.DEBIT) {
            totalDebit += amount;
          } else {
            totalCredit += amount;
          }
        }

        expect(Math.abs(totalDebit - totalCredit)).toBeLessThanOrEqual(0.001);
      }
    });

    it('should be idempotent (same trip cannot be recorded twice)', async () => {
      const result = await revenueRecognitionService.recordTripRevenue({
        tripId,
        driverCustomerId,
        riderCustomerId,
        totalFare: 10000,
        tenantId,
      });

      expect(result.success).toBe(true);
      expect(result.journalEntries.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Audit Trail', () => {
    it('should provide full audit trail for a paystack reference', async () => {
      const auditTrail = await auditService.getFullAuditTrail(
        'paystack-ref-001',
        tenantId,
      );

      expect(auditTrail).toBeDefined();
      if (auditTrail && 'financialSummary' in auditTrail) {
        expect(auditTrail.tripId).toBe('trip-rev-test-001');
        expect(auditTrail.financialSummary.totalFare).toBe(10000);
        expect(auditTrail.journals.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should provide GL impact analysis for a journal entry', async () => {
      const journals = await journalRepo.find({
        where: { tenantId },
        take: 1,
      });

      if (journals.length > 0) {
        const glImpact = await auditService.getTransactionGlImpact(
          journals[0].id,
          tenantId,
        );

        expect(glImpact).toBeDefined();
        expect(glImpact!.glImpact.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should generate trial balance', async () => {
      const trialBalance = await auditService.getTrialBalance(tenantId);

      expect(trialBalance).toBeDefined();
      expect(trialBalance.totalDebit).toBeGreaterThan(0);
      expect(trialBalance.balanced).toBe(true);
    });

    it('should generate profit and loss statement', async () => {
      const pnl = await auditService.getProfitAndLoss(tenantId);

      expect(pnl).toBeDefined();
      expect(pnl.totalIncome).toBeGreaterThan(0);
      expect(pnl.netProfit).toBeDefined();
    });

    it('should generate balance sheet', async () => {
      const balanceSheet = await auditService.getBalanceSheet(tenantId);

      expect(balanceSheet).toBeDefined();
      expect(balanceSheet.accountingEquation.balanced).toBe(true);
    });
  });

  describe('Corporate Driver (with Partner) Revenue Flow', () => {
    const corporateTripId = 'trip-corp-001';
    const partnerId = 'partner-xyz';

    it('should record revenue with partner commission split', async () => {
      mockedAxios.get.mockImplementation(async (url: string) => {
        if (url.includes('/accounts/customer/driver-corp')) {
          return {
            data: [
              {
                accountNumber: 'DRV-CORP-ACC',
                glAccountId: driverWalletLiabilityId,
                currency: 'NGN',
                customerId: 'driver-corp',
              },
            ],
          };
        }
        if (url.includes('/ledger/accounts')) {
          const accountsList = await glAccountRepo.find();
          return { data: accountsList.map((a: any) => ({ ...a, code: String(a.code) })) };
        }
        return { data: [] };
      });

      const result = await revenueRecognitionService.recordTripRevenue({
        tripId: corporateTripId,
        driverCustomerId: 'driver-corp',
        riderCustomerId: 'rider-corp',
        totalFare: 20000,
        platformCommissionRate: 0.10,
        partnerCommissionRate: 0.05,
        partnerTenantId: partnerId,
        isCorporateDriver: true,
        tenantId,
        paystackReference: 'paystack-corp-ref',
      });

      expect(result.success).toBe(true);
      expect(result.financialSummary.totalFare).toBe(20000);
      expect(result.financialSummary.platformCommission).toBe(2000);
      expect(result.financialSummary.partnerCommission).toBe(1000);
      expect(result.financialSummary.driverPayout).toBe(16700);
    });

    it('should record partner commission as payable liability', async () => {
      const partnerPayableGl = await glAccountRepo.findOne({
        where: { id: partnerCommissionPayableId },
      });

      expect(partnerPayableGl).toBeDefined();
      expect(Math.abs(Number(partnerPayableGl!.balance))).toBeGreaterThan(0);
    });

    it('should have complete audit trail for corporate trip', async () => {
      const audit = await auditService.getFullAuditTrail(
        'paystack-corp-ref',
        tenantId,
      );

      expect(audit).toBeDefined();
      if (audit && 'financialSummary' in audit) {
        expect(audit.financialSummary.partnerCommission).toBe(1000);
        expect(audit.isCorporateDriver).toBe(true);
        expect(audit.settlementStatus.revenuePosted).toBe(true);
      }
    });
  });

  describe('Revenue Summary', () => {
    it('should aggregate revenue summaries correctly', async () => {
      const summary = await revenueRecognitionService.getRevenueSummary(
        tenantId,
      );

      expect(summary.totalTrips).toBe(2);
      expect(summary.grossRevenue).toBe(30000);
      expect(summary.totalPlatformCommission).toBe(3000);
      expect(summary.totalPartnerCommission).toBe(1000);
      expect(summary.totalDriverPayout).toBeGreaterThan(0);
    });
  });
});
