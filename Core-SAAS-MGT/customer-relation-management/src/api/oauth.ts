import { apiClient } from './client';

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  tenant_id: string;
}

/**
 * Exchange authorization code for access token
 * Note: This is a public endpoint, no authentication required
 */
export async function exchangeAuthorizationCode(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  clientId: string;
}): Promise<OAuthTokenResponse> {
  const response = await apiClient.post<OAuthTokenResponse>(
    '/auth/oauth/token',
    {
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier,
      client_id: params.clientId,
    },
    false // auth = false, don't send X-Tenant-ID header
  );

  return response;
}

/**
 * Refresh OAuth access token
 * Note: This is a public endpoint, no authentication required
 */
export async function refreshOAuthToken(params: {
  refreshToken: string;
  clientId: string;
}): Promise<OAuthTokenResponse> {
  const response = await apiClient.post<OAuthTokenResponse>(
    '/auth/oauth/token',
    {
      grant_type: 'refresh_token',
      refresh_token: params.refreshToken,
      client_id: params.clientId,
    },
    false // auth = false, don't send X-Tenant-ID header
  );

  return response;
}
