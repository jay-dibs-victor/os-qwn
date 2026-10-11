import { apiClient } from './client'
import type { PaginatedResult } from './ledger'

export type BatchJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface BatchItemDto {
  sourceAccountId: string
  targetAccountId: string
  targetBankCode?: string
  amount: number
  currency?: string
}

export interface BatchJob {
  id: string
  tenantId: string
  name: string
  status: BatchJobStatus
  totalItems: number
  processedItems: number
  failedItems: number
  successItems: number
  createdAt: string
  updatedAt: string
}

export interface ListBatchHistoryFilter {
  tenantId: string
  page?: number
  pageSize?: number
  status?: string
  name?: string
  fromDate?: string
  toDate?: string
}

export async function listBatchHistory(filter: ListBatchHistoryFilter) {
  const { tenantId, ...query } = filter
  return apiClient.get<PaginatedResult<BatchJob>>('/batch/jobs', {
    tenantId,
    ...query,
  })
}

export async function createBatch(payload: {
  name: string
  tenantId: string
  createdBy: string
  items: BatchItemDto[]
}) {
  return apiClient.post<BatchJob>('/batch/jobs', payload)
}

export async function getBatch(id: string) {
  return apiClient.get<BatchJob>(`/batch/jobs/${encodeURIComponent(id)}`)
}

export async function executeBatch(id: string) {
  return apiClient.post<BatchJob>(`/batch/jobs/${encodeURIComponent(id)}/execute`)
}

export async function retryBatch(id: string) {
  return apiClient.post<BatchJob>(`/batch/jobs/${encodeURIComponent(id)}/retry`)
}

export async function executeBatchJob(name: string, items: BatchItemDto[]) {
  return apiClient.post<{ id: string; name: string; status: BatchJobStatus }>('/batch/jobs', {
    name,
    items,
  })
}
