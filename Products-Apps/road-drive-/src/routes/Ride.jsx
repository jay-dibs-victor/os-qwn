import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaHistory, FaCheckCircle, FaMoneyBillWave, FaCreditCard, FaWallet, FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import MapView from '../components/MapView.jsx';
import BookingForm from '../components/BookingForm.jsx';
import RideOptions from '../components/RideOptions.jsx';
import ActiveRide from '../components/ActiveRide.jsx';
import { startDriverSimulation } from '../services/driverSimulation.js';
import { reverseGeocode } from '../services/geocode.js';
import { useRideHistory } from '../hooks/useRideHistory';
import { PRICE_MAP } from '../constants/rideTypes';
import { useAuthStore } from '../core/store/useAuthStore';
import { useBookingStore } from '../core/store/useBookingStore';
import { useUIStore } from '../core/store/useUIStore';
import apiClient from '../core/api/apiClient';
import { useSocket } from '../core/context/SocketContext.jsx';
import VoiceCallView from '../views/User/Dashboard/VoiceCallView.jsx';
import RideChat from '../views/User/Dashboard/RideChat.jsx';

const DEFAULT_PICKUP_COORDS = [6.6010, 3.3510];
const DEFAULT_DROPOFF_COORDS = [6.4281, 3.4219];

