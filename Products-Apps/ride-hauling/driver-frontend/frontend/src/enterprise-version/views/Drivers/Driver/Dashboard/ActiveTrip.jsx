import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../../../core/context/SocketContext';
import SystemOverlay from './SystemOverlay';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import { useUIStore } from '../../../../core/store/useUIStore';
import { useTripDetail, useUpdateRideStatusMutation, useVerifyCompletionMutation, useSettlePaymentMutation } from '../../../../core/hooks/useBookingHooks';
import { soundService } from '../../../../core/services/SoundService';
import './ActiveTrip.css';

/* ─── Custom Icons ───────────────────────────────────────────── */
const carIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="marker-pin driver-pin">🚖</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const passengerIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="marker-pin passenger-pin">👤</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const pickupIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="marker-pin pickup-pin">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

/* ─── Map Helpers ────────────────────────────────────────────── */
const MapAutoFit = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const validPoints = points.filter(p => p && p[0] && p[1]);
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [points, map]);
  return null;
};

const ActiveTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, setTrackingRideId, emit } = useSocket();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const { data: ride, isLoading } = useTripDetail(id);
  const { mutate: updateStatus } = useUpdateRideStatusMutation();

  const [driverPos, setDriverPos] = useState(null);
  const [passengerPos, setPassengerPos] = useState(null);
  const [rideStatus, setRideStatus] = useState('ACCEPTED');
  const [showChat, setShowChat] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [startCode, setStartCode] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle, ringing, active
  const [isCardOpen, setIsCardOpen] = useState(true);
  const [completionSummary, setCompletionSummary] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showCashWizard, setShowCashWizard] = useState(false);
  const [completionCode, setCompletionCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [paymentAcknowledge, setPaymentAcknowledge] = useState(false);
  const [paymentSettledData, setPaymentSettledData] = useState(null);

  const chatEndRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const STUN_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // 1. Initial State & Socket Setup
  useEffect(() => {
    if (id) {
      setTrackingRideId(id);
      socket?.emit('join-ride', { rideId: id });
    }
    return () => setTrackingRideId(null);
  }, [id, socket]);

  useEffect(() => {
    if (ride) {
      setRideStatus(ride.status);
    }
  }, [ride]);

  // 2. Real-time Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('passengerLocationUpdate', (data) => {
      if (data.rideId === id) {
        setPassengerPos([data.lat, data.lng]);
      }
    });

    socket.on('new-chat-message', (msg) => {
      setChatMessages(prev => {
        const updated = [...prev, {
          from: msg.sender_role === 'driver' ? 'me' : 'passenger',
          text: msg.message,
          ts: msg.createdAt
        }];
        return updated;
      });
      // Auto-scroll
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });

    socket.on('incoming-call', (data) => {
      if (data.rideId === id) {
        setIncomingCall(data);
        setShowVoiceCall(true);
        setCallStatus('ringing');
        soundService.playCallBeep();
      }
    });

    socket.on('rideStatusUpdated', (data) => {
      if (data.ride_id === id) {
        if (data.status === 'COMPLETED') {
          soundService.playCoin();
          setCompletionSummary(data);
          setShowCompletionModal(true);
          setShowCashWizard(false);
        } else if (data.status === 'PENDING_SETTLEMENT') {
          setShowCashWizard(true);
          addToast('Trip ended. Waiting for payment settlement.', 'info');
        }
      }
    });

    socket.on('paymentSettled', (data) => {
      setPaymentSettledData(data);
      setShowCashWizard(false);
      setCompletionSummary(data);
      setShowCompletionModal(true);
      soundService.playCoin();
      addToast(`Payment received! ${data.currency_symbol || '₦'}${data.driver_credit || ''} credited to your wallet.`, 'success');
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

    // ⚠️ Only register call-ended ONCE (duplicate was causing double-cleanup calls)
    socket.on('call-ended', () => {
      setCallStatus('idle');
      setShowVoiceCall(false);
      soundService.stopCallBeep();
      handleEndCall(false);
    });

    return () => {
      socket.off('passengerLocationUpdate');
      socket.off('new-chat-message');
      socket.off('incoming-call');
      socket.off('rideStatusUpdated');
      socket.off('paymentSettled');
      socket.off('call-accepted');
      socket.off('ice-candidate');
      socket.off('call-ended');
    };
  }, [socket, id]);


  // 3. Driver GPS Watcher
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn(err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 4. Lifecycle Actions
  const handleUpdateStatus = (newStatus, payload = {}) => {
    updateStatus({ ride_id: id, status: newStatus, ...payload }, {
      onSuccess: () => {
        setRideStatus(newStatus);
        addToast(`Status updated: ${newStatus}`, 'success');
        // We stay on the page if completed to show summary modal (handled by socket event)
      },
      onError: (err) => addToast(err.response?.data?.error || 'Update failed', 'danger')
    });
  };

  const handleStartTrip = () => {
    handleUpdateStatus('STARTED', { start_code: startCode });
    setShowStartModal(false);
  };

  const { mutate: verifyCode } = useVerifyCompletionMutation();
  const { mutate: settlePayment } = useSettlePaymentMutation();

  const handleEndTrip = () => {
    if (!completionCode) {
      addToast('Please enter the passenger\'s completion code', 'warning');
      return;
    }
    setIsVerifyingCode(true);
    verifyCode({ ride_id: id, code: completionCode }, {
      onSuccess: () => {
        handleUpdateStatus('COMPLETED');
        setIsVerifyingCode(false);
      },
      onError: () => setIsVerifyingCode(false)
    });
  };

  const handleAcknowledgeCash = () => {
    settlePayment({ ride_id: id, payment_type: 'CASH', driver_acknowledged: true }, {
      onSuccess: () => {
        setShowCashWizard(false);
        addToast('Payment acknowledged. Ride finalized.', 'success');
      }
    });
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    emit('chat-message', {
      ride_id: id,
      sender: user.id || user._id,
      message: chatInput,
      sender_role: 'driver'
    });
    setChatInput('');
  };

  const handleEndCall = (shouldEmit = true) => {
    if (shouldEmit) emit('end-call', { rideId: id });
    setShowVoiceCall(false);
    setCallStatus('idle');
    setIncomingCall(null);
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

  const acceptCall = async () => {
    if (!socket || !incomingCall) return;
    setCallStatus('active');
    soundService.stopCallBeep();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection(STUN_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          emit('ice-candidate', { rideId: id, candidate: event.candidate });
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
        emit('accept-call', { rideId: id, answer });
      }
    } catch (err) {
      console.error('Error accepting WebRTC call:', err);
      addToast('Microphone permission denied.', 'danger');
      handleEndCall();
    }
  };

  const initiateCall = async () => {
    setCallStatus('ringing');
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
          emit('ice-candidate', { rideId: id, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      emit('initiate-call', { rideId: id, callerName: user.firstname, offer });
    } catch (err) {
      console.error('Error starting WebRTC call:', err);
      addToast('Microphone permission denied.', 'danger');
      handleEndCall();
    }
  };

  if (isLoading) return <div className="loading-screen">Loading Trip Details...</div>;

  const points = [driverPos, passengerPos];
  if (ride?.pickup_location) points.push([ride.pickup_location.coordinates[1], ride.pickup_location.coordinates[0]]);
  if (ride?.destination_location) points.push([ride.destination_location.coordinates[1], ride.destination_location.coordinates[0]]);

  return (
    <div className="active-trip-root">
      <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />
      <SystemOverlay />
      <div className="trip-map-container">
        <MapContainer center={driverPos || [6.5244, 3.3792]} zoom={15} zoomControl={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          
          {driverPos && <Marker position={driverPos} icon={carIcon} />}
          
          {passengerPos && (
            <Marker position={passengerPos} icon={passengerIcon}>
              <Popup className="passenger-popup border-0 shadow-lg rounded-3">
                <div className="text-center p-1">
                  <strong className="d-block mb-2 font-14 text-dark">{ride?.passenger_name || 'Passenger'}</strong>
                  <div className="d-flex gap-2 justify-content-center">
                    <button className="btn btn-sm btn-dark rounded-pill px-3 shadow-sm" onClick={(e) => { e.stopPropagation(); setShowChat(true); }}>
                      <i className="md md-chat"></i> Chat
                    </button>
                    <button className="btn btn-sm btn-success rounded-pill px-3 shadow-sm" onClick={(e) => { e.stopPropagation(); initiateCall(); }}>
                      <i className="md md-phone"></i> Call
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route to Passenger (Before Pickup) */}
          {driverPos && passengerPos && (rideStatus === 'ACCEPTED' || rideStatus === 'ARRIVED') && (
            <Polyline positions={[driverPos, passengerPos]} color="#2196F3" weight={4} dashArray="10, 10" />
          )}

          {/* Route to Destination (During Trip) */}
          {driverPos && ride?.destination_location && rideStatus === 'STARTED' && (
            <Polyline 
              positions={[driverPos, [ride.destination_location.coordinates[1], ride.destination_location.coordinates[0]]]} 
              color="#4CAF50" 
              weight={5} 
            />
          )}

          {ride?.pickup_location && (
            <Marker position={[ride.pickup_location.coordinates[1], ride.pickup_location.coordinates[0]]} icon={pickupIcon} />
          )}
          
          {ride?.destination_location && (
            <Marker position={[ride.destination_location.coordinates[1], ride.destination_location.coordinates[0]]} icon={pickupIcon} />
          )}
          
          <MapAutoFit points={points} />
        </MapContainer>

        {/* Draggable Trip Details Card */}
        {ride && (
          <motion.div 
            drag 
            dragConstraints={{ left: -100, right: 100, top: 0, bottom: 500 }} 
            className="floating-trip-card glass shadow-lg p-3 rounded-4"
            style={{ position: 'absolute', top: 120, right: 20, zIndex: 1000, width: 320, cursor: 'grab', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
          >
            <div className="d-flex justify-content-between align-items-center" onClick={() => setIsCardOpen(!isCardOpen)} style={{ cursor: 'pointer' }}>
              <h6 className="m-0 fw-bold d-flex align-items-center gap-2"><i className="md md-map"></i> Trip Details</h6>
              <i className={`md md-expand-${isCardOpen ? 'less' : 'more'}`}></i>
            </div>
            
            <AnimatePresence>
              {isCardOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <hr className="my-2" />
                  <div className="d-flex gap-3 mb-2">
                     <div className="circle-dot bg-primary mt-1" style={{width: 12, height: 12, borderRadius: '50%'}}></div>
                     <div><small className="text-muted d-block" style={{fontSize: 10, fontWeight: 800}}>PICKUP</small><span className="font-12 fw-700" style={{fontSize: 13}}>{ride?.pickup_location?.address || 'Pickup Point'}</span></div>
                  </div>
                  <div className="d-flex gap-3 mb-3">
                     <div className="circle-dot bg-dark mt-1" style={{width: 12, height: 12, borderRadius: '50%'}}></div>
                     <div><small className="text-muted d-block" style={{fontSize: 10, fontWeight: 800}}>DESTINATION</small><span className="font-12 fw-700" style={{fontSize: 13}}>{ride?.destination_location?.address || 'Destination Point'}</span></div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded-3">
                     <span className="fw-bold font-12 text-muted">Estimated Fare</span>
                     <span className="fw-900 text-dark font-16">{ride?.currency_symbol || '₦'}{ride?.local_fare || ride?.fare || '0.00'}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── TOP HUD ─────────────────────────────────────────────── */}
      <div className="trip-hud-top glass">
        <div className="hud-content">
          <div className="passenger-info">
            <img src="/assets/images/avatar.png" alt="Passenger" className="avatar-sm" />
            <div>
              <h6>Rider Found</h6>
              <p>{ride?.passenger_name || 'Valued Passenger'}</p>
            </div>
          </div>
          <div className="trip-status-badge">{rideStatus}</div>
        </div>
      </div>

      {/* ── BOTTOM ACTIONS ──────────────────────────────────────── */}
      <div className="trip-actions-bottom glass">

        {/* ─── ARRIVED CARD (matches user 'Meet at pick-up' style) ─── */}
        {rideStatus === 'ACCEPTED' && (
          <motion.div
            className="uber-premium-card arrived-card"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 24, stiffness: 200 }}
          >
            <div className="uber-card-header">
              <div className="uber-pickup-text-wrap">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFB800, #FF8C00)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(255,184,0,0.4)', flexShrink: 0
                  }}>
                    <i className="md md-place" style={{ color: '#fff', fontSize: 22 }}></i>
                  </div>
                  <div>
                    <h3 className="uber-meet-title" style={{ marginBottom: 2 }}>On the way to pick up</h3>
                    <p className="uber-meet-subtitle">{ride?.passenger_name || 'Passenger'}</p>
                  </div>
                </div>
                {ride?.pickup_location?.address && (
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, paddingLeft: 50 }}>
                    {ride.pickup_location.address}
                  </p>
                )}
              </div>
              <div className="uber-eta-badge">
                <span className="uber-eta-unit" style={{ fontSize: 10 }}>ETA</span>
                <span className="uber-eta-number">{ride?.eta || '~'}</span>
                <span className="uber-eta-unit">min</span>
              </div>
            </div>

            <div className="uber-divider" />

            <div className="uber-actions-row">
              <div className="uber-chat-input-pill" onClick={() => setShowChat(true)}>
                <i className="md md-chat" style={{ marginRight: 6, color: 'var(--color-primary)' }}></i>
                <span className="uber-chat-placeholder">Message {ride?.passenger_name?.split(' ')[0] || 'passenger'}...</span>
              </div>
              <button className="uber-action-fab" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} onClick={initiateCall} title="Call Passenger">
                <i className="md md-phone" style={{ color: 'var(--color-primary)' }}></i>
              </button>
            </div>

            <button
              className="btn-primary-action"
              style={{ marginTop: 14, width: '100%', borderRadius: 16, padding: '16px 0', fontSize: 16, fontWeight: 800, letterSpacing: 0.5 }}
              onClick={() => handleUpdateStatus('ARRIVED')}
            >
              <i className="md md-check-circle" style={{ marginRight: 8, fontSize: 20 }}></i>
              I Have Arrived
            </button>
          </motion.div>
        )}

        {/* ─── ARRIVED (waiting to start) ─── */}
        {rideStatus === 'ARRIVED' && (
          <motion.div
            className="uber-premium-card arrived-card"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="uber-card-header">
              <div className="uber-pickup-text-wrap">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2ed573, #1a9c4a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(46,213,115,0.4)', flexShrink: 0
                  }}>
                    <i className="md md-person-pin-circle" style={{ color: '#fff', fontSize: 22 }}></i>
                  </div>
                  <div>
                    <h3 className="uber-meet-title" style={{ marginBottom: 2 }}>Arrived at Pickup</h3>
                    <p className="uber-meet-subtitle">Awaiting passenger — enter their 4-digit code</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="uber-divider" />
            <button
              className="btn-primary-action"
              style={{ width: '100%', borderRadius: 16, padding: '16px 0', fontSize: 16, fontWeight: 800 }}
              onClick={() => setShowStartModal(true)}
            >
              <i className="md md-play-arrow" style={{ marginRight: 8, fontSize: 20 }}></i>
              Start Trip
            </button>
          </motion.div>
        )}

        {/* ─── STARTED: Enter completion code ─── */}
        {rideStatus === 'STARTED' && (
          <div className="main-lifecycle-btn">
            <div className="end-trip-flow">
              <input
                type="text"
                maxLength="4"
                placeholder="Enter passenger code"
                className="otp-input-inline"
                value={completionCode}
                onChange={(e) => setCompletionCode(e.target.value)}
              />
              <button className="btn-primary-action complete" onClick={handleEndTrip}>
                {isVerifyingCode ? 'Verifying...' : 'End Trip'}
              </button>
            </div>
          </div>
        )}

        {/* ─── Comm buttons always visible ─── */}
        {rideStatus !== 'ACCEPTED' && (
          <div className="actions-header" style={{ marginTop: 10 }}>
            <div className="comm-buttons" style={{ marginLeft: 'auto' }}>
              <button className="comm-btn chat" onClick={() => setShowChat(true)}>
                <i className="md md-chat"></i>
              </button>
              <button className="comm-btn call" onClick={initiateCall}>
                <i className="md md-phone"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ─────────────────────────────────────────────── */}
      {showStartModal && (<AnimatePresence>
       
          <motion.div className="trip-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="trip-modal-card" initial={{ y: 50 }} animate={{ y: 0 }}>
              <h3>Ready to move?</h3>
              <p>Enter the 4-digit code provided by the passenger (optional).</p>
              <input
                type="text"
                maxLength="4"
                placeholder="0000"
                className="otp-input-inline"
                value={startCode}
                onChange={(e) => setStartCode(e.target.value)}
              />
              <button className="btn-primary-action mt-4 w-full" onClick={handleStartTrip}>
                Verify & Start Trip
              </button>
            </motion.div>
          </motion.div>
      </AnimatePresence>)}

      <AnimatePresence>
        {showVoiceCall && (
              <motion.div className="call-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="call-card">
                  <div className="call-avatar">
                    <img src="/assets/images/avatar.png" alt="Passenger" />
                    {callStatus === 'ringing' && <div className="pulse-ring"></div>}
                  </div>
                  <h4>{ride?.passenger_name || 'Passenger'}</h4>
                  <p>{callStatus === 'ringing' ? (incomingCall ? 'Incoming call...' : 'Calling...') : 'In Conversation'}</p>

                  <div className="call-actions d-flex gap-3 justify-content-center">
                    {incomingCall && callStatus === 'ringing' ? (
                      <>
                        <button className="btn-decline btn-hangup" onClick={() => handleEndCall(true)}>
                          <i className="md md-call-end"></i>
                        </button>
                        <button className="btn-accept btn-pickup-call" onClick={acceptCall} style={{ background: '#2ec4b6', border: 'none', color: '#white', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="md md-phone" style={{ fontSize: '24px', color: '#fff' }}></i>
                        </button>
                      </>
                    ) : (
                      <button className="btn-hangup" onClick={() => handleEndCall(true)}>
                        <i className="md md-call-end"></i>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {showCompletionModal && (
              <motion.div className="trip-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="trip-modal-card payment-summary" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                  <div className="success-icon">💰</div>
                  <h3>Trip Completed</h3>
                  <p className="text-muted">Summary of earnings and payments.</p>

                  <div className="summary-grid">
                    <div className="summary-row">
                      <span>Total Fare:</span>
                      <span className="font-bold">
                        {completionSummary?.currency_symbol || '₦'}
                        {completionSummary?.local_fare || completionSummary?.fare || 0}
                      </span>
                    </div>
                    {completionSummary?.deducted_coins > 0 && (
                      <div className="summary-row text-primary">
                        <span>Coin Discount:</span>
                        <span className="font-bold">
                          - {completionSummary?.currency_symbol || '₦'}
                          {completionSummary.deducted_coins / 2}
                        </span>
                      </div>
                    )}
                    <div className="summary-row highlight">
                      <span>FINAL EARNINGS:</span>
                      <span className="text-2xl font-black text-yellow-500">
                        {completionSummary?.currency_symbol || '₦'}
                        {completionSummary?.balance_to_collect || completionSummary?.local_fare || 0}
                      </span>
                    </div>
                  </div>

                  <p className="remittance-note">
                    <i className="md md-info-outline"></i>
                    Platform fee automatically adjusted.
                  </p>

                  <button className="btn-confirm w-full mt-4" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                  </button>
                </motion.div>
              </motion.div>
            )}

            {showCashWizard && (
              <motion.div className="trip-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="trip-modal-card payment-wizard" initial={{ y: 50 }} animate={{ y: 0 }}>
                  <div className="wizard-icon">💵</div>
                  <h3>Cash Payment Wizard</h3>
                  <p>The passenger chose to pay via <strong>{ride?.payment_method}</strong>.</p>

                  <div className="payment-amount-box">
                    <span className="label">Collect exactly:</span>
                    <span className="amount">{ride?.currency_symbol || '₦'}{ride?.local_fare || ride?.fare}</span>
                  </div>

                  <p className="wizard-instruction">
                    Please confirm that you have received the payment before clicking acknowledge.
                  </p>

                  <div className="modal-btns vertical">
                    <button className="btn-confirm" onClick={handleAcknowledgeCash}>
                      I have received payment
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
        {showChat && (
          <motion.div
            className="chat-panel-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 2000,
              background: 'var(--color-bg)',
              display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 20px',
              background: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <button
                onClick={() => setShowChat(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <i className="md md-arrow-back" style={{ fontSize: 24, color: 'var(--color-text)' }}></i>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), #FF8C00)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, color: '#111', fontSize: 16
                }}>
                  {ride?.passenger_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text)' }}>
                    {ride?.passenger_name || 'Passenger'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Active Ride</div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
              display: 'flex', flexDirection: 'column', gap: 10
            }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 40, fontSize: 14 }}>
                  <i className="md md-chat" style={{ fontSize: 40, display: 'block', marginBottom: 8, opacity: 0.3 }}></i>
                  Start the conversation
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '72%',
                    padding: '10px 14px',
                    borderRadius: m.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: m.from === 'me'
                      ? 'linear-gradient(135deg, #FFB800, #FF8C00)'
                      : 'var(--color-surface)',
                    color: m.from === 'me' ? '#111' : 'var(--color-text)',
                    fontSize: 14, lineHeight: 1.4, fontWeight: 500,
                    boxShadow: 'var(--shadow-sm)',
                    border: m.from === 'me' ? 'none' : '1px solid var(--color-border)'
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px',
              background: 'var(--color-surface)',
              borderTop: '1px solid var(--color-border)'
            }}>
              <input
                placeholder={`Message ${ride?.passenger_name?.split(' ')[0] || 'passenger'}...`}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                style={{
                  flex: 1, border: '1px solid var(--color-border)',
                  borderRadius: 24, padding: '10px 16px',
                  background: 'var(--color-bg)', color: 'var(--color-text)',
                  fontSize: 14, outline: 'none'
                }}
              />
              <button
                onClick={sendChat}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFB800, #FF8C00)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(255,184,0,0.4)'
                }}
              >
                <i className="md md-send" style={{ color: '#111', fontSize: 20 }}></i>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
};

export default ActiveTrip
