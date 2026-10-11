import { request } from './client'

export type RbacPermission = {
  id: string
  slug: string
  name: string
  description?: string
  tenantId?: string
  createdAt?: string
}

export type RbacRole = {
  id: string
  name: string
  description?: string
  permissionIds: string[]
  tenantId?: string
  createdAt?: string
}

type ListResponse<T> = { data: T[]; total: number }

export type CreatePermissionRequest = {
  slug: string
  name: string
  description?: string
  tenantId: string
}

export type UpdatePermissionRequest = Partial<Omit<CreatePermissionRequest, 'tenantId'>>

export type CreateRoleRequest = {
  name: string
  description?: string
  permissionIds: string[]
  tenantId: string
}

export type UpdateRoleRequest = Partial<Omit<CreateRoleRequest, 'tenantId'>>

export async function listPermissions(tenantId: string) {
  return request<ListResponse<RbacPermission>>({
    path: '/rbac/permissions',
    auth: true,
    query: { tenantId },
  })
}

export async function createPermission(payload: CreatePermissionRequest) {
  return request<RbacPermission>({
    path: '/rbac/permissions',
    method: 'POST',
    auth: true,
    body: payload,
  })
}

export async function updatePermission(id: string, payload: UpdatePermissionRequest) {
  return request<RbacPermission>({
    path: `/rbac/permissions/${id}`,
    method: 'PUT',
    auth: true,
    body: payload,
  })
}

export async function deletePermission(id: string) {
  return request<{ message?: string }>({
    path: `/rbac/permissions/${id}`,
    method: 'DELETE',
    auth: true,
  })
}

export async function listRoles(tenantId: string) {
  return request<ListResponse<RbacRole>>({
    path: '/rbac/roles',
    auth: true,
    query: { tenantId },
  })
}

export async function createRole(payload: CreateRoleRequest) {
  return request<RbacRole>({
    path: '/rbac/roles',
    method: 'POST',
    auth: true,
    body: payload,
  })
}

export async function updateRole(id: string, payload: UpdateRoleRequest) {
  return request<RbacRole>({
    path: `/rbac/roles/${id}`,
    method: 'PUT',
    auth: true,
    body: payload,
  })
}

export async function deleteRole(id: string) {
  return request<{ message?: string }>({
    path: `/rbac/roles/${id}`,
    method: 'DELETE',
    auth: true,
  })
}

export type UserPermissionsResponse = {
  userId: string
  tenantId: string
  permissions: string[]
  roles: string[]
}

export async function assignUserToRole(userId: string, roleId: string, tenantId: string) {
  return request<{ message?: string }>({
    path: `/rbac/users/${userId}/roles/${roleId}`,
    method: 'POST',
    auth: true,
    query: { tenantId },
  })
}

export async function assignUserRoles(userId: string, roleIds: string[], tenantId: string) {
  return request<{ message?: string }>({
    path: `/rbac/users/${userId}/roles`,
    method: 'POST',
    auth: true,
    body: { roleIds, tenantId },
  })
}

export async function getUserPermissions(userId: string, tenantId: string) {
  return request<UserPermissionsResponse>({
    path: `/rbac/users/${userId}/permissions`,
    auth: true,
    query: { tenantId },
  })
}

export async function getUserRoles(userId: string, tenantId: string) {
  return request<{ roleIds: string[] }>({
    path: `/rbac/users/${userId}/roles`,
    auth: true,
    query: { tenantId },
  })
}
