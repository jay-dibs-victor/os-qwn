/**
 * useAuthStore — taxi-admin
 * Replaces: useAuthCollection.js + AuthProvider context + AuthGateWay fetch logic
 */
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import apiClient from '../api/apiClient';

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ── State ──────────────────────────────────────────────
        user: null,
        token: null,
        loading: false,
        error: null,

        // ── Computed ───────────────────────────────────────────
        isAuthenticated: () => Boolean(get().token && get().user),
        isAdmin: () => get().user?.roles === 'admin' || get().user?.role === 'admin',
        isSuperAdmin: () => get().user?.roles === 'superadmin',

        // ── Actions ────────────────────────────────────────────
        login: async (credentials) => {
          set({ loading: true, error: null });
          try {
            const { data } = await apiClient.post('/auth/login', credentials);
            set({ user: data.user, token: data.token, loading: false, error: null });
            return { success: true };
          } catch (err) {
            const message = err.response?.data?.message || 'Login failed. Check your credentials.';
            set({ loading: false, error: message, user: null, token: null });
            return { success: false, error: message };
          }
        },

        logout: () => {
          set({ user: null, token: null, error: null, loading: false });
          localStorage.removeItem('goomtaxi-admin-auth');
          sessionStorage.clear();
        },

        updateUser: (updatedUser) => {
          set((state) => ({ user: { ...state.user, ...updatedUser } }));
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'goomtaxi-admin-auth',
        partialize: (state) => ({ user: state.user, token: state.token }),
      },
    ),
    { name: 'AdminAuthStore' },
  ),
);
