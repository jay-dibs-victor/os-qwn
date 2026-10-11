import { Entity, Column, Index, ManyToMany, JoinTable } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role extends AbstractEntity {
  @Index()
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Index()
  @Column()
  tenantId: string;

  @ManyToMany(() => Permission)
  @JoinTable({ name: 'role_permissions' })
  permissions: Permission[];
}
