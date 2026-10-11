import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from '../config/env';
import { emitUnauthorized } from './unauthorized';

/**
 * Token resolution: read from the auth store at request time, not module load.
 * This guarantees fresh state across login / logout / refresh.
 */
let tokenProvider: () => string | null = () => null;
let onUnauthorized: () => void = emitUnauthorized;

export function configureApiClient(opts: {
  tokenProvider: () => string | null;
  onUnauthorized?: () => void;
}): void {
  tokenProvider = opts.tokenProvider;
  if (opts.onUnauthorized) onUnauthorized = opts.onUnauthorized;
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30_000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenProvider();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

/**
 * Attempt a single refresh. The actual endpoint may not exist on every backend;
 * if the refresh call fails the user is logged out. Idempotent: concurrent
 * 401s share a single in-flight refresh.
 */
async function attemptRefresh(): Promise<string | null> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await apiClient.post<{ token: string }>('/auth/refresh', {});
        const next = res.data?.token;
        return typeof next === 'string' && next.length > 0 ? next : null;
      } catch {
        return null;
      } finally {
        // Clear after a tick so we don't immediately re-enter for the same call.
        setTimeout(() => {
          refreshing = null;
        }, 0);
      }
    })();
  }
  return refreshing;
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (status === 401 && original && !original._retried) {
      original._retried = true;
      const next = await attemptRefresh();
      if (next) {
        (original.headers as Record<string, string> | undefined) = {
          ...(original.headers as Record<string, string> | undefined),
          Authorization: `Bearer ${next}`,
        };
        return apiClient.request(original);
      }
      onUnauthorized();
      return Promise.reject(error);
    }

    if (status === 401 || status === 403) onUnauthorized();
    return Promise.reject(error);
  },
);

export default apiClient;
