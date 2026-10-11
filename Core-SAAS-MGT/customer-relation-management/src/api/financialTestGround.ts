import { apiClient } from './client'

// ─── Shared Types ──────────────────────────────────────────

export interface AuditTrailEntry {
  event: string
  timestamp: string
  actor: string
  details: Record<string, unknown>
}

export interface PaginatedData<T> {
  data: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages?: number
}

// ─── Trip Payment (payment-service port 3006) ───────────

export interface TripPaymentResponse {
  message: string
  paymentId?: string
  journalEntryIds?: string[]
  transactionReference?: string
  authorizationUrl?: string
  commissionAmount?: number
  driverNetAmount?: number
  partnerAmount?: number
  platformFee?: number
  entries?: Record<string, unknown>[]
}

export interface CommissionSplitPreview {
  totalFare: number
  commissionAmount: number
  driverGrossAmount: number
  driverNetAmount: number
  partnerAmount: number
  platformFee: number
  breakdown: {
    commission: { ruleName: string; amount: number }[]
    deductions: { name: string; amount: number }[]
  }
}

export interface TripPaymentRecord {
  id: string
  tripId: string
  tenantId: string
  reference: string
  amount: number
  currency: string
  driverCustomerId: string
  partnerId?: string
  status: string
  paystackReference?: string
  authorizationUrl?: string
  journalEntryIds?: string[]
  createdAt: string
}

export async function initiateTripPayment(body: {
  tripId: string; fareAmount: number; currency: string; driverCustomerId: string
  riderCustomerId: string; riderEmail: string
  partnerTenantId?: string; isCorporateDriver?: boolean
  platformCommissionRate?: number; partnerCommissionRate?: number
  metadata?: Record<string, unknown>
}) {
  return apiClient.post<TripPaymentResponse>('/payments/trip/initiate', body)
}

export async function verifyTripPayment(body: {
  tripId: string; reference: string; paystackReference?: string
}) {
  return apiClient.post<TripPaymentResponse>('/payments/trip/verify', body)
}

export async function completeTripPayment(tripId: string, body: {
  tenantId: string; paystackReference: string; driverCustomerId: string
  driverAccountNumber?: string; partnerId?: string; partnerAccountNumber?: string
}) {
  return apiClient.post<TripPaymentResponse>(`/payments/trip/${encodeURIComponent(tripId)}/complete`, body)
}

export async function calculateCommissionPreview(tenantId: string, body: {
  tripId: string; amount: number; driverCustomerId: string; partnerId?: string; isCorporateDriver?: boolean
}) {
  return apiClient.get<CommissionSplitPreview>('/payments/trip/calculate-commission', { ...body, tenantId })
}

export async function getTripPaymentByReference(reference: string) {
  return apiClient.get<TripPaymentRecord>(`/payments/trip/${encodeURIComponent(reference)}`)
}

export async function listTripPayments(tripId: string) {
  return apiClient.get<TripPaymentRecord[]>(`/payments/trip/trip/${encodeURIComponent(tripId)}`)
}

// ─── Ledger / Revenue (ledger-service port 3003) ────────

export interface TripFinancialRecord {
  id: string; tripId: string; tenantId: string
  totalFare: number; commissionAmount: number; driverGrossAmount: number
  driverNetAmount: number; partnerAmount: number; platformFee: number
  status: string; driverCustomerId: string; partnerId?: string
  isCorporateDriver: boolean
  revenueRecognitionJournalId?: string; driverEarningJournalId?: string
  subtripRecords?: Record<string, unknown>[]
  auditTrail?: Record<string, unknown>[]; metadata?: Record<string, unknown>
  createdAt?: string
}

export async function recordTripRevenue(body: {
  tripId: string; tenantId: string; totalFare: number; commissionAmount: number
  driverNetAmount: number; partnerAmount?: number; platformFee?: number
  driverCustomerId: string; partnerId?: string; isCorporateDriver?: boolean
  commissionRuleId?: string; metadata?: Record<string, unknown>
}) {
  return apiClient.post<TripFinancialRecord>('/ledger/revenue/trip', body)
}

export async function getTripFinancialRecordByTripId(tripId: string) {
  return apiClient.get<TripFinancialRecord>(`/ledger/revenue/trip/${encodeURIComponent(tripId)}`)
}

