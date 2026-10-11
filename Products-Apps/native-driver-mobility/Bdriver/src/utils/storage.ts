/**
 * Typed wrappers around `expo-secure-store`.
 * Keys are namespaced under `bdriver:*` to avoid collisions on shared devices.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const NAMESPACE = 'bdriver';

const KEY_AUTH_TOKEN = `${NAMESPACE}_auth_token`;
const KEY_AUTH_USER = `${NAMESPACE}_auth_user`;
const KEY_DRIVER_PROFILE = `${NAMESPACE}_driver_profile`;
const KEY_WALLET = `${NAMESPACE}_wallet`;

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const secureStorage = {
  setAuthToken(token: string): Promise<void> {
    return setItem(KEY_AUTH_TOKEN, token);
  },
  getAuthToken(): Promise<string | null> {
    return getItem(KEY_AUTH_TOKEN);
  },
  clearAuthToken(): Promise<void> {
    return deleteItem(KEY_AUTH_TOKEN);
  },

  setAuthUser<T>(user: T): Promise<void> {
    return setItem(KEY_AUTH_USER, JSON.stringify(user));
  },
  getAuthUser<T>(): Promise<T | null> {
    return getItem(KEY_AUTH_USER).then(raw => {
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    });
  },
  clearAuthUser(): Promise<void> {
    return deleteItem(KEY_AUTH_USER);
  },

  setDriverProfile<T>(profile: T): Promise<void> {
    return setItem(KEY_DRIVER_PROFILE, JSON.stringify(profile));
  },
  getDriverProfile<T>(): Promise<T | null> {
    return getItem(KEY_DRIVER_PROFILE).then(raw => {
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    });
  },
  clearDriverProfile(): Promise<void> {
    return deleteItem(KEY_DRIVER_PROFILE);
  },

  setWallet<T>(wallet: T): Promise<void> {
    return setItem(KEY_WALLET, JSON.stringify(wallet));
  },
  getWallet<T>(): Promise<T | null> {
    return getItem(KEY_WALLET).then(raw => {
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    });
  },
  clearWallet(): Promise<void> {
    return deleteItem(KEY_WALLET);
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      deleteItem(KEY_AUTH_TOKEN),
      deleteItem(KEY_AUTH_USER),
      deleteItem(KEY_DRIVER_PROFILE),
      deleteItem(KEY_WALLET),
    ]);
  },
};
