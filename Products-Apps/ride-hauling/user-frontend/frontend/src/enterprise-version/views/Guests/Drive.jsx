import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaStar, FaMapMarkerAlt, FaCrosshairs, FaPlay, FaStop, FaCheck, FaCheckCircle, FaTimes, FaCar, FaMoneyBillWave, FaClock, FaRoad, FaRedo, FaPhone, FaCommentDots } from 'react-icons/fa';
import MapView from '../../core/components/MapView.jsx';
import DriverOnboarding, { isDriverOnboarded } from '../../core/components/DriverOnboarding.jsx';
import DriverWallet from '../../core/components/driver/DriverWallet.jsx';
import DriverActivity from '../../core/components/driver/DriverActivity.jsx';
import DriverRatings from '../../core/components/driver/DriverRatings.jsx';
import DriverProfile from '../../core/components/driver/DriverProfile.jsx';
import DriverEarnings from '../../core/components/driver/DriverEarnings.jsx';
import DriverHelp from '../../core/components/driver/DriverHelp.jsx';
import DriverSettings from '../../core/components/driver/DriverSettings.jsx';

const LAGOS_CENTER = [6.5244, 3.3792];

function coordDist(a, b) {
  const dlat = a[0] - b[0];
  const dlng = a[1] - b[1];
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

function calcHeading(from, to) {
  if (coordDist(from, to) < 0.00001) return 0;
  const dlat = to[0] - from[0];
  const dlng = to[1] - from[1];
  const angle = Math.atan2(dlng, dlat) * (180 / Math.PI);
  return (angle + 360) % 360;
}

function lerp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const RIDE_REQUESTS = [
  { riderName: 'Amara O.', riderRating: '4.85', phone: '+234 802 345 6789', pickup: 'Ikeja City Mall', dropoff: 'Victoria Island', pickupCoords: [6.6010, 3.3510], dropoffCoords: [6.4281, 3.4219], fare: 3200, distance: '14.2 km' },
  { riderName: 'Tunde B.', riderRating: '4.72', phone: '+234 803 456 7890', pickup: 'Yaba, Lagos', dropoff: 'Lekki Phase 1', pickupCoords: [6.5114, 3.3741], dropoffCoords: [6.4435, 3.5362], fare: 2800, distance: '11.8 km' },
  { riderName: 'Folake A.', riderRating: '4.91', phone: '+234 805 678 9012', pickup: 'Surulere', dropoff: 'Ikeja, Lagos', pickupCoords: [6.4895, 3.3588], dropoffCoords: [6.6010, 3.3510], fare: 3500, distance: '16.5 km' },
  { riderName: 'Chidi M.', riderRating: '4.68', phone: '+234 806 789 0123', pickup: 'Oshodi', dropoff: 'Ajah', pickupCoords: [6.5376, 3.3487], dropoffCoords: [6.4723, 3.5949], fare: 4100, distance: '22.3 km' },
  { riderName: 'Simi K.', riderRating: '4.88', phone: '+234 808 901 2345', pickup: 'Ikeja, GRA', dropoff: 'VI, Bar Beach', pickupCoords: [6.5888, 3.3455], dropoffCoords: [6.4275, 3.4183], fare: 3800, distance: '18.1 km' },
  { riderName: 'Bayo A.', riderRating: '4.79', phone: '+234 809 012 3456', pickup: 'Maryland, Lagos', dropoff: 'Ajah, Eleko Beach', pickupCoords: [6.5728, 3.3642], dropoffCoords: [6.4723, 3.5949], fare: 4500, distance: '24.7 km' },
];

const DEG_TO_KM = 111.32;

async function fetchRoute(fromCoords, toCoords) {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?geometries=geojson&overview=full`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 'Ok' && data.routes?.length > 0) {
      const geom = data.routes[0].geometry.coordinates;
      return geom.map(([lng, lat]) => [lat, lng]);
    }
  } catch {}
  return null;
}

function DriverNavBar({ state, riderName, eta, onPickupAction }) {
  const getInstruction = () => {
    switch (state) {
      case 'to_pickup': return `Pickup ${riderName}`;
      case 'arrived': return 'Rider Notified';
      case 'en_route': return 'Dropping off';
      default: return 'Online';
    }
  };

  const getSubtext = () => {
    switch (state) {
      case 'to_pickup': return `${formatDuration(eta)} ETA`;
      case 'arrived': return 'Wait for rider';
      case 'en_route': return `${formatDuration(eta)} to destination`;
      default: return 'Scanning for rides';
    }
  };

  return (
    <div className="driver-nav-bar">
      <div className="driver-nav-instruction">
        <div className="driver-nav-icon-wrap">
          {state === 'to_pickup' && <FaUser />}
          {state === 'arrived' && <FaMapMarkerAlt />}
          {state === 'en_route' && <FaRoad />}
        </div>
        <div className="driver-nav-text">
          <div className="driver-nav-main">{getInstruction()}</div>
          <div className="driver-nav-sub">{getSubtext()}</div>
        </div>
      </div>
      
      {state === 'arrived' && onPickupAction && (
        <button className="driver-nav-action-btn start-trip-btn" onClick={onPickupAction}>
          <FaPlay /> Start trip
        </button>
      )}
    </div>
  );
}

function EarningsBar({ today }) {
  return (
    <div className="driver-earnings-widget">
      <div className="driver-earnings-main">
        <span className="driver-earnings-label">Today's Earnings</span>
        <span className="driver-earnings-value">₦{today.earnings.toLocaleString()}</span>
      </div>
      <div className="driver-stats-grid">
        <div className="driver-stat-item">
          <FaRoad className="driver-stat-icon" />
          <div className="driver-stat-content">
            <span className="driver-stat-val">{today.trips}</span>
            <span className="driver-stat-lab">Trips</span>
          </div>
        </div>
        <div className="driver-stat-item">
          <FaClock className="driver-stat-icon" />
          <div className="driver-stat-content">
            <span className="driver-stat-val">{formatDuration(today.onlineSeconds)}</span>
            <span className="driver-stat-lab">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveTripDashboard({ state, trip, eta, onGoOffline }) {
  if (!trip) return null;
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = () => {
    const text = chatMsg.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { from: 'driver', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatMsg('');
  };

  const handleChatKey = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="driver-active-panel">
      <div className="driver-active-rider-card">
        <div className="driver-active-rider-avatar">
          <FaUser />
        </div>
        <div className="driver-active-rider-info">
          <div className="driver-active-rider-name">{trip.riderName}</div>
          <div className="driver-active-rider-rating">
            <FaStar /> {trip.riderRating} · {trip.distance}
          </div>
        </div>
        <div className="driver-active-actions">
          <button className="driver-icon-btn" onClick={() => window.open(`tel:${trip.phone?.replace(/\s/g, '')}`)} title="Call rider"><FaPhone /></button>
          <button className="driver-icon-btn" onClick={() => setChatOpen((o) => !o)} title="Chat with rider"><FaCommentDots /></button>
        </div>
      </div>

      {chatOpen && (
        <div className="driver-chat-box">
          <div className="driver-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`driver-chat-msg ${msg.from === 'driver' ? 'sent' : 'received'}`}>
                <div className="driver-chat-bubble">{msg.text}</div>
                <div className="driver-chat-time">{msg.time}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="driver-chat-input-row">
            <input
              className="driver-chat-input"
              placeholder="Type a message..."
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              onKeyDown={handleChatKey}
            />
            <button className="driver-chat-send" onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      <div className="driver-trip-timeline">
        <div className={`driver-timeline-item ${state === 'to_pickup' || state === 'arrived' ? 'active' : 'completed'}`}>
          <div className="driver-timeline-node pickup" />
          <div className="driver-timeline-content">
            <div className="driver-timeline-label">PICKUP</div>
            <div className="driver-timeline-value">{trip.pickup}</div>
          </div>
        </div>
        <div className="driver-timeline-connector" />
        <div className={`driver-timeline-item ${state === 'en_route' ? 'active' : ''}`}>
          <div className="driver-timeline-node dropoff" />
          <div className="driver-timeline-content">
            <div className="driver-timeline-label">DROPOFF</div>
            <div className="driver-timeline-value">{trip.dropoff}</div>
          </div>
        </div>
      </div>

      <div className="driver-trip-metrics">
        <div className="driver-metric">
          <span className="driver-metric-label">{state === 'en_route' ? 'DROPOFF ETA' : 'PICKUP ETA'}</span>
          <span className="driver-metric-value">{formatDuration(eta)}</span>
        </div>
        <div className="driver-metric">
          <span className="driver-metric-label">EST. EARNING</span>
          <span className="driver-metric-value gold">₦{trip.fare.toLocaleString()}</span>
        </div>
      </div>

      {state === 'arrived' && (
        <div className="driver-status-card arrived">
          <FaCheckCircle className="driver-status-icon" />
          <div className="driver-status-text">
            <h4>You've arrived</h4>
            <p>Wait for rider to enter vehicle</p>
          </div>
        </div>
      )}

      <button className="driver-go-offline-btn" onClick={onGoOffline} style={{ marginTop: 'auto' }}>
        <FaStop /> {state === 'arrived' ? 'Cancel Trip' : 'Go offline'}
      </button>
    </div>
  );
}

function IncomingRideCard({ request, onAccept, onDecline, timeLeft }) {
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
            <div className="incoming-ride-rider-name">{request.riderName}</div>
            <div className="incoming-ride-rider-rating">
              <FaStar /> {request.riderRating}
            </div>
          </div>
          <div className="incoming-ride-fare">₦{request.fare.toLocaleString()}</div>
        </div>
        <div className="incoming-ride-locations">
          <div className="incoming-ride-location">
            <div className="incoming-ride-dot pickup" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 700 }}>PICKUP</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{request.pickup}</div>
            </div>
          </div>
          <div className="incoming-ride-location">
            <div className="incoming-ride-dot dropoff" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 700 }}>DROPOFF</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{request.dropoff}</div>
            </div>
          </div>
        </div>
        <div className="incoming-ride-actions">
          <button className="incoming-ride-decline" onClick={onDecline}>
            Decline
          </button>
          <button className="incoming-ride-accept" onClick={onAccept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

function TripCompleteCard({ trip, today, onAcceptNext, onGoOffline }) {
  return (
    <div className="trip-complete-panel">
      <div className="trip-complete-header">
        <div className="trip-complete-check">
          <FaCheck />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Trip complete</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>{trip.riderName} dropped off</p>
      </div>

      <div className="trip-complete-earnings">
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>Total Earning</span>
        <span className="trip-complete-amount">₦{trip.fare.toLocaleString()}</span>
      </div>

      <div className="trip-complete-details">
        <div className="trip-complete-detail">
          <span>Distance</span>
          <span>{trip.distance}</span>
        </div>
        <div className="trip-complete-detail">
          <span>Duration</span>
          <span>{trip.duration} min</span>
        </div>
        <div className="trip-complete-detail">
          <span>Net Payout (85%)</span>
          <span style={{ color: 'var(--color-gold)' }}>₦{Math.round(trip.fare * 0.85).toLocaleString()}</span>
        </div>
      </div>

      <div className="trip-complete-total">
        <div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700' }}>TODAY'S TOTAL</div>
          <div className="trip-complete-total-value">₦{today.earnings.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '700' }}>TRIPS</div>
          <div className="trip-complete-total-value">{today.trips}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', padding: '24px' }}>
        <button className="trip-complete-btn secondary" onClick={onGoOffline}>
          <FaStop /> Go offline
        </button>
        <button className="trip-complete-btn primary" onClick={onAcceptNext}>
          <FaRedo /> Ready for next
        </button>
      </div>
    </div>
  );
}

function getRandomRequest() {
  return RIDE_REQUESTS[Math.floor(Math.random() * RIDE_REQUESTS.length)];
}

export default function DrivePortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [driverState, setDriverState] = useState('offline');
  const [driverPos, setDriverPos] = useState(LAGOS_CENTER);
  const [driverHeading, setDriverHeading] = useState(0);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [eta, setEta] = useState(0);
  const [todayStats, setTodayStats] = useState({ earnings: 0, trips: 0, onlineSeconds: 0 });
  const [currentRequest, setCurrentRequest] = useState(null);
  const [incomingTimer, setIncomingTimer] = useState(15);
  const [completedTrip, setCompletedTrip] = useState(null);
  const [userCoords, setUserCoords] = useState(null);

  const animRef = useRef(null);
  const posRef = useRef(driverPos);
  const headingRef = useRef(0);
  const onlineStartRef = useRef(null);
  const onlineTickRef = useRef(null);
  const incomingWaitRef = useRef(null);
  const incomingCountdownRef = useRef(null);
  const stateRef = useRef(driverState);
  const tripRef = useRef(null);

  posRef.current = driverPos;
  headingRef.current = driverHeading;
  stateRef.current = driverState;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = [pos.coords.latitude, pos.coords.longitude];
          setUserCoords(c);
          setDriverPos(c);
          posRef.current = c;
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  useEffect(() => {
    if (driverState === 'waiting' && !onlineStartRef.current) {
      onlineStartRef.current = Date.now();
      onlineTickRef.current = setInterval(() => {
        setTodayStats((prev) => ({
          ...prev,
          onlineSeconds: Math.round((Date.now() - onlineStartRef.current) / 1000),
        }));
      }, 1000);

      const delay = 5000 + Math.random() * 10000;
      incomingWaitRef.current = setTimeout(() => {
        if (stateRef.current === 'waiting') {
          const req = getRandomRequest();
          setCurrentRequest(req);
          setDriverState('incoming');
          setIncomingTimer(15);
        }
      }, delay);
    }
    return () => {
      if (incomingWaitRef.current) clearTimeout(incomingWaitRef.current);
      if (onlineTickRef.current) clearInterval(onlineTickRef.current);
    };
  }, [driverState]);

  useEffect(() => {
    if (driverState === 'incoming' && incomingTimer > 0) {
      incomingCountdownRef.current = setTimeout(() => {
        setIncomingTimer((prev) => {
          if (prev <= 1) {
            setCurrentRequest(null);
            setDriverState('waiting');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (incomingCountdownRef.current) clearTimeout(incomingCountdownRef.current);
    };
  }, [driverState, incomingTimer]);

  const clearSimulation = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
  }, []);

  const goOnline = useCallback(() => {
    setDriverState('waiting');
    setCompletedTrip(null);
    setRouteCoords(null);
    setPickupCoords(null);
    setDropoffCoords(null);
    setTodayStats((prev) => ({ ...prev, onlineSeconds: 0 }));
    onlineStartRef.current = null;
  }, []);

  const goOffline = useCallback(() => {
    clearSimulation();
    setDriverState('offline');
    setCurrentRequest(null);
    setRouteCoords(null);
    setPickupCoords(null);
    setDropoffCoords(null);
    setCompletedTrip(null);
    if (onlineStartRef.current) {
      const elapsed = Math.round((Date.now() - onlineStartRef.current) / 1000);
      setTodayStats((prev) => ({ ...prev, onlineSeconds: elapsed }));
      onlineStartRef.current = null;
    }
  }, [clearSimulation]);

  const handleDecline = useCallback(() => {
    setCurrentRequest(null);
    setDriverState('waiting');
  }, []);

  const handleAccept = useCallback(async () => {
    if (!currentRequest) return;
    const req = currentRequest;
    setCurrentRequest(null);
    setPickupCoords(req.pickupCoords);
    setDropoffCoords(req.dropoffCoords);
    setDriverState('to_pickup');
    tripRef.current = req;

    const route = await fetchRoute(posRef.current, req.pickupCoords);
    setRouteCoords(route);
    const distKm = coordDist(posRef.current, req.pickupCoords) * DEG_TO_KM;
    const duration = Math.max(Math.round(distKm / 25 * 60), 8);
    const totalDuration = duration * 1000 / 16;

    let elapsed = 0;
    let startPos = posRef.current;
    let prevPos = posRef.current;

    function tick() {
      elapsed++;
      const t = Math.min(elapsed / totalDuration, 1);
      const eased = 1 - Math.pow(1 - t, 2);

      let newPos;
      if (route && route.length > 1) {
        const segIdx = Math.min(Math.floor(eased * (route.length - 1)), route.length - 2);
        const segT = (eased * (route.length - 1)) - segIdx;
        newPos = lerp(route[segIdx], route[Math.min(segIdx + 1, route.length - 1)], segT);
      } else {
        newPos = lerp(startPos, req.pickupCoords, eased);
      }

      const h = calcHeading(prevPos, newPos);
      prevPos = newPos;
      setDriverPos(newPos);
      setDriverHeading(h);
      setEta(Math.max(0, Math.round((1 - t) * duration)));

      if (t >= 1) {
        setDriverState('arrived');
        setEta(0);
        animRef.current = null;
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
  }, [currentRequest]);

  const handleStartTrip = useCallback(async () => {
    if (!tripRef.current) return;
    const req = tripRef.current;
    setDriverState('en_route');

    const route = await fetchRoute(req.pickupCoords, req.dropoffCoords);
    setRouteCoords(route);
    const distKm = coordDist(req.pickupCoords, req.dropoffCoords) * DEG_TO_KM;
    const duration = Math.max(Math.round(distKm / 30 * 60), 6);
    const totalDuration = duration * 1000 / 16;

    let elapsed = 0;
    let prevPos = posRef.current;

    function tick() {
      elapsed++;
      const t = Math.min(elapsed / totalDuration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      let newPos;
      if (route && route.length > 1) {
        const segIdx = Math.min(Math.floor(eased * (route.length - 1)), route.length - 2);
        const segT = (eased * (route.length - 1)) - segIdx;
        newPos = lerp(route[segIdx], route[Math.min(segIdx + 1, route.length - 1)], segT);
      } else {
        newPos = lerp(req.pickupCoords, req.dropoffCoords, eased);
      }

      const h = calcHeading(prevPos, newPos);
      prevPos = newPos;
      setDriverPos(newPos);
      setDriverHeading(h);
      setEta(Math.max(0, Math.round((1 - t) * duration)));

      if (t >= 1) {
        const trip = tripRef.current;
        setCompletedTrip({ ...trip, duration: Math.round(duration) });
        setTodayStats((prev) => ({ earnings: prev.earnings + trip.fare, trips: prev.trips + 1, onlineSeconds: prev.onlineSeconds }));
        setDriverState('completed');
        setEta(0);
        animRef.current = null;
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
  }, []);

  return (
    <div className="driver-portal">
      <div className="driver-map-area">
        {driverState === 'waiting' ? (
          <MapView
            userCoords={userCoords || driverPos}
            showUserLocation={true}
            pickupCoords={null}
            dropoffCoords={null}
            driverCoords={null}
            routeCoords={null}
            showRoute={false}
          />
        ) : driverState === 'to_pickup' || driverState === 'arrived' ? (
          <MapView
            pickupCoords={driverPos}
            dropoffCoords={pickupCoords}
            driverCoords={driverPos}
            driverHeading={driverHeading}
            routeCoords={routeCoords}
            showRoute={true}
            showUserLocation={false}
          />
        ) : driverState === 'en_route' ? (
          <MapView
            pickupCoords={pickupCoords}
            dropoffCoords={dropoffCoords}
            driverCoords={driverPos}
            driverHeading={driverHeading}
            routeCoords={routeCoords}
            showRoute={true}
            showUserLocation={false}
          />
        ) : (
          <MapView
            userCoords={userCoords || LAGOS_CENTER}
            showUserLocation={true}
            pickupCoords={null}
            dropoffCoords={null}
            driverCoords={null}
            routeCoords={null}
            showRoute={false}
          />
        )}

        {driverState === 'incoming' && currentRequest && (
          <IncomingRideCard
            request={currentRequest}
            onAccept={handleAccept}
            onDecline={handleDecline}
            timeLeft={incomingTimer}
          />
        )}

        {driverState !== 'completed' && driverState !== 'incoming' && driverState !== 'offline' && (
          <DriverNavBar
            state={driverState}
            riderName={currentRequest?.riderName || tripRef.current?.riderName}
            eta={eta}
            showPickupBtn={driverState === 'arrived'}
            onPickupAction={handleStartTrip}
          />
        )}
      </div>

      <div className="driver-sidebar">
        {location.pathname !== '/drive' ? (() => {
          const sub = location.pathname.replace('/drive/', '');
          const onBack = () => navigate('/drive');
          switch (sub) {
            case 'wallet': return <DriverWallet onBack={onBack} />;
            case 'activity': return <DriverActivity onBack={onBack} />;
            case 'ratings': return <DriverRatings onBack={onBack} />;
            case 'profile': return <DriverProfile onBack={onBack} />;
            case 'earnings': return <DriverEarnings onBack={onBack} />;
            case 'help': return <DriverHelp onBack={onBack} />;
            case 'settings': return <DriverSettings onBack={onBack} />;
            default: return null;
          }
        })() : (
        <>
        {driverState === 'offline' && (
          !isDriverOnboarded() ? (
            <DriverOnboarding onComplete={() => window.location.reload()} />
          ) : (
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
                  <div className="driver-off-benefit-icon"><FaCheckCircle /></div>
                  <div className="driver-off-benefit-text">
                    <strong>Keep ~85% of Fares</strong>
                    <span>Industry leading commission rates</span>
                  </div>
                </div>
                <div className="driver-off-benefit">
                  <div className="driver-off-benefit-icon"><FaCheckCircle /></div>
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

              <button
                className="driver-go-online-btn"
                onClick={goOnline}
              >
                <FaCar /> Go Online
              </button>
            </div>
          )
        )}

        {(driverState === 'waiting') && (
          <div className="driver-active-panel">
            <EarningsBar today={todayStats} />
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

        {(driverState === 'to_pickup' || driverState === 'arrived' || driverState === 'en_route') && (
          <ActiveTripDashboard 
            state={driverState} 
            trip={tripRef.current} 
            eta={eta} 
            onGoOffline={goOffline} 
          />
        )}

        {driverState === 'completed' && completedTrip && (
          <TripCompleteCard
            trip={completedTrip}
            today={todayStats}
            onAcceptNext={goOnline}
            onGoOffline={goOffline}
          />
        )}
        </>
        )}
      </div>
    </div>
  );
}
