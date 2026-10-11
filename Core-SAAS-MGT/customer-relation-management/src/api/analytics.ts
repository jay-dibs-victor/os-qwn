import { request } from './client'

export interface DashboardMetrics {
  grossVolume: number
  commission: number
  chamaEscrow: number
  greenSwapCredits: number
  totalCustomers: number
  driverCount: number
  riderCount: number
  partnerCount: number
  activeUsers: number
  dateRange?: { startDate: string; endDate: string } | null
}

export interface ChartData {
  labels: string[]
  data: number[]
  year: string
  dateRange?: { startDate: string; endDate: string } | null
  multipliers?: { year: number; range: number }
  glAccount?: string
  source?: string
}

export interface Transaction {
  id: string
  timestamp: string
  type: 'chama' | 'swap' | 'fuel' | 'vetting' | 'system'
  message: string
  amount?: string
  status: 'SUCCESS' | 'PENDING' | 'ALERT'
}

export interface AnalyticsFilters {
  year?: string
  startDate?: string
  endDate?: string
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: AnalyticsFilters): string {
  const params = new URLSearchParams()
  if (filters.year) params.append('year', filters.year)
  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function getDashboardMetrics(filters?: AnalyticsFilters) {
  const query = buildQueryString(filters || {})
  return request<DashboardMetrics>({
    path: `/analytics/dashboard/metrics${query}`,
    method: 'GET',
    auth: true,
  })
}

export async function getRevenueChart(filters?: AnalyticsFilters) {
  const query = buildQueryString({ year: '2026', ...filters })
  return request<ChartData>({
    path: `/analytics/charts/revenue${query}`,
    method: 'GET',
    auth: true,
  })
}

export async function getLoansChart(filters?: AnalyticsFilters) {
  const query = buildQueryString({ year: '2026', ...filters })
  return request<ChartData>({
    path: `/analytics/charts/loans${query}`,
    method: 'GET',
    auth: true,
  })
}

export async function getCustomersChart(filters?: AnalyticsFilters) {
  const query = buildQueryString({ year: '2026', ...filters })
  return request<ChartData>({
    path: `/analytics/charts/customers${query}`,
    method: 'GET',
    auth: true,
  })
}

export async function getDriversChart(filters?: AnalyticsFilters) {
  const query = buildQueryString({ year: '2026', ...filters })
  return request<ChartData>({
    path: `/analytics/charts/drivers${query}`,
    method: 'GET',
    auth: true,
  })
}

export async function getPartnersChart(filters?: AnalyticsFilters) {
  const query = buildQueryString({ year: '2026', ...filters })
  return request<ChartData>({
    path: `/analytics/charts/partners${query}`,
    method: 'GET',
    auth: true,
  })
}

export async function getRecentTransactions(limit: number = 10, filters?: AnalyticsFilters) {
  const query = buildQueryString({ ...filters })
  const limitParam = `limit=${limit}`
  const separator = query ? '&' : '?'
  return request<Transaction[]>({
    path: `/analytics/transactions/recent?${limitParam}${query ? separator + query.substring(1) : ''}`,
    method: 'GET',
    auth: true,
  })
}
