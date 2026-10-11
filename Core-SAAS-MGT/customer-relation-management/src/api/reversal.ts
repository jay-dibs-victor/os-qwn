import { apiClient } from './client'
import type { PaginatedResult } from './ledger'

export type ReversalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED'
export type ReversalType = 'FULL_REVERSAL' | 'PARTIAL_REVERSAL' | 'CHARGEBACK'
export type ReversalReason =
  | 'DUPLICATE_PAYMENT'
  | 'WRONG_RECIPIENT'
  | 'FRAUD_SUSPECTED'
  | 'TECHNICAL_ERROR'
  | 'CUSTOMER_REQUEST'

export interface CreateReversalDto {
  originalTransactionId: string
  reason: ReversalReason
  reasonDescription?: string
  type?: ReversalType
  amount?: number
  bypassApproval?: boolean
  tenantId?: string
  requestedBy?: string
}

export interface ReversalRecord {
  id: string
  tenantId: string
  originalTransactionId: string
  reversalTransactionId?: string
  reason: ReversalReason
  reasonDescription: string
  type: ReversalType
  amount: number
  currency: string
  status: ReversalStatus
  createdAt: string
  updatedAt: string
}

export interface ListReversalHistoryFilter {
  tenantId: string
  page?: number
  pageSize?: number
  status?: string
  type?: string
  originalTransactionId?: string
  fromDate?: string
  toDate?: string
}

export async function listReversalHistory(filter: ListReversalHistoryFilter) {
  const { tenantId, ...query } = filter
  return apiClient.get<PaginatedResult<ReversalRecord>>('/reversal/records', {
    tenantId,
    ...query,
  })
}

export async function createReversal(dto: CreateReversalDto, options?: { bypassApproval?: boolean }) {
  return apiClient.post<ReversalRecord | { message: string; requestId: string }>('/reversal/records', {
    ...dto,
    ...options,
  })
}

export async function getReversal(id: string) {
  return apiClient.get<ReversalRecord>(`/reversal/records/${encodeURIComponent(id)}`)
}

export async function createBulkReversals(items: CreateReversalDto[]) {
  return apiClient.post<{ total: number; succeeded: number; failed: number; errors: string[] }>('/reversal/bulk', {
    items,
  })
}
