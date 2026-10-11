import { request } from './client'
import type { PaginatedResponse, PaginationQuery } from './pagination'

export type PaymentRail =
  | 'INTERNAL'
  | 'NIBSS'
  | 'RTGS'
  | 'SWIFT'

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REJECTED'

export type PaymentInstruction = {
  id: string
  idempotencyKey: string
  sourceAccountId: string
  targetAccountId: string
  targetBankCode?: string | null
  amount: number | string
  currency: string
  rail: PaymentRail
  status: PaymentStatus
  tenantId: string
  reference?: string | null
  approvalId?: string | null
  createdAt?: string
  updatedAt?: string
}

export type InternalTransferDto = {
  tenantId: string
  sourceAccountId: string
  destinationAccountId: string
  amount: number
  currency?: string
  reference?: string
}

export type PaymentHistoryQuery = PaginationQuery & {
  tenantId?: string
  sourceAccountId?: string
  status?: PaymentStatus
  rail?: PaymentRail
  fromDate?: string
  toDate?: string
  [key: string]: string | number | boolean | null | undefined
}

export async function initiateInternalTransfer(body: InternalTransferDto) {
  return request<PaymentInstruction>({
    path: '/payments/internal-transfer',
    method: 'POST',
    body,
    auth: true,
  })
}

export async function getPayment(id: string) {
  return request<PaymentInstruction>({
    path: `/payments/${encodeURIComponent(id)}`,
    method: 'GET',
    auth: true,
  })
}

export async function listPaymentHistory(query: PaymentHistoryQuery) {
  return request<PaginatedResponse<PaymentInstruction>>({
    path: '/payments/history',
    method: 'GET',
    query,
    auth: true,
  })
}
