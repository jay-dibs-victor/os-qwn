import { Injectable, Logger } from '@nestjs/common';
import { ReversalRecord } from './entities/reversal-record.entity';

interface ReversalEventPayload {
  reversalId: string;
  originalTransactionId: string;
  reversalTransactionId?: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  tenantId: string;
  reason: string;
  requestedBy: string;
  occurredAt: string;
  reasonDescription?: string;
}

@Injectable()
export class ReversalEventsPublisher {
  private readonly logger = new Logger(ReversalEventsPublisher.name);
  private readonly eventLog: Array<{
    key: string;
    payload: ReversalEventPayload;
  }> = [];

  publishInitiated(record: ReversalRecord): void {
    this.emit('reversal.initiated', this.buildPayload(record));
  }

  publishCompleted(record: ReversalRecord): void {
    this.emit('reversal.completed', this.buildPayload(record));
  }

  publishFailed(record: ReversalRecord, reason: string): void {
    this.emit('reversal.failed', {
      ...this.buildPayload(record),
      reasonDescription: reason || record.reasonDescription,
    });
  }

  publishChargebackCreated(record: ReversalRecord): void {
    this.emit('reversal.chargeback.created', this.buildPayload(record));
  }

  private buildPayload(record: ReversalRecord): ReversalEventPayload {
    return {
      reversalId: record.id,
      originalTransactionId: record.originalTransactionId,
      reversalTransactionId: record.reversalTransactionId,
      type: record.type,
      status: record.status,
      amount: record.amount,
      currency: record.currency,
      tenantId: record.tenantId,
      reason: record.reason,
      requestedBy: record.requestedBy,
      occurredAt: new Date().toISOString(),
    };
  }

  private emit(routingKey: string, payload: ReversalEventPayload): void {
    this.eventLog.push({ key: routingKey, payload });
    this.logger.log(
      `[EVENT] ${routingKey} → reversalId=${payload.reversalId} tenant=${payload.tenantId}`,
    );
  }

  drainEvents(): Array<{ key: string; payload: ReversalEventPayload }> {
    return this.eventLog.splice(0, this.eventLog.length);
  }
}
