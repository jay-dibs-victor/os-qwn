import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFlightStore } from '../../../core/store/useFlightStore';
import AnimatedHeroBackground from '../Home/AnimatedHeroBackground';
import LocationSearch from '../../../core/components/LocationSearch';
import apiClient from '../../../core/api/apiClient';
import FlightResults from './FlightResults';
import { Link } from 'react-router-dom';
import FlightLotteryModal from './gamification/FlightLotteryModal';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { useUIStore } from '../../../core/store/useUIStore';
import worldMapSvg from './world_map.svg';
import './flight.css';

const FlightSearchHome = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('book');
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [tripType, setTripType] = useState('one-way');
  const [isLotteryModalOpen, setIsLotteryModalOpen] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();

  const {
    searchParams, setSearchParams,
    flights, setFlights,
    isLoading, setLoading,
    error, setError,
    selectFlight,
    multiCityLegs, updateMultiCityLeg, addMultiCityLeg, removeMultiCityLeg,
    clearCart
  } = useFlightStore();

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const { data } = await apiClient.get('/flights/search', { params: { destinationAirportCode: 'LHR' } });
        if (data.status === 200) {
          setPopularRoutes(data.data.slice(0, 3));
        }
      } catch (e) {
        console.error("Failed to fetch popular flights");
      }
    };
    fetchPopular();
  }, []);

  const handleFlyForFreeClick = () => {
    if (!isAuthenticated()) {
      openAuthModal('login');
    } else {
      setIsLotteryModalOpen(true);
    }
  };

  const handleSearch = async () => {
    if (tripType === 'multi-city') {
      handleMultiCitySearch();
      return;
    }
    setSearchParams({ tripType });
    setLoading(true);
    setError(null);
    setShowResults(true);
    try {
      const { data } = await apiClient.get('/flights/search', {
        params: {
          sourceAirportCode: searchParams.origin,
          destinationAirportCode: searchParams.destination,
          departureDate: searchParams.departureDate
        }
      });
      if (data.status === 200) {
        setFlights(data.data);
      }
    } catch (err) {
      setError('Failed to fetch flights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Multi-city: search the first leg, route to results, user adds each to cart
  const handleMultiCitySearch = async () => {
    const validLegs = multiCityLegs.filter(l => l.origin && l.destination);
    if (validLegs.length < 2) {
      alert('Please fill in at least 2 city legs.');
      return;
    }
    clearCart();
    setSearchParams({ tripType: 'multi-city', origin: validLegs[0].origin, destination: validLegs[0].destination, departureDate: validLegs[0].departureDate });
    setLoading(true);
    setError(null);
    setShowResults(true);
    try {
      // Search the first leg; user will add to cart, then we automatically search next legs
      const { data } = await apiClient.get('/flights/search', {
        params: {
          sourceAirportCode: validLegs[0].origin,
          destinationAirportCode: validLegs[0].destination,
          departureDate: validLegs[0].departureDate
        }
      });
      if (data.status === 200) {
        setFlights(data.data);
      } else {
        setFlights([]);
      }
    } catch (err) {
      setError('Failed to fetch flights for leg 1.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flight-home-v2" style={{ backgroundColor: 'var(--flight-secondary)', minHeight: '100vh' }}>
      {/* ── Hero Section (Matching Pic 3) ─────────────────── */}
      <section className="hero-v2 position-relative" style={{ minHeight: '600px', overflow: 'hidden' }}>
        <AnimatedHeroBackground />
        <div className="container hero-container position-relative" style={{ zIndex: 2 }}>
          <div className="hero-content-v2 row align-items-center pt-5">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="hero-text-v2 col-lg-6"
            >
              <h1 className="display-1 fw-bold">READY TO <br /> <span className="text-primary">TAKE OFF?</span></h1>
              <p className="lead text-muted mt-3">Turn your extra space into your next opportunity. Explore the world with ease.</p>
              <button 
                className="btn btn-primary btn-lg px-5 py-3 mt-4 rounded-pill"
                onClick={handleFlyForFreeClick}
              >
                Fly For Free
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hero-image-v2 col-lg-6 position-relative d-flex justify-content-end"
            >
              <div className="map-card-wrapper">
                {/* World Map SVG / Image */}
                <img
                  src={worldMapSvg}
                  alt="World Map"
                  className="img-fluid opacity-50 w-100"
                  style={{ filter: 'grayscale(100%) brightness(0.8)' }}
                />

                {/* Animated Pulsing Locations (15 Dots) */}
                <div className="map-pulse-dot" style={{ top: '35%', left: '22%' }}></div> {/* North America */}
                <div className="map-pulse-dot" style={{ top: '45%', left: '25%' }}></div> {/* US East Coast */}
                <div className="map-pulse-dot" style={{ top: '65%', left: '30%' }}></div> {/* South America */}
                <div className="map-pulse-dot" style={{ top: '75%', left: '35%' }}></div> {/* Brazil */}
                <div className="map-pulse-dot" style={{ top: '30%', left: '50%' }}></div> {/* Europe / UK */}
                <div className="map-pulse-dot" style={{ top: '35%', left: '55%' }}></div> {/* Central Europe */}
                <div className="map-pulse-dot" style={{ top: '45%', left: '52%' }}></div> {/* North Africa */}
                <div className="map-pulse-dot" style={{ top: '60%', left: '55%' }}></div> {/* South Africa */}
                <div className="map-pulse-dot" style={{ top: '40%', left: '65%' }}></div> {/* Middle East / DXB */}
                <div className="map-pulse-dot" style={{ top: '30%', left: '75%' }}></div> {/* Russia/Asia */}
                <div className="map-pulse-dot" style={{ top: '45%', left: '80%' }}></div> {/* India */}
                <div className="map-pulse-dot" style={{ top: '40%', left: '88%' }}></div> {/* East Asia */}
                <div className="map-pulse-dot" style={{ top: '55%', left: '85%' }}></div> {/* SE Asia */}
                <div className="map-pulse-dot" style={{ top: '75%', left: '90%' }}></div> {/* Australia */}
                <div className="map-pulse-dot" style={{ top: '80%', left: '95%' }}></div> {/* New Zealand */}

                {/* Animated Time-based Tooltip */}
                <motion.div
                  className="map-tooltip"
                  animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                  transition={{ duration: 5, repeat: Infinity, times: [0, 0.15, 0.85, 1], ease: "easeInOut" }}
                >
                  <i className="bi bi-airplane-fill" style={{ color: '#ffb800' }}></i>
                  <span>LHR ✈ DXB</span>
                </motion.div>

                {/* Floating Flight Status Card */}
                <div className="ticket-float-preview shadow-lg p-3 rounded-4 position-absolute" style={{ bottom: '-40px', left: '-80px', width: '250px' }}>
                  <div className="ticket-header d-flex justify-content-between align-items-center mb-3">
                    <span className="badge text-white" style={{ background: 'var(--color-surface-light, #121212)', border: '1px solid var(--flight-glass-border)' }}>Live Tracking</span>
                    <span className="fw-bold small" style={{ color: '#ffb800' }}>In Air</span>
                  </div>
                  <div className="ticket-body">
                    <div className="mb-2 d-flex align-items-center gap-2">
                      <img src="https://logo.clearbit.com/emirates.com" style={{ width: '20px', height: '20px', borderRadius: '4px' }} onError={(e) => e.target.style.display = 'none'} />
                      <span className="fw-bold text-muted small">Emirates EK202</span>
                    </div>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <span className="fw-bold fs-4">LHR</span>
                        <div className="flex-grow-1 mx-2 text-center position-relative">
                          <div style={{ height: '2px', background: '#eee', width: '100%' }}></div>
                          <i className="bi bi-airplane-fill position-absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(90deg)', color: '#ffb800', background: 'var(--color-surface)' }}></i>
                        </div>
                        <span className="fw-bold fs-4">DXB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Search Bar Widget (Matching Pic 3) ──────────── */}
      <div className="container position-relative" style={{ zIndex: 10, marginTop: '-80px' }}>
        <motion.div
          className="search-widget-v2 shadow-lg rounded-4 mx-auto"
          style={{ maxWidth: '1100px' }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >

          <div className="widget-tabs">
            <button className={`tab-link ${activeTab === 'my-booking' ? 'active' : ''}`} onClick={() => setActiveTab('my-booking')}>
              <i className="bi bi-journal-text me-2"></i> My Booking
            </button>
            <button className={`tab-link ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>
              <i className="bi bi-airplane-engines me-2"></i> Flight Status
            </button>
            <button className={`tab-link ${activeTab === 'charter' ? 'active' : ''}`} onClick={() => setActiveTab('charter')}>
              <i className="bi bi-airplane me-2"></i> Charter Flights <span className="badge bg-orange ms-2">New</span>
            </button>
          </div>

          <div className="widget-form">
            {/* ── Top Row: Trip Type / Passengers / Class ───── */}
            <div className="form-top-row">
              <select
                className="form-select-minimal"
                value={tripType}
                onChange={(e) => {
                  setTripType(e.target.value);
                  setSearchParams({ tripType: e.target.value });
                  setShowResults(false);
                }}
              >
                <option value="one-way">One-way</option>
                <option value="round-trip">Round-trip</option>
                <option value="multi-city">Multi-city</option>
              </select>
              <select className="form-select-minimal" value={searchParams.adults || 1} onChange={(e) => setSearchParams({ adults: Number(e.target.value) })}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
              </select>
              <select className="form-select-minimal" value={searchParams.travelClass || 'ECONOMY'} onChange={(e) => setSearchParams({ travelClass: e.target.value })}>
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">First Class</option>
              </select>
              <div className="travel-ideas">Looking for Travel Ideas? <Link to="/flights/explore" className="text-decoration-none fw-bold" style={{ color: '#ffb800' }}>Explore Map</Link></div>
            </div>

            {/* ── Standard One-way / Round-trip row ─────────── */}
            {tripType !== 'multi-city' && (
              <div className="form-main-row">
                <div className="input-with-icon position-relative" style={{ flex: 1, zIndex: 100 }}>
                  <LocationSearch
                    placeholder="Where from? (e.g. LHR, JFK)"
                    value={searchParams.origin || ''}
                    onChange={(val) => setSearchParams({ origin: val })}
                    onLocationSelect={(loc) => setSearchParams({ origin: loc.address })}
                    className="w-100 border-0 fw-semibold"
                    icon={<i className="bi bi-geo-alt" style={{ color: '#ffb800', marginRight: '10px' }}></i>}
                  />
                </div>
                <div className="swap-icon">⇄</div>
                <div className="input-with-icon position-relative" style={{ flex: 1, zIndex: 90 }}>
                  <LocationSearch
                    placeholder="Where to? (e.g. DXB, LOS)"
                    value={searchParams.destination || ''}
                    onChange={(val) => setSearchParams({ destination: val })}
                    onLocationSelect={(loc) => setSearchParams({ destination: loc.address })}
                    className="w-100 border-0 fw-semibold"
                    icon={<i className="bi bi-geo" style={{ color: '#ffb800', marginRight: '10px' }}></i>}
                  />
                </div>
                <div className="input-with-icon date-input">
                  <i className="bi bi-calendar"></i>
                  <input type="date" value={searchParams.departureDate || ''} onChange={e => setSearchParams({ departureDate: e.target.value })} />
                </div>
                {tripType === 'round-trip' && (
                  <div className="input-with-icon date-input border-end-0">
                    <i className="bi bi-calendar"></i>
                    <input type="date" value={searchParams.returnDate || ''} onChange={e => setSearchParams({ returnDate: e.target.value })} />
                  </div>
                )}
                <button className="btn-search-v2" onClick={handleSearch}>
                  <i className="bi bi-search"></i>
                </button>
              </div>
            )}

            {/* ── Multi-city legs ─────────────────────────────── */}
            {tripType === 'multi-city' && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0' }}>
                {multiCityLegs.map((leg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="form-main-row mb-2"
                    style={{ borderRadius: '10px', border: '1.5px solid #f0f0f0', overflow: 'visible', position: 'relative' }}
                  >
                    {/* Leg label */}
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', minWidth: '70px', color: '#aaa', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.5px', borderRight: '1px solid #f0f0f0' }}>
                      CITY {idx + 1}
                    </div>

                    <div className="input-with-icon" style={{ flex: 1, zIndex: 200 - idx * 10, position: 'relative' }}>
                      <LocationSearch
                        placeholder={`From city ${idx + 1}`}
                        value={leg.origin}
                        onChange={(val) => updateMultiCityLeg(idx, { origin: val })}
                        onLocationSelect={(loc) => updateMultiCityLeg(idx, { origin: loc.address })}
                        className="w-100 border-0 fw-semibold"
                        icon={<i className="bi bi-geo-alt" style={{ color: '#ffb800', marginRight: '10px' }}></i>}
                      />
                    </div>

                    <div className="swap-icon" style={{ color: '#ccc', fontSize: '0.9rem' }}>→</div>

                    <div className="input-with-icon" style={{ flex: 1, zIndex: 190 - idx * 10, position: 'relative' }}>
                      <LocationSearch
                        placeholder={`To city ${idx + 1}`}
                        value={leg.destination}
                        onChange={(val) => updateMultiCityLeg(idx, { destination: val })}
                        onLocationSelect={(loc) => updateMultiCityLeg(idx, { destination: loc.address })}
                        className="w-100 border-0 fw-semibold"
                        icon={<i className="bi bi-geo" style={{ color: '#ffb800', marginRight: '10px' }}></i>}
                      />
                    </div>

                    <div className="input-with-icon date-input">
                      <i className="bi bi-calendar"></i>
                      <input
                        type="date"
                        value={leg.departureDate}
                        onChange={e => updateMultiCityLeg(idx, { departureDate: e.target.value })}
                      />
                    </div>

                    {/* Remove leg (only if > 2 legs) */}
                    {multiCityLegs.length > 2 && (
                      <button
                        onClick={() => removeMultiCityLeg(idx)}
                        style={{ border: 'none', background: 'none', padding: '0 12px', color: '#e74c3c', fontSize: '1.2rem', cursor: 'pointer' }}
                        title="Remove this leg"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    )}
                  </motion.div>
                ))}

                {/* Add city + Search */}
                <div className="d-flex align-items-center gap-3 mt-3">
                  {multiCityLegs.length < 6 && (
                    <button
                      className="btn btn-outline-dark rounded-pill px-4 fw-semibold"
                      style={{ fontSize: '0.88rem' }}
                      onClick={addMultiCityLeg}
                    >
                      <i className="bi bi-plus-circle me-2"></i>Add another city
                    </button>
                  )}
                  <button
                    className="btn fw-bold rounded-pill px-5 py-2"
                    style={{ background: '#1a1a1a', color: '#fff', fontSize: '0.95rem' }}
                    onClick={handleSearch}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Searching...</>
                      : <><i className="bi bi-search me-2"></i>Search All Flights</>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {showResults && (
        <div className="mt-5">
          <FlightResults />
        </div>
      )}

      <section className="featured-destinations mt-5 py-5 container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold m-0" style={{ color: 'var(--color-text)' }}>Popular Routes</h4>
          <button className="btn btn-link text-decoration-none fw-semibold p-0" style={{ color: '#ffb800' }}>View All</button>
        </div>

        <div className="row g-4">
          {popularRoutes.length > 0 ? popularRoutes.map((route, i) => {
            const depTime = route.departure_time ? new Date(route.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
            const arrTime = route.arrival_time ? new Date(route.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

            // Calculate duration
            let duration = '—';
            if (route.departure_time && route.arrival_time) {
              const diff = (new Date(route.arrival_time) - new Date(route.departure_time)) / 60000;
              duration = `${Math.floor(diff / 60)}h ${diff % 60}m`;
            }

            return (
              <div key={i} className="col-lg-4 col-md-6">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="rounded-4 shadow-sm p-4 d-flex flex-column h-100"
                  style={{ border: '1px solid var(--flight-glass-border)', background: 'var(--flight-card-bg)' }}
                >
                  {/* Airline & Route Header */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={`https://logo.clearbit.com/${route.airline?.toLowerCase().replace(/\s/g, '')}.com`}
                        alt={route.airline}
                        style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="fw-bold small text-muted">{route.airline}</span>
                    </div>
                    <span className="badge rounded-pill" style={{ background: 'rgba(255, 184, 0, 0.12)', color: 'var(--flight-primary)', fontSize: '0.7rem' }}>Non-stop</span>
                  </div>

                  {/* Timeline */}
                  <div className="d-flex align-items-center mb-4">
                    <div className="text-start">
                      <div className="fw-bold fs-5">{route.departure_airport_id}</div>
                      <div className="text-muted small">{depTime}</div>
                    </div>
                    <div className="flex-grow-1 px-3 text-center">
                      <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{duration}</div>
                      <div className="d-flex align-items-center my-1">
                        <div className="rounded-circle bg-warning" style={{ width: '6px', height: '6px' }}></div>
                        <div style={{ flex: 1, height: '1.5px', background: 'var(--flight-glass-border)', borderStyle: 'dashed' }}></div>
                        <i className="bi bi-airplane mx-2" style={{ color: 'var(--color-text)', transform: 'rotate(45deg)', fontSize: '1rem' }}></i>
                        <div style={{ flex: 1, height: '1.5px', background: 'var(--flight-glass-border)', borderStyle: 'dashed' }}></div>
                        <div className="rounded-circle bg-warning" style={{ width: '6px', height: '6px' }}></div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold fs-5">{route.arrival_airport_id}</div>
                      <div className="text-muted small">{arrTime}</div>
                    </div>
                  </div>

                  <hr className="mt-auto mb-3" style={{ borderColor: 'var(--flight-glass-border)' }} />

                  {/* Price and Action */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted small" style={{ fontSize: '0.7rem' }}>Starting from</div>
                      <div className="fw-bold" style={{ fontSize: '1.2rem', color: 'var(--color-text)' }}>
                        {/* User Auth Store can provide currency, fallback to NGN */}
                        ₦{parseFloat(route.price).toLocaleString()}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary rounded-pill px-4 fw-semibold"
                      style={{ fontSize: '0.85rem' }}
                      onClick={() => {
                        selectFlight(route);
                        navigate(`/flights/detail/${route.id}`);
                      }}
                    >
                      Details
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          }) : (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-warning mb-3" role="status"></div>
              <div className="text-muted">Loading popular routes...</div>
            </div>
          )}
        </div>
      </section>

      {/* Gamification Modal */}
      <FlightLotteryModal 
        isOpen={isLotteryModalOpen} 
        onClose={() => setIsLotteryModalOpen(false)} 
      />
    </div>


  )
};

export default FlightSearchHome;
