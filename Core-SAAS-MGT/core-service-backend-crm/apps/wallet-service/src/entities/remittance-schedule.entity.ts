import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum RemittanceCycle {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum RemittanceStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ADMIN_OVERRIDE = 'ADMIN_OVERRIDE',
}

@Entity('remittance_schedules')
@Index(['tenantId', 'partnerId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'dueDate'])
export class RemittanceSchedule extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column()
  partnerId: string;

  @Column({ type: 'enum', enum: RemittanceCycle })
  cycle: RemittanceCycle;

  @Column({ type: 'enum', enum: RemittanceStatus, default: RemittanceStatus.PENDING })
  status: RemittanceStatus;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  processedAmount: number;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ nullable: true })
  processedBy?: string;

  @Column({ nullable: true })
  approvalId?: string;

  @Column({ type: 'boolean', default: false })
  isAdminOverride: boolean;

  @Column({ nullable: true })
  overrideReason?: string;

  @Column({ nullable: true })
  journalEntryId?: string;

  @Column({ type: 'jsonb', nullable: true })
  auditTrail?: Array<{
    event: string;
    timestamp: string;
    actor: string;
    details: Record<string, any>;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
