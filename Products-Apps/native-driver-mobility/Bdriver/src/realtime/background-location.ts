/**
 * Background location task for Queens OS Driver.
 *
 * The task is registered once at module load. When a driver goes online we
 * start `Location.startLocationUpdatesAsync(BG_LOCATION_TASK, ...)`; the task
 * then updates the driver store on every GPS fix so dispatch has a fresh
 * position even when the app is suspended or terminated by the OS.
 *
 * On web the task is a no-op (browsers don't have a background runtime).
 *
 * The task must be defined in the global scope of the entry file (`app/_layout.tsx`)
 * — we re-export the body so the import side-effect registers it.
 */

import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { getUseBackgroundLocation } from '../config/env';
import { useDriverStore } from '../store/driver';

export const BG_LOCATION_TASK = 'bdriver.background-location';

type BgTaskData = { locations: Location.LocationObject[] };

/**
 * The task body must be a top-level function so expo-task-manager can
 * serialise it. It runs in a headless JS context.
 */
TaskManager.defineTask<BgTaskData>(BG_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    // Swallow — the foreground `setLocationError` surface is for the UI.
    return;
  }
  const locs = data?.locations;
  if (!Array.isArray(locs) || locs.length === 0) return;
  const last = locs[locs.length - 1];
  if (!last) return;
  const { latitude, longitude, accuracy, heading, speed } = last.coords;
  const store = useDriverStore.getState();
  store.setCurrentLocation({
    latitude,
    longitude,
    accuracy: accuracy ?? undefined,
    heading: heading ?? null,
    speed: speed ?? null,
    timestamp: Date.now(),
  });
  // The store handles throttling/de-dup; the foreground emitter is also
  // wired so the dispatch socket gets the same position immediately.
  store.emitLocation({
    latitude,
    longitude,
    accuracy: accuracy ?? undefined,
    heading: heading ?? null,
    speed: speed ?? null,
    timestamp: Date.now(),
  });
});

let started = false;

/**
 * Idempotent. Safe to call on every goOnline transition; will be a no-op
 * when background updates are not permitted or the platform doesn't support
 * them.
 */
export async function startBackgroundLocation(): Promise<boolean> {
  if (!getUseBackgroundLocation()) return false;
  if (Platform.OS === 'web') return false;
  if (started) return true;

  try {
    const { status: fg } = await Location.getForegroundPermissionsAsync();
    if (fg !== 'granted') return false;
    const { status: bg } = await Location.getBackgroundPermissionsAsync();
    if (bg !== 'granted') {
      // iOS surfaces this on the device — Android auto-grants with foreground.
      const req = await Location.requestBackgroundPermissionsAsync();
      if (req.status !== 'granted') return false;
    }
    await Location.startLocationUpdatesAsync(BG_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5_000,
      distanceInterval: 15,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Bdriver is active',
        notificationBody: 'Sharing your location while you are online.',
        notificationColor: '#FFB800',
      },
      pausesUpdatesAutomatically: false,
    });
    started = true;
    return true;
  } catch {
    return false;
  }
}

/** Idempotent. Safe to call on every goOffline transition. */
export async function stopBackgroundLocation(): Promise<boolean> {
  if (!started) return true;
  try {
    await Location.stopLocationUpdatesAsync(BG_LOCATION_TASK);
    started = false;
    return true;
  } catch {
    return false;
  }
}

export function isBackgroundLocationStarted(): boolean {
  return started;
}