export async function listTripFinancialRecords(tenantId: string, page = 0, pageSize = 20, driverId?: string) {
  const params: Record<string, string> = { tenantId, page: String(page), pageSize: String(pageSize) }
  if (driverId) params.driverId = driverId
  return apiClient.get<PaginatedData<TripFinancialRecord>>('/ledger/revenue/trips', params)
}

export async function getRevenueSummary(tenantId: string) {
  return apiClient.get<{
    totalRevenue: number; totalCommission: number; totalPayouts: number
    totalTrips: number; periodStart: string; periodEnd: string
  }>('/ledger/revenue/summary', { tenantId })
}

// ─── Commission Rules (ledger-service) ─────────────────

export interface CommissionRule {
  id: string; tenantId: string; name: string
  ruleType: 'PLATFORM' | 'PARTNER' | 'DRIVER'
  calculationMethod: 'PERCENTAGE' | 'FLAT' | 'TIERED'
  rate: number; minAmount?: number; maxAmount?: number
  tiers?: Record<string, unknown>[]; isActive: boolean
  metadata?: Record<string, unknown>; createdAt?: string; updatedAt?: string
}

export async function listCommissionRules(tenantId: string) {
  return apiClient.get<CommissionRule[]>('/ledger/commissions/rules', { tenantId })
}

export async function createCommissionRule(body: Record<string, unknown>) {
  return apiClient.post<CommissionRule>('/ledger/commissions/rules', body)
}

export async function updateCommissionRule(id: string, body: Record<string, unknown>) {
  return apiClient.patch<CommissionRule>(`/ledger/commissions/rules/${encodeURIComponent(id)}`, body)
}

export async function deleteCommissionRule(id: string) {
  return apiClient.delete<{ message: string }>(`/ledger/commissions/rules/${encodeURIComponent(id)}`)
}

export async function calculateCommission(tenantId: string, body: {
  ruleId: string; amount: number; metadata?: Record<string, unknown>
}) {
  return apiClient.post<{ commissionAmount: number; breakdown: Record<string, unknown> }>(
    '/ledger/commissions/calculate', { ...body, tenantId },
  )
}

// ─── Audit & Reports (ledger-service) ──────────────────

export interface AuditTrailEntryDetail {
  id: string; event: string; entityType: string; entityId: string
  actor: string; tenantId: string; description: string
  changes?: Record<string, unknown>; metadata?: Record<string, unknown>; timestamp: string
}

export async function getAuditTrail(tenantId: string, page = 0, pageSize = 50) {
  return apiClient.get<PaginatedData<AuditTrailEntryDetail>>('/ledger/audit/trail', { tenantId, page: String(page), pageSize: String(pageSize) })
}

export async function getAuditTrailByReference(tenantId: string, reference: string) {
  return apiClient.get<AuditTrailEntryDetail[]>(`/ledger/audit/trail/${encodeURIComponent(reference)}`, { tenantId })
}

export async function getGlImpact(tenantId: string, journalId: string) {
  return apiClient.get<{
    journalId: string; entries: { glAccountId: string; accountName: string; debit: number; credit: number }[]
    totalDebit: number; totalCredit: number
  }>(`/ledger/audit/gl-impact/${encodeURIComponent(journalId)}`, { tenantId })
}

export async function getBalanceSheet(tenantId: string, asOfDate?: string) {
  const params: Record<string, string> = { tenantId }
  if (asOfDate) params.asOfDate = asOfDate
  return apiClient.get<{ assets: any[]; liabilities: any[]; equity: any[] }>('/ledger/audit/balance-sheet', params)
}

export async function getProfitAndLoss(tenantId: string, fromDate?: string, toDate?: string) {
  const params: Record<string, string> = { tenantId }
  if (fromDate) params.fromDate = fromDate
  if (toDate) params.toDate = toDate
  return apiClient.get<{ income: any[]; expenses: any[]; netProfit: number }>('/ledger/audit/profit-loss', params)
}

export async function getTrialBalance(tenantId: string, asOfDate?: string) {
  const params: Record<string, string> = { tenantId }
  if (asOfDate) params.asOfDate = asOfDate
  return apiClient.get<{ rows: any[]; totalDebit: number; totalCredit: number }>('/ledger/audit/trial-balance', params)
}

// ─── Driver Earnings (wallet-service port 3015) ────────

