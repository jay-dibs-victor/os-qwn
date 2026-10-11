import { Entity, Column, Tree, TreeChildren, TreeParent } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum GlAccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum GlAccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

@Entity('gl_accounts')
@Tree('materialized-path')
export class GlAccount extends AbstractEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: GlAccountType,
  })
  type: GlAccountType;

  @Column({ default: GlAccountStatus.ACTIVE })
  status: string;

  @Column()
  tenantId: string;

  @TreeParent()
  parent: GlAccount;

  @TreeChildren()
  children: GlAccount[];

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  balance: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;
}
