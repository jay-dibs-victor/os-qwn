import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

import { useAuthStore } from '../../../core/store/useAuthStore';
import { useBookingStore } from '../../../core/store/useBookingStore';
import { useUIStore } from '../../../core/store/useUIStore';
import { useSocket } from '../../../core/context/SocketContext';
import { useNavigationEngine } from '../../../core/hooks/useNavigationEngine';
import { useRideRequests } from '../../../core/hooks/useBookingHooks';
import { useUserWalletBalance } from '../../../core/hooks/useProfileHooks';
import { MapService } from '../../../core/services/MapService';

import NavigationHUD from './NavigationHUD';
import PaymentSummaryView from './PaymentSummaryView';
import VoiceCallView from './VoiceCallView';
import PostTripFeedbackView from './PostTripFeedbackView';
import RideChat from './RideChat';
import TopUpModal from './TopUpModal';
import QuickTripModal from './QuickTripModal';
import ReceiptModal from './ReceiptModal';
import LocationRequestModal from './LocationRequestModal';
import AIAssistant from './AIAssistant';
import SystemOverlay from './SystemOverlay';
import WorkflowMonitor from './WorkflowMonitor';
import './Dashboard.css';
import './MapTheme.css';

import {
  Coins, CheckCircle, RefreshCw, Smartphone, Navigation,
  Award, Sparkles, Sliders, ShieldCheck, Compass, ChevronRight,
  Gamepad2, Fuel, Maximize2, Minimize2, Bell, MapPin, Zap,
  Clock, TrendingUp, Phone, MessageCircle, Star, ChevronDown,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   Map helpers (preserved from original)
───────────────────────────────────────────────────────────────── */
const MapAutoFocus = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points?.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [100, 100], animate: true });
    }
  }, [points, map]);
  return null;
};

const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204121.png',
  iconSize: [45, 45],
  iconAnchor: [22, 22],
  className: 'car-marker-premium car-marker-glow',
});

