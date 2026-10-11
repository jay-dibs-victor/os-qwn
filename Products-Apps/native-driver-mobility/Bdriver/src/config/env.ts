import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getApiBaseUrl(): string {
  const DEFAULT_DEVICE_API_URL = 'http://10.112.148.175:12000/api/v1';

  const parseHost = (url: string): string | null => {
    try {
      return new URL(url).hostname;
    } catch {
      const cleaned = url.replace(/^https?:\/\//, '');
      const hostPort = cleaned.split('/')[0];
      if (!hostPort) return null;
      return hostPort.startsWith('[') ? hostPort.slice(1).split(']')[0] : hostPort.split(':')[0];
    }
  };

  const isBadDeviceHost = (host: string | null) => {
    if (!host) return true;
    return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '10.0.2.2';
  };

  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    if (Constants.isDevice) {
      const host = parseHost(envUrl);
      if (!isBadDeviceHost(host)) {
        console.log('[API Config] Using EXPO_PUBLIC_API_URL:', envUrl);
        return envUrl;
      }
      console.log('[API Config] Ignoring EXPO_PUBLIC_API_URL for device:', envUrl);
    } else {
      console.log('[API Config] Using EXPO_PUBLIC_API_URL:', envUrl);
      return envUrl;
    }
  }

  const isPrivateHost = (host: string) => {
    if (!host) return false;
    if (host === 'localhost') return true;
    if (host.startsWith('10.')) return true;
    if (host.startsWith('192.168.')) return true;
    if (host.startsWith('172.')) {
      const second = Number(host.split('.')[1]);
      if (Number.isFinite(second) && second >= 16 && second <= 31) return true;
    }
    return false;
  };

  const getDevHostIp = (): string | null => {
    const candidates = [
      (Constants.expoConfig as any)?.hostUri,
      (Constants as any).expoGoConfig?.debuggerHost,
      (Constants as any).manifest?.debuggerHost,
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost,
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
      const withoutProtocol = candidate.replace(/^https?:\/\//, '');
      const hostPort = withoutProtocol.split('/')[0];
      const host = hostPort.startsWith('[') ? hostPort.slice(1).split(']')[0] : hostPort.split(':')[0];
      if (host && isPrivateHost(host)) return host;
    }

    return null;
  };

  // Development environment - use platform-specific defaults
  if (__DEV__) {
    if (Constants.isDevice) {
      const hostIp = getDevHostIp();
      if (hostIp) {
        const apiUrl = `http://${hostIp}:12000/api/v1`;
        console.log('[API Config] Physical device detected, using:', apiUrl);
        return apiUrl;
      }

      const apiUrl = DEFAULT_DEVICE_API_URL;
      console.log('[API Config] Physical device detected but could not infer dev host IP.');
      console.log('[API Config] Set EXPO_PUBLIC_API_URL (e.g. http://192.168.1.10:12000/api/v1).');
      console.log('[API Config] Falling back to:', apiUrl);
      return apiUrl;
    }

    if (Platform.OS === 'android') {
      const apiUrl = 'http://10.0.2.2:12000/api/v1';
      console.log('[API Config] Android emulator detected, using:', apiUrl);
      return apiUrl;
    }

    const apiUrl = 'http://localhost:12000/api/v1';
    console.log('[API Config] iOS simulator detected, using:', apiUrl);
    return apiUrl;
  }

// Production environment — fail-fast: refuse to boot with a placeholder URL.
const productionUrl = process.env.EXPO_PUBLIC_API_URL;
if (!productionUrl) {
  throw new Error(
    '[API Config] EXPO_PUBLIC_API_URL is required in production builds. Refusing to start with a placeholder URL.',
  );
}
console.log('[API Config] Production environment, using:', productionUrl);
return productionUrl;
}

/**
 * Resolve the WebSocket gateway URL.
 * Honours EXPO_PUBLIC_WS_URL when set; otherwise derives from the API base
 * by swapping http→ws (https→wss) and rewriting the path to /ws.
 */
export function getWsUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_WS_URL;
  if (explicit) {
    return explicit;
  }
  const apiBase = getApiBaseUrl();
  let parsed: URL;
  try {
    parsed = new URL(apiBase);
  } catch {
    throw new Error(`[WS Config] Cannot derive WS URL from invalid API base: ${apiBase}`);
  }
  const wsScheme = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsScheme}//${parsed.host}/ws`;
}

/**
 * Whether the app should run against mocked auth + driver data.
 * Opt-out: the env var must be explicitly set to "false" / "0" to disable.
 * Defaults to true so the app boots in its current mocked state without
 * any environment configuration.
 */
export function isMockMode(): boolean {
  const raw = process.env.EXPO_PUBLIC_USE_MOCK_AUTH;
  if (raw === undefined || raw === '') return true;
  const normalised = raw.trim().toLowerCase();
  return !(normalised === 'false' || normalised === '0' || normalised === 'no');
}

/** Typed alias for consumers that prefer the explicit name. */
export function getUseMockAuth(): boolean {
  return isMockMode();
}

/**
 * Toggle for OS-level background location updates (significant-change / region /
 * continuous). Defaults to `true` so the background task is installed and
 * ready; on web and simulators the call degrades to a no-op. Set
 * `EXPO_PUBLIC_BACKGROUND_LOCATION=false` to opt out (e.g. CI builds that
 * don't need the iOS UIBackgroundModes capability or Android
 * ACCESS_BACKGROUND_LOCATION permission).
 */
export function getUseBackgroundLocation(): boolean {
  const raw = process.env.EXPO_PUBLIC_BACKGROUND_LOCATION;
  if (raw === undefined || raw === '') return true;
  const normalised = raw.trim().toLowerCase();
  return !(normalised === 'false' || normalised === '0' || normalised === 'no');
}
