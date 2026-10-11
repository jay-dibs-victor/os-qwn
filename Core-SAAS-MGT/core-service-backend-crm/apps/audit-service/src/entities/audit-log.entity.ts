import { AbstractEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

export enum AuditOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
}

@Entity('audit_logs')
export class AuditLog extends AbstractEntity {
  @Column()
  eventType: string;

  @Column()
  tenantId: string;

  @Column()
  actorId: string;

  @Column()
  actorType: string;

  @Column()
  action: string;

  @Column()
  resourceType: string;

  @Column()
  resourceId: string;

  @Column({ type: 'varchar', length: 30, default: AuditOutcome.SUCCESS })
  outcome: AuditOutcome;

  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, unknown>;

  @Column({ type: 'varchar', nullable: true })
  previousHash?: string;

  @Column({ type: 'varchar', nullable: true })
  hash?: string;

  @Column({ type: 'varchar', nullable: true })
  correlationId?: string;
}
