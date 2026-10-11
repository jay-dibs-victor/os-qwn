import { apiClient } from './client'
import type { PaginatedResult } from './ledger'

export type RetryRecordStatus = 'PENDING' | 'RETRYING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
export type RetryTargetType = 'PAYMENT_RAIL' | 'WEBHOOK' | 'LEDGER_POSTING' | 'AUTH_SYNC'

export interface RetryRecord {
  id: string
  tenantId: string
  targetType: RetryTargetType
  targetId: string
  payload: string
  attempts: number
  maxAttempts: number
  nextAttemptAt: string
  status: RetryRecordStatus
  errorLog?: string
  operation: string
  attemptCount: number
  createdAt: string
  updatedAt: string
}

export interface ListRetryHistoryFilter {
  tenantId: string
  page?: number
  pageSize?: number
  status?: string
  targetType?: string
  fromDate?: string
  toDate?: string
}

export async function listRetryHistory(filter: ListRetryHistoryFilter) {
  const { tenantId, ...query } = filter
  return apiClient.get<PaginatedResult<RetryRecord>>('/retry/records', {
    tenantId,
    ...query,
  })
}

export async function forceRetryRecord(id: string) {
  return apiClient.post<RetryRecord>(`/retry/records/${encodeURIComponent(id)}/force`)
}

export async function cancelRetryRecord(id: string) {
  return apiClient.post<RetryRecord>(`/retry/records/${encodeURIComponent(id)}/cancel`)
}

export async function getRetryDashboard(tenantId: string) {
  return apiClient.get<unknown>('/retry/dashboard', { tenantId })
}

export async function getDueRetries(tenantId: string) {
  return apiClient.get<RetryRecord[]>('/retry/records/due', { tenantId })
}

export async function listRetries(tenantId: string) {
  return apiClient.get<RetryRecord[]>('/retry/records', { tenantId })
}

export async function getRetryRecord(id: string) {
  return apiClient.get<RetryRecord>(`/retry/records/${encodeURIComponent(id)}`)
}

export async function markRetrying(id: string) {
  return apiClient.post<RetryRecord>(`/retry/records/${encodeURIComponent(id)}/mark-retrying`)
}

export async function markSucceeded(id: string) {
  return apiClient.post<RetryRecord>(`/retry/records/${encodeURIComponent(id)}/mark-succeeded`)
}

export async function markFailed(id: string, payload: { error: string }) {
  return apiClient.post<RetryRecord>(`/retry/records/${encodeURIComponent(id)}/mark-failed`, payload)
}

export async function compensate(id: string, payload: { reason: string }) {
  return apiClient.post<RetryRecord>(`/retry/records/${encodeURIComponent(id)}/compensate`, payload)
}
