import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum CommissionRuleType {
  PLATFORM = 'PLATFORM',
  PARTNER = 'PARTNER',
  DRIVER = 'DRIVER',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export enum CommissionCalculationMethod {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
  TIERED = 'TIERED',
}

@Entity('commission_rules')
@Index(['tenantId', 'ruleType', 'isActive'])
export class CommissionRule extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column({ type: 'enum', enum: CommissionRuleType })
  ruleType: CommissionRuleType;

  @Column({ type: 'enum', enum: CommissionCalculationMethod, default: CommissionCalculationMethod.PERCENTAGE })
  calculationMethod: CommissionCalculationMethod;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.10 })
  rate: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  flatAmount?: number;

  @Column({ type: 'jsonb', nullable: true })
  tierConfig?: Array<{
    minAmount: number;
    maxAmount: number;
    rate: number;
    flatAmount?: number;
  }>;

  @Column({ nullable: true })
  partnerId?: string;

  @Column({ nullable: true })
  driverCategory?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
