import { Entity, Column, Index, OneToMany } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { ApprovalStep } from './approval-step.entity';

export enum ApprovalRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('approval_requests')
export class ApprovalRequest extends AbstractEntity {
  @Column()
  method!: string;

  @Column()
  path!: string;

  @Column({ type: 'json' })
  payload!: any;

  @Column()
  initiatorId!: string;

  @Column({ nullable: true })
  requiredPermission?: string;

  @Column({
    type: 'enum',
    enum: ApprovalRequestStatus,
    default: ApprovalRequestStatus.PENDING,
  })
  status!: ApprovalRequestStatus;

  @OneToMany(() => ApprovalStep, (step) => step.request)
  steps!: ApprovalStep[];

  @Index()
  @Column()
  tenantId!: string;
}
