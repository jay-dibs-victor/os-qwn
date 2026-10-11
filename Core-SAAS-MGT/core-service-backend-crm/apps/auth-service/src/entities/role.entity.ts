import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RoleType {
  ROOT_ADMIN = 'root_admin',
  TENANT_ADMIN = 'tenant_admin',
  TENANT_OWNER = 'tenant_owner',
  STAFF = 'staff',
  DRIVER = 'driver',
  PASSENGER = 'passenger',
  FINANCE_OFFICER = 'finance_officer',
  COMPLIANCE_OFFICER = 'compliance_officer',
  OPERATIONS_MANAGER = 'operations_manager',
  SUPPORT_AGENT = 'support_agent',
  CUSTOM = 'custom',
}

@Entity('roles')
@Index(['roleId'])
@Index(['tenantId'])
@Index(['roleType'])
@Index(['isActive'])
@Index(['tenantId', 'roleType'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  roleId: string; // e.g., 'root_admin', 'tenant_admin', 'driver_manager'

  @Column()
  name: string; // e.g., 'Root Administrator', 'Tenant Admin'

  @Column({ type: 'text' })
  description: string; // e.g., 'Full access to all resources'

  @Column({ type: 'enum', enum: RoleType })
  roleType: RoleType;

  @Column({ nullable: true })
  tenantId: string; // NULL for root roles, tenant ID for tenant-specific roles

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isSystem: boolean; // Whether this is a system role (cannot be deleted)

  @Column({ default: false })
  isCustom: boolean; // Whether this is a custom role created by tenant admin

  @Column({ type: 'simple-array', default: '' })
  scopeIds: string[]; // Array of scope IDs assigned to this role

  @Column({ type: 'simple-array', default: '' })
  permissions: string[]; // Additional permissions beyond scopes

  @Column({ type: 'simple-array', default: '' })
  restrictions: string[]; // Restrictions applied to this role

  @Column({ nullable: true })
  createdBy: string; // User ID who created this role

  @Column({ nullable: true })
  parentRoleId: string; // For role hierarchy

  @Column({ type: 'simple-array', default: '' })
  childRoleIds: string[]; // Child roles that inherit from this one

  @Column({ default: 0 })
  userCount: number; // Number of users with this role

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  metadata: string; // JSON string for additional metadata
}