export interface DriverEarning {
  id: string; tenantId: string; driverCustomerId: string; tripId: string
  tripFare: number; platformCommission: number; partnerCommission: number
  netEarnings: number; bonusAmount: number; penaltyAmount: number
  subscriptionDeduction: number; leaseDeduction: number; finalPayout: number
  currency: string; status: string; journalEntryId?: string
  walletTransactionId?: string; settlementReference?: string
  metadata?: Record<string, unknown>; createdAt?: string
}

export async function recordDriverEarning(body: {
  tenantId: string; driverCustomerId: string; tripId: string
  tripFare: number; platformCommission?: number; partnerCommission?: number
  netEarnings: number; bonusAmount?: number; penaltyAmount?: number
  subscriptionDeduction?: number; leaseDeduction?: number
  currency?: string; settlementReference?: string; metadata?: Record<string, unknown>
}) {
  return apiClient.post<DriverEarning>('/wallet/driver-earnings/record', body)
}

export async function payoutDriverEarning(earningId: string, body: {
  tenantId: string; driverAccountNumber: string
}) {
  return apiClient.post<{ message: string }>(
    `/wallet/driver-earnings/${encodeURIComponent(earningId)}/payout`, body,
  )
}

export async function listDriverEarnings(tenantId: string, page = 1, pageSize = 20) {
  return apiClient.get<PaginatedData<DriverEarning>>('/wallet/driver-earnings', { tenantId, page: String(page), pageSize: String(pageSize) })
}

export async function listAllDriverEarnings(tenantId: string, page = 0, pageSize = 20) {
  return apiClient.get<PaginatedData<DriverEarning>>('/wallet/driver-earnings', { tenantId, page: String(page), pageSize: String(pageSize) })
}

export async function listDriverEarningsByDriver(tenantId: string, driverCustomerId: string) {
  return apiClient.get<DriverEarning[]>(`/wallet/driver-earnings/driver/${encodeURIComponent(driverCustomerId)}`, { tenantId })
}

export async function getDriverEarnings(tenantId: string, driverCustomerId: string) {
  return apiClient.get<DriverEarning[]>(`/wallet/driver-earnings/driver/${encodeURIComponent(driverCustomerId)}`, { tenantId })
}

export async function getDriverEarningsSummary(tenantId: string, driverCustomerId?: string) {
  const query: Record<string, string> = { tenantId }
  if (driverCustomerId) query.driverCustomerId = driverCustomerId
  return apiClient.get<{
    totalEarnings: number; totalPaid: number; totalPending: number
    totalCommission: number; totalBonus: number; totalPenalty: number
    totalDeductions: number; averagePerTrip: number
  }>('/wallet/driver-earnings/summary', query)
}

// ─── Partner Settlements (wallet-service) ─────────────

export interface PartnerSettlement {
  id: string; tenantId: string; partnerId: string
  totalAccrued: number; totalPaid: number; outstandingBalance: number
  status: string; lastSettlementDate?: string
  journalEntryIds?: string[]; auditTrail?: AuditTrailEntry[]
  metadata?: Record<string, unknown>; createdAt?: string
}

export async function createPartnerSettlement(body: {
  tenantId: string; partnerId: string; amount: number; reference: string; description?: string
}) {
  return apiClient.post<PartnerSettlement>('/wallet/partner-settlements', body)
}

export async function settlePartnerPayout(body: {
  tenantId: string; settlementId: string; amount: number; reference: string
}) {
  return apiClient.post<{ message: string; payoutId: string; journalEntryIds: string[] }>(
    '/wallet/partner-settlements/settle', body,
  )
}

export async function listPartnerSettlements(tenantId: string, partnerId?: string) {
  const query: Record<string, string> = { tenantId }
  if (partnerId) query.partnerId = partnerId
  return apiClient.get<PartnerSettlement[]>('/wallet/partner-settlements', query)
}

export async function getPartnerBalance(tenantId: string, partnerId: string) {
  return apiClient.get<{
    partnerId: string; totalAccrued: number; totalPaid: number
    outstandingBalance: number; lastSettlementDate?: string
  }>(`/wallet/partner-settlements/partner/${encodeURIComponent(partnerId)}/balance`, { tenantId })
}

// ─── Escrow Wallet (ledger-service) ───────────────────

