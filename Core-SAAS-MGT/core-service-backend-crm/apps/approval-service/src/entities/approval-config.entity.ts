import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export interface ApprovalLevel {
  level: number;
  allowedUserIds?: string[];
  allowedRoleIds?: string[];
}

@Entity('approval_configs')
export class ApprovalConfig extends AbstractEntity {
  @Index()
  @Column()
  method!: string;

  @Index()
  @Column()
  path!: string;

  @Column({ default: true })
  isEnabled!: boolean;

  @Column({ nullable: true })
  requiredPermission?: string;

  @Column({ type: 'json' })
  levels!: ApprovalLevel[];

  @Index()
  @Column()
  tenantId!: string;
}
