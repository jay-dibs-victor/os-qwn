import { create } from 'zustand';
import { authAPI, AuthUserDTO } from '../api/auth';
import { configureApiClient } from '../api/client';
import { secureStorage } from '../utils/storage';
import { isMockMode } from '../config/env';
import { getApiErrorMessage } from '../utils/errors';
import { driverAPI, OnboardingDraft, VettingStatusResponse } from '../api/driver';

export interface AuthState {
  user: AuthUserDTO | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  hasHydrated: boolean;

  // Actions
  hydrate: () => Promise<void>;
  login: (email: string, password: string, coords?: { lat?: number; lng?: number }) => Promise<LoginOutcome>;
  signup: (data: SignupDraft) => Promise<SignupOutcome>;
  register: (data: SignupDraft) => Promise<SignupOutcome>;
  verifyCode: (email: string, code: string) => Promise<LoginOutcome>;
  resendCode: (email: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, code: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleAuth: (payload: { idToken?: string; code?: string; redirectUri?: string }) => Promise<LoginOutcome>;
  submitDriverOnboarding: (draft: OnboardingDraft) => Promise<{ success: boolean; error?: string }>;
  refreshDriverOnboardingStatus: () => Promise<{ success: boolean; status?: VettingStatusResponse['data'] | { vettingStatus: 'PENDING'; adminVerified: false }; error?: string }>;
  logout: () => Promise<void>;
  setToken: (token: string | null) => Promise<void>;
  setUser: (user: AuthUserDTO | null) => Promise<void>;
  clearError: () => void;
}

export interface SignupDraft {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  username: string;
  phoneNumber: string;
}

export type LoginOutcome =
  | { success: true; user: AuthUserDTO; token: string }
  | { success: false; requiresVerification?: boolean; email?: string; error: string };

export type SignupOutcome =
  | { success: true; requiresVerification: boolean; email: string }
  | { success: false; error: string };

function unwrapAuth(response: unknown): { token: string; user: AuthUserDTO } | null {
  if (!response || typeof response !== 'object') return null;
  const r = response as { data?: { data?: unknown } };
  const inner = r.data?.data;
  if (Array.isArray(inner) && inner.length > 0) {
    const first = inner[0] as { token?: string; user?: AuthUserDTO };
    if (typeof first?.token === 'string' && first.user) {
      return { token: first.token, user: first.user };
    }
  }
  if (inner && typeof inner === 'object') {
    const i = inner as { token?: string; user?: AuthUserDTO };
    if (typeof i.token === 'string' && i.user) {
      return { token: i.token, user: i.user };
    }
  }
  return null;
}

function unwrapMeUser(response: unknown): AuthUserDTO | null {
  if (!response || typeof response !== 'object') return null;
  const r = response as { data?: { data?: AuthUserDTO } };
  return r.data?.data ?? null;
}

// Wire the apiClient to read the token from this store at request time.
configureApiClient({
  tokenProvider: () => useAuthStore.getState().token,
  onUnauthorized: () => {
    void useAuthStore.getState().logout();
  },
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  hasHydrated: false,

  async hydrate() {
    if (isMockMode()) {
      set({ hasHydrated: true });
      return;
    }
    try {
      const [token, user] = await Promise.all([
        secureStorage.getAuthToken(),
        secureStorage.getAuthUser<AuthUserDTO>(),
      ]);
      set({ token, user, hasHydrated: true });
    } catch {
      set({ hasHydrated: true });
    }
  },

  async login(email, password, coords) {
    if (isMockMode()) {
      const user: AuthUserDTO = {
        id: 'mock-driver-001',
        email,
        firstname: 'Test',
        lastname: 'Driver',
        username: email.split('@')[0] ?? 'testdriver',
        phone_number: '+44 7700 900321',
        isVerified: true,
        vettingStatus: 'PENDING',
        adminVerified: false,
      };
      const token = 'mock-token-dev-only';
      set({ user, token, loading: false, error: null });
      return { success: true, user, token };
    }

    set({ loading: true, error: null });
    try {
      const res = await authAPI.login({
        email: email.trim(),
        password,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      const pair = unwrapAuth(res);
      if (!pair) {
        const message = (res as { data?: { message?: string } })?.data?.message ?? 'Invalid credentials';
        set({ loading: false, error: message });
        return { success: false, error: message };
      }
      await Promise.all([
        secureStorage.setAuthToken(pair.token),
        secureStorage.setAuthUser(pair.user),
      ]);
      set({ user: pair.user, token: pair.token, loading: false, error: null });
      return { success: true, user: pair.user, token: pair.token };
    } catch (err) {
      const message = getApiErrorMessage(err, 'Login failed');
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  async signup(data) {
    return get().register(data);
  },

  async register(data) {
    if (isMockMode()) {
      return { success: true, requiresVerification: true, email: data.email };
    }
    set({ loading: true, error: null });
    try {
      await authAPI.signup({
        email: data.email,
        password: data.password,
        firstname: data.firstname,
        lastname: data.lastname,
        username: data.username,
        phoneNumber: data.phoneNumber,
        user_type: 'Individual',
        roles: 'Individual Driver',
        terms_and_cond: 'selected',
      });
      set({ loading: false });
      return { success: true, requiresVerification: true, email: data.email };
    } catch (err) {
      const message = getApiErrorMessage(err, 'Registration failed');
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  async verifyCode(email, code) {
    if (isMockMode()) {
      const user: AuthUserDTO = {
        id: 'mock-driver-001',
        email,
        firstname: 'Test',
        lastname: 'Driver',
        username: email.split('@')[0] ?? 'testdriver',
        isVerified: true,
        vettingStatus: 'PENDING',
        adminVerified: false,
      };
      const token = 'mock-token-dev-only';
      await Promise.all([
        secureStorage.setAuthToken(token),
        secureStorage.setAuthUser(user),
      ]);
      set({ user, token, loading: false, error: null });
      return { success: true, user, token };
    }

    set({ loading: true, error: null });
    try {
      await authAPI.verifyCode({ email, code });
      // After verification, complete login by hitting /auth/me (token may be issued
      // server-side during verify). If that doesn't return a token we fall back to
      // a re-login prompt upstream — caller decides.
      const meRes = await authAPI.me();
      const meUser = unwrapMeUser(meRes);
      const existingToken = get().token;
      if (meUser && existingToken) {
        await secureStorage.setAuthUser(meUser);
        set({ user: meUser, loading: false, error: null });
        return { success: true, user: meUser, token: existingToken };
      }
      set({ loading: false });
      return { success: false, error: 'Verification succeeded but no session is active. Please log in.' };
    } catch (err) {
      const message = getApiErrorMessage(err, 'Verification failed');
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  async resendCode(email) {
    if (isMockMode()) return { success: true };
    set({ loading: true, error: null });
    try {
      await authAPI.resendCode({ email });
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const message = getApiErrorMessage(err, 'Could not resend code');
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  async forgotPassword(email) {
    if (isMockMode()) return { success: true };
    set({ loading: true, error: null });
    try {
      await authAPI.forgotPassword({ email });
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const message = getApiErrorMessage(err, 'Could not request password reset');
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  async resetPassword(email, code, password) {
    if (isMockMode()) return { success: true };
    set({ loading: true, error: null });
    try {
      await authAPI.resetPassword({ email, code, password });
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const message = getApiErrorMessage(err, 'Password reset failed');
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  async googleAuth(payload) {
    if (isMockMode()) {
      const user: AuthUserDTO = {
        id: 'mock-driver-001',
        email: 'driver@queens.app',
        firstname: 'Test',
        lastname: 'Driver',
        username: 'testdriver',
        isVerified: true,
        vettingStatus: 'PENDING',
        adminVerified: false,
      };
      const token = 'mock-token-dev-only';
      await Promise.all([
        secureStorage.setAuthToken(token),
        secureStorage.setAuthUser(user),
      ]);
      set({ user, token, loading: false, error: null });
      return { success: true, user, token };
    }

    set({ loading: true, error: null });
    try {
      const res = await authAPI.googleMobileAuth({ ...payload, role: 'driver' });
      const pair = unwrapAuth(res);
      if (!pair) {
        const message = (res as { data?: { message?: string } })?.data?.message ?? 'Google sign-in failed';
        set({ loading: false, error: message });
        return { success: false, error: message };
      }
      await Promise.all([
        secureStorage.setAuthToken(pair.token),
        secureStorage.setAuthUser(pair.user),
      ]);
      set({ user: pair.user, token: pair.token, loading: false, error: null });
      return { success: true, user: pair.user, token: pair.token };
    } catch (err) {
      const message = getApiErrorMessage(err, 'Google sign-in failed');
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  async submitDriverOnboarding(draft) {
    if (isMockMode()) {
      set(state => ({
        user: state.user
          ? { ...state.user, vettingStatus: 'PENDING', adminVerified: false }
          : state.user,
        loading: false,
      }));
      return { success: true };
    }
    set({ loading: true, error: null });
    try {
      await driverAPI.submitOnboarding(draft);
      const meRes = await authAPI.me();
      const meUser = unwrapMeUser(meRes);
      if (meUser) {
        await secureStorage.setAuthUser(meUser);
        set({ user: meUser, loading: false });
      } else {
        set({ loading: false });
      }
      return { success: true };
    } catch (err) {
      const message = getApiErrorMessage(err, 'Onboarding submission failed');
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  async refreshDriverOnboardingStatus() {
    if (isMockMode()) {
      return { success: true, status: { vettingStatus: 'PENDING', adminVerified: false } as const };
    }
    set({ loading: true, error: null });
    try {
      const data = await driverAPI.pollVettingStatus();
      if (data) {
        const current = get().user;
        if (current) {
          const next = { ...current, vettingStatus: data.status, adminVerified: data.adminVerified };
          await secureStorage.setAuthUser(next);
          set({ user: next, loading: false });
        } else {
          set({ loading: false });
        }
        return { success: true, status: data };
      }
      set({ loading: false });
      return { success: false, error: 'No data returned' };
    } catch (err) {
      const message = getApiErrorMessage(err, 'Could not refresh status');
      set({ loading: false, error: message });
      return { success: false, error: message };
    }
  },

  async logout() {
    if (!isMockMode()) {
      try {
        await authAPI.logout();
      } catch {
        // Server-side logout failure is non-fatal; local state still cleared.
      }
    }
    await secureStorage.clearAll();
    set({ user: null, token: null, error: null });
  },

  async setToken(token) {
    if (token) await secureStorage.setAuthToken(token);
    else await secureStorage.clearAuthToken();
    set({ token });
  },

  async setUser(user) {
    if (user) await secureStorage.setAuthUser(user);
    else await secureStorage.clearAuthUser();
    set({ user });
  },

  clearError() {
    set({ error: null });
  },
}));
