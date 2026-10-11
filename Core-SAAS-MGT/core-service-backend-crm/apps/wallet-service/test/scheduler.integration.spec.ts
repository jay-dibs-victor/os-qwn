import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import axios from 'axios';
import { WalletServiceModule } from '../src/wallet-service.module';
import { RemittanceSchedulerService } from '../src/services/remittance-scheduler.service';
import { SavingsDisbursementSchedulerService } from '../src/services/savings-disbursement-scheduler.service';
import { RemittanceSchedule, RemittanceCycle, RemittanceStatus } from '../src/entities/remittance-schedule.entity';
import { DriverSavingsPlan, SavingsPlanStatus } from '../src/entities/driver-savings-plan.entity';
import { DriverSavingsService } from '../src/services/driver-savings.service';
import { RemittanceService } from '../src/services/remittance.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SchedulerService Integration', () => {
  let app: INestApplication;
  let remittanceScheduler: RemittanceSchedulerService;
  let savingsScheduler: SavingsDisbursementSchedulerService;
  let remittanceService: RemittanceService;
  let driverSavingsService: DriverSavingsService;
  let remittanceRepo: Repository<RemittanceSchedule>;
  let savingsRepo: Repository<DriverSavingsPlan>;

  const tenantId = 'scheduler-test-tenant';

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

    remittanceScheduler = app.get<RemittanceSchedulerService>(RemittanceSchedulerService);
    savingsScheduler = app.get<SavingsDisbursementSchedulerService>(SavingsDisbursementSchedulerService);
    remittanceService = app.get<RemittanceService>(RemittanceService);
    driverSavingsService = app.get<DriverSavingsService>(DriverSavingsService);
    remittanceRepo = app.get<Repository<RemittanceSchedule>>(getRepositoryToken(RemittanceSchedule));
    savingsRepo = app.get<Repository<DriverSavingsPlan>>(getRepositoryToken(DriverSavingsPlan));
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('RemittanceScheduler', () => {
    beforeAll(async () => {
      const pastDate = new Date('2020-06-01');
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);

      for (let i = 0; i < 3; i++) {
        await remittanceService.createSchedule({
          tenantId,
          partnerId: `sched-overdue-${i}`,
          cycle: RemittanceCycle.WEEKLY,
          amount: 25000 * (i + 1),
          dueDate: pastDate,
        });
      }

      await remittanceService.createSchedule({
        tenantId,
        partnerId: 'sched-future',
        cycle: RemittanceCycle.MONTHLY,
        amount: 100000,
        dueDate: futureDate,
      });
    });

    describe('processOverdueRemittances', () => {
      it('should process all overdue pending schedules', async () => {
        const result = await remittanceScheduler.processOverdueRemittances(tenantId);

        expect(result.length).toBeGreaterThanOrEqual(3);
        for (const schedule of result) {
          expect(schedule.status).toBe(RemittanceStatus.COMPLETED);
        }
      });

      it('should mark overdue schedules as completed', async () => {
        const overdue = await remittanceRepo.find({
          where: { tenantId, partnerId: 'sched-overdue-0' },
        });
        expect(overdue.length).toBeGreaterThanOrEqual(1);
        for (const s of overdue) {
          expect(s.status).toBe(RemittanceStatus.COMPLETED);
        }
      });

      it('should skip future-dated schedules', async () => {
        const pending = await remittanceRepo.find({
          where: { tenantId, status: RemittanceStatus.PENDING },
        });
        expect(pending.length).toBeGreaterThanOrEqual(1);
        expect(pending.every(s => s.partnerId === 'sched-future')).toBe(true);
      });

      it('should return empty array for tenant with no overdue', async () => {
        const result = await remittanceScheduler.processOverdueRemittances('empty-tenant');
        expect(result.length).toBe(0);
      });
    });
  });

  describe('SavingsDisbursementScheduler', () => {
    const matureDriverId = 'savings-mature-driver';
    const weeklyDriverId = 'savings-weekly-driver';
    const monthlyDriverId = 'savings-monthly-driver';

    beforeAll(async () => {
      const maturePlan = await driverSavingsService.createPlan({
        tenantId,
        driverCustomerId: matureDriverId,
        targetAmount: 10000,
        contributionPerTrip: 10000,
        earlyWithdrawalPenaltyPercent: 5,
        maxEarlyWithdrawalPenalty: 1000,
      });

      // Hit target to make it mature
      await driverSavingsService.recordContribution({
        tenantId,
        planId: maturePlan.id,
        tripId: 'sched-mature-trip',
        amount: 10000,
      });

      // Plans for weekly disbursement
      const weeklyPlan = await driverSavingsService.createPlan({
        tenantId,
        driverCustomerId: weeklyDriverId,
        targetAmount: 500000,
        contributionPerTrip: 10000,
      });
      await driverSavingsService.recordContribution({
        tenantId,
        planId: weeklyPlan.id,
        tripId: 'sched-weekly-trip-1',
        amount: 10000,
      });

      // Plans for monthly disbursement
      const monthlyPlan = await driverSavingsService.createPlan({
        tenantId,
        driverCustomerId: monthlyDriverId,
        targetAmount: 1000000,
        contributionPerTrip: 50000,
      });
      await driverSavingsService.recordContribution({
        tenantId,
        planId: monthlyPlan.id,
        tripId: 'sched-monthly-trip-1',
        amount: 50000,
      });
    });

    describe('processMaturePlans', () => {
      it('should disburse all target-met plans', async () => {
        const result = await savingsScheduler.processMaturePlans(tenantId);
        expect(result.disbursed).toBeGreaterThanOrEqual(1);
        expect(result.failed).toBe(0);
      });

      it('should mark mature plans as withdrawn', async () => {
        const maturePlans = await savingsRepo.find({
          where: { tenantId, driverCustomerId: matureDriverId },
        });
        const plan = maturePlans[0];
        expect(plan.status).toBe(SavingsPlanStatus.EARLY_WITHDRAWN);
        expect(Number(plan.currentAmount)).toBe(0);
      });

      it('should return zero for tenant with no mature plans', async () => {
        const result = await savingsScheduler.processMaturePlans('empty-tenant');
        expect(result.disbursed).toBe(0);
        expect(result.failed).toBe(0);
      });
    });

    describe('processWeeklyDisbursements', () => {
      it('should process weekly savings disbursements', async () => {
        const result = await savingsScheduler.processWeeklyDisbursements(tenantId);
        expect(result.disbursed).toBeGreaterThanOrEqual(0);
        expect(result.failed).toBe(0);
      });
    });

    describe('processMonthlyDisbursements', () => {
      it('should process monthly savings disbursements', async () => {
        const result = await savingsScheduler.processMonthlyDisbursements(tenantId);
        expect(result.disbursed).toBeGreaterThanOrEqual(0);
        expect(result.failed).toBe(0);
      });
    });
  });
});
