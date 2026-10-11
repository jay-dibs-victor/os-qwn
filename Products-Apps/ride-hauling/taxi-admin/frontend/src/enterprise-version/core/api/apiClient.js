import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('goomtaxi-admin-auth') || localStorage.getItem('goomtaxi-admin') || null;
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.token || parsed?.token || null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          const simpleToken = localStorage.getItem('goomtaxi-admin-token');
          if (simpleToken) config.headers.Authorization = `Bearer ${simpleToken}`;
        }
      } else {
        const simpleToken = localStorage.getItem('goomtaxi-admin-token');
        if (simpleToken) config.headers.Authorization = `Bearer ${simpleToken}`;
      }
    } catch {
      // silently skip
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('goomtaxi-admin-auth');
      sessionStorage.clear();
      window.location.replace('/login');
    }
    return Promise.reject(error);
  },
);

export default apiClient;
