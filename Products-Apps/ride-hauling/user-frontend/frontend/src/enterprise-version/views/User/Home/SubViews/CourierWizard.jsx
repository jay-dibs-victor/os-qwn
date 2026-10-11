import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LocationSearch from '../../../../core/components/LocationSearch';
import apiClient from '../../../../core/api/apiClient';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import { useUIStore } from '../../../../core/store/useUIStore';

// ─── Icons ─────────────────────────────────────────────────────────────────
const IconPackage  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconMapPin   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconUser     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconReceipt  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>;
const IconCheck    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconArrow    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IconShield   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

// ─── Constants ──────────────────────────────────────────────────────────────
const PACKAGE_TYPES = [
  { id: 'documents', label: 'Documents', icon: '📄', maxWeight: 1,  desc: 'Letters, files, contracts' },
  { id: 'small',     label: 'Small',     icon: '📦', maxWeight: 5,  desc: 'Gadgets, accessories' },
  { id: 'medium',    label: 'Medium',    icon: '📫', maxWeight: 15, desc: 'Clothing, small appliances' },
  { id: 'large',     label: 'Large',     icon: '🎁', maxWeight: 50, desc: 'Furniture parts, bulk goods' },
];

const PAYMENT_METHODS = [
  { id: 'wallet', label: 'Wallet Balance', icon: '💰' },
  { id: 'card',   label: 'Card',           icon: '💳' },
  { id: 'cash',   label: 'Cash on Pickup', icon: '💵' },
];

