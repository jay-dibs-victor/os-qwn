import { apiClient } from './client'
import type { PaginatedResult } from './ledger'

export type WalletTransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'EXCHANGE' | 'QCOIN_EXCHANGE' | 'FUNDING'
export type WalletTransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'POSTED'
export type QCoinExchangeDirection = 'BUY_QCOIN' | 'SELL_QCOIN'

export interface WalletTransaction {
  id: string
  tenantId: string
  accountNumber?: string
  fromAccountNumber?: string | null
  toAccountNumber?: string | null
  reference: string
  type: WalletTransactionType
  status: WalletTransactionStatus
  amount: number
  currency: string
  description?: string
  journalEntryId?: string
  createdAt: string
  updatedAt: string
}

export interface ListWalletTransactionsFilter {
  tenantId: string
  page?: number
  pageSize?: number
  type?: string
  status?: string
  accountNumber?: string
  reference?: string
  fromDate?: string
  toDate?: string
}

export async function listWalletTransactions(filter: ListWalletTransactionsFilter) {
  const { tenantId, ...query } = filter
  return apiClient.get<PaginatedResult<WalletTransaction>>('/wallet/transactions', {
    tenantId,
    ...query,
  })
}

export async function walletTransfer(body: {
  tenantId: string
  fromAccountNumber: string
  toAccountNumber: string
  amount: number
  currency?: string
  description?: string
}) {
  return apiClient.post<WalletTransaction>('/wallet/transfer', body)
}

export async function walletFund(body: {
  tenantId: string
  accountNumber: string
  amount: number
  currency?: string
  description?: string
}) {
  return apiClient.post<WalletTransaction>('/wallet/funding', body)
}

export async function walletWithdraw(body: {
  tenantId: string
  accountNumber: string
  amount: number
  currency?: string
  description?: string
}) {
  return apiClient.post<WalletTransaction>('/wallet/withdrawal', body)
}

export async function qcoinExchange(body: {
  tenantId: string
  customerId: string
  direction: QCoinExchangeDirection
  fiatAmount: number
  qcoinAmount: number
  fiatCurrency?: string
  qcoinCurrency?: string
  description?: string
}) {
  return apiClient.post<WalletTransaction>('/wallet/qcoin-exchange', body)
}