const userIcon = new L.DivIcon({
  className: 'custom-user-marker',
  html: '<div class="marker-pulse"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const UserDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { bookingStep, activeBooking, driverLocation, setBookingStep, setActiveBooking } = useBookingStore();
  const { addToast, openAuthModal } = useUIStore();
  const { socket } = useSocket();

  const { data: balance } = useUserWalletBalance();
  const { data: rideHistory = [] } = useRideRequests();

  /* ── Existing modal / map states (all preserved) ── */
  const [showTopUp, setShowTopUp] = useState(false);
  const [showQuickTrip, setShowQuickTrip] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptItem, setReceiptItem] = useState(null);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [routePath, setRoutePath] = useState([]);
  const [userGeo, setUserGeo] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  /* ── New portal states ── */
  const [mapExpanded, setMapExpanded] = useState(false);
  const [portalTab, setPortalTab] = useState('trips');
  const [preferences, setPreferences] = useState({
    tier: 'Swift',
    quietRide: true,
    acEnabled: true,
    luggageSupport: false,
    childSeat: false,
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [otpCode, setOtpCode] = useState('4820');
  const [walletCoins, setWalletCoins] = useState(100);
  const referrals = [
    { name: 'David K. (Passenger)', status: 'COMPLETED', date: '2026-05-12', reward: 50 },
    { name: 'Sarah M. (Driver)', status: 'COMPLETED', date: '2026-05-15', reward: 50 },
  ];

  /* ── Load coins from localStorage ── */
  useEffect(() => {
    const stored = localStorage.getItem('passengerCoins');
    if (stored) setWalletCoins(parseInt(stored));
    const storedPrefs = localStorage.getItem('passengerPreferences');
    if (storedPrefs) {
      try { setPreferences(JSON.parse(storedPrefs)); } catch (_) {}
    }
  }, []);

  /* ── Permission check (preserved) ── */
  useEffect(() => {
    const checkPermission = async () => {
      const isDismissed = localStorage.getItem('location_prompt_dismissed');
      if (isDismissed) return;
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          if (result.state === 'prompt' || result.state === 'denied') setShowLocationPrompt(true);
          result.onchange = () => { if (result.state === 'granted') setShowLocationPrompt(false); };
        } catch (e) { console.error('Permission query failed', e); }
      }
    };
    checkPermission();
  }, []);

  const handleEnableLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserGeo([pos.coords.latitude, pos.coords.longitude]); setShowLocationPrompt(false); addToast('Location access granted.', 'success'); },
      () => { handleRejectLocation(); addToast('We need location access to find you.', 'danger'); },
      { enableHighAccuracy: true }
    );
  };

  const handleRejectLocation = () => {
    localStorage.setItem('location_prompt_dismissed', 'true');
    setShowLocationPrompt(false);
  };

  const lastCoordsRef = useRef({ lat: 0, lng: 0 });

  /* ── Geolocation watcher (preserved) ── */
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserGeo([latitude, longitude]);
        setShowLocationPrompt(false);
        const dist = MapService.calculateDistance(lastCoordsRef.current.lat, lastCoordsRef.current.lng, latitude, longitude);
        if (dist > 10 || !userAddress) {
          lastCoordsRef.current = { lat: latitude, lng: longitude };
          try {
            const addr = await MapService.reverseGeocode(latitude, longitude);
            setUserAddress(addr || 'Unknown Location');
          } catch (e) { console.error('Geocode failed', e); }
        }
      },
      (err) => { if (err.code === 1) setShowLocationPrompt(true); },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [userAddress]);

  /* ── Google Directions for active booking (preserved) ── */
  useEffect(() => {
    if (activeBooking && window.google) {
      const ds = new window.google.maps.DirectionsService();
      ds.route(
        {
          origin: new window.google.maps.LatLng(activeBooking.pickup_location?.coordinates[1], activeBooking.pickup_location?.coordinates[0]),
          destination: new window.google.maps.LatLng(activeBooking.destination_location?.coordinates[1], activeBooking.destination_location?.coordinates[0]),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setRoutePath(result.routes[0].overview_path.map((p) => [p.lat(), p.lng()]));
          }
        }
      );
    }
  }, [activeBooking]);

  /* ── Socket events (preserved) ── */
  useEffect(() => {
    if (!socket) return;
    socket.on('incoming-call', () => setShowVoiceCall(true));
    socket.on('call-ended', () => setShowVoiceCall(false));
    return () => { socket.off('incoming-call'); socket.off('call-ended'); };
  }, [socket]);

  const handleInitiateCall = () => {
    if (socket && activeBooking) {
      setShowVoiceCall(true);
      socket.emit('initiate-call', { rideId: activeBooking.id, callerName: user?.firstname });
    }
  };

  const handleHangUp = () => {
    setShowVoiceCall(false);
    if (socket && activeBooking) socket.emit('end-call', { rideId: activeBooking.id });
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
      const res = await fetch(`${API_URL}/rides/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(feedbackData),
      });
      if (res.ok) { addToast('Feedback submitted.', 'success'); setShowFeedback(false); setTimeout(() => setActiveBooking(null), 1000); }
    } catch { addToast('Failed to save feedback', 'error'); }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      localStorage.setItem('passengerPreferences', JSON.stringify(preferences));
      setTimeout(() => {
        setSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 800);
    } catch { setSaving(false); }
  };

  const generateNewOtp = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(newOtp);
    localStorage.setItem('activeRideOtp', newOtp);
  };

  /* ── Derived values ── */
  const userPos = activeBooking
    ? [activeBooking.pickup_location?.coordinates[1], activeBooking.pickup_location?.coordinates[0]]
    : (userGeo || [6.5244, 3.3792]);
  const liveDriverPos = driverLocation || null;
  const quickTripPrefill = { pickup: userAddress, pickupCoords: userGeo ? { lat: userGeo[0], lng: userGeo[1] } : null };
  const currency = user?.local_wallet?.symbol || '₦';
  const walletBalance = balance?.amount ?? balance ?? 0;
  const totalTrips = rideHistory.length || 0;

  /* ── Auth guard helper ── */
  const requireAuth = (fn) => () => {
    if (!isAuthenticated()) { openAuthModal('login'); } else { fn(); }
  };

  /* ── Map renderer (shared between embedded & fullscreen) ── */
  const MapRenderer = ({ height }) => (
    <MapContainer center={userPos} zoom={15} zoomControl={false} style={{ height, width: '100%' }}>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
      <Marker position={userPos} icon={userIcon} />
      {activeBooking && liveDriverPos && (
        <>
          <Marker position={liveDriverPos} icon={carIcon} />
          {routePath.length > 0 && <Polyline positions={routePath} color="#FFB800" weight={6} opacity={0.8} />}
          <MapAutoFocus points={[userPos, liveDriverPos]} />
        </>
      )}
    </MapContainer>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════
          FULLSCREEN MAP OVERLAY (when expanded)
      ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {mapExpanded && (
          <motion.div
            key="fs-map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="portal-fs-map"
          >
            <MapRenderer height="100%" />

            {/* Fullscreen overlay controls */}
            <div className="portal-fs-ui">
              <button className="portal-fs-collapse-btn" onClick={() => setMapExpanded(false)}>
                <Minimize2 size={15} /> Collapse Map
              </button>

              {activeBooking ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="portal-fs-ride-bar"
                >
                  <div className="portal-live-dot" />
                  <div className="flex-1">
                    <p style={{ margin: 0, fontWeight: 800, color: '#fff', fontSize: '0.88rem' }}>Ride in Progress</p>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>Driver is {activeBooking.status}…</p>
                  </div>
                  <button className="portal-call-btn" onClick={handleInitiateCall}><Phone size={14} /></button>
                </motion.div>
              ) : (
                <motion.div
                  className="portal-fs-book-bar"
                  whileHover={{ scale: 1.01 }}
                  onClick={requireAuth(() => setShowQuickTrip(true))}
                >
                  <MapPin size={16} style={{ color: '#FFB800' }} />
                  <span>{userAddress || 'Where are we going?'}</span>
                  <ChevronRight size={16} />
                </motion.div>
              )}
            </div>

            <SystemOverlay />
            <WorkflowMonitor />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════
          MAIN PORTAL DASHBOARD
      ═══════════════════════════════════════════ */}
      <div className={`portal-dashboard${mapExpanded ? ' portal-dashboard--hidden' : ''}`}>

        {/* ── 1. HERO HEADER ── */}
        <section className="portal-hero">
          <div className="portal-hero-glow" />
          <div className="portal-hero-content">
            <div className="portal-hero-left">
              <div className="portal-verified-badge">
                <ShieldCheck size={11} /> Verified Passenger Node
              </div>
              <h1 className="portal-greeting">
                {getGreeting()}, <span className="portal-greeting-name">{user?.firstname || 'Passenger'}</span>
              </h1>
              <p className="portal-sub">
                Manage your rides, wallet, and comfort preferences from your command center.
              </p>
              <div className="portal-hero-actions">
                <motion.button
                  className="portal-btn-primary"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={requireAuth(() => setShowQuickTrip(true))}
                >
                  <Zap size={15} /> Book a Ride
                </motion.button>
                <motion.button
                  className="portal-btn-secondary"
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={requireAuth(() => setShowTopUp(true))}
                >
                  <Coins size={15} /> Top-Up Wallet
                </motion.button>
              </div>
            </div>
            <div className="portal-hero-right">
              <Link to="/profile">
                <img
                  src={user?.avatar || '/assets/images/avatar.png'}
                  alt="Profile"
                  className="portal-avatar"
                />
              </Link>
              <Link to="/notifications" className="portal-notif-btn">
                <Bell size={18} />
                <span className="portal-notif-dot" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── 2. STATS GRID ── */}
        <section className="portal-stats-grid">
          {[
            { icon: <Coins size={22} />, color: '--portal-gold', label: 'Wallet Balance', value: `${currency}${typeof walletBalance === 'number' ? walletBalance.toLocaleString() : '0.00'}` },
            { icon: <Compass size={22} />, color: '--portal-green', label: 'Completed Hauls', value: `${totalTrips} Trips` },
            { icon: <TrendingUp size={22} />, color: '--portal-purple', label: 'QCoins Balance', value: `${walletCoins} QCN` },
            { icon: <Award size={22} />, color: '--portal-pink', label: 'Ecosystem Status', value: 'Tier 1 Rank' },
          ].map((s, i) => (
            <motion.div key={i} className={`portal-stat-card portal-stat-card--${['gold','green','purple','pink'][i]}`} whileHover={{ y: -3 }}>
              <div className="portal-stat-icon-wrap">{s.icon}</div>
              <div>
                <span className="portal-stat-label">{s.label}</span>
                <span className="portal-stat-value">{s.value}</span>
              </div>
            </motion.div>
          ))}
        </section>

        {/* ── 3. BODY GRID: LEFT + RIGHT ── */}
        <div className="portal-body-grid">

          {/* ════════ LEFT COLUMN ════════ */}
          <div className="portal-left-col">

            {/* Active Trip / Map Card */}
            <div className="portal-card portal-active-trip-card">
              <div className="portal-card-head">
                <div className="portal-card-head-left">
                  <Navigation size={16} style={{ color: '#FFB800' }} />
                  <h3 className="portal-card-title">Active Trip</h3>
                  {activeBooking && (
                    <span className="portal-live-pill">
                      <span className="portal-live-dot" /> LIVE
                    </span>
                  )}
                </div>
                <motion.button
                  className="portal-expand-btn"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setMapExpanded(true)}
                >
                  <Maximize2 size={13} /> Expand
                </motion.button>
              </div>

              {/* Embedded Map */}
              <div className="portal-map-embed">
                <MapRenderer height="100%" />
                <div className="portal-map-gradient" />

                {activeBooking ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="portal-map-ride-bar"
                  >
                    <span className="portal-live-dot" />
                    <div className="flex-1">
                      <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '0.8rem' }}>Ride in Progress</p>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Driver is {activeBooking.status}…</p>
                    </div>
                    <button className="portal-call-btn" onClick={handleInitiateCall}><Phone size={12} /></button>
                    <button className="portal-chat-btn"><MessageCircle size={12} /></button>
                  </motion.div>
                ) : (
                  <motion.div
                    className="portal-map-book-cta"
                    whileHover={{ scale: 1.01 }}
                    onClick={requireAuth(() => setShowQuickTrip(true))}
                  >
                    <MapPin size={15} style={{ color: '#FFB800', flexShrink: 0 }} />
                    <span className="portal-map-book-text">{userAddress || 'Where are we going?'}</span>
                    <ChevronRight size={15} style={{ flexShrink: 0 }} />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="portal-card">
              <div className="portal-card-head">
                <div className="portal-card-head-left">
                  <Zap size={15} style={{ color: '#FFB800' }} />
                  <h3 className="portal-card-title">Quick Actions</h3>
                </div>
              </div>
              <div className="portal-actions-grid">
                {[
                  { emoji: '🚖', label: 'Book Taxi',   fn: requireAuth(() => setShowQuickTrip(true)) },
                  { emoji: '💰', label: 'Top-Up',      fn: requireAuth(() => setShowTopUp(true)) },
                  { emoji: '📜', label: 'History',     fn: requireAuth(() => navigate('/ride-history')) },
                  { emoji: '🎫', label: 'Vouchers',    fn: requireAuth(() => navigate('/vouchers')) },
                  { emoji: '✈️', label: 'Flights',     fn: requireAuth(() => navigate('/flights')) },
                  { emoji: '📦', label: 'Shipping',    fn: requireAuth(() => navigate('/shipping')) },
                  { emoji: '👤', label: 'Profile',     fn: () => navigate('/profile') },
                  { emoji: '🔔', label: 'Alerts',      fn: () => navigate('/notifications') },
                ].map((a, i) => (
                  <motion.button
                    key={i}
                    className="portal-action-tile"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={a.fn}
                  >
                    <span className="portal-action-emoji">{a.emoji}</span>
                    <span className="portal-action-label">{a.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tabs: Trips / Payments / Preferences */}
            <div className="portal-card portal-tabs-card">
              <div className="portal-tab-bar">
                {[
                  { key: 'trips',       icon: <Clock size={12} />,   label: 'Trips' },
                  { key: 'payments',    icon: <Coins size={12} />,   label: 'Payments' },
                  { key: 'preferences', icon: <Sliders size={12} />, label: 'Preferences' },
                ].map(t => (
                  <button
                    key={t.key}
                    className={`portal-tab${portalTab === t.key ? ' active' : ''}`}
                    onClick={() => setPortalTab(t.key)}
                  >
                    {t.icon} {t.label}
                    {t.key === 'trips' && rideHistory.length > 0 && (
                      <span className="portal-tab-count">{rideHistory.length}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="portal-tab-body">
                {/* ── TRIPS TAB ── */}
                {portalTab === 'trips' && (
                  rideHistory.length === 0 ? (
                    <div className="portal-empty-state">
                      <Compass size={34} style={{ color: '#2a2a2a', marginBottom: '0.75rem' }} />
                      <p>No trips yet. Book your first ride!</p>
                      <button className="portal-btn-primary" style={{ marginTop: '0.75rem', fontSize: '0.82rem' }} onClick={requireAuth(() => setShowQuickTrip(true))}>
                        <Zap size={13} /> Book Now
                      </button>
                    </div>
                  ) : (
                    <ul className="portal-trip-list">
                      {rideHistory.slice(0, 8).map((trip, i) => (
                        <li key={i} className="portal-trip-item">
                          <div className="portal-trip-icon-col">
                            <div className="portal-trip-icon"><Navigation size={14} /></div>
                            {i < Math.min(rideHistory.length, 8) - 1 && <div className="portal-trip-connector" />}
                          </div>
                          <div className="portal-trip-body">
                            <div className="portal-trip-route">
                              <span className="portal-trip-place">{trip.pickup_address || 'Pickup'}</span>
                              <ChevronRight size={11} style={{ color: '#444', flexShrink: 0 }} />
                              <span className="portal-trip-place">{trip.destination_address || 'Destination'}</span>
                            </div>
                            <div className="portal-trip-meta">
                              <span className="portal-trip-date">{trip.created_at ? new Date(trip.created_at).toLocaleDateString() : 'Recently'}</span>
                              <span className="portal-trip-fare">{currency}{trip.fare || '0.00'}</span>
                            </div>
                          </div>
                          <div className="portal-trip-end">
                            <span className={`portal-status-badge ${trip.status === 'completed' ? 'badge-success-soft' : 'badge-warn-soft'}`}>
                              {trip.status || 'completed'}
                            </span>
                            <button
                              className="portal-trip-action-btn"
                              title="View receipt"
                              onClick={() => { setReceiptItem(trip); setShowReceipt(true); }}
                            >
                              <Star size={11} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )
                )}

                {/* ── PAYMENTS TAB ── */}
                {portalTab === 'payments' && (
                  <div className="portal-wallet-panel">
                    <div className="portal-wallet-glow" />
                    <div className="portal-wallet-label">Total Wallet Balance</div>
                    <div className="portal-wallet-amount">{currency}{typeof walletBalance === 'number' ? walletBalance.toLocaleString() : '0.00'}</div>
                    <div className="portal-wallet-badge">
                      <Coins size={12} /> Queens Wallet
                    </div>
                    <div className="portal-wallet-actions">
                      <button className="portal-btn-primary" onClick={requireAuth(() => setShowTopUp(true))}>
                        <Coins size={13} /> Top-Up
                      </button>
                      <button className="portal-btn-secondary" onClick={requireAuth(() => navigate('/ride-history'))}>
                        View History
                      </button>
                    </div>
                  </div>
                )}

                {/* ── PREFERENCES TAB ── */}
                {portalTab === 'preferences' && (
                  <form onSubmit={handleSavePreferences} className="portal-pref-form">
                    <div className="portal-form-group">
                      <label className="portal-form-label">Preferred Fleet Dispatch Tier</label>
                      <select
                        className="portal-form-select"
                        value={preferences.tier}
                        onChange={e => setPreferences({ ...preferences, tier: e.target.value })}
                      >
                        <option value="Economy">Economy — Standard city travel</option>
                        <option value="Swift">Swift — Instant priority matching</option>
                        <option value="Luxury">Luxury — Tesla / Chauffeur elite fleet</option>
                      </select>
                    </div>

                    {[
                      { key: 'quietRide',      label: 'Quiet Ride Mode',               desc: 'Instruct your driver to keep conversation to a polite minimum.' },
                      { key: 'acEnabled',      label: 'Air Conditioning Climate Control', desc: 'Request climate to be pre-conditioned before boarding.' },
                      { key: 'luggageSupport', label: 'Luggage & Cargo Assistance',    desc: 'Ask your driver to assist with heavy suitcases or deliveries.' },
                      { key: 'childSeat',      label: 'Pre-Fitted Infant Child Seat',  desc: 'Dispatch only vehicles pre-equipped with vetted toddler safety frames.' },
                    ].map(({ key, label, desc }) => (
                      <label key={key} className="portal-toggle-row">
                        <input
                          type="checkbox"
                          checked={preferences[key]}
                          onChange={e => setPreferences({ ...preferences, [key]: e.target.checked })}
                          style={{ display: 'none' }}
                        />
                        <div className={`portal-toggle-switch${preferences[key] ? ' on' : ''}`} />
                        <div className="portal-toggle-text">
                          <span className="portal-toggle-label">{label}</span>
                          <span className="portal-toggle-desc">{desc}</span>
                        </div>
                      </label>
                    ))}

                    <div className="portal-pref-actions">
                      <button type="submit" className="portal-btn-primary" disabled={saving}>
                        {saving
                          ? <RefreshCw size={13} style={{ animation: 'portal-spin 0.8s linear infinite' }} />
                          : 'Save Preferences'}
                      </button>
                      {saveSuccess && (
                        <span className="portal-save-ok">
                          <CheckCircle size={13} /> Saved!
                        </span>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>{/* /portal-left-col */}

          {/* ════════ RIGHT COLUMN ════════ */}
          <div className="portal-right-col">

            {/* Ride Authorization OTP */}
            <div className="portal-card portal-otp-card">
              <div className="portal-card-head">
                <div className="portal-card-head-left">
                  <Smartphone size={16} style={{ color: '#FFB800' }} />
                  <h3 className="portal-card-title">Ride Authorization</h3>
                </div>
              </div>
              <p className="portal-card-desc">
                Provide this single-use key to your driver upon arrival to authenticate the dispatch and start tracking.
              </p>

              <div className="portal-otp-display">
                {otpCode.split('').map((char, i) => (
                  <div key={i} className="portal-otp-box">{char}</div>
                ))}
              </div>

              <button className="portal-btn-secondary portal-otp-regen" onClick={generateNewOtp}>
                <RefreshCw size={12} /> Regenerate Key
              </button>

              {/* Telemetry widget */}
              <div className="portal-telemetry">
                <div className="portal-telemetry-head">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fff', fontSize: '0.72rem', fontWeight: 700 }}>
                    <Navigation size={11} style={{ color: '#FFB800' }} /> TELEMETRY MAP
                  </span>
                  <span className="portal-live-pill" style={{ fontSize: '0.6rem' }}>
                    <span className="portal-live-dot" /> Driver En-Route
                  </span>
                </div>
                <div className="portal-telemetry-map">
                  <div className="portal-telemetry-track" />
                  <div className="portal-telemetry-car">🚗</div>
                  <div className="portal-telemetry-pin">📍</div>
                </div>
                <p style={{ fontSize: '0.68rem', color: '#555', textAlign: 'center', margin: '0.5rem 0 0' }}>
                  Eco-vehicle matched. ETA: <b style={{ color: '#FFB800' }}>3 mins</b>
                </p>
              </div>
            </div>

            {/* Referral Achievements */}
            <div className="portal-card portal-referral-card">
              <div className="portal-card-head">
                <div className="portal-card-head-left">
                  <Sparkles size={16} style={{ color: '#FFB800' }} />
                  <h3 className="portal-card-title">Referral Achievements</h3>
                </div>
              </div>
              <p className="portal-card-desc">
                Earn +50 coins when you invite passenger friends, and +100 coins once a referred partner completes verification.
              </p>

              <div className="portal-referral-list">
                {referrals.map((ref, idx) => (
                  <div key={idx} className="portal-referral-item">
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', margin: 0 }}>{ref.name}</h4>
                      <span style={{ fontSize: '0.65rem', color: '#555' }}>Joined: {ref.date}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFB800', display: 'block' }}>+{ref.reward} QCN</span>
                      <span className="portal-live-pill" style={{ fontSize: '0.55rem', marginTop: '2px' }}>{ref.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="portal-invite-block">
                <p style={{ fontSize: '0.68rem', fontWeight: 800, color: '#FFB800', letterSpacing: '0.1em', margin: 0 }}>YOUR INVITE KEY</p>
                <p style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '0.12em', fontWeight: 700, color: '#fff', margin: '0.2rem 0 0' }}>
                  QUEENS-{(user?.firstname || 'USER').toUpperCase().slice(0, 3)}-{Math.floor(100 + Math.random() * 900)}
                </p>
              </div>
            </div>

            {/* Gamified Playroom */}
            <div className="portal-card portal-gamified-card">
              <div className="portal-card-head">
                <div className="portal-card-head-left">
                  <Gamepad2 size={16} style={{ color: '#ec4899' }} />
                  <h3 className="portal-card-title" style={{ color: '#ec4899' }}>Gamified Playroom</h3>
                </div>
              </div>
              <p className="portal-card-desc">
                Engage in casual gameplay while on an active ride. In-transit play applies a{' '}
                <strong style={{ color: '#FFB800' }}>3× Booster</strong> to your coin generation speed!
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button className="portal-btn-secondary" style={{ flex: 1, fontSize: '0.78rem' }}>
                  Play Offline
                </button>
                <button
                  className="portal-btn-primary"
                  style={{ flex: 1, fontSize: '0.78rem', background: 'linear-gradient(90deg,#ec4899,#FFB800)', border: 'none' }}
                  onClick={() => setPortalTab('preferences')}
                >
                  Configure (3× Boost)
                </button>
              </div>
            </div>

          </div>{/* /portal-right-col */}
        </div>{/* /portal-body-grid */}
      </div>{/* /portal-dashboard */}

      {/* ═══════════════════════════════════════════
          ALL EXISTING MODALS — fully preserved
      ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showQuickTrip && (
          <QuickTripModal prefill={quickTripPrefill} onClose={() => setShowQuickTrip(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReceipt && receiptItem && (
          <ReceiptModal
            item={receiptItem}
            symbol={currency}
            onClose={() => { setShowReceipt(false); setReceiptItem(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVoiceCall && activeBooking && (
          <VoiceCallView contactName={activeBooking.driver_name || 'Driver'} onHangUp={handleHangUp} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && (
          <PostTripFeedbackView
            rideId={activeBooking?.id || activeBooking?._id}
            driverName={activeBooking?.driver_name || 'Driver'}
            onSubmit={handleFeedbackSubmit}
            onSkip={() => { setShowFeedback(false); setActiveBooking(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLocationPrompt && (
          <LocationRequestModal onEnable={handleEnableLocation} onReject={handleRejectLocation} />
        )}
      </AnimatePresence>

      {activeBooking && <RideChat rideId={activeBooking.id} />}

      <AIAssistant />

      <AnimatePresence>
        {showPaymentModal && activeBooking && (
          <PaymentSummaryView
            ride={activeBooking}
            onClose={() => { setShowPaymentModal(false); setBookingStep('idle'); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default UserDashboard;