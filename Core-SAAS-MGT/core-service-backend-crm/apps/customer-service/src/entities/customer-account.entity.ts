import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum CustomerAccountKind {
  RIDER = 'RIDER',
  DRIVER = 'DRIVER',
  PARTNER = 'PARTNER',
}

export enum CustomerProfileType {
  INDIVIDUAL = 'INDIVIDUAL',
  ORGANIZATION = 'ORGANIZATION',
}

@Entity('customer_accounts')
export class CustomerAccount extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 20 })
  kind: CustomerAccountKind;

  @Column({ type: 'varchar', length: 20 })
  profileType: CustomerProfileType;

  @Column()
  name: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: 'ACTIVE' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, unknown>;
}
