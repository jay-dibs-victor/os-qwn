import { Entity, Column, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { ApprovalRequest } from './approval-request.entity';

@Entity('approval_steps')
export class ApprovalStep extends AbstractEntity {
  @ManyToOne(() => ApprovalRequest, (req) => req.steps)
  request!: ApprovalRequest;

  @Column()
  level!: number;

  @Column()
  approverId!: string;

  @Column({ nullable: true })
  comment?: string;

  @Index()
  @Column()
  tenantId!: string;
}
