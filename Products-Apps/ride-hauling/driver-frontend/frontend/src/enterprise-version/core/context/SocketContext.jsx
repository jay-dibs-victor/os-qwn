/**
 * SocketContext — queens-driverapp
 * Global WebSocket engine for real-time ride requests, chat, and tracking.
 *
 * KEY BEHAVIOURS:
 *  - Broadcasts driver GPS at 10s idle / 3s during an active ride
 *  - Listens for newRideRequest and rideTaken events globally
 *  - Exposes setTrackingRideId so ActiveTrip.jsx can arm the fast heartbeat
 */
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { playCoinSound } from '../utils/audioUtils';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeRequests, setActiveRequests] = useState([]);
  const [trackingRideId, setTrackingRideId] = useState(null);

  const { user, token } = useAuthStore();
  const { addToast } = useUIStore();

  // Keep a ref so the GPS interval callback always reads the latest rideId
  const trackingRideIdRef = useRef(null);
  const socketRef = useRef(null);
  const locationInterval = useRef(null);

  // Sync ref on every state change
  useEffect(() => {
    trackingRideIdRef.current = trackingRideId;
  }, [trackingRideId]);

  // ── Main socket lifecycle ───────────────────────────────────────
  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000';
    if (typeof window !== 'undefined' && API_URL.includes('localhost')) {
      API_URL = API_URL.replace('localhost', window.location.hostname);
    }
    const socketBase = API_URL.replace('/api/v1', '');

    const s = io(socketBase, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });

    socketRef.current = s;

    s.on('connect', () => {
      console.log('[DriverSocket] Connected:', s.id);
      setIsConnected(true);
      s.emit('join', { role: 'driver', userId: user.id || user._id });
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    // ── Incoming ride requests ──────────────────────────────────────
    s.on('newRideRequest', (data) => {
      console.log('[DriverSocket] newRideRequest:', data);
      setActiveRequests((prev) => {
        if (prev.some(r => r.ride_id === data.ride_id)) return prev;
        return [...prev, data];
      });
      addToast('New Ride Request Available!', 'info');
    });

    s.on('rideTaken', (data) => {
      setActiveRequests((prev) => prev.filter(r => r.ride_id !== data.ride_id));
      addToast('Another driver accepted the ride.', 'warning');
    });

    s.on('emergency-alert', (data) => {
      addToast(`SAFETY ALERT: ${data.message}`, 'danger');
    });

    s.on('walletUpdated', (data) => {
      const { action, amount, taxi_coins, balance, reason } = data;
      playCoinSound();
      useAuthStore.setState({
        user: {
          ...useAuthStore.getState().user,
          balance: balance || useAuthStore.getState().user.balance,
          taxi_coins: taxi_coins || useAuthStore.getState().user.taxi_coins
        }
      });

      if (action === 'COIN_CREDIT') {
        addToast(`Coins Credited: +${amount} (${reason || 'Bonus'})`, 'success');
      } else if (action === 'WALLET_TOPUP') {
        addToast(`Earnings Multiplier Balance Updated: +${amount}`, 'success');
      } else if (action === 'WALLET_WITHDRAWAL') {
        addToast(`Withdrawal Successful: ${amount}`, 'info');
      }
    });

    setSocket(s);

    return () => {
      stopLocationBroadcasting();
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, user]);

  // ── Restart heartbeat whenever socket or trackingRideId changes ──
  // This is the critical fix: when a driver accepts a ride and sets trackingRideId,
  // we immediately restart the interval at 3s (instead of waiting up to 10s).
  useEffect(() => {
    if (!socketRef.current) return;
    startLocationBroadcasting(socketRef.current);
    return () => stopLocationBroadcasting();
  }, [socket, trackingRideId]);

  // ── GPS Broadcast Functions ────────────────────────────────────
  const ACTIVE_INTERVAL_MS = 3000;   // Fast updates during a ride
  const IDLE_INTERVAL_MS   = 10000;  // Slow heartbeat when idle

  const startLocationBroadcasting = (s) => {
    stopLocationBroadcasting(); // Clear any previous interval first

    const intervalMs = trackingRideIdRef.current ? ACTIVE_INTERVAL_MS : IDLE_INTERVAL_MS;
    console.log(`[DriverSocket] Location heartbeat: ${intervalMs / 1000}s (rideId: ${trackingRideIdRef.current || 'none'})`);

    locationInterval.current = setInterval(() => {
      const rideId = trackingRideIdRef.current;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            s.emit('updateLocation', {
              driverId: user?.id || user?._id,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              rideId: rideId || undefined
            });
          },
          (err) => {
            console.warn('[DriverSocket] Geolocation error:', err);
            // Emit Lagos fallback so the server still gets a heartbeat
            s.emit('updateLocation', {
              driverId: user?.id || user?._id,
              lat: 6.5244,
              lng: 3.3792,
              rideId: rideId || undefined
            });
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    }, intervalMs);
  };

  const stopLocationBroadcasting = () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
    }
  };

  // ── Context helpers ───────────────────────────────────────────
  const removeRequest = (rideId) => {
    setActiveRequests((prev) => prev.filter(r => r.ride_id !== rideId));
  };

  const value = {
    socket,
    isConnected,
    activeRequests,
    removeRequest,
    activeRequest: activeRequests[0] || null,
    clearRequest: () => {
      if (activeRequests.length > 0) removeRequest(activeRequests[0].ride_id);
    },
    setTrackingRideId,
    // Convenience wrapper so callers don't have to null-check socket themselves
    emit: (event, data) => socketRef.current?.emit(event, data),
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
