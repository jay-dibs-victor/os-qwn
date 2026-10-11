import { Entity, Column, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { Role } from './role.entity';

@Entity('user_roles')
export class UserRole extends AbstractEntity {
  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => Role)
  role: Role;

  @Index()
  @Column()
  tenantId: string;
}
