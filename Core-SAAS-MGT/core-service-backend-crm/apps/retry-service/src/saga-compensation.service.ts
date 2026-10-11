import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RetryRecord, RetryTargetType } from './entities/retry-record.entity';

export interface CompensationResult {
  reference: string;
  payload: Record<string, unknown>;
}

@Injectable()
export class SagaCompensationService {
  private readonly logger = new Logger(SagaCompensationService.name);

  constructor(private readonly configService: ConfigService) {}

  async compensate(
    record: RetryRecord,
    reason: string,
  ): Promise<CompensationResult> {
    if (record.targetType === RetryTargetType.BATCH_JOB) {
      return this.compensateBatchJob(record, reason);
    }

    if (
      record.targetType === RetryTargetType.PAYMENT ||
      record.targetType === RetryTargetType.BATCH_ITEM ||
      record.targetType === RetryTargetType.LEDGER_POSTING
    ) {
      return this.compensateTransaction(record, reason);
    }

    return {
      reference: `COMP-NOOP-${record.id}`,
      payload: {
        reason,
        action: 'NO_COMPENSATION_REQUIRED',
        targetType: record.targetType,
        targetId: record.targetId,
      },
    };
  }

  private async compensateBatchJob(
    record: RetryRecord,
    reason: string,
  ): Promise<CompensationResult> {
    const batchHost = this.configService.get<string>('BATCH_SERVICE_HOST');
    const batchPort = this.configService.get<number>('BATCH_SERVICE_PORT');
    const batchUrl = `http://${batchHost}:${batchPort}/batch/${record.targetId}`;
    const reversalResults: unknown[] = [];

    try {
      const response = await axios.get(batchUrl);
      /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
      const items = Array.isArray(response.data?.items)
        ? response.data.items
        : [];
      const completedItems = items.filter(
        (item) => item.status === 'COMPLETED' && item.transactionId,
      );
      /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */

      for (const item of completedItems) {
        reversalResults.push(
          await this.requestReversal(item.transactionId, record, reason),
        );
      }

      return {
        reference: `COMP-BATCH-${record.targetId}`,
        payload: {
          reason,
          action: 'BATCH_ALL_OR_NONE_REVERSAL',
          reversedCount: completedItems.length,
          reversalResults,
        },
      };
    } catch (error: unknown) {
      this.logger.error(
        `Batch compensation failed for ${record.targetId}: ${this.errorMessage(error)}`,
      );
      throw error;
    }
  }

  private async compensateTransaction(
    record: RetryRecord,
    reason: string,
  ): Promise<CompensationResult> {
    const transactionId =
      (record.payload?.transactionId as string | undefined) ||
      (record.payload?.paymentId as string | undefined) ||
      record.targetId;
    const reversal = await this.requestReversal(transactionId, record, reason);

    return {
      reference: `COMP-TX-${transactionId}`,
      payload: {
        reason,
        action: 'TRANSACTION_REVERSAL',
        transactionId,
        reversal,
      },
    };
  }

  private async requestReversal(
    transactionId: string,
    record: RetryRecord,
    reason: string,
  ): Promise<unknown> {
    const reversalHost = this.configService.get<string>(
      'REVERSAL_SERVICE_HOST',
    );
    const reversalPort = this.configService.get<number>(
      'REVERSAL_SERVICE_PORT',
    );
    const reversalUrl = `http://${reversalHost}:${reversalPort}/reversal`;

    const response = await axios.post(
      reversalUrl,
      {
        transactionId,
        reason: 'TECHNICAL_ERROR',
        reasonDescription: reason,
        requestedBy: 'retry-service',
        tenantId: record.tenantId,
      },
      { headers: { 'x-bypass-approval': 'true' } },
    );

    return response.data;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
