import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RbacServiceService } from './rbac-service.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { CreatePolicyDto, EvaluatePolicyDto } from './dto/policy.dto';

@ApiTags('RBAC Service')
@Controller('rbac')
export class RbacServiceController {
  constructor(private readonly rbacService: RbacServiceService) {}

  @Post('permissions')
  @ApiOperation({ summary: 'Create a permission', description: 'Creates a new permission with a unique slug, name, description, and tenant context.' })
  @ApiBody({ type: CreatePermissionDto, description: 'Permission creation payload' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Permission slug already exists' })
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Get all permissions', description: 'Retrieves all permissions for a given tenant.' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant identifier' })
  @ApiResponse({ status: 200, description: 'Permissions returned successfully' })
  getPermissions(@Query('tenantId') tenantId: string) {
    return this.rbacService.getPermissions(tenantId);
  }

  @Put('permissions/:id')
  @ApiOperation({ summary: 'Update a permission', description: 'Updates an existing permission by its ID.' })
  @ApiParam({ name: 'id', required: true, description: 'Permission ID' })
  @ApiBody({ type: UpdatePermissionDto, description: 'Permission update payload' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  updatePermission(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.rbacService.updatePermission(id, dto);
  }

  @Delete('permissions/:id')
  @ApiOperation({ summary: 'Delete a permission', description: 'Deletes a permission by its ID.' })
  @ApiParam({ name: 'id', required: true, description: 'Permission ID' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  deletePermission(@Param('id') id: string) {
    return this.rbacService.deletePermission(id);
  }

  @Post('roles')
  @ApiOperation({ summary: 'Create a role', description: 'Creates a new role with optional permission assignments.' })
  @ApiBody({ type: CreateRoleDto, description: 'Role creation payload' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Role name already exists' })
  createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles', description: 'Retrieves all roles for a given tenant.' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant identifier' })
  @ApiResponse({ status: 200, description: 'Roles returned successfully' })
  getRoles(@Query('tenantId') tenantId: string) {
    return this.rbacService.getRoles(tenantId);
  }

  @Put('roles/:id')
  @ApiOperation({ summary: 'Update a role', description: 'Updates an existing role by its ID, including permission assignments.' })
  @ApiParam({ name: 'id', required: true, description: 'Role ID' })
  @ApiBody({ type: UpdateRoleDto, description: 'Role update payload' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rbacService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Delete a role', description: 'Deletes a role by its ID.' })
  @ApiParam({ name: 'id', required: true, description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  deleteRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }

  @Post('users/:userId/roles/:roleId')
  @ApiOperation({ summary: 'Assign a user to a single role', description: 'Directly assigns a user to a specific role within a tenant.' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiParam({ name: 'roleId', required: true, description: 'Role ID' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant identifier' })
  @ApiResponse({ status: 201, description: 'User assigned to role successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  assignUserToRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.rbacService.assignUserToRole(userId, roleId, tenantId);
  }

  @Post('users/:userId/roles')
  @ApiOperation({ summary: 'Assign multiple roles to a user', description: 'Assigns multiple roles to a user in a single operation.' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiBody({ schema: { example: { roleIds: ['role-uuid-1', 'role-uuid-2'], tenantId: 'root-admin' } }, description: 'Bulk role assignment payload' })
  @ApiResponse({ status: 201, description: 'Roles assigned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'User or roles not found' })
  assignUserRoles(
    @Param('userId') userId: string,
    @Body() dto: { roleIds: string[]; tenantId: string },
  ) {
    return this.rbacService.assignUserRoles(userId, dto.roleIds, dto.tenantId);
  }

  @Get('users/:userId/permissions')
  @ApiOperation({ summary: 'Get user permissions', description: 'Retrieves all permissions for a user within a tenant, aggregated from their assigned roles.' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant identifier' })
  @ApiResponse({ status: 200, description: 'User permissions returned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserPermissions(
    @Param('userId') userId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.rbacService.getUserPermissions(userId, tenantId);
  }

  @Post('policies')
  @ApiOperation({ summary: 'Create a policy', description: 'Creates a new policy with name, rules, and tenant context.' })
  @ApiBody({ type: CreatePolicyDto, description: 'Policy creation payload' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Policy with the same name already exists' })
  createPolicy(@Body() dto: CreatePolicyDto) {
    return this.rbacService.createPolicy(dto);
  }

  @Get('policies')
  @ApiOperation({ summary: 'Get all policies', description: 'Retrieves all policies for a given tenant.' })
  @ApiQuery({ name: 'tenantId', required: true, description: 'Tenant identifier' })
  @ApiResponse({ status: 200, description: 'Policies returned successfully' })
  getPolicies(@Query('tenantId') tenantId: string) {
    return this.rbacService.getPolicies(tenantId);
  }

  @Post('policies/evaluate')
  @ApiOperation({ summary: 'Evaluate a policy', description: 'Evaluates a policy against the provided context data and returns the decision.' })
  @ApiBody({ type: EvaluatePolicyDto, description: 'Policy evaluation payload' })
  @ApiResponse({ status: 200, description: 'Policy evaluated; returns allow/deny decision' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  evaluatePolicy(@Body() dto: EvaluatePolicyDto) {
    return this.rbacService.evaluatePolicy(dto.policyId, dto.context);
  }
}
