import axios from 'axios';

const SAAS_AUTH_URL = process.env.SAAS_AUTH_URL || 'http://localhost:3000/auth';
const SAAS_CLIENT_ID = process.env.SAAS_CLIENT_ID || 'taxi-server';
const SAAS_CLIENT_SECRET = process.env.SAAS_CLIENT_SECRET || '';
const SAAS_SCOPES = process.env.SAAS_SCOPES || 'wallet:read earnings:read trips:read';

// In-memory token cache keyed by user UUID
const tokenCache = new Map<string, { accessToken: string; expiresAt: number }>();

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function getCacheKey(userToken: string): string {
  const payload = decodeJwtPayload(userToken);
  return payload?.id || payload?.sub || payload?.email || userToken;
}

/**
 * Exchange a taxi-server user JWT for a SaaS access token.
 * Uses the RFC 8693 token-exchange grant type.
 * Results are cached until the SaaS token expires.
 */
export async function exchangeToken(userToken: string): Promise<string> {
  const cacheKey = getCacheKey(userToken);
  const cached = tokenCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.accessToken;
  }

  const response = await axios.post(
    `${SAAS_AUTH_URL}/oauth/token`,
    new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      client_id: SAAS_CLIENT_ID,
      client_secret: SAAS_CLIENT_SECRET,
      subject_token: userToken,
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      scope: SAAS_SCOPES,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  const { access_token, expires_in } = response.data;
  const expiresAt = Date.now() + (expires_in || 3600) * 1000;

  tokenCache.set(cacheKey, { accessToken: access_token, expiresAt });

  return access_token;
}

/**
 * Create an axios instance pre-configured with the SaaS base URL and
 * automatic token exchange. Attaches the SaaS Bearer token to every
 * request by exchanging the provided taxi-server user token.
 *
 * @example
 *   const saas = createSaaSClient(userJwt);
 *   const wallet = await saas.get('/wallet/balance');
 */
export function createSaaSClient(userToken: string) {
  const client = axios.create({
    baseURL: SAAS_AUTH_URL.replace('/auth', ''),
    timeout: 15000,
  });

  client.interceptors.request.use(async (config) => {
    const token = await exchangeToken(userToken);
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return client;
}

/**
 * Clear the token cache for a given user (e.g. on logout).
 */
export function clearTokenCache(userToken: string) {
  const cacheKey = getCacheKey(userToken);
  tokenCache.delete(cacheKey);
}

/**
 * Clear all cached tokens.
 */
export function clearAllTokenCaches() {
  tokenCache.clear();
}