export interface EscrowWallet {
  id: string; tenantId: string; partnerId: string; status: string; cycleType: string
  currentBalance: number; lockedBalance: number; releasedBalance: number
  cycleStartDate?: string; cycleEndDate?: string; reference?: string
  cycleHistory?: Record<string, unknown>[]; auditTrail?: AuditTrailEntry[]
  metadata?: Record<string, unknown>; createdAt?: string
}

export async function createEscrowWallet(body: {
  tenantId: string; partnerId: string; cycleType?: string; reference?: string
}) {
  return apiClient.post<EscrowWallet>('/ledger/escrow/wallet', body)
}

export async function lockEscrowFunds(body: {
  tenantId: string; walletId: string; amount: number; reference?: string; actor?: string
}) {
  return apiClient.post<EscrowWallet>('/ledger/escrow/lock', body)
}

export async function releaseEscrowFunds(body: {
  tenantId: string; walletId: string; amount: number; reference?: string; actor?: string
}) {
  return apiClient.post<EscrowWallet>('/ledger/escrow/release', body)
}

export async function escrowAdminOverride(body: {
  tenantId: string; walletId: string; amount: number; reason: string; actor: string
}) {
  return apiClient.post<EscrowWallet>('/ledger/escrow/admin-override', body)
}

export async function listEscrowWallets(tenantId: string) {
  return apiClient.get<EscrowWallet[]>('/ledger/escrow/wallets', { tenantId })
}

export async function getEscrowWalletByPartner(tenantId: string, partnerId: string) {
  return apiClient.get<EscrowWallet | null>(`/ledger/escrow/wallet/${encodeURIComponent(partnerId)}`, { tenantId })
}

export async function getEscrowSummary(tenantId: string) {
  return apiClient.get<{
    totalCurrent: number; totalLocked: number; totalReleased: number; activeWallets: number
  }>('/ledger/escrow/summary', { tenantId })
}

// ─── Driver Savings Plan (wallet-service) ─────────────

export interface DriverSavingsPlan {
  id: string; tenantId: string; driverCustomerId: string
  targetAmount: number; currentAmount: number; contributionPerTrip: number
  earlyWithdrawalPenaltyPercent: number; maxEarlyWithdrawalPenalty: number
  status: string; targetDate?: string; completedAt?: string
  totalContributions: number; totalPenaltiesPaid: number; totalWithdrawn: number
  contributionHistory?: Record<string, unknown>[]; metadata?: Record<string, unknown>; createdAt?: string
}

export async function createSavingsPlan(body: {
  tenantId: string; driverCustomerId: string; targetAmount: number; contributionPerTrip: number
  earlyWithdrawalPenaltyPercent?: number; maxEarlyWithdrawalPenalty?: number; targetDate?: string
}) {
  return apiClient.post<DriverSavingsPlan>('/wallet/driver-savings/plan', body)
}

export async function contributeToSavings(body: {
  tenantId: string; planId: string; tripId: string; amount: number
}) {
  return apiClient.post<DriverSavingsPlan>('/wallet/driver-savings/contribute', body)
}

export async function earlyWithdrawalSavings(body: {
  tenantId: string; planId: string; amount: number; reason?: string; actor?: string
}) {
  return apiClient.post<{ plan: DriverSavingsPlan; penalty: number; netAmount: number }>(
    '/wallet/driver-savings/withdraw', body,
  )
}

export async function cancelSavingsPlan(tenantId: string, planId: string, reason?: string) {
  return apiClient.post<DriverSavingsPlan>(
    `/wallet/driver-savings/plan/${encodeURIComponent(planId)}/cancel`, { reason, tenantId },
  )
}

export async function listSavingsPlans(tenantId: string, driverCustomerId?: string) {
  const query: Record<string, string> = { tenantId }
  if (driverCustomerId) query.driverCustomerId = driverCustomerId
  return apiClient.get<DriverSavingsPlan[]>('/wallet/driver-savings/plans', query)
}

export async function getSavingsSummary(tenantId: string) {
  return apiClient.get<{
    totalPlans: number; activePlans: number; totalSaved: number; totalTarget: number; totalPenalties: number
  }>('/wallet/driver-savings/summary', { tenantId })
}

// ─── Remittance Schedules (wallet-service) ────────────

