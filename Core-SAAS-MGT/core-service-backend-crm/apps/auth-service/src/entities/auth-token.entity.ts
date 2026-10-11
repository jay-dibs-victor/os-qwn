import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { User } from './user.entity';

@Entity()
export class AuthToken extends AbstractEntity {
  @Column()
  @Index()
  jti: string;

  @Column()
  type: string; // 'refresh' | 'access'

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @ManyToOne(() => User, (user) => user.tokens)
  user: User;

  @Column()
  @Index()
  tenantId: string;
}
