import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../../core/store/useUIStore';
import LocationSearch from '../../../core/components/LocationSearch';
import apiClient from '../../../core/api/apiClient';

const VEHICLES = [
  { 
    id: 'economy', 
    label: 'Standard', 
    multiplier: 1.0,
    icon: 'bi-taxi-front-fill', 
    capacity: 4, 
    luggage: 2,
    image: 'https://img.freepik.com/free-psd/yellow-taxi-car-isolated_23-2151433299.jpg'
  },
  { 
    id: 'premium', 
    label: 'Van', 
    multiplier: 1.6,
    icon: 'bi-truck-flatbed', 
    capacity: 6, 
    luggage: 4,
    image: 'https://img.freepik.com/free-psd/black-suv-car-isolated_23-2151433301.jpg'
  },
];

const QuickTripModal = ({ onClose, prefill }) => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [pickupData, setPickupData] = useState({
     address: prefill?.pickup || '',
     lat: prefill?.pickupCoords?.lat || 6.5244,
     lng: prefill?.pickupCoords?.lng || 3.3792
  });
  const [destData, setDestData] = useState({
     address: '',
     lat: null,
     lng: null
  });
  const [selectedVehicle, setSelectedVehicle] = useState('economy');
  const [isPickupDirty, setIsPickupDirty] = useState(false);
  const [estPrice, setEstPrice] = useState(null);
  const [estCurrency, setEstCurrency] = useState('₦');
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Fetch Estimate from API
  const fetchEstimate = async () => {
    if (!pickupData.lat || !destData.lat) return;
    setLoadingPrice(true);
    try {
      const payload = {
        itineraries: [{
          pickupCoords: { lat: pickupData.lat, lng: pickupData.lng },
          destinationCoords: { lat: destData.lat, lng: destData.lng }
        }]
      };
      const { data } = await apiClient.post('/rides/multi-stop-quote', payload);
      if (data.status === 200) {
        setEstPrice(data.data.total_fare);
        setEstCurrency(data.data.currency === 'NGN' ? '₦' : data.data.currency);
      }
    } catch (err) {
      console.error('Fare estimation failed', err);
    } finally {
      setLoadingPrice(false);
    }
  };

  useEffect(() => {
    if (pickupData.lat && destData.lat) {
      fetchEstimate();
    }
  }, [pickupData.lat, pickupData.lng, destData.lat, destData.lng]);

  // Reactive Sync: Update pickup if prefill changes and user hasn't edited manually
  useEffect(() => {
    if (prefill && !isPickupDirty) {
      setPickupData({
        address: prefill.pickup || '',
        lat: prefill.pickupCoords?.lat || pickupData.lat,
        lng: prefill.pickupCoords?.lng || pickupData.lng
      });
    }
  }, [prefill, isPickupDirty]);

  const handleBook = () => {
    if (!pickupData.address.trim()) {
      addToast('Please enter a pickup location', 'warning');
      return;
    }
    if (!destData.address.trim()) {
      addToast('Please enter a destination', 'warning');
      return;
    }
    navigate('/book-ride', {
      state: {
        pickup: pickupData,
        destination: destData,
        rideCategory: selectedVehicle,
      },
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="bottom-sheet-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'flex-end'
        }}
      >
        <motion.div
          className="bottom-sheet glass-morphism"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{ width: 'min(100%, 400px)', maxWidth: '400px', borderRadius: '32px 32px 0 0', padding: '16px 24px 40px' }}
        >
          <div className="sheet-handle" />

          {/* Route Input Section */}
          <div className="route-inputs p-3 rounded-4 bg-light mb-4 mt-3 border">
             <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-geo-alt-fill text-warning font-18" />
                <div className="flex-1">
                   <LocationSearch
                     placeholder="Pickup Location"
                     className="form-control border-0 bg-transparent p-0 font-14 fw-700"
                     value={pickupData.address}
                     onChange={(val) => {
                       setPickupData(prev => ({ ...prev, address: val }));
                       setIsPickupDirty(true);
                     }}
                     onLocationSelect={(loc) => {
                       setPickupData(loc);
                       setIsPickupDirty(true);
                     }}
                   />
                </div>
                {!isPickupDirty && pickupData.address && (
                   <span className="badge bg-warning-soft text-warning font-9 fw-800">LIVE</span>
                )}
             </div>
             <hr className="my-2 opacity-5" />
             <div className="d-flex align-items-center gap-3">
                <i className="bi bi-search text-dark font-18" />
                <div className="flex-1">
                   <LocationSearch
                     placeholder="Where to?"
                     className="form-control border-0 bg-transparent p-0 font-14 fw-700"
                     value={destData.address}
                     onChange={(val) => setDestData(prev => ({ ...prev, address: val }))}
                     onLocationSelect={setDestData}
                   />
                </div>
             </div>
          </div>

          {/* Tab-like vehicle categories */}
          <div className="d-flex justify-content-center gap-5 mb-4">
             <button 
               className={`btn border-0 fw-800 font-16 ${selectedVehicle === 'economy' ? 'text-dark border-bottom border-3 border-dark' : 'text-muted'}`}
               onClick={() => setSelectedVehicle('economy')}
             >Any</button>
             <button 
               className={`btn border-0 fw-800 font-16 ${selectedVehicle === 'premium' ? 'text-dark border-bottom border-3 border-dark' : 'text-muted'}`}
               onClick={() => setSelectedVehicle('premium')}
             >Van</button>
          </div>

          {/* Selected Vehicle Card */}
          {VEHICLES.find(v => v.id === selectedVehicle) && (
             <div className="premium-vehicle-card p-3 mb-4 rounded-4 d-flex align-items-center gap-3">
                <img src={VEHICLES.find(v => v.id === selectedVehicle).image} alt="Car" className="vehicle-img" />
                <div className="flex-1">
                   <div className="d-flex justify-content-between align-items-start">
                      <div>
                         <span className="font-11 text-muted d-block"><i className="bi bi-people-fill" /> {VEHICLES.find(v => v.id === selectedVehicle).capacity} <i className="bi bi-briefcase-fill ms-2" /> {VEHICLES.find(v => v.id === selectedVehicle).luggage}</span>
                         <h3 className="fw-900 m-0 mt-1">
                            {loadingPrice ? (
                              <div className="placeholder-glow"><span className="placeholder col-6 rounded"></span></div>
                            ) : estPrice ? (
                              `${estCurrency}${Math.round(estPrice * VEHICLES.find(v => v.id === selectedVehicle).multiplier).toLocaleString()}`
                            ) : '--'}
                         </h3>
                      </div>
                   </div>
                   <p className="m-0 font-12 text-muted mt-1">
                     {loadingPrice ? 'Calculating fare...' : estPrice ? 'Price for current route' : 'Select destination to see price'}
                   </p>
                </div>
             </div>
          )}

          <button 
            className="btn btn-dark w-100 rounded-4 py-3 fw-900 font-18 shadow-lg" 
            onClick={handleBook}
            disabled={!estPrice || loadingPrice}
          >
             {loadingPrice ? 'Calculating...' : 'Confirm Ride'}
          </button>

          <style dangerouslySetInnerHTML={{ __html: `
            .premium-vehicle-card { background: white; border: 1.5px solid #f0f0f0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
            .vehicle-img { width: 100px; object-fit: contain; }
            .bg-warning-soft { background: rgba(255, 184, 0, 0.1); }
            .fw-900 { font-weight: 900; }
            .font-12 { font-size: 12px; }
          `}} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickTripModal;
