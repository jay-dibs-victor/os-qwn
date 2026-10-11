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

apiClient.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('queens-user-auth') || localStorage.getItem('queens-user') || null;
      if (stored) {
        const parsed = JSON.parse(stored);
        // Support multiple persisted shapes:
        // 1) { state: { user, token }, version }
        // 2) { user: {...}, token: '...' }
        // 3) raw token string saved under queens-token (handled below)
        const token = parsed?.state?.token || parsed?.token || null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          // fallback to explicit token key
          const simpleToken = localStorage.getItem('queens-token');
          if (simpleToken) config.headers.Authorization = `Bearer ${simpleToken}`;
        }
      } else {
        const simpleToken = localStorage.getItem('queens-token');
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
      localStorage.removeItem('queens-user-auth');
      sessionStorage.clear();
      window.location.replace('/');
    }
    return Promise.reject(error);
  },
);

export default apiClient;
