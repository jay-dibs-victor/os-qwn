import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tenant_scopes')
@Unique(['tenantUuid', 'scopeId'])
@Index(['tenantUuid'])
@Index(['scopeId'])
@Index(['isEnabled'])
@Index(['tenantUuid', 'isEnabled'])
export class TenantScope {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tenantUuid: string; // Foreign key to Tenant.id (UUID)

  @Column()
  tenantId: string; // Cached tenantId string for queries (e.g., 'tenant-001')

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'tenantUuid', referencedColumnName: 'id' })
  tenant: Tenant;

  @Column()
  scopeId: string; // Reference to Scope.scopeId

  @Column()
  scopeName: string; // Cached scope name for quick access

  @Column({ type: 'text', nullable: true })
  scopeDescription: string; // Cached scope description

  @Column({ default: true })
  isEnabled: boolean; // Whether this scope is enabled for the tenant

  @Column({ default: false })
  isRequired: boolean; // Whether this scope is required for the tenant

  @Column({ nullable: true })
  grantedBy: string; // User ID who granted this scope (root admin)

  @Column({ nullable: true })
  approvedBy: string; // User ID who approved this scope (if requiresApproval)

  @Column({ nullable: true })
  approvedAt: Date; // When this scope was approved

  @Column({ nullable: true })
  expiresAt: Date; // Optional expiration date for temporary scopes

  @Column({ type: 'simple-array', default: '' })
  restrictions: string[]; // Additional restrictions for this tenant (e.g., 'max_daily_transactions:1000')

  @Column({ default: 0 })
  usageCount: number; // Track how many times this scope is used

  @Column({ nullable: true })
  lastUsedAt: Date; // Last time this scope was used

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  metadata: string; // JSON string for additional metadata
}
