import { Injectable, Logger } from '@nestjs/common';
import { RetryRecord } from './entities/retry-record.entity';

interface RetryEventPayload {
  retryId: string;
  targetType: string;
  targetId: string;
  operation: string;
  attemptCount: number;
  maxAttempts: number;
  status: string;
  tenantId: string;
  occurredAt: string;
  error?: string;
}

@Injectable()
export class RetryEventsPublisher {
  private readonly logger = new Logger(RetryEventsPublisher.name);
  private readonly eventLog: Array<{
    key: string;
    payload: RetryEventPayload;
  }> = [];

  publishScheduled(record: RetryRecord): void {
    this.emit('retry.scheduled', this.buildPayload(record));
  }

  publishRetrying(record: RetryRecord): void {
    this.emit('retry.retrying', this.buildPayload(record));
  }

  publishSucceeded(record: RetryRecord): void {
    this.emit('retry.succeeded', this.buildPayload(record));
  }

  publishFailed(record: RetryRecord): void {
    this.emit('retry.failed', this.buildPayload(record));
  }

  publishDeadLettered(record: RetryRecord): void {
    this.emit('retry.dead_lettered', this.buildPayload(record));
  }

  publishCompensating(record: RetryRecord): void {
    this.emit('retry.compensating', this.buildPayload(record));
  }

  publishCompensated(record: RetryRecord): void {
    this.emit('retry.compensated', this.buildPayload(record));
  }

  publishCompensationFailed(record: RetryRecord): void {
    this.emit('retry.compensation_failed', this.buildPayload(record));
  }

  private buildPayload(record: RetryRecord): RetryEventPayload {
    return {
      retryId: record.id,
      targetType: record.targetType,
      targetId: record.targetId,
      operation: record.operation ?? 'unknown',
      attemptCount: record.attemptCount,
      maxAttempts: record.maxAttempts,
      status: record.status,
      tenantId: record.tenantId,
      occurredAt: new Date().toISOString(),
    };
  }

  private emit(routingKey: string, payload: RetryEventPayload): void {
    this.eventLog.push({ key: routingKey, payload });
    this.logger.log(
      `[EVENT] ${routingKey} → retryId=${payload.retryId} tenant=${payload.tenantId}`,
    );
  }
}
