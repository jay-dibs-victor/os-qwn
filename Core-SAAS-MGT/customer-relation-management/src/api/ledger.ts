import { apiClient } from './client'

export type GlAccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense'

export interface GlAccount {
  id: string
  code: string
  name: string
  type: GlAccountType
  balance: number | string
  currency: string
  status?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface PostingEntryDto {
  glAccountId: string
  amount: number
  side: 'DEBIT' | 'CREDIT'
}

export interface PostingDto {
  reference: string
  description: string
  postingDate: string
  tenantId: string
  entries: PostingEntryDto[]
}

export interface TransactionEntry {
  id: string
  glAccountId: string
  subLedgerId?: string
  amount: string
  side: 'DEBIT' | 'CREDIT'
  accountCode: string
  accountName: string
}

export interface Transaction {
  id: string
  tenantId: string
  reference: string
  description: string
  postingDate: string
  totalAmount: number
  currency: string
  entries: TransactionEntry[]
}

export interface ListTransactionsFilter {
  tenantId: string
  page?: number
  pageSize?: number
  fromDate?: string
  toDate?: string
  reference?: string
  subLedgerId?: string
  glAccountId?: string
}

export interface PaginatedResult<T> {
  data: T[]
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export async function listGlAccounts(tenantId: string) {
  return apiClient.get<GlAccount[]>('/ledger/accounts', { tenantId })
}

export async function createGlAccount(body: Record<string, unknown>) {
  return apiClient.post<GlAccount>('/ledger/accounts', body)
}

export async function updateGlAccount(id: string, body: Record<string, unknown>) {
  return apiClient.patch<GlAccount>(`/ledger/accounts/${encodeURIComponent(id)}`, body)
}

export async function getGlAccount(id: string) {
  return apiClient.get<GlAccount>(`/ledger/accounts/${encodeURIComponent(id)}`)
}

export async function getGlAccountsTree() {
  return apiClient.get<unknown>('/ledger/accounts/tree')
}

export async function listTransactions(filter: ListTransactionsFilter) {
  const { tenantId, ...query } = filter
  return apiClient.get<PaginatedResult<Transaction>>('/ledger/transactions', {
    tenantId,
    ...query,
  })
}

export async function getTransaction(id: string) {
  return apiClient.get<Transaction>(`/ledger/transactions/${encodeURIComponent(id)}`)
}

export async function getTransactionByReference(reference: string) {
  return apiClient.get<Transaction>(`/ledger/transactions/reference/${encodeURIComponent(reference)}`)
}

export async function getSubLedgerDailyTotal(tenantId: string, subLedgerId: string) {
  return apiClient.get<number>(`/ledger/sub-ledger/${encodeURIComponent(subLedgerId)}/daily-total`, {
    tenantId,
  })
}

export async function postTransaction(body: PostingDto) {
  return apiClient.post<Transaction | { message: string; requestId: string }>('/ledger/transactions', body)
}
