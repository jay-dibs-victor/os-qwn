/**
 * useAuthStore — queens-driverapp
 * Replaces: useAuthCollection.js (empty useReducer) + sessionStorage scattered across components
 * Pattern: Zustand with persist middleware — survives page refreshes
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
        isDriver: () => get().user?.role === 'driver',
        isCourier: () => get().user?.roles?.includes('Courier Driver'),

        // ── Actions ────────────────────────────────────────────
        login: async (credentials) => {
          set({ loading: true, error: null });
          try {
            const { data } = await apiClient.post('/auth/drivers-login', credentials);
            
            // Check if backend requires verification
            if (data.requiresVerification) {
              set({ loading: false });
              return { success: false, requiresVerification: true };
            }

            const user = data.data[0].user;
            const token = data.data[0].token;

            set({
              user,
              token,
              loading: false,
              error: null,
            });

            // Immediately sync token to axios defaults to avoid race on first authenticated request
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true };
          } catch (err) {
            const message = err.response?.data?.error || 'Login failed';
            set({ loading: false, error: message, user: null, token: null });
            return { success: false, error: message, requiresVerification: err.response?.data?.requiresVerification };
          }
        },

        register: async (formData) => {
          set({ loading: true, error: null });
          try {
            const { data } = await apiClient.post('/auth/drivers-signup', formData);
            set({ loading: false });
            return { success: true, requiresVerification: data.data[0].requiresVerification };
          } catch (err) {
            const message = err.response?.data?.error || 'Registration failed';
            set({ loading: false, error: message });
            return { success: false, error: message };
          }
        },

        verifyEmail: async (email, code) => {
          set({ loading: true, error: null });
          try {
            await apiClient.post('/auth/drivers-verify-code', { email, code });
            set({ loading: false });
            return { success: true };
          } catch (err) {
            const message = err.response?.data?.message || 'Verification failed';
            set({ loading: false, error: message });
            return { success: false, error: message };
          }
        },

        resendVerification: async (email) => {
          set({ loading: true });
          try {
            await apiClient.post('/auth/drivers-resend-code', { email });
            set({ loading: false });
            return { success: true };
          } catch (err) {
            set({ loading: false });
            return { success: false, error: err.response?.data?.message || 'Resend failed' };
          }
        },

        logout: () => {
          set({ user: null, token: null, error: null, loading: false });
          sessionStorage.clear();
        },

        updateUser: (updatedUser) => {
          set((state) => ({ user: { ...state.user, ...updatedUser } }));
        },

        setSession: (user, token) => {
          set({ user, token, error: null, loading: false });
        },

        updateCoins: (coins) => {
          set((state) => ({ user: { ...state.user, taxi_coins: coins } }));
        },

        fetchGamificationStats: async (coords = null) => {
          try {
            let params = {};
            if (coords) {
                params = { lat: coords.latitude, lng: coords.longitude };
            }
            const { data } = await apiClient.get('/gamification/stats', { params });
            if (data?.data) {
              set((state) => ({
                user: {
                  ...state.user,
                  taxi_coins: data.data.taxi_coins,
                  completed_trips: data.data.completed_trips,
                  referred_users_count: data.data.referred_users_count,
                  referred_drivers_count: data.data.referred_drivers_count,
                  use_coins_augmentation: data.data.use_coins_augmentation,
                  use_coins_for_commissions: data.data.use_coins_for_commissions,
                  local_wallet: data.data.local_wallet // Added for multi-currency
                }
              }));
              return data.data;
            }
          } catch (e) {
            console.error("Failed to fetch driver gamification stats", e);
          }
        },

        fetchUser: async () => {
          const { user } = get();
          const id = user?.id || user?._id;
          if (!id) return;
          set({ loading: true });
          try {
            const { data } = await apiClient.get(`/drivers-profile/update/${id}`);
            set({ user: data.data, loading: false });
          } catch (err) {
            set({ loading: false });
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'queens-driver-auth',
        // Only persist essential fields — not loading/error states
        partialize: (state) => ({ user: state.user, token: state.token }),
      },
    ),
    { name: 'DriverAuthStore' },
  ),
);
