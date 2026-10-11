import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaStar, FaCar, FaMoneyBillWave, FaClock, FaRoad, FaStop } from 'react-icons/fa';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import { useUIStore } from '../../../../core/store/useUIStore';
import { useSocket } from '../../../../core/context/SocketContext';
import { useAcceptRideMutation, useUpdateAvailability } from '../../../../core/hooks/useBookingHooks';
import { apiClient } from '../../../../core/api/apiClient';
import MapView from '../../../../core/components/MapView';
import LocationRequestModal from './LocationRequestModal';
import SystemOverlay from './SystemOverlay';

// Import Driver Sidebar Subcomponents
import DriverWallet from '../../../../core/components/driver/DriverWallet';
import DriverActivity from '../../../../core/components/driver/DriverActivity';
import DriverRatings from '../../../../core/components/driver/DriverRatings';
import DriverProfile from '../../../../core/components/driver/DriverProfile';
import DriverEarnings from '../../../../core/components/driver/DriverEarnings';
import DriverHelp from '../../../../core/components/driver/DriverHelp';
import DriverSettings from '../../../../core/components/driver/DriverSettings';

import './Dashboard.css';

const LAGOS_CENTER = [6.5244, 3.3792];

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function IncomingRideCard({ request, onAccept, onDecline, timeLeft, accepting }) {
  return (
    <div className="incoming-ride-overlay">
      <div className="incoming-ride-card">
        <div className="incoming-ride-header">
          <div className="incoming-ride-timer">{timeLeft}</div>
          <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>Incoming Request</span>
        </div>
        <div className="incoming-ride-rider">
          <div className="incoming-ride-rider-avatar">
            <FaUser />
          </div>
          <div className="incoming-ride-rider-info">
            <div className="incoming-ride-rider-name">{request.riderName || 'Rider'}</div>
            <div className="incoming-ride-rider-rating">
              <FaStar /> {request.riderRating || '4.8'}
            </div>
          </div>
          <div className="incoming-ride-fare">₦{(request.fare || 0).toLocaleString()}</div>
        </div>
        <div className="incoming-ride-locations">
          <div className="incoming-ride-location">
            <div className="incoming-ride-dot pickup" />
            <div style={{ flex: 1 }}>
              <div className="incoming-ride-loc-label">PICKUP</div>
              <div className="incoming-ride-loc-name">{request.pickup_address || request.pickup || 'Pickup location'}</div>
            </div>
          </div>
          <div className="incoming-ride-location">
            <div className="incoming-ride-dot dropoff" />
            <div style={{ flex: 1 }}>
              <div className="incoming-ride-loc-label">DROPOFF</div>
              <div className="incoming-ride-loc-name">{request.destination_address || request.destination || 'Destination location'}</div>
            </div>
          </div>
        </div>
        <div className="incoming-ride-actions">
          <button className="incoming-ride-decline" onClick={onDecline} disabled={accepting}>
            Decline
          </button>
          <button className="incoming-ride-accept" onClick={onAccept} disabled={accepting}>
            {accepting ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { walletBalance, addToast } = useUIStore();
  const { activeRequests = [], removeRequest } = useSocket();

  const [currentTab, setCurrentTab] = useState(null); // 'wallet', 'activity', 'ratings', 'profile', 'earnings', 'help', 'settings'
  const [driverPos, setDriverPos] = useState(LAGOS_CENTER);
  const [driverHeading] = useState(0);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [acceptingRide, setAcceptingRide] = useState(false);
  
  // Availability status State (offline / waiting / incoming)
  const [isOnline, setIsOnline] = useState(user?.is_available || false);
  const [driverState, setDriverState] = useState(user?.is_available ? 'waiting' : 'offline');

  // Stats State
  const [todayStats, setTodayStats] = useState({ earnings: 0, trips: 0, onlineSeconds: 0 });
  const onlineStartRef = useRef(null);
  const onlineTickRef = useRef(null);

  // Incoming timer logic
  const [incomingTimer, setIncomingTimer] = useState(15);
  const incomingCountdownRef = useRef(null);

  // Mutations
  const { mutate: acceptRide } = useAcceptRideMutation();
  const { mutate: updateAvailability } = useUpdateAvailability();

  // OS Safety token
  const [osToken, setOsToken] = useState(null);

  // Active Incoming Request
  const currentRequest = activeRequests[0] || null;

  // 1. Availability watcher
  useEffect(() => {
    setDriverState(isOnline ? 'waiting' : 'offline');
  }, [isOnline]);

  // 2. Geolocation Access Query & Watcher
  useEffect(() => {
    const checkPermission = async () => {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          if (result.state === 'prompt' || result.state === 'denied') {
            setShowLocationPrompt(true);
          }
          result.onchange = () => {
            if (result.state === 'granted') setShowLocationPrompt(false);
          };
        } catch (e) {
          console.error("Permission query failed", e);
        }
      }
    };
    checkPermission();
  }, []);

  const handleEnableLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = [pos.coords.latitude, pos.coords.longitude];
        setDriverPos(c);
        setShowLocationPrompt(false);
        addToast('Live location enabled.', 'success');
      },
      (err) => {
        addToast('Location access is required to use the dashboard.', 'danger');
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverPos([pos.coords.latitude, pos.coords.longitude]);
        setShowLocationPrompt(false);
      },
      (err) => {
        if (err.code === 1) setShowLocationPrompt(true);
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // 3. Online Duration Timer
  useEffect(() => {
    if (driverState === 'waiting') {
      if (!onlineStartRef.current) {
        onlineStartRef.current = Date.now();
      }
      onlineTickRef.current = setInterval(() => {
        setTodayStats((prev) => ({
          ...prev,
          onlineSeconds: Math.round((Date.now() - onlineStartRef.current) / 1000),
        }));
      }, 1000);
    } else {
      if (onlineTickRef.current) {
        clearInterval(onlineTickRef.current);
        onlineTickRef.current = null;
      }
      onlineStartRef.current = null;
    }
    return () => {
      if (onlineTickRef.current) clearInterval(onlineTickRef.current);
    };
  }, [driverState]);

  // 4. Timer countdown for incoming requests
  useEffect(() => {
    if (currentRequest) {
      setDriverState('incoming');
      setIncomingTimer(15);
    } else if (driverState === 'incoming') {
      setDriverState(isOnline ? 'waiting' : 'offline');
    }
  }, [currentRequest]);

  useEffect(() => {
    if (driverState === 'incoming' && incomingTimer > 0) {
      incomingCountdownRef.current = setTimeout(() => {
        setIncomingTimer((prev) => {
          if (prev <= 1) {
            if (currentRequest) {
              removeRequest(currentRequest.ride_id);
            }
            setDriverState(isOnline ? 'waiting' : 'offline');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (incomingCountdownRef.current) clearTimeout(incomingCountdownRef.current);
    };
  }, [driverState, incomingTimer, currentRequest]);

  // 5. Handlers
  const goOnline = useCallback(() => {
    updateAvailability({ id: user.id || user._id, is_available: true }, {
      onSuccess: () => {
        setIsOnline(true);
        addToast('You are now online.', 'success');
      },
      onError: () => addToast('Failed to go online.', 'danger'),
    });
  }, [user, updateAvailability]);

  const goOffline = useCallback(() => {
    updateAvailability({ id: user.id || user._id, is_available: false }, {
      onSuccess: () => {
        setIsOnline(false);
        addToast('You are now offline.', 'info');
      },
      onError: () => addToast('Failed to go offline.', 'danger'),
    });
  }, [user, updateAvailability]);

  const handleDecline = useCallback(() => {
    if (currentRequest) {
      removeRequest(currentRequest.ride_id);
    }
    setDriverState(isOnline ? 'waiting' : 'offline');
  }, [currentRequest, isOnline]);

  const handleAccept = useCallback(() => {
    if (!currentRequest || acceptingRide) return;
    setAcceptingRide(true);
    acceptRide(currentRequest.ride_id, {
      onSuccess: () => {
        addToast('Ride Accepted!', 'success');
        removeRequest(currentRequest.ride_id);
        navigate(`/trip/${currentRequest.ride_id}`);
      },
      onError: () => {
        setAcceptingRide(false);
        addToast('Acceptance failed.', 'danger');
      },
    });
  }, [currentRequest, acceptingRide, acceptRide, navigate]);

  // 6. AI OS Background Connection
  useEffect(() => {
    if (user && !osToken) {
      apiClient.get(`/os/session/token`, {
        params: { userId: user.id || user._id, role: 'driver' }
      })
      .then(res => setOsToken(res.data.token))
      .catch(err => console.error('Failed to get OS token:', err));
    }
  }, [user, osToken]);

  // Render Sub-components if currentTab is set
  const renderSubPage = () => {
    const onBack = () => setCurrentTab(null);
    switch (currentTab) {
      case 'wallet': return <DriverWallet onBack={onBack} />;
      case 'activity': return <DriverActivity onBack={onBack} />;
      case 'ratings': return <DriverRatings onBack={onBack} />;
      case 'profile': return <DriverProfile onBack={onBack} />;
      case 'earnings': return <DriverEarnings onBack={onBack} />;
      case 'help': return <DriverHelp onBack={onBack} />;
      case 'settings': return <DriverSettings onBack={onBack} />;
      default: return null;
    }
  };

  return (
    <div className="driver-portal">
      {/* ── LIVE MAP AREA ───────────────────────────────────────── */}
      <div className="driver-map-area">
        <MapView
          userCoords={driverPos}
          showUserLocation={true}
          pickupCoords={null}
          dropoffCoords={null}
          driverCoords={null}
          routeCoords={null}
          showRoute={false}
        />

        {driverState === 'incoming' && currentRequest && (
          <IncomingRideCard
            request={currentRequest}
            onAccept={handleAccept}
            onDecline={handleDecline}
            timeLeft={incomingTimer}
            accepting={acceptingRide}
          />
        )}
      </div>

      {/* ── SIDEBAR PANEL ───────────────────────────────────────── */}
      <div className="driver-sidebar">
        {currentTab ? renderSubPage() : (
          <>
            {/* Header / HUD */}
            <div style={{ padding: '24px 24px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => setCurrentTab('profile')}>
                  <div className="relative">
                    <img 
                      src={user?.avatar || '/assets/images/avatar.png'} 
                      alt="avatar" 
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} 
                    />
                    <span 
                      style={{ 
                        position: 'absolute', bottom: '0', right: '0', 
                        width: '12px', height: '12px', borderRadius: '50%', 
                        background: isOnline ? '#22c55e' : '#ef4444', 
                        border: '2px solid var(--color-surface)' 
                      }} 
                    />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>{user?.firstname || 'Driver'} {user?.lastname || 'Portal'}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>{isOnline ? 'ONLINE' : 'OFFLINE'}</p>
                  </div>
                </div>

                <div 
                  className="glass-card" 
                  style={{ 
                    padding: '8px 16px', borderRadius: '99px', margin: 0, 
                    display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' 
                  }}
                  onClick={() => setCurrentTab('wallet')}
                >
                  <FaMoneyBillWave style={{ color: 'var(--color-gold)' }} />
                  <span style={{ fontWeight: 800, fontSize: '14px' }}>
                    {user?.local_wallet?.symbol || '₦'}{(walletBalance || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Quick Navigation Menu */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 20 }}>
                {[
                  { label: 'Wallet', key: 'wallet' },
                  { label: 'History', key: 'activity' },
                  { label: 'Earnings', key: 'earnings' },
                  { label: 'Settings', key: 'settings' }
                ].map(item => (
                  <button 
                    key={item.key} 
                    onClick={() => setCurrentTab(item.key)}
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px', padding: '8px 4px', fontSize: '11px', fontWeight: 700,
                      color: 'var(--color-white)', cursor: 'pointer', transition: 'all var(--transition-fast)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Offline Screen */}
            {driverState === 'offline' && (
              <div className="driver-offline-panel">
                <div className="driver-offline-hero">
                  <div className="driver-offline-icon-grid">
                    <div className="driver-off-icon-box"><FaMoneyBillWave /></div>
                    <div className="driver-off-icon-box main"><FaCar /></div>
                    <div className="driver-off-icon-box"><FaStar /></div>
                  </div>
                  <h2 className="driver-offline-title">Ready to earn?</h2>
                  <p className="driver-offline-subtitle">Go online to start receiving ride requests in the Lagos metro area.</p>
                </div>

                <div className="driver-offline-card">
                  <div className="driver-off-benefit">
                    <div className="driver-off-benefit-icon"><FaClock /></div>
                    <div className="driver-off-benefit-text">
                      <strong>Keep ~85% of Fares</strong>
                      <span>Industry leading commission rates</span>
                    </div>
                  </div>
                  <div className="driver-off-benefit">
                    <div className="driver-off-benefit-icon"><FaCar /></div>
                    <div className="driver-off-benefit-text">
                      <strong>Flexible Schedule</strong>
                      <span>Work whenever you want</span>
                    </div>
                  </div>
                </div>

                {todayStats.trips > 0 && (
                  <div className="driver-offline-summary">
                    <div className="driver-off-sum-item">
                      <span className="driver-off-sum-label">LAST SESSION</span>
                      <span className="driver-off-sum-val">₦{todayStats.earnings.toLocaleString()}</span>
                    </div>
                    <div className="driver-off-sum-divider" />
                    <div className="driver-off-sum-item">
                      <span className="driver-off-sum-label">TRIPS</span>
                      <span className="driver-off-sum-val">{todayStats.trips}</span>
                    </div>
                  </div>
                )}

                <button className="driver-go-online-btn" onClick={goOnline}>
                  <FaCar /> Go Online
                </button>
              </div>
            )}

            {/* Waiting Screen */}
            {(driverState === 'waiting') && (
              <div className="driver-active-panel">
                <div className="driver-earnings-widget">
                  <div className="driver-earnings-main">
                    <span className="driver-earnings-label">Today's Earnings</span>
                    <span className="driver-earnings-value">₦{todayStats.earnings.toLocaleString()}</span>
                  </div>
                  <div className="driver-stats-grid">
                    <div className="driver-stat-item">
                      <FaRoad className="driver-stat-icon" />
                      <div className="driver-stat-content">
                        <span className="driver-stat-val">{todayStats.trips}</span>
                        <span className="driver-stat-lab">Trips</span>
                      </div>
                    </div>
                    <div className="driver-stat-item">
                      <FaClock className="driver-stat-icon" />
                      <div className="driver-stat-content">
                        <span className="driver-stat-val">{formatDuration(todayStats.onlineSeconds)}</span>
                        <span className="driver-stat-lab">Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="driver-radar-container">
                  <div className="driver-radar-circle ring-1" />
                  <div className="driver-radar-circle ring-2" />
                  <div className="driver-radar-circle ring-3" />
                  <div className="driver-radar-icon">
                    <FaCar />
                  </div>
                  <h3 className="driver-radar-title">Looking for rides</h3>
                  <p className="driver-radar-subtitle">Positioning you for high-demand areas</p>
                </div>

                <button className="driver-go-offline-btn" onClick={goOffline} style={{ marginBottom: '24px' }}>
                  <FaStop /> Go offline
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showLocationPrompt && (
        <LocationRequestModal onEnable={handleEnableLocation} />
      )}

      <SystemOverlay />
    </div>
  );
}
