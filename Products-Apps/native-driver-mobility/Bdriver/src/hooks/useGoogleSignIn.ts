import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import { getApiErrorMessage } from '../utils/errors';

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? GOOGLE_WEB_CLIENT_ID;

interface GoogleSigninModule {
  GoogleSignin: {
    configure: (cfg: Record<string, unknown>) => void;
    hasPlayServices: () => Promise<void>;
    signIn: () => Promise<{ idToken: string | null; user: { email: string } }>;
    signOut: () => Promise<void>;
  };
  statusCodes: {
    SIGN_IN_CANCELLED?: string;
    IN_PROGRESS?: string;
    PLAY_SERVICES_NOT_AVAILABLE?: string;
  } | null;
}

let nativeModule: GoogleSigninModule | null = null;
let nativeAvailable = false;
try {
  const mod: GoogleSigninModule | null = require('@react-native-google-signin/google-signin');
  if (mod && mod.GoogleSignin) {
    nativeModule = mod;
    nativeAvailable = true;
  }
} catch {
  nativeAvailable = false;
}

export function useGoogleSignIn() {
  const googleAuth = useAuthStore(s => s.googleAuth);
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(nativeAvailable);

  useEffect(() => {
    if (!nativeAvailable || !nativeModule) {
      setIsAvailable(false);
      return;
    }
    try {
      nativeModule.GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        androidClientId: GOOGLE_ANDROID_CLIENT_ID,
        iosClientId: GOOGLE_IOS_CLIENT_ID,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
      setIsAvailable(true);
    } catch {
      setIsAvailable(false);
    }
  }, []);

  const signIn = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isAvailable || !nativeModule) {
      const message = 'Google Sign-In requires a development build. Please run: npx expo run:android or npx expo run:ios';
      useAuthStore.setState({ error: message });
      return { success: false, error: message };
    }
    setLoading(true);
    try {
      await nativeModule.GoogleSignin.hasPlayServices();
      const userInfo = await nativeModule.GoogleSignin.signIn();
      if (!userInfo.idToken) {
        setLoading(false);
        return { success: false, error: 'No ID token returned by Google' };
      }
      const outcome = await googleAuth({ idToken: userInfo.idToken });
      setLoading(false);
      return outcome;
    } catch (error: unknown) {
      setLoading(false);
      const code = (error as { code?: string }).code;
      if (code && nativeModule?.statusCodes) {
        if (code === nativeModule.statusCodes.SIGN_IN_CANCELLED) {
          return { success: false, error: 'Sign-in cancelled' };
        }
        if (code === nativeModule.statusCodes.IN_PROGRESS) {
          return { success: false, error: 'Sign-in already in progress' };
        }
        if (code === nativeModule.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          return { success: false, error: 'Google Play Services not available' };
        }
      }
      const message = getApiErrorMessage(error, 'Google sign-in failed');
      useAuthStore.setState({ error: message });
      return { success: false, error: message };
    }
  };

  const signOut = async (): Promise<void> => {
    if (nativeAvailable && nativeModule) {
      try {
        await nativeModule.GoogleSignin.signOut();
      } catch {
        // Non-fatal: we still clear local state below.
      }
    }
    await useAuthStore.getState().logout();
  };

  return { signIn, signOut, loading, isAvailable };
}
