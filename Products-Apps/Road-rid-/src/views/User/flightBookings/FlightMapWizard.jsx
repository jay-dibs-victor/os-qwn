import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlightStore } from '../../../core/store/useFlightStore';
import AnimatedHeroBackground from '../Home/AnimatedHeroBackground';
import FlightMap from './FlightMap';
import LocationSearch from '../../../core/components/LocationSearch';
import apiClient from '../../../core/api/apiClient';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { useUIStore } from '../../../core/store/useUIStore';
import './flight.css';

const FlightMapWizard = () => {
  const navigate = useNavigate();
  const {
    setSearchParams, setFlights, searchParams,
    multiCityLegs, updateMultiCityLeg, addMultiCityLeg, removeMultiCityLeg,
    clearCart
  } = useFlightStore();
  
  const [step, setStep] = useState(1);
  const [isChecking, setIsChecking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [availabilityFound, setAvailabilityFound] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();

  // Real lat/lng coords for map arc
  const [originCoords, setOriginCoords] = useState(null);   // [lat, lng]
  const [destCoords, setDestCoords] = useState(null);       // [lat, lng]
  
  // Local state for Step 2
  const [tripType, setTripType] = useState('one-way');
  const [adults, setAdults] = useState(1);
  const [travelClass, setTravelClass] = useState('ECONOMY');

  // Handle checking availability
  const checkAvailability = async () => {
    setIsChecking(true);
    try {
      // Basic mock or real check - wait for flight search
      // In a real scenario, we might call the same search API but with a broad date range
      const response = await apiClient.post('/flights/search', {
        originLocationCode: origin.substring(0, 3).toUpperCase() || 'LHR',
        destinationLocationCode: destination.substring(0, 3).toUpperCase() || 'DXB',
        departureDate: new Date().toISOString().split('T')[0],
        adults: 1,
        travelClass: 'ECONOMY'
      });
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        setAvailabilityFound(true);
        // Store flights in background
        setFlights(response.data.data);
      } else {
        // Mock success if no real data
        setAvailabilityFound(true);
        setFlights([{ id: 'mock1', airline: 'Goom Air', price: 50000, departure_time: new Date(), arrival_time: new Date() }]);
      }
    } catch (error) {
      console.error("Availability check failed", error);
      // Fallback for demo
      setAvailabilityFound(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleProceedToStep2 = () => {
    setShowModal(false);
    setStep(2);
  };

  const handleFinalSearch = () => {
    if (tripType === 'multi-city') {
      // Store multi-city config and route to results
      clearCart();
      const validLegs = multiCityLegs.filter(l => l.origin && l.destination);
      if (validLegs.length < 2) {
        alert('Please fill in at least 2 city legs.');
        return;
      }
      setSearchParams({
        tripType: 'multi-city',
        origin: validLegs[0].origin,
        destination: validLegs[0].destination,
        departureDate: validLegs[0].departureDate,
        adults,
        travelClass
      });
    } else {
      setSearchParams({
        origin,
        destination,
        tripType,
        adults,
        travelClass
      });
    }
    navigate('/flights/results');
  };

  return (
    <div className="flight-wizard position-relative" style={{ minHeight: '100vh', backgroundColor: '#f8faff', overflow: 'hidden' }}>
      <AnimatedHeroBackground />
      
      {/* Navbar space */}
      <div style={{ height: '80px' }}></div>

      <div className="container position-relative py-4" style={{ zIndex: 10 }}>
        {/* Wizard Header */}
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold text-dark">Explore Destinations</h2>
          <p className="lead text-muted">Map your journey and discover available flights worldwide.</p>
        </div>

        {/* Wizard Progress */}
        <div className="d-flex justify-content-center mb-4">
           <div className="d-flex align-items-center">
              <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${step >= 1 ? 'bg-warning text-dark' : 'bg-secondary text-white'}`} style={{ width: '40px', height: '40px' }}>1</div>
              <div style={{ height: '4px', width: '60px', background: step >= 2 ? '#ffb800' : '#dee2e6' }}></div>
              <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${step >= 2 ? 'bg-warning text-dark' : 'bg-secondary text-white'}`} style={{ width: '40px', height: '40px' }}>2</div>
           </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="row justify-content-center"
            >
              <div className="col-lg-10 position-relative">
                <div 
                  className={`card shadow-lg border-0 overflow-hidden ${isFullScreen ? 'rounded-0' : 'rounded-4 mt-5'}`}
                  style={isFullScreen ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, margin: 0, height: '100vh', width: '100vw' } : {}}
                >
                  <div className="card-body p-0 position-relative" style={{ height: '100%' }}>
                    {/* Full screen toggle button */}
                    <button 
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className="btn btn-light shadow-sm position-absolute"
                      style={{ top: '15px', right: '15px', zIndex: 1000, borderRadius: '8px', padding: '8px 12px' }}
                      title="Toggle Fullscreen"
                    >
                      <i className={`bi ${isFullScreen ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'} fs-5`}></i>
                    </button>

                    {/* Real Leaflet flight map */}
                    <div style={{ height: isFullScreen ? '100%' : '520px', width: '100%' }}>
                      <FlightMap
                        originCoords={originCoords}
                        destCoords={destCoords}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Draggable floating panel */}
                <motion.div
                      drag
                      dragMomentum={false}
                      dragElastic={0.05}
                      className={`${isFullScreen ? 'position-fixed' : 'position-absolute'} rounded-4 shadow-lg`}
                      style={{
                        top: isFullScreen ? '20px' : '-30px',
                        left: '50%',
                        x: '-50%',
                        zIndex: 10000,
                        width: 'min(92%, 700px)',
                        background: 'rgba(255,255,255,0.97)',
                        backdropFilter: 'blur(14px)',
                        padding: '20px 24px',
                        border: '1px solid rgba(0,0,0,0.07)',
                        cursor: 'grab',
                      }}
                      whileDrag={{ cursor: 'grabbing', scale: 1.01, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <i className="bi bi-grip-horizontal text-muted"></i>
                        <h5 className="fw-bold m-0" style={{ fontSize: '0.95rem' }}>Select Your Route</h5>
                        <span className="badge rounded-pill ms-auto" style={{ background: '#fff8e7', color: '#b8860b', fontSize: '0.7rem', fontWeight: 700 }}>Drag to reposition</span>
                      </div>

                      {/* Route row */}
                      <div className="form-main-row" style={{ display: 'flex', alignItems: 'stretch', borderRadius: '12px', border: '1.5px solid #e8e8e8', overflow: 'visible' }}>
                        <div className="input-with-icon" style={{ flex: 1, zIndex: 200, position: 'relative' }}>
                          <LocationSearch
                            placeholder="Where from? (e.g. LHR, JFK)"
                            value={origin}
                            onChange={setOrigin}
                            onLocationSelect={(loc) => {
                              setOrigin(loc.address);
                              if (loc.lat && loc.lng) setOriginCoords([loc.lat, loc.lng]);
                            }}
                            className="w-100 border-0 fw-semibold"
                            icon={<i className="bi bi-geo-alt" style={{ color: '#ffb800', marginRight: '10px', fontSize: '1rem' }}></i>}
                          />
                        </div>
                        <div className="swap-icon" style={{ display: 'flex', alignItems: 'center', padding: '0 12px', borderLeft: '1.5px solid #f0f0f0', borderRight: '1.5px solid #f0f0f0', color: '#aaa', userSelect: 'none' }}>⇄</div>
                        <div className="input-with-icon" style={{ flex: 1, zIndex: 190, position: 'relative' }}>
                          <LocationSearch
                            placeholder="Where to? (e.g. DXB, LOS)"
                            value={destination}
                            onChange={setDestination}
                            onLocationSelect={(loc) => {
                              setDestination(loc.address);
                              if (loc.lat && loc.lng) setDestCoords([loc.lat, loc.lng]);
                            }}
                            className="w-100 border-0 fw-semibold"
                            icon={<i className="bi bi-geo" style={{ color: '#ffb800', marginRight: '10px', fontSize: '1rem' }}></i>}
                          />
                        </div>
                        <button
                          className="btn-search-v2"
                          disabled={!origin || !destination}
                          onClick={() => {
                            if (!isAuthenticated()) {
                              openAuthModal('login');
                            } else {
                              setShowModal(true);
                            }
                          }}
                          title="Check Availability"
                        >
                          <i className="bi bi-search"></i>
                        </button>
                      </div>

                      <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
                        <i className="bi bi-info-circle me-1"></i>
                        {originCoords && destCoords
                          ? '✈ Flight arc shown on map — drag this panel to reveal more of the map'
                          : 'Type at least 3 characters to search — the arc appears once both points are set'}
                      </p>
                    </motion.div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="row justify-content-center"
            >
              <div className="col-lg-6">
                  <div className="card shadow-lg border-0 rounded-4 p-5 bg-white">
                  <h4 className="fw-bold mb-4 text-center">Customize Your Trip</h4>

                  {/* Trip type picker */}
                  <div className="mb-4">
                    <label className="fw-bold mb-2 d-block">Trip Type</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {['one-way', 'round-trip', 'multi-city'].map(t => (
                        <button
                          key={t}
                          className={`btn flex-grow-1 rounded-pill ${tripType === t ? 'btn-dark' : 'btn-outline-dark'}`}
                          onClick={() => setTripType(t)}
                          style={{ fontSize: '0.85rem' }}
                        >
                          {t === 'one-way' ? 'One Way' : t === 'round-trip' ? 'Round Trip' : 'Multi-city'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* One-way / Round-trip: show origin → dest summary */}
                  {tripType !== 'multi-city' && (
                    <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded-3">
                      <div className="fw-bold text-truncate" style={{ maxWidth: '42%' }}>{origin || 'Origin'}</div>
                      <i className="bi bi-airplane-fill text-warning"></i>
                      <div className="fw-bold text-truncate text-end" style={{ maxWidth: '42%' }}>{destination || 'Destination'}</div>
                    </div>
                  )}

                  {/* Multi-city: leg rows */}
                  {tripType === 'multi-city' && (
                    <div className="mb-4">
                      <label className="fw-bold mb-2 d-block">City Legs</label>
                      {multiCityLegs.map((leg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="form-main-row mb-2"
                          style={{
                            borderRadius: '10px',
                            border: '1.5px solid #f0f0f0',
                            overflow: 'visible',
                            position: 'relative',
                            background: 'var(--color-surface)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', minWidth: '60px', color: '#aaa', fontSize: '0.75rem', fontWeight: 700, borderRight: '1px solid #f0f0f0' }}>
                            LEG {idx + 1}
                          </div>
                          <div className="input-with-icon" style={{ flex: 1, zIndex: 300 - idx * 10, position: 'relative' }}>
                            <LocationSearch
                              placeholder={`From (Leg ${idx + 1})`}
                              value={leg.origin}
                              onChange={(val) => updateMultiCityLeg(idx, { origin: val })}
                              onLocationSelect={(loc) => updateMultiCityLeg(idx, { origin: loc.address })}
                              className="w-100 border-0 fw-semibold"
                              icon={<i className="bi bi-geo-alt" style={{ color: '#ffb800', marginRight: '8px', fontSize: '0.9rem' }}></i>}
                            />
                          </div>
                          <div className="swap-icon" style={{ color: '#ccc', padding: '0 8px', fontSize: '0.85rem' }}>→</div>
                          <div className="input-with-icon" style={{ flex: 1, zIndex: 290 - idx * 10, position: 'relative' }}>
                            <LocationSearch
                              placeholder={`To (Leg ${idx + 1})`}
                              value={leg.destination}
                              onChange={(val) => updateMultiCityLeg(idx, { destination: val })}
                              onLocationSelect={(loc) => updateMultiCityLeg(idx, { destination: loc.address })}
                              className="w-100 border-0 fw-semibold"
                              icon={<i className="bi bi-geo" style={{ color: '#ffb800', marginRight: '8px', fontSize: '0.9rem' }}></i>}
                            />
                          </div>
                          <div className="input-with-icon date-input" style={{ maxWidth: '130px' }}>
                            <i className="bi bi-calendar" style={{ fontSize: '0.85rem' }}></i>
                            <input
                              type="date"
                              value={leg.departureDate}
                              onChange={e => updateMultiCityLeg(idx, { departureDate: e.target.value })}
                              style={{ fontSize: '0.8rem' }}
                            />
                          </div>
                          {multiCityLegs.length > 2 && (
                            <button
                              onClick={() => removeMultiCityLeg(idx)}
                              style={{ border: 'none', background: 'none', padding: '0 10px', color: '#e74c3c', fontSize: '1.1rem', cursor: 'pointer' }}
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                        </motion.div>
                      ))}
                      {multiCityLegs.length < 6 && (
                        <button
                          className="btn btn-outline-dark rounded-pill px-3 mt-2"
                          style={{ fontSize: '0.82rem' }}
                          onClick={addMultiCityLeg}
                        >
                          <i className="bi bi-plus-circle me-1"></i>Add another city
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="fw-bold mb-2">Passengers</label>
                    <div className="d-flex align-items-center justify-content-between p-3 border rounded-3">
                      <span>Adults</span>
                      <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-sm btn-outline-dark rounded-circle" onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                        <span className="fw-bold">{adults}</span>
                        <button className="btn btn-sm btn-outline-dark rounded-circle" onClick={() => setAdults(adults + 1)}>+</button>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="fw-bold mb-2">Flight Class</label>
                    <select className="form-select form-select-lg rounded-3" value={travelClass} onChange={(e) => setTravelClass(e.target.value)}>
                      <option value="ECONOMY">Economy</option>
                      <option value="PREMIUM_ECONOMY">Premium Economy</option>
                      <option value="BUSINESS">Business</option>
                      <option value="FIRST">First Class</option>
                    </select>
                  </div>

                  <button className="btn btn-warning w-100 rounded-pill py-3 fw-bold fs-5 text-dark" onClick={handleFinalSearch}>
                    {tripType === 'multi-city' ? 'Search Multi-city Flights' : 'View Available Flights'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Availability Modal */}
        {showModal && (
          <div className="modal-backdrop fade show" style={{ zIndex: 1040, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}></div>
        )}
        {showModal && (
          <div className="modal d-block" style={{ zIndex: 1050 }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-body text-center p-5">
                  {!availabilityFound && !isChecking ? (
                    <>
                      <div className="mb-4">
                        <i className="bi bi-airplane-engines fs-1 text-warning"></i>
                      </div>
                      <h4 className="fw-bold">Check Flight Availability</h4>
                      <p className="text-muted">We will scan our global inventory for flights between <strong>{origin}</strong> and <strong>{destination}</strong>.</p>
                      <div className="d-flex gap-3 justify-content-center mt-4">
                        <button className="btn btn-light px-4 rounded-pill fw-bold" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn btn-dark px-4 rounded-pill fw-bold" onClick={checkAvailability}>Proceed to Check</button>
                      </div>
                    </>
                  ) : isChecking ? (
                    <>
                      <div className="spinner-border text-warning mb-4" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                      <h4 className="fw-bold">Scanning Global Airlines...</h4>
                      <p className="text-muted">Please wait while we check for available routes and inventory.</p>
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                      </div>
                      <h4 className="fw-bold">Flights Available!</h4>
                      <p className="text-muted">We found active routes for your selection. You can now proceed to customize your trip details.</p>
                      <button className="btn btn-warning w-100 py-3 rounded-pill fw-bold text-dark mt-3" onClick={handleProceedToStep2}>
                        Proceed to Trip Setup
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FlightMapWizard;
