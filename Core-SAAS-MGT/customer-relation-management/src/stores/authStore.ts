import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { configureAuth } from '../api/client'
import { getTenantId } from '../api/tenant'
import * as authApi from '../api/auth'
import * as oauthApi from '../api/oauth'
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  storeOAuthState,
  buildAuthorizationUrl,
} from '../utils/oauth'

type AuthStatus = 'anonymous' | 'mfa_required' | 'authenticated'

type AuthState = {
  status: AuthStatus
  tenantId?: string
  userId?: string
  email?: string
  /** Platform role — determines what the user can do */
  role?: 'root_admin' | 'tenant_admin' | 'account_officer' | 'staff'
  accessToken?: string
  refreshToken?: string
  mfaUserId?: string
  lastRegisteredEmail?: string
  isBusy: boolean
  error?: string
}

type AuthActions = {
  hydrateTenant: () => void
  clearError: () => void
  register: (payload: Omit<authApi.RegisterRequest, 'tenantId'>) => Promise<void>
  sendVerificationOtp: (email: string) => Promise<void>
  verifyEmailOtp: (email: string, otp: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>
  verifyAccount: () => Promise<void>
  login: (payload: Omit<authApi.LoginRequest, 'tenantId'>) => Promise<void>
  verifyMfa: (code: string) => Promise<void>
  logout: () => Promise<void>
  setupMfa: () => Promise<authApi.SetupMfaResponse>
  enableMfa: (code: string) => Promise<void>
  // OAuth methods
  initiateOAuthLogin: () => Promise<void>
  handleOAuthCallback: (code: string, state: string) => Promise<void>
}

function decodeJwtPayload(token: string): { sub?: string; tenantId?: string; email?: string; role?: string } | undefined {
  const parts = token.split('.')
  if (parts.length < 2) return undefined
  const payload = parts[1]
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '==='.slice((normalized.length + 3) % 4)
  const json = atob(padded)
  return JSON.parse(json) as { sub?: string; tenantId?: string; email?: string; role?: string }
}

function applyTokens(set: (partial: Partial<AuthState>) => void, tokens: { access_token: string; refresh_token?: string }) {
  const decoded = decodeJwtPayload(tokens.access_token)
  set({
    status: 'authenticated',
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    userId: decoded?.sub,
    tenantId: decoded?.tenantId,
    email: decoded?.email,
    role: decoded?.role as AuthState['role'],
    mfaUserId: undefined,
    error: undefined,
  })
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => {
      configureAuth({
        authStateProvider: () => ({
          accessToken: get().accessToken,
          refreshToken: get().refreshToken,
          tenantId: get().tenantId,
          userId: get().userId,
        }),
        refreshTokens: async (refreshToken) => {
          const refreshed = await authApi.refreshTokens(refreshToken)
          return {
            access_token: refreshed.access_token,
            refresh_token: refreshed.refresh_token ?? refreshToken,
          }
        },
        onTokensRefreshed: (tokens) => {
          applyTokens(set, tokens)
        },
        onUnauthorized: () => {
          set({
            status: 'anonymous',
            accessToken: undefined,
            refreshToken: undefined,
            userId: undefined,
            email: undefined,
            role: undefined,
            mfaUserId: undefined,
          })
        },
      })

      return {
        status: 'anonymous',
        tenantId: getTenantId(),
        userId: undefined,
        email: undefined,
        role: undefined,
        accessToken: undefined,
        refreshToken: undefined,
        mfaUserId: undefined,
        lastRegisteredEmail: undefined,
        isBusy: false,
        error: undefined,

        hydrateTenant: () => {
          set({ tenantId: getTenantId() })
        },

        clearError: () => set({ error: undefined }),

        register: async (payload) => {
          const tenantId = get().tenantId
          if (!tenantId) {
            set({ error: 'Tenant is not resolved for this domain.' })
            return
          }

          set({ isBusy: true, error: undefined })
          try {
            const res = await authApi.register({ ...payload, tenantId })
            set({ lastRegisteredEmail: res.email })
            // Auto-send verification OTP after registration
            await authApi.sendVerificationOtp({ email: res.email, tenantId })
          } catch (e) {
            set({ error: (e as { message?: string } | undefined)?.message ?? 'Registration failed' })
            throw e
          } finally {
            set({ isBusy: false })
          }
        },

        sendVerificationOtp: async (email) => {
          const tenantId = get().tenantId
          if (!tenantId) {
            set({ error: 'Tenant is not resolved for this domain.' })
            return
          }

          set({ isBusy: true, error: undefined })
          try {
            await authApi.sendVerificationOtp({ email, tenantId })
          } catch (e) {
            set({ error: (e as { message?: string } | undefined)?.message ?? 'Failed to send OTP' })
          } finally {
            set({ isBusy: false })
          }
        },

        verifyEmailOtp: async (email, otp) => {
          const tenantId = get().tenantId
          if (!tenantId) {
            set({ error: 'Tenant is not resolved for this domain.' })
            return
          }

          set({ isBusy: true, error: undefined })
          try {
            await authApi.verifyEmailOtp({ email, otp, tenantId })
          } catch (e) {
            set({ error: (e as { message?: string } | undefined)?.message ?? 'OTP verification failed' })
            throw e
          } finally {
            set({ isBusy: false })
          }
        },

        forgotPassword: async (email) => {
          const tenantId = get().tenantId
          if (!tenantId) {
            set({ error: 'Tenant is not resolved for this domain.' })
            return
          }

          set({ isBusy: true, error: undefined })
          try {
            await authApi.forgotPassword({ email, tenantId })
          } catch (e) {
            set({ error: (e as { message?: string } | undefined)?.message ?? 'Failed to send reset OTP' })
          } finally {
            set({ isBusy: false })
          }
        },

        resetPassword: async (email, otp, newPassword) => {
          const tenantId = get().tenantId
          if (!tenantId) {
            set({ error: 'Tenant is not resolved for this domain.' })
            return
          }

          set({ isBusy: true, error: undefined })
          try {
            await authApi.resetPassword({ email, otp, newPassword, tenantId })
          } catch (e) {
            set({ error: (e as { message?: string } | undefined)?.message ?? 'Password reset failed' })
            throw e
          } finally {
            set({ isBusy: false })
          }
        },

        verifyAccount: async () => {
          const email = get().lastRegisteredEmail
          if (!email) return

          set({ isBusy: true, error: undefined })
          try {
            // Note: This method is deprecated in favor of verifyEmailOtp
            // Keeping for backward compatibility
            await authApi.verifyAccount(email)
          } catch (e) {
            set({ error: (e as { message?: string } | undefined)?.message ?? 'Account verification failed' })
          } finally {
            set({ isBusy: false })
          }
        },

        login: async (payload) => {
          console.log('📤 Sending login request:', { email: payload.email })
          set({ isBusy: true, error: undefined })
          try {
            // Don't send tenantId - backend will determine it from user record
            const res = await authApi.login(payload)
            console.log('📥 Login response received:', { hasAccessToken: !!('access_token' in res), hasMfaRequired: 'mfa_required' in res })
            
            if ('mfa_required' in res) {
              console.log('🔐 MFA required for user:', res.user_id)
              set({ status: 'mfa_required', mfaUserId: res.user_id })
              return
            }

            // Apply JWT tokens
            if ('access_token' in res) {
              console.log('✅ Applying JWT tokens to store')
              applyTokens(set, { access_token: res.access_token, refresh_token: res.refresh_token })
              
              // Store OAuth tokens if provided
              if (res.oauth) {
                sessionStorage.setItem('oauth_access_token', res.oauth.access_token || '')
                sessionStorage.setItem('oauth_refresh_token', res.oauth.refresh_token || '')
                sessionStorage.setItem('oauth_client_id', res.oauth.client_id || '')
                sessionStorage.setItem('oauth_scope', res.oauth.scope || '')
                console.log('✅ OAuth tokens received and stored from login response')
              }
            }
          } catch (e) {
            const errorMsg = (e as { message?: string } | undefined)?.message ?? 'Login failed'
            console.error('❌ Login error:', errorMsg, e)
            set({ error: errorMsg })
          } finally {
            set({ isBusy: false })
          }
        },

        verifyMfa: async (code) => {
          const userId = get().mfaUserId
          if (!userId) return

          set({ isBusy: true, error: undefined })
          try {
            const res = await authApi.verifyMfa({ userId, code })
            applyTokens(set, { access_token: res.access_token, refresh_token: res.refresh_token })
          } catch (e) {
            set({ error: (e as { message?: string } | undefined)?.message ?? 'MFA verification failed' })
          } finally {
            set({ isBusy: false })
          }
        },

        logout: async () => {
          set({ isBusy: true, error: undefined })
          try {
            if (get().accessToken) await authApi.logout()
          } finally {
            set({
              status: 'anonymous',
              accessToken: undefined,
              refreshToken: undefined,
              userId: undefined,
              email: undefined,
              role: undefined,
              mfaUserId: undefined,
              lastRegisteredEmail: undefined,
              isBusy: false,
            })
          }
        },

        setupMfa: async () => {
          return authApi.setupMfa()
        },

        enableMfa: async (code) => {
          set({ isBusy: true, error: undefined })
          try {
            await authApi.enableMfa(code)
          } catch (e) {
            set({ error: (e as { message?: string } | undefined)?.message ?? 'MFA enable failed' })
          } finally {
            set({ isBusy: false })
          }
        },

        // OAuth methods
        initiateOAuthLogin: async () => {
          try {
            set({ isBusy: true, error: undefined })

            // Generate PKCE parameters for secure OAuth flow
            const codeVerifier = generateCodeVerifier()
            const codeChallenge = await generateCodeChallenge(codeVerifier)
            const state = generateState()

            // Store state and verifier in session storage for later validation
            storeOAuthState(state, codeVerifier)

            // Build authorization URL
            // This endpoint now works as standalone login - no prior authentication needed
            const authUrl = buildAuthorizationUrl({
              authorizationEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/oauth/authorize`,
              clientId: 'client_queensos_webapp',
              redirectUri: `${window.location.origin}/oauth/callback`,
              scope: 'openid profile email',
              state,
              codeChallenge,
            })

            console.log('🔐 Initiating OAuth 2.0 login flow...')
            console.log('📍 Redirecting to:', authUrl)

            // Redirect to authorization endpoint
            // User will be prompted to login if not already authenticated
            window.location.href = authUrl
          } catch (e) {
            const errorMessage = (e as { message?: string } | undefined)?.message ?? 'OAuth initialization failed'
            set({ error: errorMessage, isBusy: false })
            console.error('❌ OAuth initialization error:', errorMessage)
          }
        },

        handleOAuthCallback: async (code: string, state: string) => {
          set({ isBusy: true, error: undefined })
          try {
            // Validate state and retrieve code verifier
            const { validateOAuthState } = await import('../utils/oauth')
            const codeVerifier = validateOAuthState(state)

            if (!codeVerifier) {
              throw new Error('Invalid OAuth state. Possible CSRF attack.')
            }

            // Exchange authorization code for tokens
            // Note: This endpoint is public and doesn't require tenant ID
            const tokens = await oauthApi.exchangeAuthorizationCode({
              code,
              codeVerifier,
              redirectUri: `${window.location.origin}/oauth/callback`,
              clientId: 'client_queensos_webapp',
            })

            // Apply tokens to store - this completes the OAuth login
            applyTokens(set, {
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
            })

            // Log successful OAuth login
            console.log('✅ OAuth login successful')
          } catch (e) {
            const errorMessage = (e as { message?: string } | undefined)?.message ?? 'OAuth callback failed'
            set({ error: errorMessage })
            console.error('❌ OAuth callback error:', errorMessage)
            throw e
          } finally {
            set({ isBusy: false })
          }
        },
      }
    },
    {
      name: 'crm_auth_session',
      partialize: (state) => ({
        status: state.status,
        tenantId: state.tenantId,
        userId: state.userId,
        email: state.email,
        role: state.role,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        mfaUserId: state.mfaUserId,
        lastRegisteredEmail: state.lastRegisteredEmail,
      }),
    },
  ),
)
