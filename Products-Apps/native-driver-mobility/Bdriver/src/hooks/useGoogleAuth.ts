import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { getApiErrorMessage } from '../utils/errors';

// Required for web OAuth redirect to complete properly.
WebBrowser.maybeCompleteAuthSession();

// Per-platform Google OAuth client IDs. Override via app config (extra) or
// process.env in a development build.
const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? GOOGLE_WEB_CLIENT_ID;

const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: 'Bdriver',
  path: 'oauth-callback',
});

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
} as const;

export function useGoogleAuth() {
  const googleAuth = useAuthStore(s => s.googleAuth);
  const [request, setRequest] = useState<AuthSession.AuthRequest | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const authRequest = new AuthSession.AuthRequest({
        clientId: GOOGLE_WEB_CLIENT_ID,
        androidClientId: GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: GOOGLE_IOS_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        redirectUrl: REDIRECT_URI,
        usePKCE: true,
        responseType: AuthSession.ResponseType.Code,
        prompt: AuthSession.Prompt.Login,
      } as unknown as AuthSession.AuthRequestConfig);
      setRequest(authRequest);
    } catch {
      setRequest(null);
    }
  }, []);

  const promptAsync = async (): Promise<{ type: 'success' | 'error' | 'dismiss' }> => {
    if (!request) return { type: 'error' };
    setLoading(true);
    try {
      const result = await request.promptAsync(GOOGLE_DISCOVERY);
      if (result.type === 'success') {
        const code = (result.params as { code?: string } | undefined)?.code;
        if (!code) {
          setLoading(false);
          return { type: 'error' };
        }
        const outcome = await googleAuth({ code, redirectUri: REDIRECT_URI });
        setLoading(false);
        return outcome.success ? { type: 'success' } : { type: 'error' };
      }
      setLoading(false);
      return { type: 'dismiss' };
    } catch (err) {
      setLoading(false);
      // eslint-disable-next-line no-console
      console.warn('[OAuth] prompt failed', getApiErrorMessage(err, 'Unknown error'));
      return { type: 'error' };
    }
  };

  return { request, promptAsync, loading };
}

/** Re-export for screens that only need the server-side helper. */
export { authAPI };
