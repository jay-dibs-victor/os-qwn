import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../core/api/apiClient';
import { useAuthStore } from '../../core/store/useAuthStore';
import { useUIStore } from '../../core/store/useUIStore';

// Icons
const IconCar       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="7" cy="17" r="1"/><circle cx="17" cy="17" r="1"/></svg>;
const IconRoute     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M12 6h3a3 3 0 0 1 3 3v6M6 9v6a3 3 0 0 0 3 3h3"/></svg>;
const IconCheck     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconArrow     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconTrash     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconInfo      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;

const CATEGORIES = [
  { id: 'road',             title: 'Road Trip',         desc: 'Plan a long distance or multi-stop journey.',      icon: '🚗', color: '#FFB800' },
  { id: 'courier_dispatch', title: 'Quick Dispatch',    desc: 'On-demand rider for local multi-stop delivery.',  icon: '🛵', color: '#2ed573' },
  { id: 'flight',           title: 'Flight Scheduler',  desc: 'Book airport transfers linked to your flights.',   icon: '✈️', color: '#1e90ff' },
  { id: 'courier_shipping', title: 'Shipping',          desc: 'Sea & International freight logistics.',          icon: '🚢', color: '#747d8c' },
  { id: 'train',            title: 'Train Booking',     desc: 'Reserve interstate rail travel seats.',             icon: '🚆', color: '#ff4757' },
  { id: 'api',              title: 'API Integration',   desc: 'Connect your business logistics via API.',         icon: '🔗', color: '#5352ed' },
];

const STEPS = [
  { id: 1, label: 'Choose Service',   desc: 'Select transport category', icon: <IconCar /> },
  { id: 2, label: 'Itinerary & Route', desc: 'Stops, dates & preferences', icon: <IconRoute /> },
  { id: 3, label: 'Checkout Summary',  desc: 'Finalize scheduled trip',    icon: <IconCheck /> },
];

const blacklistedCountries = ['Somalia', 'Yemen', 'Syria', 'Afghanistan', 'Iraq', 'South Sudan'];

