import { AbstractEntity } from '@app/common';
import { Column, Entity } from 'typeorm';
import { ComplianceSeverity } from './aml-rule.entity';

@Entity('compliance_alerts')
export class ComplianceAlert extends AbstractEntity {
  @Column()
  transactionId: string;

  @Column()
  customerId: string;

  @Column()
  ruleId: string;

  @Column()
  ruleName: string;

  @Column({ type: 'varchar', length: 20 })
  severity: ComplianceSeverity;

  @Column({ type: 'varchar', length: 20, default: 'OPEN' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  evidence?: Record<string, unknown>;

  @Column({ type: 'timestamptz', nullable: true })
  retentionUntil?: Date;

  @Column()
  tenantId: string;
}
