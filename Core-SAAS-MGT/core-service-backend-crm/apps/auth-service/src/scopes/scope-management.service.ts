import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scope, ScopeCategory } from '../entities/scope.entity';
import { TenantScope } from '../entities/tenant-scope.entity';
import { UserScope } from '../entities/user-scope.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class ScopeManagementService {
  private readonly logger = new Logger(ScopeManagementService.name);

  constructor(
    @InjectRepository(Scope)
    private readonly scopeRepository: Repository<Scope>,
    @InjectRepository(TenantScope)
    private readonly tenantScopeRepository: Repository<TenantScope>,
    @InjectRepository(UserScope)
    private readonly userScopeRepository: Repository<UserScope>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Get all available scopes
   */
  async getAllScopes(): Promise<Scope[]> {
    return this.scopeRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Create a custom scope
   * Root admin can create system-wide scopes for managing tenant admins
   * Tenant admin can create tenant-specific scopes for their staff
   */
  async createCustomScope(
    name: string,
    description: string,
    category: ScopeCategory,
    endpoints: string[],
    methods: string[],
    resources: string[],
    actions: string[],
    createdBy: string,
    requestingTenantId: string,
    tenantId?: string,
    microservice?: string,
    requiresApproval?: boolean,
  ): Promise<Scope> {
    // Determine scope level based on who's creating it
    let scopeLevel: 'system' | 'tenant' | 'custom' = 'custom';
    let assignTenantId: string | null = null;

    if (requestingTenantId === 'root-admin') {
      // Root admin can create system-wide scopes or tenant-specific scopes
      scopeLevel = tenantId ? 'tenant' : 'system';
      assignTenantId = tenantId || null;
    } else {
      // Tenant admin can only create tenant-specific scopes for their own tenant
      scopeLevel = 'tenant';
      assignTenantId = requestingTenantId;
    }

    // Verify tenant exists if creating tenant-specific scope
    if (assignTenantId) {
      const tenant = await this.tenantRepository.findOne({
        where: { tenantId: assignTenantId },
      });

      if (!tenant) {
        throw new NotFoundException(`Tenant ${assignTenantId} not found`);
      }
    }

    // Generate unique scopeId
    const timestamp = Date.now();
    const scopeId = `${assignTenantId ? assignTenantId + '_' : ''}${name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;

    const scopeData = {
      scopeId,
      name,
      description,
      category,
      endpoints,
      methods,
      resources,
      actions,
      requiresApproval: requiresApproval || false,
      isRootOnly: false,
      isTenantAdmin: scopeLevel === 'system',
      isSystem: false,
      isActive: true,
      tenantId: assignTenantId || undefined,
      createdBy,
      scopeLevel,
      microservice: microservice || undefined,
      metadata: JSON.stringify({
        createdAt: new Date().toISOString(),
        createdBy,
        scopeLevel,
      }),
    };

    const scope = this.scopeRepository.create(scopeData as any) as unknown as Scope;
    return this.scopeRepository.save(scope);
  }

  /**
   * Update a custom scope
   */
  async updateCustomScope(
    scopeId: string,
    updates: Partial<Scope>,
    requestingTenantId: string,
  ): Promise<Scope> {
    const scope = await this.scopeRepository.findOne({
      where: { scopeId },
    });

    if (!scope) {
      throw new NotFoundException(`Scope ${scopeId} not found`);
    }

    if (scope.isSystem) {
      throw new BadRequestException('Cannot update system scopes');
    }

    // Check permissions
    if (requestingTenantId === 'root-admin') {
      // Root admin can update any custom scope
    } else if (scope.tenantId === requestingTenantId) {
      // Tenant admin can only update their own tenant's scopes
    } else {
      throw new ForbiddenException(
        'Only root admin or tenant admin can update scopes',
      );
    }

    Object.assign(scope, updates);
    scope.updatedAt = new Date();
    return this.scopeRepository.save(scope);
  }

  /**
   * Delete a custom scope
   */
  async deleteCustomScope(
    scopeId: string,
    requestingTenantId: string,
  ): Promise<void> {
    const scope = await this.scopeRepository.findOne({
      where: { scopeId },
    });

    if (!scope) {
      throw new NotFoundException(`Scope ${scopeId} not found`);
    }

    if (scope.isSystem) {
      throw new BadRequestException('Cannot delete system scopes');
    }

    // Check permissions
    if (requestingTenantId === 'root-admin') {
      // Root admin can delete any custom scope
    } else if (scope.tenantId === requestingTenantId) {
      // Tenant admin can only delete their own tenant's scopes
    } else {
      throw new ForbiddenException(
        'Only root admin or tenant admin can delete scopes',
      );
    }

    // Remove from all tenant scopes and user scopes
    await this.tenantScopeRepository.delete({ scopeId });
    await this.userScopeRepository.delete({ scopeId });

    await this.scopeRepository.remove(scope);
  }

  /**
   * Get scopes available for a tenant (system + tenant-specific)
   */
  async getAvailableScopesForTenant(tenantId: string): Promise<Scope[]> {
    const tenant = await this.tenantRepository.findOne({
      where: { tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    // Get system scopes + tenant-specific scopes
    return this.scopeRepository.find({
      where: [
        { isSystem: true, isActive: true },
        { tenantId, isActive: true },
      ],
      order: { name: 'ASC' },
    });
  }

  /**
   * Get custom scopes created by a tenant admin
   */
  async getTenantCustomScopes(tenantId: string): Promise<Scope[]> {
    return this.scopeRepository.find({
      where: { tenantId, isSystem: false, isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get custom scopes created by root admin (site-wide)
   */
  async getRootCustomScopes(): Promise<Scope[]> {
    return this.scopeRepository.find({
      where: { tenantId: undefined, isSystem: false, isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get scopes by category
   */
  async getScopesByCategory(category: ScopeCategory): Promise<Scope[]> {
    return this.scopeRepository.find({
      where: { category, isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get scopes available for a specific tenant
   */
  async getTenantScopes(tenantId: string): Promise<TenantScope[]> {
    const tenant = await this.tenantRepository.findOne({
      where: { tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    return this.tenantScopeRepository.find({
      where: { tenantId },
      order: { scopeName: 'ASC' },
    });
  }

  /**
   * Get enabled scopes for a tenant
   */
  async getEnabledTenantScopes(tenantId: string): Promise<TenantScope[]> {
    return this.tenantScopeRepository.find({
      where: { tenantId, isEnabled: true },
      order: { scopeName: 'ASC' },
    });
  }

  /**
   * Assign a scope to a tenant
   * Only root admin can assign root-only scopes
   */
  async assignScopeToTenant(
    tenantId: string,
    scopeId: string,
    grantedBy: string,
    requestingTenantId: string,
  ): Promise<TenantScope> {
    // Verify tenant exists
    const tenant = await this.tenantRepository.findOne({
      where: { tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    // Get scope
    const scope = await this.scopeRepository.findOne({
      where: { scopeId },
    });

    if (!scope) {
      throw new NotFoundException(`Scope ${scopeId} not found`);
    }

    // Check permissions - only root admin can assign root-only scopes
    if (scope.isRootOnly && requestingTenantId !== 'root-admin') {
      throw new ForbiddenException(
        `Only root admin can assign root-only scope: ${scopeId}`,
      );
    }

    // Check if already assigned
    const existing = await this.tenantScopeRepository.findOne({
      where: { tenantId, scopeId },
    });

    if (existing) {
      return existing;
    }

    // Create tenant scope
    const tenantScopeData = {
      tenantUuid: tenant.id,
      tenantId,
      scopeId,
      scopeName: scope.name,
      scopeDescription: scope.description,
      isEnabled: true,
      isRequired: false,
      grantedBy,
      approvedBy: scope.requiresApproval ? undefined : 'system',
      approvedAt: scope.requiresApproval ? undefined : new Date(),
      metadata: JSON.stringify({
        assignedAt: new Date().toISOString(),
        assignedBy: grantedBy,
      }),
    };

    const tenantScope = this.tenantScopeRepository.create(tenantScopeData as any) as unknown as TenantScope;
    return this.tenantScopeRepository.save(tenantScope);
  }

  /**
   * Remove a scope from a tenant
   */
  async removeScopeFromTenant(
    tenantId: string,
    scopeId: string,
    requestingTenantId: string,
  ): Promise<void> {
    // Only root admin or tenant admin can remove scopes
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== tenantId) {
      throw new ForbiddenException(
        'Only root admin or tenant admin can remove scopes',
      );
    }

    const tenantScope = await this.tenantScopeRepository.findOne({
      where: { tenantId, scopeId },
    });

    if (!tenantScope) {
      throw new NotFoundException(
        `Scope ${scopeId} not assigned to tenant ${tenantId}`,
      );
    }

    await this.tenantScopeRepository.remove(tenantScope);
  }

  /**
   * Enable/disable a scope for a tenant
   */
  async toggleTenantScope(
    tenantId: string,
    scopeId: string,
    isEnabled: boolean,
    requestingTenantId: string,
  ): Promise<TenantScope> {
    // Only root admin or tenant admin can toggle scopes
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== tenantId) {
      throw new ForbiddenException(
        'Only root admin or tenant admin can toggle scopes',
      );
    }

    const tenantScope = await this.tenantScopeRepository.findOne({
      where: { tenantId, scopeId },
    });

    if (!tenantScope) {
      throw new NotFoundException(
        `Scope ${scopeId} not assigned to tenant ${tenantId}`,
      );
    }

    tenantScope.isEnabled = isEnabled;
    return this.tenantScopeRepository.save(tenantScope);
  }

  /**
   * Get scopes assigned to a user
   */
  async getUserScopes(userId: string): Promise<UserScope[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    return this.userScopeRepository.find({
      where: { userUuid: userId },
      order: { scopeName: 'ASC' },
    });
  }

  /**
   * Get enabled scopes for a user
   */
  async getEnabledUserScopes(userId: string): Promise<UserScope[]> {
    return this.userScopeRepository.find({
      where: { userUuid: userId, isEnabled: true },
      order: { scopeName: 'ASC' },
    });
  }

  /**
   * Check if user has a specific scope
   */
  async userHasScope(userId: string, scopeId: string): Promise<boolean> {
    const userScope = await this.userScopeRepository.findOne({
      where: { userUuid: userId, scopeId, isEnabled: true },
    });

    if (!userScope) {
      return false;
    }

    // Check if scope is not expired
    if (userScope.expiresAt && userScope.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Assign a scope to a user
   */
  async assignScopeToUser(
    userId: string,
    scopeId: string,
    grantedBy: string,
    requestingTenantId: string,
    expiresAt?: Date,
    restrictions?: string[],
  ): Promise<UserScope> {
    // Get user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Get scope
    const scope = await this.scopeRepository.findOne({
      where: { scopeId },
    });

    if (!scope) {
      throw new NotFoundException(`Scope ${scopeId} not found`);
    }

    // Check permissions
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Can only assign scopes to users in your tenant',
      );
    }

    // Check if scope is available for user's tenant
    const tenantScope = await this.tenantScopeRepository.findOne({
      where: { tenantId: user.tenantId, scopeId, isEnabled: true },
    });

    if (!tenantScope) {
      throw new BadRequestException(
        `Scope ${scopeId} is not available for tenant ${user.tenantId}`,
      );
    }

    // Check if already assigned
    const existing = await this.userScopeRepository.findOne({
      where: { userUuid: userId, scopeId },
    });

    if (existing) {
      return existing;
    }

    // Create user scope
    const userScopeData = {
      userUuid: userId,
      tenantId: user.tenantId,
      scopeId,
      scopeName: scope.name,
      scopeDescription: scope.description,
      isEnabled: true,
      grantedBy,
      approvedBy: scope.requiresApproval ? undefined : 'system',
      approvedAt: scope.requiresApproval ? undefined : new Date(),
      expiresAt: expiresAt || undefined,
      restrictions: restrictions || [],
      metadata: JSON.stringify({
        assignedAt: new Date().toISOString(),
        assignedBy: grantedBy,
      }),
    };

    const userScope = this.userScopeRepository.create(userScopeData as any) as unknown as UserScope;
    return this.userScopeRepository.save(userScope);
  }

  /**
   * Remove a scope from a user
   */
  async removeScopeFromUser(
    userId: string,
    scopeId: string,
    requestingTenantId: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Only root admin or tenant admin can remove scopes
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Only root admin or tenant admin can remove scopes',
      );
    }

    const userScope = await this.userScopeRepository.findOne({
      where: { userUuid: userId, scopeId },
    });

    if (!userScope) {
      throw new NotFoundException(
        `Scope ${scopeId} not assigned to user ${userId}`,
      );
    }

    await this.userScopeRepository.remove(userScope);
  }

  /**
   * Enable/disable a scope for a user
   */
  async toggleUserScope(
    userId: string,
    scopeId: string,
    isEnabled: boolean,
    requestingTenantId: string,
  ): Promise<UserScope> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Only root admin or tenant admin can toggle scopes
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Only root admin or tenant admin can toggle scopes',
      );
    }

    const userScope = await this.userScopeRepository.findOne({
      where: { userUuid: userId, scopeId },
    });

    if (!userScope) {
      throw new NotFoundException(
        `Scope ${scopeId} not assigned to user ${userId}`,
      );
    }

    userScope.isEnabled = isEnabled;
    return this.userScopeRepository.save(userScope);
  }

  /**
   * Assign role scopes to a user
   */
  async assignRoleScopesToUser(
    userId: string,
    roleId: string,
    grantedBy: string,
    requestingTenantId: string,
  ): Promise<UserScope[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const role = await this.roleRepository.findOne({
      where: { roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleId} not found`);
    }

    // Only root admin or tenant admin can assign roles
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Only root admin or tenant admin can assign roles',
      );
    }

    const assignedScopes: UserScope[] = [];

    for (const scopeId of role.scopeIds) {
      try {
        const userScope = await this.assignScopeToUser(
          userId,
          scopeId,
          grantedBy,
          requestingTenantId,
        );
        assignedScopes.push(userScope);
      } catch (error) {
        this.logger.warn(
          `Failed to assign scope ${scopeId} to user ${userId}: ${error.message}`,
        );
      }
    }

    return assignedScopes;
  }

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get roles for a tenant
   */
  async getTenantRoles(tenantId: string): Promise<Role[]> {
    return this.roleRepository.find({
      where: [
        { tenantId, isActive: true },
        { tenantId: undefined, isSystem: true, isActive: true },
      ],
      order: { name: 'ASC' },
    });
  }

  /**
   * Create a custom role for a tenant
   */
  async createCustomRole(
    tenantId: string,
    name: string,
    description: string,
    scopeIds: string[],
    createdBy: string,
    requestingTenantId: string,
  ): Promise<Role> {
    // Only root admin or tenant admin can create roles
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== tenantId) {
      throw new ForbiddenException(
        'Only root admin or tenant admin can create roles',
      );
    }

    // Verify all scopes exist and are available for tenant
    for (const scopeId of scopeIds) {
      const scope = await this.scopeRepository.findOne({
        where: { scopeId },
      });

      if (!scope) {
        throw new NotFoundException(`Scope ${scopeId} not found`);
      }

      const tenantScope = await this.tenantScopeRepository.findOne({
        where: { tenantId, scopeId, isEnabled: true },
      });

      if (!tenantScope) {
        throw new BadRequestException(
          `Scope ${scopeId} is not available for tenant ${tenantId}`,
        );
      }
    }

    const roleId = `${tenantId}_${name.toLowerCase().replace(/\s+/g, '_')}`;

    const role = this.roleRepository.create({
      roleId,
      name,
      description,
      roleType: 'custom' as any,
      tenantId,
      isSystem: false,
      isCustom: true,
      scopeIds,
      createdBy,
      metadata: JSON.stringify({
        createdAt: new Date().toISOString(),
        createdBy,
      }),
    });

    return this.roleRepository.save(role);
  }

  /**
   * Update a custom role
   */
  async updateCustomRole(
    roleId: string,
    updates: Partial<Role>,
    requestingTenantId: string,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleId} not found`);
    }

    if (!role.isCustom) {
      throw new BadRequestException('Cannot update system roles');
    }

    // Only root admin or tenant admin can update roles
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== role.tenantId) {
      throw new ForbiddenException(
        'Only root admin or tenant admin can update roles',
      );
    }

    Object.assign(role, updates);
    return this.roleRepository.save(role);
  }

  /**
   * Delete a custom role
   */
  async deleteCustomRole(
    roleId: string,
    requestingTenantId: string,
  ): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleId} not found`);
    }

    if (!role.isCustom) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Only root admin or tenant admin can delete roles
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== role.tenantId) {
      throw new ForbiddenException(
        'Only root admin or tenant admin can delete roles',
      );
    }

    await this.roleRepository.remove(role);
  }

  /**
   * Validate user scopes for an endpoint
   */
  async validateUserScopesForEndpoint(
    userId: string,
    requiredScopes: string[],
  ): Promise<boolean> {
    if (!requiredScopes || requiredScopes.length === 0) {
      return true; // No scopes required
    }

    for (const scopeId of requiredScopes) {
      const hasScope = await this.userHasScope(userId, scopeId);
      if (!hasScope) {
        return false;
      }
    }

    return true;
  }

  /**
   * Track scope usage
   */
  async trackScopeUsage(userId: string, scopeId: string): Promise<void> {
    const userScope = await this.userScopeRepository.findOne({
      where: { userUuid: userId, scopeId },
    });

    if (userScope) {
      userScope.usageCount = (userScope.usageCount || 0) + 1;
      userScope.lastUsedAt = new Date();
      await this.userScopeRepository.save(userScope);
    }
  }

  /**
   * Get scope usage statistics for a user
   */
  async getUserScopeUsageStats(userId: string): Promise<any> {
    const userScopes = await this.userScopeRepository.find({
      where: { userUuid: userId },
    });

    return {
      totalScopes: userScopes.length,
      enabledScopes: userScopes.filter((s) => s.isEnabled).length,
      totalUsage: userScopes.reduce((sum, s) => sum + (s.usageCount || 0), 0),
      scopes: userScopes.map((s) => ({
        scopeId: s.scopeId,
        scopeName: s.scopeName,
        usageCount: s.usageCount,
        lastUsedAt: s.lastUsedAt,
        isEnabled: s.isEnabled,
        expiresAt: s.expiresAt,
      })),
    };
  }

  /**
   * Bulk assign scopes to a user (for staff management)
   */
  async bulkAssignScopesToUser(
    userId: string,
    scopeIds: string[],
    grantedBy: string,
    requestingTenantId: string,
    expiresAt?: Date,
  ): Promise<UserScope[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Check permissions
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Can only assign scopes to users in your tenant',
      );
    }

    const assignedScopes: UserScope[] = [];

    for (const scopeId of scopeIds) {
      try {
        const userScope = await this.assignScopeToUser(
          userId,
          scopeId,
          grantedBy,
          requestingTenantId,
          expiresAt,
        );
        assignedScopes.push(userScope);
      } catch (error) {
        this.logger.warn(
          `Failed to assign scope ${scopeId} to user ${userId}: ${error.message}`,
        );
      }
    }

    return assignedScopes;
  }

  /**
   * Bulk remove scopes from a user
   */
  async bulkRemoveScopesFromUser(
    userId: string,
    scopeIds: string[],
    requestingTenantId: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Check permissions
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Can only remove scopes from users in your tenant',
      );
    }

    for (const scopeId of scopeIds) {
      try {
        await this.removeScopeFromUser(userId, scopeId, requestingTenantId);
      } catch (error) {
        this.logger.warn(
          `Failed to remove scope ${scopeId} from user ${userId}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Get all staff members in a tenant
   */
  async getTenantStaff(tenantId: string): Promise<User[]> {
    const tenant = await this.tenantRepository.findOne({
      where: { tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    return this.userRepository.find({
      where: { tenantId, status: 'active' as any },
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
  }

  /**
   * Get staff member details with their scopes
   */
  async getStaffMemberWithScopes(
    userId: string,
    requestingTenantId: string,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Check permissions
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Can only view staff members in your tenant',
      );
    }

    const userScopes = await this.userScopeRepository.find({
      where: { userUuid: userId },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
        status: user.status,
      },
      scopes: userScopes,
      totalScopes: userScopes.length,
      enabledScopes: userScopes.filter((s) => s.isEnabled).length,
    };
  }

  /**
   * Manage staff member scopes (comprehensive update)
   */
  async manageStaffMemberScopes(
    userId: string,
    scopeUpdates: {
      add?: string[];
      remove?: string[];
      enable?: string[];
      disable?: string[];
    },
    grantedBy: string,
    requestingTenantId: string,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Check permissions
    if (requestingTenantId !== 'root-admin' && requestingTenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Can only manage scopes for staff in your tenant',
      );
    }

    const results: any = {
      added: [],
      removed: [],
      enabled: [],
      disabled: [],
    };

    // Add scopes
    if (scopeUpdates.add && scopeUpdates.add.length > 0) {
      for (const scopeId of scopeUpdates.add) {
        try {
          const userScope = await this.assignScopeToUser(
            userId,
            scopeId,
            grantedBy,
            requestingTenantId,
          );
          results.added.push(userScope);
        } catch (error) {
          this.logger.warn(`Failed to add scope ${scopeId}: ${error.message}`);
        }
      }
    }

    // Remove scopes
    if (scopeUpdates.remove && scopeUpdates.remove.length > 0) {
      for (const scopeId of scopeUpdates.remove) {
        try {
          await this.removeScopeFromUser(userId, scopeId, requestingTenantId);
          results.removed.push(scopeId);
        } catch (error) {
          this.logger.warn(`Failed to remove scope ${scopeId}: ${error.message}`);
        }
      }
    }

    // Enable scopes
    if (scopeUpdates.enable && scopeUpdates.enable.length > 0) {
      for (const scopeId of scopeUpdates.enable) {
        try {
          const userScope = await this.toggleUserScope(
            userId,
            scopeId,
            true,
            requestingTenantId,
          );
          results.enabled.push(userScope);
        } catch (error) {
          this.logger.warn(`Failed to enable scope ${scopeId}: ${error.message}`);
        }
      }
    }

    // Disable scopes
    if (scopeUpdates.disable && scopeUpdates.disable.length > 0) {
      for (const scopeId of scopeUpdates.disable) {
        try {
          const userScope = await this.toggleUserScope(
            userId,
            scopeId,
            false,
            requestingTenantId,
          );
          results.disabled.push(userScope);
        } catch (error) {
          this.logger.warn(`Failed to disable scope ${scopeId}: ${error.message}`);
        }
      }
    }

    return results;
  }
}
