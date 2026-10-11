import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import axios from 'axios';
import { WalletServiceModule } from '../src/wallet-service.module';
import { RemittanceService } from '../src/services/remittance.service';
import { RemittanceSchedule, RemittanceCycle, RemittanceStatus } from '../src/entities/remittance-schedule.entity';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RemittanceService Integration', () => {
  let app: INestApplication;
  let remittanceService: RemittanceService;
  let remittanceRepo: Repository<RemittanceSchedule>;

  const tenantId = 'remit-test-tenant';
  const partnerId = 'remit-partner-1';
  let createdSchedule: RemittanceSchedule;

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

    remittanceService = app.get<RemittanceService>(RemittanceService);
    remittanceRepo = app.get<Repository<RemittanceSchedule>>(getRepositoryToken(RemittanceSchedule));
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('createSchedule', () => {
    it('should create a daily remittance schedule', async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const schedule = await remittanceService.createSchedule({
        tenantId,
        partnerId,
        cycle: RemittanceCycle.DAILY,
        amount: 50000,
        dueDate: nextWeek,
      });

      expect(schedule).toBeDefined();
      expect(schedule.tenantId).toBe(tenantId);
      expect(schedule.partnerId).toBe(partnerId);
      expect(schedule.cycle).toBe(RemittanceCycle.DAILY);
      expect(Number(schedule.amount)).toBe(50000);
      expect(schedule.status).toBe(RemittanceStatus.PENDING);
      expect(schedule.auditTrail).toBeDefined();
      expect(schedule.auditTrail!.length).toBeGreaterThanOrEqual(1);
      expect(schedule.auditTrail![0].event).toBe('SCHEDULE_CREATED');

      createdSchedule = schedule;
    });

    it('should create a weekly remittance schedule', async () => {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);

      const schedule = await remittanceService.createSchedule({
        tenantId,
        partnerId: 'remit-partner-2',
        cycle: RemittanceCycle.WEEKLY,
        amount: 100000,
        dueDate: nextMonth,
      });

      expect(schedule.cycle).toBe(RemittanceCycle.WEEKLY);
      expect(Number(schedule.amount)).toBe(100000);
    });

    it('should create a monthly remittance schedule', async () => {
      const future = new Date();
      future.setDate(future.getDate() + 60);

      const schedule = await remittanceService.createSchedule({
        tenantId,
        partnerId: 'remit-partner-3',
        cycle: RemittanceCycle.MONTHLY,
        amount: 500000,
        dueDate: future,
      });

      expect(schedule.cycle).toBe(RemittanceCycle.MONTHLY);
      expect(Number(schedule.amount)).toBe(500000);
    });
  });

  describe('getAllSchedules', () => {
    it('should list all schedules for tenant in desc order', async () => {
      const schedules = await remittanceService.getAllSchedules(tenantId);
      expect(schedules.length).toBe(3);
    });

    it('should return empty for non-existent tenant', async () => {
      const schedules = await remittanceService.getAllSchedules('no-such-tenant');
      expect(schedules.length).toBe(0);
    });
  });

  describe('getPendingSchedules', () => {
    it('should return only pending schedules', async () => {
      const pending = await remittanceService.getPendingSchedules(tenantId);
      expect(pending.length).toBe(3);
      for (const s of pending) {
        expect(s.status).toBe(RemittanceStatus.PENDING);
      }
    });

    it('should sort by due date ascending', async () => {
      const pending = await remittanceService.getPendingSchedules(tenantId);
      for (let i = 1; i < pending.length; i++) {
        expect(new Date(pending[i - 1].dueDate) <= new Date(pending[i].dueDate)).toBe(true);
      }
    });
  });

  describe('getSchedule', () => {
    it('should return a schedule by id', async () => {
      const schedule = await remittanceService.getSchedule(tenantId, createdSchedule.id);
      expect(schedule.id).toBe(createdSchedule.id);
    });

    it('should throw NotFoundException for non-existent schedule', async () => {
      await expect(
        remittanceService.getSchedule(tenantId, 'no-such-id'),
      ).rejects.toThrow('not found');
    });
  });

  describe('processSchedule', () => {
    it('should process a pending schedule to completion', async () => {
      const result = await remittanceService.processSchedule(tenantId, createdSchedule.id, 'test-actor');

      expect(result.status).toBe(RemittanceStatus.COMPLETED);
      expect(result.processedBy).toBe('test-actor');
      expect(result.processedAt).toBeDefined();
      expect(Number(result.processedAmount)).toBe(Number(createdSchedule.amount));
    });

    it('should fail when processing already completed schedule', async () => {
      await expect(
        remittanceService.processSchedule(tenantId, createdSchedule.id, 'test-actor'),
      ).rejects.toThrow('not PENDING');
    });

    it('should throw NotFound for non-existent schedule', async () => {
      await expect(
        remittanceService.processSchedule(tenantId, 'no-such-id'),
      ).rejects.toThrow('not found');
    });

    it('should update audit trail with processing events', async () => {
      const schedule = await remittanceService.getSchedule(tenantId, createdSchedule.id);
      const events = schedule.auditTrail!.map(e => e.event);
      expect(events).toContain('PROCESSING_STARTED');
      expect(events).toContain('PROCESSING_COMPLETED');
    });
  });

  describe('processDueSchedules', () => {
    it('should process all due (overdue) schedules', async () => {
      const pastDate = new Date('2020-01-01');
      await remittanceService.createSchedule({
        tenantId,
        partnerId: 'remit-overdue',
        cycle: RemittanceCycle.DAILY,
        amount: 25000,
        dueDate: pastDate,
      });

      const results = await remittanceService.processDueSchedules(tenantId, 'overdue-actor');
      const overdueResult = results.find(r => r.partnerId === 'remit-overdue');
      expect(overdueResult).toBeDefined();
      expect(overdueResult!.status).toBe(RemittanceStatus.COMPLETED);
      expect(overdueResult!.processedBy).toBe('overdue-actor');
    });
  });

  describe('adminOverride', () => {
    let overrideSchedule: RemittanceSchedule;

    beforeAll(async () => {
      const future = new Date();
      future.setDate(future.getDate() + 14);
      overrideSchedule = await remittanceService.createSchedule({
        tenantId,
        partnerId: 'remit-override',
        cycle: RemittanceCycle.WEEKLY,
        amount: 75000,
        dueDate: future,
      });
    });

    it('should apply admin override with reason', async () => {
      const result = await remittanceService.adminOverride({
        tenantId,
        scheduleId: overrideSchedule.id,
        reason: 'Partner requested extension',
        actor: 'admin-1',
        releaseAmount: 50000,
      });

      expect(result.status).toBe(RemittanceStatus.ADMIN_OVERRIDE);
      expect(result.isAdminOverride).toBe(true);
      expect(result.overrideReason).toBe('Partner requested extension');
      expect(result.processedBy).toBe('admin-1');
      expect(Number(result.processedAmount)).toBe(50000);
    });

    it('should update audit trail with override event', async () => {
      const schedule = await remittanceService.getSchedule(tenantId, overrideSchedule.id);
      const overrideEvent = schedule.auditTrail!.find(e => e.event === 'ADMIN_OVERRIDE');
      expect(overrideEvent).toBeDefined();
      expect(overrideEvent!.actor).toBe('admin-1');
      expect(overrideEvent!.details.reason).toBe('Partner requested extension');
    });

    it('should throw NotFound for non-existent schedule', async () => {
      await expect(
        remittanceService.adminOverride({
          tenantId,
          scheduleId: 'no-such-id',
          reason: 'test',
          actor: 'admin',
        }),
      ).rejects.toThrow('not found');
    });
  });

  describe('getSummary', () => {
    it('should return correct summary statistics', async () => {
      const summary = await remittanceService.getSummary(tenantId);

      expect(summary.totalSchedules).toBeGreaterThanOrEqual(5);
      expect(summary.pendingCount).toBeGreaterThanOrEqual(2);
      expect(summary.completedCount).toBeGreaterThanOrEqual(1);
      expect(summary.totalAmount).toBeGreaterThan(0);
      expect(summary.totalProcessed).toBeGreaterThan(0);
      expect(summary.overdueCount).toBeGreaterThanOrEqual(0);
    });

    it('should return zeroes for tenant with no schedules', async () => {
      const summary = await remittanceService.getSummary('empty-tenant');
      expect(summary.totalSchedules).toBe(0);
      expect(summary.pendingCount).toBe(0);
      expect(summary.totalAmount).toBe(0);
    });
  });
});
