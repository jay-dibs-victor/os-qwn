import { request, type ApiError } from './client'

export type ApprovalRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type ApprovalStep = {
  id: string
  level: number
  approverId: string
  comment?: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

export type ApprovalRequest = {
  id: string
  method: string
  path: string
  payload: unknown
  initiatorId: string
  requiredPermission?: string
  status: ApprovalRequestStatus
  tenantId: string
  steps?: ApprovalStep[]
  createdAt: string
  updatedAt: string
}

type ListResponse<T> = { data: T[]; total: number }

export type ApprovalConfig = {
  id: string
  method: string
  path: string
  requiredPermission?: string
  tenantId: string
  levels: Array<{
    level: number
    allowedUserIds?: string[]
    allowedRoleIds?: string[]
  }>
}

export async function getApprovalConfig(method: string, path: string, tenantId: string) {
  try {
    return await request<ApprovalConfig>({
      path: '/approval/configs',
      auth: true,
      query: { method, path, tenantId },
    })
  } catch (e) {
    const err = e as ApiError
    if (err && err.status === 404) return null
    throw e
  }
}

export type CreateApprovalConfigRequest = {
  method: string
  path: string
  tenantId: string
  requiredPermission?: string
  levels: Array<{
    level: number
    allowedUserIds?: string[]
    allowedRoleIds?: string[]
  }>
}

export async function createApprovalConfig(payload: CreateApprovalConfigRequest) {
  return request<ApprovalConfig>({
    path: '/approval/configs',
    method: 'POST',
    auth: true,
    body: payload,
  })
}

export async function listApprovalConfigs(tenantId: string): Promise<ListResponse<ApprovalConfig>> {
  const res = await request<unknown>({
    path: '/approval/configs',
    auth: true,
    query: { tenantId },
  })

  if (Array.isArray(res)) return { data: res as ApprovalConfig[], total: res.length }
  const obj = res as { data?: ApprovalConfig[]; total?: number } | undefined
  return { data: obj?.data ?? [], total: obj?.total ?? (obj?.data?.length ?? 0) }
}

export async function listApprovalRequests(tenantId: string): Promise<ListResponse<ApprovalRequest>> {
  const res = await request<unknown>({
    path: '/approval/requests',
    auth: true,
    query: { tenantId },
  })

  if (Array.isArray(res)) return { data: res as ApprovalRequest[], total: res.length }
  const obj = res as { data?: ApprovalRequest[]; total?: number } | undefined
  return { data: obj?.data ?? [], total: obj?.total ?? (obj?.data?.length ?? 0) }
}

export async function approveApprovalRequest(id: string, payload: { approverId: string; comment?: string }) {
  return request<ApprovalRequest | { message?: string; status?: ApprovalRequestStatus }>({
    path: `/approval/requests/${id}/approve`,
    method: 'POST',
    auth: true,
    body: payload,
    headers: { 'x-bypass-approval': 'true' },
  })
}

export async function rejectApprovalRequest(id: string, payload: { approverId: string; reason?: string }) {
  return request<ApprovalRequest | { message?: string; status?: ApprovalRequestStatus }>({
    path: `/approval/requests/${id}/reject`,
    method: 'POST',
    auth: true,
    body: payload,
    headers: { 'x-bypass-approval': 'true' },
  })
}
