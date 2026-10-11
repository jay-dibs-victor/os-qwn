import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { useDriverStore, type CurrentLocation } from '../store/driver';
import { startBackgroundLocation, stopBackgroundLocation } from '../realtime/background-location';

const FALLBACK_LOCATION: CurrentLocation = {
  latitude: 51.5178,
  longitude: -0.0985,
  accuracy: 25,
  heading: null,
  speed: null,
  timestamp: Date.now(),
};

function buildLocation(
  coords: { latitude: number; longitude: number; accuracy?: number | null; heading?: number | null; speed?: number | null },
): CurrentLocation {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? undefined,
    heading: coords.heading ?? null,
    speed: coords.speed ?? null,
    timestamp: Date.now(),
  };
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const setCurrentLocation = useDriverStore(s => s.setCurrentLocation);
  const setLocationPermission = useDriverStore(s => s.setLocationPermission);
  const setLocationError = useDriverStore(s => s.setLocationError);
  const markLocationRequested = useDriverStore(s => s.markLocationRequested);
  const watchSub = useRef<Location.LocationSubscription | null>(null);
  const webWatchId = useRef<number | null>(null);
  // Subscribe to online state and start/stop the OS background task.
  // We subscribe in a separate effect so the foreground watcher can stay
  // mounted independently.
  useDriverStoreEffect();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      markLocationRequested();
      setLocationPermission('requesting');

      if (Platform.OS === 'web') {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          setLocationPermission('unavailable');
          setLocationError('Geolocation is not supported in this browser.');
          setCurrentLocation(FALLBACK_LOCATION);
          return;
        }
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 5000,
            });
          });
          if (cancelled) return;
          setCurrentLocation(buildLocation(pos.coords));
          setLocationPermission('granted');
          setLocationError(null);
          if (typeof navigator !== 'undefined' && navigator.geolocation) {
            webWatchId.current = navigator.geolocation.watchPosition(
              next => {
                if (cancelled) return;
                setCurrentLocation(buildLocation(next.coords));
              },
              () => {
                /* silent */
              },
              { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
            );
          }
        } catch (e) {
          if (cancelled) return;
          setLocationPermission('denied');
          setLocationError(e instanceof Error ? e.message : 'Location permission denied.');
          setCurrentLocation(FALLBACK_LOCATION);
        }
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== 'granted') {
          setLocationPermission('denied');
          setLocationError('Location permission was not granted.');
          setCurrentLocation(FALLBACK_LOCATION);
          return;
        }
        setLocationPermission('granted');
        setLocationError(null);
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (cancelled) return;
        setCurrentLocation(buildLocation(pos.coords));
        watchSub.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 25 },
          next => {
            if (cancelled) return;
            setCurrentLocation(buildLocation(next.coords));
          },
        );
      } catch (e) {
        if (cancelled) return;
        setLocationPermission('unavailable');
        setLocationError(e instanceof Error ? e.message : 'Unable to start location services.');
        setCurrentLocation(FALLBACK_LOCATION);
      }
    })();

    return () => {
      cancelled = true;
      try {
        watchSub.current?.remove();
      } catch {
        /* ignore */
      }
      watchSub.current = null;
      if (webWatchId.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(webWatchId.current);
        webWatchId.current = null;
      }
    };
  }, [setCurrentLocation, setLocationPermission, setLocationError, markLocationRequested]);

  return <>{children}</>;
}

/** Background task lifecycle bound to driver online state. */
function useDriverStoreEffect(): void {
  useEffect(() => {
    const startOrStop = (isOnline: boolean) => {
      if (isOnline) void startBackgroundLocation();
      else void stopBackgroundLocation();
    };
    startOrStop(useDriverStore.getState().isOnline);
    // Zustand v5 only exposes the full-state listener signature. We diff
    // `isOnline` manually to avoid bringing in `useStore.subscribeWithSelector`.
    let prev = useDriverStore.getState().isOnline;
    const unsub = useDriverStore.subscribe(state => {
      if (state.isOnline === prev) return;
      prev = state.isOnline;
      startOrStop(state.isOnline);
    });
    return () => {
      unsub();
      void stopBackgroundLocation();
    };
  }, []);
}
