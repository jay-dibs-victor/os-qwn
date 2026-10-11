import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum FraudFlagSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum FraudFlagStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  CONFIRMED = 'CONFIRMED',
  DISMISSED = 'DISMISSED',
}

@Entity('fraud_flags')
@Index(['tenantId', 'driverCustomerId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'severity'])
export class FraudFlag extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column()
  driverCustomerId: string;

  @Column({ nullable: true })
  riderCustomerId?: string;

  @Column({ nullable: true })
  tripId?: string;

  @Column({ type: 'text' })
  ruleName: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: FraudFlagSeverity,
    default: FraudFlagSeverity.MEDIUM,
  })
  severity: FraudFlagSeverity;

  @Column({
    type: 'enum',
    enum: FraudFlagStatus,
    default: FraudFlagStatus.OPEN,
  })
  status: FraudFlagStatus;

  @Column({ type: 'jsonb', nullable: true })
  evidence?: Record<string, any>;

  @Column({ nullable: true })
  reviewedById?: string;

  @Column({ nullable: true })
  reviewedAt?: Date;

  @Column({ type: 'text', nullable: true })
  reviewNote?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
