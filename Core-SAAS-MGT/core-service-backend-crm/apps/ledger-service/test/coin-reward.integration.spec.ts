import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import axios from 'axios';
import { LedgerServiceModule } from '../src/ledger-service.module';
import { CoinRewardService } from '../src/coin-reward.service';
import { CoinWallet, EntityType } from '../src/entities/coin-wallet.entity';
import { CoinTransaction } from '../src/entities/coin-transaction.entity';
import { SiteWideFareConfig } from '../src/entities/site-wide-fare-config.entity';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CoinRewardService Integration', () => {
  let app: INestApplication;
  let coinRewardService: CoinRewardService;
  let walletRepo: Repository<CoinWallet>;
  let txnRepo: Repository<CoinTransaction>;
  let fareConfigRepo: Repository<SiteWideFareConfig>;

  const tenantId = 'coin-reward-test-tenant';
  const riderId = 'coin-rider-1';
  const driverId = 'coin-driver-1';
  const tripId = 'coin-trip-001';
  const riderAmount = 10;
  const driverAmount = 25;
  const tenantAmount = 5;

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

    coinRewardService = app.get<CoinRewardService>(CoinRewardService);
    walletRepo = app.get<Repository<CoinWallet>>(getRepositoryToken(CoinWallet));
    txnRepo = app.get<Repository<CoinTransaction>>(getRepositoryToken(CoinTransaction));
    fareConfigRepo = app.get<Repository<SiteWideFareConfig>>(getRepositoryToken(SiteWideFareConfig));

    await seedFareConfig();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  async function seedFareConfig() {
    const configs = [
      { configKey: 'COIN_REWARD_ENABLED', configValue: 'true', description: 'Enable coin rewards' },
      { configKey: 'RIDER_COIN_REWARD_PER_TRIP', configValue: String(riderAmount), description: 'Rider coins per trip' },
      { configKey: 'DRIVER_COIN_REWARD_PER_TRIP', configValue: String(driverAmount), description: 'Driver coins per trip' },
      { configKey: 'TENANT_COIN_REWARD_PER_TRIP', configValue: String(tenantAmount), description: 'Tenant coins per trip' },
    ];
    for (const cfg of configs) {
      const existing = await fareConfigRepo.findOne({ where: { configKey: cfg.configKey } });
      if (!existing) {
        await fareConfigRepo.save(fareConfigRepo.create(cfg));
      }
    }
  }

  describe('awardTripCoins', () => {
    it('should award coins to rider, driver, and tenant', async () => {
      const result = await coinRewardService.awardTripCoins(tripId, tenantId, riderId, driverId);

      expect(result.riderCoins).toBe(riderAmount);
      expect(result.driverCoins).toBe(driverAmount);
      expect(result.tenantCoins).toBe(tenantAmount);
    });

    it('should create coin wallets for all three entities', async () => {
      const wallets = await walletRepo.find({ where: { tenantId } });
      expect(wallets.length).toBe(3);

      const riderWallet = wallets.find(w => w.entityType === EntityType.RIDER);
      const driverWallet = wallets.find(w => w.entityType === EntityType.DRIVER);
      const tenantWallet = wallets.find(w => w.entityType === EntityType.TENANT);

      expect(riderWallet).toBeDefined();
      expect(Number(riderWallet!.balance)).toBe(riderAmount);

      expect(driverWallet).toBeDefined();
      expect(Number(driverWallet!.balance)).toBe(driverAmount);

      expect(tenantWallet).toBeDefined();
      expect(Number(tenantWallet!.balance)).toBe(tenantAmount);
    });

    it('should create coin transaction records for all three credits', async () => {
      const txns = await txnRepo.find({ where: { tenantId } });
      expect(txns.length).toBe(3);

      const refs = txns.map(t => t.reference);
      const uniqueRefs = new Set(refs);
      expect(uniqueRefs.size).toBe(1);

      for (const txn of txns) {
        expect(txn.tripId).toBe(tripId);
        expect(txn.type).toBe('CREDIT');
        expect(Number(txn.amount)).toBeGreaterThan(0);
      }
    });

    it('should be idempotent — awarding same trip again adds more coins', async () => {
      await coinRewardService.awardTripCoins(tripId, tenantId, riderId, driverId);

      const riderWallet = await walletRepo.findOne({ where: { entityId: riderId, entityType: EntityType.RIDER } });
      expect(Number(riderWallet!.balance)).toBe(riderAmount * 2);

      const txns = await txnRepo.find({ where: { tenantId } });
      expect(txns.length).toBe(6);
    });

    it('should skip when COIN_REWARD_ENABLED is false', async () => {
      await fareConfigRepo.update({ configKey: 'COIN_REWARD_ENABLED' }, { configValue: 'false' });

      const result = await coinRewardService.awardTripCoins('trip-disabled', tenantId, 'rider-disabled', 'driver-disabled');
      expect(result.riderCoins).toBe(0);
      expect(result.driverCoins).toBe(0);
      expect(result.tenantCoins).toBe(0);

      await fareConfigRepo.update({ configKey: 'COIN_REWARD_ENABLED' }, { configValue: 'true' });
    });
  });

  describe('getCoinBalance', () => {
    it('should return correct balance for each entity type', async () => {
      const riderBal = await coinRewardService.getCoinBalance(riderId, EntityType.RIDER);
      expect(Number(riderBal!.balance)).toBe(riderAmount * 2);

      const driverBal = await coinRewardService.getCoinBalance(driverId, EntityType.DRIVER);
      expect(Number(driverBal!.balance)).toBe(driverAmount * 2);

      const tenantBal = await coinRewardService.getCoinBalance(tenantId, EntityType.TENANT);
      expect(Number(tenantBal!.balance)).toBe(tenantAmount * 2);
    });

    it('should return null for non-existent entity', async () => {
      const result = await coinRewardService.getCoinBalance('non-existent-id', EntityType.RIDER);
      expect(result).toBeNull();
    });
  });

  describe('getWalletByEntity', () => {
    it('should return wallet for existing entity', async () => {
      const wallet = await coinRewardService.getWalletByEntity(riderId, EntityType.RIDER);
      expect(wallet).toBeDefined();
      expect(wallet!.entityId).toBe(riderId);
      expect(wallet!.entityType).toBe(EntityType.RIDER);
    });

    it('should return null for non-existent entity', async () => {
      const wallet = await coinRewardService.getWalletByEntity('no-such-entity', EntityType.DRIVER);
      expect(wallet).toBeNull();
    });
  });

  describe('listAllWallets', () => {
    it('should return all wallets for tenant', async () => {
      const wallets = await coinRewardService.listAllWallets(tenantId);
      expect(wallets.length).toBe(3);

      const types = wallets.map(w => w.entityType).sort();
      expect(types).toEqual([EntityType.DRIVER, EntityType.RIDER, EntityType.TENANT]);
    });

    it('should return empty array for tenant with no wallets', async () => {
      const wallets = await coinRewardService.listAllWallets('non-existent-tenant');
      expect(wallets.length).toBe(0);
    });
  });

  describe('listCoinTransactions', () => {
    it('should return paginated transactions for a wallet', async () => {
      const wallets = await coinRewardService.listAllWallets(tenantId);
      const riderWallet = wallets.find(w => w.entityType === EntityType.RIDER);

      const result = await coinRewardService.listCoinTransactions(riderWallet!.id, 0, 10);
      expect(result.data.length).toBe(2);
      expect(result.totalItems).toBe(2);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);

      for (const txn of result.data) {
        expect(txn.walletId).toBe(riderWallet!.id);
        expect(txn.type).toBe('CREDIT');
        expect(Number(txn.amount)).toBe(riderAmount);
      }
    });

    it('should handle pagination boundaries', async () => {
      const wallets = await coinRewardService.listAllWallets(tenantId);
      const riderWallet = wallets.find(w => w.entityType === EntityType.RIDER);

      const page0 = await coinRewardService.listCoinTransactions(riderWallet!.id, 0, 1);
      expect(page0.data.length).toBe(1);
      expect(page0.totalPages).toBe(2);

      const page1 = await coinRewardService.listCoinTransactions(riderWallet!.id, 1, 1);
      expect(page1.data.length).toBe(1);
    });

    it('should return empty for non-existent wallet', async () => {
      const result = await coinRewardService.listCoinTransactions('no-such-wallet');
      expect(result.data.length).toBe(0);
      expect(result.totalItems).toBe(0);
    });
  });
});
