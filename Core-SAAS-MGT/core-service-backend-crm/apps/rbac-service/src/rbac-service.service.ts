import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { PermissionsRepository } from './repositories/permissions.repository';
import { RolesRepository } from './repositories/roles.repository';
import { UserRolesRepository } from './repositories/user-roles.repository';
import { PoliciesRepository } from './repositories/policies.repository';
import { AbacService, AbacContext } from './abac/abac.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { CreatePolicyDto } from './dto/policy.dto';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { Policy } from './entities/policy.entity';

@Injectable()
export class RbacServiceService {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly userRolesRepository: UserRolesRepository,
    private readonly policiesRepository: PoliciesRepository,
    private readonly abacService: AbacService,
  ) {}

  private toRoleResponse(role: Role) {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      tenantId: role.tenantId,
      createdAt: role.createdAt,
      permissionIds: (role.permissions ?? []).map((p) => p.id),
    };
  }

  async createPermission(dto: CreatePermissionDto) {
    const permission = new Permission();
    Object.assign(permission, dto);
    return this.permissionsRepository.create(permission);
  }

  async getPermissions(tenantId: string) {
    const data = await this.permissionsRepository.find({ tenantId });
    return { data, total: data.length };
  }

  async updatePermission(id: string, dto: UpdatePermissionDto) {
    return this.permissionsRepository.findOneAndUpdate({ id }, dto);
  }

  async deletePermission(id: string) {
    return this.permissionsRepository.findOneAndDelete({ id });
  }

  async createRole(dto: CreateRoleDto) {
    const { permissionIds, ...roleData } = dto;
    const permissions = permissionIds
      ? await this.permissionsRepository.find({ id: In(permissionIds) })
      : [];

    const roleEntity = new Role();
    Object.assign(roleEntity, roleData);
    roleEntity.permissions = permissions;

    const created = await this.rolesRepository.create(roleEntity);
    return this.toRoleResponse(created);
  }

  async getRoles(tenantId: string) {
    const roles = await this.rolesRepository.find(
      { tenantId },
      { permissions: true },
    );
    const data = roles.map((r) => this.toRoleResponse(r));
    return { data, total: data.length };
  }

  async updateRole(id: string, dto: UpdateRoleDto) {
    const { permissionIds, ...roleData } = dto;
    const role = await this.rolesRepository.findOne({ id }, { permissions: true });

    if (permissionIds) {
      role.permissions = await this.permissionsRepository.find({
        id: In(permissionIds),
      });
    }

    Object.assign(role, roleData);
    const updated = await this.rolesRepository.create(role);
    return this.toRoleResponse(updated);
  }

  async deleteRole(id: string) {
    return this.rolesRepository.findOneAndDelete({ id });
  }

  async assignUserToRole(userId: string, roleId: string, tenantId: string) {
    const role = await this.rolesRepository.findOne({ id: roleId });
    const userRoleEntity = new UserRole();
    userRoleEntity.userId = userId;
    userRoleEntity.role = role;
    userRoleEntity.tenantId = tenantId;

    return this.userRolesRepository.create(userRoleEntity);
  }

  async assignUserRoles(userId: string, roleIds: string[], tenantId: string) {
    await this.userRolesRepository.deleteByUserIdAndTenant(userId, tenantId);
    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return [];
    }
    const roles = await this.rolesRepository.find({ id: In(roleIds) });
    const userRoles = roles.map((role) => {
      const ur = new UserRole();
      ur.userId = userId;
      ur.role = role;
      ur.tenantId = tenantId;
      return ur;
    });
    return this.userRolesRepository.saveMany(userRoles);
  }

  async getUserRoles(userId: string, tenantId: string) {
    const userRoles = await this.userRolesRepository.find(
      { userId, tenantId },
      { role: true },
    );
    return userRoles
      .map((ur) => ur.role?.id)
      .filter((id): id is string => typeof id === 'string');
  }

  async getUserPermissions(userId: string, tenantId: string) {
    const userRoles = await this.userRolesRepository.find(
      { userId, tenantId },
      { role: { permissions: true } },
    );

    const permissions = new Set<string>();
    userRoles.forEach((ur) => {
      if (ur.role && ur.role.permissions) {
        ur.role.permissions.forEach((p) => permissions.add(p.slug));
      }
    });

    return Array.from(permissions);
  }

  // Policies
  async createPolicy(dto: CreatePolicyDto) {
    const policy = new Policy();
    Object.assign(policy, dto);
    return this.policiesRepository.create(policy);
  }

  async getPolicies(tenantId: string) {
    return this.policiesRepository.find({ tenantId });
  }

  async evaluatePolicy(policyId: string, context: AbacContext) {
    const policy = await this.policiesRepository.findOne({ id: policyId });
    const allowed = this.abacService.evaluate(policy.rules, context);
    return { allowed };
  }
}
