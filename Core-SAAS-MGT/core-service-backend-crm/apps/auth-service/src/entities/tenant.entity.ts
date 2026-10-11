import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
  TRIAL = 'TRIAL',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  tenantId: string; // e.g., 'tenant-001', 'acme-corp'

  @Column()
  name: string; // Display name

  @Column({ nullable: true })
  domain: string; // Custom domain (e.g., 'acme.queensos.com')

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.ACTIVE,
  })
  status: TenantStatus;

  @Column({ default: false })
  isRoot: boolean; // Root/super admin tenant

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>; // Tenant-specific settings

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional metadata

  @Column({ nullable: true })
  subscriptionPlan: string; // e.g., 'free', 'basic', 'premium'

  @Column({ type: 'timestamp', nullable: true })
  subscriptionExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
