import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  RetryRecord,
  RetryRecordStatus,
  RetryTargetType,
} from './entities/retry-record.entity';
import { RetryEventsPublisher } from './retry-events.publisher';
import { RetryServiceService } from './retry-service.service';
import { SagaCompensationService } from './saga-compensation.service';

describe('RetryServiceService', () => {
  let service: RetryServiceService;
  let record: RetryRecord;
  const repo = {
    create: jest.fn((dto) => ({ id: 'retry-1', ...dto })),
    save: jest.fn((entity) => entity),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const eventsPublisher = {
    publishScheduled: jest.fn(),
    publishRetrying: jest.fn(),
    publishSucceeded: jest.fn(),
    publishFailed: jest.fn(),
    publishDeadLettered: jest.fn(),
    publishCompensating: jest.fn(),
    publishCompensated: jest.fn(),
    publishCompensationFailed: jest.fn(),
  };
  const sagaCompensationService = {
    compensate: jest.fn(),
  };

  beforeEach(async () => {
    record = {
      id: 'retry-1',
      targetType: RetryTargetType.BATCH_ITEM,
      targetId: 'item-1',
      operation: 'payments.internal-transfer',
      payload: { amount: 1000 },
      attemptCount: 0,
      maxAttempts: 5,
      status: RetryRecordStatus.PENDING,
      tenantId: 'tenant-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repo.findOne.mockResolvedValue(record);
    repo.save.mockImplementation((entity) => entity);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetryServiceService,
        {
          provide: getRepositoryToken(RetryRecord),
          useValue: repo,
        },
        {
          provide: RetryEventsPublisher,
          useValue: eventsPublisher,
        },
        {
          provide: SagaCompensationService,
          useValue: sagaCompensationService,
        },
      ],
    }).compile();

    service = module.get<RetryServiceService>(RetryServiceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a pending retry record due immediately', async () => {
    const saved = await service.createRetryRecord({
      targetType: RetryTargetType.BATCH_ITEM,
      targetId: 'item-1',
      operation: 'payments.internal-transfer',
      payload: { amount: 1000 },
      tenantId: 'tenant-1',
    });

    expect(saved.status).toBe(RetryRecordStatus.PENDING);
    expect(saved.attemptCount).toBe(0);
    expect(saved.maxAttempts).toBe(5);
    expect(saved.nextAttemptAt).toBeInstanceOf(Date);
    expect(eventsPublisher.publishScheduled).toHaveBeenCalledWith(saved);
  });

  it('schedules exponential backoff after a failure', async () => {
    const saved = await service.recordFailure(
      'retry-1',
      'temporary rail outage',
    );

    expect(saved.attemptCount).toBe(1);
    expect(saved.status).toBe(RetryRecordStatus.PENDING);
    expect(saved.lastError).toBe('temporary rail outage');
    expect(saved.nextAttemptAt!.getTime()).toBeGreaterThan(Date.now() + 25000);
    expect(eventsPublisher.publishFailed).toHaveBeenCalledWith(saved);
  });

  it('dead-letters when max attempts is reached', async () => {
    record.attemptCount = 4;

    const saved = await service.recordFailure('retry-1', 'maxed out');

    expect(saved.status).toBe(RetryRecordStatus.DEAD_LETTERED);
    expect(saved.attemptCount).toBe(5);
    expect(saved.nextAttemptAt).toBeUndefined();
    expect(eventsPublisher.publishDeadLettered).toHaveBeenCalledWith(saved);
  });

  it('compensates a failed record through the saga hook', async () => {
    sagaCompensationService.compensate.mockResolvedValue({
      reference: 'COMP-TX-item-1',
      payload: { action: 'TRANSACTION_REVERSAL' },
    });

    const saved = await service.compensate('retry-1', 'max retries exceeded');

    expect(saved.status).toBe(RetryRecordStatus.COMPENSATED);
    expect(saved.compensationReference).toBe('COMP-TX-item-1');
    expect(eventsPublisher.publishCompensating).toHaveBeenCalled();
    expect(eventsPublisher.publishCompensated).toHaveBeenCalledWith(saved);
  });

  it('returns dashboard totals grouped by status', async () => {
    repo.find.mockResolvedValue([
      {
        ...record,
        status: RetryRecordStatus.PENDING,
        nextAttemptAt: new Date(Date.now() - 1000),
      },
      { ...record, id: 'retry-2', status: RetryRecordStatus.DEAD_LETTERED },
    ]);

    const dashboard = await service.getDashboard('tenant-1');

    expect(dashboard.total).toBe(2);
    expect(dashboard.dueCount).toBe(1);
    expect(dashboard.deadLettered).toBe(1);
  });
});
