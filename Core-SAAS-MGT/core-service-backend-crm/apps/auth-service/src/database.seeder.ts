import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant, TenantStatus } from './entities/tenant.entity';
import { User, UserStatus, UserRole } from './entities/user.entity';
import { OAuthClient } from './entities/oauth-client.entity';
import { Scope, ScopeCategory } from './entities/scope.entity';
import { TenantScope } from './entities/tenant-scope.entity';
import { UserScope } from './entities/user-scope.entity';
import { Role, RoleType } from './entities/role.entity';
import { Customer, CustomerType, CustomerStatus } from './entities/customer.entity';
//+234 703585855078, 7031370758 - moove
@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);
  private tenantUuidMap: Map<string, string> = new Map(); // tenantId string -> UUID map

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OAuthClient)
    private readonly oauthClientRepository: Repository<OAuthClient>,
    @InjectRepository(Scope)
    private readonly scopeRepository: Repository<Scope>,
    @InjectRepository(TenantScope)
    private readonly tenantScopeRepository: Repository<TenantScope>,
    @InjectRepository(UserScope)
    private readonly userScopeRepository: Repository<UserScope>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('🌱 Starting database seeding...');
    try {
      // Always drop and reseed on every launch for a clean consistent state.
      // This truncates all seeded tables in dependency order (FK-safe).
      this.logger.log('→ Truncating seeded tables for fresh reseed...');
      await this.customerRepository.query('TRUNCATE TABLE customers CASCADE');
      await this.userScopeRepository.query('TRUNCATE TABLE user_scopes CASCADE');
      await this.tenantScopeRepository.query('TRUNCATE TABLE tenant_scopes CASCADE');
      await this.oauthClientRepository.query('TRUNCATE TABLE oauth_clients CASCADE');
      await this.userRepository.query('TRUNCATE TABLE "user" CASCADE');
      await this.roleRepository.query('TRUNCATE TABLE roles CASCADE');
      await this.tenantRepository.query('TRUNCATE TABLE tenants CASCADE');
      await this.scopeRepository.query('TRUNCATE TABLE scopes CASCADE');
      this.logger.log('→ Tables cleared. Starting fresh seed...');

      await this.seedScopes();
      await this.seedRoles();
      await this.seedTenants();
      await this.seedTenantScopes();
      await this.seedRootAdmin();
      await this.seedDemoUsers();
      await this.seedUserScopes();
      await this.seedOAuthClients();
      await this.seedCustomers();
      await this.seedEcosystemPartners();
      await this.seedFixedUuidGlAccounts();
      this.logger.log('✅ Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error);
      this.logger.warn('⚠️  Service will continue despite seeding failure');
    }
  }


  private async seedScopes(): Promise<void> {
    this.logger.log('Seeding scopes...');
    const scopes = [
      { scopeId: 'drivers:read', name: 'Read Drivers', description: 'View driver information', category: ScopeCategory.DRIVER_READ, microservice: 'driver-service', endpoints: ['/drivers'], methods: ['GET'], resources: ['drivers'], actions: ['read'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'drivers:write', name: 'Write Drivers', description: 'Create and update drivers', category: ScopeCategory.DRIVER_WRITE, microservice: 'driver-service', endpoints: ['/drivers'], methods: ['POST', 'PUT'], resources: ['drivers'], actions: ['write', 'create', 'update'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'drivers:delete', name: 'Delete Drivers', description: 'Delete driver records', category: ScopeCategory.DRIVER_DELETE, microservice: 'driver-service', endpoints: ['/drivers/:id'], methods: ['DELETE'], resources: ['drivers'], actions: ['delete'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'passengers:read', name: 'Read Passengers', description: 'View passenger information', category: ScopeCategory.PASSENGER_READ, microservice: 'passenger-service', endpoints: ['/passengers'], methods: ['GET'], resources: ['passengers'], actions: ['read'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'passengers:write', name: 'Write Passengers', description: 'Create and update passengers', category: ScopeCategory.PASSENGER_WRITE, microservice: 'passenger-service', endpoints: ['/passengers'], methods: ['POST', 'PUT'], resources: ['passengers'], actions: ['write', 'create', 'update'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'passengers:delete', name: 'Delete Passengers', description: 'Delete passenger records', category: ScopeCategory.PASSENGER_DELETE, microservice: 'passenger-service', endpoints: ['/passengers/:id'], methods: ['DELETE'], resources: ['passengers'], actions: ['delete'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'payments:read', name: 'Read Payments', description: 'View payment transactions', category: ScopeCategory.PAYMENT_READ, microservice: 'payment-service', endpoints: ['/payments'], methods: ['GET'], resources: ['payments'], actions: ['read'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'payments:write', name: 'Write Payments', description: 'Create and process payments', category: ScopeCategory.PAYMENT_WRITE, microservice: 'payment-service', endpoints: ['/payments'], methods: ['POST', 'PUT'], resources: ['payments'], actions: ['write', 'create', 'process'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'payments:approve', name: 'Approve Payments', description: 'Approve payment transactions', category: ScopeCategory.PAYMENT_APPROVE, microservice: 'payment-service', endpoints: ['/payments/:id/approve'], methods: ['POST'], resources: ['payments'], actions: ['approve'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'payments:refund', name: 'Refund Payments', description: 'Process payment refunds', category: ScopeCategory.PAYMENT_REFUND, microservice: 'payment-service', endpoints: ['/payments/:id/refund'], methods: ['POST'], resources: ['payments'], actions: ['refund'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'analytics:read', name: 'Read Analytics', description: 'View analytics and reports', category: ScopeCategory.ANALYTICS_READ, microservice: 'analytics-service', endpoints: ['/analytics'], methods: ['GET'], resources: ['analytics'], actions: ['read'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'analytics:export', name: 'Export Analytics', description: 'Export analytics data', category: ScopeCategory.ANALYTICS_EXPORT, microservice: 'analytics-service', endpoints: ['/analytics/export'], methods: ['POST'], resources: ['analytics'], actions: ['export'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'kyc:read', name: 'Read KYC', description: 'View KYC information', category: ScopeCategory.KYC_READ, microservice: 'compliance-service', endpoints: ['/kyc'], methods: ['GET'], resources: ['kyc'], actions: ['read'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'kyc:write', name: 'Write KYC', description: 'Create and update KYC', category: ScopeCategory.KYC_WRITE, microservice: 'compliance-service', endpoints: ['/kyc'], methods: ['POST', 'PUT'], resources: ['kyc'], actions: ['write', 'create', 'update'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'kyc:approve', name: 'Approve KYC', description: 'Approve KYC verifications', category: ScopeCategory.KYC_APPROVE, microservice: 'compliance-service', endpoints: ['/kyc/:id/approve'], methods: ['POST'], resources: ['kyc'], actions: ['approve'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'audit:read', name: 'Read Audit Logs', description: 'View audit logs', category: ScopeCategory.AUDIT_READ, microservice: 'audit-service', endpoints: ['/audit'], methods: ['GET'], resources: ['audit_logs'], actions: ['read'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'audit:export', name: 'Export Audit Logs', description: 'Export audit logs', category: ScopeCategory.AUDIT_EXPORT, microservice: 'audit-service', endpoints: ['/audit/export'], methods: ['POST'], resources: ['audit_logs'], actions: ['export'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'accounts:read', name: 'Read Accounts', description: 'View account information', category: ScopeCategory.ACCOUNT_READ, microservice: 'account-service', endpoints: ['/accounts'], methods: ['GET'], resources: ['accounts'], actions: ['read'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'accounts:write', name: 'Write Accounts', description: 'Create and update accounts', category: ScopeCategory.ACCOUNT_WRITE, microservice: 'account-service', endpoints: ['/accounts'], methods: ['POST', 'PUT'], resources: ['accounts'], actions: ['write', 'create', 'update'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'accounts:close', name: 'Close Accounts', description: 'Close or deactivate accounts', category: ScopeCategory.ACCOUNT_CLOSE, microservice: 'account-service', endpoints: ['/accounts/:id/close'], methods: ['POST'], resources: ['accounts'], actions: ['close', 'deactivate'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'approvals:read', name: 'Read Approvals', description: 'View pending approvals', category: ScopeCategory.APPROVAL_READ, microservice: 'workflow-service', endpoints: ['/approvals'], methods: ['GET'], resources: ['approvals'], actions: ['read'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'approvals:approve', name: 'Approve Requests', description: 'Approve pending requests', category: ScopeCategory.APPROVAL_APPROVE, microservice: 'workflow-service', endpoints: ['/approvals/:id/approve'], methods: ['POST'], resources: ['approvals'], actions: ['approve'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'approvals:reject', name: 'Reject Requests', description: 'Reject pending requests', category: ScopeCategory.APPROVAL_REJECT, microservice: 'workflow-service', endpoints: ['/approvals/:id/reject'], methods: ['POST'], resources: ['approvals'], actions: ['reject'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'loans:read', name: 'Read Loans', description: 'View loan information', category: ScopeCategory.LOAN_READ, microservice: 'loan-service', endpoints: ['/loans'], methods: ['GET'], resources: ['loans'], actions: ['read'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'loans:write', name: 'Write Loans', description: 'Create and update loans', category: ScopeCategory.LOAN_WRITE, microservice: 'loan-service', endpoints: ['/loans'], methods: ['POST', 'PUT'], resources: ['loans'], actions: ['write', 'create', 'update'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'loans:approve', name: 'Approve Loans', description: 'Approve loan applications', category: ScopeCategory.LOAN_APPROVE, microservice: 'loan-service', endpoints: ['/loans/:id/approve'], methods: ['POST'], resources: ['loans'], actions: ['approve'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'loans:disburse', name: 'Disburse Loans', description: 'Disburse approved loans', category: ScopeCategory.LOAN_DISBURSE, microservice: 'loan-service', endpoints: ['/loans/:id/disburse'], methods: ['POST'], resources: ['loans'], actions: ['disburse'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'batch:read', name: 'Read Batch Operations', description: 'View batch operations', category: ScopeCategory.BATCH_READ, microservice: 'batch-service', endpoints: ['/batch'], methods: ['GET'], resources: ['batch'], actions: ['read'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'batch:write', name: 'Write Batch Operations', description: 'Create batch operations', category: ScopeCategory.BATCH_WRITE, microservice: 'batch-service', endpoints: ['/batch'], methods: ['POST', 'PUT'], resources: ['batch'], actions: ['write', 'create', 'configure'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'batch:execute', name: 'Execute Batch Operations', description: 'Execute batch operations', category: ScopeCategory.BATCH_EXECUTE, microservice: 'batch-service', endpoints: ['/batch/:id/execute'], methods: ['POST'], resources: ['batch'], actions: ['execute'], requiresApproval: true, isRootOnly: false, isTenantAdmin: true },
      { scopeId: 'tenants:manage', name: 'Manage Tenants', description: 'Create and manage tenants', category: ScopeCategory.TENANT_MANAGEMENT, microservice: 'auth-service', endpoints: ['/tenants'], methods: ['GET', 'POST', 'PUT', 'DELETE'], resources: ['tenants'], actions: ['read', 'write', 'delete', 'manage'], requiresApproval: true, isRootOnly: true, isTenantAdmin: false },
      { scopeId: 'users:manage', name: 'Manage Users', description: 'Create and manage users', category: ScopeCategory.USER_MANAGEMENT, microservice: 'auth-service', endpoints: ['/users'], methods: ['GET', 'POST', 'PUT', 'DELETE'], resources: ['users'], actions: ['read', 'write', 'delete', 'manage'], requiresApproval: true, isRootOnly: true, isTenantAdmin: false },
      { scopeId: 'scopes:manage', name: 'Manage Scopes', description: 'Create and manage scopes', category: ScopeCategory.SCOPE_MANAGEMENT, microservice: 'auth-service', endpoints: ['/scopes'], methods: ['GET', 'POST', 'PUT', 'DELETE'], resources: ['scopes'], actions: ['read', 'write', 'delete', 'manage'], requiresApproval: true, isRootOnly: true, isTenantAdmin: false },
      { scopeId: 'roles:manage', name: 'Manage Roles', description: 'Create and manage roles', category: ScopeCategory.ROLE_MANAGEMENT, microservice: 'auth-service', endpoints: ['/roles'], methods: ['GET', 'POST', 'PUT', 'DELETE'], resources: ['roles'], actions: ['read', 'write', 'delete', 'manage'], requiresApproval: true, isRootOnly: true, isTenantAdmin: false },
      { scopeId: 'staff:manage', name: 'Manage Staff', description: 'Invite and manage staff', category: ScopeCategory.STAFF_MANAGEMENT, microservice: 'auth-service', endpoints: ['/staff'], methods: ['GET', 'POST', 'PUT', 'DELETE'], resources: ['staff'], actions: ['read', 'write', 'delete', 'manage', 'invite'], requiresApproval: false, isRootOnly: false, isTenantAdmin: true },
    ];

    for (const scopeData of scopes) {
      const existing = await this.scopeRepository.findOne({ where: { scopeId: scopeData.scopeId } });
      if (!existing) {
        const scope = this.scopeRepository.create({
          ...scopeData,
          isSystem: true,
          scopeLevel: 'system',
          metadata: JSON.stringify({ seededAt: new Date().toISOString(), type: 'system_scope' }),
        } as any);
        await this.scopeRepository.save(scope);
        this.logger.log(`  ✓ Created scope: ${scopeData.scopeId}`);
      }
    }
    this.logger.log(`✓ Scopes seeding completed`);
  }


  private async seedRoles(): Promise<void> {
    this.logger.log('Seeding roles...');
    const roles = [
      {
        roleId: 'root_admin',
        name: 'Root Administrator',
        description: 'Full access to all resources and tenants',
        roleType: RoleType.ROOT_ADMIN,
        isSystem: true,
        isCustom: false,
        scopeIds: ['drivers:read', 'drivers:write', 'drivers:delete', 'passengers:read', 'passengers:write', 'passengers:delete', 'payments:read', 'payments:write', 'payments:approve', 'payments:refund', 'analytics:read', 'analytics:export', 'kyc:read', 'kyc:write', 'kyc:approve', 'audit:read', 'audit:export', 'accounts:read', 'accounts:write', 'accounts:close', 'approvals:read', 'approvals:approve', 'approvals:reject', 'loans:read', 'loans:write', 'loans:approve', 'loans:disburse', 'batch:read', 'batch:write', 'batch:execute', 'tenants:manage', 'users:manage', 'scopes:manage', 'roles:manage', 'staff:manage'],
        permissions: ['*'],
        restrictions: [],
      },
      {
        roleId: 'tenant_admin',
        name: 'Tenant Administrator',
        description: 'Full access to tenant resources',
        roleType: RoleType.TENANT_ADMIN,
        isSystem: true,
        isCustom: false,
        scopeIds: ['drivers:read', 'drivers:write', 'drivers:delete', 'passengers:read', 'passengers:write', 'passengers:delete', 'payments:read', 'payments:write', 'payments:approve', 'payments:refund', 'analytics:read', 'analytics:export', 'kyc:read', 'kyc:write', 'kyc:approve', 'audit:read', 'audit:export', 'accounts:read', 'accounts:write', 'accounts:close', 'approvals:read', 'approvals:approve', 'approvals:reject', 'loans:read', 'loans:write', 'loans:approve', 'loans:disburse', 'batch:read', 'batch:write', 'batch:execute', 'staff:manage'],
        permissions: ['manage_staff', 'manage_scopes_for_tenant'],
        restrictions: ['cannot_manage_root_tenant'],
      },
      {
        roleId: 'staff_member',
        name: 'Staff Member',
        description: 'Limited access to tenant resources',
        roleType: RoleType.STAFF,
        isSystem: true,
        isCustom: false,
        scopeIds: ['drivers:read', 'passengers:read', 'payments:read', 'analytics:read', 'audit:read', 'accounts:read', 'approvals:read'],
        permissions: ['view_tenant_data'],
        restrictions: ['cannot_approve', 'cannot_delete'],
      },
      {
        roleId: 'finance_officer',
        name: 'Finance Officer',
        description: 'Payment and financial operations access',
        roleType: RoleType.FINANCE_OFFICER,
        isSystem: true,
        isCustom: false,
        scopeIds: ['payments:read', 'payments:write', 'payments:approve', 'payments:refund', 'analytics:read', 'audit:read', 'accounts:read', 'approvals:read', 'approvals:approve', 'loans:read', 'loans:write', 'loans:approve', 'loans:disburse'],
        permissions: ['manage_payments', 'manage_loans'],
        restrictions: ['cannot_manage_staff'],
      },
      {
        roleId: 'compliance_officer',
        name: 'Compliance Officer',
        description: 'Compliance and KYC operations access',
        roleType: RoleType.COMPLIANCE_OFFICER,
        isSystem: true,
        isCustom: false,
        scopeIds: ['kyc:read', 'kyc:write', 'kyc:approve', 'audit:read', 'audit:export', 'accounts:read', 'accounts:write', 'approvals:read', 'approvals:approve', 'approvals:reject'],
        permissions: ['manage_kyc', 'manage_compliance'],
        restrictions: ['cannot_manage_payments'],
      },
      {
        roleId: 'operations_manager',
        name: 'Operations Manager',
        description: 'Driver and passenger operations access',
        roleType: RoleType.OPERATIONS_MANAGER,
        isSystem: true,
        isCustom: false,
        scopeIds: ['drivers:read', 'drivers:write', 'passengers:read', 'passengers:write', 'analytics:read', 'audit:read', 'approvals:read', 'approvals:approve'],
        permissions: ['manage_drivers', 'manage_passengers'],
        restrictions: ['cannot_delete', 'cannot_manage_payments'],
      },
    ];

    for (const roleData of roles) {
      const existing = await this.roleRepository.findOne({ where: { roleId: roleData.roleId } });
      if (!existing) {
        const role = this.roleRepository.create({
          ...roleData,
          tenantId: undefined,
          metadata: JSON.stringify({ seededAt: new Date().toISOString() }),
        } as any);
        await this.roleRepository.save(role);
        this.logger.log(`  ✓ Created role: ${roleData.roleId}`);
      }
    }
    this.logger.log(`✓ Roles seeding completed`);
  }


  private async seedTenants(): Promise<void> {
    this.logger.log('Seeding tenants...');
    const tenants = [
      { tenantId: 'root-admin', name: 'Root Admin', domain: 'admin.queensos.com', isRoot: true, status: TenantStatus.ACTIVE, subscriptionPlan: 'unlimited', settings: { maxUsers: -1, features: ['all'] } },
      { tenantId: 'tenant-001', name: 'Demo Tenant 1', domain: 'demo1.queensos.com', isRoot: false, status: TenantStatus.ACTIVE, subscriptionPlan: 'premium', settings: { maxUsers: 100, features: ['auth', 'payments', 'analytics'] } },
      { tenantId: 'tenant-002', name: 'Demo Tenant 2', domain: 'demo2.queensos.com', isRoot: false, status: TenantStatus.TRIAL, subscriptionPlan: 'trial', settings: { maxUsers: 10, features: ['auth', 'basic'] } },
      { tenantId: 'acme-corp', name: 'ACME Corporation', domain: 'acme.queensos.com', isRoot: false, status: TenantStatus.ACTIVE, subscriptionPlan: 'enterprise', settings: { maxUsers: 500, features: ['all'] } },
    ];

    for (const tenantData of tenants) {
      const existing = await this.tenantRepository.findOne({ where: { tenantId: tenantData.tenantId } });
      if (!existing) {
        const tenant = this.tenantRepository.create({ 
          ...tenantData, 
          metadata: { seededAt: new Date().toISOString() } 
        });
        const savedTenant = await this.tenantRepository.save(tenant);
        // Store the UUID mapping for later use
        this.tenantUuidMap.set(tenantData.tenantId, savedTenant.id);
        this.logger.log(`  ✓ Created tenant: ${tenantData.tenantId} (UUID: ${savedTenant.id})`);
      } else {
        // Store existing tenant's UUID
        this.tenantUuidMap.set(tenantData.tenantId, existing.id);
        this.logger.log(`  ✓ Tenant exists: ${tenantData.tenantId} (UUID: ${existing.id})`);
      }
    }

    // Log root tenant UUID for env configuration
    const rootTenantUuid = this.tenantUuidMap.get('root-admin');
    this.logger.log(`\n📝 ROOT TENANT UUID (add to frontend .env):`);
    this.logger.log(`  REACT_APP_ROOT_TENANT_ID=${rootTenantUuid}`);
  }

  private async seedRootAdmin(): Promise<void> {
    this.logger.log('Seeding root admin user...');
    const email = 'admin@queensos.com';
    const existing = await this.userRepository.findOne({ where: { email, tenantId: 'root-admin' } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);
      const admin = this.userRepository.create({
        email,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+1234567890',
        tenantId: 'root-admin',
        role: UserRole.ROOT_ADMIN,
        status: UserStatus.ACTIVE,
        isVerified: true,
        mfaEnabled: false,
        metadata: { role: 'root_admin', seededAt: new Date().toISOString() },
      } as any);
      await this.userRepository.save(admin);
      this.logger.log(`  ✓ Created root admin: ${email}`);
    }
  }

  private async seedDemoUsers(): Promise<void> {
    this.logger.log('Seeding demo users...');

    // Business logic:
    // - tenant_admin: the subscribing company admin who manages their workspace
    // - account_officer: elevated financial/legal staff under a tenant
    // - staff: regular invited staff under a tenant
    const demoUsers = [
      { email: 'user@tenant-001.com',   password: 'User@123456',   firstName: 'John',  lastName: 'Doe',      phone: '+1234567891', tenantId: 'tenant-001', role: UserRole.STAFF },
      { email: 'admin@tenant-001.com',  password: 'Admin@123456',  firstName: 'Jane',  lastName: 'Smith',    phone: '+1234567892', tenantId: 'tenant-001', role: UserRole.TENANT_ADMIN },
      { email: 'driver@tenant-001.com', password: 'Driver@123456', firstName: 'Mike',  lastName: 'Johnson',  phone: '+1234567893', tenantId: 'tenant-001', role: UserRole.STAFF },
      { email: 'finance@tenant-001.com',password: 'Finance@123456',firstName: 'Grace', lastName: 'Okafor',   phone: '+1234567895', tenantId: 'tenant-001', role: UserRole.ACCOUNT_OFFICER },
      { email: 'user@acme-corp.com',    password: 'User@123456',   firstName: 'Alice', lastName: 'Williams', phone: '+1234567894', tenantId: 'acme-corp',  role: UserRole.STAFF },
      { email: 'admin@acme-corp.com',   password: 'Admin@123456',  firstName: 'Bob',   lastName: 'Acme',     phone: '+1234567896', tenantId: 'acme-corp',  role: UserRole.TENANT_ADMIN },
      { email: 'admin@tenant-002.com',  password: 'Admin@123456',  firstName: 'Carol', lastName: 'Demo',     phone: '+1234567897', tenantId: 'tenant-002', role: UserRole.TENANT_ADMIN },
    ];

    for (const userData of demoUsers) {
      const existing = await this.userRepository.findOne({ where: { email: userData.email, tenantId: userData.tenantId } });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.userRepository.create({
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          tenantId: userData.tenantId,
          role: userData.role,
          status: UserStatus.ACTIVE,
          isVerified: true,
          mfaEnabled: false,
          metadata: { role: userData.role, seededAt: new Date().toISOString() },
        } as any);
        await this.userRepository.save(user);
        this.logger.log(`  ✓ Created user: ${userData.email} (${userData.role})`);
      }
    }

    this.logger.log('\n📝 Demo Credentials:');
    this.logger.log('  Root Admin:       admin@queensos.com      / Admin@123456   (root-admin)');
    this.logger.log('  Tenant-001 Admin: admin@tenant-001.com    / Admin@123456   (tenant_admin)');
    this.logger.log('  Tenant-001 AO:    finance@tenant-001.com  / Finance@123456 (account_officer)');
    this.logger.log('  Tenant-001 Staff: user@tenant-001.com     / User@123456    (staff)');
    this.logger.log('  ACME Admin:       admin@acme-corp.com     / Admin@123456   (tenant_admin)');
    this.logger.log('  ACME Staff:       user@acme-corp.com      / User@123456    (staff)');
  }

  private async seedTenantScopes(): Promise<void> {
    this.logger.log('Seeding tenant scopes...');

    // Get all scopes
    const allScopes = await this.scopeRepository.find();
    const scopeIds = allScopes.map(s => s.scopeId);

    // Root admin gets all scopes
    const rootTenantUuid = this.tenantUuidMap.get('root-admin');
    const rootTenant = await this.tenantRepository.findOne({ where: { id: rootTenantUuid } });
    
    if (rootTenant) {
      for (const scopeId of scopeIds) {
        const existing = await this.tenantScopeRepository.findOne({ 
          where: { tenantUuid: rootTenantUuid, scopeId } 
        });
        if (!existing) {
          const scope = await this.scopeRepository.findOne({ where: { scopeId } });
          if (scope) {
            const tenantScope = this.tenantScopeRepository.create({
              tenantUuid: rootTenantUuid,
              tenantId: 'root-admin',
              scopeId,
              scopeName: scope.name,
              scopeDescription: scope.description,
              isEnabled: true,
              isRequired: false,
              grantedBy: 'root-admin',
              approvedBy: 'root-admin',
              approvedAt: new Date(),
              metadata: JSON.stringify({ seededAt: new Date().toISOString() }),
            } as any);
            await this.tenantScopeRepository.save(tenantScope);
          }
        }
      }
      this.logger.log(`  ✓ Assigned all scopes to root-admin tenant`);
    }

    // Demo tenants get limited scopes (exclude management scopes)
    const demoTenantIds = ['tenant-001', 'tenant-002', 'acme-corp'];
    const excludeScopes = ['tenants:manage', 'users:manage', 'scopes:manage', 'roles:manage'];
    const demoScopeIds = scopeIds.filter(sid => !excludeScopes.includes(sid));

    for (const tenantId of demoTenantIds) {
      const tenantUuid = this.tenantUuidMap.get(tenantId);
      const tenant = await this.tenantRepository.findOne({ where: { id: tenantUuid } });
      
      if (tenant) {
        for (const scopeId of demoScopeIds) {
          const existing = await this.tenantScopeRepository.findOne({ 
            where: { tenantUuid, scopeId } 
          });
          if (!existing) {
            const scope = await this.scopeRepository.findOne({ where: { scopeId } });
            if (scope) {
              const tenantScope = this.tenantScopeRepository.create({
                tenantUuid,
                tenantId,
                scopeId,
                scopeName: scope.name,
                scopeDescription: scope.description,
                isEnabled: true,
                isRequired: false,
                grantedBy: 'root-admin',
                approvedBy: 'root-admin',
                approvedAt: new Date(),
                metadata: JSON.stringify({ seededAt: new Date().toISOString() }),
              } as any);
              await this.tenantScopeRepository.save(tenantScope);
            }
          }
        }
        this.logger.log(`  ✓ Assigned scopes to ${tenantId} tenant`);
      }
    }

    this.logger.log(`✓ Tenant scopes seeding completed`);
  }

  private async seedUserScopes(): Promise<void> {
    this.logger.log('Seeding user scopes...');

    // Root admin gets all scopes
    const rootAdmin = await this.userRepository.findOne({ 
      where: { email: 'admin@queensos.com' } 
    });
    if (rootAdmin) {
      const allScopes = await this.scopeRepository.find();
      for (const scope of allScopes) {
        const existing = await this.userScopeRepository.findOne({ 
          where: { userUuid: rootAdmin.id, scopeId: scope.scopeId } 
        });
        if (!existing) {
          const userScope = this.userScopeRepository.create({
            userUuid: rootAdmin.id,
            tenantId: 'root-admin',
            scopeId: scope.scopeId,
            scopeName: scope.name,
            scopeDescription: scope.description,
            isEnabled: true,
            grantedBy: 'root-admin',
            approvedBy: 'root-admin',
            approvedAt: new Date(),
            metadata: JSON.stringify({ role: 'root_admin', seededAt: new Date().toISOString() }),
          } as any);
          await this.userScopeRepository.save(userScope);
        }
      }
      this.logger.log(`  ✓ Assigned all scopes to root admin user`);
    }

    // Tenant admins get all scopes except management scopes
    const tenantAdminUsers = [
      { email: 'admin@tenant-001.com', tenantId: 'tenant-001' },
      { email: 'user@acme-corp.com', tenantId: 'acme-corp' },
    ];

    const adminScopeIds = [
      'drivers:read', 'drivers:write', 'drivers:delete',
      'passengers:read', 'passengers:write', 'passengers:delete',
      'payments:read', 'payments:write', 'payments:approve', 'payments:refund',
      'analytics:read', 'analytics:export',
      'kyc:read', 'kyc:write', 'kyc:approve',
      'audit:read', 'audit:export',
      'accounts:read', 'accounts:write', 'accounts:close',
      'approvals:read', 'approvals:approve', 'approvals:reject',
      'loans:read', 'loans:write', 'loans:approve', 'loans:disburse',
      'batch:read', 'batch:write', 'batch:execute',
      'staff:manage'
    ];

    for (const adminData of tenantAdminUsers) {
      const admin = await this.userRepository.findOne({ 
        where: { email: adminData.email } 
      });
      if (admin) {
        for (const scopeId of adminScopeIds) {
          const existing = await this.userScopeRepository.findOne({ 
            where: { userUuid: admin.id, scopeId } 
          });
          if (!existing) {
            const scope = await this.scopeRepository.findOne({ where: { scopeId } });
            if (scope) {
              const userScope = this.userScopeRepository.create({
                userUuid: admin.id,
                tenantId: adminData.tenantId,
                scopeId,
                scopeName: scope.name,
                scopeDescription: scope.description,
                isEnabled: true,
                grantedBy: 'root-admin',
                approvedBy: 'root-admin',
                approvedAt: new Date(),
                metadata: JSON.stringify({ role: 'tenant_admin', seededAt: new Date().toISOString() }),
              } as any);
              await this.userScopeRepository.save(userScope);
            }
          }
        }
        this.logger.log(`  ✓ Assigned tenant admin scopes to ${adminData.email}`);
      }
    }

    // Regular users and drivers get limited read scopes
    const limitedUsers = [
      { email: 'user@tenant-001.com', tenantId: 'tenant-001', role: 'user' },
      { email: 'driver@tenant-001.com', tenantId: 'tenant-001', role: 'driver' },
    ];

    const limitedScopeIds = [
      'drivers:read', 'passengers:read',
      'payments:read', 'analytics:read', 'audit:read', 'accounts:read', 'approvals:read'
    ];

    for (const userData of limitedUsers) {
      const user = await this.userRepository.findOne({ 
        where: { email: userData.email } 
      });
      if (user) {
        for (const scopeId of limitedScopeIds) {
          const existing = await this.userScopeRepository.findOne({ 
            where: { userUuid: user.id, scopeId } 
          });
          if (!existing) {
            const scope = await this.scopeRepository.findOne({ where: { scopeId } });
            if (scope) {
              const userScope = this.userScopeRepository.create({
                userUuid: user.id,
                tenantId: userData.tenantId,
                scopeId,
                scopeName: scope.name,
                scopeDescription: scope.description,
                isEnabled: true,
                grantedBy: 'root-admin',
                approvedBy: 'root-admin',
                approvedAt: new Date(),
                metadata: JSON.stringify({ role: userData.role, seededAt: new Date().toISOString() }),
              } as any);
              await this.userScopeRepository.save(userScope);
            }
          }
        }
        this.logger.log(`  ✓ Assigned ${userData.role} scopes to ${userData.email}`);
      }
    }

    this.logger.log(`✓ User scopes seeding completed`);
  }

  private async seedOAuthClients(): Promise<void> {
    this.logger.log('Seeding OAuth clients...');

    const tenants = ['root-admin', 'tenant-001', 'tenant-002', 'acme-corp'];
    
    for (const tenantId of tenants) {
      const existing = await this.oauthClientRepository.findOne({ 
        where: { tenantId, clientName: 'Web Application' } 
      });
      
      if (!existing) {
        const clientId = `client_${tenantId}_web_${Date.now()}`;
        const clientSecret = require('crypto').randomBytes(32).toString('hex');
        const clientSecretHash = await bcrypt.hash(clientSecret, 10);

        const oauthClient = this.oauthClientRepository.create({
          clientName: 'Web Application',
          clientId,
          clientSecretHash,
          isPublic: false,
          redirectUris: JSON.stringify([
            'http://localhost:3000/auth/callback',
            'http://localhost:3000/auth/google/callback',
            'http://localhost:3001/auth/google/callback',
            'https://queensos.com/auth/callback'
          ]),
          scopes: 'openid profile email',
          tenantId,
          isActive: true,
          grantTypes: 'authorization_code,refresh_token,client_credentials',
          allowedOrigins: JSON.stringify([
            'http://localhost:3000',
            'http://localhost:3001',
            'https://queensos.com',
             'http://localhost:4002',
              'http://localhost:4004',
              "https://queens-driver.netlify.app",
              "https://queens-ride.netlify.app",
          ]),
          tokenLifetime: 3600,
          refreshTokenLifetime: 2592000,
          description: `OAuth client for ${tenantId}`,
        } as any);
        
        await this.oauthClientRepository.save(oauthClient);
        this.logger.log(`  ✓ Created OAuth client for ${tenantId}`);
      }
    }

    // Seed the taxi-server OAuth client for SSO integration
    const taxiServerClientId = 'taxi-server';
    const existingTaxiClient = await this.oauthClientRepository.findOne({
      where: { clientId: taxiServerClientId },
    });

    if (!existingTaxiClient) {
      const taxiClientSecret = require('crypto').randomBytes(32).toString('hex');
      const taxiClientSecretHash = await bcrypt.hash(taxiClientSecret, 10);

      const taxiClient = this.oauthClientRepository.create({
        clientName: 'Taxi Server SSO Client',
        clientId: taxiServerClientId,
        clientSecretHash: taxiClientSecretHash,
        isPublic: false,
        redirectUris: JSON.stringify([]),
        scopes: 'wallet:read earnings:read trips:read',
        tenantId: 'root-admin',
        isActive: true,
        grantTypes: 'client_credentials,urn:ietf:params:oauth:grant-type:token-exchange',
        tokenLifetime: 3600,
        refreshTokenLifetime: 2592000,
        description: 'Confidential OAuth client for taxi-server SSO token exchange',
      } as any);

      await this.oauthClientRepository.save(taxiClient);
      this.logger.log(`  ✓ Created OAuth client for taxi-server SSO`);
      this.logger.log(`  ⚠  taxi-server client_secret (store securely): ${taxiClientSecret}`);
    }

    this.logger.log(`✓ OAuth clients seeding completed`);
  }

  private async seedCustomers(): Promise<void> {
    this.logger.log('Seeding customers (up to 100 across all tenants)...');

    const customersPerTenant = 25;
    let customerCount = 0;
    const tenants = ['root-admin', 'tenant-001', 'tenant-002', 'acme-corp'];
    const firstNames = ['James', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Edward', 'Ronald', 'Sarah', 'Emily', 'Jessica', 'Jennifer', 'Amanda', 'Lisa', 'Nancy', 'Karen', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Donna', 'Carol', 'Michelle', 'Dorothy', 'Maria', 'Patricia', 'Deborah', 'Barbara', 'Susan', 'Stephanie', 'Catherine', 'Carolyn', 'Janet', 'Ruth'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Peterson', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers'];
    const companies = ['Tech Solutions Inc', 'Global Logistics', 'Enterprise Solutions', 'Digital Innovations', 'Cloud Services Ltd', 'Data Analytics Corp', 'Smart Systems', 'Future Tech', 'Innovation Labs', 'Digital Transformation'];
    const vehicleModels = ['Toyota Camry', 'Honda Civic', 'Ford Focus', 'BMW 3 Series', 'Mercedes C-Class', 'Audi A4', 'Volkswagen Jetta', 'Hyundai Elantra', 'Kia Optima', 'Mazda 6'];

    // Generate a unique 10-digit customerId by using a global counter
    const globalSeq = (() => {
      let counter = customerCount + 1;
      return () => {
        const id = String(1000000000 + counter).slice(0, 10);
        counter++;
        return id;
      };
    })();

    const bankNames = ['GTBank', 'Access Bank', 'Zenith Bank', 'First Bank', 'UBA', 'Opay', 'PalmPay', 'Moniepoint', 'Kuda Bank', 'FCMB'];
    const bankCodeMap: Record<string, string> = {
      'GTBank': '058', 'Access Bank': '044', 'Zenith Bank': '057', 'First Bank': '011',
      'UBA': '033', 'Opay': '304', 'PalmPay': '305', 'Moniepoint': '306', 'Kuda Bank': '50211', 'FCMB': '214',
    };

    for (const tenantId of tenants) {
      const driversCount = Math.floor(customersPerTenant * 0.4); // 40% drivers
      const ridersCount = Math.floor(customersPerTenant * 0.4); // 40% riders
      const partnersCount = customersPerTenant - driversCount - ridersCount; // 20% partners

      // Create drivers
      for (let i = 0; i < driversCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const email = `driver${customerCount + 1}@${tenantId}.com`;
        const phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;

        const existing = await this.customerRepository.findOne({
          where: { tenantId, email },
        });

        if (!existing) {
          // Sample document URLs — placeholder Unsplash images that represent real docs.
          // In production these are replaced by real Cloudinary/S3 URLs via the upload endpoint.
          const sampleDocs = {
            licenseFront: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600',
            idProof:      'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600',
            utilityBill:  'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600',
            insurance:    'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600',
          };
          const tiers = ['Swift', 'Luxury'];
          const vettingStatuses = ['PENDING', 'APPROVED', 'PENDING', 'APPROVED', 'PENDING']; // mostly pending for vetting demo
          const bank = bankNames[Math.floor(Math.random() * bankNames.length)];
          const bankCode = bankCodeMap[bank];
          const customer = this.customerRepository.create({
            tenantId,
            customerType: CustomerType.DRIVER,
            customerId: globalSeq(),
            email,
            phone,
            firstName,
            lastName,
            status: CustomerStatus.ACTIVE,
            isVerified: Math.random() > 0.5,
            address: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
            city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
            state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
            zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
            country: 'USA',
            licenseNumber: `DL${Math.floor(Math.random() * 999999) + 100000}`,
            licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            vehicleRegistration: `VR${Math.floor(Math.random() * 999999) + 100000}`,
            vehicleModel: vehicleModels[Math.floor(Math.random() * vehicleModels.length)],
            rating: Math.round((Math.random() * 2 + 3.5) * 10) / 10,
            totalRides: Math.floor(Math.random() * 500) + 50,
            totalEarnings: Math.floor(Math.random() * 10000) + 1000,
            bankName: bank,
            bankCode,
            bankAccountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            bankAccountName: `${firstName} ${lastName}`,
            metadata: {
              seededAt: new Date().toISOString(),
              // Upload-related fields — stored as URLs after Cloudinary/S3 upload
              docs: sampleDocs,
              biometricSelfie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
              signature: '',
              // Driver profile extras
              tier: tiers[Math.floor(Math.random() * tiers.length)],
              licenseClass: ['Class A', 'Class B', 'Class C'][Math.floor(Math.random() * 3)],
              vehicleYear: `${2018 + Math.floor(Math.random() * 7)}`,
              vehicleColor: ['Black', 'White', 'Silver', 'Blue', 'Red'][Math.floor(Math.random() * 5)],
              vettingStatus: vettingStatuses[Math.floor(Math.random() * vettingStatuses.length)],
              source: Math.random() > 0.7 ? 'partner' : 'individual',
            },
          } as any);

          await this.customerRepository.save(customer);
          customerCount++;
        }
      }

      // Create riders
      for (let i = 0; i < ridersCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const email = `rider${customerCount + 1}@${tenantId}.com`;
        const phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;

        const existing = await this.customerRepository.findOne({
          where: { tenantId, email },
        });

        if (!existing) {
          const customer = this.customerRepository.create({
            tenantId,
            customerType: CustomerType.RIDER,
            customerId: globalSeq(),
            email,
            phone,
            firstName,
            lastName,
            status: CustomerStatus.ACTIVE,
            isVerified: true,
            address: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
            city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
            state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
            zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
            country: 'USA',
            totalTrips: Math.floor(Math.random() * 200) + 10,
            totalSpent: Math.floor(Math.random() * 5000) + 100,
            metadata: { seededAt: new Date().toISOString() },
          } as any);

          await this.customerRepository.save(customer);
          customerCount++;
        }
      }

      // Create partners
      for (let i = 0; i < partnersCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const email = `partner${customerCount + 1}@${tenantId}.com`;
        const phone = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;

        const existing = await this.customerRepository.findOne({
          where: { tenantId, email },
        });

        if (!existing) {
          const customer = this.customerRepository.create({
            tenantId,
            customerType: CustomerType.PARTNER,
            customerId: globalSeq(),
            email,
            phone,
            firstName,
            lastName,
            status: CustomerStatus.ACTIVE,
            isVerified: true,
            address: `${Math.floor(Math.random() * 9999) + 1} Business Ave`,
            city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
            state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
            zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
            country: 'USA',
            companyName: companies[Math.floor(Math.random() * companies.length)],
            taxId: `TAX${Math.floor(Math.random() * 999999) + 100000}`,
            businessDescription: 'Professional business services and solutions',
            metadata: { seededAt: new Date().toISOString() },
          } as any);

          await this.customerRepository.save(customer);
          customerCount++;
        }
      }

      this.logger.log(`  ✓ Seeded ${customersPerTenant} customers for ${tenantId}`);
    }

    this.logger.log(`✓ Customers seeding completed - Total: ${customerCount} customers`);
  }

  private async seedEcosystemPartners(): Promise<void> {
    this.logger.log('Seeding ecosystem partners...');

    // Idempotency: skip if any ecosystem partner already exists
    const existing = await this.customerRepository.findOne({
      where: { customerType: CustomerType.PARTNER, companyName: 'GTBank Nigeria' },
    });
    if (existing) {
      this.logger.log('  ↩ Ecosystem partners already seeded, skipping');
      return;
    }

    // Generate customerIds for ecosystem partners (continue from where seedCustomers left off)
    let partnerSeq = 1;
    const partnerCustomerId = () => String(1001000000 + partnerSeq++).slice(0, 10);

    const partners = [
      {
        tenantId: 'root-admin', firstName: 'GTBank', lastName: 'Nigeria',
        email: 'api@gtbank.queensos.com', phone: '+2341234567890',
        companyName: 'GTBank Nigeria', taxId: 'GTB-RC-001',
        businessDescription: 'Commercial bank providing payment rails and escrow services',
        bankName: 'GTBank', bankAccountNumber: '0123456789', bankAccountName: 'GTBank Nigeria',
        metadata: { partnerCategory: 'BANK', revenueShare: 2.5, swiftCode: 'GTBINGLA', integrationStatus: 'LIVE' },
      },
      {
        tenantId: 'root-admin', firstName: 'MTN', lastName: 'MoMo',
        email: 'api@mtn.queensos.com', phone: '+2348001234567',
        companyName: 'MTN Mobile Money', taxId: 'MTN-RC-002',
        businessDescription: 'Telecom partner providing mobile money payment integration',
        metadata: { partnerCategory: 'TELECOM', revenueShare: 1.5, integrationStatus: 'LIVE' },
      },
      {
        tenantId: 'root-admin', firstName: 'Chidi', lastName: 'Okonkwo',
        email: 'chidi.okonkwo@angel.queensos.com', phone: '+2348055551234',
        companyName: '', taxId: 'IND-001',
        businessDescription: 'Individual angel investor financing platform expansion',
        bankName: 'Zenith Bank', bankAccountNumber: '2109876543', bankAccountName: 'Chidi Okonkwo',
        metadata: { partnerCategory: 'INDIVIDUAL', revenueShare: 5.0, swiftCode: 'ZEIBNGLA', integrationStatus: 'SANDBOX' },
      },
      {
        tenantId: 'tenant-001', firstName: 'Moove', lastName: 'Africa',
        email: 'fleet@moove.queensos.com', phone: '+2349012345678',
        companyName: 'Moove Africa', taxId: 'MOOVE-RC-003',
        businessDescription: 'Fleet operator providing corporate drivers on the platform',
        bankName: 'Access Bank', bankAccountNumber: '0987654321', bankAccountName: 'Moove Africa',
        metadata: { partnerCategory: 'FLEET_OPERATOR', revenueShare: 8.0, swiftCode: 'ABNGNGLA', integrationStatus: 'LIVE' },
      },
      {
        tenantId: 'tenant-001', firstName: 'Flutterwave', lastName: 'Inc',
        email: 'api@flutterwave.queensos.com', phone: '+2348099887766',
        companyName: 'Flutterwave', taxId: 'FLW-RC-004',
        businessDescription: 'Fintech partner handling cross-border payment processing',
        metadata: { partnerCategory: 'FINTECH', revenueShare: 1.2, integrationStatus: 'LIVE' },
      },
      {
        tenantId: 'acme-corp', firstName: 'Lasgrid', lastName: 'Transport',
        email: 'ops@lasgrid.queensos.com', phone: '+2348033445566',
        companyName: 'Lasgrid Transport Ltd', taxId: 'LASGRID-RC-005',
        businessDescription: 'Lagos-based fleet operator providing corporate driver pool',
        bankName: 'First Bank', bankAccountNumber: '3012345678', bankAccountName: 'Lasgrid Transport Ltd',
        metadata: { partnerCategory: 'FLEET_OPERATOR', revenueShare: 7.5, swiftCode: 'FBNINGLA', integrationStatus: 'LIVE' },
      },
      {
        tenantId: 'acme-corp', firstName: 'Access', lastName: 'Bank',
        email: 'corporate@accessbank.queensos.com', phone: '+2341800000000',
        companyName: 'Access Bank Plc', taxId: 'ACCESS-RC-006',
        businessDescription: 'Commercial bank providing corporate account and settlement services',
        bankName: 'Access Bank', bankAccountNumber: '0011223344', bankAccountName: 'Access Bank Plc',
        metadata: { partnerCategory: 'BANK', revenueShare: 2.0, swiftCode: 'ABNGNGLA', integrationStatus: 'LIVE' },
      },
      {
        tenantId: 'tenant-002', firstName: 'Airtel', lastName: 'Money',
        email: 'api@airtel.queensos.com', phone: '+2340800000000',
        companyName: 'Airtel Money Nigeria', taxId: 'AIRTEL-RC-007',
        businessDescription: 'Telecom partner providing Airtel Money wallet integration',
        metadata: { partnerCategory: 'TELECOM', revenueShare: 1.8, integrationStatus: 'SANDBOX' },
      },
    ];

    for (const p of partners) {
      const exists = await this.customerRepository.findOne({ where: { tenantId: p.tenantId, email: p.email } });
      if (!exists) {
        const partner = this.customerRepository.create({
          tenantId: p.tenantId,
          customerType: CustomerType.PARTNER,
          customerId: partnerCustomerId(),
          email: p.email,
          phone: p.phone,
          firstName: p.firstName,
          lastName: p.lastName,
          companyName: p.companyName || undefined,
          taxId: p.taxId,
          businessDescription: p.businessDescription,
          bankName: p.bankName || undefined,
          bankAccountNumber: p.bankAccountNumber || undefined,
          bankAccountName: p.bankAccountName || undefined,
          status: CustomerStatus.ACTIVE,
          isVerified: true,
          metadata: p.metadata,
        } as any);
        await this.customerRepository.save(partner);
        this.logger.log(`  ✓ Ecosystem partner: ${p.companyName || `${p.firstName} ${p.lastName}`} [${p.tenantId}]`);
      }
    }

    this.logger.log('✓ Ecosystem partners seeding completed');
  }

  // ── Fixed-UUID GL accounts (migrated from scripts/seed-ledger-gl.sh) ──────
  // These known UUIDs match env vars used by wallet-service:
  //   CASH_GL_ACCOUNT_ID    → 11111111-1111-1111-1111-111111111111
  //   QCOIN_DEPOSITS_GL_ACCOUNT_ID → 22222222-2222-2222-2222-222222222222
  //   ESCROW_GL_ACCOUNT_ID → 33333333-3333-3333-3333-333333333333

  private async seedFixedUuidGlAccounts(): Promise<void> {
    this.logger.log('Seeding fixed-UUID GL accounts...');
    await this.customerRepository.query(
      `INSERT INTO gl_accounts (id, "createdAt", "updatedAt", code, name, type, status, "tenantId", balance, currency)
       VALUES ($1, NOW(), NOW(), $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        '11111111-1111-1111-1111-111111111111',
        'CASH-1100',
        'Platform Cash Pool',
        'asset',
        'ACTIVE',
        'root-admin',
        0.00,
        'USD',
      ],
    );
    await this.customerRepository.query(
      `INSERT INTO gl_accounts (id, "createdAt", "updatedAt", code, name, type, status, "tenantId", balance, currency)
       VALUES ($1, NOW(), NOW(), $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        '22222222-2222-2222-2222-222222222222',
        'QCOIN-2100',
        'QCoin Deposits',
        'liability',
        'ACTIVE',
        'root-admin',
        0.00,
        'QCN',
      ],
    );
    await this.customerRepository.query(
      `INSERT INTO gl_accounts (id, "createdAt", "updatedAt", code, name, type, status, "tenantId", balance, currency)
       VALUES ($1, NOW(), NOW(), $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        '33333333-3333-3333-3333-333333333333',
        'ESCROW-1300',
        'Chama Escrow',
        'asset',
        'ACTIVE',
        'root-admin',
        0.00,
        'USD',
      ],
    );
    this.logger.log('✓ Fixed-UUID GL accounts seeded');
  }
}
