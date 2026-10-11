import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlightStore } from '../../../core/store/useFlightStore';
import apiClient from '../../../core/api/apiClient';
import './flight.css';

const FlightDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedFlight, selectFlight, cart, addToCart } = useFlightStore();
  const [flight, setFlight] = useState(selectedFlight || null);
  const [loading, setLoading] = useState(id !== 'multi' && !selectedFlight);
  const [activeTab, setActiveTab] = useState('itinerary');

  const isMulti = id === 'multi';
  const targetFlights = isMulti ? cart : (flight ? [flight] : []);

  useEffect(() => {
    if (isMulti) {
      setLoading(false);
      return;
    }

    if (!selectedFlight || selectedFlight.id !== id) {
      const fetchFlight = async () => {
        try {
          const { data } = await apiClient.get(`/flights/${id}`);
          if (data.status === 200) {
            setFlight(data.data);
            selectFlight(data.data);
          }
        } catch (e) {
          console.error('Failed to load flight', e);
        } finally {
          setLoading(false);
        }
      };
      fetchFlight();
    } else {
      setFlight(selectedFlight);
      setLoading(false);
    }
  }, [id, isMulti, selectedFlight]);

  const handleBook = () => {
    if (!isMulti && flight) {
      addToCart(flight);
    }
    navigate('/flights/checkout');
  };

  const getDuration = (dep, arr) => {
    if (!dep || !arr) return '—';
    const diff = (new Date(arr) - new Date(dep)) / 60000;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  const fmtTime = (t) => t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
  const fmtDate = (t) => t ? new Date(t).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : '—';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '100px', background: '#f4f6fb' }}>
        <div className="container py-5">
          <div className="skeleton rounded-4 mb-3" style={{ height: '200px' }}></div>
          <div className="skeleton rounded-4 mb-3" style={{ height: '300px' }}></div>
        </div>
      </div>
    );
  }

  if (targetFlights.length === 0) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '140px', background: '#f4f6fb' }} className="text-center">
        <i className="bi bi-airplane display-1 text-muted opacity-25"></i>
        <p className="text-muted mt-3">No flights selected or flight not found.</p>
        <button className="btn btn-dark rounded-pill px-4 mt-2" onClick={() => navigate('/flights')}>
          Back to Search
        </button>
      </div>
    );
  }

  const basePrice = targetFlights.reduce((sum, f) => sum + parseFloat(f.price || 0), 0);
  const taxes = Math.round(basePrice * 0.075);
  const serviceFee = 2500 * targetFlights.length;
  const total = basePrice + taxes + serviceFee;

  return (
    <div style={{ background: 'var(--flight-secondary)', minHeight: '100vh', paddingTop: '100px' }}>
      {/* ── Top Banner ─────────────────────────────────── */}
      <div style={{ background: 'var(--flight-card-bg)', borderBottom: '1px solid var(--flight-glass-border)', padding: '20px 0' }}>
        <div className="container">
          <button
            className="btn btn-link text-white text-decoration-none p-0 mb-2 small"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2"></i>Back to Results
          </button>
          <div className="d-flex align-items-center gap-3">
            <h4 className="text-white fw-bold m-0">
              {isMulti ? 'Multi-Flight Itinerary Summary' : `${flight?.departure_airport_id} → ${flight?.arrival_airport_id}`}
            </h4>
            {!isMulti && (
              <span className="badge" style={{ background: 'var(--flight-primary)', color: 'var(--flight-secondary)', fontWeight: 700 }}>
                {flight?.airline}
              </span>
            )}
          </div>
          {!isMulti && (
            <p className="text-white opacity-50 small m-0 mt-1">{fmtDate(flight?.departure_time)} • {flight?.flight_number}</p>
          )}
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          {/* ── Left: Main Content ────────────────────────── */}
          <div className="col-lg-8">
            {targetFlights.map((f, idx) => (
              <motion.div
                key={f.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-4 shadow-sm p-4 mb-4"
                style={{ border: '1px solid var(--flight-glass-border)', background: 'var(--flight-card-bg)' }}
              >
                {/* Airline header */}
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={`https://logo.clearbit.com/${f.airline?.toLowerCase().replace(/\s/g, '')}.com`}
                      alt={f.airline}
                      style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '10px', border: '1px solid var(--color-border)' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <div className="fw-bold" style={{ fontSize: '1.1rem' }}>{f.airline}</div>
                      <div className="text-muted small">{f.flight_number} • Economy Class</div>
                    </div>
                  </div>
                  <span className="badge rounded-pill" style={{ background: 'rgba(46, 204, 113, 0.12)', color: '#2ecc71', fontWeight: 700, fontSize: '0.8rem' }}>
                    ✓ On-time
                  </span>
                </div>

                {/* Route Timeline */}
                <div className="d-flex align-items-center py-4 px-2" style={{ borderTop: '1px solid var(--flight-glass-border)', borderBottom: '1px solid var(--flight-glass-border)' }}>
                  {/* Departure */}
                  <div style={{ minWidth: '120px' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>{fmtTime(f.departure_time)}</div>
                    <div className="fw-bold mt-1" style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>{f.departure_airport_id}</div>
                    <div className="text-muted small">{fmtDate(f.departure_time)}</div>
                    <div className="text-muted small">Terminal 1</div>
                  </div>

                  {/* Path */}
                  <div className="flex-grow-1 mx-4 text-center">
                    <div className="text-muted small mb-2">{getDuration(f.departure_time, f.arrival_time)}</div>
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle" style={{ width: '10px', height: '10px', background: 'var(--flight-primary)', flexShrink: 0 }}></div>
                      <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, var(--flight-primary), var(--flight-glass-border))' }}></div>
                      <i className="bi bi-airplane mx-2" style={{ color: 'var(--color-text)', fontSize: '1.5rem' }}></i>
                      <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, var(--flight-glass-border), var(--flight-primary))' }}></div>
                      <div className="rounded-circle" style={{ width: '10px', height: '10px', background: 'var(--flight-primary)', flexShrink: 0 }}></div>
                    </div>
                    <div className="mt-2">
                      <span className="badge rounded-pill" style={{ background: 'rgba(255, 184, 0, 0.12)', color: 'var(--flight-primary)', fontSize: '0.7rem', fontWeight: 700 }}>
                        Non-stop
                      </span>
                    </div>
                  </div>

                  {/* Arrival */}
                  <div style={{ minWidth: '120px' }} className="text-end">
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>{fmtTime(f.arrival_time)}</div>
                    <div className="fw-bold mt-1" style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>{f.arrival_airport_id}</div>
                    <div className="text-muted small">{fmtDate(f.arrival_time)}</div>
                    <div className="text-muted small">Terminal 3</div>
                  </div>
                </div>

                {!isMulti && (
                  <div className="d-flex gap-3 mt-4 flex-wrap">
                    {[
                      { icon: 'bi-bag', label: 'Carry-on', val: '7 Kgs' },
                      { icon: 'bi-suitcase-lg', label: 'Check-in', val: '20 Kgs' },
                      { icon: 'bi-wifi', label: 'In-flight WiFi', val: 'Available' },
                      { icon: 'bi-cup-hot', label: 'Meals', val: 'Included' },
                    ].map((item) => (
                      <div key={item.label} className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ background: 'var(--color-surface-light, #121212)', border: '1px solid var(--flight-glass-border)', fontSize: '0.82rem' }}>
                        <i className={`bi ${item.icon}`} style={{ color: 'var(--flight-primary)' }}></i>
                        <span className="text-muted">{item.label}:</span>
                        <span className="fw-semibold" style={{ color: 'var(--flight-text-dark)' }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Tabs (only show for single flight for simplicity, or adapt for multi) */}
            {!isMulti && (
              <div className="rounded-4 shadow-sm overflow-hidden" style={{ border: '1px solid var(--flight-glass-border)', background: 'var(--flight-card-bg)' }}>
                <div className="d-flex" style={{ padding: '0 24px', borderBottom: '1px solid var(--flight-glass-border)' }}>
                  {['itinerary', 'baggage', 'cancellation'].map((tab) => (
                    <button
                      key={tab}
                      className="btn btn-link text-decoration-none fw-semibold py-3 px-3 me-2"
                      style={{
                        color: activeTab === tab ? 'var(--flight-primary)' : 'var(--flight-text-light)',
                        borderBottom: activeTab === tab ? '3px solid var(--flight-primary)' : '3px solid transparent',
                        borderRadius: 0,
                        fontSize: '0.9rem',
                        textTransform: 'capitalize',
                      }}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-4">
                  {activeTab === 'itinerary' && (
                    <div>
                      <h6 className="fw-bold mb-4">Flight Itinerary</h6>
                      <div className="d-flex gap-4">
                        <div className="d-flex flex-column align-items-center">
                          <div className="rounded-circle" style={{ width: '14px', height: '14px', background: 'var(--flight-primary)', border: '3px solid var(--flight-card-bg)', boxShadow: '0 0 0 2px var(--flight-primary)' }}></div>
                          <div style={{ width: '2px', flex: 1, background: 'var(--flight-glass-border)', margin: '8px 0' }}></div>
                          <div className="rounded-circle" style={{ width: '14px', height: '14px', background: 'var(--flight-primary)', border: '3px solid var(--flight-card-bg)', boxShadow: '0 0 0 2px var(--flight-primary)' }}></div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="mb-5">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-bold" style={{ fontSize: '1.1rem' }}>{fmtTime(flight.departure_time)} · {flight.departure_airport_id}</div>
                                <div className="text-muted small mt-1">International Airport · Terminal 1</div>
                                <div className="text-muted small">{fmtDate(flight.departure_time)}</div>
                              </div>
                              <span className="badge rounded-pill" style={{ background: 'rgba(52, 152, 219, 0.12)', color: '#3498db', fontSize: '0.7rem' }}>Departure</span>
                            </div>
                          </div>
                          <div>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-bold" style={{ fontSize: '1.1rem' }}>{fmtTime(flight.arrival_time)} · {flight.arrival_airport_id}</div>
                                <div className="text-muted small mt-1">International Airport · Terminal 3</div>
                                <div className="text-muted small">{fmtDate(flight.arrival_time)}</div>
                              </div>
                              <span className="badge rounded-pill" style={{ background: 'rgba(46, 204, 113, 0.12)', color: '#2ecc71', fontSize: '0.7rem' }}>Arrival</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-3" style={{ background: 'rgba(255, 184, 0, 0.08)', border: '1px solid var(--flight-glass-border)' }}>
                        <div className="d-flex align-items-start gap-2 small">
                          <i className="bi bi-info-circle-fill" style={{ color: 'var(--flight-primary)', marginTop: '2px' }}></i>
                          <span>Check-in baggage is not included in the base fare. You can add baggage allowance at checkout or from the airline counter before departure.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'baggage' && (
                    <div>
                      <h6 className="fw-bold mb-4">Baggage Policy</h6>
                      <div className="row g-3">
                        {[
                          { icon: 'bi-bag', title: 'Carry-on Baggage', desc: '1 piece · Max 7 Kgs · Dimensions: 55×35×25 cm' },
                          { icon: 'bi-suitcase-lg', title: 'Checked Baggage', desc: '1 piece · Max 20 Kgs · Additional fee applies for extra bags' },
                        ].map((b) => (
                          <div key={b.title} className="col-md-6">
                            <div className="p-3 rounded-3" style={{ background: 'var(--color-surface-light, #121212)', border: '1px solid var(--flight-glass-border)' }}>
                              <i className={`bi ${b.icon} fs-4 mb-2 d-block`} style={{ color: 'var(--flight-primary)' }}></i>
                              <div className="fw-bold small">{b.title}</div>
                              <div className="text-muted small mt-1">{b.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'cancellation' && (
                    <div>
                      <h6 className="fw-bold mb-4">Cancellation & Refund Policy</h6>
                      <div className="d-flex flex-column gap-3">
                        {[
                          { time: '> 24 hours before departure', policy: 'Full refund minus ₦5,000 processing fee', color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.08)' },
                          { time: '< 24 hours before departure', policy: '50% refund of base fare', color: 'var(--flight-primary)', bg: 'rgba(255, 184, 0, 0.08)' },
                          { time: 'After departure or no-show', policy: 'No refund eligible', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
                        ].map((r) => (
                          <div key={r.time} className="p-3 rounded-3 d-flex justify-content-between" style={{ background: r.bg, border: `1px solid ${r.color}22` }}>
                            <div className="small text-muted">{r.time}</div>
                            <div className="small fw-semibold" style={{ color: r.color }}>{r.policy}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Price Sidebar ──────────────────────── */}
          <div className="col-lg-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-4 shadow-sm p-4 position-sticky"
              style={{ top: '100px', border: '1px solid var(--flight-glass-border)', background: 'var(--flight-card-bg)' }}
            >
              <h6 className="fw-bold mb-4">Itinerary Price Breakdown</h6>

              <div className="d-flex justify-content-between mb-3 small">
                <span className="text-muted">Base Fare ({targetFlights.length} flights)</span>
                <span className="fw-semibold">₦{basePrice.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 small">
                <span className="text-muted">Taxes (7.5%)</span>
                <span className="fw-semibold">₦{taxes.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 small">
                <span className="text-muted">Service Fee</span>
                <span className="fw-semibold">₦{serviceFee.toLocaleString()}</span>
              </div>

              <hr style={{ borderColor: 'var(--flight-glass-border)' }} />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold">Total</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-text)' }}>₦{total.toLocaleString()}</span>
              </div>

              <button
                className="btn btn-primary w-100 py-3 mb-3"
                onClick={handleBook}
              >
                <i className="bi bi-lock-fill me-2"></i> Confirm & Proceed to Checkout
              </button>

              <button
                className="btn w-100 fw-semibold rounded-pill py-2"
                style={{ border: '1.5px solid var(--flight-glass-border)', color: 'var(--flight-text-dark)', background: 'var(--color-surface-light, #121212)', fontSize: '0.9rem' }}
                onClick={() => navigate(-1)}
              >
                ← Back to Results
              </button>

              {/* Trust Badges */}
              <div className="mt-4 pt-3 border-top d-flex flex-wrap gap-2 justify-content-center" style={{ borderColor: 'var(--flight-glass-border)' }}>
                {['Secure Booking', 'Free Cancellation*', 'Instant Confirmation'].map((badge) => (
                  <span key={badge} className="badge rounded-pill" style={{ background: 'var(--color-surface-light, #121212)', color: 'var(--flight-text-light)', fontWeight: 600, fontSize: '0.7rem', border: '1px solid var(--flight-glass-border)' }}>
                    ✓ {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetail;
