import { AbstractEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

export enum RetryTargetType {
  PAYMENT = 'PAYMENT',
  LEDGER_POSTING = 'LEDGER_POSTING',
  BATCH_JOB = 'BATCH_JOB',
  BATCH_ITEM = 'BATCH_ITEM',
}

export enum RetryRecordStatus {
  PENDING = 'PENDING',
  RETRYING = 'RETRYING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  DEAD_LETTERED = 'DEAD_LETTERED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
  COMPENSATION_FAILED = 'COMPENSATION_FAILED',
}

@Entity('retry_records')
export class RetryRecord extends AbstractEntity {
  @Column()
  tenantId: string;

  @Column({ type: 'varchar', length: 30 })
  targetType: RetryTargetType;

  @Column()
  targetId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  operation?: string;

  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, unknown>;

  @Column({ default: 0 })
  attemptCount: number;

  @Column({ default: 5 })
  maxAttempts: number;

  @Column({ type: 'varchar', length: 30, default: RetryRecordStatus.PENDING })
  status: RetryRecordStatus;

  @Column({ type: 'text', nullable: true })
  lastError?: string;

  @Column({ type: 'timestamp', nullable: true })
  nextAttemptAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  compensationReference?: string;
}
