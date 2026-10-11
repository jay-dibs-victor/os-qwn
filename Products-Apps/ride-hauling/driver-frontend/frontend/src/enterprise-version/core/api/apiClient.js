/**
 * Centralized Axios instance for queens-driverapp.
 * Reads auth token from Zustand persisted store in localStorage.
 * Handles 401 by clearing auth and redirecting to login.
 */
import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
  if (typeof window !== 'undefined' && envUrl.includes('localhost')) {
    return envUrl.replace('localhost', window.location.hostname);
  }
  return envUrl;
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Request interceptor: attach Bearer token ──────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('queens-driver-auth') || localStorage.getItem('queens-driver') || null;
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.token || parsed?.token || null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          const simpleToken = localStorage.getItem('queens-token') || localStorage.getItem('queens-driver-token');
          if (simpleToken) config.headers.Authorization = `Bearer ${simpleToken}`;
        }
      } else {
        const simpleToken = localStorage.getItem('queens-token') || localStorage.getItem('queens-driver-token');
        if (simpleToken) config.headers.Authorization = `Bearer ${simpleToken}`;
      }
    } catch {
      // silently skip if storage is unavailable
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 / 403 ────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('queens-driver-auth');
      sessionStorage.clear();
      window.location.replace('/');
    }
    return Promise.reject(error);
  },
);

export default apiClient;
