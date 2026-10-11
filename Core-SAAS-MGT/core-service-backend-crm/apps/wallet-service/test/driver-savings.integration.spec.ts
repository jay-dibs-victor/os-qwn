import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import axios from 'axios';
import { WalletServiceModule } from '../src/wallet-service.module';
import { DriverSavingsService } from '../src/services/driver-savings.service';
import { DriverSavingsPlan, SavingsPlanStatus } from '../src/entities/driver-savings-plan.entity';
import { DriverEarning } from '../src/entities/driver-earning.entity';
import { DriverEarningsService } from '../src/driver-earnings.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DriverSavingsService Integration', () => {
  let app: INestApplication;
  let driverSavingsService: DriverSavingsService;
  let savingsRepo: Repository<DriverSavingsPlan>;

  const tenantId = 'savings-test-tenant';
  const driverId = 'savings-driver-1';
  let activePlan: DriverSavingsPlan;

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

    driverSavingsService = app.get<DriverSavingsService>(DriverSavingsService);
    savingsRepo = app.get<Repository<DriverSavingsPlan>>(getRepositoryToken(DriverSavingsPlan));
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('createPlan', () => {
    it('should create an active savings plan', async () => {
      const plan = await driverSavingsService.createPlan({
        tenantId,
        driverCustomerId: driverId,
        targetAmount: 100000,
        contributionPerTrip: 5000,
        earlyWithdrawalPenaltyPercent: 10,
        maxEarlyWithdrawalPenalty: 5000,
      });

      expect(plan).toBeDefined();
      expect(plan.tenantId).toBe(tenantId);
      expect(plan.driverCustomerId).toBe(driverId);
      expect(Number(plan.targetAmount)).toBe(100000);
      expect(Number(plan.contributionPerTrip)).toBe(5000);
      expect(plan.status).toBe(SavingsPlanStatus.ACTIVE);
      expect(Number(plan.currentAmount)).toBe(0);
      expect(Number(plan.earlyWithdrawalPenaltyPercent)).toBe(10);
      expect(Number(plan.maxEarlyWithdrawalPenalty)).toBe(5000);

      activePlan = plan;
    });

    it('should reject duplicate active plan for same driver', async () => {
      await expect(
        driverSavingsService.createPlan({
          tenantId,
          driverCustomerId: driverId,
          targetAmount: 50000,
          contributionPerTrip: 2000,
        }),
      ).rejects.toThrow('already has an active savings plan');
    });

    it('should allow creating plan for different driver', async () => {
      const plan = await driverSavingsService.createPlan({
        tenantId,
        driverCustomerId: 'savings-driver-2',
        targetAmount: 200000,
        contributionPerTrip: 10000,
      });

      expect(plan.driverCustomerId).toBe('savings-driver-2');
      expect(plan.status).toBe(SavingsPlanStatus.ACTIVE);
    });

    it('should set default penalty values when not provided', async () => {
      const plan = await driverSavingsService.createPlan({
        tenantId,
        driverCustomerId: 'savings-driver-defaults',
        targetAmount: 50000,
        contributionPerTrip: 2000,
      });

      expect(Number(plan.earlyWithdrawalPenaltyPercent)).toBe(10);
      expect(Number(plan.maxEarlyWithdrawalPenalty)).toBe(5000);
    });
  });

  describe('recordContribution', () => {
    it('should record a contribution to the savings plan', async () => {
      const plan = await driverSavingsService.recordContribution({
        tenantId,
        planId: activePlan.id,
        tripId: 'savings-trip-001',
        amount: 5000,
      });

      expect(Number(plan.currentAmount)).toBe(5000);
      expect(plan.totalContributions).toBe(1);
      expect(plan.status).toBe(SavingsPlanStatus.ACTIVE);
      expect(plan.contributionHistory).toBeDefined();
      expect(plan.contributionHistory!.length).toBe(1);
      expect(plan.contributionHistory![0].tripId).toBe('savings-trip-001');
      expect(Number(plan.contributionHistory![0].amount)).toBe(5000);
      expect(Number(plan.contributionHistory![0].runningTotal)).toBe(5000);
    });

    it('should record multiple contributions', async () => {
      await driverSavingsService.recordContribution({
        tenantId,
        planId: activePlan.id,
        tripId: 'savings-trip-002',
        amount: 5000,
      });

      const plan = await driverSavingsService.getPlan(tenantId, activePlan.id);
      expect(Number(plan.currentAmount)).toBe(10000);
      expect(plan.totalContributions).toBe(2);
    });

    it('should auto-complete plan when target is met', async () => {
      await driverSavingsService.recordContribution({
        tenantId,
        planId: activePlan.id,
        tripId: 'savings-trip-003',
        amount: 90000,
      });

      const plan = await driverSavingsService.getPlan(tenantId, activePlan.id);
      expect(Number(plan.currentAmount)).toBe(100000);
      expect(plan.status).toBe(SavingsPlanStatus.TARGET_MET);
      expect(plan.completedAt).toBeDefined();
    });

    it('should throw NotFound for non-existent plan', async () => {
      await expect(
        driverSavingsService.recordContribution({
          tenantId,
          planId: 'no-such-plan',
          tripId: 'savings-trip-xxx',
          amount: 1000,
        }),
      ).rejects.toThrow('not found');
    });

    it('should throw when contributing to non-active plan', async () => {
      await expect(
        driverSavingsService.recordContribution({
          tenantId,
          planId: activePlan.id,
          tripId: 'savings-trip-004',
          amount: 1000,
        }),
      ).rejects.toThrow('not active');
    });
  });

  describe('earlyWithdrawal', () => {
    let withdrawalPlan: DriverSavingsPlan;

    beforeAll(async () => {
      withdrawalPlan = await driverSavingsService.createPlan({
        tenantId,
        driverCustomerId: 'savings-withdrawal-driver',
        targetAmount: 200000,
        contributionPerTrip: 10000,
        earlyWithdrawalPenaltyPercent: 10,
        maxEarlyWithdrawalPenalty: 5000,
      });

      await driverSavingsService.recordContribution({
        tenantId,
        planId: withdrawalPlan.id,
        tripId: 'withdraw-trip-001',
        amount: 100000,
      });
    });

    it('should process early withdrawal with penalty calculation', async () => {
      const result = await driverSavingsService.earlyWithdrawal({
        tenantId,
        planId: withdrawalPlan.id,
        amount: 50000,
        reason: 'Emergency expense',
        actor: 'savings-driver',
      });

      expect(result.penalty).toBe(5000);
      expect(result.netAmount).toBe(45000);
      expect(result.plan.status).toBe(SavingsPlanStatus.EARLY_WITHDRAWN);
      expect(Number(result.plan.currentAmount)).toBe(50000);
      expect(Number(result.plan.totalPenaltiesPaid)).toBe(5000);
      expect(Number(result.plan.totalWithdrawn)).toBe(45000);
    });

    it('should cap penalty at maxEarlyWithdrawalPenalty', async () => {
      const highValuePlan = await driverSavingsService.createPlan({
        tenantId,
        driverCustomerId: 'savings-high-penalty',
        targetAmount: 500000,
        contributionPerTrip: 50000,
        earlyWithdrawalPenaltyPercent: 10,
        maxEarlyWithdrawalPenalty: 5000,
      });

      await driverSavingsService.recordContribution({
        tenantId,
        planId: highValuePlan.id,
        tripId: 'high-trip-001',
        amount: 300000,
      });

      const result = await driverSavingsService.earlyWithdrawal({
        tenantId,
        planId: highValuePlan.id,
        amount: 300000,
        reason: 'Full withdrawal',
        actor: 'test',
      });

      expect(result.penalty).toBe(5000);
      expect(result.netAmount).toBe(295000);
    });

    it('should reject withdrawal if insufficient balance', async () => {
      const insufficientPlan = await driverSavingsService.createPlan({
        tenantId,
        driverCustomerId: 'savings-insufficient',
        targetAmount: 200000,
        contributionPerTrip: 10000,
        earlyWithdrawalPenaltyPercent: 10,
        maxEarlyWithdrawalPenalty: 5000,
      });

      await driverSavingsService.recordContribution({
        tenantId,
        planId: insufficientPlan.id,
        tripId: 'insufficient-trip-001',
        amount: 5000,
      });

      await expect(
        driverSavingsService.earlyWithdrawal({
          tenantId,
          planId: insufficientPlan.id,
          amount: 999999,
          reason: 'Overdraft',
        }),
      ).rejects.toThrow('Insufficient savings');
    });

    it('should reject withdrawal from non-contributing plan', async () => {
      const emptyPlan = await driverSavingsService.createPlan({
        tenantId,
        driverCustomerId: 'savings-empty',
        targetAmount: 50000,
        contributionPerTrip: 1000,
      });

      await expect(
        driverSavingsService.earlyWithdrawal({
          tenantId,
          planId: emptyPlan.id,
          amount: 100,
        }),
      ).rejects.toThrow('Insufficient savings');
    });
  });

  describe('cancelPlan', () => {
    let cancelPlan: DriverSavingsPlan;

    beforeAll(async () => {
      cancelPlan = await driverSavingsService.createPlan({
        tenantId,
        driverCustomerId: 'savings-cancel-driver',
        targetAmount: 50000,
        contributionPerTrip: 1000,
      });
    });

    it('should cancel an active plan', async () => {
      const result = await driverSavingsService.cancelPlan(tenantId, cancelPlan.id, 'Changed mind');
      expect(result.status).toBe(SavingsPlanStatus.CANCELLED);
    });

    it('should allow creating a new plan after cancellation', async () => {
      const newPlan = await driverSavingsService.createPlan({
        tenantId,
        driverCustomerId: 'savings-cancel-driver',
        targetAmount: 75000,
        contributionPerTrip: 2000,
      });

      expect(newPlan.status).toBe(SavingsPlanStatus.ACTIVE);
      expect(newPlan.driverCustomerId).toBe('savings-cancel-driver');
    });

    it('should throw NotFound for non-existent plan', async () => {
      await expect(
        driverSavingsService.cancelPlan(tenantId, 'no-such-plan'),
      ).rejects.toThrow('not found');
    });
  });

  describe('getPlans', () => {
    it('should return all plans for tenant', async () => {
      const plans = await driverSavingsService.getPlans(tenantId);
      expect(plans.length).toBeGreaterThanOrEqual(6);
    });

    it('should filter plans by driver', async () => {
      const plans = await driverSavingsService.getPlans(tenantId, driverId);
      expect(plans.length).toBe(1);
      for (const plan of plans) {
        expect(plan.driverCustomerId).toBe(driverId);
      }
    });

    it('should return empty for non-existent driver', async () => {
      const plans = await driverSavingsService.getPlans(tenantId, 'no-such-driver');
      expect(plans.length).toBe(0);
    });

    it('should order plans by creation date descending', async () => {
      const plans = await driverSavingsService.getPlans(tenantId);
      for (let i = 1; i < plans.length; i++) {
        expect(plans[i - 1].createdAt >= plans[i].createdAt).toBe(true);
      }
    });
  });

  describe('getPlan', () => {
    it('should return plan by id', async () => {
      const plan = await driverSavingsService.getPlan(tenantId, activePlan.id);
      expect(plan.id).toBe(activePlan.id);
    });

    it('should throw NotFound for non-existent plan', async () => {
      await expect(
        driverSavingsService.getPlan(tenantId, 'no-such-plan'),
      ).rejects.toThrow('not found');
    });
  });

  describe('getSummary', () => {
    it('should return summary stats', async () => {
      const summary = await driverSavingsService.getSummary(tenantId);

      expect(summary.totalPlans).toBeGreaterThanOrEqual(6);
      expect(summary.activePlans).toBeGreaterThanOrEqual(2);
      expect(summary.totalSaved).toBeGreaterThan(0);
      expect(summary.totalTarget).toBeGreaterThan(0);
      expect(summary.totalPenalties).toBeGreaterThan(0);
    });

    it('should return zeroes for tenant with no plans', async () => {
      const summary = await driverSavingsService.getSummary('empty-tenant');
      expect(summary.totalPlans).toBe(0);
      expect(summary.activePlans).toBe(0);
      expect(summary.totalSaved).toBe(0);
    });
  });
});