function OsmAddressSearch({ placeholder, value, onChange, onLocationSelect, inputClassName, countryCode }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ignoreSearchRef = useRef(false);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    if (ignoreSearchRef.current) {
      ignoreSearchRef.current = false;
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const ccParam = countryCode ? `&countrycodes=${countryCode}` : '';
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5${ccParam}`
        );
        const data = await response.json();
        const formatted = data.map(item => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }));
        setSuggestions(formatted);
        setIsOpen(true);
      } catch (err) {
        console.error('OSM Nominatim error:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, countryCode]);

  const handleSelect = (item) => {
    ignoreSearchRef.current = true;
    setQuery(item.display_name);
    setSuggestions([]);
    setIsOpen(false);
    onChange(item.display_name);
    onLocationSelect({
      lat: item.lat,
      lng: item.lng,
      display_name: item.display_name
    });
  };

  return (
    <div className="osm-search-container">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onBlur={() => {
          setTimeout(() => setIsOpen(false), 250);
        }}
        className={inputClassName}
      />
      {loading && (
        <div className="osm-loading-indicator">
          <svg className="osm-spinner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
          </svg>
        </div>
      )}
      {isOpen && suggestions.length > 0 && (
        <ul className="osm-dropdown">
          {suggestions.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className="osm-suggestion-item"
            >
              📍 {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Reserve() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState('road'); // 'road', 'dispatch'
  const [loading, setLoading] = useState(false);

  const [countryCode, setCountryCode] = useState(() => {
    try {
      const locale = navigator.language || (navigator.languages && navigator.languages[0]);
      if (locale && locale.includes('-')) {
        return locale.split('-')[1].toLowerCase();
      }
    } catch (e) {}
    return 'ng';
  });

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.country_code) {
          setCountryCode(data.country_code.toLowerCase());
        }
      })
      .catch(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                const resData = await response.json();
                if (resData && resData.address && resData.address.country_code) {
                  setCountryCode(resData.address.country_code.toLowerCase());
                }
              } catch (e) {}
            },
            () => {}
          );
        }
      });
  }, []);

  // ─── Road Trip Itineraries ────────────────────────────────────────────────
  const [itineraries, setItineraries] = useState([]);
  const [currentItinerary, setCurrentItinerary] = useState({
    pickup: '', pickupCoords: null,
    destination: '', destinationCoords: null,
    date: '', time: '',
    driverOption: 'driver', // 'driver' or 'self-driven'
    cityOption: 'Intra City', // 'Intra City' or 'Inter City'
    hours: ''
  });

  // Self-driven Verification Modal
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [verificationData, setVerificationData] = useState({
    ssn: '', idNumber: '', license: '', agreed: false
  });

  // ─── Quick Dispatch State ──────────────────────────────────────────────────
  const [dispatchData, setDispatchData] = useState({
    pickup: '', pickupCoords: null,
    dropoff: '', dropoffCoords: null,
    type: 'Parcel', // Document, Parcel, Fragile
    weight: 1,
    isFragile: false,
    receiverPhone: '',
    deliveryType: 'Scheduled',
    scheduledDate: '', scheduledTime: ''
  });
  const [dispatchDistance, setDispatchDistance] = useState(0);
  const [dispatchFare, setDispatchFare] = useState(0);

  const [currency, setCurrency] = useState({ symbol: '₦', rate: 1500 });

  useEffect(() => {
    const p = dispatchData.pickupCoords;
    if (p) {
      apiClient.get('/rides/currency-info', { params: { lat: p.lat, lng: p.lng } })
        .then(({ data }) => {
          if (data.status === 200) {
            setCurrency({ symbol: data.data.symbol || '₦', rate: data.data.rate || 1500 });
          }
        }).catch(() => {});
    }
  }, [dispatchData.pickupCoords]);

  // Quick Dispatch Fare calculation
  useEffect(() => {
    const p = dispatchData.pickupCoords;
    const d = dispatchData.dropoffCoords;
    if (p && d) {
      const km = haversineKm(p.lat, p.lng, d.lat, d.lng);
      setDispatchDistance(km);
      // Mock Pricing Factor in USD
      const baseFare = 0.50;
      const perKm = 0.12;
      const weightExtra = Math.max(0, dispatchData.weight - 5) * 0.05;
      const totalUSD = baseFare + km * perKm + weightExtra + (dispatchData.isFragile ? 0.35 : 0);
      const totalLocal = Math.max(1.00, totalUSD) * currency.rate;
      setDispatchFare(Math.round(totalLocal));
    }
  }, [dispatchData.pickupCoords, dispatchData.dropoffCoords, dispatchData.weight, dispatchData.isFragile, currency]);

  const haversineKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371, toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ─── Road Trip Operations ───────────────────────────────────────────────
  const handleDriverOptionChange = (val) => {
    const isBlacklisted = blacklistedCountries.some(country => 
      currentItinerary.pickup.toLowerCase().includes(country.toLowerCase())
    );

    if (val === 'self-driven' && isBlacklisted) {
      setShowIdentityForm(true);
    } else {
      setCurrentItinerary({ ...currentItinerary, driverOption: val });
    }
  };

  const handleVerificationSubmit = (e) => {
    e.preventDefault();
    if (!verificationData.agreed) return;
    setShowIdentityForm(false);
    setCurrentItinerary({ ...currentItinerary, driverOption: 'self-driven' });
  };

  const addItinerary = (e) => {
    e.preventDefault();
    if (!currentItinerary.pickup || !currentItinerary.destination || !currentItinerary.date) return;

    setItineraries([...itineraries, { ...currentItinerary, id: Date.now() }]);
    // Chain destination to the next pickup
    setCurrentItinerary({
      ...currentItinerary,
      pickup: currentItinerary.destination,
      pickupCoords: currentItinerary.destinationCoords,
      destination: '',
      destinationCoords: null,
      hours: ''
    });
  };

  const removeItinerary = (id) => {
    setItineraries(itineraries.filter(iti => iti.id !== id));
  };

  // ─── Flow Navigation ─────────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) {
      if (bookingType === 'road') return itineraries.length > 0;
      if (bookingType === 'dispatch') {
        return dispatchData.pickupCoords && 
               dispatchData.dropoffCoords && 
               dispatchData.scheduledDate && 
               dispatchData.scheduledTime && 
               dispatchData.receiverPhone.trim();
      }
    }
    return true;
  };

  const handleCategorySelect = (id) => {
    if (id === 'road') {
      setBookingType('road');
      setStep(2);
    } else if (id === 'courier_dispatch') {
      setBookingType('dispatch');
      setStep(2);
    } else if (id === 'flight') {
      navigate('/flights');
    } else if (id === 'courier_shipping') {
      navigate('/shipping');
    } else {
      alert(`${id.replace('_', ' ')} booking services are coming soon!`);
    }
  };

  const handleFinalCheckout = () => {
    if (bookingType === 'road') {
      navigate('/checkout', { state: { bookingType: 'PLANNED', itineraries } });
    } else {
      // Dispatch payload
      navigate('/checkout', { 
        state: { 
          bookingType: 'COURIER_DISPATCH', 
          dispatchDetails: {
            ...dispatchData,
            distance: dispatchDistance,
            fare: dispatchFare
          }
        } 
      });
    }
  };

  return (
    <div className="reserve-page-wrapper">
      <div className="reserve-split-container">
        
        {/* Left Pane: Stepper progress */}
        <div className="reserve-left-pane">
          <div className="r-left-header">
            <h1 className="r-page-title">Trip Scheduler</h1>
            <p className="r-page-subtitle">Schedule airport pickups, inter-city road trips, and same-day dispatch.</p>
          </div>

          <div className="r-vertical-stepper">
            {STEPS.map((s, index) => {
              const isDone = step > s.id;
              const isActive = step === s.id;
              return (
                <div key={s.id} className={`r-v-step ${isDone ? 'done' : isActive ? 'active' : 'idle'}`}>
                  <div className="r-v-step-indicator">
                    <div className="r-v-step-icon">
                      {isDone ? <IconCheck /> : s.icon}
                    </div>
                    {index < STEPS.length - 1 && <div className="r-v-step-line" />}
                  </div>
                  <div className="r-v-step-text">
                    <span className="r-v-step-label">{s.label}</span>
                    <span className="r-v-step-desc">{s.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Main functionality */}
        <div className="reserve-right-pane">
          <div className="r-form-card">
            
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Select Service Category */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="r-step-title">Select Transportation Service</h3>
                  <p className="r-step-subtitle">What logistics service would you like to schedule today?</p>

                  <div className="r-category-grid">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        className="r-category-tile"
                        onClick={() => handleCategorySelect(cat.id)}
                      >
                        <span className="r-cat-icon-container" style={{ background: `${cat.color}15` }}>
                          <span style={{ fontSize: '28px' }}>{cat.icon}</span>
                        </span>
                        <div className="r-cat-info">
                          <h4 className="r-cat-title">{cat.title}</h4>
                          <p className="r-cat-desc">{cat.desc}</p>
                        </div>
                        <span className="r-cat-arrow">→</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Route & Schedule Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  
                  {/* ROAD TRIP ROUTING FLOW */}
                  {bookingType === 'road' && (
                    <div className="r-road-flow">
                      <h3 className="r-step-title">Configure Road Trip Stops</h3>
                      <p className="r-step-subtitle">Add one or more destination legs to build your planned trip.</p>

                      {/* Add Stop Form */}
                      <form onSubmit={addItinerary} className="r-road-form">
                        <div className="r-form-row">
                          <div className="r-form-group">
                            <label className="r-field-label">Pickup Address *</label>
                            <div className="r-search-field-wrapper">
                              <span className="r-sf-indicator pickup" />
                              <OsmAddressSearch
                                placeholder="e.g. Murtala Muhammed Airport"
                                value={currentItinerary.pickup}
                                onChange={val => setCurrentItinerary(c => ({ ...c, pickup: val }))}
                                onLocationSelect={loc => setCurrentItinerary(c => ({ ...c, pickupCoords: loc }))}
                                inputClassName="r-text-input r-search-input"
                                countryCode={countryCode}
                              />
                            </div>
                          </div>

                          <div className="r-form-group mt-3">
                            <label className="r-field-label">Destination Leg Address *</label>
                            <div className="r-search-field-wrapper">
                              <span className="r-sf-indicator dropoff" />
                              <OsmAddressSearch
                                placeholder="e.g. Lekki Phase 1"
                                value={currentItinerary.destination}
                                onChange={val => setCurrentItinerary(c => ({ ...c, destination: val }))}
                                onLocationSelect={loc => setCurrentItinerary(c => ({ ...c, destinationCoords: loc }))}
                                inputClassName="r-text-input r-search-input"
                                countryCode={countryCode}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="r-form-row-split mt-3">
                          <div className="r-form-group">
                            <label className="r-field-label">Schedule Date</label>
                            <input
                              type="date"
                              required
                              value={currentItinerary.date}
                              onChange={e => setCurrentItinerary(c => ({ ...c, date: e.target.value }))}
                              className="r-text-input"
                            />
                          </div>

                          <div className="r-form-group">
                            <label className="r-field-label">Schedule Time</label>
                            <input
                              type="time"
                              required
                              value={currentItinerary.time}
                              onChange={e => setCurrentItinerary(c => ({ ...c, time: e.target.value }))}
                              className="r-text-input"
                            />
                          </div>
                        </div>

                        <div className="r-form-row-split mt-3">
                          <div className="r-form-group">
                            <label className="r-field-label">Trip Scale</label>
                            <select
                              value={currentItinerary.cityOption}
                              onChange={e => setCurrentItinerary(c => ({ ...c, cityOption: e.target.value }))}
                              className="r-select-input"
                            >
                              <option value="Intra City">Intra City (Within Metro Area)</option>
                              <option value="Inter City">Inter City (Cross State)</option>
                            </select>
                          </div>

                          {currentItinerary.cityOption === 'Intra City' && (
                            <div className="r-form-group">
                              <label className="r-field-label">Duration (Hours)</label>
                              <input
                                type="number"
                                placeholder="Hours (optional)"
                                value={currentItinerary.hours}
                                onChange={e => setCurrentItinerary(c => ({ ...c, hours: e.target.value }))}
                                className="r-text-input"
                              />
                            </div>
                          )}
                        </div>

                        <div className="r-form-group mt-3">
                          <label className="r-field-label">Driver Allocation</label>
                          <div className="r-driver-toggle">
                            <button
                              type="button"
                              className={`r-dt-btn ${currentItinerary.driverOption === 'driver' ? 'active' : ''}`}
                              onClick={() => handleDriverOptionChange('driver')}
                            >
                              👨‍✈️ Allocate Chauffeur
                            </button>
                            <button
                              type="button"
                              className={`r-dt-btn ${currentItinerary.driverOption === 'self-driven' ? 'active' : ''}`}
                              onClick={() => handleDriverOptionChange('self-driven')}
                            >
                              🔑 Self-Driven Booking
                            </button>
                          </div>
                        </div>

                        <button type="submit" className="r-btn-add-stop mt-4">
                          + Add Stop to Itinerary
                        </button>
                      </form>

                      {/* Itinerary Preview List */}
                      {itineraries.length > 0 && (
                        <div className="r-itinerary-preview-list mt-4">
                          <label className="r-field-label">Planned Route Timeline</label>
                          <div className="r-timeline">
                            {itineraries.map((iti, idx) => (
                              <div key={iti.id} className="r-timeline-item">
                                <span className="r-t-badge">{idx + 1}</span>
                                <div className="r-t-details">
                                  <div className="r-t-route">
                                    <span>{iti.pickup?.split(',')[0]}</span>
                                    <span className="r-t-arrow">→</span>
                                    <span>{iti.destination?.split(',')[0]}</span>
                                  </div>
                                  <div className="r-t-meta">
                                    Date: {iti.date} · Time: {iti.time} · {iti.cityOption} · Driver: {iti.driverOption}
                                  </div>
                                </div>
                                <button className="r-btn-trash" onClick={() => removeItinerary(iti.id)}>
                                  <IconTrash />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* QUICK DISPATCH ROUTING FLOW */}
                  {bookingType === 'dispatch' && (
                    <div className="r-dispatch-flow">
                      <h3 className="r-step-title">Schedule Dispatch Route</h3>
                      <p className="r-step-subtitle">Specify locations and pickup window for logistics dispatch.</p>

                      <div className="r-form-group">
                        <label className="r-field-label">Pickup Address *</label>
                        <div className="r-search-field-wrapper">
                          <span className="r-sf-indicator pickup" />
                          <OsmAddressSearch
                            placeholder="e.g. Murtala Muhammed Airport"
                            value={dispatchData.pickup}
                            onChange={val => setDispatchData(d => ({ ...d, pickup: val }))}
                            onLocationSelect={loc => setDispatchData(d => ({ ...d, pickupCoords: loc }))}
                            inputClassName="r-text-input r-search-input"
                            countryCode={countryCode}
                          />
                        </div>
                      </div>

                      <div className="r-form-group mt-3">
                        <label className="r-field-label">Delivery Address *</label>
                        <div className="r-search-field-wrapper">
                          <span className="r-sf-indicator dropoff" />
                          <OsmAddressSearch
                            placeholder="e.g. Lekki Phase 1"
                            value={dispatchData.dropoff}
                            onChange={val => setDispatchData(d => ({ ...d, dropoff: val }))}
                            onLocationSelect={loc => setDispatchData(d => ({ ...d, dropoffCoords: loc }))}
                            inputClassName="r-text-input r-search-input"
                            countryCode={countryCode}
                          />
                        </div>
                      </div>

                      <div className="r-form-row-split mt-3">
                        <div className="r-form-group">
                          <label className="r-field-label">Scheduled Date *</label>
                          <input
                            type="date"
                            required
                            value={dispatchData.scheduledDate}
                            onChange={e => setDispatchData(d => ({ ...d, scheduledDate: e.target.value }))}
                            className="r-text-input"
                          />
                        </div>

                        <div className="r-form-group">
                          <label className="r-field-label">Scheduled Time *</label>
                          <input
                            type="time"
                            required
                            value={dispatchData.scheduledTime}
                            onChange={e => setDispatchData(d => ({ ...d, scheduledTime: e.target.value }))}
                            className="r-text-input"
                          />
                        </div>
                      </div>

                      <div className="r-form-row-split mt-3">
                        <div className="r-form-group">
                          <label className="r-field-label">Receiver Phone Number *</label>
                          <input
                            type="tel"
                            placeholder="+234 800 000 0000"
                            value={dispatchData.receiverPhone}
                            onChange={e => setDispatchData(d => ({ ...d, receiverPhone: e.target.value }))}
                            className="r-text-input"
                          />
                        </div>

                        <div className="r-form-group">
                          <label className="r-field-label">Parcel Category</label>
                          <select
                            value={dispatchData.type}
                            onChange={e => setDispatchData(d => ({ ...d, type: e.target.value }))}
                            className="r-select-input"
                          >
                            <option value="Parcel">Standard Parcel Box</option>
                            <option value="Document">Important Documents</option>
                            <option value="Fragile">Fragile Items</option>
                          </select>
                        </div>
                      </div>

                      <div className="r-form-row-split mt-3">
                        <div className="r-form-group">
                          <label className="r-field-label">
                            Weight (kg)
                            <span className="c-label-value">{dispatchData.weight} kg</span>
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="30"
                            step="1"
                            value={dispatchData.weight}
                            onChange={e => setDispatchData(d => ({ ...d, weight: parseInt(e.target.value) }))}
                            className="r-range-slider"
                          />
                        </div>

                        <div className="r-form-group" style={{ justifyContent: 'center' }}>
                          <label className="r-checkbox-label">
                            <input
                              type="checkbox"
                              checked={dispatchData.isFragile}
                              onChange={e => setDispatchData(d => ({ ...d, isFragile: e.target.checked }))}
                            />
                            <span className="r-checkbox-custom"><IconInfo /></span>
                            <span>Contains Fragile Materials (+{currency.symbol}{Math.round(0.35 * currency.rate)})</span>
                          </label>
                        </div>
                      </div>

                      {dispatchDistance > 0 && (
                        <div className="r-dispatch-summary-box mt-4">
                          <span>Route Distance: <strong>{dispatchDistance.toFixed(1)} km</strong></span>
                          <span>Billed Estimate: <strong>{currency.symbol}{dispatchFare.toLocaleString()}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              )}

              {/* STEP 3: Review & Final Checkout */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="r-step-title">Review Schedule Booking</h3>
                  <p className="r-step-subtitle">Verify the details of your scheduling request before checkout.</p>

                  {bookingType === 'road' ? (
                    <div className="r-checkout-summary-card">
                      <h4 className="rc-heading">Road Trip Scheduled Legs ({itineraries.length})</h4>
                      <div className="rc-itinerary-timeline">
                        {itineraries.map((iti, idx) => (
                          <div key={iti.id} className="rc-timeline-item">
                            <span className="rc-t-badge">{idx + 1}</span>
                            <div className="rc-t-details">
                              <div className="rc-t-route">
                                <strong>{iti.pickup?.split(',')[0]}</strong> → <strong>{iti.destination?.split(',')[0]}</strong>
                              </div>
                              <span className="rc-t-meta">
                                📅 {iti.date} at {iti.time} · {iti.cityOption} · {iti.driverOption === 'driver' ? 'Chauffeur Allocated' : 'Self-Driven'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="rc-warning-note mt-3">
                        <IconInfo /> Fare breakdown and custom car select will load in checkout.
                      </div>
                    </div>
                  ) : (
                    <div className="r-checkout-summary-card">
                      <h4 className="rc-heading">Dispatch Route Summary</h4>
                      <div className="rc-itinerary-details">
                        <div className="rc-row">
                          <span>Pickup Address:</span>
                          <span className="rc-val">{dispatchData.pickup}</span>
                        </div>
                        <div className="rc-row">
                          <span>Delivery Address:</span>
                          <span className="rc-val">{dispatchData.dropoff}</span>
                        </div>
                        <div className="rc-row">
                          <span>Scheduled Delivery Time:</span>
                          <span className="rc-val">{dispatchData.scheduledDate} at {dispatchData.scheduledTime}</span>
                        </div>
                        <div className="rc-row">
                          <span>Recipient Phone:</span>
                          <span className="rc-val">{dispatchData.receiverPhone}</span>
                        </div>
                        <div className="rc-row">
                          <span>Parcel Type:</span>
                          <span className="rc-val">{dispatchData.type} ({dispatchData.weight} kg)</span>
                        </div>
                        <div className="rc-row total mt-3">
                          <span>Estimated Fare:</span>
                          <span className="rc-val highlight">{currency.symbol}{dispatchFare.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rc-checkout-cta mt-4">
                    <p className="rc-disclaimer-text">
                      By continuing, you agree to our Terms of Booking and security check validation rules.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Navigation Footer */}
            <div className="r-form-navigation">
              <button
                className="r-nav-btn-back"
                onClick={() => {
                  if (step === 1) navigate('/');
                  else if (step === 2) setStep(1);
                  else if (step === 3) setStep(2);
                }}
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  className={`r-nav-btn-next ${canProceed() ? '' : 'disabled'}`}
                  disabled={!canProceed()}
                  onClick={() => setStep(s => s + 1)}
                >
                  Continue <IconArrow />
                </button>
              ) : (
                <button
                  className="r-nav-btn-submit"
                  onClick={handleFinalCheckout}
                >
                  Proceed to Checkout
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Security Check Verification Modal */}
      {showIdentityForm && (
        <div className="r-modal-overlay">
          <div className="r-security-modal">
            <h4 className="r-modal-title">🔐 Self-Driven Identity Verification</h4>
            <p className="r-modal-desc">
              Due to local regulatory rules in this pickup region, self-driven bookings require prior identity check logs.
            </p>
            <form onSubmit={handleVerificationSubmit} className="r-modal-form">
              <div className="r-form-group">
                <label className="r-field-label">Social Security Number / SSN *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter SSN"
                  value={verificationData.ssn}
                  onChange={e => setVerificationData(v => ({ ...v, ssn: e.target.value }))}
                  className="r-text-input"
                />
              </div>

              <div className="r-form-group mt-3">
                <label className="r-field-label">National ID Number *</label>
                <input
                  type="text"
                  required
                  placeholder="ID Card Number"
                  value={verificationData.idNumber}
                  onChange={e => setVerificationData(v => ({ ...v, idNumber: e.target.value }))}
                  className="r-text-input"
                />
              </div>

              <div className="r-form-group mt-3">
                <label className="r-field-label">Driver License Number *</label>
                <input
                  type="text"
                  required
                  placeholder="License Number"
                  value={verificationData.license}
                  onChange={e => setVerificationData(v => ({ ...v, license: e.target.value }))}
                  className="r-text-input"
                />
              </div>

              <div className="r-form-group mt-3">
                <label className="r-checkbox-label">
                  <input
                    type="checkbox"
                    required
                    checked={verificationData.agreed}
                    onChange={e => setVerificationData(v => ({ ...v, agreed: e.target.checked }))}
                  />
                  <span>I authorize background check logs for car rental verification</span>
                </label>
              </div>

              <div className="r-modal-actions mt-4">
                <button type="submit" className="r-modal-submit">Verify & Confirm</button>
                <button type="button" className="r-modal-cancel" onClick={() => {
                  setShowIdentityForm(false);
                  setCurrentItinerary(c => ({ ...c, driverOption: 'driver' }));
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .reserve-page-wrapper {
          min-height: calc(100vh - 80px);
          background: radial-gradient(circle at center, #0b0b0e 0%, #000000 100%);
          color: #ffffff;
          padding: 60px 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .reserve-split-container {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 60px;
          max-width: 1100px;
          width: 100%;
        }

        /* Left Stepper */
        .reserve-left-pane {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .r-page-title {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: #ffffff;
          margin: 0 0 10px 0;
        }

        .r-page-subtitle {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }

        .r-vertical-stepper {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .r-v-step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: all 0.3s ease;
        }

        .r-v-step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .r-v-step-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
          transition: all 0.3s ease;
        }

        .r-v-step-line {
          width: 2px;
          height: 40px;
          background: rgba(255, 255, 255, 0.08);
          margin-top: 6px;
        }

        .r-v-step-text {
          display: flex;
          flex-direction: column;
          margin-top: 4px;
        }

        .r-v-step-label {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          transition: all 0.3s ease;
        }

        .r-v-step-desc {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          margin-top: 2px;
        }

        /* State colors */
        .r-v-step.active .r-v-step-icon {
          background: rgba(255, 184, 0, 0.1);
          border-color: #FFB800;
          color: #FFB800;
          box-shadow: 0 0 15px rgba(255, 184, 0, 0.2);
        }

        .r-v-step.active .r-v-step-label {
          color: #ffffff;
        }

        .r-v-step.done .r-v-step-icon {
          background: #FFB800;
          border-color: #FFB800;
          color: #000;
        }

        .r-v-step.done .r-v-step-label {
          color: rgba(255,255,255,0.85);
        }

        .r-v-step.done .r-v-step-line {
          background: #FFB800;
        }

        /* Right Panel Cards */
        .reserve-right-pane {
          display: flex;
          flex-direction: column;
        }

        .r-form-card {
          background: rgba(18, 18, 20, 0.55);
          border: none;
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(20px);
          box-shadow: none;
        }

        .r-step-title {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 6px 0;
        }

        .r-step-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin: 0 0 32px 0;
        }

        /* Category Selection Grid */
        .r-category-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .r-category-tile {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: left;
          width: 100%;
        }

        .r-category-tile:hover {
          border-color: #FFB800;
          background: rgba(255, 184, 0, 0.03);
          transform: translateX(4px);
        }

        .r-cat-icon-container {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .r-cat-info {
          flex: 1;
        }

        .r-cat-title {
          font-size: 15px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 4px 0;
        }

        .r-cat-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          margin: 0;
          line-height: 1.4;
        }

        .r-cat-arrow {
          font-size: 18px;
          color: rgba(255,255,255,0.25);
          transition: all 0.2s;
        }

        .r-category-tile:hover .r-cat-arrow {
          color: #FFB800;
          transform: translateX(3px);
        }

        /* Form Controls */
        .r-form-group {
          display: flex;
          flex-direction: column;
        }

        .r-field-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 10px;
          letter-spacing: 0.8px;
        }

        .r-form-row-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* ── Shared input foundations ─────────────────────────── */
        .r-text-input, .r-select-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 13px 16px;
          color: #ffffff;
          font-size: 14px;
          font-family: inherit;
          line-height: 1.5;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          color-scheme: dark;
        }

        .r-text-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
          font-weight: 400;
        }

        .r-text-input:hover, .r-select-input:hover {
          border-color: rgba(255, 255, 255, 0.18);
        }

        .r-text-input:focus, .r-select-input:focus {
          border-color: #FFB800;
          background: rgba(255, 184, 0, 0.04);
          box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.12);
        }

        .r-select-input option {
          background: #121214;
          color: #fff;
        }

        /* ── Location Search Wrapper ──────────────────────────── */
        .r-search-field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .r-sf-indicator {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          position: absolute;
          left: 15px;
          z-index: 2;
          flex-shrink: 0;
        }

        .r-sf-indicator.pickup {
          background: #FFB800;
          box-shadow: 0 0 8px rgba(255,184,0,0.6);
        }

        .r-sf-indicator.dropoff {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16,185,129,0.6);
        }

        .r-search-input {
          padding-left: 36px !important;
        }

        .osm-search-container {
          position: relative;
          width: 100%;
        }

        .osm-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #111113;
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-top: 6px;
          padding: 6px 0;
          list-style: none;
          max-height: 200px;
          overflow-y: auto;
          z-index: 9999;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.55);
        }

        .osm-suggestion-item {
          padding: 12px 16px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: background 0.2s, color 0.2s;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .osm-suggestion-item:last-child {
          border-bottom: none;
        }

        .osm-suggestion-item:hover {
          background: rgba(255, 184, 0, 0.08);
          color: #FFB800;
        }

        .osm-loading-indicator {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .osm-spinner-icon {
          animation: osm-spin 0.8s linear infinite;
          color: #FFB800;
        }

        @keyframes osm-spin {
          100% {
            transform: rotate(360deg);
          }
        }

        /* Drivers Allocation toggle */
        .r-driver-toggle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .r-dt-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px;
          color: rgba(255,255,255,0.65);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .r-dt-btn:hover {
          border-color: rgba(255, 184, 0, 0.3);
          color: #fff;
        }

        .r-dt-btn.active {
          border-color: #FFB800;
          background: rgba(255, 184, 0, 0.08);
          color: #FFB800;
        }

        .r-btn-add-stop {
          background: rgba(255,184,0,0.1);
          color: #FFB800;
          border: 1px dashed rgba(255,184,0,0.4);
          border-radius: 12px;
          padding: 14px;
          width: 100%;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .r-btn-add-stop:hover {
          background: rgba(255,184,0,0.18);
          border-color: #FFB800;
        }

        /* Timeline Preview list */
        .r-itinerary-preview-list {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 24px;
        }

        .r-timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .r-timeline-item {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .r-t-badge {
          width: 24px;
          height: 24px;
          background: rgba(255, 184, 0, 0.1);
          border: 1px solid rgba(255, 184, 0, 0.3);
          border-radius: 50%;
          color: #FFB800;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .r-t-details {
          flex: 1;
        }

        .r-t-route {
          font-size: 13px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .r-t-arrow {
          color: #FFB800;
        }

        .r-t-meta {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          margin-top: 3px;
        }

        .r-btn-trash {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          transition: all 0.2s;
          padding: 6px;
        }

        .r-btn-trash:hover {
          color: #ff4757;
        }

        /* Checkbox */
        .r-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
        }

        .r-checkbox-custom {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1.5px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          font-size: 10px;
          flex-shrink: 0;
        }

        .r-checkbox-label input {
          display: none;
        }

        .r-checkbox-label input:checked + .r-checkbox-custom {
          background: #FFB800;
          border-color: #FFB800;
          color: #000;
        }

        .r-range-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 5px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          outline: none;
        }

        .r-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #FFB800;
          cursor: pointer;
        }

        .r-dispatch-summary-box {
          background: rgba(255, 184, 0, 0.05);
          border: 1px dashed rgba(255, 184, 0, 0.25);
          border-radius: 12px;
          padding: 12px 18px;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          color: rgba(255,255,255,0.95);
        }

        /* Checkout summary */
        .r-checkout-summary-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
        }

        .rc-heading {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          color: #FFB800;
          margin-bottom: 18px;
          letter-spacing: 0.5px;
        }

        .rc-itinerary-timeline, .rc-itinerary-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rc-timeline-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .rc-t-badge {
          width: 22px;
          height: 22px;
          background: rgba(255,184,0,0.1);
          border: 1px solid rgba(255,184,0,0.35);
          border-radius: 50%;
          color: #FFB800;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .rc-t-route {
          font-size: 13.5px;
          color: #fff;
        }

        .rc-t-meta {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          display: block;
          margin-top: 4px;
        }

        .rc-warning-note {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.02);
          border-radius: 8px;
          padding: 8px 12px;
        }

        .rc-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: rgba(255,255,255,0.7);
        }

        .rc-val {
          color: #fff;
          font-weight: 600;
        }

        .rc-val.highlight {
          color: #FFB800;
          font-weight: 800;
          font-size: 15px;
        }

        .rc-row.total {
          border-top: 1px dashed rgba(255,255,255,0.1);
          padding-top: 12px;
          margin-top: 4px;
        }

        .rc-disclaimer-text {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          line-height: 1.5;
          text-align: center;
          margin: 0;
        }

        /* Nav Footer Buttons */
        .r-form-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 36px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 24px;
        }

        .r-nav-btn-back {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.5);
          border-radius: 10px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .r-nav-btn-back:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.3);
        }

        .r-nav-btn-next {
          background: #FFB800;
          border: none;
          color: #000;
          border-radius: 10px;
          padding: 10px 24px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .r-nav-btn-next:hover {
          background: #e5a500;
        }

        .r-nav-btn-next.disabled {
          background: rgba(255,184,0,0.2);
          color: rgba(0,0,0,0.4);
          cursor: not-allowed;
        }

        .r-nav-btn-submit {
          background: #FFB800;
          border: none;
          color: #000;
          border-radius: 10px;
          padding: 10px 24px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .r-nav-btn-submit:hover {
          background: #e5a500;
        }

        /* Identity Verification Modal */
        .r-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .r-security-modal {
          background: #111113;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          max-width: 440px;
          width: 100%;
          color: #fff;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }

        .r-modal-title {
          font-size: 18px;
          font-weight: 800;
          color: #FFB800;
          margin-bottom: 8px;
        }

        .r-modal-desc {
          font-size: 12.5px;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .r-modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .r-modal-submit {
          background: #FFB800;
          border: none;
          color: #000;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .r-modal-submit:hover {
          background: #e5a500;
        }

        .r-modal-cancel {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.6);
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
        }

        .r-modal-cancel:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.3);
        }

        /* Mobile adaptation */
        @media (max-width: 768px) {
          .reserve-page-wrapper {
            padding: 24px 16px;
          }
          .reserve-split-container {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .reserve-left-pane {
            gap: 20px;
          }
          .r-vertical-stepper {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            overflow-x: auto;
            gap: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }
          .r-v-step {
            flex-shrink: 0;
            gap: 8px;
          }
          .r-v-step-line {
            display: none;
          }
          .r-v-step-text {
            display: none;
          }
          .r-form-card {
            padding: 24px 16px;
            border-radius: 16px;
          }
          .r-form-row-split, .r-driver-toggle {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
