import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import UniversalMap from '../../../core/components/UniversalMap';
import DispatchMap from '../../../core/components/DispatchMap';
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
import AIAssistant from '../Dashboard/AIAssistant';
import FindingDriverBackground from './FindingDriverBackground';
import FloatingActionStack from './FloatingActionStack';
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
const IconChevronUp = () => <Ico><polyline points="18 15 12 9 6 15" /></Ico>;
const IconChevronDown = () => <Ico><polyline points="6 9 12 15 18 9" /></Ico>;
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
const IconShield = () => (
  <Ico fill="rgba(255,184,0,0.1)" stroke="#FFB800" sw={1.5} viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Ico>
);
const IconShieldCheck = () => (
  <Ico fill="#FFB800" stroke="#FFB800" sw={2} viewBox="0 0 24 24">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" stroke="white" />
  </Ico>
);

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
  const [isDrawerMinimized, setIsDrawerMinimized] = useState(false);
  const toggleDrawer = () => setIsDrawerMinimized(!isDrawerMinimized);
  const [currency, setCurrency] = useState('₦');

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
  const [isSettlingWallet, setIsSettlingWallet] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  const [isCardCollapsed, setIsCardCollapsed] = useState(false);

  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const STUN_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const [showAcceptanceShield, setShowAcceptanceShield] = useState(false);
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
        const rideId = String(ride._id);
        setAssignedDriver({
          id: rideId,
          ride_id: rideId,
          driver_id: ride.driver_id,
          driver_location: ride.driver_location,
          driver_name: ride.driver_name,
          driver_phone: ride.driver_phone,
          driver_rating: ride.driver_rating || '4.8',
          vehicle_model: ride.vehicle_model || 'Premium Sedan',
          vehicle_plate: ride.vehicle_plate || 'KJA-552',
          verification_code: ride.verification_code,
        });
        setRideStatus(ride.status.toLowerCase());
        setWizardStep(5);
        socket.emit('join-ride', { rideId });
        addToast('Trip state restored', 'info');
      }
    });

    socket.on('rideAccepted', (data) => {
      addToast(`${agentLabel} found!`, 'success');
      setShowAcceptanceShield(true);
      setIsSearching(false);

      // ⚡ Join the ride room immediately — do NOT wait for the animation timeout.
      // This ensures driver location updates and status events are never missed.
      const rideId = data.ride_id || data.id;
      if (rideId) socket.emit('join-ride', { rideId });

      setTimeout(() => {
        setShowAcceptanceShield(false);
        clearTimers();
        setAssignedDriver({
          ...data,
          id: rideId,
          ride_id: rideId,
          verification_code: data.verification_code,
          vehicle_model: data.vehicle_model || 'Premium Sedan',
          vehicle_plate: data.vehicle_plate || 'KJA-552',
          driver_rating: data.driver_rating || '4.9',
          driver_phone: data.driver_phone || '+234 810 000 0000'
        });
        setLiveFare(data.estimated_fare || estimatedFare);
        setRideStatus('assigned');
        const loc = data.driver_location;
        setDriverLocation(loc ? { lat: loc.coordinates[1], lng: loc.coordinates[0] } : null);
        setWizardStep(5);
      }, 3000);
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

    // NOTE: No ID-check needed here — the passenger joined ride-{id} room on rideAccepted,
    // so the server only delivers rideStatusUpdated events relevant to their active ride.
    socket.on('rideStatusUpdated', (data) => {
      const status = data.status?.toLowerCase();
      setRideStatus(status);
      if (data.status === 'PENDING_SETTLEMENT') {
        setWizardStep(6);
        addToast('Arrived! Please settle payment with captain.', 'info');
      } else if (data.status === 'ARRIVED') {
        addToast('Driver has arrived at your pickup!', 'info');
      }
    });

    socket.on('driverLocationUpdate', d => setDriverLocation({ lat: d.lat, lng: d.lng }));

    // VOICE SIGNALING
    socket.on('incoming-call', (data) => {
      setIncomingCall(data);
      setCallStatus('ringing');
      soundService.playCallBeep();
    });

    socket.on('call-accepted', async (data) => {
      setCallStatus('active');
      soundService.stopCallBeep();
      if (peerConnectionRef.current && data.answer) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer)).catch(console.error);
      }
    });

    socket.on('ice-candidate', (candidate) => {
      if (peerConnectionRef.current && candidate) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      }
    });

    socket.on('call-ended', () => {
      setCallStatus('idle');
      setIncomingCall(null);
      setShowVoiceCall(false);
      soundService.stopCallBeep();
      endCall(false); // Clean up without re-emitting
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
      socket.off('rideStatusUpdated');   // ← was missing
      socket.off('driverLocationUpdate');
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('ice-candidate');        // ← was missing
      socket.off('call-ended');
      socket.off('new-chat-message');
    };
  }, [socket, agentLabel, estimatedFare]);

  // MUTUAL LIVE TRACKING: Passenger GPS Streaming
  useEffect(() => {
    let watchId;
    // Stream while driver is assigned, has arrived, or trip is in progress
    if (socket && (rideStatus === 'assigned' || rideStatus === 'arrived' || rideStatus === 'started')) {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const activeId = assignedDriver?.ride_id || assignedDriver?.id;
            if (activeId) {
              socket.emit('updatePassengerLocation', {
                rideId: activeId,
                userId: user?.id || user?._id,   // ← required for observatory attribution
                lat: latitude,
                lng: longitude
              });
            }
          },
          (err) => console.warn('Passenger GPS Tracking error:', err),
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
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
          setCurrency(json.data.currency_symbol || json.data.currency || '₦');
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
  }, [pickup?.lat, pickup?.lng, destination?.lat, destination?.lng, wizardStep]);

  useEffect(() => {
    if (wizardStep === 3) {
      if ('speechSynthesis' in window) {
        const pAddress = pickup?.address || pickup?.name || 'your pickup location';
        const dAddress = destination?.address || destination?.name || 'your destination';
        const dist = routeResult?.distance?.toFixed(1) || 'unknown';
        const currencyName = currency === '₦' ? 'Naira' : currency;
        
        const text = `Your journey starts at ${pAddress} and ends at ${dAddress}. The estimated distance is ${dist} kilometers, and the fare is ${estimatedFare} ${currencyName}. Please double check if you are okay with these details before proceeding to confirm your booking.`;
        
        const msg = new SpeechSynthesisUtterance(text);
        
        const setVoiceAndSpeak = () => {
          const voices = window.speechSynthesis.getVoices();
          // Try to find a female voice
          const femaleVoice = voices.find(v => 
            v.name.includes('Female') || 
            /Samantha|Victoria|Karen|Zira|Tessa/i.test(v.name)
          );
          
          if (femaleVoice) {
            msg.voice = femaleVoice;
          }
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(msg);
        };

        if (window.speechSynthesis.getVoices().length > 0) {
          setVoiceAndSpeak();
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            setVoiceAndSpeak();
            window.speechSynthesis.onvoiceschanged = null;
          };
        }
      }
    }
  }, [wizardStep, pickup, destination, routeResult, estimatedFare, currency]);

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
    searchTimerRef.current = setTimeout(() => {
      setShowTimeoutModal(true);
      setWizardStep(3);
      setIsSearching(false);
      clearTimers();
    }, SEARCH_TIMEOUT_MS);

    createRide({
      passenger_id: user?.id || 'demo',
      pickup_lat: pickup.lat, pickup_lng: pickup.lng,
      pickup_address: pickup.address || pickup.name || 'Pickup Point',
      dest_lat: destination.lat, dest_lng: destination.lng,
      dest_address: destination.address || destination.name || 'Destination Point',
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

  const markers = useMemo(() => [
    ...(userLocation ? [{ position: [userLocation.lat, userLocation.lng], icon: userLocationIcon }] : []),
    ...(pickup?.lat ? [{ position: [pickup.lat, pickup.lng], icon: pickupIcon }] : []),
    ...(destination?.lat ? [{ position: [destination.lat, destination.lng], icon: destinationIcon }] : []),
    ...(driverLocation ? [{ position: [driverLocation.lat, driverLocation.lng], icon: carIcon }] : [])
  ], [
    userLocation?.lat, userLocation?.lng,
    pickup?.lat, pickup?.lng,
    destination?.lat, destination?.lng,
    driverLocation?.lat, driverLocation?.lng
  ]);

  const dispatchStops = useMemo(() => heroState.itineraries || [
    ...(pickup?.lat ? [{ lat: pickup.lat, lng: pickup.lng, status: 'PENDING' }] : []),
    ...(destination?.lat ? [{ lat: destination.lat, lng: destination.lng, status: 'PENDING' }] : [])
  ], [
    heroState.itineraries,
    pickup?.lat, pickup?.lng,
    destination?.lat, destination?.lng
  ]);

  const searchNodes = useMemo(() => ({ pickup, destination }), [
    pickup?.lat, pickup?.lng,
    destination?.lat, destination?.lng
  ]);

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

  useEffect(() => {
    if (showChat && chatEndRef.current) {
      setTimeout(() => {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [chatMessages, showChat]);

  const settleWalletPayment = async () => {
    setIsSettlingWallet(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
    try {
      const res = await fetch(`${API_URL}/rides/settle-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ride_id: assignedDriver?.id || assignedDriver?.ride_id,
          payment_type: 'WALLET'
        })
      });
      const json = await res.json();
      if (res.ok) {
        addToast('Payment settled from wallet successfully!', 'success');
      } else {
        addToast(json.error || 'Failed to settle payment', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error settling payment', 'error');
    } finally {
      setIsSettlingWallet(false);
    }
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
  const initiateCall = async () => {
    if (!socket || !assignedDriver) return;
    const rideId = assignedDriver.ride_id || assignedDriver.id;
    setCallStatus('ringing');
    setActiveCallRideId(rideId);
    setShowVoiceCall(true);
    soundService.playCallBeep();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection(STUN_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { rideId, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('initiate-call', { rideId, callerName: user?.firstname || 'Passenger', offer });
    } catch (err) {
      console.error('Error starting WebRTC call:', err);
      addToast('Microphone permission denied.', 'danger');
      endCall(true);
    }
  };

  const acceptCall = async () => {
    if (!socket || !incomingCall) return;
    const rideId = incomingCall.rideId || incomingCall.ride_id;
    setCallStatus('active');
    setShowVoiceCall(true);
    soundService.stopCallBeep();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection(STUN_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { rideId, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      if (incomingCall.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('accept-call', { rideId, answer });
      }
    } catch (err) {
      console.error('Error accepting WebRTC call:', err);
      addToast('Microphone permission denied.', 'danger');
      endCall(true);
    }
  };

  const endCall = (shouldEmit = true) => {
    if (shouldEmit && socket) {
      const rideId = activeCallRideId || incomingCall?.ride_id || incomingCall?.rideId || assignedDriver?.id;
      socket.emit('end-call', { rideId });
    }
    setCallStatus('idle');
    setIncomingCall(null);
    setShowVoiceCall(false);
    soundService.stopCallBeep();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
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
      <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />
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

        <div className="booking-map-container">
          {isCourier ? (
            <DispatchMap
              center={[pickup?.lat || 6.5244, pickup?.lng || 3.3792]}
              zoom={currentZoom}
              stops={dispatchStops}
              riderPosition={driverLocation}
              handshakeActive={rideStatus === 'started'}
            />
          ) : (
            <UniversalMap
              center={[pickup?.lat || 6.5244, pickup?.lng || 3.3792]}
              zoom={currentZoom}
              routePath={routePath}
              markers={markers}
              isScanning={wizardStep === 4}
              searchNodes={searchNodes}
              driverTrail={driverTrail}
            />
          )}

          {/* Premium Bottom Sheet (Steps 1-3) */}
          <AnimatePresence>
            {wizardStep < 4 && (
              <motion.div
                className="plan-bottom-sheet"
                initial={{ y: '100%' }}
                animate={{ y: isDrawerMinimized ? 'calc(100% - 60px)' : 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <div className="drawer-header-strip">
                  <div className="drawer-handle" />
                  <button className="drawer-toggle-btn" onClick={toggleDrawer}>
                    {isDrawerMinimized ? <IconChevronUp /> : <IconChevronDown />}
                  </button>
                </div>

                <div className="sheet-content">
                  {/* Step 1: Booking Type */}
                  {wizardStep === 1 && (
                    <motion.div className="animated-fadein" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <h4 className="sheet-title">Plan your trip</h4>
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
                    </motion.div>
                  )}

                  {/* Step 2: Route Inputs */}
                  {wizardStep === 2 && (
                    <motion.div className="animated-fadein" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                      {(pickup?.lat && destination?.lat) ? (
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
                    </motion.div>
                  )}

                  {/* Step 3: Payment */}
                  {wizardStep === 3 && (
                    <motion.div className="animated-fadein" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="card-step-nav">
                        <button className="btn-back" onClick={() => setWizardStep(2)}><IconChevronLeft /> Back</button>
                      </div>
                      <div className="payment-total-card">
                        <div className="label">TOTAL AMOUNT</div>
                        <div className="amount">₦{estimatedFare.toLocaleString()}</div>
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
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Navigation / HUD */}
          <AnimatePresence>
            {nextManeuver && wizardStep === 5 && <NavigationHUD maneuver={nextManeuver} />}
          </AnimatePresence>

          {/* Active Ride Overlay (Step 5) */}
          {wizardStep === 5 && assignedDriver && (
            <>
              {rideStatus === 'arrived' && (
                <motion.div
                  className="floating-code-pill premium-card animated-fadein"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  style={{
                    position: 'absolute',
                    top: 100,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 24px',
                    borderRadius: '50px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-lg)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(assignedDriver.verification_code || '1234');
                    addToast('Verification code copied to clipboard!', 'success');
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    backgroundColor: '#FFB800',
                    boxShadow: '0 0 10px #FFB800'
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    🔢 Share Code with Captain: <strong style={{ color: '#FFB800', fontSize: 15, marginLeft: 4 }}>{assignedDriver.verification_code || '1234'}</strong>
                  </span>
                  <IconCopy />
                </motion.div>
              )}

              <div className="floating-status-bar animated-fadein">
                <div className="status-dot" />
                <span>{rideStatus === 'assigned' ? 'Driver En Route' : rideStatus === 'started' ? 'Trip in Progress' : 'Arrived!'}</span>
                <div className="live-fare-display">₦{liveFare.toLocaleString()}</div>
              </div>

              <motion.div
                className="driver-bottom-bar"
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <div className="uber-premium-card">
                  {/* Top Section: Meet pickup point & ETA */}
                  <div className="uber-card-header">
                    <div className="uber-pickup-text-wrap">
                      <h3 className="uber-meet-title">Meet at the pick-up point for {assignedDriver.driver_name?.split(' ')[0] || 'driver'}</h3>
                      <p className="uber-meet-subtitle">{assignedDriver.vehicle_plate || 'KJA-552'}</p>
                    </div>
                    <div className="uber-eta-badge">
                      <span className="uber-eta-number">{assignedDriver.eta || 8}</span>
                      <span className="uber-eta-unit">min</span>
                    </div>
                  </div>

                  <div className="uber-divider" />

                  {/* Middle Section: Avatar, Car Rendering, Details */}
                  <div className="uber-profile-section">
                    <div className="uber-driver-avatar-container">
                      <div className="uber-driver-avatar-ring">
                        {assignedDriver.driver_name?.charAt(0) || 'D'}
                      </div>
                      <div className="uber-rating-badge">
                        {assignedDriver.driver_rating || '5.0'} ★
                      </div>
                    </div>

                    <div className="uber-car-image-container">
                      <svg viewBox="0 0 100 45" className="uber-car-svg">
                        <defs>
                          <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="60%" stopColor="#f0f0f0" />
                            <stop offset="100%" stopColor="#d8d8d8" />
                          </linearGradient>
                          <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#333333" />
                            <stop offset="100%" stopColor="#111111" />
                          </linearGradient>
                        </defs>
                        <ellipse cx="50" cy="40" rx="42" ry="4" fill="rgba(0,0,0,0.15)" />
                        <path d="M12,30 C12,24 16,18 24,16 C30,15 36,8 55,8 C70,8 78,16 86,22 C92,26 95,29 95,33 C95,35 90,36 85,36 C80,36 15,36 12,35 Z" fill="url(#carBodyGrad)" stroke="#cccccc" strokeWidth="0.5" />
                        <path d="M28,17 C32,16 38,10 52,10 C62,10 68,16 70,19 C64,19 40,19 28,17 Z" fill="#222222" opacity="0.85" />
                        <path d="M46,9 L46,18 M60,9 L60,18" stroke="#ffffff" strokeWidth="0.75" opacity="0.5" />
                        <path d="M8,30 Q12,28 16,30" stroke="#cccccc" strokeWidth="1" />
                        <path d="M92,28 Q94,30 92,32 Z" fill="#ffeb3b" opacity="0.9" />
                        <path d="M13,26 Q11,27 13,29 Z" fill="#f44336" opacity="0.9" />
                        <circle cx="28" cy="35" r="7" fill="url(#wheelGrad)" stroke="#ffffff" strokeWidth="1" />
                        <circle cx="28" cy="35" r="4" fill="#666666" />
                        <circle cx="28" cy="35" r="1.5" fill="#ffffff" />
                        <circle cx="72" cy="35" r="7" fill="url(#wheelGrad)" stroke="#ffffff" strokeWidth="1" />
                        <circle cx="72" cy="35" r="4" fill="#666666" />
                        <circle cx="72" cy="35" r="1.5" fill="#ffffff" />
                      </svg>
                    </div>

                    <div className="uber-details-content">
                      <h4 className="uber-driver-name">{assignedDriver.driver_name}</h4>
                      <p className="uber-vehicle-model">{assignedDriver.vehicle_model || 'White Mercedes-Benz C-Class'}</p>
                      <p className="uber-license-text">Licensed by TfL, PHL • PIN {assignedDriver.verification_code || '1234'}</p>
                    </div>
                  </div>

                  {/* Bottom Actions Row */}
                  <div className="uber-actions-row">
                    <div className="uber-chat-input-pill" onClick={() => setShowChat(!showChat)}>
                      <span className="uber-chat-placeholder">Message {assignedDriver.driver_name?.split(' ')[0] || 'driver'}...</span>
                    </div>
                    <button className="uber-action-fab uber-call-btn" onClick={initiateCall} title="Call Driver">
                      <IconPhone />
                    </button>
                    <button className={`uber-action-fab uber-info-btn ${showChat ? 'active' : ''}`} onClick={() => setShowChat(!showChat)} title="Toggle Chat">
                      <IconChat />
                    </button>
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

      {/* 🛡️ Driver Acceptance Shield Animation Overlay */}
      <AnimatePresence>
        {showAcceptanceShield && (
          <motion.div
            className="acceptance-shield-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="shield-content"
              initial={{ scale: 0.5, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 100 }}
            >
              <div className="shield-icon-wrap">
                <IconShieldCheck />
                <motion.div
                  className="shield-glow"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {agentLabel} Found!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Connecting you with your captain...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 4: Scanning Overlay (High Fidelity 400x680 Restoration) */}
      {wizardStep === 4 && (
        <div className="search-fullscreen-overlay">
          <FindingDriverBackground />
          <div className="search-scan-card transparent-card">
            <div className="scan-bg-half">
              <ScanMessageTicker isCourier={isCourier} hideText={true} />
              <div className="corner-pulse-pin pin-tr"><IconPin /></div>
              <div className="corner-pulse-pin pin-bl"><IconPin /></div>
            </div>

            <div className="scan-info-half transparent-info">
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
                <strong className="fare-amount">{assignedDriver?.currency_symbol || currency}{(liveFare || estimatedFare).toLocaleString()}</strong>
              </div>
            </div>

            {rideStatus === 'pending_settlement' ? (
              <div className="pending-settlement-wizard">
                <div className="wizard-step-card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 24, padding: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>
                    <i className="md md-payment" style={{ marginRight: 8, color: '#FFB800' }}></i>
                    Payment Settlement
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 16 }}>
                    Please pay <strong>{assignedDriver?.currency_symbol || currency}{(liveFare || estimatedFare).toLocaleString()}</strong> via <strong>{paymentMethod.replace('_', ' ')}</strong> to the captain.
                  </p>

                  {paymentMethod === 'BANK' && (
                    <div className="driver-bank-info" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
                      <span className="label" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Account Details</span>
                      <span className="value" style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>Kuda Bank · 2038475839</span>
                      <button className="btn-copy" onClick={copyPhone} style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer', verticalAlign: 'middle' }}><IconCopy /></button>
                    </div>
                  )}

                  {paymentMethod === 'WALLET' && (
                    <div style={{ marginTop: 12, marginBottom: 16 }}>
                      <button
                        className="payment-verify-btn"
                        style={{
                          background: 'linear-gradient(135deg, #FFB800, #FF8C00)',
                          color: '#111',
                          fontWeight: 800,
                          fontSize: 15,
                          borderRadius: 24,
                          padding: '14px 24px',
                          border: 'none',
                          cursor: 'pointer',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          boxShadow: '0 4px 16px rgba(255, 184, 0, 0.3)'
                        }}
                        onClick={settleWalletPayment}
                        disabled={isSettlingWallet}
                      >
                        {isSettlingWallet ? (
                          <>
                            Processing Wallet...
                          </>
                        ) : (
                          <>
                            <i className="md md-account-balance-wallet" style={{ fontSize: 18 }}></i>
                            Confirm & Pay ₦{(liveFare || estimatedFare).toLocaleString()}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="waiting-animation" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 12 }}>
                    <div className="pulse-dots"><span></span><span></span><span></span></div>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>Waiting for Captain to acknowledge...</span>
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

      {/* 🚀 AI OS Companion Injection */}
      <AIAssistant />

      {/* Floating Action Stack (Appears when drawer is minimized) */}
      <AnimatePresence>
        {isDrawerMinimized && (
          <FloatingActionStack
            key="floating-stack"
            wizardStep={wizardStep}
            pickup={pickup}
            setPickup={setPickup}
            destination={destination}
            setDestination={setDestination}
            routeResult={routeResult}
            isEstimating={isEstimating}
            estimatedFare={estimatedFare}
            currency={currency}
            handleRequestRide={handleRequestRide}
            setWizardStep={setWizardStep}
            assignedDriver={assignedDriver}
            rideStatus={rideStatus}
            liveFare={liveFare}
            routePath={routePath}
            markers={markers}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Animated scan message ticker ───────────────────────────── */
const ScanMessageTicker = ({ isCourier, hideText }) => {
  const slides = isCourier
    ? [
      { text: 'Securing dedicated courier...', type: 'courier' },
      { text: 'Optimizing delivery path...', type: 'path' },
      { text: 'Verifying package dimensions...', type: 'package' },
      { text: 'Assigning nearest rider...', type: 'rider' },
      { text: 'Ensuring priority handling...', type: 'priority' },
    ]
    : [
      { text: 'Locating nearby captains...', type: 'search' },
      { text: 'Verifying vehicle safety...', type: 'verify' },
      { text: 'Matching with best driver...', type: 'match' },
      { text: 'Optimizing your route...', type: 'route' },
      { text: 'Finalizing pickup details...', type: 'details' },
    ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(v => (v + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, [slides.length]);

  const renderVector = (type) => {
    switch (type) {
      case 'search':
        return (
          <motion.div
            className="vector-anim"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="radar-animation">
              <div className="radar-circle"></div>
              <div className="radar-circle delay-1"></div>
              <div className="radar-circle delay-2"></div>
              <i className="bi bi-person-walking text-warning display-1"></i>
            </div>
          </motion.div>
        );
      case 'verify':
        return (
          <motion.div
            className="vector-anim"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="verify-animation">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <i className="bi bi-shield-check text-success display-1"></i>
              </motion.div>
              <motion.div
                className="scan-line"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        );
      case 'match':
        return (
          <motion.div
            className="vector-anim"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="match-animation">
              <div className="pulse-location">
                <div className="pulse-ring"></div>
                <div className="pulse-ring delay-1"></div>
                <i className="bi bi-geo-alt-fill text-danger display-4"></i>
              </div>
              <motion.div
                animate={{ x: [-10, 10, -10] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <i className="bi bi-car-front-fill text-warning display-1"></i>
              </motion.div>
            </div>
          </motion.div>
        );
      case 'route':
        return (
          <motion.div
            className="vector-anim"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="path-animation">
              <svg width="200" height="100" viewBox="0 0 200 100">
                <motion.path
                  d="M10,80 C40,10 160,90 190,20"
                  fill="none"
                  stroke="#4285F4"
                  strokeWidth="4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.circle
                  r="6"
                  fill="#4285F4"
                  animate={{ offsetDistance: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ offsetPath: 'path("M10,80 C40,10 160,90 190,20")' }}
                />
              </svg>
            </div>
          </motion.div>
        );
      case 'details':
        return (
          <motion.div
            className="vector-anim"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="details-animation">
              <motion.i
                className="bi bi-file-earmark-text text-info display-1"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              ></motion.i>
              <motion.div
                className="check-marker"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <i className="bi bi-check-circle-fill text-success"></i>
              </motion.div>
            </div>
          </motion.div>
        );
      case 'courier':
        return (
          <motion.div
            className="vector-anim"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="courier-animation">
              <motion.i
                className="bi bi-box-seam text-info display-1"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              ></motion.i>
            </div>
          </motion.div>
        );
      case 'path':
        return (
          <motion.div
            className="vector-anim"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="path-animation">
              <svg width="200" height="100" viewBox="0 0 200 100">
                <motion.path
                  d="M10,50 Q100,0 190,50"
                  fill="none"
                  stroke="#FFB800"
                  strokeWidth="4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.circle
                  r="6"
                  fill="#FFB800"
                  animate={{ offsetDistance: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ offsetPath: 'path("M10,50 Q100,0 190,50")' }}
                />
              </svg>
            </div>
          </motion.div>
        );
      case 'package':
        return (
          <motion.div
            className="vector-anim"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="package-animation">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <i className="bi bi-box text-primary display-1"></i>
              </motion.div>
              <motion.div
                className="scan-bar"
                animate={{ left: ['0%', '100%', '0%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        );
      case 'rider':
        return (
          <motion.div
            className="vector-anim"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rider-animation">
              <div className="pulse-location">
                <div className="pulse-ring"></div>
                <div className="pulse-ring delay-1"></div>
              </div>
              <motion.i
                className="bi bi-bicycle text-success display-1"
                animate={{ x: [-5, 5, -5] }}
                transition={{ duration: 1, repeat: Infinity }}
              ></motion.i>
            </div>
          </motion.div>
        );
      case 'priority':
        return (
          <motion.div
            className="vector-anim"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="priority-animation">
              <motion.i
                className="bi bi-star-fill text-warning display-1"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.i>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="scan-bg-carousel">
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          className="scan-bg-slide vector-slide"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.8 }}
        >
          {renderVector(slides[idx].type)}
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
