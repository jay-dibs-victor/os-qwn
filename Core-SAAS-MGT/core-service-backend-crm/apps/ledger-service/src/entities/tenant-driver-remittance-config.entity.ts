import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum RemittanceCycle {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  COMMISSION_BASED = 'COMMISSION_BASED',
}

export enum RemittanceType {
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  PERCENTAGE_OF_FARE = 'PERCENTAGE_OF_FARE',
  PERCENTAGE_OF_EARNINGS = 'PERCENTAGE_OF_EARNINGS',
}

@Entity('tenant_driver_remittance_configs')
@Index(['tenantId', 'driverCustomerId'], { unique: true })
@Index(['tenantId', 'isActive'])
export class TenantDriverRemittanceConfig extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column({ nullable: true })
  driverCustomerId?: string;

  @Column({ type: 'enum', enum: RemittanceCycle, default: RemittanceCycle.COMMISSION_BASED })
  remittanceCycle: RemittanceCycle;

  @Column({ type: 'enum', enum: RemittanceType, default: RemittanceType.PERCENTAGE_OF_FARE })
  remittanceType: RemittanceType;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  remittanceValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ type: 'int', default: 1 })
  dayOfWeek: number;

  @Column({ type: 'int', default: 1 })
  dayOfMonth: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  effectiveFrom?: Date;

  @Column({ type: 'timestamp', nullable: true })
  effectiveTo?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
