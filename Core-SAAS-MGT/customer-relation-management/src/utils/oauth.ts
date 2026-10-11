/**
 * OAuth 2.0 PKCE (Proof Key for Code Exchange) utilities
 * Implements RFC 7636 for secure OAuth flows in public clients
 */

/**
 * Generate a cryptographically random code verifier
 * @returns Base64URL encoded random string (43-128 characters)
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generate code challenge from code verifier using SHA-256
 * @param verifier - The code verifier
 * @returns Base64URL encoded SHA-256 hash of the verifier
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

/**
 * Base64URL encode (without padding)
 * @param buffer - Uint8Array to encode
 * @returns Base64URL encoded string
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate a random state parameter for CSRF protection
 * @returns Random state string
 */
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Store OAuth state in sessionStorage
 * @param state - State parameter
 * @param codeVerifier - PKCE code verifier
 */
export function storeOAuthState(state: string, codeVerifier: string): void {
  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('oauth_code_verifier', codeVerifier);
}

/**
 * Retrieve and validate OAuth state from sessionStorage
 * @param receivedState - State parameter from OAuth callback
 * @returns Code verifier if state is valid, null otherwise
 */
export function validateOAuthState(receivedState: string): string | null {
  const storedState = sessionStorage.getItem('oauth_state');
  const codeVerifier = sessionStorage.getItem('oauth_code_verifier');

  // Clear stored values
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_code_verifier');

  if (!storedState || !codeVerifier || storedState !== receivedState) {
    return null;
  }

  return codeVerifier;
}

/**
 * Build OAuth authorization URL
 * @param config - OAuth configuration
 * @returns Authorization URL
 */
export function buildAuthorizationUrl(config: {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  codeChallenge: string;
}): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    state: config.state,
    code_challenge: config.codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${config.authorizationEndpoint}?${params.toString()}`;
}
