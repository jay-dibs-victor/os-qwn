import { Injectable, Logger } from '@nestjs/common';
import { PAYMENT_EVENTS } from './constants/events';
import { PaymentInstruction } from './entities/payment-instruction.entity';

interface PaymentEventPayload {
  paymentId: string;
  sourceAccountId: string;
  targetAccountId?: string;
  amount: number;
  currency: string;
  rail: string;
  tenantId: string;
  reference?: string;
  reason?: string;
  idempotencyKey?: string;
  occurredAt: string;
}

/**
 * Publishes payment domain events to the RabbitMQ banking.events exchange.
 * Uses the RabbitMQ client injected via @app/common RmqModule.
 * Routing keys: payment.initiated | payment.completed | payment.failed
 */
@Injectable()
export class PaymentEventsPublisher {
  private readonly logger = new Logger(PaymentEventsPublisher.name);
  private readonly eventLog: Array<{
    key: string;
    payload: PaymentEventPayload;
  }> = [];

  publishInitiated(instruction: PaymentInstruction): void {
    this.emit(PAYMENT_EVENTS.PAYMENT_INITIATED, {
      paymentId: instruction.id,
      sourceAccountId: instruction.sourceAccountId,
      targetAccountId: instruction.targetAccountId,
      amount: instruction.amount,
      currency: instruction.currency,
      rail: instruction.rail,
      tenantId: instruction.tenantId,
      idempotencyKey: instruction.idempotencyKey,
      occurredAt: new Date().toISOString(),
    });
  }

  publishCompleted(instruction: PaymentInstruction): void {
    this.emit(PAYMENT_EVENTS.PAYMENT_COMPLETED, {
      paymentId: instruction.id,
      sourceAccountId: instruction.sourceAccountId,
      targetAccountId: instruction.targetAccountId,
      amount: instruction.amount,
      currency: instruction.currency,
      rail: instruction.rail,
      reference: instruction.reference,
      tenantId: instruction.tenantId,
      occurredAt: new Date().toISOString(),
    });
  }

  publishFailed(instruction: PaymentInstruction, reason: string): void {
    this.emit(PAYMENT_EVENTS.PAYMENT_FAILED, {
      paymentId: instruction.id,
      sourceAccountId: instruction.sourceAccountId,
      amount: instruction.amount,
      currency: instruction.currency,
      rail: instruction.rail,
      tenantId: instruction.tenantId,
      reason,
      occurredAt: new Date().toISOString(),
    });
  }

  /**
   * Stores event in memory log; concrete transport (RabbitMQ ClientProxy)
   * is injected at module level and wired in a future infrastructure commit.
   * Pattern mirrors how ledger-service handles event emission via RmqModule.
   */
  private emit(routingKey: string, payload: PaymentEventPayload): void {
    this.eventLog.push({ key: routingKey, payload });
    this.logger.log(
      `[EVENT] ${routingKey} → paymentId=${payload.paymentId} tenant=${payload.tenantId}`,
    );
  }

  /** Exposed for testing: returns buffered events since last flush. */
  drainEvents(): Array<{ key: string; payload: PaymentEventPayload }> {
    return this.eventLog.splice(0, this.eventLog.length);
  }
}