export interface RemittanceSchedule {
  id: string; tenantId: string; partnerId: string; cycle: string; status: string
  amount: number; processedAmount: number; dueDate: string
  processedAt?: string; processedBy?: string; approvalId?: string
  isAdminOverride: boolean; overrideReason?: string; journalEntryId?: string
  auditTrail?: AuditTrailEntry[]; metadata?: Record<string, unknown>; createdAt?: string
}

export async function createRemittanceSchedule(body: {
  tenantId: string; partnerId: string; cycle: string; amount: number; dueDate: string
}) {
  return apiClient.post<RemittanceSchedule>('/wallet/remittance/schedule', body)
}

export async function processRemittanceSchedule(tenantId: string, scheduleId: string, actor?: string) {
  return apiClient.post<RemittanceSchedule>(
    `/wallet/remittance/schedule/${encodeURIComponent(scheduleId)}/process`, { tenantId, actor },
  )
}

export async function processDueRemittances(tenantId: string, actor?: string) {
  return apiClient.post<RemittanceSchedule[]>('/wallet/remittance/process-due', { tenantId, actor })
}

export async function remittanceAdminOverride(body: {
  tenantId: string; scheduleId: string; reason: string; actor: string; releaseAmount?: number
}) {
  return apiClient.post<RemittanceSchedule>('/wallet/remittance/admin-override', body)
}

export async function listPendingRemittances(tenantId: string) {
  return apiClient.get<RemittanceSchedule[]>('/wallet/remittance/pending', { tenantId })
}

export async function listAllRemittances(tenantId: string) {
  return apiClient.get<RemittanceSchedule[]>('/wallet/remittance/all', { tenantId })
}

export async function getRemittanceSummary(tenantId: string) {
  return apiClient.get<{
    totalSchedules: number; pendingCount: number; completedCount: number
    totalAmount: number; totalProcessed: number; overdueCount: number
  }>('/wallet/remittance/summary', { tenantId })
}

// ─── GL Accounts (ledger-service) ─────────────────────

export interface GlAccountRecord {
  id: string; code: string; name: string; type: string
  balance: number | string; currency: string; status?: string
  description?: string; children?: GlAccountRecord[]; createdAt?: string
}

export async function listGlAccountsFull(tenantId: string) {
  return apiClient.get<GlAccountRecord[]>('/ledger/accounts', { tenantId })
}

export async function getGlAccountsTreeFull() {
  return apiClient.get<GlAccountRecord[]>('/ledger/accounts/tree')
}

// ─── Tenant Driver Remittance Config (ledger-service) ─

export interface TenantDriverRemittanceConfig {
  id: string; tenantId: string; driverCustomerId?: string
  remittanceCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'COMMISSION_BASED'
  remittanceType: 'FIXED_AMOUNT' | 'PERCENTAGE_OF_FARE' | 'PERCENTAGE_OF_EARNINGS'
  remittanceValue: number; commissionRate: number
  dayOfWeek: number; dayOfMonth: number
  isActive: boolean; effectiveFrom?: string; effectiveTo?: string
  metadata?: Record<string, unknown>; createdAt?: string
}

export async function upsertTenantRemittanceConfig(body: {
  tenantId: string; driverCustomerId?: string; remittanceCycle?: string
  remittanceType?: string; remittanceValue?: number; commissionRate?: number
  dayOfWeek?: number; dayOfMonth?: number; isActive?: boolean
}) {
  return apiClient.post<TenantDriverRemittanceConfig>('/ledger/tenant-remittance-config', body)
}

export async function listTenantRemittanceConfigs(tenantId: string) {
  return apiClient.get<TenantDriverRemittanceConfig[]>('/ledger/tenant-remittance-config', { tenantId })
}

export async function getDriverRemittanceConfig(tenantId: string, driverCustomerId: string) {
  return apiClient.get<TenantDriverRemittanceConfig | null>(`/ledger/tenant-remittance-config/driver/${encodeURIComponent(driverCustomerId)}`, { tenantId })
}

export async function getDefaultRemittanceConfig(tenantId: string) {
  return apiClient.get<TenantDriverRemittanceConfig | null>('/ledger/tenant-remittance-config/default', { tenantId })
}

export async function deleteTenantRemittanceConfig(tenantId: string, configId: string) {
  return apiClient.delete<void>(`/ledger/tenant-remittance-config/${encodeURIComponent(configId)}`, { tenantId } as any)
}

