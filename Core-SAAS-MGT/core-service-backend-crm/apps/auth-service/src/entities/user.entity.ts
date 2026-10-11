import { Entity, Column, Index, OneToMany } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { AuthToken } from './auth-token.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum UserRole {
  ROOT_ADMIN    = 'root_admin',     // owner of the platform — tenantId = 'root-admin'
  TENANT_ADMIN  = 'tenant_admin',   // subscribed company admin — manages their workspace
  ACCOUNT_OFFICER = 'account_officer', // elevated financial/legal staff under a tenant
  STAFF         = 'staff',          // regular invited staff under a tenant
}

@Entity()
export class User extends AbstractEntity {
  @Index()
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Index()
  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ nullable: true })
  password: string;

  @Column({ name: 'mfa_enabled', default: false })
  mfaEnabled: boolean;

  @Column({ name: 'mfa_secret', nullable: true })
  mfaSecret?: string;

  @Column({ name: 'is_verified', default: false })
  isVerified!: boolean;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore!: number;

  @Index()
  @Column()
  tenantId: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  /** Platform role — determines what the user can do across the system */
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STAFF,
  })
  role: UserRole;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @OneToMany(() => AuthToken, (token) => token.user)
  tokens: AuthToken[];
}
