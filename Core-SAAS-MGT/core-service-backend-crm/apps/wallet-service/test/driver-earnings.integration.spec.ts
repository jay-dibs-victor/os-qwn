import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import axios from 'axios';
import { WalletServiceModule } from '../src/wallet-service.module';
import { DriverEarningsService } from '../src/driver-earnings.service';
import { PartnerSettlementService } from '../src/partner-settlement.service';
import {
  DriverEarning,
  DriverEarningStatus,
} from '../src/entities/driver-earning.entity';
import {
  PartnerSettlement,
  PartnerSettlementStatus,
} from '../src/entities/partner-settlement.entity';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Driver Earnings & Partner Settlement Integration', () => {
  let app: INestApplication;
  let driverEarningsService: DriverEarningsService;
  let partnerSettlementService: PartnerSettlementService;
  let driverEarningRepo: Repository<DriverEarning>;
  let partnerSettlementRepo: Repository<PartnerSettlement>;

  const tenantId = 'test-tenant-earnings';
  const driverId = 'test-driver-1';
  const partnerId = 'test-partner-1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST || 'localhost',
          port: Number(process.env.POSTGRES_PORT) || 5432,
          username: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          database: process.env.POSTGRES_DB || 'wallet_test',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        WalletServiceModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    driverEarningsService =
      app.get<DriverEarningsService>(DriverEarningsService);
    partnerSettlementService = app.get<PartnerSettlementService>(
      PartnerSettlementService,
    );
    driverEarningRepo = app.get<Repository<DriverEarning>>(
      getRepositoryToken(DriverEarning),
    );
    partnerSettlementRepo = app.get<Repository<PartnerSettlement>>(
      getRepositoryToken(PartnerSettlement),
    );

    mockedAxios.get.mockImplementation(async (url: string) => {
      if (url.includes('/accounts/customer/')) {
        return {
          data: [
            {
              accountNumber: 'TEST-ACC-001',
              glAccountId: 'test-gl-id',
              currency: 'NGN',
              customerId: 'test-driver-1',
            },
          ],
        };
      }
      if (url.includes('/ledger/accounts')) {
        return {
          data: [
            { code: '2302', id: 'driver-payable-gl', name: 'Driver Earnings Payable' },
            { code: '2202', id: 'partner-payable-gl', name: 'Partner Commission Payable' },
            { code: '4202', id: 'partner-revenue-gl', name: 'Partner Commission Revenue' },
            { code: '1101', id: 'cash-gl', name: 'Cash at Bank' },
          ],
        };
      }
      if (url.includes('/accounts/')) {
        return {
          data: {
            accountNumber: 'TEST-ACC-001',
            glAccountId: 'test-gl-id',
            currency: 'NGN',
          },
        };
      }
      return { data: [] };
    });

    mockedAxios.post.mockImplementation(async (url: string) => {
      if (url.includes('/ledger/posting/transaction')) {
        return {
          data: {
            id: `journal-${Date.now()}`,
            reference: `ref-${Date.now()}`,
          },
        };
      }
      return { data: {} };
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Driver Earnings Service', () => {
    it('should record a driver earning', async () => {
      const earning = await driverEarningsService.recordEarning({
        tenantId,
        driverCustomerId: driverId,
        tripId: 'trip-001',
        tripFare: 10000,
        platformCommission: 1000,
        partnerCommission: 0,
        netEarnings: 9000,
        currency: 'NGN',
      });

      expect(earning).toBeDefined();
      expect(earning.driverCustomerId).toBe(driverId);
      expect(Number(earning.finalPayout)).toBe(9000);
      expect(earning.status).toBe(DriverEarningStatus.PENDING);
    });

    it('should apply bonus and penalty adjustments', async () => {
      const earning = await driverEarningsService.recordEarning({
        tenantId,
        driverCustomerId: driverId,
        tripId: 'trip-002',
        tripFare: 15000,
        platformCommission: 1500,
        partnerCommission: 0,
        netEarnings: 13500,
        bonusAmount: 1000,
        penaltyAmount: 500,
        currency: 'NGN',
      });

      expect(Number(earning.bonusAmount)).toBe(1000);
      expect(Number(earning.penaltyAmount)).toBe(500);
      expect(Number(earning.finalPayout)).toBe(14000);
    });

    it('should apply subscription and lease deductions', async () => {
      const earning = await driverEarningsService.recordEarning({
        tenantId,
        driverCustomerId: driverId,
        tripId: 'trip-003',
        tripFare: 20000,
        platformCommission: 2000,
        partnerCommission: 0,
        netEarnings: 18000,
        subscriptionDeduction: 5000,
        leaseDeduction: 3000,
        currency: 'NGN',
      });

      expect(Number(earning.subscriptionDeduction)).toBe(5000);
      expect(Number(earning.leaseDeduction)).toBe(3000);
      expect(Number(earning.finalPayout)).toBe(10000);
    });

    it('should be idempotent (same trip cannot be recorded twice)', async () => {
      const first = await driverEarningsService.recordEarning({
        tenantId,
        driverCustomerId: driverId,
        tripId: 'trip-001',
        tripFare: 10000,
        platformCommission: 1000,
        partnerCommission: 0,
        netEarnings: 9000,
      });

      const second = await driverEarningsService.recordEarning({
        tenantId,
        driverCustomerId: driverId,
        tripId: 'trip-001',
        tripFare: 20000,
        platformCommission: 2000,
        partnerCommission: 0,
        netEarnings: 18000,
      });

      expect(first.id).toBe(second.id);
      expect(Number(first.tripFare)).toBe(10000);
    });

    it('should get driver earnings summary with totals', async () => {
      const result = await driverEarningsService.getDriverEarnings(
        driverId,
        tenantId,
        {},
      );

      expect(result.earnings.length).toBeGreaterThanOrEqual(3);
      expect(result.totals.totalFare).toBeGreaterThan(0);
      expect(result.totals.totalNetEarnings).toBeGreaterThan(0);
    });

    it('should mark earning as posted', async () => {
      const earnings = await driverEarningRepo.find({
        where: { driverCustomerId: driverId, tenantId },
        take: 1,
      });

      if (earnings.length > 0) {
        const updated = await driverEarningsService.markAsPosted(
          earnings[0].id,
          'journal-posted-001',
        );
        expect(updated.status).toBe(DriverEarningStatus.POSTED);
      }
    });
  });

  describe('Partner Settlement Service', () => {
    it('should create a partner settlement', async () => {
      const settlement = await partnerSettlementService.createSettlement({
        tenantId,
        partnerId,
        settlementType: 'COMMISSION' as any,
        amount: 5000,
        currency: 'NGN',
        description: 'Test partner commission',
      });

      expect(settlement).toBeDefined();
      expect(settlement.partnerId).toBe(partnerId);
      expect(settlement.status).toBe(PartnerSettlementStatus.PENDING);
      expect(Number(settlement.amount)).toBe(5000);
    });

    it('should create multiple settlements and calculate balance', async () => {
      await partnerSettlementService.createSettlement({
        tenantId,
        partnerId,
        amount: 3000,
        description: 'Additional commission',
      });

      const balance = await partnerSettlementService.getPartnerBalance(
        partnerId,
        tenantId,
      );

      expect(balance.totalDue).toBe(8000);
      expect(balance.pendingCount).toBe(2);
    });

    it('should settle a partner', async () => {
      const settlements = await partnerSettlementRepo.find({
        where: { partnerId, tenantId },
        take: 1,
      });

      if (settlements.length > 0) {
        const result = await partnerSettlementService.settlePartner({
          settlementId: settlements[0].id,
          partnerAccountNumber: 'PARTNER-ACC-001',
          tenantId,
        });

        expect(result.success).toBe(true);
        expect(result.amount).toBeGreaterThan(0);
      }
    });

    it('should reflect reduced balance after settlement', async () => {
      const balance = await partnerSettlementService.getPartnerBalance(
        partnerId,
        tenantId,
      );

      expect(balance.totalSettled).toBeGreaterThan(0);
    });

    it('should list settlements with pagination', async () => {
      const result = await partnerSettlementService.listSettlements({
        tenantId,
        page: 1,
        pageSize: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.totalItems).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Driver Payout Flow', () => {
    it('should payout a driver earning to wallet', async () => {
      const earnings = await driverEarningRepo.find({
        where: { status: DriverEarningStatus.PENDING, tenantId },
      });

      if (earnings.length > 0) {
        const result = await driverEarningsService.payoutDriver(
          earnings[0].id,
          'DRV-ACC-PAYOUT',
          tenantId,
        );

        expect(result.success).toBe(true);
        expect(result.journalEntryId).toBeDefined();
      }
    });

    it('should reject payout of already paid earning', async () => {
      const paidEarning = await driverEarningRepo.findOne({
        where: { status: DriverEarningStatus.PAID, tenantId },
      });

      if (paidEarning) {
        await expect(
          driverEarningsService.payoutDriver(
            paidEarning.id,
            'DRV-ACC-PAYOUT',
            tenantId,
          ),
        ).rejects.toThrow('already paid');
      }
    });
  });

  describe('List and Query Operations', () => {
    it('should list driver earnings with filters', async () => {
      const result = await driverEarningsService.listEarnings({
        tenantId,
        driverCustomerId: driverId,
        page: 1,
        pageSize: 10,
      });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.totalItems).toBeGreaterThanOrEqual(1);
    });

    it('should filter earnings by status', async () => {
      const result = await driverEarningsService.listEarnings({
        tenantId,
        status: DriverEarningStatus.PAID,
        page: 1,
        pageSize: 10,
      });

      for (const earning of result.data) {
        expect(earning.status).toBe(DriverEarningStatus.PAID);
      }
    });

    it('should filter partner settlements by status', async () => {
      const result = await partnerSettlementService.listSettlements({
        tenantId,
        status: PartnerSettlementStatus.SETTLED,
        page: 1,
        pageSize: 10,
      });

      for (const settlement of result.data) {
        expect(settlement.status).toBe(PartnerSettlementStatus.SETTLED);
      }
    });
  });
});
