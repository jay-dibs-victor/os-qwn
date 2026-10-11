import { request } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'TRIAL'

export type Tenant = {
  id: string
  tenantId: string          // slug e.g. 'acme-corp'
  name: string              // display name
  domain?: string
  status: TenantStatus
  isRoot: boolean
  subscriptionPlan?: string
  subscriptionExpiresAt?: string
  settings?: Record<string, unknown>
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type CreateTenantRequest = {
  tenantId: string
  name: string
  domain?: string
  subscriptionPlan?: string
  settings?: Record<string, unknown>
}

export type UpdateTenantRequest = Partial<Omit<CreateTenantRequest, 'tenantId'>> & {
  status?: TenantStatus
}

type ListResponse<T> = { data: T[]; total: number }

// ─── API calls ────────────────────────────────────────────────────────────────

export async function listTenants() {
  return request<ListResponse<Tenant>>({
    path: '/auth/tenants',
    method: 'GET',
    auth: true,
  })
}

export async function getTenant(tenantId: string) {
  return request<Tenant>({
    path: `/auth/tenants/${encodeURIComponent(tenantId)}`,
    method: 'GET',
    auth: true,
  })
}

export async function createTenant(payload: CreateTenantRequest) {
  return request<Tenant>({
    path: '/auth/tenants',
    method: 'POST',
    body: payload,
    auth: true,
  })
}

export async function updateTenant(tenantId: string, payload: UpdateTenantRequest) {
  return request<Tenant>({
    path: `/auth/tenants/${encodeURIComponent(tenantId)}`,
    method: 'PATCH',
    body: payload,
    auth: true,
  })
}

export async function suspendTenant(tenantId: string) {
  return request<Tenant>({
    path: `/auth/tenants/${encodeURIComponent(tenantId)}/suspend`,
    method: 'PATCH',
    auth: true,
  })
}

export async function activateTenant(tenantId: string) {
  return request<Tenant>({
    path: `/auth/tenants/${encodeURIComponent(tenantId)}/activate`,
    method: 'PATCH',
    auth: true,
  })
}
