import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

@Entity('permissions')
export class Permission extends AbstractEntity {
  @Index()
  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Index()
  @Column()
  tenantId: string;
}
