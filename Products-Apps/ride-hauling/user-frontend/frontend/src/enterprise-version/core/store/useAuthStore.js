/**
 * useAuthStore — taxibooking-userapp
 * Replaces: useAuthCollection.js (empty useReducer) + sessionStorage scattered across components
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiClient from '../api/apiClient';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────
      user: null,
      token: null,
      loading: false,
      error: null,

      // ── Computed ───────────────────────────────────────────
      isAuthenticated: () => !!get().token,
      isUser: () => get().user?.role === 'user' || get().user?.role === 'Individual User',

      // ── Actions ────────────────────────────────────────────
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const { data } = await apiClient.post('/auth/login', credentials);
          console.log('Login Response received:', data);

          // Support both formats: { data: [{token, user}] } or { data: {token, user} }
          let authData = null;
          if (Array.isArray(data.data)) {
            authData = data.data[0];
          } else if (data.data) {
            authData = data.data;
          } else {
            // Fallback for flat structure
            authData = data;
          }

          console.log('Processed AuthData:', authData);

          if (authData && authData.token) {
            const { user, token } = authData;

            // 1. Update memory state
            set({ user, token, loading: false, error: null });

            // 2. Explicitly write to localStorage to ensure immediate availability for interceptors
            localStorage.setItem('queens-user-auth', JSON.stringify({
              state: { user, token },
              version: 0
            }));

            // Also write simpler keys for quick checks and robustness
            try {
              localStorage.setItem('queens-user', JSON.stringify(user));
              localStorage.setItem('queens-token', token);
              sessionStorage.setItem('queens-user', JSON.stringify(user));
              sessionStorage.setItem('queens-token', token);
               // 2. Explicitly write to localStorage to ensure immediate availability for interceptors
            localStorage.setItem('queens-user-auth', JSON.stringify({
              state: { user, token },
              version: 0
            }));
             // 2. Explicitly write to localStorage to ensure immediate availability for interceptors
            localStorage.setItem('queens-user-auth', JSON.stringify({
              state: { user, token },
              version: 0
            }));
            
            } catch (e) {
              console.warn('Failed to write fallback auth keys to storage', e);
            }

            console.log('Auth persisted: user id=', user && (user._id || user.id), 'tokenPresent=', !!token);

            // 3. Explicitly set axios header as a fallback/immediate sync
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Re-write the composite persisted key shortly after login to avoid races
            try {
              const payload = JSON.stringify({ state: { user, token }, version: 0 });
              setTimeout(() => {
                try { localStorage.setItem('queens-user-auth', payload); } catch (e) { console.warn('Failed delayed write of queens-user-auth', e); }
              }, 100);
            } catch (e) {
              console.warn('Failed preparing delayed persisted payload', e);
            }

            return { success: true };
          }
          throw new Error('Invalid authentication response structure');
        } catch (err) {
          const message = err.response?.data?.message || err.response?.data?.error || 'Login failed';
          set({ loading: false, error: message, user: null, token: null });
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await apiClient.post('/auth/signup', userData);
          console.log('Registration Response:', data);

          // Support both formats
          let authData = null;
          if (Array.isArray(data.data)) {
            authData = data.data[0];
          } else if (data.data) {
            authData = data.data;
          } else {
            authData = data;
          }

          if (authData && authData.token) {
            const { user, token } = authData;
            
            // If verification is needed, we don't log them in fully yet
            if (authData.requiresVerification) {
               return { success: true, requiresVerification: true, email: user.email };
            }

            set({ user, token, loading: false, error: null });
            
            // Explicitly write to localStorage
            localStorage.setItem('queens-user-auth', JSON.stringify({
              state: { user, token },
              version: 0
            }));

            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return { success: true };
          }
          return { success: true, requiresVerification: data.requiresVerification || false };
        } catch (err) {
          const message = err.response?.data?.message || err.response?.data?.error || 'Registration failed';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      verifyEmail: async (email, code) => {
        set({ loading: true, error: null });
        try {
          await apiClient.post('/auth/verify-code', { email, code });
          set({ loading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || err.response?.data?.error || 'Verification failed';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      resendVerification: async (email) => {
        set({ loading: true, error: null });
        try {
          await apiClient.post('/auth/resend-code', { email });
          set({ loading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || err.response?.data?.error || 'Resend failed';
          set({ loading: false, error: message });
          return { success: false, error: message };
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null, loading: false });
        localStorage.removeItem('queens-user-auth');
        sessionStorage.clear();
      },

      updateUser: (updatedUser) => {
        set((state) => ({ user: { ...state.user, ...updatedUser } }));
      },

      updateCoins: (coins) => {
        set((state) => ({ user: { ...state.user, taxi_coins: coins } }));
      },

      fetchGamificationStats: async (coords = null) => {
         try {
            let params = {};
            if (coords) {
                params = { lat: coords.latitude, lng: coords.longitude };
            } else if ("geolocation" in navigator) {
                // Background attempt to get location for future updates
                navigator.geolocation.getCurrentPosition((pos) => {
                    // This is async and won't block current call, but good for next one
                }, () => {});
            }

            const { data } = await apiClient.get('/gamification/stats', { params });
            if (data?.data) {
                set((state) => ({ 
                  user: { 
                    ...state.user, 
                    taxi_coins: data.data.taxi_coins, 
                    streak_count: data.data.streak_count,
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
         } catch(e) {
            console.error("Failed to fetch gamification stats", e);
         }
      },

      fetchUser: async () => {
        const state = get();
        const token = state.token;
        const user = state.user;
        const id = user?.id || user?._id;

        if (!token || !id) return;

        set({ loading: true });
        try {
          const { data } = await apiClient.get(`/profile/update/${id}`);
          // The API returns { status: 200, data: { ...user } }
          set({ user: data.data, loading: false });
        } catch (err) {
          console.error('Fetch user failed:', err);
          set({ loading: false });
          // Don't clear token here to avoid aggressive logouts on network blip
        }
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'queens-user-auth',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return (rehydratedState, error) => {
          if (error) {
            console.warn('onRehydrateStorage failed', error);
            return;
          }
          try {
            // If persisted composite key is missing, try to restore from simple keys
            if (!rehydratedState || Object.keys(rehydratedState).length === 0) {
              const userRaw = localStorage.getItem('queens-user');
              const token = localStorage.getItem('queens-token');
              if (userRaw && token) {
                const user = JSON.parse(userRaw);
                const payload = { state: { user, token }, version: 0 };
                try {
                  localStorage.setItem('queens-user-auth', JSON.stringify(payload));
                } catch (e) {
                  console.warn('Failed to write restored queens-user-auth', e);
                }
                // Update the state in-memory safely
                setTimeout(() => {
                  try {
                    useAuthStore.setState({ user, token });
                    console.log('Restored auth state from backup keys');
                  } catch (e) {
                    console.warn('Deferred auth restoration failed', e);
                  }
                }, 0);
              }
            }
          } catch (e) {
            console.warn('onRehydrateStorage restore failed', e);
          }
        };
      },
    },
  ),
);

// Safety net: if module loaded and composite key missing but simple keys exist, restore immediately
try {
  const existing = localStorage.getItem('queens-user-auth');
  if (!existing) {
    const userRaw = localStorage.getItem('queens-user');
    const token = localStorage.getItem('queens-token');
    if (userRaw && token) {
      try {
        localStorage.setItem('queens-user-auth', JSON.stringify({ state: { user: JSON.parse(userRaw), token }, version: 0 }));
      } catch (e) {
        console.warn('Failed to write initial queens-user-auth from simple keys', e);
      }
    }
  }
} catch (e) {
  // ignore if storage unavailable
}
