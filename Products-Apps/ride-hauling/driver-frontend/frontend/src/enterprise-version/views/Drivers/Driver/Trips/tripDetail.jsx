import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Polyline,
  ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import { useUIStore } from '../../../../core/store/useUIStore';
import { useSocket } from '../../../../core/context/SocketContext';
import { useTripDetail, useUpdateRideStatusMutation } from '../../../../core/hooks/useBookingHooks';
import FloatingChatPanel from '../Chat/FloatingChatPanel';
import moment from 'moment';
import './TripDetail.css';

// Custom Marker Icons
const carIcon = new L.Icon({
  iconUrl: '/markcar.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const { socket, isConnected, setTrackingRideId } = useSocket();

  const { data: trip, isLoading, refetch } = useTripDetail(id);
  const { mutate: updateStatus, isPending: updatingStatus } = useUpdateRideStatusMutation();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [passengerLocation, setPassengerLocation] = useState(null);
  const [passengerTrail, setPassengerTrail] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Sync with global socket and join ride room
  useEffect(() => {
    if (socket && id) {
      socket.emit('join-ride', { rideId: id });
      if (setTrackingRideId) setTrackingRideId(id);

      const handlePassengerMove = (pos) => {
        if (pos.rideId === id) {
          const loc = { lat: pos.lat, lng: pos.lng };
          setPassengerLocation(loc);
          setPassengerTrail(prev => [...prev, [pos.lat, pos.lng]]);
        }
      };

      socket.on('passengerLocationUpdate', handlePassengerMove);
      
      return () => {
        socket.off('passengerLocationUpdate', handlePassengerMove);
        if (setTrackingRideId) setTrackingRideId(null);
      };
    }
  }, [socket, id, setTrackingRideId]);

  // Handle local location for map marker (global socket sends it in background)
  useEffect(() => {
     if (navigator.geolocation) {
         const watchId = navigator.geolocation.watchPosition((pos) => {
             setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
         });
         return () => navigator.geolocation.clearWatch(watchId);
     }
  }, []);

  const handleStatusUpdate = (newStatus) => {
    if (newStatus === 'COMPLETED' && trip.ride_category === 'courier') {
       setShowOtpModal(true);
       return;
    }
    updateStatus({ ride_id: id, status: newStatus }, {
      onSuccess: () => {
        addToast(`Trip status updated to: ${newStatus}`, 'success');
        refetch();
        if (newStatus === 'COMPLETED') {
           navigate('/dashboard');
        }
      },
      onError: (err) => {
        addToast(err.response?.data?.error || 'Update failed', 'danger');
      }
    });
  };

  const handleStopUpdate = async (stopId, action) => {
    try {
      const { data } = await apiClient.post('/courier/stop-status', {
        ride_id: id,
        stop_id: stopId,
        action
      });
      addToast('Stop status updated', 'success');
      refetch();
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'danger');
    }
  };

  const verifyOtpAndComplete = async () => {
    setVerifyingOtp(true);
    try {
      await apiClient.post('/rides/verify-completion', {
        ride_id: id,
        code: otpValue
      });
      // If code is valid, proceed to complete
      handleStatusUpdate('COMPLETED');
      setShowOtpModal(false);
    } catch (err) {
      addToast('Invalid OTP. Please check with the receiver.', 'danger');
    } finally {
      setVerifyingOtp(false);
    }
  };

  if (isLoading) return <div className="p-40 text-center"><div className="app-loader__spinner"></div></div>;
  if (!trip) return <div className="p-40 text-center text-white">Trip not found.</div>;

  const pickupCoords = [trip.pickup_location.coordinates[1], trip.pickup_location.coordinates[0]];
  const destCoords = [trip.destination_location.coordinates[1], trip.destination_location.coordinates[0]];

  // Use the live passenger coordinates if available, otherwise fallback to static pickup location
  const actualPassengerCoords = passengerLocation ? [passengerLocation.lat, passengerLocation.lng] : pickupCoords;

  return (
    <div className="trip-execution-container full-map-mode">
      {/* ─────────────────────────────────────────────────────────────────
          FULLSCREEN MAP ENGINE
          ───────────────────────────────────────────────────────────────── */}
      <div className="main-map-layer">
         <MapContainer center={pickupCoords} zoom={15} zoomControl={false} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={actualPassengerCoords} icon={userIcon} />
            <Marker position={destCoords} />
            
            {currentLocation && (
              <Marker position={[currentLocation.lat, currentLocation.lng]} icon={carIcon} />
            )}
            
            {passengerTrail.length > 0 && (
              <Polyline positions={passengerTrail} color="#4CAF50" weight={5} opacity={0.7} lineCap="round" dashArray="5, 10" />
            )}
            
            <Polyline positions={[actualPassengerCoords, destCoords]} color="#FFB800" weight={6} opacity={0.6} dashArray="1, 10" />
            <ZoomControl position="topright" />
         </MapContainer>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          TOP NAVIGATION BAR (Retractable)
          ───────────────────────────────────────────────────────────────── */}
      <div className="trip-top-nav animated fadeInDown">
          <button onClick={() => navigate(-1)} className="nav-back-btn">
              <i className="md md-arrow-back"></i>
          </button>
          <div className="trip-status-status text-center">
              <span className="premium-badge">{trip.status}</span>
              <p className="m-0 font-11 text-muted-dark font-bold uppercase">{isConnected ? 'LIVE TRACKING ON' : 'CONNECTING...'}</p>
          </div>
          <button className="nav-sos-btn" onClick={() => navigate('/sos')}>SOS</button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          FLOATING CHAT PANEL
          ───────────────────────────────────────────────────────────────── */}
      <FloatingChatPanel 
        rideId={id} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      {/* ─────────────────────────────────────────────────────────────────
          RETRACTABLE RIDE INFO CARD
          ───────────────────────────────────────────────────────────────── */}
      <div className={`floating-ride-card ${isPanelCollapsed ? 'collapsed' : ''} animated slideInUp`}>
          <div className="card-drag-handle" onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}></div>
          
          <div className="card-content">
              <div className="flex-row justify-between items-center m-b-20">
                  <div className="flex-row items-center">
                      <img src="/avatar-1.jpg" className="rider-avatar" alt="Rider" />
                      <div>
                          <h4 className="m-0 font-bold">{trip.user_name || 'Guest Rider'}</h4>
                          <p className="m-0 font-11 text-muted-dark"><i className="md md-star text-warning"></i> 4.9 • {trip.payment_method}</p>
                      </div>
                  </div>
                  <div className="fare-box">
                      <h3 className="m-0 font-bold">{trip.currency_symbol || '₦'}{trip.fare}</h3>
                      <p className="m-0 font-10 uppercase text-muted">Est. Fare</p>
                  </div>
              </div>

              {trip.ride_category === 'courier' && trip.delivery_meta && (
                <div className="delivery-meta-banner mb-3 p-2 d-flex gap-3 align-items-center" style={{ background: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <div className="meta-item">
                    <span className="d-block font-9 text-muted uppercase">Package</span>
                    <span className="font-12 fw-bold">{trip.delivery_meta.package_type}</span>
                  </div>
                  <div className="meta-item">
                    <span className="d-block font-9 text-muted uppercase">Weight</span>
                    <span className="font-12 fw-bold text-warning">{trip.delivery_meta.weight_kg} kg</span>
                  </div>
                  {trip.delivery_meta.is_fragile && (
                    <div className="meta-item ms-auto">
                      <span className="badge bg-danger-subtle text-danger" style={{ fontSize: '10px' }}>💎 FRAGILE</span>
                    </div>
                  )}
                </div>
              )}

              {trip.ride_category === 'courier' && trip.status === 'STARTED' && (
                <div className="delivery-checklist mb-4">
                  <h6 className="font-12 fw-bold mb-3 uppercase tracking-wider text-muted">Delivery Checklist</h6>
                  {trip.stop_points.map((stop, idx) => (
                    <div key={stop._id} className="checklist-item d-flex align-items-center gap-3 mb-2 p-2" style={{ background: stop.rider_completed ? '#f0fff0' : '#fff', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                      <div className="stop-num font-10 fw-bold" style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{idx + 1}</div>
                      <div className="stop-addr flex-1 font-11 text-truncate">{stop.address}</div>
                      {!stop.rider_completed ? (
                        <button 
                          className="btn btn-xs btn-success py-1 px-2 font-10 fw-bold" 
                          style={{ borderRadius: '6px' }}
                          onClick={() => handleStopUpdate(stop._id, 'RIDER_DONE')}
                        >
                          DONE
                        </button>
                      ) : (
                        <span className="text-success font-10 fw-bold">✓ READY</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="location-track m-b-25">
                  <div className="loc-step">
                      <div className="dot green"></div>
                      <div className="loc-text">{trip.pickup_address || 'Pickup Point'}</div>
                  </div>
                  <div className="loc-step">
                      <div className="dot yellow"></div>
                      <div className="loc-text">{trip.destination_address || 'Destination'}</div>
                  </div>
              </div>

              <div className="action-row flex-row gap-2">
                  <button onClick={() => setIsChatOpen(true)} className="btn-utility flex-1">
                      <i className="md md-chat m-r-5"></i> Chat
                  </button>
                  <button className="btn-utility flex-1">
                      <i className="md md-phone m-r-5"></i> Call
                  </button>
              </div>

              <div className="m-t-20">
                  {trip.status === 'ACCEPTED' && (
                    <button onClick={() => handleStatusUpdate('ARRIVED')} className="btn-primary-action" disabled={updatingStatus}>
                        {updatingStatus ? 'Updating...' : 'I HAVE ARRIVED'}
                    </button>
                  )}
                  {trip.status === 'ARRIVED' && (
                    <button onClick={() => handleStatusUpdate('STARTED')} className="btn-primary-action success" disabled={updatingStatus}>
                        {updatingStatus ? 'Starting...' : 'START TRIP'}
                    </button>
                  )}
                  {trip.status === 'STARTED' && (
                    <button onClick={() => handleStatusUpdate('COMPLETED')} className="btn-primary-action completed" disabled={updatingStatus}>
                        {updatingStatus ? 'Completing...' : 'COMPLETE TRIP'}
                    </button>
                  )}
              </div>
          </div>
      </div>

      {showOtpModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="otp-card bg-white p-4" style={{ borderRadius: '24px', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
            <div className="font-40 mb-3">🔑</div>
            <h4 className="fw-bold mb-2">Delivery Verification</h4>
            <p className="text-muted font-13 mb-4">Please enter the 4-digit OTP provided by the receiver to complete the delivery.</p>
            <input 
              type="text" 
              className="form-control text-center font-24 fw-bold mb-4" 
              placeholder="0 0 0 0" 
              maxLength={4}
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              style={{ letterSpacing: '8px', height: '60px', borderRadius: '12px' }}
            />
            <div className="d-flex gap-2">
              <button className="btn btn-light flex-1 py-3 fw-bold" onClick={() => setShowOtpModal(false)}>CANCEL</button>
              <button className="btn btn-warning flex-1 py-3 fw-bold" onClick={verifyOtpAndComplete} disabled={verifyingOtp}>
                {verifyingOtp ? 'VERIFYING...' : 'VERIFY & END'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetail;
