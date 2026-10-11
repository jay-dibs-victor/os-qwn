import { apiClient } from './client';

/**
 * Scope API Client
 * Handles all scope management API calls
 */

// Types
export interface Scope {
  id: string;
  scopeId: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  microservice?: string;
  endpoints?: string[];
  methods?: string[];
  resources?: string[];
  actions?: string[];
  requiresApproval?: boolean;
  isRootOnly?: boolean;
  isTenantAdmin?: boolean;
  isSystem?: boolean;
  tenantId?: string | null;
  scopeLevel?: 'system' | 'tenant' | 'custom';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantScope {
  id: string;
  tenantId: string;
  scopeId: string;
  scopeName: string;
  scopeDescription?: string;
  isEnabled: boolean;
  isRequired?: boolean;
  grantedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  usageCount?: number;
  lastUsedAt?: string;
}

export interface UserScope {
  id: string;
  userId: string;
  tenantId: string;
  scopeId: string;
  scopeName: string;
  scopeDescription?: string;
  isEnabled: boolean;
  grantedBy?: string;
  expiresAt?: string;
  usageCount?: number;
  lastUsedAt?: string;
  restrictions?: string[];
}

export interface Role {
  id: string;
  roleId: string;
  name: string;
  description: string;
  roleType: string;
  tenantId?: string | null;
  isSystem?: boolean;
  isCustom?: boolean;
  scopeIds: string[];
  permissions?: string[];
  restrictions?: string[];
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  status: string;
}

export interface StaffMemberWithScopes {
  user: StaffMember;
  scopes: UserScope[];
  totalScopes: number;
  enabledScopes: number;
}

export interface ScopeUsageStats {
  totalScopes: number;
  enabledScopes: number;
  totalUsage: number;
  scopes: Array<{
    scopeId: string;
    scopeName: string;
    usageCount: number;
    lastUsedAt?: string;
    isEnabled: boolean;
    expiresAt?: string;
  }>;
}

// Scope Management APIs

/**
 * Get all available scopes
 */
export const getAllScopes = async (): Promise<Scope[]> => {
  const response = await apiClient.get<Scope[]>('/scopes', undefined, true);
  return response;
};

/**
 * Get scopes by category
 */
export const getScopesByCategory = async (category: string): Promise<Scope[]> => {
  const response = await apiClient.get<Scope[]>(`/scopes/category/${category}`, undefined, true);
  return response;
};

/**
 * Get scopes available for a tenant
 */
export const getAvailableScopesForTenant = async (tenantId: string): Promise<Scope[]> => {
  const response = await apiClient.get<Scope[]>(`/scopes/available/tenant/${tenantId}`, undefined, true);
  return response;
};

/**
 * Get custom scopes for a tenant
 */
export const getTenantCustomScopes = async (tenantId: string): Promise<Scope[]> => {
  const response = await apiClient.get<Scope[]>(`/scopes/custom/tenant/${tenantId}`, undefined, true);
  return response;
};

/**
 * Get root custom scopes (root admin only)
 */
export const getRootCustomScopes = async (): Promise<Scope[]> => {
  const response = await apiClient.get<Scope[]>('/scopes/custom/root', undefined, true);
  return response;
};

/**
 * Create a custom scope
 */
export const createCustomScope = async (scopeData: {
  name: string;
  description: string;
  category: string;
  endpoints: string[];
  methods: string[];
  resources: string[];
  actions: string[];
  tenantId?: string;
  microservice?: string;
  requiresApproval?: boolean;
}): Promise<Scope> => {
  const response = await apiClient.post<Scope>('/scopes/create', scopeData, true);
  return response;
};

/**
 * Update a custom scope
 */
export const updateCustomScope = async (
  scopeId: string,
  updates: Partial<Scope>
): Promise<Scope> => {
  const response = await apiClient.put<Scope>(`/scopes/update/${scopeId}`, updates, true);
  return response;
};

/**
 * Delete a custom scope
 */
export const deleteCustomScope = async (scopeId: string): Promise<void> => {
  await apiClient.delete<void>(`/scopes/delete/${scopeId}`, true);
};

// Tenant Scope APIs

/**
 * Get scopes for a tenant
 */
export const getTenantScopes = async (tenantId: string): Promise<TenantScope[]> => {
  const response = await apiClient.get<TenantScope[]>(`/scopes/tenant/${tenantId}`, undefined, true);
  return response;
};

/**
 * Assign scope to tenant
 */
export const assignScopeToTenant = async (
  tenantId: string,
  scopeId: string
): Promise<TenantScope> => {
  const response = await apiClient.post<TenantScope>(
    `/scopes/tenant/${tenantId}/assign/${scopeId}`,
    {},
    true
  );
  return response;
};

/**
 * Remove scope from tenant
 */
export const removeScopeFromTenant = async (
  tenantId: string,
  scopeId: string
): Promise<void> => {
  await apiClient.delete<void>(`/scopes/tenant/${tenantId}/remove/${scopeId}`, true);
};

/**
 * Toggle scope for tenant
 */
export const toggleTenantScope = async (
  tenantId: string,
  scopeId: string,
  isEnabled: boolean
): Promise<TenantScope> => {
  const response = await apiClient.put<TenantScope>(
    `/scopes/tenant/${tenantId}/toggle/${scopeId}`,
    { isEnabled },
    true
  );
  return response;
};

// User Scope APIs

/**
 * Get user scopes
 */
export const getUserScopes = async (userId: string): Promise<UserScope[]> => {
  const response = await apiClient.get<UserScope[]>(`/scopes/user/${userId}`, undefined, true);
  return response;
};

/**
 * Assign scope to user
 */
export const assignScopeToUser = async (
  userId: string,
  scopeId: string,
  options?: { expiresAt?: string; restrictions?: string[] }
): Promise<UserScope> => {
  const response = await apiClient.post<UserScope>(
    `/scopes/user/${userId}/assign/${scopeId}`,
    options || {},
    true
  );
  return response;
};

/**
 * Remove scope from user
 */
export const removeScopeFromUser = async (userId: string, scopeId: string): Promise<void> => {
  await apiClient.delete<void>(`/scopes/user/${userId}/remove/${scopeId}`, true);
};

/**
 * Toggle scope for user
 */
export const toggleUserScope = async (
  userId: string,
  scopeId: string,
  isEnabled: boolean
): Promise<UserScope> => {
  const response = await apiClient.put<UserScope>(
    `/scopes/user/${userId}/toggle/${scopeId}`,
    { isEnabled },
    true
  );
  return response;
};

/**
 * Assign role scopes to user
 */
export const assignRoleScopesToUser = async (
  userId: string,
  roleId: string
): Promise<UserScope[]> => {
  const response = await apiClient.post<UserScope[]>(
    `/scopes/user/${userId}/assign-role/${roleId}`,
    {},
    true
  );
  return response;
};

/**
 * Bulk assign scopes to user
 */
export const bulkAssignScopesToUser = async (
  userId: string,
  scopeIds: string[],
  expiresAt?: string
): Promise<UserScope[]> => {
  const response = await apiClient.post<UserScope[]>(
    `/scopes/user/${userId}/bulk-assign`,
    { scopeIds, expiresAt },
    true
  );
  return response;
};

/**
 * Bulk remove scopes from user
 */
export const bulkRemoveScopesFromUser = async (
  userId: string,
  scopeIds: string[]
): Promise<void> => {
  await apiClient.post<void>(
    `/scopes/user/${userId}/bulk-remove`,
    { scopeIds },
    true
  );
};

/**
 * Get user scope usage stats
 */
export const getUserScopeUsageStats = async (userId: string): Promise<ScopeUsageStats> => {
  const response = await apiClient.get<ScopeUsageStats>(`/scopes/user/${userId}/usage-stats`, undefined, true);
  return response;
};

// Staff Management APIs

/**
 * Get all staff in tenant
 */
export const getTenantStaff = async (tenantId: string): Promise<StaffMember[]> => {
  const response = await apiClient.get<StaffMember[]>(`/scopes/staff/tenant/${tenantId}`, undefined, true);
  return response;
};

/**
 * Get staff member with scopes
 */
export const getStaffMemberWithScopes = async (userId: string): Promise<StaffMemberWithScopes> => {
  const response = await apiClient.get<StaffMemberWithScopes>(`/scopes/staff/${userId}/details`, undefined, true);
  return response;
};

/**
 * Manage staff member scopes
 */
export const manageStaffMemberScopes = async (
  userId: string,
  scopeUpdates: {
    add?: string[];
    remove?: string[];
    enable?: string[];
    disable?: string[];
  }
): Promise<any> => {
  const response = await apiClient.post<any>(
    `/scopes/staff/${userId}/manage-scopes`,
    scopeUpdates,
    true
  );
  return response;
};

// Role APIs

/**
 * Get all roles
 */
export const getAllRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get<Role[]>('/scopes/roles/all', undefined, true);
  return response;
};

/**
 * Get roles for tenant
 */
export const getTenantRoles = async (tenantId: string): Promise<Role[]> => {
  const response = await apiClient.get<Role[]>(`/scopes/roles/tenant/${tenantId}`, undefined, true);
  return response;
};

/**
 * Create custom role
 */
export const createCustomRole = async (roleData: {
  tenantId: string;
  name: string;
  description: string;
  scopeIds: string[];
}): Promise<Role> => {
  const response = await apiClient.post<Role>('/scopes/roles/create', roleData, true);
  return response;
};

/**
 * Update custom role
 */
export const updateCustomRole = async (roleId: string, updates: Partial<Role>): Promise<Role> => {
  const response = await apiClient.put<Role>(`/scopes/roles/${roleId}`, updates, true);
  return response;
};

/**
 * Delete custom role
 */
export const deleteCustomRole = async (roleId: string): Promise<void> => {
  await apiClient.delete<void>(`/scopes/roles/${roleId}`, true);
};
