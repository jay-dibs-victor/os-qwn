import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ScopeCategory {
  // Driver Management
  DRIVER_MANAGEMENT = 'driver_management',
  DRIVER_READ = 'driver_read',
  DRIVER_WRITE = 'driver_write',
  DRIVER_DELETE = 'driver_delete',

  // Passenger Management
  PASSENGER_MANAGEMENT = 'passenger_management',
  PASSENGER_READ = 'passenger_read',
  PASSENGER_WRITE = 'passenger_write',
  PASSENGER_DELETE = 'passenger_delete',

  // Payment Processing
  PAYMENT_PROCESSING = 'payment_processing',
  PAYMENT_READ = 'payment_read',
  PAYMENT_WRITE = 'payment_write',
  PAYMENT_APPROVE = 'payment_approve',
  PAYMENT_REFUND = 'payment_refund',

  // Analytics & Reporting
  ANALYTICS = 'analytics',
  ANALYTICS_READ = 'analytics_read',
  ANALYTICS_EXPORT = 'analytics_export',

  // Compliance & KYC
  COMPLIANCE = 'compliance',
  KYC_VERIFICATION = 'kyc_verification',
  KYC_READ = 'kyc_read',
  KYC_WRITE = 'kyc_write',
  KYC_APPROVE = 'kyc_approve',

  // Audit & Logging
  AUDIT = 'audit',
  AUDIT_READ = 'audit_read',
  AUDIT_EXPORT = 'audit_export',

  // Account Management
  ACCOUNT_MANAGEMENT = 'account_management',
  ACCOUNT_READ = 'account_read',
  ACCOUNT_WRITE = 'account_write',
  ACCOUNT_CLOSE = 'account_close',

  // Approval Workflow
  APPROVAL_WORKFLOW = 'approval_workflow',
  APPROVAL_READ = 'approval_read',
  APPROVAL_APPROVE = 'approval_approve',
  APPROVAL_REJECT = 'approval_reject',

  // Loan Management
  LOAN_MANAGEMENT = 'loan_management',
  LOAN_READ = 'loan_read',
  LOAN_WRITE = 'loan_write',
  LOAN_APPROVE = 'loan_approve',
  LOAN_DISBURSE = 'loan_disburse',

  // Batch Operations
  BATCH_OPERATIONS = 'batch_operations',
  BATCH_READ = 'batch_read',
  BATCH_WRITE = 'batch_write',
  BATCH_EXECUTE = 'batch_execute',

  // System Administration
  SYSTEM_ADMIN = 'system_admin',
  TENANT_MANAGEMENT = 'tenant_management',
  USER_MANAGEMENT = 'user_management',
  SCOPE_MANAGEMENT = 'scope_management',
  ROLE_MANAGEMENT = 'role_management',
  STAFF_MANAGEMENT = 'staff_management',
}

@Entity('scopes')
@Index(['scopeId'])
@Index(['category'])
@Index(['microservice'])
@Index(['isActive'])
@Index(['tenantId'])
@Index(['isSystem'])
@Index(['createdBy'])
export class Scope {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  scopeId: string; // e.g., 'drivers:read', 'drivers:write', 'payments:approve'

  @Column()
  name: string; // e.g., 'Read Drivers'

  @Column({ type: 'text' })
  description: string; // e.g., 'View driver information and profiles'

  @Column({ type: 'enum', enum: ScopeCategory })
  category: ScopeCategory;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  microservice: string; // e.g., 'driver-service', 'payment-service', 'auth-service'

  @Column({ type: 'simple-array', default: '' })
  endpoints: string[]; // e.g., ['/drivers', '/drivers/:id', 'GET /drivers']

  @Column({ type: 'simple-array', default: '' })
  methods: string[]; // e.g., ['GET', 'POST', 'PUT', 'DELETE']

  @Column({ type: 'simple-array', default: '' })
  resources: string[]; // e.g., ['drivers', 'driver_profiles', 'driver_documents']

  @Column({ type: 'simple-array', default: '' })
  actions: string[]; // e.g., ['read', 'write', 'delete', 'approve']

  @Column({ default: false })
  requiresApproval: boolean; // Whether this scope requires admin approval

  @Column({ default: false })
  isRootOnly: boolean; // Whether only root admin can grant this scope

  @Column({ default: false })
  isTenantAdmin: boolean; // Whether tenant admin can grant this scope

  @Column({ nullable: true })
  parentScopeId: string; // For hierarchical scopes

  @Column({ type: 'simple-array', default: '' })
  childScopeIds: string[]; // Child scopes that depend on this one

  @Column({ default: true })
  isSystem: boolean; // Whether this is a system-defined scope (false for custom scopes)

  @Column({ nullable: true })
  tenantId: string; // NULL for system scopes, tenant ID for tenant-specific custom scopes

  @Column({ nullable: true })
  createdBy: string; // User ID who created this scope (NULL for system scopes)

  @Column({ default: 'system' })
  scopeLevel: 'system' | 'tenant' | 'custom'; // Scope level: system-wide, tenant-specific, or custom

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  metadata: string; // JSON string for additional metadata
}
