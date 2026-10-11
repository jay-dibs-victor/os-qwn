import { getTenantId } from './tenant'

export type ApiError = {
  status: number
  message: string
  details?: unknown
}

export type ApprovalInterceptedResponse = {
  message: string
  requestId: string
  requiredPermission?: string
}

export function isApprovalInterceptedResponse(value: unknown): value is ApprovalInterceptedResponse {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.requestId === 'string' && typeof v.message === 'string'
}

type QueryValue = string | number | boolean | null | undefined

type RequestOptions = {
  path: string
  method?: string
  query?: Record<string, QueryValue>
  body?: unknown
  headers?: HeadersInit
  auth?: boolean
  skipAuthRefresh?: boolean
}

type Tokens = { access_token: string; refresh_token?: string }

let authStateProvider:
  | (() => { accessToken?: string; refreshToken?: string; tenantId?: string; userId?: string })
  | undefined
let refreshTokensFn: ((refreshToken: string) => Promise<Tokens>) | undefined
let onTokensRefreshed: ((tokens: Tokens) => void) | undefined
let onUnauthorized: (() => void) | undefined

export function configureAuth(opts: {
  authStateProvider: () => { accessToken?: string; refreshToken?: string; tenantId?: string; userId?: string }
  refreshTokens: (refreshToken: string) => Promise<Tokens>
  onTokensRefreshed: (tokens: Tokens) => void
  onUnauthorized: () => void
}) {
  authStateProvider = opts.authStateProvider
  refreshTokensFn = opts.refreshTokens
  onTokensRefreshed = opts.onTokensRefreshed
  onUnauthorized = opts.onUnauthorized
}

function getBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not set')
  }
  return baseUrl.replace(/\/+$/, '')
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(getBaseUrl() + (path.startsWith('/') ? path : `/${path}`))
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text) as unknown
  } catch {
    return undefined
  }
}

async function readError(res: Response): Promise<ApiError> {
  const text = await res.text().catch(() => '')
  const parsed = text ? safeJsonParse(text) : undefined
  const message =
    (parsed as { message?: string } | undefined)?.message ||
    res.statusText ||
    'Request failed'

  return { status: res.status, message, details: parsed ?? text }
}

async function doFetch<T>(opts: RequestOptions): Promise<T> {
  const url = buildUrl(opts.path, opts.query)
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  const hasBody = opts.body !== undefined
  if (hasBody) headers['Content-Type'] = 'application/json'

  if (opts.headers) {
    const h = new Headers(opts.headers)
    h.forEach((value, key) => {
      headers[key] = value
    })
  }

  // Always set tenant ID header for all requests
  const state = authStateProvider?.()
  const tenantId = state?.tenantId || (typeof window !== 'undefined' ? getTenantId() : undefined)
  
  if (tenantId) {
    headers['x-tenant-id'] = tenantId
    console.log('📤 Request to', opts.path, 'with x-tenant-id:', tenantId)
  } else {
    console.warn('⚠️ No tenant ID found for request to', opts.path)
    const fallbackTenantId = getTenantId()
    if (fallbackTenantId) {
      headers['x-tenant-id'] = fallbackTenantId
      console.log('📤 Using fallback tenant ID:', fallbackTenantId)
    }
  }

  if (opts.auth) {
    const token = state?.accessToken
    if (token) headers.Authorization = `Bearer ${token}`
    if (state?.userId) headers['x-user-id'] = state.userId
  }

  console.log('📡 Fetching:', url, 'method:', opts.method ?? 'GET')
  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: hasBody ? JSON.stringify(opts.body) : undefined,
  })

  console.log('📥 Response status:', res.status, 'for', opts.path)

  if (!res.ok) {
    throw await readError(res)
  }

  if (res.status === 204) return undefined as T

  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function request<T>(opts: RequestOptions): Promise<T> {
  try {
    return await doFetch<T>(opts)
  } catch (err) {
    const e = err as ApiError
    const canRefresh =
      opts.auth &&
      !opts.skipAuthRefresh &&
      e &&
      typeof e.status === 'number' &&
      e.status === 401 &&
      !!authStateProvider?.().refreshToken &&
      !!refreshTokensFn &&
      !!onTokensRefreshed

    if (!canRefresh) throw err

    const refreshToken = authStateProvider?.().refreshToken
    if (!refreshToken) throw err

    try {
      const refreshFn = refreshTokensFn
      if (!refreshFn) throw err
      const tokens = await refreshFn(refreshToken)
      onTokensRefreshed?.(tokens)
      return await doFetch<T>({ ...opts, skipAuthRefresh: true })
    } catch {
      onUnauthorized?.()
      throw err
    }
  }
}

// API client with common HTTP methods
export const apiClient = {
  get: <T>(path: string, query?: Record<string, QueryValue>, auth = true) =>
    request<T>({ path, method: 'GET', query, auth }),
  
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>({ path, method: 'POST', body, auth }),
  
  put: <T>(path: string, body?: unknown, auth = true) =>
    request<T>({ path, method: 'PUT', body, auth }),
  
  patch: <T>(path: string, body?: unknown, auth = true) =>
    request<T>({ path, method: 'PATCH', body, auth }),
  
  delete: <T>(path: string, auth = true) =>
    request<T>({ path, method: 'DELETE', auth }),
}