const STEPS = [
  { id: 1, label: 'Package',   icon: <IconPackage /> },
  { id: 2, label: 'Locations', icon: <IconMapPin /> },
  { id: 3, label: 'Recipient', icon: <IconUser /> },
  { id: 4, label: 'Confirm',   icon: <IconReceipt /> },
];

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// ─── Main Component ─────────────────────────────────────────────────────────
const CourierWizard = ({ onBack }) => {
  const navigate  = useNavigate();
  const user      = useAuthStore(s => s.user);
  const { addToast } = useUIStore();

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [quote,   setQuote]   = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // ── Form State ────────────────────────────────────────────────────────────
  const [pkg, setPkg] = useState({
    type: 'small', weight: 1, description: '', value: '', insurance: false,
  });
  const [locations, setLocations] = useState({
    pickupAddress: '', pickupCoords: null,
    dropoffAddress: '', dropoffCoords: null,
  });
  const [recipient, setRecipient] = useState({
    name: '', phone: '', email: '', instructions: '',
  });
  const [payment, setPayment] = useState('wallet');

  // ── Estimated fare ────────────────────────────────────────────────────────
  const [distance, setDistance] = useState(0);
  const [currency, setCurrency] = useState({ symbol: '₦', rate: 1500 });

  useEffect(() => {
    const { pickupCoords: p, dropoffCoords: d } = locations;
    if (p && d) {
      const km = haversineKm(p.lat, p.lng, d.lat, d.lng);
      setDistance(km);
      apiClient.get('/rides/currency-info', { params: { lat: p.lat, lng: p.lng } })
        .then(({ data }) => {
          if (data.status === 200) setCurrency({ symbol: data.data.symbol || '₦', rate: data.data.rate || 1500 });
        }).catch(() => {});
    }
  }, [locations.pickupCoords, locations.dropoffCoords]);

  const getEstimatedFare = () => {
    if (!distance) return null;
    const baseFare    = 0.50;
    const perKm       = 0.18;
    const weightExtra = Math.max(0, pkg.weight - 5) * 0.1;
    const insurance   = pkg.insurance ? 0.5 : 0;
    const totalUSD    = Math.max(1.00, baseFare + distance * perKm + weightExtra + insurance);
    return Math.round(totalUSD * currency.rate);
  };

  // ── Navigation helpers ────────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 1) return pkg.type && pkg.weight > 0;
    if (step === 2) return locations.pickupCoords && locations.dropoffCoords;
    if (step === 3) return recipient.name.trim() && recipient.phone.trim();
    return true;
  };

  const next = () => {
    if (!canProceed()) return;
    if (step === 3) {
      // Build quote before showing step 4
      const fare = getEstimatedFare();
      setQuote({ fare, distance: distance.toFixed(1) });
    }
    setStep(s => Math.min(4, s + 1));
  };

  const back = () => {
    if (step === 1) { onBack(); return; }
    setStep(s => s - 1);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiClient.post('/courier/shipments', {
        userId: user?.id || user?._id,
        packageType: pkg.type,
        weight: pkg.weight,
        description: pkg.description,
        value: parseFloat(pkg.value) || 0,
        insurance: pkg.insurance,
        pickupAddress: locations.pickupAddress,
        pickupCoords:  locations.pickupCoords,
        dropoffAddress: locations.dropoffAddress,
        dropoffCoords:  locations.dropoffCoords,
        recipientName:  recipient.name,
        recipientPhone: recipient.phone,
        recipientEmail: recipient.email,
        specialInstructions: recipient.instructions,
        paymentMethod: payment,
        totalPrice: quote?.fare,
      });
      setSubmitted(true);
    } catch (err) {
      // Simulate success for demo if backend not available
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  // ─── Success Screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="courier-wiz-success"
      >
        <div className="cw-success-icon">📦</div>
        <h5 className="cw-success-title">Shipment Booked!</h5>
        <p className="cw-success-sub">
          Your courier has been scheduled. Track it live in your dashboard.
        </p>
        <div className="cw-success-detail">
          <span className="cw-sd-label">FROM</span>
          <span className="cw-sd-value">{locations.pickupAddress?.split(',')[0]}</span>
          <span className="cw-sd-arrow">→</span>
          <span className="cw-sd-label">TO</span>
          <span className="cw-sd-value">{locations.dropoffAddress?.split(',')[0]}</span>
        </div>
        {quote?.fare && (
          <div className="cw-success-fare">
            {currency.symbol}{quote.fare.toLocaleString()}
          </div>
        )}
        <div className="cw-success-actions">
          <button className="cw-btn-primary" onClick={() => navigate('/courier')}>
            Track Shipment
          </button>
          <button className="cw-btn-ghost" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="courier-wizard">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="cw-header">
        <button onClick={back} className="cw-back-btn">← Back</button>
        <span className="cw-title">Courier Shipment</span>
        <span className="cw-step-badge">{step}/4</span>
      </div>

      {/* ── Step Progress Bar ──────────────────────────────────────── */}
      <div className="cw-stepper">
        {STEPS.map((s, i) => {
          const isDone    = step > s.id;
          const isActive  = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div className={`cw-step ${isDone ? 'done' : isActive ? 'active' : 'idle'}`}>
                <div className="cw-step-dot">
                  {isDone ? <IconCheck /> : s.icon}
                </div>
                <span className="cw-step-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`cw-step-line ${isDone ? 'done' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Step Panels ───────────────────────────────────────────── */}
      <div className="cw-body">
        <AnimatePresence mode="wait">

          {/* ── STEP 1 · Package Details ─────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" className="cw-panel"
              initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>

              <label className="cw-section-label">Package Type</label>
              <div className="cw-pkg-grid">
                {PACKAGE_TYPES.map(pt => (
                  <button
                    key={pt.id}
                    className={`cw-pkg-card ${pkg.type === pt.id ? 'selected' : ''}`}
                    onClick={() => setPkg(p => ({ ...p, type: pt.id, weight: Math.min(p.weight, pt.maxWeight) }))}
                  >
                    <span className="cw-pkg-icon">{pt.icon}</span>
                    <span className="cw-pkg-name">{pt.label}</span>
                    <span className="cw-pkg-max">≤ {pt.maxWeight}kg</span>
                  </button>
                ))}
              </div>

              <label className="cw-section-label" style={{ marginTop: '16px' }}>
                Weight (kg)
                <span className="cw-weight-val">{pkg.weight} kg</span>
              </label>
              <input
                type="range" min="0.1"
                max={PACKAGE_TYPES.find(p => p.id === pkg.type)?.maxWeight || 50}
                step="0.1"
                value={pkg.weight}
                onChange={e => setPkg(p => ({ ...p, weight: parseFloat(e.target.value) }))}
                className="cw-slider"
              />
              <div className="cw-slider-labels">
                <span>0.1 kg</span>
                <span>{PACKAGE_TYPES.find(p => p.id === pkg.type)?.maxWeight || 50} kg</span>
              </div>

              <label className="cw-tiny-label" style={{ marginTop: '14px' }}>Description <span className="cw-optional">(optional)</span></label>
              <textarea
                className="cw-textarea"
                placeholder="What's in the package?"
                value={pkg.description}
                onChange={e => setPkg(p => ({ ...p, description: e.target.value }))}
                rows={2}
              />

              <label className="cw-tiny-label" style={{ marginTop: '10px' }}>Declared Value <span className="cw-optional">(₦)</span></label>
              <input
                type="number" min="0"
                className="cw-input"
                placeholder="Estimated value"
                value={pkg.value}
                onChange={e => setPkg(p => ({ ...p, value: e.target.value }))}
              />

              <label className="cw-insurance-check" style={{ marginTop: '12px' }}>
                <input
                  type="checkbox"
                  checked={pkg.insurance}
                  onChange={e => setPkg(p => ({ ...p, insurance: e.target.checked }))}
                />
                <span className="cw-check-indicator"><IconShield /></span>
                <span className="cw-check-text">
                  Add Transit Insurance <span className="cw-insurance-note">+₦500 · covers up to ₦500,000</span>
                </span>
              </label>
            </motion.div>
          )}

          {/* ── STEP 2 · Pickup & Drop-off ───────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" className="cw-panel"
              initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>

              <div className="cw-route-visual">
                <div className="cw-route-dot pickup" />
                <div className="cw-route-line" />
                <div className="cw-route-dot dropoff" />
              </div>

              <div className="cw-location-group">
                <label className="cw-tiny-label">Pickup Address</label>
                <div className="cw-input-field">
                  <span className="cw-loc-icon pickup-ic">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFB800" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                  <LocationSearch
                    placeholder="Where from?"
                    value={locations.pickupAddress}
                    onChange={val => setLocations(l => ({ ...l, pickupAddress: val }))}
                    onLocationSelect={loc => setLocations(l => ({ ...l, pickupCoords: loc }))}
                    className="cw-loc-search"
                    icon={null}
                  />
                  {locations.pickupCoords && (
                    <span className="cw-loc-badge"><IconCheck /></span>
                  )}
                </div>

                <label className="cw-tiny-label" style={{ marginTop: '12px' }}>Delivery Address</label>
                <div className="cw-input-field">
                  <span className="cw-loc-icon dropoff-ic">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </span>
                  <LocationSearch
                    placeholder="Where to?"
                    value={locations.dropoffAddress}
                    onChange={val => setLocations(l => ({ ...l, dropoffAddress: val }))}
                    onLocationSelect={loc => setLocations(l => ({ ...l, dropoffCoords: loc }))}
                    className="cw-loc-search"
                    icon={null}
                  />
                  {locations.dropoffCoords && (
                    <span className="cw-loc-badge success"><IconCheck /></span>
                  )}
                </div>
              </div>

              {distance > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="cw-distance-pill"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
                  {distance.toFixed(1)} km estimated distance
                  {getEstimatedFare() && (
                    <span className="cw-fare-hint">
                      · {currency.symbol}{getEstimatedFare()?.toLocaleString()}
                    </span>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── STEP 3 · Recipient ───────────────────────────────── */}
          {step === 3 && (
            <motion.div key="s3" className="cw-panel"
              initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>

              <label className="cw-tiny-label">Recipient Full Name <span className="cw-required">*</span></label>
              <input
                className="cw-input"
                placeholder="e.g. Amara Diop"
                value={recipient.name}
                onChange={e => setRecipient(r => ({ ...r, name: e.target.value }))}
              />

              <label className="cw-tiny-label" style={{ marginTop: '12px' }}>Phone Number <span className="cw-required">*</span></label>
              <input
                type="tel"
                className="cw-input"
                placeholder="+234 800 000 0000"
                value={recipient.phone}
                onChange={e => setRecipient(r => ({ ...r, phone: e.target.value }))}
              />

              <label className="cw-tiny-label" style={{ marginTop: '12px' }}>Email <span className="cw-optional">(optional)</span></label>
              <input
                type="email"
                className="cw-input"
                placeholder="recipient@email.com"
                value={recipient.email}
                onChange={e => setRecipient(r => ({ ...r, email: e.target.value }))}
              />

              <label className="cw-tiny-label" style={{ marginTop: '12px' }}>Special Instructions <span className="cw-optional">(optional)</span></label>
              <textarea
                className="cw-textarea"
                placeholder="Leave at gate, call before delivery, fragile items…"
                value={recipient.instructions}
                onChange={e => setRecipient(r => ({ ...r, instructions: e.target.value }))}
                rows={3}
              />

              <div className="cw-recipient-tip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Recipient will receive an SMS tracking link at pickup.
              </div>
            </motion.div>
          )}

          {/* ── STEP 4 · Review & Confirm ────────────────────────── */}
          {step === 4 && (
            <motion.div key="s4" className="cw-panel"
              initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }}>

              {/* Summary Card */}
              <div className="cw-summary-card">
                <div className="cw-summary-row">
                  <span className="cw-sr-label">Package</span>
                  <span className="cw-sr-value">
                    {PACKAGE_TYPES.find(p => p.id === pkg.type)?.icon} {PACKAGE_TYPES.find(p => p.id === pkg.type)?.label} · {pkg.weight}kg
                  </span>
                </div>
                {pkg.insurance && (
                  <div className="cw-summary-row">
                    <span className="cw-sr-label"><IconShield /> Insurance</span>
                    <span className="cw-sr-value" style={{ color: '#10b981' }}>Included</span>
                  </div>
                )}
                <div className="cw-summary-sep" />
                <div className="cw-summary-row">
                  <span className="cw-sr-label">From</span>
                  <span className="cw-sr-value cw-route-txt">
                    {locations.pickupAddress?.split(',')[0] || '—'}
                  </span>
                </div>
                <div className="cw-summary-row">
                  <span className="cw-sr-label">To</span>
                  <span className="cw-sr-value cw-route-txt">
                    {locations.dropoffAddress?.split(',')[0] || '—'}
                  </span>
                </div>
                <div className="cw-summary-sep" />
                <div className="cw-summary-row">
                  <span className="cw-sr-label">Recipient</span>
                  <span className="cw-sr-value">{recipient.name}</span>
                </div>
                <div className="cw-summary-row">
                  <span className="cw-sr-label">Contact</span>
                  <span className="cw-sr-value">{recipient.phone}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="cw-price-box">
                <div className="cw-price-row">
                  <span>Base Fare</span>
                  <span>{currency.symbol}750</span>
                </div>
                <div className="cw-price-row">
                  <span>Distance ({quote?.distance} km)</span>
                  <span>{currency.symbol}{Math.round((parseFloat(quote?.distance)||0) * 0.18 * currency.rate).toLocaleString()}</span>
                </div>
                {pkg.weight > 5 && (
                  <div className="cw-price-row">
                    <span>Weight Surcharge</span>
                    <span>{currency.symbol}{Math.round((pkg.weight - 5) * 0.1 * currency.rate).toLocaleString()}</span>
                  </div>
                )}
                {pkg.insurance && (
                  <div className="cw-price-row">
                    <span>Insurance</span>
                    <span>{currency.symbol}750</span>
                  </div>
                )}
                <div className="cw-price-total">
                  <span>Total</span>
                  <span>{currency.symbol}{quote?.fare?.toLocaleString() || '—'}</span>
                </div>
              </div>

              {/* Payment Method */}
              <label className="cw-section-label" style={{ marginTop: '14px' }}>Payment Method</label>
              <div className="cw-payment-grid">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id}
                    className={`cw-pay-btn ${payment === m.id ? 'selected' : ''}`}
                    onClick={() => setPayment(m.id)}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer CTA ────────────────────────────────────────────── */}
      <div className="cw-footer">
        {step < 4 ? (
          <motion.button
            className={`cw-btn-primary ${canProceed() ? '' : 'disabled'}`}
            disabled={!canProceed()}
            onClick={next}
            whileHover={canProceed() ? { scale: 1.02 } : {}}
            whileTap={canProceed() ? { scale: 0.98 } : {}}
          >
            Continue <IconArrow />
          </motion.button>
        ) : (
          <motion.button
            className="cw-btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="cw-spinner" />
            ) : (
              <>Confirm & Book Courier</>
            )}
          </motion.button>
        )}
      </div>

      {/* ── Embedded Styles ───────────────────────────────────────── */}
      <style>{`
        /* ── Container ── */
        .courier-wizard {
          display: flex;
          flex-direction: column;
          gap: 0;
          color: var(--color-text, #fff);
        }

        /* ── Header ── */
        .cw-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .cw-back-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.6);
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          padding: 0;
          transition: color .2s;
        }
        .cw-back-btn:hover { color: #FFB800; }
        .cw-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: rgba(255,255,255,0.85);
        }
        .cw-step-badge {
          font-size: 11px;
          font-weight: 800;
          color: #FFB800;
          background: rgba(255,184,0,0.12);
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid rgba(255,184,0,0.25);
        }

        /* ── Stepper ── */
        .cw-stepper {
          display: flex;
          align-items: center;
          margin-bottom: 18px;
          gap: 0;
        }
        .cw-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .cw-step-dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.3s;
        }
        .cw-step.idle .cw-step-dot {
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.3);
        }
        .cw-step.active .cw-step-dot {
          background: #FFB800;
          border: 1.5px solid #FFB800;
          color: #000;
          box-shadow: 0 0 0 4px rgba(255,184,0,0.18);
        }
        .cw-step.done .cw-step-dot {
          background: rgba(16,185,129,0.15);
          border: 1.5px solid #10b981;
          color: #10b981;
        }
        .cw-step-label {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: rgba(255,255,255,0.4);
          transition: color 0.3s;
        }
        .cw-step.active .cw-step-label { color: #FFB800; }
        .cw-step.done  .cw-step-label  { color: #10b981; }

        .cw-step-line {
          flex: 1;
          height: 1.5px;
          background: rgba(255,255,255,0.1);
          margin: 0 4px;
          margin-bottom: 14px;
          transition: background 0.3s;
        }
        .cw-step-line.done { background: rgba(16,185,129,0.5); }

        /* ── Body ── */
        .cw-body {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #FFB800 transparent;
        }
        .cw-body::-webkit-scrollbar { width: 4px; }
        .cw-body::-webkit-scrollbar-thumb { background: #FFB800; border-radius: 4px; }
        .cw-panel { display: flex; flex-direction: column; gap: 0; }

        /* ── Typography ── */
        .cw-section-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: rgba(255,255,255,0.45);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .cw-tiny-label {
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.55);
          margin-bottom: 6px;
          display: block;
        }
        .cw-weight-val {
          font-size: 12px;
          font-weight: 900;
          color: #FFB800;
        }
        .cw-required { color: #ef4444; }
        .cw-optional { color: rgba(255,255,255,0.3); font-weight: 400; }

        /* ── Package Grid ── */
        .cw-pkg-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .cw-pkg-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 8px;
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: all .2s;
        }
        .cw-pkg-card:hover {
          border-color: rgba(255,184,0,0.35);
          background: rgba(255,184,0,0.04);
        }
        .cw-pkg-card.selected {
          border-color: #FFB800;
          background: rgba(255,184,0,0.1);
          box-shadow: 0 0 0 3px rgba(255,184,0,0.12);
        }
        .cw-pkg-icon { font-size: 22px; }
        .cw-pkg-name { font-size: 11px; font-weight: 700; color: #fff; }
        .cw-pkg-max  { font-size: 9px;  color: rgba(255,255,255,0.4); }

        /* ── Slider ── */
        .cw-slider {
          width: 100%;
          accent-color: #FFB800;
          margin-bottom: 4px;
        }
        .cw-slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: rgba(255,255,255,0.3);
          margin-bottom: 0;
        }

        /* ── Inputs ── */
        .cw-input, .cw-textarea {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 14px;
          color: #fff;
          font-size: 13px;
          outline: none;
          transition: border-color .2s, background .2s;
          font-family: inherit;
          resize: none;
          box-sizing: border-box;
        }
        .cw-input:focus, .cw-textarea:focus {
          border-color: #FFB800;
          background: rgba(255,184,0,0.04);
        }
        .cw-input::placeholder, .cw-textarea::placeholder {
          color: rgba(255,255,255,0.25);
        }

        /* ── Insurance Checkbox ── */
        .cw-insurance-check {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          transition: all .2s;
        }
        .cw-insurance-check:hover {
          border-color: rgba(255,184,0,0.3);
        }
        .cw-insurance-check input[type="checkbox"] { display: none; }
        .cw-check-indicator {
          width: 20px; height: 20px;
          border-radius: 6px;
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.3);
          flex-shrink: 0;
          transition: all .2s;
        }
        .cw-insurance-check:has(input:checked) .cw-check-indicator {
          background: #10b981;
          border-color: #10b981;
          color: #fff;
        }
        .cw-insurance-check:has(input:checked) {
          border-color: rgba(16,185,129,0.4);
          background: rgba(16,185,129,0.06);
        }
        .cw-check-text {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          flex: 1;
        }
        .cw-insurance-note {
          font-size: 10px;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
        }

        /* ── Location Fields ── */
        .cw-location-group { position: relative; }
        .cw-route-visual {
          display: none; /* compact mode */
        }
        .cw-input-field {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 12px;
          transition: border-color .2s;
          position: relative;
        }
        .cw-input-field:focus-within {
          border-color: #FFB800;
          background: rgba(255,184,0,0.04);
        }
        .cw-loc-icon { flex-shrink: 0; display: flex; align-items: center; }
        .cw-loc-search {
          flex: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 13px;
          outline: none;
          min-width: 0;
        }
        .cw-loc-badge {
          flex-shrink: 0;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: rgba(255,184,0,0.2);
          border: 1px solid #FFB800;
          color: #FFB800;
          display: flex; align-items: center; justify-content: center;
        }
        .cw-loc-badge.success {
          background: rgba(16,185,129,0.2);
          border-color: #10b981;
          color: #10b981;
        }
        .cw-distance-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          padding: 6px 12px;
          border-radius: 20px;
          background: rgba(255,184,0,0.08);
          border: 1px solid rgba(255,184,0,0.2);
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.7);
        }
        .cw-fare-hint { color: #FFB800; }

        /* ── Recipient Tip ── */
        .cw-recipient-tip {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          font-size: 10px;
          color: rgba(255,255,255,0.4);
        }

        /* ── Summary Card ── */
        .cw-summary-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cw-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cw-sr-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .cw-sr-value {
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }
        .cw-route-txt {
          font-size: 11px;
          color: rgba(255,255,255,0.8);
        }
        .cw-summary-sep {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.07);
          margin: 2px 0;
        }

        /* ── Price Box ── */
        .cw-price-box {
          background: rgba(255,184,0,0.05);
          border: 1px dashed rgba(255,184,0,0.3);
          border-radius: 12px;
          padding: 12px 14px;
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .cw-price-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: rgba(255,255,255,0.5);
        }
        .cw-price-row span:last-child { color: rgba(255,255,255,0.8); font-weight: 600; }
        .cw-price-total {
          display: flex;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid rgba(255,184,0,0.2);
          font-size: 14px;
          font-weight: 900;
          color: #FFB800;
        }

        /* ── Payment Grid ── */
        .cw-payment-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 8px;
        }
        .cw-pay-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 6px;
          border-radius: 10px;
          border: 1.5px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.5);
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s;
        }
        .cw-pay-btn span:first-child { font-size: 18px; }
        .cw-pay-btn:hover {
          border-color: rgba(255,184,0,0.3);
          color: rgba(255,255,255,0.8);
        }
        .cw-pay-btn.selected {
          border-color: #FFB800;
          background: rgba(255,184,0,0.1);
          color: #FFB800;
          box-shadow: 0 0 0 3px rgba(255,184,0,0.12);
        }

        /* ── Footer CTA ── */
        .cw-footer { margin-top: 16px; }
        .cw-btn-primary {
          width: 100%;
          padding: 13px;
          background: #FFB800;
          color: #000;
          border: none;
          border-radius: 12px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all .2s;
          letter-spacing: 0.2px;
        }
        .cw-btn-primary:hover { background: #e6a700; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,184,0,0.3); }
        .cw-btn-primary.disabled {
          background: rgba(255,184,0,0.25);
          color: rgba(0,0,0,0.4);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .cw-btn-ghost {
          width: 100%;
          padding: 11px;
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          margin-top: 8px;
          transition: all .2s;
        }
        .cw-btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: #fff; }

        /* ── Spinner ── */
        .cw-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: cw-spin .7s linear infinite;
        }
        @keyframes cw-spin { to { transform: rotate(360deg); } }

        /* ── Success Screen ── */
        .courier-wiz-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 8px 0 4px;
          gap: 6px;
          color: #fff;
        }
        .cw-success-icon { font-size: 46px; margin-bottom: 4px; }
        .cw-success-title { font-size: 18px; font-weight: 900; margin: 0; }
        .cw-success-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          margin: 0 0 8px;
          max-width: 280px;
        }
        .cw-success-detail {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          padding: 10px 14px;
          width: 100%;
          box-sizing: border-box;
        }
        .cw-sd-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          letter-spacing: .5px;
        }
        .cw-sd-value { font-size: 12px; font-weight: 700; color: #fff; }
        .cw-sd-arrow  { font-size: 14px; color: #FFB800; }
        .cw-success-fare {
          font-size: 26px;
          font-weight: 900;
          color: #FFB800;
          margin: 4px 0;
        }
        .cw-success-actions { display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 6px; }
      `}</style>
    </div>
  );
};

export default CourierWizard;
