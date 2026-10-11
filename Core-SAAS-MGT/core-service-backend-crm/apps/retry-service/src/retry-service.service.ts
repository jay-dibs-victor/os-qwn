import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RetryRecord,
  RetryRecordStatus,
  RetryTargetType,
} from './entities/retry-record.entity';
import { RetryEventsPublisher } from './retry-events.publisher';
import { SagaCompensationService } from './saga-compensation.service';

interface CreateRetryRecordDto {
  targetType: RetryTargetType;
  targetId: string;
  operation: string;
  payload: Record<string, unknown>;
  tenantId: string;
}

interface DashboardTotals {
  total: number;
  dueCount: number;
  deadLettered: number;
}

@Injectable()
export class RetryServiceService {
  private readonly logger = new Logger(RetryServiceService.name);

  constructor(
    @InjectRepository(RetryRecord)
    private readonly retryRepo: Repository<RetryRecord>,
    private readonly eventsPublisher: RetryEventsPublisher,
    private readonly sagaCompensationService: SagaCompensationService,
  ) {}

  async createRetryRecord(dto: CreateRetryRecordDto): Promise<RetryRecord> {
    const record = this.retryRepo.create({
      ...dto,
      attemptCount: 0,
      maxAttempts: 5,
      status: RetryRecordStatus.PENDING,
      nextAttemptAt: new Date(),
    });
    const saved = await this.retryRepo.save(record);
    this.eventsPublisher.publishScheduled(saved);
    return saved;
  }

  async recordFailure(
    id: string,
    error: string,
  ): Promise<RetryRecord> {
    const record = await this.retryRepo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Retry record ${id} not found`);
    }

    record.attemptCount += 1;
    record.lastError = error;

    if (record.attemptCount >= record.maxAttempts) {
      record.status = RetryRecordStatus.DEAD_LETTERED;
      record.nextAttemptAt = undefined;
      const saved = await this.retryRepo.save(record);
      this.eventsPublisher.publishDeadLettered(saved);
      return saved;
    }

    record.status = RetryRecordStatus.PENDING;
    const delay = Math.pow(2, record.attemptCount + 1) * 10000;
    record.nextAttemptAt = new Date(Date.now() + delay);
    const saved = await this.retryRepo.save(record);
    this.eventsPublisher.publishFailed(saved);
    return saved;
  }

  async compensate(
    id: string,
    reason: string,
  ): Promise<RetryRecord> {
    const record = await this.retryRepo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Retry record ${id} not found`);
    }

    this.eventsPublisher.publishCompensating(record);

    const result = await this.sagaCompensationService.compensate(record, reason);

    record.status = RetryRecordStatus.COMPENSATED;
    record.compensationReference = result.reference;
    const saved = await this.retryRepo.save(record);
    this.eventsPublisher.publishCompensated(saved);
    return saved;
  }

  async getDashboard(tenantId: string): Promise<DashboardTotals> {
    const records = await this.retryRepo.find({ where: { tenantId } });
    const total = records.length;
    const dueCount = records.filter(
      (r) =>
        r.status === RetryRecordStatus.PENDING &&
        r.nextAttemptAt &&
        r.nextAttemptAt <= new Date(),
    ).length;
    const deadLettered = records.filter(
      (r) => r.status === RetryRecordStatus.DEAD_LETTERED,
    ).length;
    return { total, dueCount, deadLettered };
  }
}
