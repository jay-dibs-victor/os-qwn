import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = 'ws://localhost:8082';
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 2000;

const RideContext = createContext(null);

export function RideProvider({ children }) {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const listeners = useRef(new Set());
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) return;

    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      setConnected(true);
      reconnectAttempts.current = 0;
    };

    socket.onclose = () => {
      setConnected(false);
      ws.current = null;
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current += 1;
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
      }
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onmessage = (event) => {
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }
      if (msg.type === 'driver-location') {
        setDriverLocation({ latitude: msg.latitude, longitude: msg.longitude });
      }
      for (const cb of listeners.current) cb(msg);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws.current) ws.current.close();
    };
  }, [connect]);

  const send = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  const addListener = useCallback((cb) => {
    listeners.current.add(cb);
    return () => listeners.current.delete(cb);
  }, []);

  return (
    <RideContext.Provider value={{ connected, driverLocation, setDriverLocation, send, addListener }}>
      {children}
    </RideContext.Provider>
  );
}

export function useRide() {
  const ctx = useContext(RideContext);
  if (!ctx) throw new Error('useRide must be used within RideProvider');
  return ctx;
}
