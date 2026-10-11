import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useBookingStore } from '../store/useBookingStore';
import { useUIStore } from '../store/useUIStore';
import { VoiceNavService } from '../services/VoiceNavService';
import { soundService } from '../services/SoundService';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  // ── Use state so child components re-render when socket becomes available ──
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const { user, token } = useAuthStore();
  const { setBookingStep, setActiveBooking, setMapCenter } = useBookingStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Build socket URL — strip /api/v1 suffix, swap localhost for LAN IP on mobile
    let socketUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:12000';
    if (typeof window !== 'undefined' && socketUrl.includes('localhost')) {
      socketUrl = socketUrl.replace('localhost', window.location.hostname);
    }

    const s = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });

    s.on('connect', () => {
      console.log('[UserSocket] Connected — ID:', s.id);
      setIsConnected(true);
      s.emit('join', { role: 'passenger', userId: user.id || user._id });
    });

    s.on('disconnect', () => {
      console.log('[UserSocket] Disconnected');
      setIsConnected(false);
    });

    // ── RIDE STATUS UPDATES ───────────────────────────────────────
    s.on('rideAccepted', (data) => {
      setActiveBooking(data);
      setBookingStep('tracking');
      addToast(`Driver ${data.driver_name} is on the way!`, 'success');
      VoiceNavService.speak(`Your ride has been accepted by ${data.driver_name}. They are driving a ${data.vehicle_info}.`);
    });

    s.on('rideStatusUpdated', (data) => {
      const { status, ride } = data;
      if (ride) setActiveBooking(ride);

      if (status === 'ARRIVED') {
        addToast('Driver has arrived at your location!', 'info');
        VoiceNavService.speak('Your driver has arrived.');
      } else if (status === 'STARTED' || status === 'IN_TRANSIT') {
        setBookingStep('tracking');
        VoiceNavService.speak('Trip started. Please fasten your seatbelt. Navigating to your destination.');
      } else if (status === 'COMPLETED') {
        setBookingStep('done');
        VoiceNavService.speak('You have reached your destination. Please settle the payment.');
      }
    });

    // ── VOICE CALL SIGNALING ──────────────────────────────────────
    s.on('incoming-call', (data) => {
      addToast(`Incoming voice call from ${data.callerName || 'Driver'}...`, 'info');
      // Plan.jsx listens directly on the socket for the CallView UI
    });

    s.on('call-accepted', () => {
      addToast('Voice call connected.', 'success');
    });

    s.on('call-ended', () => {
      addToast('Voice call ended.', 'secondary');
    });

    // ── LIVE TRACKING ────────────────────────────────────────────
    s.on('driverLocationUpdate', (pos) => {
      useBookingStore.getState().updateDriverLocation([pos.lat, pos.lng]);
    });

    // ── CHAT & NOTIFICATIONS ──────────────────────────────────────
    s.on('new-chat-message', (msg) => {
      if (msg.sender_role === 'DRIVER' || msg.sender_role === 'driver') {
        addToast('New message from driver', 'info');
        const currentHistory = useBookingStore.getState().chatHistory || [];
        useBookingStore.setState({ chatHistory: [...currentHistory, msg] });
      }
    });

    // ── EMERGENCY & SAFETY ────────────────────────────────────────
    s.on('emergency-alert', (data) => {
      addToast(data.message, 'danger');
      VoiceNavService.speak('Safety alert: ' + data.message);
    });

    // ── WALLET & COIN UPDATES ─────────────────────────────────────
    s.on('walletUpdated', (data) => {
      const { action, amount, taxi_coins, balance, reason } = data;
      soundService.playCoin();
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
        addToast(`Wallet Top-up Successful: +${amount}`, 'success');
      } else if (action === 'WALLET_EXCHANGE') {
        addToast(`Exchanged for ${data.received_coins} coins`, 'info');
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user, token]);

  // ── Helpers exposed to consumers ─────────────────────────────────
  const sendMessage = (rideId, message) => {
    if (socket) {
      const payload = {
        ride_id: rideId,
        sender: user?.id || user?._id,
        message,
        sender_role: 'PASSENGER',
        createdAt: new Date().toISOString()
      };
      socket.emit('chat-message', payload);
      useBookingStore.getState().addChatMessage(payload);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
