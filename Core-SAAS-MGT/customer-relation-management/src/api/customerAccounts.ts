import { request } from './client'

export type CustomerAccountKind = 'RIDER' | 'DRIVER' | 'PARTNER'
export type CustomerProfileType = 'INDIVIDUAL' | 'ORGANIZATION'

export type CustomerAccount = Record<string, unknown> & {
  id: string
  tenantId: string
  kind: CustomerAccountKind
  profileType: CustomerProfileType
  status: string
  createdAt?: string
  updatedAt?: string
}

export async function listCustomerAccounts(opts?: {
  kind?: CustomerAccountKind
  profileType?: CustomerProfileType
  search?: string
}) {
  return request<CustomerAccount[]>({
    path: '/customer-accounts',
    method: 'GET',
    query: opts,
    auth: true,
  })
}

export async function createCustomerAccount(body: Record<string, unknown>) {
  return request<CustomerAccount>({
    path: '/customer-accounts',
    method: 'POST',
    body,
    auth: true,
  })
}

export async function updateCustomerAccount(id: string, body: Record<string, unknown>) {
  return request<CustomerAccount>({
    path: `/customer-accounts/${encodeURIComponent(id)}`,
    method: 'PATCH',
    body,
    auth: true,
  })
}

export async function getCustomerAccount(id: string) {
  return request<CustomerAccount>({
    path: `/customer-accounts/${encodeURIComponent(id)}`,
    method: 'GET',
    auth: true,
  })
}

export async function deleteCustomerAccount(id: string) {
  return request<{ message: string }>({
    path: `/customer-accounts/${encodeURIComponent(id)}`,
    method: 'DELETE',
    auth: true,
  })
}
