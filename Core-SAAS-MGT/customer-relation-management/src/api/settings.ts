import { request } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SupportedCurrency {
  code: string
  name: string
  symbol: string
  flag: string
}

export interface PlatformSettings {
  currency: string
  commissionRate: number
  solarDiscount: number
  chamaGroupSize: number
  maxDailyFuelLimit: number
  snackVendingEnabled: boolean
  greenEnergyGeoLock: boolean
}

export interface TenantSettingsResponse {
  tenantId: string
  settings: PlatformSettings
  supportedCurrencies: SupportedCurrency[]
}

export interface ExchangeRatesResponse {
  base: string
  rates: Record<string, number>
  lastUpdated: string
  source: string
  error?: string
}

export interface DetectedCurrencyResponse {
  currency: string
  country: string
  countryName: string
  source: string
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getTenantSettings(): Promise<TenantSettingsResponse> {
  return request<TenantSettingsResponse>({
    path: '/auth/settings',
    method: 'GET',
    auth: true,
  })
}

export async function updateTenantSettings(
  settings: Partial<PlatformSettings>,
): Promise<{ success: boolean; settings: PlatformSettings }> {
  return request({
    path: '/auth/settings',
    method: 'PATCH',
    body: settings,
    auth: true,
  })
}

export async function getSupportedCurrencies(): Promise<{ currencies: SupportedCurrency[] }> {
  return request({
    path: '/auth/settings/currencies',
    method: 'GET',
    auth: true,
  })
}

export async function getExchangeRates(base = 'NGN'): Promise<ExchangeRatesResponse> {
  return request<ExchangeRatesResponse>({
    path: `/auth/settings/exchange-rates?base=${base}`,
    method: 'GET',
    auth: true,
  })
}

export async function detectUserCurrency(): Promise<DetectedCurrencyResponse> {
  return request<DetectedCurrencyResponse>({
    path: '/auth/settings/detect-currency',
    method: 'GET',
    auth: true,
  })
}
