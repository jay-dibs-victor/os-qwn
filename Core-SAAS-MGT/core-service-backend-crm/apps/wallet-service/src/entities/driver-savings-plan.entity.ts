import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum SavingsPlanStatus {
  ACTIVE = 'ACTIVE',
  TARGET_MET = 'TARGET_MET',
  CANCELLED = 'CANCELLED',
  EARLY_WITHDRAWN = 'EARLY_WITHDRAWN',
}

@Entity('driver_savings_plans')
@Index(['tenantId', 'driverCustomerId'])
@Index(['tenantId', 'status'])
export class DriverSavingsPlan extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column()
  driverCustomerId: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  targetAmount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  currentAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  contributionPerTrip: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  earlyWithdrawalPenaltyPercent: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  maxEarlyWithdrawalPenalty: number;

  @Column({ type: 'enum', enum: SavingsPlanStatus, default: SavingsPlanStatus.ACTIVE })
  status: SavingsPlanStatus;

  @Column({ type: 'timestamp', nullable: true })
  targetDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'int', default: 0 })
  totalContributions: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  totalPenaltiesPaid: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  totalWithdrawn: number;

  @Column({ type: 'jsonb', nullable: true })
  contributionHistory?: Array<{
    tripId: string;
    amount: number;
    timestamp: string;
    runningTotal: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
