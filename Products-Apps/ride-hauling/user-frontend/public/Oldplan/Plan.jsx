import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import UniversalMap from '../../../core/components/UniversalMap';
import LocationSearch from '../../../core/components/LocationSearch';
import { MapService } from '../../../core/services/MapService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { useUIStore } from '../../../core/store/useUIStore';
import { useBookingStore } from '../../../core/store/useBookingStore';
import { useCreateBookingMutation } from '../../../core/hooks/useBookingHooks';
import { useSocket } from '../../../core/context/SocketContext';
import { useNavigationEngine } from '../../../core/hooks/useNavigationEngine';
import NavigationHUD from '../Dashboard/NavigationHUD';
import VoiceCallView from '../Dashboard/VoiceCallView';
import { soundService } from '../../../core/services/SoundService';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from '../../../core/components/Confetti/Confetti';
import './plan.css';

/* ─── Constants ───────────────────────────────────────────────── */
const SEARCH_TIMEOUT_MS = 300_000; // 5 minutes max
const FAR_THRESHOLD_KM = 2;       // 2 km = "you are far from pickup"

/* ─── Haversine straight-line distance (km) ───────────────────── */
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ─── Custom SVG drop-pin markers (pulsating) ─────────────────── */
const createDivIcon = (color, cssClass = '') => L.divIcon({
  className: cssClass,
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
    <defs><filter id="s${color.replace('#', '')}"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/></filter></defs>
    <path d="M17 0C7.6 0 0 7.6 0 17c0 12.8 17 27 17 27s17-14.2 17-27C34 7.6 26.4 0 17 0z"
      fill="${color}" filter="url(#s${color.replace('#', '')})"/>
    <circle cx="17" cy="17" r="7" fill="white" opacity="0.95"/>
  </svg>`,
  iconSize: [34, 44], iconAnchor: [17, 44], popupAnchor: [0, -46],
});
const pickupIcon = createDivIcon('#34a853', 'pulsating-pin pickup-pin');
const destinationIcon = createDivIcon('#ea4335', 'pulsating-pin destination-pin');
const carIcon = new L.Icon({ iconUrl: '/markcar.png', iconSize: [32, 32], iconAnchor: [16, 16] });

const userLocationIcon = L.divIcon({
  className: '',
  html: `<div class="user-loc-wrap">
    <div class="user-loc-ring"></div>
    <div class="user-loc-ring ring2"></div>
    <div class="user-loc-dot"></div>
  </div>`,
  iconSize: [26, 26], iconAnchor: [13, 13],
});

/* ─── Inline SVG icon components ──────────────────────────────── */
const Ico = ({ d, w = 20, fill = 'none', stroke = 'currentColor', sw = 2, viewBox = '0 0 24 24', children }) => (
  <svg width={w} height={w} viewBox={viewBox} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

const IconChevronLeft = () => <Ico><polyline points="15 18 9 12 15 6" /></Ico>;
const IconPlus = () => <Ico><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Ico>;
const IconMinus = () => <Ico><line x1="5" y1="12" x2="19" y2="12" /></Ico>;
const IconCheck = () => <Ico sw={3}><polyline points="20 6 9 17 4 12" /></Ico>;
const IconPin = () => <Ico w={14} fill="currentColor" stroke="none" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />;
const IconBolt = () => <Ico w={18} fill="#FFB800" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Ico>;
const IconCalendar = () => <Ico w={18} stroke="#1a1a1a"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></Ico>;
const IconClose = () => <Ico><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Ico>;
const IconPhone = () => <Ico fill="currentColor" stroke="none" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />;
const IconChat = () => <Ico fill="white" stroke="none" d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />;
const IconExpand = () => <Ico><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></Ico>;
const IconStar = () => <Ico fill="#FFB800" stroke="none" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />;
const IconCopy = () => <Ico sw={1.8}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></Ico>;
const IconInfo = () => <Ico><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></Ico>;
const IconSend = () => <Ico fill="currentColor" stroke="none" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />;

const UserBookingFlow = () => {
  const { user } = useAuthStore();
  const { addToast, walletBalance } = useUIStore();
  const { mutate: createRide } = useCreateBookingMutation();
  const { savedPlaces, voucherBalance, driverTrail } = useBookingStore();
  const location = useLocation();
  const heroState = location.state || {};
  console.log(heroState, ">>>>")
  const { socket } = useSocket();

  const [wizardStep, setWizardStep] = useState(1);
  const [bookingType, setBookingType] = useState('QUICK');
  const [paymentMethod, setPaymentMethod] = useState('BANK');
  const [isEstimating, setIsEstimating] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(15);
  const [routePath, setRoutePath] = useState([]);
  const [routeResult, setRouteResult] = useState(null);
  const [estimatedFare, setEstimatedFare] = useState(heroState.estimatedFare || 1250);

  const [pickup, setPickup] = useState(() => {
    const p = heroState.pickup || {};
    const lat = parseFloat(p.lat), lng = parseFloat(p.lng);
    const address = p.address || 'Lagos Island, Nigeria';
    return (!isNaN(lat) && !isNaN(lng)) ? { ...p, lat, lng, address } : { lat: 6.5244, lng: 3.3792, address };
  });
  const [destination, setDestination] = useState(() => {
    const d = heroState.destination || {};
    const lat = parseFloat(d.lat), lng = parseFloat(d.lng);
    const address = d.address || '';
    return (!isNaN(lat) && !isNaN(lng)) ? { ...d, lat, lng, address } : (address ? { address } : null);
  });

  const [assignedDriver, setAssignedDriver] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [rideStatus, setRideStatus] = useState('searching');
  const [liveFare, setLiveFare] = useState(0);
  const [searchElapsed, setSearchElapsed] = useState(0);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isExpandedSearch, setIsExpandedSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const isCourier = heroState.rideCategory === 'courier';
  const agentLabel = isCourier ? 'dispatcher' : 'driver';

  const [userLocation, setUserLocation] = useState(null);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);
  const [rideFor, setRideFor] = useState(null);

  const [driverRouteStatus, setDriverRouteStatus] = useState('');
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showDriverInfo, setShowDriverInfo] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  const [isCardCollapsed, setIsCardCollapsed] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const [copied, setCopied] = useState(false);

  // Real-time Voice Call State
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, ringing, active
  const [activeCallRideId, setActiveCallRideId] = useState(null);

  const { nextManeuver } = useNavigationEngine(
    driverLocation ? [driverLocation.lat, driverLocation.lng] : null,
    routeResult
  );

  useEffect(() => {
    if (heroState.pickup && heroState.destination) {
      setBookingType('QUICK');
      setWizardStep(2);
      setCurrentZoom(16);
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn(err),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (!userLocation || !pickup?.lat) return;
    const km = haversineKm(userLocation.lat, userLocation.lng, pickup.lat, pickup.lng);
    setDistanceKm(km);
    if (km > FAR_THRESHOLD_KM && rideFor === null && wizardStep <= 3) setShowDistanceModal(true);
  }, [userLocation, pickup, rideFor, wizardStep]);

  useEffect(() => {
    if (!socket) return;

    socket.on('sessionRecovered', (data) => {
      const ride = data.ride;
      if (ride) {
        setAssignedDriver({
          id: ride._id,
          driver_id: ride.driver_id,
          driver_location: ride.driver_location,
          // Add other driver/vehicle info if available in ride object
        });
        setRideStatus(ride.status.toLowerCase());
        setWizardStep(5);
        socket.emit('join-ride', { rideId: ride._id });
        addToast('Trip state restored', 'info');
      }
    });

    socket.on('rideAccepted', (data) => {
      addToast(`${agentLabel} found!`, 'success');
      setTimeout(() => {
        clearTimers();
        setAssignedDriver({
          ...data,
          id: data.ride_id || data.id,
          verification_code: data.verification_code
        });
        setLiveFare(data.estimated_fare || estimatedFare);
        setRideStatus('assigned');
        const loc = data.driver_location;
        setDriverLocation(loc ? { lat: loc.coordinates[1], lng: loc.coordinates[0] } : null);
        setWizardStep(5);
        // Ensure both join the ride channel immediately
        socket.emit('join-ride', { rideId: data.ride_id || data.id });
      }, 1500);
    });

    socket.on('rideStarted', () => {
      setRideStatus('started');
      addToast('Trip started!', 'success');
    });

    socket.on('rideCompleted', (data) => {
      setRideStatus('completed');
      setPaymentReceipt(data);
      setWizardStep(6);
      soundService.playCoin(); // Trip done!
      addToast('Trip completed! Please finalize payment.', 'success');
    });

    socket.on('rideStatusUpdated', (data) => {
      if (data.ride_id === assignedDriver?.id || data.ride_id === assignedDriver?.ride_id) {
         setRideStatus(data.status.toLowerCase());
         if (data.status === 'PENDING_SETTLEMENT') {
            setWizardStep(6); // Go to checkout even if not fully marked completed yet
            addToast('Arrived! Please settle payment with captain.', 'info');
         }
      }
    });

    socket.on('driverLocationUpdate', d => setDriverLocation({ lat: d.lat, lng: d.lng }));

    // VOICE SIGNALING
    socket.on('incoming-call', (data) => {
      setIncomingCall(data);
      setCallStatus('ringing');
      soundService.playCallBeep();
    });

    socket.on('call-accepted', () => {
      setCallStatus('active');
      soundService.stopCallBeep();
    });

    socket.on('call-ended', () => {
      setCallStatus('idle');
      setIncomingCall(null);
      setShowVoiceCall(false);
      soundService.stopCallBeep();
    });

    // CHAT SYNC
    socket.on('new-chat-message', (msg) => {
      setChatMessages(prev => {
        // Prevent double messages if sender already added it locally
        if (msg.sender_role === 'passenger' && prev.some(m => m.text === msg.message && m.from === 'user')) return prev;
        return [...prev, { from: msg.sender_role === 'passenger' ? 'user' : 'driver', text: msg.message, ts: msg.createdAt }];
      });
    });

    return () => {
      socket.off('sessionRecovered');
      socket.off('rideAccepted');
      socket.off('rideStarted');
      socket.off('rideCompleted');
      socket.off('driverLocationUpdate');
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('call-ended');
      socket.off('new-chat-message');
    };
  }, [socket, agentLabel, estimatedFare]);

  // MUTUAL LIVE TRACKING: Passenger GPS Streaming
  useEffect(() => {
    let watchId;
    if (socket && (rideStatus === 'assigned' || rideStatus === 'started')) {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            // Make sure we have the active ride ID
            const activeId = assignedDriver?.ride_id || assignedDriver?.id; //
            if (activeId) {
              socket.emit('updatePassengerLocation', {
                rideId: activeId,
                lat: latitude,
                lng: longitude
              });
            }
          },
          (err) => console.warn('Passenger GPS Tracking error:', err),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }
    }

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [socket, rideStatus, /*activeRide,*/ assignedDriver]);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!pickup?.lat || !destination?.lat || wizardStep !== 2) return;
      setIsEstimating(true);
      try {
        const result = await MapService.getDirections(pickup, destination);
        setRouteResult(result);
        setRoutePath(result.path);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
        const res = await fetch(`${API_URL}/rides/multi-stop-quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ itineraries: [{ pickup: pickup.address, pickupCoords: pickup, destination: destination.address, destinationCoords: destination }] })
        });
        if (res.ok) {
          const json = await res.json();
          setEstimatedFare(json.data.total_fare);
          if (json.data.itineraries && json.data.itineraries.length > 0) {
            setRouteResult(prev => ({
              ...prev,
              distance: json.data.itineraries[0].estimated_distance / 1000
            }));
          }
        }
      } catch (e) { console.error(e); } finally { setIsEstimating(false); }
    };
    fetchQuote();
  }, [pickup.lat, pickup.lng, destination?.lat, destination?.lng, wizardStep]);

  const clearTimers = () => {
    clearTimeout(searchTimerRef.current);
    clearInterval(elapsedTimerRef.current);
  };

  const handleRequestRide = useCallback(() => {
    if (!pickup?.lat || !destination?.lat) {
      addToast('Please select valid locations with coordinates', 'warning');
      return;
    }
    setIsSearching(true);
    setWizardStep(4);
    setSearchElapsed(0);
    elapsedTimerRef.current = setInterval(() => setSearchElapsed(v => v + 1000), 1000);
    searchTimerRef.current = setTimeout(() => setShowTimeoutModal(true), SEARCH_TIMEOUT_MS);

    createRide({
      passenger_id: user?.id || 'demo',
      pickup_lat: pickup.lat, pickup_lng: pickup.lng,
      dest_lat: destination.lat, dest_lng: destination.lng,
      booking_type: bookingType,
      ride_category: isCourier ? 'courier' : 'taxi',
      payment_method: paymentMethod || 'BANK',
      is_expanded_search: isExpandedSearch
    });
  }, [pickup, destination, bookingType, paymentMethod, user, createRide, isCourier, isExpandedSearch]);

  const handleMouseDown = e => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: cardPosition.x, initialY: cardPosition.y };
  };

  useEffect(() => {
    if (!isDragging) return;
    const move = e => {
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      setCardPosition({
        x: Math.max(10, dragRef.current.initialX + deltaX),
        y: Math.max(10, dragRef.current.initialY + deltaY)
      });
    };
    const up = () => setIsDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [isDragging]);

  const markers = [
    ...(userLocation ? [{ position: [userLocation.lat, userLocation.lng], icon: userLocationIcon }] : []),
    { position: [pickup.lat, pickup.lng], icon: pickupIcon },
    ...(destination?.lat ? [{ position: [destination.lat, destination.lng], icon: destinationIcon }] : []),
    ...(driverLocation ? [{ position: [driverLocation.lat, driverLocation.lng], icon: carIcon }] : [])
  ];

  const fmtTime = ms => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || !socket || !assignedDriver) return;
    const msg = { from: 'user', text: chatInput, ts: new Date() };
    setChatMessages(prev => [...prev, msg]);
    socket.emit('sendRideMessage', { rideId: assignedDriver.id, message: chatInput });
    setChatInput('');
  };

  const copyPhone = () => {
    navigator.clipboard.writeText(assignedDriver?.driver_phone || '+2348000000000').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast('Phone number copied', 'info');
    });
  };

  // ─────────────────────────────────────────────────────────────────
  // VOICE CALL SIGNALING HANDLERS
  // ─────────────────────────────────────────────────────────────────
  const initiateCall = () => {
    if (!socket || !assignedDriver) return;
    const rideId = assignedDriver.ride_id || assignedDriver.id;
    socket.emit('initiate-call', { rideId, callerName: user?.firstname || 'Passenger' });
    setCallStatus('ringing');
    setActiveCallRideId(rideId);
    setShowVoiceCall(true);
    soundService.playCallBeep();
  };

  const acceptCall = () => {
    if (!socket || !incomingCall) return;
    socket.emit('accept-call', { ride_id: incomingCall.ride_id });
    setCallStatus('active');
    setIncomingCall(null);
    setShowVoiceCall(true);
  };

  const endCall = () => {
    if (!socket) return;
    const rideId = activeCallRideId || incomingCall?.ride_id || assignedDriver?.id;
    socket.emit('end-call', { ride_id: rideId });
    setCallStatus('idle');
    setIncomingCall(null);
    setShowVoiceCall(false);
  };

  // ─────────────────────────────────────────────────────────────────
  // MULTI-GATEWAY PAYMENT LOGIC
  // ─────────────────────────────────────────────────────────────────
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const initiateGatewayPayment = async (gateway) => {
    setIsProcessingPayment(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
    const amount = paymentReceipt?.fare || liveFare || estimatedFare;

    try {
      const res = await fetch(`${API_URL}/payments/${gateway}/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount,
          email: user?.email,
          metadata: { ride_id: assignedDriver?.id, user_id: user?.id }
        })
      });

      const json = await res.json();
      if (res.ok) {
        if (gateway === 'stripe') {
          // Handle Stripe Elements or redirect
          addToast('Stripe Payment Initiated', 'success');
          // window.location.href = json.data.checkout_url; (if redirect)
        } else if (gateway === 'paystack') {
          window.location.href = json.data.authorization_url || json.data.data.authorization_url;
        } else if (gateway === 'paypal') {
          const approvalUrl = json.data.links.find(l => l.rel === 'approve')?.href;
          if (approvalUrl) window.location.href = approvalUrl;
        } else if (gateway === 'flutterwave') {
          window.location.href = json.data.data.link;
        }
      } else {
        addToast(`Payment Error: ${json.error}`, 'error');
      }
    } catch (e) {
      console.error(e);
      addToast('Failed to initiate payment', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-page-layout">
        {/* Distance Modal */}
        <AnimatePresence>
          {showDistanceModal && (
            <motion.div className="dist-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="dist-modal-card premium-card" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
                <div className="dist-modal-icon">
                  <IconInfo />
                </div>
                <h2>You're Far From Pickup</h2>
                <p>Your current location is about <strong>{distanceKm?.toFixed(1)} km</strong> from the pickup point. Is this ride for you, or are you booking for someone else?</p>
                <div className="dist-modal-actions">
                  <button className="dist-btn-primary" onClick={() => { setRideFor('self'); setShowDistanceModal(false); }}>It's for me</button>
                  <button className="dist-btn-secondary" onClick={() => { setRideFor('other'); setShowDistanceModal(false); }}>Booking for someone else</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="booking-map-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
          {/* Floating Form Card */}
          {wizardStep < 4 && (
            <div
              className={`floating-search-card premium-card ${isCardCollapsed ? 'collapsed' : ''} ${isDragging ? 'dragging' : ''}`}
              style={{ left: cardPosition.x, top: cardPosition.y }}
            >
              <div className="floating-card-header" onMouseDown={handleMouseDown} onClick={() => {
                // simple click check
                if (!isDragging) setIsCardCollapsed(!isCardCollapsed);
              }}>
                <div className="header-info">
                  <IconPin />
                  <span>{wizardStep === 1 ? 'Queens' : wizardStep === 2 ? 'Route' : 'Payment'}</span>
                </div>
                <button className="card-toggle-btn">
                  {isCardCollapsed ? <IconPlus /> : <IconMinus />}
                </button>
              </div>

              {!isCardCollapsed && (
                <div className="floating-card-body">
                  <div className="card-scroll-area">
                    {/* Step 1: Booking Type */}
                    {wizardStep === 1 && (
                      <div className="animated-fadein">
                        <p className="card-sub-header">Select how you'd like to travel.</p>
                        <div className="booking-type-options">
                          <div className={`booking-type-card ${bookingType === 'QUICK' ? 'active' : ''}`} onClick={() => { setBookingType('QUICK'); setWizardStep(2); }}>
                            <div className="booking-type-icon"><IconBolt /></div>
                            <div><h6>Quick Ride</h6><p>Instant pickup. Go now.</p></div>
                          </div>
                          <div className={`booking-type-card ${bookingType === 'PLANNED' ? 'active' : ''}`} onClick={() => { setBookingType('PLANNED'); setWizardStep(2); }}>
                            <div className="booking-type-icon"><IconCalendar /></div>
                            <div><h6>Planned Trip</h6><p>Schedule for later.</p></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Route Inputs */}
                    {wizardStep === 2 && (
                      <div className="animated-fadein">
                        <div className="card-step-nav">
                          <button className="btn-back" onClick={() => setWizardStep(1)}><IconChevronLeft /> Back</button>
                        </div>
                        <div className="route-card">
                          <div className="route-input-row">
                            <div className="route-dot pickup" />
                            <div className="route-input-field-wrap">
                              <span className="route-input-label">Pickup</span>
                              <LocationSearch
                                placeholder="Search pickup location..."
                                value={pickup.address}
                                onLocationSelect={setPickup}
                                className="route-input-field"
                              />
                            </div>
                          </div>
                          <div className="route-input-row">
                            <div className="route-dot destination" />
                            <div className="route-input-field-wrap">
                              <span className="route-input-label">Destination</span>
                              <LocationSearch
                                placeholder="Where are you going?"
                                value={destination?.address || ''}
                                onLocationSelect={setDestination}
                                className="route-input-field"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Loading / Fare Section */}
                        {(pickup.lat && destination?.lat) ? (
                          <>
                            {isEstimating ? (
                              <div className="fare-loading-shim">
                                <div className="loading-spinner" />
                                <span>Calculating your fare...</span>
                              </div>
                            ) : (
                              <div className="animated-fadein">
                                <div className="trip-metrics-bar">
                                  <div className="trip-metric-card">
                                    <span className="metric-label">Distance</span>
                                    <span className="metric-value">{routeResult?.distance?.toFixed(1) || '0.0'} km</span>
                                  </div>
                                  <div className="trip-metric-card">
                                    <span className="metric-label">Est. Time</span>
                                    <span className="metric-value accent">{routeResult?.duration || '0 mins'}</span>
                                  </div>
                                </div>
                                <div className="fare-card">
                                  <div>
                                    <span className="fare-label">Estimated Fare</span>
                                    <div className="fare-value">₦{estimatedFare.toLocaleString()}</div>
                                  </div>
                                  <IconBolt />
                                </div>
                                <button className="btn-primary-action" onClick={() => setWizardStep(3)}>
                                  Continue to Payment →
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="route-missing-hint">Enter pickup and destination to see fare</div>
                        )}
                      </div>
                    )}

                    {/* Step 3: Payment (Restored from Screenshot) */}
                    {wizardStep === 3 && (
                      <div className="animated-fadein">
                        <div className="card-step-nav">
                          <button className="btn-back" onClick={() => setWizardStep(2)}><IconChevronLeft /> Back</button>
                        </div>
                        <div className="payment-total-card">
                          <div className="label">TOTAL AMOUNT</div>
                          <div className="amount">₦{estimatedFare.toLocaleString()}</div>
                          {user?.taxi_coins >= estimatedFare * 2 && (
                            <div className="text-yellow-500 font-bold mt-2">
                              Or {estimatedFare * 2} TXC
                            </div>
                          )}
                        </div>
                        <div className="sidebar-section-label">PAYMENT OPTION</div>
                        <div className="payment-options-list">
                          {['In-App Wallet', 'TaxiCoins', 'Voucher Code', 'Bank Transfer'].map(opt => {
                            const id = opt === 'TaxiCoins' ? 'COIN' : opt.toUpperCase().replace(' ', '_');
                            const isCoinLocked = id === 'COIN' && (user?.completed_trips || 0) < 3;
                            return (
                              <div
                                key={opt}
                                className={`payment-method-option ${paymentMethod === id ? 'active' : ''} ${isCoinLocked ? 'locked-option' : ''}`}
                                onClick={() => !isCoinLocked && setPaymentMethod(id)}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <h6>{opt}</h6>
                                  {isCoinLocked && <span title="Complete 3 trips to unlock">🔒</span>}
                                  {paymentMethod === id && !isCoinLocked && <IconCheck />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <button className="btn-dark-action" onClick={handleRequestRide}>
                          Confirm Booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <UniversalMap
            center={[pickup.lat, pickup.lng]}
            zoom={currentZoom}
            routePath={routePath}
            markers={markers}
            isScanning={wizardStep === 4}
            searchNodes={{ pickup, destination }}
            driverTrail={driverTrail}
          />

          {/* Active Navigation / HUD */}
          <AnimatePresence>
            {nextManeuver && wizardStep === 5 && <NavigationHUD maneuver={nextManeuver} />}
          </AnimatePresence>

          {/* Active Ride Overlay (Step 5) */}
          {wizardStep === 5 && assignedDriver && (
            <>
              <div className="floating-status-bar animated-fadein">
                <div className="status-dot" />
                <span>{rideStatus === 'assigned' ? 'Driver En Route' : rideStatus === 'started' ? 'Trip in Progress' : 'Arrived!'}</span>
                <div className="live-fare-display">₦{liveFare.toLocaleString()}</div>
              </div>

              <motion.div className="driver-bottom-bar" initial={{ y: 120 }} animate={{ y: 0 }}>
                <div className="driver-card premium-card">
                  <div className="driver-card-info">
                    <div className="driver-name">{assignedDriver.driver_name}</div>
                    <div className="driver-meta">
                      <span className="driver-rating"><IconStar /> 4.9</span>
                      <span className="driver-vehicle">Toyota Corolla · KJA-552</span>
                    </div>
                    {assignedDriver.verification_code && (
                      <div className="start-code-badge animated-pulse">
                        <span className="label">Security Code</span>
                        <span className="code">{assignedDriver.verification_code}</span>
                      </div>
                    )}
                  </div>
                  <div className="driver-actions">
                    <button className="driver-fab fab-chat" onClick={() => setShowChat(!showChat)}><IconChat /></button>
                    <button className="driver-fab fab-call" onClick={initiateCall}><IconPhone /></button>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Chat Panel */}
          <AnimatePresence>
            {showChat && (
              <motion.div className="chat-panel premium-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
                <div className="chat-panel-header">
                  <span>Chat with {assignedDriver?.driver_name}</span>
                  <button onClick={() => setShowChat(false)}><IconClose /></button>
                </div>
                <div className="chat-messages">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`chat-bubble ${msg.from === 'user' ? 'mine' : 'theirs'}`}>{msg.text}</div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="chat-input-row">
                  <input placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} />
                  <button className="chat-send-btn" onClick={sendChatMessage}><IconSend /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Call Signaling UI */}
          <AnimatePresence>
            {(callStatus !== 'idle' || incomingCall) && (
              <VoiceCallView
                contactName={incomingCall ? incomingCall.callerName : assignedDriver?.driver_name}
                onHangUp={endCall}
                onAccept={incomingCall ? acceptCall : null}
                isRinging={callStatus === 'ringing' || !!incomingCall}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Step 4: Scanning Overlay (High Fidelity 400x680 Restoration) */}
      {wizardStep === 4 && (
        <div className="search-fullscreen-overlay">
          <div className="search-scan-card">
            <div className="scan-bg-half">
              <ScanMessageTicker isCourier={isCourier} hideText={true} />
              <div className="corner-pulse-pin pin-tr"><IconPin /></div>
              <div className="corner-pulse-pin pin-bl"><IconPin /></div>
            </div>

            <div className="scan-info-half">
              <h2>Finding your {agentLabel}...</h2>

              <div className="scan-text-slider">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={Math.floor(searchElapsed / 4000)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="scan-subtitle"
                  >
                    {isCourier
                      ? ['Securing dedicated courier...', 'Optimizing delivery path...'][Math.floor(searchElapsed / 4000) % 2]
                      : ['Locating nearby captains...', 'Verifying vehicle safety...'][Math.floor(searchElapsed / 4000) % 2]
                    }
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="scan-metrics-grid">
                <div className="scan-metric-item">
                  <span className="label">ELAPSED TIME</span>
                  <span className="value">{fmtTime(searchElapsed)}</span>
                </div>
                <div className="scan-metric-item">
                  <span className="label">SEARCH LIMIT</span>
                  <span className="value">5:00</span>
                </div>
              </div>

              <div className="scan-progress-container">
                <div className="scan-progress-bar" style={{ width: `${Math.min(100, (searchElapsed / SEARCH_TIMEOUT_MS) * 100)}%` }} />
              </div>

              <button className="scan-cancel-btn" onClick={() => { clearTimers(); setWizardStep(3); setIsSearching(false); }}>
                Cancel Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Trip Summary & Multi-Gateway Completion */}
      {wizardStep === 6 && (
        <div className="payment-fullscreen-overlay animated-fadein">
          {paymentMethod === 'COIN' && <Confetti />}
          <motion.div className="payment-completion-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="completion-check">
              {rideStatus === 'pending_settlement' ? <IconBolt /> : <IconCheck />}
            </div>
            <h2>{rideStatus === 'pending_settlement' ? 'Almost There!' : 'Trip Completed!'}</h2>
            <p className="trip-id-text">Ride ID: {assignedDriver?.id || assignedDriver?.ride_id || '---'}</p>

            <div className="trip-summary-box">
              <div className="summary-row">
                <span>Distance travelled</span>
                <strong>{routeResult?.distance?.toFixed(1) || '0.0'} km</strong>
              </div>
              <div className="summary-row">
                <span>Total Fare</span>
                <strong className="fare-amount">{assignedDriver?.currency_symbol || '₦'}{(liveFare || estimatedFare).toLocaleString()}</strong>
              </div>
            </div>

            {rideStatus === 'pending_settlement' ? (
              <div className="pending-settlement-wizard">
                <div className="wizard-step-card">
                   <h3>Payment Settlement</h3>
                   <p>Please pay <strong>{assignedDriver?.currency_symbol || '₦'}{(liveFare || estimatedFare).toLocaleString()}</strong> via <strong>{paymentMethod.replace('_', ' ')}</strong> to the captain.</p>
                   {paymentMethod === 'BANK' && (
                     <div className="driver-bank-info">
                        <span className="label">Account Details:</span>
                        <span className="value">Kuda Bank · 2038475839</span>
                        <button className="btn-copy" onClick={copyPhone}><IconCopy /></button>
                     </div>
                   )}
                   <div className="waiting-animation">
                      <div className="pulse-dots"><span></span><span></span><span></span></div>
                      <span>Waiting for Captain to acknowledge...</span>
                   </div>
                </div>
              </div>
            ) : (
              <div className="payment-choice-section">
                <h3>Choose Payment Method</h3>
                <div className="gateway-grid">
                  <div className="gateway-card" onClick={() => initiateGatewayPayment('stripe')}>
                    <img src="/assets/images/stripe-logo.png" alt="Stripe" />
                    <span>Stripe</span>
                  </div>
                  <div className="gateway-card" onClick={() => initiateGatewayPayment('paystack')}>
                    <img src="/assets/images/paystack-logo.png" alt="Paystack" />
                    <span>Paystack</span>
                  </div>
                  <div className="gateway-card" onClick={() => initiateGatewayPayment('flutterwave')}>
                    <img src="/assets/images/flutterwave-logo.png" alt="Flutterwave" />
                    <span>Flutterwave</span>
                  </div>
                </div>

                <button className="payment-verify-btn" onClick={() => setWizardStep(1)}>
                  Back to Home
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Incoming Call Notification */}
      <AnimatePresence>
        {incomingCall && callStatus === 'ringing' && (
          <motion.div className="incoming-call-alert" initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }}>
            <div className="call-alert-content">
              <div className="call-avatar-pulse">
                <img src="/assets/images/avatar.png" alt="Caller" />
              </div>
              <div className="call-info">
                <strong>{incomingCall.caller_name || 'Captain'}</strong>
                <span>Incoming GoomVoice...</span>
              </div>
              <div className="call-actions">
                <button className="call-btn btn-decline" onClick={endCall}><IconClose /></button>
                <button className="call-btn btn-accept" onClick={acceptCall}><IconPhone /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Voice Call Overlay */}
      <AnimatePresence>
        {showVoiceCall && (
          <VoiceCallView
            contactName={assignedDriver?.driver_name || incomingCall?.caller_name || 'Captain'}
            onHangUp={endCall}
          />
        )}
      </AnimatePresence>

      {/* Timeout Prompt - Only shows after 5 mins of search */}
      {showTimeoutModal && (
        <motion.div className="timeout-prompt-modal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="timeout-prompt-content">
            <h3>No {agentLabel} Found</h3>
            <p>We're having trouble finding a {agentLabel} nearby. Would you like to expand your search area and try again?</p>
            <div className="timeout-actions">
              <button className="btn-primary-action" onClick={() => { setShowTimeoutModal(false); setIsExpandedSearch(true); handleRequestRide(); }}>
                Expand Reach
              </button>
              <button className="btn-link" onClick={() => { setShowTimeoutModal(false); setWizardStep(3); setIsSearching(false); }}>
                Cancel Request
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

/* ─── Animated scan message ticker ───────────────────────────── */
const ScanMessageTicker = ({ isCourier, hideText }) => {
  const slides = isCourier
    ? [
      { text: 'Securing dedicated courier...', img: 'https://images.unsplash.com/photo-1526367790999-0150786486a9?w=1200' },
      { text: 'Optimizing delivery path...', img: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=1200' },
    ]
    : [
      { text: 'Locating nearby captains...', img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200' },
      { text: 'Verifying vehicle safety...', img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200' },
    ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(v => (v + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [slides.length]);
  return (
    <div className="scan-bg-carousel">
      <AnimatePresence mode="wait">
        <motion.div key={idx} className="scan-bg-slide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
          <img src={slides[idx].img} alt="Scanning" />
          {!hideText && <div className="scan-overlay-text">{slides[idx].text}</div>}
        </motion.div>
      </AnimatePresence>
      {hideText && (
        <div className="scan-indicator-dots">
          {slides.map((_, i) => (
            <div key={i} className={`indicator-dot ${i === idx ? 'active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookingFlow;
