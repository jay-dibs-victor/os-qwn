import { AbstractEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

export enum AmlRuleType {
  AMOUNT_THRESHOLD = 'AMOUNT_THRESHOLD',
  SANCTIONS = 'SANCTIONS',
  VELOCITY = 'VELOCITY',
  COUNTRY = 'COUNTRY',
}

export enum ComplianceSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('aml_rules')
export class AmlRule extends AbstractEntity {
  @Column()
  name: string;

  @Column({ type: 'varchar', length: 30 })
  type: AmlRuleType;

  @Column({ type: 'varchar', length: 20, default: ComplianceSeverity.MEDIUM })
  severity: ComplianceSeverity;

  @Column({ type: 'jsonb', nullable: true })
  conditions?: Record<string, unknown>;

  @Column({ default: true })
  isEnabled: boolean;

  @Column()
  tenantId: string;
}