function coordDist(a, b) {
  const dlat = a[0] - b[0];
  const dlng = a[1] - b[1];
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

const DEG_TO_KM = 111.32;

export default function Ride() {
  const [rideState, setRideState] = useState('booking');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [selectedRide, setSelectedRide] = useState('economy');
  const [eta, setEta] = useState(0);
  const [driverCoords, setDriverCoords] = useState(null);
  const [driverHeading, setDriverHeading] = useState(0);
  const [rideStatus, setRideStatus] = useState('assigned');
  const [completedRide, setCompletedRide] = useState(null);
  const [rating, setRating] = useState(0);
  const [showSearching, setShowSearching] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [locPermission, setLocPermission] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [locBannerDismissed, setLocBannerDismissed] = useState(false);
  const [focusedInput, setFocusedInput] = useState('pickup');
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeDistKm, setRouteDistKm] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState(() => {
    try {
      const saved = localStorage.getItem('qos_payment_methods');
      const parsed = saved ? JSON.parse(saved) : [];
      const defaultMethods = [
        { id: 'cash-default', icon: 'cash', label: 'Cash', detail: 'Pay at pickup', preferred: true },
        { id: 'wallet-default', icon: 'mobile', label: 'Queens Wallet', detail: 'Pay with wallet balance', preferred: false }
      ];
      const merged = [...parsed];
      defaultMethods.forEach(m => {
        if (!merged.some(item => item.icon === m.icon)) {
          merged.push(m);
        }
      });
      return merged;
    } catch { 
      return [
        { id: 'cash-default', icon: 'cash', label: 'Cash', detail: 'Pay at pickup', preferred: true },
        { id: 'wallet-default', icon: 'mobile', label: 'Queens Wallet', detail: 'Pay with wallet balance', preferred: false }
      ];
    }
  });
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherMsg, setVoucherMsg] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);

  const removeVoucher = () => {
    setVoucherCode('');
    setVoucherDiscount(0);
    setVoucherMsg('');
    setVoucherApplied(false);
  };

  const timersRef = useRef([]);
  const stopSimulationRef = useRef(null);
  const { saveRide, updateLastRideRating } = useRideHistory();

  const straightKm = pickupCoords && dropoffCoords
    ? Math.round(coordDist(pickupCoords, dropoffCoords) * DEG_TO_KM * 10) / 10
    : 6;
  const estimatedKm = routeDistKm || straightKm;

  // Zustand API/state stores
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);
  const bookingStep = useBookingStore((state) => state.bookingStep);
  const activeBooking = useBookingStore((state) => state.activeBooking);
  const storeDriverLocation = useBookingStore((state) => state.driverLocation);

  const [apiFare, setApiFare] = useState(null);
  const [loadingFare, setLoadingFare] = useState(false);

  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');
  const { socket } = useSocket();

  const fetchRealQuote = async () => {
    if (!pickupCoords || !dropoffCoords) return;
    setLoadingFare(true);
    try {
      const payload = {
        itineraries: [{
          pickupCoords: { lat: pickupCoords[0], lng: pickupCoords[1] },
          destinationCoords: { lat: dropoffCoords[0], lng: dropoffCoords[1] }
        }]
      };
      const { data } = await apiClient.post('/rides/multi-stop-quote', payload);
      if (data.status === 200) {
        setApiFare(data.data.total_fare);
      }
    } catch (err) {
      console.error('Fare quote failed:', err);
    } finally {
      setLoadingFare(false);
    }
  };

  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      fetchRealQuote();
    }
  }, [pickupCoords, dropoffCoords]);

  useEffect(() => {
    if (bookingStep === 'tracking' && activeBooking) {
      setShowSearching(false);
      setRideState('active');
      setRideStatus(activeBooking.status?.toLowerCase() || 'assigned');
      
      if (storeDriverLocation) {
        setDriverCoords(storeDriverLocation);
      } else if (activeBooking.driver_location) {
        const coords = activeBooking.driver_location.coordinates;
        setDriverCoords([coords[1], coords[0]]);
      }
    } else if (bookingStep === 'done') {
      setRideState('completed');
      setCompletedRide({
        pickup: activeBooking?.pickup_address || pickup || 'Pickup',
        dropoff: activeBooking?.destination_address || dropoff || 'Destination',
        distance: activeBooking?.estimated_distance / 1000 || estimatedKm,
        duration: activeBooking?.estimated_duration / 60 || 15,
        driver: {
          name: activeBooking?.driver_name || 'Driver',
          rating: activeBooking?.driver_rating || '4.9',
          vehicle: `${activeBooking?.vehicle_model || 'Vehicle'} · ${activeBooking?.vehicle_plate || ''}`
        },
        rideType: selectedRide
      });
    }
  }, [bookingStep, activeBooking, storeDriverLocation]);

  const driver = useRef({
    name: 'Chidi Okonkwo',
    rating: '4.92',
    vehicle: 'Toyota Camry · ABC 123 XY',
  });

  const clearAllTimers = () => {
    if (stopSimulationRef.current) {
      stopSimulationRef.current();
      stopSimulationRef.current = null;
    }
    timersRef.current.forEach((t) => { clearInterval(t); clearTimeout(t); });
    timersRef.current = [];
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocPermission('denied');
      return;
    }
    setGeoLoading(true);
    setLocPermission('prompting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserCoords(coords);
        setLocPermission('granted');
        setGeoLoading(false);
      },
      (error) => {
        setLocPermission('denied');
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          console.warn('Geolocation permission denied');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    requestLocation();
    return clearAllTimers;
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      setIncomingCall(data);
      setCallStatus('ringing');
      setShowVoiceCall(true);
    };

    const handleCallAccepted = () => {
      setCallStatus('active');
    };

    const handleCallEnded = () => {
      setCallStatus('idle');
      setIncomingCall(null);
      setShowVoiceCall(false);
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-ended', handleCallEnded);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-accepted', handleCallAccepted);
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket]);

  const handleAcceptCall = () => {
    if (socket && (incomingCall || activeBooking)) {
      const rideId = activeBooking?.id || activeBooking?._id || activeBooking?.ride_id || incomingCall?.rideId || incomingCall?.ride_id;
      socket.emit('accept-call', { rideId });
      setCallStatus('active');
    }
  };

  const handleHangUp = () => {
    if (socket && (incomingCall || activeBooking)) {
      const rideId = activeBooking?.id || activeBooking?._id || activeBooking?.ride_id || incomingCall?.rideId || incomingCall?.ride_id;
      socket.emit('end-call', { rideId });
    }
    setCallStatus('idle');
    setIncomingCall(null);
    setShowVoiceCall(false);
  };

  const fetchRoute = useRef((pCoords, dCoords) => {});
  fetchRoute.current = async (pCoords, dCoords) => {
    if (!pCoords || !dCoords) return;
    const url = `https://router.project-osrm.org/route/v1/driving/${pCoords[1]},${pCoords[0]};${dCoords[1]},${dCoords[0]}?geometries=geojson&overview=full`;
    setRouteLoading(true);
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === 'Ok' && data.routes?.length > 0) {
        const geom = data.routes[0].geometry.coordinates;
        const latLngs = geom.map(([lng, lat]) => [lat, lng]);
        setRouteCoords(latLngs);
        const km = data.routes[0].distance / 1000;
        setRouteDistKm(Math.round(km * 10) / 10);
      }
    } catch {
      setRouteCoords(null);
      setRouteDistKm(null);
    }
    setRouteLoading(false);
  };

  useEffect(() => {
    if (pickupCoords && dropoffCoords && (rideState === 'estimating' || rideState === 'payment' || rideState === 'active' || rideState === 'completed')) {
      fetchRoute.current(pickupCoords, dropoffCoords);
    }
  }, [pickupCoords, dropoffCoords, rideState]);

  const setField = (field, text, coords) => {
    if (field === 'pickup') {
      setPickup(text);
      setPickupCoords(coords);
    } else {
      setDropoff(text);
      setDropoffCoords(coords);
    }
    setRouteCoords(null);
    setRouteDistKm(null);
  };

  const handleSavedPlace = (place) => {
    const field = focusedInput;
    setField(field, place.name, place.coords);
  };

  const handleCurrentLocation = async () => {
    const field = focusedInput;
    if (userCoords) {
      const result = await reverseGeocode(userCoords[0], userCoords[1]);
      setField(field, result?.name || 'Current location', userCoords);
    } else {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserCoords(coords);
          const result = await reverseGeocode(coords[0], coords[1]);
          setField(field, result?.name || 'Current location', coords);
          setLocPermission('granted');
          setGeoLoading(false);
        },
        () => {
          setGeoLoading(false);
          requestLocation();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  const handleSearch = () => {
    const pText = pickup || 'Current location';
    const dText = dropoff || 'Destination';
    const pCoords = pickupCoords || userCoords || DEFAULT_PICKUP_COORDS;
    const dCoords = dropoffCoords || DEFAULT_DROPOFF_COORDS;
    setPickup(pText);
    setDropoff(dText);
    setPickupCoords(pCoords);
    setDropoffCoords(dCoords);
    setRouteCoords(null);
    setRouteDistKm(null);
    setRideState('estimating');
  };

  const handleConfirm = () => {
    const pCoords = pickupCoords || DEFAULT_PICKUP_COORDS;
    const dCoords = dropoffCoords || DEFAULT_DROPOFF_COORDS;

    setPickupCoords(pCoords);
    setDropoffCoords(dCoords);

    setRideState('payment');
  };

  const handlePaymentConfirm = () => {
    if (!selectedPayment) return;

    setRideState('searching');
    setShowSearching(true);
    useBookingStore.getState().setBookingStep('searching');

    const requestRide = async () => {
      try {
        const payload = {
          passenger_id: user?.id || user?._id || 'demo',
          pickup_lat: pickupCoords[0],
          pickup_lng: pickupCoords[1],
          pickup_address: pickup || 'Pickup Point',
          dest_lat: dropoffCoords[0],
          dest_lng: dropoffCoords[1],
          dest_address: dropoff || 'Destination Point',
          booking_type: 'QUICK',
          ride_category: selectedRide === 'premium' ? 'premium' : 'taxi',
          payment_method: selectedPayment?.icon === 'cash' ? 'CASH' : 'WALLET',
          is_expanded_search: false,
          voucher_code: voucherApplied ? voucherCode : undefined
        };
        
        const { data } = await apiClient.post('/rides/request', payload);
        if (data.status === 200) {
          addToast('Ride requested! Finding a driver...', 'success');
        }
      } catch (err) {
        addToast(err.response?.data?.error || 'Failed to request ride', 'danger');
        setRideState('payment');
        setShowSearching(false);
        useBookingStore.getState().setBookingStep('idle');
      }
    };
    requestRide();
  };

  const handlePickupDrag = async (coords) => {
    setPickupCoords(coords);
    const result = await reverseGeocode(coords[0], coords[1]);
    setPickup(result.name);
    setRouteCoords(null);
    setRouteDistKm(null);
  };

  const handleDropoffDrag = async (coords) => {
    setDropoffCoords(coords);
    const result = await reverseGeocode(coords[0], coords[1]);
    setDropoff(result.name);
    setRouteCoords(null);
    setRouteDistKm(null);
  };

  const handleCancel = async () => {
    clearAllTimers();
    setDriverCoords(null);
    setEta(0);
    setRideState('booking');
    
    if (activeBooking) {
      try {
        const activeId = activeBooking.id || activeBooking._id || activeBooking.ride_id;
        await apiClient.put('/rides/status', { ride_id: activeId, status: 'CANCELLED' });
        useBookingStore.getState().resetBookingFlow();
        addToast('Ride cancelled', 'info');
      } catch (err) {
        console.error('Failed to cancel ride:', err);
      }
    }
  };

  const handleDone = () => {
    clearAllTimers();
    setDriverCoords(null);
    setPickup('');
    setDropoff('');
    setPickupCoords(null);
    setDropoffCoords(null);
    setRouteCoords(null);
    setRouteDistKm(null);
    setSelectedRide('economy');
    setEta(0);
    setCompletedRide(null);
    setRating(0);
    setRideState('booking');
    useBookingStore.getState().resetBookingFlow();
  };

  const renderSidebar = () => {
    switch (rideState) {
      case 'booking':
        return (
          <BookingForm
            pickup={pickup} setPickup={setPickup}
            dropoff={dropoff} setDropoff={setDropoff}
            pickupCoords={pickupCoords} setPickupCoords={setPickupCoords}
            dropoffCoords={dropoffCoords} setDropoffCoords={setDropoffCoords}
            focusedInput={focusedInput} setFocusedInput={setFocusedInput}
            geoLoading={geoLoading}
            handleCurrentLocation={handleCurrentLocation}
            handleSearch={handleSearch}
            handleSavedPlace={handleSavedPlace}
            locPermission={locPermission}
            locBannerDismissed={locBannerDismissed}
            requestLocation={requestLocation}
            setLocBannerDismissed={setLocBannerDismissed}
          />
        );

      case 'estimating':
        return (
          <>
            <div className="ride-back-btn" onClick={() => setRideState('booking')}>
              <FaArrowLeft /> Edit locations
            </div>
            <div className="ride-route-info">
              {pickup || 'Ikeja'} → {dropoff || 'Victoria Island'}
              {routeLoading ? <span style={{ marginLeft: '8px', color: 'var(--color-gold)' }}>Calculating route...</span> : <span> · {estimatedKm} km</span>}
            </div>
            <RideOptions selectedId={selectedRide} onSelect={setSelectedRide} estimatedKm={estimatedKm} />
            <div className="ride-confirm-bar">
              <button className="ride-confirm-btn" onClick={handleConfirm}>
                Confirm {selectedRide.charAt(0).toUpperCase() + selectedRide.slice(1)}
              </button>
            </div>
          </>
        );

      case 'payment':
        const VALID_VOUCHERS = {
          LAGOS20: { type: 'percent', value: 20, desc: '20% off' },
          RIDE50: { type: 'flat', value: 1000, desc: '₦1,000 off' },
          QUEENS10: { type: 'flat', value: 1000, desc: '₦1,000 off' },
          FREE100: { type: 'flat', value: 100, desc: '₦100 off' },
        };
        const priceInfo = PRICE_MAP[selectedRide] || PRICE_MAP.economy;
        const baseTotal = priceInfo.total;
        const discount = voucherApplied ? Math.min(voucherDiscount || 0, baseTotal) : 0;
        const finalTotal = baseTotal - discount;
        const payIconMap = {
          visa: <FaCcVisa style={{ fontSize: '26px' }} />,
          mastercard: <FaCcMastercard style={{ fontSize: '26px' }} />,
          cash: <FaMoneyBillWave style={{ fontSize: '22px' }} />,
          mobile: <FaWallet style={{ fontSize: '20px' }} />,
        };
        return (
          <>
            <div style={{ padding: '24px 24px 0' }}>
              <div className="ride-back-btn" onClick={() => setRideState('estimating')}>
                <FaArrowLeft /> Back
              </div>
              <div className="ride-route-info" style={{ marginTop: '12px' }}>
                {pickup || 'Ikeja'} → {dropoff || 'Victoria Island'}
                <span> · {estimatedKm} km</span>
              </div>
              <div style={{ marginTop: '12px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{selectedRide.charAt(0).toUpperCase() + selectedRide.slice(1)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: discount > 0 ? 'var(--color-text-muted)' : 'var(--color-gold)', textDecoration: discount > 0 ? 'line-through' : 'none' }}>
                    ₦{baseTotal.toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-gold)' }}>
                      ₦{finalTotal.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              {/* Voucher */}
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px', color: 'var(--color-white)' }}>Voucher</h4>
              {!voucherApplied ? (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <input
                    value={voucherCode}
                    onChange={(e) => { setVoucherCode(e.target.value); setVoucherMsg(''); }}
                    placeholder="Enter voucher code"
                    style={{
                      flex: 1, padding: '12px 14px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border-gold)',
                      color: 'var(--color-white)', fontSize: '14px', outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => {
                      const code = voucherCode.trim().toUpperCase();
                      const voucher = VALID_VOUCHERS[code];
                      if (!voucher) {
                        setVoucherMsg('Invalid voucher code');
                        setVoucherDiscount(0);
                        return;
                      }
                      setVoucherApplied(true);
                      setVoucherMsg(`Voucher applied: ${voucher.desc}`);
                      setVoucherDiscount(voucher.type === 'percent' ? Math.round(baseTotal * voucher.value / 100) : voucher.value);
                    }}
                    style={{
                      padding: '12px 20px', borderRadius: '10px', border: 'none',
                      background: 'var(--color-gold)', color: 'var(--color-black)',
                      fontWeight: '700', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    Validate
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: '10px',
                  background: 'rgba(255,184,0,0.08)', border: '1px solid var(--color-gold)',
                  marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--color-gold)' }}><FaCheckCircle /></span>
                    <span style={{ fontSize: '14px', color: 'var(--color-gold)', fontWeight: '600' }}>{voucherMsg}</span>
                  </div>
                  <button onClick={removeVoucher} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>
                    Remove
                  </button>
                </div>
              )}
              {voucherMsg && !voucherApplied && (
                <div style={{ fontSize: '13px', color: '#e74c3c', marginBottom: '16px' }}>{voucherMsg}</div>
              )}

              {/* Payment methods */}
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--color-white)' }}>Select payment method</h4>
              {paymentMethods.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border-gold)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', marginBottom: '12px' }}>No payment methods saved</p>
                  <Link to="/wallet" style={{ color: 'var(--color-gold)', fontSize: '14px', fontWeight: '600' }}>Add in Wallet →</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                        borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                        background: selectedPayment?.id === method.id ? 'rgba(255,184,0,0.1)' : 'rgba(255,255,255,0.03)',
                        border: selectedPayment?.id === method.id ? '2px solid var(--color-gold)' : '1px solid var(--color-border-gold)',
                        color: 'var(--color-white)', fontSize: '14px', fontWeight: '500',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ color: 'var(--color-gold)', width: '36px', textAlign: 'center', flexShrink: 0 }}>
                        {payIconMap[method.icon] || <FaCreditCard style={{ fontSize: '20px' }} />}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600' }}>{method.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{method.detail}</div>
                      </div>
                      {selectedPayment?.id === method.id && (
                        <FaCheckCircle style={{ color: 'var(--color-gold)', fontSize: '18px', flexShrink: 0 }} />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {discount > 0 && (
                <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                    <span style={{ color: 'var(--color-white)' }}>₦{baseTotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                    <span style={{ color: '#22c55e' }}>Discount</span>
                    <span style={{ color: '#22c55e' }}>-₦{discount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--color-white)' }}>Total</span>
                    <span style={{ color: 'var(--color-gold)' }}>₦{finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="ride-confirm-bar">
              <button
                className="ride-confirm-btn"
                onClick={handlePaymentConfirm}
                disabled={!selectedPayment}
                style={{
                  opacity: selectedPayment ? 1 : 0.4,
                  cursor: selectedPayment ? 'pointer' : 'not-allowed',
                }}
              >
                Confirm payment {selectedPayment ? `₦${finalTotal.toLocaleString()}` : ''}
              </button>
            </div>
          </>
        );

      case 'searching':
        return (
          <>
            <div className="sidebar-header">
              <h2>Finding your ride</h2>
            </div>
            <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div className="search-sidebar-spinner" />
              <div>
                <div className="search-sidebar-text">Searching for nearby drivers</div>
                <div style={{ fontSize: '12px', marginTop: '8px', color: 'rgba(255,255,255,0.4)' }}>Matching you with the best driver</div>
              </div>
            </div>
          </>
        );

      case 'active':
        return (
          <ActiveRide 
            status={rideStatus} 
            eta={eta} 
            onCancel={handleCancel} 
            driver={{
              name: activeBooking?.driver_name || driver.current.name,
              rating: activeBooking?.driver_rating || driver.current.rating,
              vehicle: activeBooking?.vehicle_model ? `${activeBooking.vehicle_model} · ${activeBooking.vehicle_plate || ''}` : driver.current.vehicle
            }} 
          />
        );

      case 'completed':
        return (
          <div className="completed-panel">
            <div className="completed-header">
              <div className="completed-check">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <h2>Trip completed</h2>
              <p>Thank you for riding with Queens OS</p>
            </div>

            {completedRide && (
              <>
                <div className="completed-trip-details">
                  <div className="completed-detail-row">
                    <span className="completed-detail-label">From</span>
                    <span className="completed-detail-value">{completedRide.pickup}</span>
                  </div>
                  <div className="completed-detail-row">
                    <span className="completed-detail-label">To</span>
                    <span className="completed-detail-value">{completedRide.dropoff}</span>
                  </div>
                  <div className="completed-detail-row">
                    <span className="completed-detail-label">Distance</span>
                    <span className="completed-detail-value">{Math.round(completedRide.distance * 10) / 10} km</span>
                  </div>
                  <div className="completed-detail-row">
                    <span className="completed-detail-label">Duration</span>
                    <span className="completed-detail-value">{completedRide.duration} min</span>
                  </div>
                  <div className="completed-detail-row">
                    <span className="completed-detail-label">Driver</span>
                    <span className="completed-detail-value">{completedRide.driver.name}</span>
                  </div>
                </div>

        {(() => {
          const p = PRICE_MAP[completedRide.rideType] || PRICE_MAP.economy;
                  return (
                    <div className="completed-fare-breakdown">
                      <div className="completed-fare-row">
                        <span className="completed-fare-label">Base fare</span>
                        <span className="completed-fare-value">₦{p.base.toLocaleString()}</span>
                      </div>
                      <div className="completed-fare-row">
                        <span className="completed-fare-label">Distance</span>
                        <span className="completed-fare-value">₦{p.dist.toLocaleString()}</span>
                      </div>
                      <div className="completed-fare-row">
                        <span className="completed-fare-label">Time</span>
                        <span className="completed-fare-value">₦0</span>
                      </div>
                      <div className="completed-fare-row total">
                        <span className="completed-fare-label">Total</span>
                        <span className="completed-fare-value">₦{p.total.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="rate-driver-section">
                  <p>Rate your driver</p>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= rating ? 'star-filled' : ''}
                        onClick={() => { setRating(star); updateLastRideRating(star); }}
                        style={{ cursor: 'pointer' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/ride/history" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px', borderRadius: '8px', backgroundColor: 'transparent',
                border: '1px solid var(--color-border-gold)', color: 'var(--color-text-muted)',
                fontSize: '14px', fontWeight: 500, cursor: 'pointer', textDecoration: 'none',
              }}>
                <FaHistory /> View ride history
              </Link>
              <button className="completed-done-btn" onClick={handleDone}>
                Done
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ride-app-container">
      <div className="ride-map-wrapper">
        <MapView
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          driverCoords={driverCoords}
          driverHeading={driverHeading}
          userCoords={userCoords}
          routeCoords={routeCoords}
          showUserLocation={!pickupCoords}
          showRoute={rideState === 'estimating' || rideState === 'payment' || rideState === 'active' || rideState === 'completed'}
          onPickupDrag={handlePickupDrag}
          onDropoffDrag={handleDropoffDrag}
        />

        {showSearching && (
          <div className="searching-overlay">
            <div className="searching-car-icon">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <div className="searching-text">Finding your driver</div>
            <div className="searching-sub">Please wait while we match you with a nearby driver</div>
          </div>
        )}
      </div>

      {(rideState === 'booking' || rideState === 'estimating' || rideState === 'payment' || rideState === 'searching') && (
        <div className="ride-booking-sidebar">
          {renderSidebar()}
        </div>
      )}
      {(rideState === 'active' || rideState === 'completed') && renderSidebar()}

      {showVoiceCall && activeBooking && (
        <VoiceCallView
          contactName={activeBooking.driver_name || 'Driver'}
          isRinging={callStatus === 'ringing'}
          onHangUp={handleHangUp}
          onAccept={handleAcceptCall}
        />
      )}
      {activeBooking && (
        <RideChat rideId={activeBooking.id || activeBooking._id || activeBooking.ride_id} />
      )}
    </div>
  );
}
