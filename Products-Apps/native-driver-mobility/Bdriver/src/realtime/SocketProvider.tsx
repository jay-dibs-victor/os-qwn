import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { getWsUrl, isMockMode } from '../config/env';
import { useAuthStore } from '../store/auth';
import { setDriverSocketEmitter, useDriverStore } from '../store/driver';
import {
  ClientEvents,
  ServerEvents,
  isRideOfferPayload,
  isRideCancelledPayload,
  isTripStartedPayload,
  isTripCompletedPayload,
  isPaymentReceivedPayload,
  isRiderMessagePayload,
  isLocationPayload,
} from './events';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  /** Convenience emitter that no-ops when disconnected. */
  emit: (event: keyof typeof ClientEvents, payload: unknown) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    return { socket: null, connected: false, emit: () => undefined };
  }
  return ctx;
}

const RECONNECT_DELAY_MAX = 5_000;
const RECONNECT_DELAY_MIN = 500;

export function SocketProvider({ children }: PropsWithChildren) {
  const token = useAuthStore(s => s.token);
  const hasHydrated = useAuthStore(s => s.hasHydrated);
  const setWsConnected = useDriverStore(s => s.setWsConnected);
  const onRideOffer = useDriverStore(s => s.onRideOffer);
  const onRideCancelled = useDriverStore(s => s.onRideCancelled);
  const onTripStarted = useDriverStore(s => s.onTripStarted);
  const onTripCompleted = useDriverStore(s => s.onTripCompleted);
  const onPaymentReceived = useDriverStore(s => s.onPaymentReceived);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  // Track last published location so we don't re-emit identical coords.
  const lastLocRef = useRef<{ lat: number; lng: number; ts: number } | null>(null);

  // Stable refs so the effect doesn't churn on every store change.
  const handlersRef = useRef({
    onRideOffer,
    onRideCancelled,
    onTripStarted,
    onTripCompleted,
    onPaymentReceived,
  });
  useEffect(() => {
    handlersRef.current = { onRideOffer, onRideCancelled, onTripStarted, onTripCompleted, onPaymentReceived };
  }, [onRideOffer, onRideCancelled, onTripStarted, onTripCompleted, onPaymentReceived]);

  // Main connect / disconnect effect.
  useEffect(() => {
    // Install / remove the store-level emitter so action methods can publish
    // without importing socket.io-client.
    const emitFn = (event: string, payload: unknown) => {
      const s = socketRef.current;
      if (s && s.connected) s.emit(event, payload);
    };
    setDriverSocketEmitter(emitFn);

    if (isMockMode()) {
      setWsConnected(false);
      setConnected(false);
      return () => {
        setDriverSocketEmitter(null);
      };
    }
    if (!hasHydrated) return () => setDriverSocketEmitter(null);
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
        setWsConnected(false);
      }
      return () => {
        setDriverSocketEmitter(null);
      };
    }

    const url = getWsUrl();
    const socket = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: RECONNECT_DELAY_MIN,
      reconnectionDelayMax: RECONNECT_DELAY_MAX,
      randomizationFactor: 0.5,
      timeout: 10_000,
      auth: { token },
      forceNew: true,
    });
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      setWsConnected(true);
      // Replay last known location on (re)connect so the gateway has fresh coords.
      const last = lastLocRef.current;
      if (last) {
        socket.emit(ClientEvents.DriverLocation, last);
      }
    };
    const onDisconnect = () => {
      setConnected(false);
      setWsConnected(false);
    };
    const onConnectError = (err: Error) => {
      // Defensive: log only; the socket will retry on its own.
      // eslint-disable-next-line no-console
      console.warn('[ws] connect_error', err.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    socket.on(ServerEvents.RideOffer, (raw: unknown) => {
      if (!isRideOfferPayload(raw)) return;
      handlersRef.current.onRideOffer(raw.ride, raw.expiresInSec);
    });
    socket.on(ServerEvents.RideCancelled, (raw: unknown) => {
      if (!isRideCancelledPayload(raw)) return;
      handlersRef.current.onRideCancelled(raw.rideId, raw.by);
    });
    socket.on(ServerEvents.RideAssigned, (raw: unknown) => {
      if (typeof raw === 'object' && raw !== null && 'ride' in raw) {
        const ride = (raw as { ride?: unknown }).ride;
        if (ride && typeof ride === 'object') {
          // The store action accepts a fully-shaped RideRequestDTO. The server
          // is the source of truth for shape; cast through unknown to keep
          // the provider decoupled from DTO evolution.
          const assign = useDriverStore.getState().onRideAssigned;
          (assign as (r: unknown) => void)(ride);
        }
      }
    });
    socket.on(ServerEvents.TripStarted, (raw: unknown) => {
      if (!isTripStartedPayload(raw)) return;
      handlersRef.current.onTripStarted(raw.rideId);
    });
    socket.on(ServerEvents.TripCompleted, (raw: unknown) => {
      if (!isTripCompletedPayload(raw)) return;
      handlersRef.current.onTripCompleted(raw.rideId);
    });
    socket.on(ServerEvents.PaymentReceived, (raw: unknown) => {
      if (!isPaymentReceivedPayload(raw)) return;
      handlersRef.current.onPaymentReceived(raw.rideId, raw.amount);
    });
    socket.on(ServerEvents.RiderMessage, (raw: unknown) => {
      if (!isRiderMessagePayload(raw)) return;
      // Chat store integration lives in P1; here we only surface a minimal log.
      // eslint-disable-next-line no-console
      console.info('[ws] rider.message', raw.rideId, raw.fromDriver ? '(driver echo)' : '');
    });
    socket.on(ServerEvents.DisconnectWarn, (raw: unknown) => {
      // eslint-disable-next-line no-console
      console.warn('[ws] server disconnect.warn', raw);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setWsConnected(false);
      setDriverSocketEmitter(null);
    };
  }, [hasHydrated, token, setWsConnected]);

  // Forward driver location updates to the socket whenever the store updates.
  useEffect(() => {
    if (!isMockMode()) return;
    return;
  }, []);

  const value = useMemo<SocketContextValue>(() => {
    return {
      socket: socketRef.current,
      connected,
      emit: (event, payload) => {
        const s = socketRef.current;
        if (!s || !s.connected) return;
        s.emit(event, payload);
      },
    };
  }, [connected]);

  // Background location publisher: subscribes to currentLocation and emits
  // `driver.location` when the position changes by more than ~5m.
  useEffect(() => {
    if (isMockMode()) return;
    const unsub = useDriverStore.subscribe(state => {
      const loc = state.currentLocation;
      if (!loc) return;
      const last = lastLocRef.current;
      const movedEnough =
        !last ||
        Math.abs(loc.latitude - last.lat) > 0.00005 ||
        Math.abs(loc.longitude - last.lng) > 0.00005 ||
        Date.now() - last.ts > 5000;
      if (!movedEnough) return;
      const payload = {
        lat: loc.latitude,
        lng: loc.longitude,
        heading: loc.heading ?? null,
        speed: loc.speed ?? null,
        ts: loc.timestamp,
      };
      lastLocRef.current = payload;
      if (isLocationPayload(payload)) {
        const s = socketRef.current;
        if (s && s.connected) s.emit(ClientEvents.DriverLocation, payload);
      }
    });
    return () => unsub();
  }, []);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
