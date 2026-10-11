import { request } from './client'

export type RegisterRequest = {
  email: string
  phone: string
  password: string
  tenantId: string
  firstName: string
  lastName: string
}

export type RegisterResponse = {
  id: string
  email: string
  phone: string
  firstName: string
  lastName: string
}

export type LoginRequest = {
  email: string
  password: string
  tenantId?: string
}

export type LoginResponse =
  | { mfa_required: true; user_id: string }
  | {
      access_token: string
      refresh_token: string
      oauth?: {
        client_id?: string
        access_token?: string
        refresh_token?: string
        scope?: string
        tenant_id?: string
      }
    }

export type RefreshResponse = { access_token: string; refresh_token?: string }

export type VerifyMfaRequest = { userId: string; code: string }
export type VerifyMfaResponse = { access_token: string; refresh_token: string }

export type SetupMfaResponse = { secret: string; qrCode: string }
export type EnableMfaResponse = { message: string }
export type VerifyAccountResponse = { message: string; status?: string }

export type SendVerificationOtpRequest = { email: string; tenantId: string }
export type VerifyEmailOtpRequest = { email: string; otp: string; tenantId: string }
export type ForgotPasswordRequest = { email: string; tenantId: string }
export type ResetPasswordRequest = { email: string; otp: string; newPassword: string; tenantId: string }

export async function register(payload: RegisterRequest) {
  return request<RegisterResponse>({
    path: '/auth/register',
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export async function sendVerificationOtp(payload: SendVerificationOtpRequest) {
  return request<{ message: string }>({
    path: '/auth/send-verification-otp',
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export async function verifyEmailOtp(payload: VerifyEmailOtpRequest) {
  return request<{ message: string }>({
    path: '/auth/verify-email-otp',
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export async function forgotPassword(payload: ForgotPasswordRequest) {
  return request<{ message: string }>({
    path: '/auth/forgot-password',
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export async function resetPassword(payload: ResetPasswordRequest) {
  return request<{ message: string }>({
    path: '/auth/reset-password',
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export async function login(payload: LoginRequest) {
  return request<LoginResponse>({
    path: '/auth/login',
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export async function verifyMfa(payload: VerifyMfaRequest) {
  return request<VerifyMfaResponse>({
    path: '/auth/mfa/verify',
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export async function refreshTokens(refresh_token: string) {
  return request<RefreshResponse>({
    path: '/auth/refresh',
    method: 'POST',
    body: { refresh_token },
    auth: false,
    skipAuthRefresh: true,
  })
}

export async function logout() {
  return request<{ message: string }>({
    path: '/auth/logout',
    method: 'POST',
    auth: true,
    skipAuthRefresh: true,
  })
}

export async function setupMfa() {
  return request<SetupMfaResponse>({
    path: '/auth/mfa/setup',
    method: 'POST',
    auth: true,
  })
}

export async function enableMfa(code: string) {
  return request<EnableMfaResponse>({
    path: '/auth/mfa/enable',
    method: 'POST',
    body: { code },
    auth: true,
  })
}

export async function verifyAccount(userId: string) {
  return request<VerifyAccountResponse>({
    path: '/auth/verify-account',
    method: 'POST',
    body: { userId },
    auth: false,
  })
}

export async function getMe() {
  return request<{
    id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    tenantId: string
    role: 'root_admin' | 'tenant_admin' | 'account_officer' | 'staff'
    status: string
    isVerified: boolean
    createdAt: string
  }>({
    path: '/auth/me',
    method: 'GET',
    auth: true,
  })
}
