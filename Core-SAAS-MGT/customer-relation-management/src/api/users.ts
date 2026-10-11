import { request } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Platform roles — controls what a user can do across the system.
 *
 * root_admin      → owner of the entire platform; tenantId = 'root-admin'
 *                   can oversee all tenants, designate other admins/staff
 * tenant_admin    → company that subscribed to a plan; manages their workspace,
 *                   can invite staff and account officers
 * account_officer → elevated staff for financial/legal operations under a tenant
 * staff           → regular invited staff; access limited by roles/scopes
 *                   assigned by their tenant admin
 */
export type UserRole = 'root_admin' | 'tenant_admin' | 'account_officer' | 'staff'

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending'

export interface PlatformUser {
  id: string
  email: string
  phone: string
  firstName: string | null
  lastName: string | null
  tenantId: string
  role: UserRole
  status: UserStatus
  isVerified: boolean
  mfaEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserPayload {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
  /** Only root-admin can set a different tenantId; others are locked to their own */
  tenantId?: string
  role?: UserRole
  status?: UserStatus
  isVerified?: boolean
}

export interface UpdateUserPayload {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  status?: UserStatus
  isVerified?: boolean
  role?: UserRole
  password?: string
}

type ListResponse<T> = { data: T[]; total: number }

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * List users.
 * - root-admin: returns all users across all tenants (optionally filter by tenantId)
 * - tenant-admin / account-officer / staff: returns only users in their own tenant
 */
export async function listUsers(filterTenantId?: string) {
  return request<ListResponse<PlatformUser>>({
    path: '/auth/users',
    method: 'GET',
    query: filterTenantId ? { tenantId: filterTenantId } : undefined,
    auth: true,
  })
}

/** Get a single user by ID */
export async function getUser(id: string) {
  return request<PlatformUser>({
    path: `/auth/users/${id}`,
    method: 'GET',
    auth: true,
  })
}

/**
 * Create a new platform user (staff, account officer, or tenant admin).
 * - root-admin can create users in any tenant
 * - tenant-admin can create staff/account-officers in their own tenant
 */
export async function createUser(data: CreateUserPayload) {
  return request<PlatformUser>({
    path: '/auth/users',
    method: 'POST',
    body: data,
    auth: true,
  })
}

/** Update a user's profile, status, or role */
export async function updateUser(id: string, data: UpdateUserPayload) {
  return request<PlatformUser>({
    path: `/auth/users/${id}`,
    method: 'PATCH',
    body: data,
    auth: true,
  })
}

/** Suspend a user (non-destructive disable — sets status to inactive) */
export async function disableUser(id: string) {
  return request<PlatformUser>({
    path: `/auth/users/${id}`,
    method: 'PATCH',
    body: { status: 'inactive' },
    auth: true,
  })
}

/** Delete a user permanently */
export async function deleteUser(id: string) {
  return request<void>({
    path: `/auth/users/${id}`,
    method: 'DELETE',
    auth: true,
  })
}

// ─── Role helpers ─────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
  root_admin:      'Root Admin',
  tenant_admin:    'Tenant Admin',
  account_officer: 'Account Officer',
  staff:           'Staff',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  root_admin:      'Platform owner — full site-wide access across all tenants',
  tenant_admin:    'Subscribed company admin — manages their workspace and invites staff',
  account_officer: 'Elevated staff for financial, legal and compliance operations',
  staff:           'Regular invited staff — access controlled by roles and scopes',
}

/** Returns true if the user can manage other users */
export function canManageUsers(role: UserRole): boolean {
  return role === 'root_admin' || role === 'tenant_admin'
}

/** Returns true if the user has site-wide access */
export function isSiteWide(role: UserRole): boolean {
  return role === 'root_admin'
}

// ─── Type aliases for backward-compat with UserManagementHub ─────────────────
export type CreateUserRequest = CreateUserPayload
export type UpdateUserRequest = UpdateUserPayload
