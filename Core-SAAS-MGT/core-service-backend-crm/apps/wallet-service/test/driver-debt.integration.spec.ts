import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import axios from 'axios';
import { WalletServiceModule } from '../src/wallet-service.module';
import { DriverDebtService } from '../src/services/driver-debt.service';
import { AutoSettlementService } from '../src/services/auto-settlement.service';
import { WalletServiceService } from '../src/wallet-service.service';
import { DriverDebt, DriverDebtStatus } from '../src/entities/driver-debt.entity';
import { DriverEarning, DriverEarningStatus } from '../src/entities/driver-earning.entity';
import { DriverLedger, DriverLedgerDirection, DriverLedgerEntryType } from '../src/entities/driver-ledger.entity';
import { WalletTransaction } from '../src/entities/wallet-transaction.entity';
import { SettlementMethod } from '../src/dto/driver-debt.dto';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Driver Debt & Auto-Settlement Integration', () => {
  let app: INestApplication;
  let driverDebtService: DriverDebtService;
  let autoSettlementService: AutoSettlementService;
  let walletService: WalletServiceService;
  let driverDebtRepo: Repository<DriverDebt>;
  let driverEarningRepo: Repository<DriverEarning>;
  let driverLedgerRepo: Repository<DriverLedger>;

  const tenantId = 'test-tenant-debt';
  const driverId = 'test-driver-debt-1';

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

    driverDebtService = app.get<DriverDebtService>(DriverDebtService);
    autoSettlementService = app.get<AutoSettlementService>(AutoSettlementService);
    walletService = app.get<WalletServiceService>(WalletServiceService);
    driverDebtRepo = app.get<Repository<DriverDebt>>(getRepositoryToken(DriverDebt));
    driverEarningRepo = app.get<Repository<DriverEarning>>(getRepositoryToken(DriverEarning));
    driverLedgerRepo = app.get<Repository<DriverLedger>>(getRepositoryToken(DriverLedger));

    mockedAxios.get.mockImplementation(async (url: string) => {
      if (url.includes('/accounts/customer/')) {
        return {
          data: [
            {
              accountNumber: 'DRV-WLT-ACC-1',
              glAccountId: 'driver-wallet-gl-id',
              currency: 'NGN',
              customerId: driverId,
            },
          ],
        };
      }
      if (url.includes('/ledger/accounts')) {
        return {
          data: {
            data: [
              { code: '2301', id: 'driver-wallet-gl-id', name: 'Driver Wallet Balance' },
              { code: '2302', id: 'driver-payable-gl-id', name: 'Driver Earnings Payable' },
              { code: '1403', id: 'driver-debt-gl-id', name: 'Driver Debt / Receivables' },
              { code: '4201', id: 'commission-rev-gl-id', name: 'Trip Commission Revenue' },
              { code: '1101', id: 'cash-gl-id', name: 'Cash at Bank' },
            ],
          },
        };
      }
      if (url.includes('/accounts/')) {
        return {
          data: {
            accountNumber: 'DRV-WLT-ACC-1',
            glAccountId: 'driver-wallet-gl-id',
            currency: 'NGN',
            customerId: driverId,
            tenantId,
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

  beforeEach(async () => {
    // Clear database before each test
    await driverLedgerRepo.clear();
    await driverEarningRepo.clear();
    await driverDebtRepo.clear();
  });

  describe('Driver Debt Flow', () => {
    it('should record a commission debt and transition status to RESTRICTED if threshold is exceeded', async () => {
      // 1. Threshold is 5000 NGN by default. Record 6000 NGN commission debt.
      const debt = await driverDebtService.recordCommissionDebt(tenantId, driverId, 6000, 'trip-101');

      expect(debt).toBeDefined();
      expect(debt.driverCustomerId).toBe(driverId);
      expect(Number(debt.outstandingBalance)).toBe(6000);
      expect(debt.status).toBe(DriverDebtStatus.RESTRICTED);

      // Check local ledger entry
      const ledgerEntries = await driverLedgerRepo.find({
        where: { driverCustomerId: driverId, tenantId },
      });
      expect(ledgerEntries.length).toBe(1);
      expect(ledgerEntries[0].entryType).toBe(DriverLedgerEntryType.CASH_RIDE_COMMISSION);
      expect(ledgerEntries[0].direction).toBe(DriverLedgerDirection.DEBIT);
      expect(Number(ledgerEntries[0].amount)).toBe(6000);
    });

    it('should not transition status to RESTRICTED if threshold is not met', async () => {
      const debt = await driverDebtService.recordCommissionDebt(tenantId, driverId, 2000, 'trip-102');
      expect(debt.status).toBe(DriverDebtStatus.ACTIVE);
      expect(Number(debt.outstandingBalance)).toBe(2000);
    });
  });

  describe('Auto-Settlement Cron', () => {
    it('should partially settle debt from posted earnings and reduce outstanding debt', async () => {
      // 1. Create debt of 6000 NGN (RESTRICTED)
      await driverDebtService.recordCommissionDebt(tenantId, driverId, 6000, 'trip-101');

      // 2. Create driver earning with status POSTED (finalPayout = 4000)
      const earning = driverEarningRepo.create({
        tenantId,
        driverCustomerId: driverId,
        tripId: 'trip-102',
        tripFare: 5000,
        platformCommission: 1000,
        partnerCommission: 0,
        netEarnings: 4000,
        finalPayout: 4000,
        currency: 'NGN',
        status: DriverEarningStatus.POSTED,
      });
      await driverEarningRepo.save(earning);

      // 3. Trigger auto-settlement
      await autoSettlementService.autoSettleDriverDebts();

      // 4. Verify debt is reduced to 2000 NGN, status becomes ACTIVE (since 2000 < 5000)
      const updatedDebt = await driverDebtRepo.findOneOrFail({
        where: { driverCustomerId: driverId, tenantId },
      });
      expect(Number(updatedDebt.outstandingBalance)).toBe(2000);
      expect(Number(updatedDebt.totalSettled)).toBe(4000);
      expect(updatedDebt.status).toBe(DriverDebtStatus.ACTIVE);

      // 5. Verify earning finalPayout is 0, status is PAID
      const updatedEarning = await driverEarningRepo.findOneOrFail({
        where: { id: earning.id },
      });
      expect(Number(updatedEarning.finalPayout)).toBe(0);
      expect(updatedEarning.status).toBe(DriverEarningStatus.PAID);

      // 6. Verify local ledger entries (CASH_RIDE_COMMISSION + DEBT_SETTLEMENT)
      const ledgerEntries = await driverLedgerRepo.find({
        where: { driverCustomerId: driverId, tenantId },
        order: { createdAt: 'ASC' },
      });
      expect(ledgerEntries.length).toBe(2);
      expect(ledgerEntries[1].entryType).toBe(DriverLedgerEntryType.DEBT_SETTLEMENT);
      expect(ledgerEntries[1].direction).toBe(DriverLedgerDirection.CREDIT);
      expect(Number(ledgerEntries[1].amount)).toBe(4000);
    });

    it('should fully settle debt if posted earning is larger than outstanding debt', async () => {
      // 1. Create debt of 3000 NGN (ACTIVE)
      await driverDebtService.recordCommissionDebt(tenantId, driverId, 3000, 'trip-101');

      // 2. Create driver earning with status POSTED (finalPayout = 10000)
      const earning = driverEarningRepo.create({
        tenantId,
        driverCustomerId: driverId,
        tripId: 'trip-102',
        tripFare: 12000,
        platformCommission: 2000,
        partnerCommission: 0,
        netEarnings: 10000,
        finalPayout: 10000,
        currency: 'NGN',
        status: DriverEarningStatus.POSTED,
      });
      await driverEarningRepo.save(earning);

      // 3. Trigger auto-settlement
      await autoSettlementService.autoSettleDriverDebts();

      // 4. Verify debt is 0, status is SETTLED
      const updatedDebt = await driverDebtRepo.findOneOrFail({
        where: { driverCustomerId: driverId, tenantId },
      });
      expect(Number(updatedDebt.outstandingBalance)).toBe(0);
      expect(updatedDebt.status).toBe(DriverDebtStatus.SETTLED);

      // 5. Verify earning has finalPayout = 7000 and status remains POSTED
      const updatedEarning = await driverEarningRepo.findOneOrFail({
        where: { id: earning.id },
      });
      expect(Number(updatedEarning.finalPayout)).toBe(7000);
      expect(updatedEarning.status).toBe(DriverEarningStatus.POSTED);
    });
  });

  describe('Wallet Funding Trigger', () => {
    it('should automatically settle outstanding debt when driver wallet is funded', async () => {
      // 1. Create debt of 6000 NGN (RESTRICTED)
      await driverDebtService.recordCommissionDebt(tenantId, driverId, 6000, 'trip-101');

      // 2. Fund the wallet with 4000 NGN
      await walletService.walletFunding({
        tenantId,
        accountNumber: 'DRV-WLT-ACC-1',
        amount: 4000,
        currency: 'NGN',
        description: 'Driver funded wallet via card',
      });

      // 3. Verify outstanding debt is reduced to 2000 NGN, status becomes ACTIVE
      const updatedDebt = await driverDebtRepo.findOneOrFail({
        where: { driverCustomerId: driverId, tenantId },
      });
      expect(Number(updatedDebt.outstandingBalance)).toBe(2000);
      expect(updatedDebt.status).toBe(DriverDebtStatus.ACTIVE);

      // 4. Verify ledger entries: COMMISSION (DEBIT 6000), DEBT_SETTLEMENT (CREDIT 4000)
      const ledgerEntries = await driverLedgerRepo.find({
        where: { driverCustomerId: driverId, tenantId },
        order: { createdAt: 'ASC' },
      });
      expect(ledgerEntries.length).toBe(2);
      expect(ledgerEntries[1].entryType).toBe(DriverLedgerEntryType.DEBT_SETTLEMENT);
      expect(ledgerEntries[1].direction).toBe(DriverLedgerDirection.CREDIT);
      expect(Number(ledgerEntries[1].amount)).toBe(4000);
    });
  });
});