// ─── Site-Wide Fare Config (ledger-service) ───────────

export interface SiteWideFareConfig {
  id: string; configKey: string; configValue: string
  description?: string; dataType: string; isActive: boolean
  metadata?: Record<string, unknown>; createdAt?: string
}

export async function upsertSiteWideFareConfig(body: {
  configKey: string; configValue: string; description?: string; dataType?: string
}) {
  return apiClient.post<SiteWideFareConfig>('/ledger/site-wide-fare-config', body)
}

export async function listSiteWideFareConfigs() {
  return apiClient.get<SiteWideFareConfig[]>('/ledger/site-wide-fare-config')
}

export async function getSiteWideFareConfig(key: string) {
  return apiClient.get<SiteWideFareConfig | null>(`/ledger/site-wide-fare-config/${encodeURIComponent(key)}`)
}

export async function deleteSiteWideFareConfig(key: string) {
  return apiClient.delete<void>(`/ledger/site-wide-fare-config/${encodeURIComponent(key)}` as any)
}

export async function seedSiteWideFareDefaults() {
  return apiClient.post<{ message: string }>('/ledger/site-wide-fare-config/seed')
}

// ─── Scheduler (wallet-service) ─────────────────────────

export async function processOverdueRemittances(tenantId: string) {
  return apiClient.post<RemittanceSchedule[]>('/wallet/scheduler/remittance/process-overdue', {}, { tenantId } as any)
}

export async function disburseMatureSavings(tenantId: string) {
  return apiClient.post<{ disbursed: number; failed: number }>('/wallet/scheduler/savings/disburse-mature', {}, { tenantId } as any)
}

export async function disburseWeeklySavings(tenantId: string) {
  return apiClient.post<{ disbursed: number; failed: number }>('/wallet/scheduler/savings/disburse-weekly', {}, { tenantId } as any)
}

export async function disburseMonthlySavings(tenantId: string) {
  return apiClient.post<{ disbursed: number; failed: number }>('/wallet/scheduler/savings/disburse-monthly', {}, { tenantId } as any)
}

// ─── Coin Rewards (ledger-service) ─────────────────────

export interface CoinWalletRecord {
  id: string; entityId: string; entityType: 'TENANT' | 'RIDER' | 'DRIVER'
  balance: number; currency: string; tenantId: string; createdAt?: string
}

export interface CoinTransactionRecord {
  id: string; walletId: string; amount: number; type: 'CREDIT' | 'DEBIT'
  reference: string; description?: string; tripId?: string
  tenantId: string; createdAt?: string
}

export async function awardTripCoins(body: {
  tripId: string; tenantId: string; riderCustomerId: string; driverCustomerId: string
}) {
  return apiClient.post<{ riderCoins: number; driverCoins: number; tenantCoins: number }>(
    '/ledger/coin-reward/award-trip', body,
  )
}

export async function getCoinBalance(entityType: string, entityId: string) {
  return apiClient.get<CoinWalletRecord | null>(`/ledger/coin-reward/balance/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`)
}

export async function getCoinWallet(entityType: string, entityId: string) {
  return apiClient.get<CoinWalletRecord>(`/ledger/coin-reward/wallet/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`)
}

export async function listCoinTransactions(walletId: string, page = 0, pageSize = 20) {
  return apiClient.get<{
    data: CoinTransactionRecord[]; page: number; pageSize: number; totalItems: number; totalPages: number
  }>(`/ledger/coin-reward/transactions/${encodeURIComponent(walletId)}`, { page: String(page), pageSize: String(pageSize) })
}

export async function listAllCoinWallets(tenantId?: string) {
  return apiClient.get<CoinWalletRecord[]>('/ledger/coin-reward/wallets', {} as any)
}

// ─── QCoin Exchange (wallet-service) ──────────────────

export async function qcoinExchange(body: {
  tenantId: string; customerId: string; direction: 'BUY_QCOIN' | 'SELL_QCOIN'
  fiatAmount: number; qcoinAmount: number; fiatCurrency?: string
  qcoinCurrency?: string; description?: string
}) {
  return apiClient.post<{ message: string; transactionId: string; balanceBefore: number; balanceAfter: number }>(
    '/wallet/qcoin-exchange', body,
  )
}
