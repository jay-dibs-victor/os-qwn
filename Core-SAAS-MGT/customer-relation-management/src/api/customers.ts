import { request } from './client'

// ─── Core types matching the backend Customer entity exactly ─────────────────

export type CustomerType = 'driver' | 'rider' | 'partner'

export type CustomerStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'banned'
  | 'pending_verification'

export type PartnerCategory =
  | 'FLEET_OPERATOR'
  | 'BANK'
  | 'TELECOM'
  | 'FINTECH'
  | 'INDIVIDUAL'
  | 'CORPORATE'

// ─── Driver-specific metadata (stored in metadata field) ─────────────────────
export interface DriverMetadata {
  source?: 'individual' | 'partner'   // individual sign-up vs corporate fleet
  tier?: 'Swift' | 'Luxury'
  licenseClass?: string
  vehicleYear?: string
  vehicleColor?: string
  vettingStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'
  biometricSelfie?: string
  signature?: string
  docs?: {
    licenseFront?: string
    idProof?: string
    utilityBill?: string
    insurance?: string
  }
  [key: string]: unknown
}

// ─── Partner-specific metadata ────────────────────────────────────────────────
export interface PartnerMetadata {
  partnerCategory?: PartnerCategory
  revenueShare?: number
  bankName?: string
  accountNumber?: string
  swiftCode?: string
  integrationStatus?: 'PENDING' | 'SANDBOX' | 'LIVE' | 'FAILED'
  apiKey?: string
  webhookUrl?: string
  [key: string]: unknown
}

// ─── Full Customer record returned by the API ─────────────────────────────────
export interface Customer {
  id: string
  customerId?: string             // 10-digit unique customer identifier (separate from UUID id)
  tenantId: string
  customerType: CustomerType
  email: string
  phone: string
  firstName: string
  lastName: string
  profilePicture?: string
  status: CustomerStatus
  isVerified: boolean
  // Address
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  // Driver fields
  licenseNumber?: string
  licenseExpiry?: string
  vehicleRegistration?: string
  vehicleModel?: string
  rating?: number
  totalRides?: number
  totalEarnings?: number
  // Rider fields
  totalTrips?: number
  totalSpent?: number
  // External bank account info (for payouts)
  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string
  // Partner / ecosystem fields
  companyName?: string
  taxId?: string
  businessDescription?: string
  // Flexible metadata — carries driver/partner-specific extra fields
  metadata?: DriverMetadata | PartnerMetadata | Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ─── Create payload ───────────────────────────────────────────────────────────
export interface CreateCustomerPayload {
  customerType: CustomerType
  email: string
  phone: string
  firstName: string
  lastName: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  // Driver
  licenseNumber?: string
  licenseExpiry?: string
  vehicleRegistration?: string
  vehicleModel?: string
  // Partner
  companyName?: string
  taxId?: string
  businessDescription?: string
  // External bank info
  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string
  // Extra fields via metadata
  metadata?: Record<string, unknown>
}

// ─── Update payload ───────────────────────────────────────────────────────────
export type UpdateCustomerPayload = Partial<Omit<CreateCustomerPayload, 'customerType' | 'email'>> & {
  status?: CustomerStatus
  isVerified?: boolean
  rating?: number
}

type ListResponse<T> = { data: T[]; total: number }

export interface CustomerStats {
  totalCustomers: number
  drivers: number
  riders: number
  partners: number
  active: number
  pending: number
  suspended: number
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function listCustomers(skip = 0, take = 50) {
  return request<ListResponse<Customer>>({ path: '/customers', method: 'GET', query: { skip, take }, auth: true })
}

export interface CustomerFilter {
  search?: string
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  customerId?: string
  bankAccountNumber?: string
}

export async function listCustomersByType(type: CustomerType, skip = 0, take = 100, filters?: CustomerFilter) {
  const query: Record<string, string | number | boolean | null | undefined> = { skip, take }
  if (filters) {
    if (filters.search) query.search = filters.search
    if (filters.email) query.email = filters.email
    if (filters.firstName) query.firstName = filters.firstName
    if (filters.lastName) query.lastName = filters.lastName
    if (filters.phone) query.phone = filters.phone
    if (filters.customerId) query.customerId = filters.customerId
    if (filters.bankAccountNumber) query.bankAccountNumber = filters.bankAccountNumber
  }
  return request<ListResponse<Customer>>({ path: `/customers/type/${type}`, method: 'GET', query, auth: true })
}

export async function listCustomersByStatus(status: CustomerStatus, skip = 0, take = 50) {
  return request<ListResponse<Customer>>({ path: `/customers/status/${status}`, method: 'GET', query: { skip, take }, auth: true })
}

export async function getCustomerStats() {
  return request<CustomerStats>({ path: '/customers/stats', method: 'GET', auth: true })
}

export async function getCustomer(id: string) {
  return request<Customer>({ path: `/customers/${id}`, method: 'GET', auth: true })
}

export async function createCustomer(data: CreateCustomerPayload) {
  return request<Customer>({ path: '/customers', method: 'POST', body: data, auth: true })
}

export async function updateCustomer(id: string, data: UpdateCustomerPayload) {
  return request<Customer>({ path: `/customers/${id}`, method: 'PUT', body: data, auth: true })
}

export async function verifyCustomer(id: string) {
  return request<Customer>({ path: `/customers/${id}/verify`, method: 'POST', auth: true })
}

export async function suspendCustomer(id: string) {
  return request<Customer>({ path: `/customers/${id}/suspend`, method: 'POST', auth: true })
}

export async function deleteCustomer(id: string) {
  return request<{ message: string }>({ path: `/customers/${id}`, method: 'DELETE', auth: true })
}

// ─── Dashboard endpoint ───────────────────────────────────────────────────────
export interface DriverDashboardData {
  profile: Customer
  earningsSummary: Record<string, unknown> | null
  ledgerBalance: Record<string, unknown> | null
  accounts: Record<string, unknown>[] | null
}

export async function getCustomerDashboard(id: string) {
  return request<DriverDashboardData>({ path: `/customers/${id}/dashboard`, method: 'GET', auth: true })
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

export const listDrivers = (skip = 0, take = 100, filters?: CustomerFilter) => listCustomersByType('driver', skip, take, filters)
export const listRiders  = (skip = 0, take = 100, filters?: CustomerFilter) => listCustomersByType('rider',  skip, take, filters)
export const listEcosystemPartners = (skip = 0, take = 100, filters?: CustomerFilter) => listCustomersByType('partner', skip, take, filters)

// ─── Helper: build full name from Customer ────────────────────────────────────
export function customerFullName(c: Customer): string {
  return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email
}

// ─── Helper: get vetting status from metadata ─────────────────────────────────
export function driverVettingStatus(c: Customer): 'PENDING' | 'APPROVED' | 'REJECTED' {
  const meta = c.metadata as DriverMetadata | undefined
  if (meta?.vettingStatus) return meta.vettingStatus
  if (c.isVerified) return 'APPROVED'
  if (c.status === 'pending_verification') return 'PENDING'
  return 'PENDING'
}

export const customersApi = {
  getStats: getCustomerStats,
  listCustomers,
  listByType: listCustomersByType,
  verifyCustomer,
  suspendCustomer,
  deleteCustomer,
}

