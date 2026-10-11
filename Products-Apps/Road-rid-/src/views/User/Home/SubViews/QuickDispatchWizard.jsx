import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LocationSearch from '../../../../core/components/LocationSearch';
import DispatchMap from '../../../../core/components/DispatchMap';
import queens_logo_1 from '../../../../core/routes/User/queens_logo_1.svg';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import { useUIStore } from '../../../../core/store/useUIStore';
import apiClient from '../../../../core/api/apiClient';
import { useSocket } from '../../../../core/context/SocketContext';
import VoiceCallView from '../../Dashboard/VoiceCallView';
import { soundService } from '../../../../core/services/SoundService';

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const QuickDispatchWizard = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: Setup, 2: Tracking
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const user = useAuthStore(state => state.user);
  const { addToast } = useUIStore();
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [packageMeta, setPackageMeta] = useState({
    type: 'Parcel', // Document, Parcel, Fragile
    weight: 1, // kg
    isFragile: false,
    receiverPhone: '',
    deliveryType: 'ASAP', // ASAP, Scheduled
    scheduledDate: '',
    scheduledTime: ''
  });
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [shake, setShake] = useState(0);
  const [distance, setDistance] = useState(0);
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [currency, setCurrency] = useState('₦');
  const [exchangeRate, setExchangeRate] = useState(1500);
  const [pricing, setPricing] = useState({
    baseFare: 0.50,
    perKm: 0.12,
    perMin: 0.03,
    minFare: 1.00
  });

  const addStop = () => {
    setItineraries([...itineraries, { id: Date.now(), address: '', lat: 6.5244, lng: 3.3792, status: 'PENDING', verified: false, riderCompleted: false }]);
    setShake(prev => prev + 1);
  };

  const removeStop = (id) => {
    setItineraries(itineraries.filter(item => item.id !== id));
  };

  const updateStop = (id, address, coords) => {
    setItineraries(itineraries.map(item => 
      item.id === id ? { ...item, address, ...(coords || {}) } : item
    ));
  };

  useEffect(() => {
    const fetchCurrencyInfo = async () => {
      const pickup = itineraries[0];
      if (pickup?.lat) {
        try {
          const { data } = await apiClient.get('/rides/currency-info', {
            params: { lat: pickup.lat, lng: pickup.lng }
          });
          if (data.status === 200) {
            setCurrency(data.data.symbol || data.data.code);
            setExchangeRate(data.data.rate || 1500);
            if (data.data.pricing) {
              setPricing(data.data.pricing);
            }
          }
        } catch (e) {
          console.error("Failed to fetch currency info", e);
        }
      }
    };
    fetchCurrencyInfo();
  }, [itineraries[0]?.lat, itineraries[0]?.lng]);

  useEffect(() => {
    const calculateStats = async () => {
      if (itineraries.length >= 2) {
        let totalDist = 0;
        for (let i = 0; i < itineraries.length - 1; i++) {
          const start = itineraries[i];
          const end = itineraries[i+1];
          if (start.lat && start.lng && end.lat && end.lng) {
            totalDist += haversineKm(start.lat, start.lng, end.lat, end.lng);
          }
        }
        setDistance(totalDist);

        // Local Fare Calculation (USD Base from dynamic pricing)
        const baseUSD = pricing.baseFare;
        const perKmUSD = pricing.perKm;
        const perMinUSD = pricing.perMin;
        const estDurationMin = (totalDist / 35) * 60; // 35km/h for scooters
        let subtotalUSD = baseUSD + (totalDist * perKmUSD) + (estDurationMin * perMinUSD);
        if (subtotalUSD < pricing.minFare) subtotalUSD = pricing.minFare;
        
        // Weight surcharge
        const weight = parseFloat(packageMeta.weight) || 0;
        let extraWeightUSD = 0;
        if (weight > 5) {
          extraWeightUSD = (weight - 5) * 0.1; // $0.1 per extra kg
        }
        
        const fragileSurchargeUSD = packageMeta.isFragile ? 0.5 : 0;
        
        const finalFareUSD = subtotalUSD + extraWeightUSD + fragileSurchargeUSD;
        setEstimatedFare(finalFareUSD * exchangeRate);

        // Try to get accurate quote from backend
        try {
           const payload = {
             itineraries: itineraries.map((it, idx) => {
               if (idx < itineraries.length - 1) {
                 return {
                    pickupCoords: { lat: it.lat, lng: it.lng },
                    destinationCoords: { lat: itineraries[idx+1].lat, lng: itineraries[idx+1].lng },
                    package_meta: packageMeta
                 };
               }
               return null;
             }).filter(Boolean)
           };
           const { data } = await apiClient.post('/rides/multi-stop-quote', payload);
           if (data.status === 200) {
             setEstimatedFare(data.data.total_fare);
             setCurrency(data.data.currency_symbol || data.data.currency || '₦');
             setExchangeRate(data.data.exchange_rate || 1500);
           }
        } catch (e) {}
      }
    };
    calculateStats();
  }, [itineraries, packageMeta, exchangeRate]);

  const handleDispatch = async () => {
    if (itineraries.some(it => !it.address)) {
      addToast("Please fill all delivery points.", "danger");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        passenger_id: user?.id || user?._id,
        pickup_lat: itineraries[0].lat,
        pickup_lng: itineraries[0].lng,
        dest_lat: itineraries[itineraries.length-1].lat,
        dest_lng: itineraries[itineraries.length-1].lng,
        ride_category: 'courier',
        itineraries: itineraries.map(it => ({
          address: it.address,
          lat: it.lat,
          lng: it.lng
        })),
        delivery_meta: {
          package_type: packageMeta.type,
          weight_kg: parseFloat(packageMeta.weight),
          receiver_phone: packageMeta.receiverPhone,
          is_fragile: packageMeta.isFragile,
          delivery_type: packageMeta.deliveryType.toUpperCase(),
          scheduled_at: packageMeta.deliveryType === 'Scheduled' ? `${packageMeta.scheduledDate} ${packageMeta.scheduledTime}` : null
        }
      };

      const { data } = await apiClient.post('/rides/request', payload);
      setActiveRide(data.data.ride);
      addToast("Dispatch initiated! Searching for riders...", "success");
      setStep(2);
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to initiate dispatch", "danger");
    } finally {
      setLoading(false);
    }
  };

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  // Socket & Activity Management
  const { socket } = useSocket();
  const [chatMessages, setChatMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [callStatus, setCallStatus] = useState('idle'); // idle, ringing, active
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !user) return;
    
    socket.on('rideAccepted', (data) => {
      if (data.ride_category === 'courier' || activeRide?._id === data.ride_id) {
        setRiderInfo({
          name: data.driver_name,
          rating: 4.9,
          pos: data.driver_location,
          phone: data.driver_phone
        });
        setStep(2);
        addToast(`Rider ${data.driver_name} has accepted your dispatch!`, "success");
      }
    });

    socket.on('driverLocationUpdate', (data) => {
      if (activeRide?._id === data.ride_id) {
        setRiderInfo(prev => ({ ...prev, pos: data.location }));
      }
    });

    socket.on('courierStopCompletedByRider', (data) => {
      setItineraries(prev => prev.map(it => (it._id === data.stop_id || it.id === data.stop_id) ? { ...it, riderCompleted: true } : it));
      addToast("Rider has completed a stop! Please vet the delivery.", "info");
      soundService.playNotification();
    });

    socket.on('courierStopVettedByUser', (data) => {
      setItineraries(prev => prev.map(it => (it._id === data.stop_id || it.id === data.stop_id) ? { ...it, verified: true, status: 'COMPLETED' } : it));
    });

    socket.on('rideMessageReceived', (msg) => {
      setChatMessages(prev => [...prev, { from: 'rider', text: msg.text, ts: new Date() }]);
      if (!showChat) addToast("New message from rider", "info");
    });

    return () => {
      socket.off('rideAccepted');
      socket.off('driverLocationUpdate');
      socket.off('courierStopCompletedByRider');
      socket.off('courierStopVettedByUser');
      socket.off('rideMessageReceived');
    };
  }, [socket, user, activeRide, showChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChatMessage = () => {
    if (!chatInput.trim() || !socket || !activeRide) return;
    const msg = { from: 'user', text: chatInput, ts: new Date() };
    setChatMessages(prev => [...prev, msg]);
    socket.emit('sendRideMessage', { rideId: activeRide._id, message: chatInput });
    setChatInput('');
  };

  const initiateCall = () => {
    if (!socket || !activeRide) return;
    socket.emit('initiate-call', { rideId: activeRide._id, callerName: user?.firstname || 'User' });
    setCallStatus('ringing');
    soundService.playCallBeep();
  };

  const wizardContent = (
    <>
      {isFullScreen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9998, backdropFilter: 'blur(4px)' }} 
          onClick={toggleFullScreen}
        />
      )}
      
      <div 
        className={`quick-dispatch-wizard ${isFullScreen ? 'full-screen' : ''}`} 
        style={isFullScreen ? {
          position: 'fixed',
          top: '20px',
          left: '20px',
          right: '20px',
          bottom: '20px',
          zIndex: 9999,
          background: 'var(--color-surface)',
          padding: '0',
          borderRadius: '24px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        } : {
          color: 'var(--color-text)',
          position: 'relative'
        }}
      >
        {/* Fullscreen Header */}
        {isFullScreen && (
          <div className="wizard-header d-flex align-items-center justify-content-between p-3 border-bottom bg-white" style={{ borderRadius: '24px 24px 0 0' }}>
            <div className="d-flex align-items-center gap-3">
              <img src={queens_logo_1} alt="Logo" style={{ height: '40px' }} />
              <div className="h5 m-0 fw-bold">Quick Dispatch Tracking</div>
            </div>
            <div className="d-flex gap-2">
              <button 
                onClick={toggleFullScreen}
                className="btn btn-light btn-sm fw-bold px-3"
                style={{ borderRadius: '10px' }}
              >
                Minimize ↙
              </button>
              <button 
                onClick={toggleFullScreen}
                className="btn btn-danger btn-sm fw-bold px-3"
                style={{ borderRadius: '10px' }}
              >
                Close ✕
              </button>
            </div>
          </div>
        )}

        {/* Normal Header (if not fullscreen) */}
        {!isFullScreen && (
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center">
              <button className="btn-back me-3" onClick={onBack} style={{ border: 'none', background: 'none', fontSize: '20px' }}>←</button>
              <h5 className="m-0 fw-bold">Quick Dispatch</h5>
            </div>
            <div className="d-flex align-items-center gap-3">
              <motion.div 
                key={shake}
                animate={shake > 0 ? { x: [-2, 2, -2, 2, 0] } : {}}
                transition={{ duration: 0.4 }}
                onClick={() => setShowItineraryModal(true)}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                 <div className="itinerary-badge-icon" style={{ background: '#FFB800', padding: '8px', borderRadius: '10px', color: 'var(--color-text)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 11l3 3L22 4"></path>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <span style={{ 
                      position: 'absolute', top: '-5px', right: '-5px', 
                      background: '#000', color: '#fff', fontSize: '10px', 
                      fontWeight: '800', width: '18px', height: '18px', 
                      borderRadius: '50%', display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', border: '2px solid #fff' 
                    }}>
                      {itineraries.length}
                    </span>
                 </div>
              </motion.div>
              <button 
                onClick={toggleFullScreen}
                style={{ background: '#eee', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold' }}
              >
                Fullscreen ↗
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Content Area / Map Layer */}
        <div className="wizard-body p-0" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Background Map in Fullscreen */}
          {isFullScreen && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
               <DispatchMap 
                  stops={step === 1 ? itineraries.filter(it => it.address) : itineraries} 
                  riderPosition={step === 2 ? riderInfo.pos : null}
                  handshakeActive={step === 2}
                  center={itineraries[0] ? [itineraries[0].lat, itineraries[0].lng] : [6.5244, 3.3792]}
                  zoom={12}
                />
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div 
              layout
              className={isFullScreen ? 'floating-dispatch-card' : 'standard-dispatch-container p-3'}
              drag={isFullScreen}
              dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }} // Constraints are relative to the parent
              style={isFullScreen ? {
                position: 'absolute',
                top: '40px',
                right: '40px',
                width: '380px',
                maxHeight: 'calc(100% - 80px)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              } : {
                overflowY: 'auto'
              }}
            >
              {isFullScreen && (
                <div className="drag-handle p-2 text-center" style={{ cursor: 'grab', background: 'var(--color-bg)' }}>
                   <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '0 auto' }}></div>
                </div>
              )}
              
              <div className="p-3" style={{ flex: 1, overflowY: 'auto' }}>
                {step === 1 ? (
                  <motion.div key="setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <p className="text-muted small mb-4">Set up your delivery itineraries for the dispatch rider.</p>
                    
                    {/* Map Preview for Setup (only visible in normal mode) */}
                    {!isFullScreen && itineraries.length > 0 && (
                      <div className="map-container mb-4" style={{ height: '180px', borderRadius: '16px', overflow: 'hidden' }}>
                        <DispatchMap 
                          stops={itineraries.filter(it => it.address)} 
                          center={itineraries[0] ? [itineraries[0].lat, itineraries[0].lng] : [6.5244, 3.3792]}
                          zoom={12}
                        />
                      </div>
                    )}

                <div className="itinerary-list mb-4">
                  {itineraries.map((it, index) => (
                    <div key={it.id} className="input-wrapper touched mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="m-0" style={{ fontSize: '11px', fontWeight: '800', color: '#FFB800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {index === 0 ? 'Initial Pickup' : `Stop ${index + 1}`}
                        </label>
                        {itineraries.length > 2 && (
                          <button className="btn-close" onClick={() => removeStop(it.id)} style={{ fontSize: '10px', padding: '0', width: '10px', height: '10px' }}></button>
                        )}
                      </div>
                      <div className="input-field" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        background: 'var(--color-bg)', 
                        borderRadius: '12px', 
                        padding: '12px 16px', 
                        border: '2px solid transparent',
                        transition: 'all 0.3s'
                      }}>
                        {index === 0 ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2.5">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                        )}
                        <LocationSearch 
                          placeholder={index === 0 ? "Enter pickup address" : "Enter delivery address"}
                          value={it.address}
                          onChange={(val) => updateStop(it.id, val)}
                          onLocationSelect={(loc) => updateStop(it.id, it.address, loc)}
                          className="form-input w-100"
                          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', fontWeight: '500' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-outline-warning w-100 mb-4 border-dashed" onClick={addStop} style={{ borderStyle: 'dashed', borderRadius: '12px', color: '#FFB800', borderColor: '#FFB800', fontWeight: '700' }}>
                  + Add Delivery Point
                </button>

                <div className="package-spec-section mb-4 p-3" style={{ background: 'var(--color-bg)', borderRadius: '20px' }}>
                  <label className="mb-3 d-block" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Package Specifications</label>
                  
                  <div className="package-types d-flex gap-2 mb-3">
                    {['Document', 'Parcel', 'Fragile'].map(type => (
                      <button 
                        key={type}
                        className={`btn btn-sm flex-grow-1 ${packageMeta.type === type ? 'btn-dark' : 'btn-light'}`}
                        style={{ borderRadius: '10px', fontSize: '12px', padding: '8px' }}
                        onClick={() => setPackageMeta({ ...packageMeta, type, isFragile: type === 'Fragile' })}
                      >
                        {type === 'Document' ? '📄 ' : type === 'Parcel' ? '📦 ' : '💎 '} {type}
                      </button>
                    ))}
                  </div>

                  <div className="weight-slider mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>Est. Weight</span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#FFB800' }}>{packageMeta.weight} kg</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="10" 
                      step="0.5"
                      value={packageMeta.weight}
                      onChange={(e) => setPackageMeta({ ...packageMeta, weight: e.target.value })}
                      className="w-100"
                      style={{ accentColor: '#FFB800' }}
                    />
                    <p className="text-muted mt-1" style={{ fontSize: '10px' }}>*Max scooter capacity is 10kg</p>
                  </div>

                  <div className="receiver-phone mb-2">
                    <label style={{ fontSize: '11px', fontWeight: '700', marginBottom: '5px' }}>Receiver's Phone</label>
                    <input 
                      type="tel" 
                      className="form-control form-control-sm"
                      placeholder="+234..."
                      value={packageMeta.receiverPhone}
                      onChange={(e) => setPackageMeta({ ...packageMeta, receiverPhone: e.target.value })}
                      style={{ borderRadius: '10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    />
                  </div>
                </div>

                <div className="delivery-time-toggle mb-4 d-flex gap-2">
                  <button 
                    className={`btn btn-sm flex-grow-1 ${packageMeta.deliveryType === 'ASAP' ? 'btn-dark' : 'btn-outline-dark'}`}
                    style={{ borderRadius: '10px' }}
                    onClick={() => setPackageMeta({ ...packageMeta, deliveryType: 'ASAP' })}
                  >
                    ⚡ Instant (ASAP)
                  </button>
                  <button 
                    className={`btn btn-sm flex-grow-1 ${packageMeta.deliveryType === 'Scheduled' ? 'btn-dark' : 'btn-outline-dark'}`}
                    style={{ borderRadius: '10px' }}
                    onClick={() => setPackageMeta({ ...packageMeta, deliveryType: 'Scheduled' })}
                  >
                    📅 Scheduled
                  </button>
                </div>

                <AnimatePresence>
                  {packageMeta.deliveryType === 'Scheduled' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }}
                      className="scheduled-inputs mb-4 overflow-hidden"
                    >
                      <div className="row g-2">
                        <div className="col-6">
                           <div className="p-3 rounded-4" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                             <label className="font-10 text-muted uppercase fw-800 d-block mb-1">Pick-up Date</label>
                             <input 
                               type="date" 
                               className="form-control border-0 bg-transparent p-0 font-13 fw-700" 
                               value={packageMeta.scheduledDate}
                               onChange={(e) => setPackageMeta({...packageMeta, scheduledDate: e.target.value})}
                               style={{ outline: 'none', boxShadow: 'none' }}
                             />
                           </div>
                        </div>
                        <div className="col-6">
                           <div className="p-3 rounded-4" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                             <label className="font-10 text-muted uppercase fw-800 d-block mb-1">Pick-up Time</label>
                             <input 
                               type="time" 
                               className="form-control border-0 bg-transparent p-0 font-13 fw-700" 
                               value={packageMeta.scheduledTime}
                               onChange={(e) => setPackageMeta({...packageMeta, scheduledTime: e.target.value})}
                               style={{ outline: 'none', boxShadow: 'none' }}
                             />
                           </div>
                        </div>
                      </div>
                      <p className="m-0 mt-2 font-10 text-muted text-center italic">※ Rider will arrive within 15 mins of scheduled time.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="fare-summary mb-4 p-3" style={{ background: '#FFB80010', borderRadius: '16px', border: '1px dashed #FFB800' }}>
                   <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Estimated Distance</span>
                        <h6 className="m-0 fw-800">{distance.toFixed(1)} km</h6>
                      </div>
                      <div className="text-end">
                        <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Estimated Fare</span>
                        <h5 className="m-0 fw-900" style={{ color: '#FFB800' }}>{currency}{Math.round(estimatedFare).toLocaleString()}</h5>
                      </div>
                   </div>
                </div>

                <button className="btn-ride enabled w-100" onClick={handleDispatch} disabled={loading} style={{ background: '#000', color: '#fff', padding: '16px', borderRadius: '14px', fontWeight: '700' }}>
                  {loading ? 'Processing...' : 'Initiate Dispatch Rider'}
                </button>
              </motion.div>
                ) : (
                  <motion.div key="tracking" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    {/* Active Tracking Map (only visible in normal mode) */}
                    {!isFullScreen && (
                      <div className="map-container mb-4" style={{ height: '220px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                        <DispatchMap 
                          stops={itineraries} 
                          riderPosition={riderInfo.pos}
                          handshakeActive={true}
                        />
                      </div>
                    )}

                    {/* Rider Info Card */}
                <div className="rider-card mb-4 p-3 d-flex align-items-center gap-3" style={{ background: '#FFB80015', borderRadius: '24px', border: '1px solid #FFB80030', boxShadow: '0 8px 30px rgba(255,184,0,0.1)' }}>
                  <div style={{ fontSize: '32px', background: 'var(--color-surface)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>🛵</div>
                  <div className="flex-grow-1">
                    <h6 className="m-0 fw-800" style={{ letterSpacing: '-0.5px' }}>{riderInfo.name}</h6>
                    <p className="m-0 text-muted small fw-bold">⭐ {riderInfo.rating} • <span className="text-warning">Handshake Active</span></p>
                  </div>
                  <div className="d-flex gap-2">
                     <button onClick={initiateCall} className="btn btn-dark rounded-circle p-0" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                     </button>
                     <button onClick={() => setShowChat(true)} className="btn btn-warning rounded-circle p-0" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFB800', border: 'none' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                     </button>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">Double-Vetting Progress</h6>
                <div className="itinerary-tracking" style={{ maxHeight: isFullScreen ? 'none' : '200px' }}>
                  {itineraries.map((it, index) => (
                    <div key={it.id} className="tracking-item d-flex gap-3 mb-4" style={{ position: 'relative' }}>
                      <div className="step-indicator">
                        <div className={`dot ${it.verified ? 'completed' : it.riderCompleted ? 'rider-done' : ''}`} style={{ 
                          width: '12px', height: '12px', borderRadius: '50%', 
                          background: it.verified ? '#2ed573' : it.riderCompleted ? '#FFB800' : '#ddd',
                          marginTop: '6px',
                          boxShadow: it.riderCompleted && !it.verified ? '0 0 8px #FFB800' : 'none'
                        }}></div>
                        {index < itineraries.length - 1 && (
                          <div className="line" style={{ 
                            width: '2px', height: 'calc(100% + 16px)', 
                            background: it.verified ? '#2ed573' : '#eee',
                            position: 'absolute', left: '5px', top: '18px'
                          }}></div>
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div style={{ maxWidth: '70%' }}>
                            <p className={`m-0 small fw-bold ${it.verified ? 'text-success' : ''}`}>
                              {it.address || 'Point ' + (index + 1)}
                            </p>
                            <div className="d-flex gap-2 mt-1">
                              <span className={`badge ${it.riderCompleted ? 'bg-success' : 'bg-light text-dark'} py-1 px-2`} style={{ fontSize: '8px' }}>
                                {it.riderCompleted ? '✓ RIDER DONE' : 'WAITING FOR RIDER'}
                              </span>
                              <span className={`badge ${it.verified ? 'bg-success' : 'bg-light text-dark'} py-1 px-2`} style={{ fontSize: '8px' }}>
                                {it.verified ? '✓ USER VETTED' : 'WAITING FOR VETTING'}
                              </span>
                            </div>
                          </div>
                          
                          {it.riderCompleted && !it.verified && (
                            <div className="d-flex flex-column gap-2 align-items-end">
                                <button 
                                  className="btn btn-sm btn-warning py-1 px-2 fw-bold animated-pulse" 
                                  style={{ fontSize: '10px', borderRadius: '8px', background: '#FFB800', border: 'none', boxShadow: '0 4px 12px rgba(255,184,0,0.3)' }}
                                  onClick={async () => {
                                    try {
                                      await apiClient.post('/courier/stop-status', {
                                        ride_id: activeRide?._id,
                                        stop_id: it._id || it.id,
                                        action: 'USER_VET'
                                      });
                                      setItineraries(itineraries.map(i => i.id === it.id ? { ...i, verified: true, status: 'COMPLETED' } : i));
                                      addToast("Stop vetted successfully", "success");
                                    } catch (e) {
                                      addToast("Vetting failed", "danger");
                                    }
                                  }}
                                >
                                  ✓ APPROVE DELIVERY
                                </button>
                                <button 
                                  className="btn btn-link p-0 text-danger fw-bold" 
                                  style={{ fontSize: '9px', textDecoration: 'none' }}
                                  onClick={() => addToast("Reported for review", "warning")}
                                >
                                  REPORT ISSUE?
                                </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mock Completion for Demo */}
                <div className="demo-controls mt-4 p-2" style={{ background: 'var(--color-bg)', borderRadius: '12px' }}>
                  <p className="text-center text-muted m-0" style={{ fontSize: '9px' }}>DEMO TOOLS (RIDER SIMULATION)</p>
                  <button 
                    className="btn btn-link w-100 text-warning small p-0"
                    style={{ fontSize: '11px', textDecoration: 'none' }}
                    onClick={() => {
                      const nextPending = itineraries.find(it => !it.riderCompleted);
                      if (nextPending) {
                        setItineraries(itineraries.map(it => it.id === nextPending.id ? { ...it, riderCompleted: true } : it));
                      }
                    }}
                  >
                    Simulate Rider completing Stop
                  </button>
                </div>
               </motion.div>
            )}
            </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <style>{`
          .input-field:focus-within {
            border-color: #FFB800 !important;
            background: #fff !important;
            box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.1);
          }
          
          .btn-ride {
            transition: all 0.2s;
          }
          .btn-ride:hover { background: #333; transform: translateY(-2px); }
          .border-dashed { border-style: dashed !important; }
          
          /* Yellow Scrollbar Styling */
          .wizard-body::-webkit-scrollbar, .itinerary-tracking::-webkit-scrollbar { 
            width: 6px; 
          }
          .wizard-body::-webkit-scrollbar-track, .itinerary-tracking::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .wizard-body::-webkit-scrollbar-thumb, .itinerary-tracking::-webkit-scrollbar-thumb { 
            background: #FFB800; 
            border-radius: 10px; 
          }
          .wizard-body::-webkit-scrollbar-thumb:hover, .itinerary-tracking::-webkit-scrollbar-thumb:hover {
            background: #e6a700;
          }

          .dot.rider-done {
            animation: pulse-yellow 2s infinite;
          }
          @keyframes pulse-yellow {
            0% { box-shadow: 0 0 0 0 rgba(255, 184, 0, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 184, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 184, 0, 0); }
          }
        `}</style>
      </div>

      {/* Itinerary Tabular Modal */}
      <AnimatePresence>
        {showItineraryModal && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowItineraryModal(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="itinerary-modal glass-morphism p-4" 
              style={{ background: 'var(--color-surface)', borderRadius: '24px', width: '100%', maxWidth: '600px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                 <h4 className="m-0 fw-900">Delivery Itinerary</h4>
                 <button className="btn-close" onClick={() => setShowItineraryModal(false)}></button>
              </div>

              <div className="table-responsive">
                <table className="table table-borderless align-middle">
                  <thead style={{ background: 'var(--color-bg)' }}>
                    <tr>
                      <th className="font-11 fw-800 text-muted">STOP</th>
                      <th className="font-11 fw-800 text-muted" style={{ width: '60%' }}>LOCATION (EDITABLE)</th>
                      <th className="font-11 fw-800 text-muted">STATUS</th>
                      <th className="font-11 fw-800 text-muted text-end">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itineraries.map((it, idx) => (
                      <tr key={it.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                        <td><span className="badge rounded-circle bg-dark text-white" style={{ width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{idx + 1}</span></td>
                        <td style={{ minWidth: '300px' }}>
                          <div className="itinerary-edit-wrap p-2 px-3 rounded-4 d-flex align-items-center gap-3" style={{ background: 'var(--color-bg)', border: '1px solid transparent', transition: 'all 0.3s' }}>
                             {idx === 0 ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2.5">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                  <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                             ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2.5">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                             )}
                             <LocationSearch 
                                placeholder={idx === 0 ? "Pickup Location" : idx === itineraries.length - 1 && itineraries.length > 1 ? "Final Destination" : "Delivery Location"}
                                value={it.address}
                                onChange={(val) => updateStop(it.id, val)}
                                onLocationSelect={(loc) => updateStop(it.id, it.address, loc)}
                                className="font-13 fw-700 w-100 border-0 bg-transparent"
                                style={{ outline: 'none', color: 'var(--color-text)' }}
                             />
                          </div>
                          <p className="m-0 font-10 fw-800 text-muted mt-1 uppercase" style={{ letterSpacing: '0.5px' }}>
                             {idx === 0 ? '🛫 Pickup Point' : idx === itineraries.length - 1 && itineraries.length > 1 ? '🏁 Final Destination' : `📍 Stop ${idx + 1}`}
                          </p>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${it.verified ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'}`} style={{ fontSize: '9px' }}>
                            {it.verified ? 'VETTED' : it.riderCompleted ? 'PENDING VET' : 'DRAFT'}
                          </span>
                        </td>
                        <td className="text-end">
                           <button 
                             className="btn btn-light btn-sm text-danger p-1 px-2 rounded-3" 
                             onClick={() => removeStop(it.id)}
                           >
                             <i className="bi bi-trash3-fill" />
                           </button>
                        </td>
                      </tr>
                    ))}
                    {itineraries.length === 0 && (
                      <>
                        {/* Starter Pickup Row */}
                        <tr style={{ borderBottom: '1px solid #f1f1f1' }}>
                          <td><span className="badge rounded-circle bg-secondary text-white" style={{ width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span></td>
                          <td style={{ minWidth: '300px' }}>
                            <div className="itinerary-edit-wrap p-2 px-3 rounded-4 d-flex align-items-center gap-3" style={{ background: 'var(--color-bg)', border: '1px solid transparent' }}>
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2.5">
                                 <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                 <circle cx="12" cy="10" r="3"></circle>
                               </svg>
                               <LocationSearch 
                                  placeholder="Pickup Location"
                                  value=""
                                  onChange={(val) => {
                                    const newIt = { id: 1, address: val, lat: 6.5244, lng: 3.3792, status: 'PENDING', verified: false, riderCompleted: false };
                                    setItineraries([newIt, { id: 2, address: '', lat: 6.5244, lng: 3.3792, status: 'PENDING', verified: false, riderCompleted: false }]);
                                  }}
                                  className="font-13 fw-700 w-100 border-0 bg-transparent"
                                  style={{ outline: 'none' }}
                               />
                            </div>
                            <p className="m-0 font-10 fw-800 text-muted mt-1 uppercase">🛫 Pickup Point</p>
                          </td>
                          <td><span className="badge rounded-pill bg-light text-muted" style={{ fontSize: '9px' }}>DRAFT</span></td>
                          <td className="text-end"></td>
                        </tr>
                        {/* Starter Destination Row */}
                        <tr style={{ borderBottom: '1px solid #f1f1f1' }}>
                          <td><span className="badge rounded-circle bg-secondary text-white" style={{ width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>2</span></td>
                          <td style={{ minWidth: '300px' }}>
                            <div className="itinerary-edit-wrap p-2 px-3 rounded-4 d-flex align-items-center gap-3" style={{ background: 'var(--color-bg)', border: '1px solid transparent' }}>
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2.5">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polyline points="12 6 12 12 16 14"></polyline>
                               </svg>
                               <LocationSearch 
                                  placeholder="Final Destination"
                                  value=""
                                  onChange={(val) => {
                                    const newIt = { id: 2, address: val, lat: 6.5244, lng: 3.3792, status: 'PENDING', verified: false, riderCompleted: false };
                                    setItineraries([{ id: 1, address: '', lat: 6.5244, lng: 3.3792, status: 'PENDING', verified: false, riderCompleted: false }, newIt]);
                                  }}
                                  className="font-13 fw-700 w-100 border-0 bg-transparent"
                                  style={{ outline: 'none' }}
                               />
                            </div>
                            <p className="m-0 font-10 fw-800 text-muted mt-1 uppercase">🏁 Final Destination</p>
                          </td>
                          <td><span className="badge rounded-pill bg-light text-muted" style={{ fontSize: '9px' }}>DRAFT</span></td>
                          <td className="text-end"></td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex gap-2 mt-3">
                 <button className="btn btn-warning w-100 py-3 rounded-4 fw-900 text-dark" onClick={addStop} style={{ background: '#FFB800' }}>+ Add New Stop</button>
                 <button className="btn btn-dark w-100 py-3 rounded-4 fw-900" onClick={() => setShowItineraryModal(false)}>Close Cart</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voice Call Overlay */}
      <AnimatePresence>
        {callStatus !== 'idle' && (
          <VoiceCallView 
            contactName={riderInfo.name}
            onHangUp={() => setCallStatus('idle')}
            isRinging={callStatus === 'ringing'}
          />
        )}
      </AnimatePresence>

      {/* Premium Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 20000, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '40px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} onClick={() => setShowChat(false)}>
            <motion.div 
              initial={{ y: 300, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 300, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="chat-panel glass-morphism"
              style={{ width: '100%', maxWidth: '400px', height: '500px', background: 'var(--color-surface)', borderRadius: '32px 32px 24px 24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 -20px 60px rgba(0,0,0,0.2)' }}
            >
               <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '8px', height: '8px', background: '#2ed573', borderRadius: '50%' }}></div>
                    <span className="fw-800">Chat with {riderInfo.name}</span>
                  </div>
                  <button className="btn-close" onClick={() => setShowChat(false)}></button>
               </div>
               <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-2" style={{ background: 'var(--color-bg)' }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`d-flex ${msg.from === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                       <div style={{ 
                         maxWidth: '80%', padding: '10px 16px', borderRadius: '18px',
                         background: msg.from === 'user' ? '#000' : '#fff',
                         color: msg.from === 'user' ? '#fff' : '#000',
                         boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                         fontSize: '13px', fontWeight: '600'
                       }}>
                          {msg.text}
                       </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
               </div>
               <div className="p-3 border-top d-flex gap-2 bg-white">
                  <input 
                    type="text" 
                    className="form-control border-0 bg-light rounded-pill px-3" 
                    placeholder="Type a message..." 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                  />
                  <button className="btn btn-dark rounded-circle" style={{ width: '40px', height: '40px' }} onClick={sendChatMessage}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  return isFullScreen ? createPortal(wizardContent, document.body) : wizardContent;
};

export default QuickDispatchWizard;
