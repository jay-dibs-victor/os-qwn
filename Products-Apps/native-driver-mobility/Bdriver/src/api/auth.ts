import client from './client';

/**
 * Queens OS Auth API — Mobile Driver
 * Endpoints match backend auth service exactly.
 */

export interface SignupRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  username: string;
  phoneNumber: string;
  user_type: 'Individual';
  roles: 'Individual Driver';
  terms_and_cond: 'selected';
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  lat?: number;
  lng?: number;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
}

export interface GoogleMobileAuthRequest {
  idToken?: string;
  code?: string;
  redirectUri?: string;
  role: 'user' | 'driver';
}

export interface AuthUserDTO {
  id: string | number;
  email: string;
  firstname: string;
  lastname: string;
  username?: string;
  phone_number?: string;
  isVerified?: boolean;
  avatar?: string | null;
  vettingStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  adminVerified?: boolean;
  [key: string]: unknown;
}

export interface AuthResponse {
  status: number;
  data: Array<{
    token: string;
    user: AuthUserDTO;
    requiresVerification?: boolean;
  }>;
  message: string;
}

export interface VerifyResponse {
  status: number;
  message: string;
}

export interface MeResponse {
  status: number;
  data: AuthUserDTO;
  message: string;
}

export const authAPI = {
  signup: (data: SignupRequest) => client.post<AuthResponse>('/auth/drivers-signup', data),
  login: (data: LoginRequest) => client.post<AuthResponse>('/auth/drivers-login', data),
  verifyCode: (data: VerifyCodeRequest) => client.post<VerifyResponse>('/auth/verify-code', data),
  resendCode: (data: ResendCodeRequest) => client.post<VerifyResponse>('/auth/resend-code', data),
  forgotPassword: (data: ForgotPasswordRequest) =>
    client.post<VerifyResponse>('/auth/forgot_password', data),
  resetPassword: (data: ResetPasswordRequest) =>
    client.post<VerifyResponse>('/auth/resetpassword/mobile', data),
  googleMobileAuth: (data: GoogleMobileAuthRequest) =>
    client.post<AuthResponse>('/auth/google/mobile', data),
  me: () => client.get<MeResponse>('/auth/me'),
  logout: () => client.post<VerifyResponse>('/auth/logout', {}),
  refresh: () => client.post<{ token: string }>('/auth/refresh', {}),
};
