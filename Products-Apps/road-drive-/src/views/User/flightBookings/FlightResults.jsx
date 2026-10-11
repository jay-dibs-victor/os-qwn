import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlightStore } from '../../../core/store/useFlightStore';
import apiClient from '../../../core/api/apiClient';
import { useNavigate } from 'react-router-dom';
import './flight.css';

const FlightResults = ({ isEmbedded = false }) => {
  const {
    searchParams, flights, setFlights, isLoading, setLoading, error, setError,
    addToCart, cart, selectFlight,
    multiCityLegs, setSearchParams
  } = useFlightStore();
  const navigate = useNavigate();
  const [currentLegIndex, setCurrentLegIndex] = useState(0);

  // Filter state
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [sortBy, setSortBy] = useState('price');

  useEffect(() => {
    if (isEmbedded) return; // skip re-fetch if embedded — parent already fetched
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.get('/flights/search', {
          params: {
            sourceAirportCode: searchParams.origin,
            destinationAirportCode: searchParams.destination,
            departureDate: searchParams.departureDate,
          },
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
    fetchFlights();
  }, [searchParams]);

  const airlines = [...new Set(flights.map((f) => f.airline).filter(Boolean))];

  const toggleStop = (val) =>
    setSelectedStops((prev) => (prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]));

  const toggleAirline = (name) =>
    setSelectedAirlines((prev) => (prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]));

  const filtered = flights
    .filter((f) => parseFloat(f.price) <= maxPrice)
    .filter((f) => selectedAirlines.length === 0 || selectedAirlines.includes(f.airline))
    .sort((a, b) => {
      if (sortBy === 'price') return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'duration') return new Date(a.arrival_time) - new Date(b.arrival_time);
      return 0;
    });

  const handleViewDetail = (flight) => {
    selectFlight(flight);
    navigate(`/flights/detail/${flight.id}`);
  };

  const handleAddToCart = (flight) => {
    addToCart(flight);
  };

  // Multi-city: search the next leg after user adds current leg to cart
  const handleSearchNextLeg = async () => {
    const validLegs = multiCityLegs.filter(l => l.origin && l.destination);
    const nextIdx = currentLegIndex + 1;
    if (nextIdx >= validLegs.length) {
      // All legs added — go to itinerary
      navigate('/flights/detail/multi');
      return;
    }
    const nextLeg = validLegs[nextIdx];
    setCurrentLegIndex(nextIdx);
    setSearchParams({ origin: nextLeg.origin, destination: nextLeg.destination, departureDate: nextLeg.departureDate });
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/flights/search', {
        params: {
          sourceAirportCode: nextLeg.origin,
          destinationAirportCode: nextLeg.destination,
          departureDate: nextLeg.departureDate
        }
      });
      if (data.status === 200) setFlights(data.data);
      else setFlights([]);
    } catch (err) {
      setError('Failed to fetch flights for this leg.');
    } finally {
      setLoading(false);
    }
  };

  const getDuration = (dep, arr) => {
    if (!dep || !arr) return '—';
    const diff = (new Date(arr) - new Date(dep)) / 60000;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  return (
    <div style={{ background: 'var(--flight-secondary)', minHeight: '100vh', paddingTop: isEmbedded ? 0 : '100px' }}>
      {/* ── Route Header Bar ───────────────────────────── */}
      <div style={{ background: 'var(--flight-card-bg)', borderBottom: '1px solid var(--flight-glass-border)', padding: '18px 0' }}>
        <div className="container d-flex align-items-center gap-3 flex-wrap">
          <div className="d-flex align-items-center gap-2 text-white small fw-semibold">
            <i className="bi bi-geo-alt-fill" style={{ color: '#ffb800' }}></i>
            {searchParams.origin || 'Origin'}
          </div>
          <i className="bi bi-arrow-right text-white opacity-50"></i>
          <div className="d-flex align-items-center gap-2 text-white small fw-semibold">
            <i className="bi bi-geo-fill" style={{ color: '#ffb800' }}></i>
            {searchParams.destination || 'Destination'}
          </div>
          <div className="vr opacity-25 mx-2" style={{ height: '20px' }}></div>
          <span className="text-white small opacity-75">
            <i className="bi bi-calendar3 me-1"></i>
            {searchParams.departureDate || 'Any date'}
          </span>
          <div className="ms-auto">
            <button
              className="btn btn-primary btn-sm px-3 rounded-pill fw-semibold"
              style={{ fontSize: '0.8rem' }}
              onClick={() => navigate('/flights')}
            >
              <i className="bi bi-pencil me-1"></i> Modify Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Multi-city Progress Banner ─────────────────── */}
      {searchParams.tripType === 'multi-city' && multiCityLegs.filter(l => l.origin && l.destination).length > 0 && (() => {
        const validLegs = multiCityLegs.filter(l => l.origin && l.destination);
        return (
          <div style={{ background: 'rgba(255, 184, 0, 0.08)', borderBottom: '1px solid var(--flight-glass-border)', padding: '12px 0' }}>
            <div className="container">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="fw-bold small" style={{ color: 'var(--flight-primary)' }}>
                  <i className="bi bi-signpost-split me-2"></i>Multi-city Journey
                </span>
                <div className="vr opacity-25 mx-1" style={{ height: '18px' }}></div>
                {validLegs.map((leg, idx) => {
                  const isDone = cart.some(f =>
                    (f.departure_airport_id || '').toLowerCase().includes(leg.origin.substring(0,3).toLowerCase()) ||
                    (f.origin || '').toLowerCase().includes(leg.origin.substring(0,3).toLowerCase())
                  );
                  const isCurrent = idx === currentLegIndex;
                  return (
                    <div key={idx} className="d-flex align-items-center gap-1">
                      <span
                        className="badge rounded-pill fw-semibold"
                        style={{
                          background: isDone ? 'var(--color-success, #10B981)' : isCurrent ? 'var(--flight-primary)' : 'var(--color-surface-light, #121212)',
                          color: isDone ? '#fff' : isCurrent ? '#000' : 'var(--flight-text-light)',
                          fontSize: '0.72rem',
                          border: '1px solid var(--flight-glass-border)'
                        }}
                      >
                        {isDone ? '✓' : `Leg ${idx + 1}`} {leg.origin.substring(0, 20)} → {leg.destination.substring(0, 20)}
                      </span>
                      {idx < validLegs.length - 1 && <i className="bi bi-chevron-right" style={{ color: 'var(--flight-text-light)', fontSize: '0.65rem' }}></i>}
                    </div>
                  );
                })}
                {/* CTA: search next leg or finish */}
                {cart.length > currentLegIndex && (
                  <button
                    className="btn btn-sm btn-primary fw-bold rounded-pill ms-auto"
                    style={{ fontSize: '0.8rem' }}
                    onClick={handleSearchNextLeg}
                  >
                    {currentLegIndex + 1 >= validLegs.length
                      ? <><i className="bi bi-check-circle me-1"></i>Finish — View Itinerary</>
                      : <><i className="bi bi-arrow-right me-1"></i>Search Leg {currentLegIndex + 2}</>
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="container py-4">
        <div className="row g-4">
          {/* ── LEFT SIDEBAR FILTERS ─────────────────────── */}
          <div className="col-lg-3 col-md-4">
            <div className="rounded-4 p-4 shadow-sm position-sticky" style={{ top: '90px', background: 'var(--flight-card-bg)', border: '1px solid var(--flight-glass-border)' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-bold m-0" style={{ fontSize: '1rem' }}>Filters</h6>
                <button
                  className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                  style={{ color: 'var(--flight-primary)', fontSize: '0.8rem' }}
                  onClick={() => { setSelectedStops([]); setSelectedAirlines([]); setMaxPrice(2000000); }}
                >
                  Reset All
                </button>
              </div>

              {/* Sort By */}
              <div className="mb-4">
                <p className="fw-bold small text-uppercase text-muted mb-2" style={{ letterSpacing: '0.5px' }}>Sort By</p>
                {[{ val: 'price', label: 'Cheapest First' }, { val: 'duration', label: 'Fastest First' }].map((s) => (
                  <div key={s.val} className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="sort"
                      id={`sort-${s.val}`}
                      checked={sortBy === s.val}
                      onChange={() => setSortBy(s.val)}
                      style={{ accentColor: '#ffb800' }}
                    />
                    <label className="form-check-label small" htmlFor={`sort-${s.val}`}>{s.label}</label>
                  </div>
                ))}
              </div>

              <hr className="opacity-10" />

              {/* Stops */}
              <div className="mb-4">
                <p className="fw-bold small text-uppercase text-muted mb-2" style={{ letterSpacing: '0.5px' }}>Stops</p>
                {['Non-stop', '1 Stop', '2+ Stops'].map((stop) => (
                  <div key={stop} className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`stop-${stop}`}
                      checked={selectedStops.includes(stop)}
                      onChange={() => toggleStop(stop)}
                      style={{ accentColor: '#ffb800' }}
                    />
                    <label className="form-check-label small" htmlFor={`stop-${stop}`}>{stop}</label>
                  </div>
                ))}
              </div>

              <hr className="opacity-10" />

              {/* Price Range */}
              <div className="mb-4">
                <p className="fw-bold small text-uppercase text-muted mb-2" style={{ letterSpacing: '0.5px' }}>
                  Max Price: <span style={{ color: '#ffb800' }}>₦{maxPrice.toLocaleString()}</span>
                </p>
                <input
                  type="range"
                  className="form-range"
                  min={50000}
                  max={2000000}
                  step={10000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ accentColor: '#ffb800' }}
                />
                <div className="d-flex justify-content-between small text-muted">
                  <span>₦50k</span><span>₦2M+</span>
                </div>
              </div>

              <hr className="opacity-10" />

              {/* Airlines */}
              {airlines.length > 0 && (
                <div>
                  <p className="fw-bold small text-uppercase text-muted mb-2" style={{ letterSpacing: '0.5px' }}>Airlines</p>
                  {airlines.map((a) => (
                    <div key={a} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`airline-${a}`}
                        checked={selectedAirlines.includes(a)}
                        onChange={() => toggleAirline(a)}
                        style={{ accentColor: '#ffb800' }}
                      />
                      <label className="form-check-label small" htmlFor={`airline-${a}`}>{a}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: RESULTS LIST ─────────────────────── */}
          <div className="col-lg-9 col-md-8">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold m-0">
                <span style={{ color: '#ffb800' }}>{filtered.length}</span> available flights
              </h6>
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="skeleton rounded-4 mb-3" style={{ height: '130px' }}></div>
                  ))}
                </motion.div>
              ) : error ? (
                <div className="alert alert-danger rounded-4">{error}</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-airplane display-1 text-muted opacity-25"></i>
                  <p className="text-muted mt-3">No flights found matching your filters.</p>
                </div>
              ) : (
                <motion.div key="results">
                  {filtered.map((flight, i) => (
                    <motion.div
                      key={flight.id || i}
                      className="rounded-4 shadow-sm mb-3 p-4"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ border: '1px solid var(--flight-glass-border)', background: 'var(--flight-card-bg)' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        {/* Airline Logo + Name */}
                        <div style={{ minWidth: '100px' }} className="text-center">
                          <img
                            src={`https://logo.clearbit.com/${flight.airline?.toLowerCase().replace(/\s/g, '')}.com`}
                            alt={flight.airline}
                            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div className="fw-bold small mt-1" style={{ fontSize: '0.75rem' }}>{flight.airline}</div>
                          <div className="text-muted" style={{ fontSize: '0.65rem' }}>{flight.flight_number}</div>
                        </div>

                        {/* Route Timeline */}
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between">
                            {/* Departure */}
                            <div className="text-start">
                              <div className="fw-bold" style={{ fontSize: '1.4rem', lineHeight: 1 }}>
                                {flight.departure_airport_id || '—'}
                              </div>
                              <div className="text-muted small">
                                {flight.departure_time ? new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </div>
                            </div>

                            {/* Path */}
                            <div className="flex-grow-1 mx-3 text-center">
                              <div className="small text-muted mb-1">{getDuration(flight.departure_time, flight.arrival_time)}</div>
                              <div className="d-flex align-items-center">
                                <div style={{ flex: 1, height: '2px', background: 'var(--flight-glass-border)', borderRadius: '2px' }}></div>
                                <i className="bi bi-airplane mx-2" style={{ color: 'var(--flight-primary)', fontSize: '1rem', transform: 'rotate(0deg)' }}></i>
                                <div style={{ flex: 1, height: '2px', background: 'var(--flight-glass-border)', borderRadius: '2px' }}></div>
                              </div>
                              <div className="small mt-1" style={{ color: 'var(--flight-text-light)', fontSize: '0.7rem' }}>Non-stop</div>
                            </div>

                            {/* Arrival */}
                            <div className="text-end">
                              <div className="fw-bold" style={{ fontSize: '1.4rem', lineHeight: 1 }}>
                                {flight.arrival_airport_id || '—'}
                              </div>
                              <div className="text-muted small">
                                {flight.arrival_time ? new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price + Actions */}
                        <div className="text-end ms-3" style={{ minWidth: '160px' }}>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>
                            ₦{parseFloat(flight.price || 0).toLocaleString()}
                          </div>
                          <div className="text-muted small mb-3" style={{ fontSize: '0.7rem' }}>per person</div>
                          <button
                            className="btn w-100 btn-primary rounded-pill mb-2"
                            style={{ fontSize: '0.85rem', padding: '8px 0' }}
                            onClick={() => handleAddToCart(flight)}
                            disabled={cart.some(c => c.id === flight.id)}
                          >
                            {cart.some(c => c.id === flight.id) ? 'Added' : 'Add to Itinerary'}
                          </button>
                          <button
                            className="btn w-100 fw-semibold rounded-pill"
                            style={{ border: '1.5px solid var(--flight-glass-border)', color: 'var(--flight-text-dark)', fontSize: '0.8rem', padding: '6px 0', background: 'var(--color-surface-light, #121212)' }}
                            onClick={() => handleViewDetail(flight)}
                          >
                            View Detail
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Floating Action Bar for Multiple Itineraries ── */}
      {cart.length > 0 && (
        <motion.div 
          className="position-fixed bottom-0 start-0 w-100 shadow-lg p-3" 
          style={{ zIndex: 1050, borderTop: '1px solid var(--flight-glass-border)', background: 'var(--flight-card-bg)', color: 'var(--flight-text-dark)' }}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          <div className="container d-flex justify-content-between align-items-center">
            <div>
              <span className="fw-bold fs-5">{cart.length} flights selected</span>
              <div className="text-muted small">Total: ₦{cart.reduce((sum, f) => sum + parseFloat(f.price || 0), 0).toLocaleString()}</div>
            </div>
            <button className="btn btn-primary rounded-pill px-5 fw-bold" onClick={() => navigate('/flights/detail/multi')}>
              Review Itinerary Details
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FlightResults;
