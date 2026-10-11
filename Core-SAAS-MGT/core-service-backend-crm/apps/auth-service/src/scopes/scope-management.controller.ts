import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ScopeManagementService } from './scope-management.service';
import { Scope, ScopeCategory } from '../entities/scope.entity';
import { TenantScope } from '../entities/tenant-scope.entity';
import { UserScope } from '../entities/user-scope.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';

@ApiTags('Scope Management')
@Controller('scopes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScopeManagementController {
  constructor(private readonly scopeManagementService: ScopeManagementService) {}

  /**
   * Get all available scopes
   */
  @Get()
  @ApiOperation({ summary: 'Get all available scopes' })
  @ApiResponse({
    status: 200,
    description: 'List of all available scopes',
    type: [Scope],
  })
  async getAllScopes(): Promise<Scope[]> {
    return this.scopeManagementService.getAllScopes();
  }

  /**
   * Get scopes available for a tenant (system + tenant-specific)
   */
  @Get('available/tenant/:tenantId')
  @ApiOperation({ summary: 'Get all scopes available for a tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'List of scopes available for the tenant',
    type: [Scope],
  })
  async getAvailableScopesForTenant(
    @Param('tenantId') tenantId: string,
    @Request() req: any,
  ): Promise<Scope[]> {
    // Verify user is from the same tenant or is root admin
    if (req.user.tenantId !== tenantId && req.user.tenantId !== 'root-admin') {
      throw new Error('Unauthorized');
    }

    return this.scopeManagementService.getAvailableScopesForTenant(tenantId);
  }

  /**
   * Get custom scopes created by a tenant admin
   */
  @Get('custom/tenant/:tenantId')
  @ApiOperation({ summary: 'Get custom scopes created by a tenant admin' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'List of custom scopes for the tenant',
    type: [Scope],
  })
  async getTenantCustomScopes(
    @Param('tenantId') tenantId: string,
    @Request() req: any,
  ): Promise<Scope[]> {
    // Verify user is from the same tenant or is root admin
    if (req.user.tenantId !== tenantId && req.user.tenantId !== 'root-admin') {
      throw new Error('Unauthorized');
    }

    return this.scopeManagementService.getTenantCustomScopes(tenantId);
  }

  /**
   * Get custom scopes created by root admin (site-wide)
   */
  @Get('custom/root')
  @ApiOperation({ summary: 'Get custom scopes created by root admin' })
  @ApiResponse({
    status: 200,
    description: 'List of root custom scopes',
    type: [Scope],
  })
  async getRootCustomScopes(@Request() req: any): Promise<Scope[]> {
    // Only root admin can view root custom scopes
    if (req.user.tenantId !== 'root-admin') {
      throw new Error('Unauthorized');
    }

    return this.scopeManagementService.getRootCustomScopes();
  }

  /**
   * Create a custom scope
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a custom scope' })
  @ApiResponse({
    status: 201,
    description: 'Custom scope created',
    type: Scope,
  })
  async createCustomScope(
    @Body()
    body: {
      name: string;
      description: string;
      category: ScopeCategory;
      endpoints: string[];
      methods: string[];
      resources: string[];
      actions: string[];
      tenantId?: string;
      microservice?: string;
      requiresApproval?: boolean;
    },
    @Request() req: any,
  ): Promise<Scope> {
    return this.scopeManagementService.createCustomScope(
      body.name,
      body.description,
      body.category,
      body.endpoints,
      body.methods,
      body.resources,
      body.actions,
      req.user.id,
      req.user.tenantId,
      body.tenantId,
      body.microservice,
      body.requiresApproval,
    );
  }

  /**
   * Update a custom scope
   */
  @Put('update/:scopeId')
  @ApiOperation({ summary: 'Update a custom scope' })
  @ApiParam({ name: 'scopeId', description: 'Scope ID to update' })
  @ApiResponse({
    status: 200,
    description: 'Custom scope updated',
    type: Scope,
  })
  async updateCustomScope(
    @Param('scopeId') scopeId: string,
    @Body() updates: Partial<Scope>,
    @Request() req: any,
  ): Promise<Scope> {
    return this.scopeManagementService.updateCustomScope(
      scopeId,
      updates,
      req.user.tenantId,
    );
  }

  /**
   * Delete a custom scope
   */
  @Delete('delete/:scopeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a custom scope' })
  @ApiParam({ name: 'scopeId', description: 'Scope ID to delete' })
  @ApiResponse({ status: 204, description: 'Custom scope deleted' })
  async deleteCustomScope(
    @Param('scopeId') scopeId: string,
    @Request() req: any,
  ): Promise<void> {
    return this.scopeManagementService.deleteCustomScope(
      scopeId,
      req.user.tenantId,
    );
  }

  /**
   * Get scopes by category
   */
  @Get('category/:category')
  @ApiOperation({ summary: 'Get scopes by category' })
  @ApiParam({ name: 'category', description: 'Scope category' })
  @ApiResponse({
    status: 200,
    description: 'List of scopes in the specified category',
    type: [Scope],
  })
  async getScopesByCategory(
    @Param('category') category: ScopeCategory,
  ): Promise<Scope[]> {
    return this.scopeManagementService.getScopesByCategory(category);
  }

  /**
   * Get scopes for a tenant
   */
  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Get scopes available for a tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'List of scopes available for the tenant',
    type: [TenantScope],
  })
  async getTenantScopes(
    @Param('tenantId') tenantId: string,
    @Request() req: any,
  ): Promise<TenantScope[]> {
    // Verify user is from the same tenant or is root admin
    if (req.user.tenantId !== tenantId && req.user.tenantId !== 'root-admin') {
      throw new Error('Unauthorized');
    }

    return this.scopeManagementService.getTenantScopes(tenantId);
  }

  /**
   * Assign a scope to a tenant
   */
  @Post('tenant/:tenantId/assign/:scopeId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign a scope to a tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'scopeId', description: 'Scope ID to assign' })
  @ApiResponse({
    status: 201,
    description: 'Scope assigned to tenant',
    type: TenantScope,
  })
  async assignScopeToTenant(
    @Param('tenantId') tenantId: string,
    @Param('scopeId') scopeId: string,
    @Request() req: any,
  ): Promise<TenantScope> {
    return this.scopeManagementService.assignScopeToTenant(
      tenantId,
      scopeId,
      req.user.id,
      req.user.tenantId,
    );
  }

  /**
   * Remove a scope from a tenant
   */
  @Delete('tenant/:tenantId/remove/:scopeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a scope from a tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'scopeId', description: 'Scope ID to remove' })
  @ApiResponse({ status: 204, description: 'Scope removed from tenant' })
  async removeScopeFromTenant(
    @Param('tenantId') tenantId: string,
    @Param('scopeId') scopeId: string,
    @Request() req: any,
  ): Promise<void> {
    return this.scopeManagementService.removeScopeFromTenant(
      tenantId,
      scopeId,
      req.user.tenantId,
    );
  }

  /**
   * Toggle a scope for a tenant
   */
  @Put('tenant/:tenantId/toggle/:scopeId')
  @ApiOperation({ summary: 'Enable/disable a scope for a tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiParam({ name: 'scopeId', description: 'Scope ID to toggle' })
  @ApiResponse({
    status: 200,
    description: 'Scope toggled for tenant',
    type: TenantScope,
  })
  async toggleTenantScope(
    @Param('tenantId') tenantId: string,
    @Param('scopeId') scopeId: string,
    @Body() body: { isEnabled: boolean },
    @Request() req: any,
  ): Promise<TenantScope> {
    return this.scopeManagementService.toggleTenantScope(
      tenantId,
      scopeId,
      body.isEnabled,
      req.user.tenantId,
    );
  }

  /**
   * Get scopes for a user
   */
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get scopes assigned to a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'List of scopes assigned to the user',
    type: [UserScope],
  })
  async getUserScopes(
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<UserScope[]> {
    return this.scopeManagementService.getUserScopes(userId);
  }

  /**
   * Assign a scope to a user
   */
  @Post('user/:userId/assign/:scopeId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign a scope to a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'scopeId', description: 'Scope ID to assign' })
  @ApiResponse({
    status: 201,
    description: 'Scope assigned to user',
    type: UserScope,
  })
  async assignScopeToUser(
    @Param('userId') userId: string,
    @Param('scopeId') scopeId: string,
    @Body() body: { expiresAt?: Date; restrictions?: string[] },
    @Request() req: any,
  ): Promise<UserScope> {
    return this.scopeManagementService.assignScopeToUser(
      userId,
      scopeId,
      req.user.id,
      req.user.tenantId,
      body.expiresAt,
      body.restrictions,
    );
  }

  /**
   * Remove a scope from a user
   */
  @Delete('user/:userId/remove/:scopeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a scope from a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'scopeId', description: 'Scope ID to remove' })
  @ApiResponse({ status: 204, description: 'Scope removed from user' })
  async removeScopeFromUser(
    @Param('userId') userId: string,
    @Param('scopeId') scopeId: string,
    @Request() req: any,
  ): Promise<void> {
    return this.scopeManagementService.removeScopeFromUser(
      userId,
      scopeId,
      req.user.tenantId,
    );
  }

  /**
   * Toggle a scope for a user
   */
  @Put('user/:userId/toggle/:scopeId')
  @ApiOperation({ summary: 'Enable/disable a scope for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'scopeId', description: 'Scope ID to toggle' })
  @ApiResponse({
    status: 200,
    description: 'Scope toggled for user',
    type: UserScope,
  })
  async toggleUserScope(
    @Param('userId') userId: string,
    @Param('scopeId') scopeId: string,
    @Body() body: { isEnabled: boolean },
    @Request() req: any,
  ): Promise<UserScope> {
    return this.scopeManagementService.toggleUserScope(
      userId,
      scopeId,
      body.isEnabled,
      req.user.tenantId,
    );
  }

  /**
   * Assign role scopes to a user
   */
  @Post('user/:userId/assign-role/:roleId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign all scopes from a role to a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiResponse({
    status: 201,
    description: 'Role scopes assigned to user',
    type: [UserScope],
  })
  async assignRoleScopesToUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Request() req: any,
  ): Promise<UserScope[]> {
    return this.scopeManagementService.assignRoleScopesToUser(
      userId,
      roleId,
      req.user.id,
      req.user.tenantId,
    );
  }

  /**
   * Get all roles
   */
  @Get('roles/all')
  @ApiOperation({ summary: 'Get all available roles' })
  @ApiResponse({
    status: 200,
    description: 'List of all available roles',
    type: [Role],
  })
  async getAllRoles(): Promise<Role[]> {
    return this.scopeManagementService.getAllRoles();
  }

  /**
   * Get roles for a tenant
   */
  @Get('roles/tenant/:tenantId')
  @ApiOperation({ summary: 'Get roles available for a tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'List of roles available for the tenant',
    type: [Role],
  })
  async getTenantRoles(
    @Param('tenantId') tenantId: string,
    @Request() req: any,
  ): Promise<Role[]> {
    // Verify user is from the same tenant or is root admin
    if (req.user.tenantId !== tenantId && req.user.tenantId !== 'root-admin') {
      throw new Error('Unauthorized');
    }

    return this.scopeManagementService.getTenantRoles(tenantId);
  }

  /**
   * Create a custom role
   */
  @Post('roles/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a custom role for a tenant' })
  @ApiResponse({
    status: 201,
    description: 'Custom role created',
    type: Role,
  })
  async createCustomRole(
    @Body()
    body: {
      tenantId: string;
      name: string;
      description: string;
      scopeIds: string[];
    },
    @Request() req: any,
  ): Promise<Role> {
    return this.scopeManagementService.createCustomRole(
      body.tenantId,
      body.name,
      body.description,
      body.scopeIds,
      req.user.id,
      req.user.tenantId,
    );
  }

  /**
   * Update a custom role
   */
  @Put('roles/:roleId')
  @ApiOperation({ summary: 'Update a custom role' })
  @ApiParam({ name: 'roleId', description: 'Role ID to update' })
  @ApiResponse({
    status: 200,
    description: 'Custom role updated',
    type: Role,
  })
  async updateCustomRole(
    @Param('roleId') roleId: string,
    @Body() updates: Partial<Role>,
    @Request() req: any,
  ): Promise<Role> {
    return this.scopeManagementService.updateCustomRole(
      roleId,
      updates,
      req.user.tenantId,
    );
  }

  /**
   * Delete a custom role
   */
  @Delete('roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a custom role' })
  @ApiParam({ name: 'roleId', description: 'Role ID to delete' })
  @ApiResponse({ status: 204, description: 'Custom role deleted' })
  async deleteCustomRole(
    @Param('roleId') roleId: string,
    @Request() req: any,
  ): Promise<void> {
    return this.scopeManagementService.deleteCustomRole(
      roleId,
      req.user.tenantId,
    );
  }

  /**
   * Get scope usage statistics for a user
   */
  @Get('user/:userId/usage-stats')
  @ApiOperation({ summary: 'Get scope usage statistics for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Scope usage statistics',
  })
  async getUserScopeUsageStats(
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.scopeManagementService.getUserScopeUsageStats(userId);
  }

  /**
   * Get all staff members in a tenant
   */
  @Get('staff/tenant/:tenantId')
  @ApiOperation({ summary: 'Get all staff members in a tenant' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'List of staff members',
    type: [User],
  })
  async getTenantStaff(
    @Param('tenantId') tenantId: string,
    @Request() req: any,
  ): Promise<User[]> {
    // Verify user is from the same tenant or is root admin
    if (req.user.tenantId !== tenantId && req.user.tenantId !== 'root-admin') {
      throw new Error('Unauthorized');
    }

    return this.scopeManagementService.getTenantStaff(tenantId);
  }

  /**
   * Get staff member details with their scopes
   */
  @Get('staff/:userId/details')
  @ApiOperation({ summary: 'Get staff member details with their scopes' })
  @ApiParam({ name: 'userId', description: 'Staff user ID' })
  @ApiResponse({
    status: 200,
    description: 'Staff member details with scopes',
  })
  async getStaffMemberWithScopes(
    @Param('userId') userId: string,
    @Request() req: any,
  ): Promise<any> {
    return this.scopeManagementService.getStaffMemberWithScopes(
      userId,
      req.user.tenantId,
    );
  }

  /**
   * Manage staff member scopes (comprehensive update)
   */
  @Post('staff/:userId/manage-scopes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manage staff member scopes' })
  @ApiParam({ name: 'userId', description: 'Staff user ID' })
  @ApiResponse({
    status: 200,
    description: 'Scope management results',
  })
  async manageStaffMemberScopes(
    @Param('userId') userId: string,
    @Body()
    body: {
      add?: string[];
      remove?: string[];
      enable?: string[];
      disable?: string[];
    },
    @Request() req: any,
  ): Promise<any> {
    return this.scopeManagementService.manageStaffMemberScopes(
      userId,
      body,
      req.user.id,
      req.user.tenantId,
    );
  }

  /**
   * Bulk assign scopes to a user
   */
  @Post('user/:userId/bulk-assign')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bulk assign scopes to a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 201,
    description: 'Scopes assigned to user',
    type: [UserScope],
  })
  async bulkAssignScopesToUser(
    @Param('userId') userId: string,
    @Body() body: { scopeIds: string[]; expiresAt?: Date },
    @Request() req: any,
  ): Promise<UserScope[]> {
    return this.scopeManagementService.bulkAssignScopesToUser(
      userId,
      body.scopeIds,
      req.user.id,
      req.user.tenantId,
      body.expiresAt,
    );
  }

  /**
   * Bulk remove scopes from a user
   */
  @Post('user/:userId/bulk-remove')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk remove scopes from a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'Scopes removed from user' })
  async bulkRemoveScopesFromUser(
    @Param('userId') userId: string,
    @Body() body: { scopeIds: string[] },
    @Request() req: any,
  ): Promise<void> {
    return this.scopeManagementService.bulkRemoveScopesFromUser(
      userId,
      body.scopeIds,
      req.user.tenantId,
    );
  }
}
