import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum ScheduleFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

@Entity('scheduled_payments')
export class ScheduledPayment extends AbstractEntity {
  @Column()
  sourceAccountId: string;

  @Column()
  targetAccountId: string;

  @Column({ nullable: true })
  targetBankCode?: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'enum', enum: ScheduleFrequency })
  frequency: ScheduleFrequency;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt?: Date;

  @Column({ type: 'timestamp' })
  nextRunAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  @Index()
  tenantId: string;
}
