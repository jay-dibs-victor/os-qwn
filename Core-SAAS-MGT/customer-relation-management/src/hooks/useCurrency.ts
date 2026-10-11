import { useState, useEffect, useCallback } from 'react'
import {
  getTenantSettings,
  getExchangeRates,
  detectUserCurrency,
  type SupportedCurrency,
  type PlatformSettings,
} from '../api/settings'

const LS_KEY = 'crm_display_currency'

// ─── Full world currency list ─────────────────────────────────────────────────
// Covers 150+ currencies. The exchange-rate API (open.er-api.com) supports all
// ISO 4217 codes so any of these will convert correctly.
export const ALL_CURRENCIES: SupportedCurrency[] = [
  { code: 'USD', name: 'US Dollar',                symbol: '$',    flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',                     symbol: '€',    flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',            symbol: '£',    flag: '🇬🇧' },
  { code: 'NGN', name: 'Nigerian Naira',           symbol: '₦',    flag: '🇳🇬' },
  { code: 'KES', name: 'Kenyan Shilling',          symbol: 'KSh',  flag: '🇰🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi',            symbol: '₵',    flag: '🇬🇭' },
  { code: 'ZAR', name: 'South African Rand',       symbol: 'R',    flag: '🇿🇦' },
  { code: 'RWF', name: 'Rwandan Franc',            symbol: 'RF',   flag: '🇷🇼' },
  { code: 'XOF', name: 'West African CFA Franc',   symbol: 'CFA',  flag: '🌍' },
  { code: 'XAF', name: 'Central African CFA',      symbol: 'FCFA', flag: '🌍' },
  { code: 'EGP', name: 'Egyptian Pound',           symbol: 'E£',   flag: '🇪🇬' },
  { code: 'ETB', name: 'Ethiopian Birr',           symbol: 'Br',   flag: '🇪🇹' },
  { code: 'TZS', name: 'Tanzanian Shilling',       symbol: 'TSh',  flag: '🇹🇿' },
  { code: 'UGX', name: 'Ugandan Shilling',         symbol: 'USh',  flag: '🇺🇬' },
  { code: 'ZMW', name: 'Zambian Kwacha',           symbol: 'ZK',   flag: '🇿🇲' },
  { code: 'MWK', name: 'Malawian Kwacha',          symbol: 'MK',   flag: '🇲🇼' },
  { code: 'MZN', name: 'Mozambican Metical',       symbol: 'MT',   flag: '🇲🇿' },
  { code: 'BWP', name: 'Botswana Pula',            symbol: 'P',    flag: '🇧🇼' },
  { code: 'NAD', name: 'Namibian Dollar',          symbol: 'N$',   flag: '🇳🇦' },
  { code: 'MAD', name: 'Moroccan Dirham',          symbol: 'MAD',  flag: '🇲🇦' },
  { code: 'DZD', name: 'Algerian Dinar',           symbol: 'DA',   flag: '🇩🇿' },
  { code: 'TND', name: 'Tunisian Dinar',           symbol: 'DT',   flag: '🇹🇳' },
  { code: 'LYD', name: 'Libyan Dinar',             symbol: 'LD',   flag: '🇱🇾' },
  { code: 'SDG', name: 'Sudanese Pound',           symbol: 'SDG',  flag: '🇸🇩' },
  { code: 'SOS', name: 'Somali Shilling',          symbol: 'Sh',   flag: '🇸🇴' },
  { code: 'CAD', name: 'Canadian Dollar',          symbol: 'C$',   flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar',        symbol: 'A$',   flag: '🇦🇺' },
  { code: 'NZD', name: 'New Zealand Dollar',       symbol: 'NZ$',  flag: '🇳🇿' },
  { code: 'CHF', name: 'Swiss Franc',              symbol: 'Fr',   flag: '🇨🇭' },
  { code: 'SEK', name: 'Swedish Krona',            symbol: 'kr',   flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone',          symbol: 'kr',   flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone',             symbol: 'kr',   flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Zloty',             symbol: 'zł',   flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna',             symbol: 'Kč',   flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint',         symbol: 'Ft',   flag: '🇭🇺' },
  { code: 'RON', name: 'Romanian Leu',             symbol: 'lei',  flag: '🇷🇴' },
  { code: 'BGN', name: 'Bulgarian Lev',            symbol: 'лв',   flag: '🇧🇬' },
  { code: 'HRK', name: 'Croatian Kuna',            symbol: 'kn',   flag: '🇭🇷' },
  { code: 'RUB', name: 'Russian Ruble',            symbol: '₽',    flag: '🇷🇺' },
  { code: 'UAH', name: 'Ukrainian Hryvnia',        symbol: '₴',    flag: '🇺🇦' },
  { code: 'TRY', name: 'Turkish Lira',             symbol: '₺',    flag: '🇹🇷' },
  { code: 'ILS', name: 'Israeli Shekel',           symbol: '₪',    flag: '🇮🇱' },
  { code: 'AED', name: 'UAE Dirham',               symbol: 'د.إ',  flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal',              symbol: '﷼',    flag: '🇸🇦' },
  { code: 'QAR', name: 'Qatari Riyal',             symbol: 'QR',   flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar',            symbol: 'KD',   flag: '🇰🇼' },
  { code: 'BHD', name: 'Bahraini Dinar',           symbol: 'BD',   flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial',               symbol: 'OMR',  flag: '🇴🇲' },
  { code: 'JOD', name: 'Jordanian Dinar',          symbol: 'JD',   flag: '🇯🇴' },
  { code: 'LBP', name: 'Lebanese Pound',           symbol: 'L£',   flag: '🇱🇧' },
  { code: 'IQD', name: 'Iraqi Dinar',              symbol: 'IQD',  flag: '🇮🇶' },
  { code: 'IRR', name: 'Iranian Rial',             symbol: '﷼',    flag: '🇮🇷' },
  { code: 'INR', name: 'Indian Rupee',             symbol: '₹',    flag: '🇮🇳' },
  { code: 'PKR', name: 'Pakistani Rupee',          symbol: '₨',    flag: '🇵🇰' },
  { code: 'BDT', name: 'Bangladeshi Taka',         symbol: '৳',    flag: '🇧🇩' },
  { code: 'LKR', name: 'Sri Lankan Rupee',         symbol: 'Rs',   flag: '🇱🇰' },
  { code: 'NPR', name: 'Nepalese Rupee',           symbol: 'Rs',   flag: '🇳🇵' },
  { code: 'MMK', name: 'Myanmar Kyat',             symbol: 'K',    flag: '🇲🇲' },
  { code: 'THB', name: 'Thai Baht',                symbol: '฿',    flag: '🇹🇭' },
  { code: 'VND', name: 'Vietnamese Dong',          symbol: '₫',    flag: '🇻🇳' },
  { code: 'IDR', name: 'Indonesian Rupiah',        symbol: 'Rp',   flag: '🇮🇩' },
  { code: 'MYR', name: 'Malaysian Ringgit',        symbol: 'RM',   flag: '🇲🇾' },
  { code: 'SGD', name: 'Singapore Dollar',         symbol: 'S$',   flag: '🇸🇬' },
  { code: 'PHP', name: 'Philippine Peso',          symbol: '₱',    flag: '🇵🇭' },
  { code: 'KRW', name: 'South Korean Won',         symbol: '₩',    flag: '🇰🇷' },
  { code: 'JPY', name: 'Japanese Yen',             symbol: '¥',    flag: '🇯🇵' },
  { code: 'CNY', name: 'Chinese Yuan',             symbol: '¥',    flag: '🇨🇳' },
  { code: 'HKD', name: 'Hong Kong Dollar',         symbol: 'HK$',  flag: '🇭🇰' },
  { code: 'TWD', name: 'Taiwan Dollar',            symbol: 'NT$',  flag: '🇹🇼' },
  { code: 'MXN', name: 'Mexican Peso',             symbol: '$',    flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real',           symbol: 'R$',   flag: '🇧🇷' },
  { code: 'ARS', name: 'Argentine Peso',           symbol: '$',    flag: '🇦🇷' },
  { code: 'CLP', name: 'Chilean Peso',             symbol: '$',    flag: '🇨🇱' },
  { code: 'COP', name: 'Colombian Peso',           symbol: '$',    flag: '🇨🇴' },
  { code: 'PEN', name: 'Peruvian Sol',             symbol: 'S/',   flag: '🇵🇪' },
  { code: 'VES', name: 'Venezuelan Bolívar',       symbol: 'Bs',   flag: '🇻🇪' },
  { code: 'UYU', name: 'Uruguayan Peso',           symbol: '$U',   flag: '🇺🇾' },
  { code: 'BOB', name: 'Bolivian Boliviano',       symbol: 'Bs',   flag: '🇧🇴' },
  { code: 'PYG', name: 'Paraguayan Guaraní',       symbol: '₲',    flag: '🇵🇾' },
  { code: 'GTQ', name: 'Guatemalan Quetzal',       symbol: 'Q',    flag: '🇬🇹' },
  { code: 'CRC', name: 'Costa Rican Colón',        symbol: '₡',    flag: '🇨🇷' },
  { code: 'DOP', name: 'Dominican Peso',           symbol: 'RD$',  flag: '🇩🇴' },
  { code: 'JMD', name: 'Jamaican Dollar',          symbol: 'J$',   flag: '🇯🇲' },
  { code: 'TTD', name: 'Trinidad & Tobago Dollar', symbol: 'TT$',  flag: '🇹🇹' },
]

// Quick-access currencies shown as pills (most common)
export const QUICK_CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR']

// Default currencies list (alias for backward compat)
export const DEFAULT_CURRENCIES = ALL_CURRENCIES

export interface CurrencyState {
  tenantCurrency: string
  viewerCurrency: string
  displayCurrency: string
  rates: Record<string, number>
  currencies: SupportedCurrency[]
  settings: PlatformSettings | null
  loading: boolean
  lastUpdated: string
  ratesSource: string
}

export interface CurrencyActions {
  convert: (amount: number) => number
  format: (amount: number, opts?: { decimals?: number }) => string
  symbol: (code?: string) => string
  setDisplayCurrency: (code: string) => void
  refresh: () => void
}

export function useCurrency(): CurrencyState & CurrencyActions {
  // Restore persisted display currency from localStorage
  const savedCurrency = typeof window !== 'undefined'
    ? (localStorage.getItem(LS_KEY) ?? null)
    : null

  const [state, setState] = useState<CurrencyState>({
    tenantCurrency: 'USD',
    viewerCurrency: 'USD',
    displayCurrency: savedCurrency ?? 'USD',
    rates: { USD: 1 },
    currencies: ALL_CURRENCIES,
    settings: null,
    loading: true,
    lastUpdated: '',
    ratesSource: '',
  })

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true }))
    try {
      // Load tenant settings
      const settingsRes = await getTenantSettings().catch(() => null)
      const tenantCurrency = settingsRes?.settings?.currency ?? 'USD'
      const settings = settingsRes?.settings ?? null

      // Fetch exchange rates — always USD base (ledger is seeded in USD)
      const ratesRes = await getExchangeRates('USD').catch(() => null)
      const rates = ratesRes?.rates ?? { USD: 1 }
      const lastUpdated = ratesRes?.lastUpdated ?? ''
      const ratesSource = ratesRes?.source ?? 'fallback'

      // Detect viewer's local currency (background, non-blocking)
      const detectedRes = await detectUserCurrency().catch(() => null)
      const viewerCurrency = detectedRes?.currency ?? tenantCurrency

      // Priority: 1) localStorage saved preference, 2) tenant configured, 3) USD
      const savedPref = localStorage.getItem(LS_KEY)
      const displayCurrency = savedPref ?? tenantCurrency

      setState({
        tenantCurrency,
        viewerCurrency,
        displayCurrency,
        rates,
        currencies: ALL_CURRENCIES,
        settings,
        loading: false,
        lastUpdated,
        ratesSource,
      })
    } catch {
      setState(s => ({ ...s, loading: false }))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // ── Actions ────────────────────────────────────────────────────────────────

  const convert = useCallback(
    (amount: number): number => {
      // Ledger amounts are in USD. rates[code] = units of that currency per 1 USD.
      const rate = state.rates[state.displayCurrency] ?? 1
      return amount * rate
    },
    [state.rates, state.displayCurrency],
  )

  const symbol = useCallback(
    (code?: string): string => {
      const target = code ?? state.displayCurrency
      return ALL_CURRENCIES.find(c => c.code === target)?.symbol ?? target
    },
    [state.displayCurrency],
  )

  const format = useCallback(
    (amount: number, opts?: { decimals?: number }): string => {
      const converted = convert(amount)
      const sym = symbol()
      const decimals = opts?.decimals ?? 2
      return `${sym}${converted.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`
    },
    [convert, symbol],
  )

  const setDisplayCurrency = useCallback((code: string) => {
    // Persist to localStorage so it survives page refresh
    localStorage.setItem(LS_KEY, code)
    setState(s => ({ ...s, displayCurrency: code }))
  }, [])

  return {
    ...state,
    convert,
    format,
    symbol,
    setDisplayCurrency,
    refresh: load,
  }
}
