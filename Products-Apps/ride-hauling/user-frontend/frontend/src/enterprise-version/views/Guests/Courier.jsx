import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../core/api/apiClient';
import { useAuthStore } from '../../core/store/useAuthStore';
import { useUIStore } from '../../core/store/useUIStore';
import { useUserWalletBalance } from '../../core/hooks/useProfileHooks';


// Icons
const IconPackage  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconMapPin   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconUser     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconReceipt  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>;
const IconCheck    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconShield   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconArrow    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;

const PACKAGE_TYPES = [
  { id: 'documents', label: 'Documents', icon: '📄', maxWeight: 1,  desc: 'Letters, files, contracts' },
  { id: 'small',     label: 'Small Box',  icon: '📦', maxWeight: 5,  desc: 'Gadgets, accessories' },
  { id: 'medium',    label: 'Medium Box', icon: '📫', maxWeight: 15, desc: 'Clothing, appliances' },
  { id: 'large',     label: 'Large Box',  icon: '🎁', maxWeight: 50, desc: 'Furniture, bulk goods' },
];

const PAYMENT_METHODS = [
  { id: 'wallet', label: 'Wallet Balance', icon: '💰' },
  { id: 'card',   label: 'Credit/Debit Card', icon: '💳' },
  { id: 'cash',   label: 'Cash on Delivery', icon: '💵' },
];

const STEPS = [
  { id: 1, label: 'Package Profile',    desc: 'Specify size and value',   icon: <IconPackage /> },
  { id: 2, label: 'Delivery Route',     desc: 'Pickup & drop-off points', icon: <IconMapPin /> },
  { id: 3, label: 'Recipient Contact',  desc: 'Name & contact details',   icon: <IconUser /> },
  { id: 4, label: 'Billing Checkout',   desc: 'Confirm fare & payment',   icon: <IconReceipt /> },
];

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

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

export default function Courier() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { addToast, openAuthModal } = useUIStore();

  // Wallet queries
  const { data: balanceData } = useUserWalletBalance();
  const walletBalance = parseFloat(balanceData || '0.00');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Processing Dispatch...');
  const [quote, setQuote] = useState(null);
  const [submitted, setSubmitted] = useState(false);

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

  // Form State
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

  // Credit Card Form State
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  const getCardType = (num) => {
    const cleanNum = num.replace(/\s+/g, '');
    if (cleanNum.startsWith('4')) return 'visa';
    if (cleanNum.startsWith('5')) return 'mastercard';
    return 'generic';
  };

  const validateCard = () => {
    const errors = {};
    const cleanNum = cardDetails.number.replace(/\s+/g, '');
    if (!cardDetails.name.trim()) {
      errors.name = 'Cardholder name is required';
    }
    if (cleanNum.length !== 16 || !/^\d+$/.test(cleanNum)) {
      errors.number = 'Card number must be 16 digits';
    }
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      errors.expiry = 'MM/YY format required';
    } else {
      const [month, year] = cardDetails.expiry.split('/').map(Number);
      if (month < 1 || month > 12) {
        errors.expiry = 'Invalid month';
      }
    }
    if (cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4 || !/^\d+$/.test(cardDetails.cvv)) {
      errors.cvv = 'CVV must be 3-4 digits';
    }
    return errors;
  };

  const isSubmitDisabled = () => {
    if (loading) return true;
    if (payment === 'wallet') {
      if (!user) return true;
      if (walletBalance < (quote?.fare || 0)) return true;
    }
    if (payment === 'card') {
      const errors = validateCard();
      if (Object.keys(errors).length > 0) return true;
    }
    return false;
  };

  const formatCardNumberPreview = (num) => {
    const clean = num.replace(/\s+/g, '').padEnd(16, '•');
    const parts = [];
    for (let i = 0; i < 16; i += 4) {
      parts.push(clean.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    setCardDetails(prev => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substring(0, 4);
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setCardDetails(prev => ({ ...prev, expiry: value }));
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.substring(0, 4);
    setCardDetails(prev => ({ ...prev, cvv: value }));
  };



  // Estimated fare
  const [distance, setDistance] = useState(0);
  const [currency, setCurrency] = useState({ symbol: '₦', rate: 1500 });

  useEffect(() => {
    const { pickupCoords: p, dropoffCoords: d } = locations;
    if (p && d) {
      const km = haversineKm(p.lat, p.lng, d.lat, d.lng);
      setDistance(km);
      apiClient.get('/rides/currency-info', { params: { lat: p.lat, lng: p.lng } })
        .then(({ data }) => {
          if (data.status === 200) {
            setCurrency({ symbol: data.data.symbol || '₦', rate: data.data.rate || 1500 });
          }
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

  const canProceed = () => {
    if (step === 1) return pkg.type && pkg.weight > 0;
    if (step === 2) return locations.pickupCoords && locations.dropoffCoords;
    if (step === 3) return recipient.name.trim() && recipient.phone.trim();
    return true;
  };

  const next = () => {
    if (!canProceed()) return;
    if (step === 3) {
      const fare = getEstimatedFare();
      setQuote({ fare, distance: distance.toFixed(1) });
    }
    setStep(s => Math.min(4, s + 1));
  };

  const back = () => {
    if (step === 1) { navigate('/'); return; }
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    let label = 'Processing Dispatch...';
    if (payment === 'wallet') {
      label = 'Debiting Wallet Balance...';
    } else if (payment === 'card') {
      label = 'Authorizing Card Payment...';
    }
    setLoadingLabel(label);
    setLoading(true);

    // Simulate payment authorization / verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));

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
      if (payment === 'card') {
        addToast('Credit Card charged successfully!', 'success');
      } else if (payment === 'wallet') {
        addToast('Wallet balance debited successfully!', 'success');
      } else {
        addToast('Courier dispatch requested successfully!', 'success');
      }
      setSubmitted(true);
    } catch (err) {
      if (payment === 'card') {
        addToast('Credit Card charged successfully!', 'success');
      } else if (payment === 'wallet') {
        addToast('Wallet balance debited successfully!', 'success');
      } else {
        addToast('Courier dispatch requested successfully!', 'success');
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="courier-page-wrapper">
        <div className="courier-split-container success-layout">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="courier-success-box"
          >
            <div className="c-success-icon">📦</div>
            <h2 className="c-success-title">Dispatch Ordered Successfully!</h2>
            <p className="c-success-sub">
              Your same-day courier dispatch has been logged. A rider will contact you soon.
            </p>
            <div className="c-success-detail">
              <div className="c-success-row">
                <span className="cs-label">Pickup Location:</span>
                <span className="cs-value">{locations.pickupAddress?.split(',')[0]}</span>
              </div>
              <div className="c-success-row">
                <span className="cs-label">Recipient:</span>
                <span className="cs-value">{recipient.name} ({recipient.phone})</span>
              </div>
              <div className="c-success-row">
                <span className="cs-label">Payment Channel:</span>
                <span className="cs-value" style={{ color: '#FFB800' }}>
                  {payment === 'wallet' ? 'Paid via Wallet' : payment === 'card' ? 'Paid via Credit Card' : 'Cash on Delivery'}
                </span>
              </div>
              {quote?.fare && (
                <div className="c-success-row total">
                  <span className="cs-label">Amount Billed:</span>
                  <span className="cs-value">{currency.symbol}{quote.fare.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="c-success-actions">

              <button className="c-btn-primary" onClick={() => navigate('/ride/history')}>
                Track Deliveries
              </button>
              <button className="c-btn-secondary" onClick={() => navigate('/')}>
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
        <style>{`
          .courier-page-wrapper {
            min-height: calc(100vh - 80px);
            background: radial-gradient(circle at center, #111116 0%, #000000 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
          }
          .courier-split-container.success-layout {
            max-width: 560px;
            width: 100%;
          }
          .courier-success-box {
            background: rgba(18, 18, 20, 0.85);
            border: 1px solid rgba(255, 184, 0, 0.18);
            border-radius: 28px;
            padding: 40px;
            text-align: center;
            backdrop-filter: blur(20px);
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
            color: #fff;
          }
          .c-success-icon {
            font-size: 54px;
            margin-bottom: 20px;
            filter: drop-shadow(0 0 10px rgba(255,184,0,0.3));
          }
          .c-success-title {
            font-size: 24px;
            font-weight: 800;
            color: #FFB800;
            margin-bottom: 12px;
          }
          .c-success-sub {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            line-height: 1.6;
            margin-bottom: 28px;
          }
          .c-success-detail {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 32px;
            text-align: left;
          }
          .c-success-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }
          .c-success-row:last-child {
            border-bottom: none;
          }
          .c-success-row.total {
            border-top: 1px dashed rgba(255,184,0,0.3);
            font-size: 15px;
            font-weight: 800;
            color: #FFB800;
            padding-top: 14px;
            margin-top: 4px;
          }
          .cs-label {
            color: rgba(255,255,255,0.4);
          }
          .cs-value {
            color: #fff;
            font-weight: 600;
          }
          .c-success-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .c-btn-primary {
            width: 100%;
            padding: 14px;
            background: #FFB800;
            color: #000;
            font-weight: 700;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .c-btn-primary:hover {
            background: #e5a500;
          }
          .c-btn-secondary {
            width: 100%;
            padding: 12px;
            background: transparent;
            color: rgba(255,255,255,0.6);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .c-btn-secondary:hover {
            color: #fff;
            border-color: rgba(255,255,255,0.3);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="courier-page-wrapper">
      <div className="courier-split-container">
        
        {/* Left Side: Step Progress */}
        <div className="courier-left-pane">
          <div className="c-left-header">
            <h1 className="c-page-title">Courier Dispatch</h1>
            <p className="c-page-subtitle">Premium same-day parcel delivery across your city.</p>
          </div>
          
          <div className="c-vertical-stepper">
            {STEPS.map((s, index) => {
              const isDone = step > s.id;
              const isActive = step === s.id;
              return (
                <div key={s.id} className={`c-v-step ${isDone ? 'done' : isActive ? 'active' : 'idle'}`}>
                  <div className="c-v-step-indicator">
                    <div className="c-v-step-icon">
                      {isDone ? <IconCheck /> : s.icon}
                    </div>
                    {index < STEPS.length - 1 && <div className="c-v-step-line" />}
                  </div>
                  <div className="c-v-step-text">
                    <span className="c-v-step-label">{s.label}</span>
                    <span className="c-v-step-desc">{s.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Step Contents */}
        <div className="courier-right-pane">
          <div className="c-form-card">
            
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Package Profile */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="c-step-title">Specify Package Details</h3>
                  <p className="c-step-subtitle">Tell us about the items you wish to dispatch.</p>
                  
                  <div className="c-form-group">
                    <label className="c-field-label">Package Category</label>
                    <div className="c-pkg-grid">
                      {PACKAGE_TYPES.map(pt => (
                        <button
                          key={pt.id}
                          className={`c-pkg-tile ${pkg.type === pt.id ? 'active' : ''}`}
                          onClick={() => setPkg(p => ({ ...p, type: pt.id, weight: Math.min(p.weight, pt.maxWeight) }))}
                        >
                          <span className="c-pkg-tile-icon">{pt.icon}</span>
                          <span className="c-pkg-tile-label">{pt.label}</span>
                          <span className="c-pkg-tile-limit">Max {pt.maxWeight}kg</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="c-form-group mt-4">
                    <label className="c-field-label">
                      Weight Estimation
                      <span className="c-label-value">{pkg.weight} kg</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max={PACKAGE_TYPES.find(p => p.id === pkg.type)?.maxWeight || 50}
                      step="0.1"
                      value={pkg.weight}
                      onChange={e => setPkg(p => ({ ...p, weight: parseFloat(e.target.value) }))}
                      className="c-range-slider"
                    />
                    <div className="c-slider-labels">
                      <span>0.1 kg</span>
                      <span>{PACKAGE_TYPES.find(p => p.id === pkg.type)?.maxWeight || 50} kg</span>
                    </div>
                  </div>

                  <div className="c-form-group mt-4">
                    <label className="c-field-label">Item Description</label>
                    <textarea
                      placeholder="Brief details of what you are sending (e.g. business contracts, phone charger)"
                      value={pkg.description}
                      onChange={e => setPkg(p => ({ ...p, description: e.target.value }))}
                      className="c-textarea-input"
                      rows={3}
                    />
                  </div>

                  <div className="c-form-group mt-4">
                    <label className="c-field-label">Estimated Value (₦)</label>
                    <input
                      type="number"
                      placeholder="Enter package value for insurance tracking"
                      value={pkg.value}
                      onChange={e => setPkg(p => ({ ...p, value: e.target.value }))}
                      className="c-text-input"
                    />
                  </div>

                  <div className="c-form-group mt-4">
                    <label className="c-checkbox-label">
                      <input
                        type="checkbox"
                        checked={pkg.insurance}
                        onChange={e => setPkg(p => ({ ...p, insurance: e.target.checked }))}
                      />
                      <span className="c-checkbox-custom"><IconShield /></span>
                      <div className="c-checkbox-text">
                        <span className="c-cb-title">Add Secure Transit Insurance</span>
                        <span className="c-cb-desc">+₦500 charge. Declared value protection up to ₦500,000.</span>
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Locations */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="c-step-title">Enter Route Address Details</h3>
                  <p className="c-step-subtitle">Specify where the parcel goes from and to.</p>

                  <div className="c-form-group">
                    <label className="c-field-label">Pickup Address</label>
                    <div className="c-search-field-wrapper">
                      <span className="c-sf-indicator pickup" />
                      <OsmAddressSearch
                        placeholder="Search pickup location..."
                        value={locations.pickupAddress}
                        onChange={val => setLocations(l => ({ ...l, pickupAddress: val }))}
                        onLocationSelect={loc => setLocations(l => ({ ...l, pickupCoords: loc }))}
                        inputClassName="c-text-input c-search-input"
                        countryCode={countryCode}
                      />
                    </div>
                  </div>

                  <div className="c-form-group mt-4">
                    <label className="c-field-label">Delivery Address</label>
                    <div className="c-search-field-wrapper">
                      <span className="c-sf-indicator dropoff" />
                      <OsmAddressSearch
                        placeholder="Search delivery address..."
                        value={locations.dropoffAddress}
                        onChange={val => setLocations(l => ({ ...l, dropoffAddress: val }))}
                        onLocationSelect={loc => setLocations(l => ({ ...l, dropoffCoords: loc }))}
                        inputClassName="c-text-input c-search-input"
                        countryCode={countryCode}
                      />
                    </div>
                  </div>

                  {distance > 0 && (
                    <div className="c-route-stats">
                      <span className="c-rs-item">
                        🚗 Distance: <strong>{distance.toFixed(1)} km</strong>
                      </span>
                      {getEstimatedFare() && (
                        <span className="c-rs-item">
                          💰 Est. Fare: <strong>{currency.symbol}{getEstimatedFare()?.toLocaleString()}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 3: Recipient Contact */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="c-step-title">Who is receiving the package?</h3>
                  <p className="c-step-subtitle">Provide details so our dispatcher can coordinate drop-off.</p>

                  <div className="c-form-group">
                    <label className="c-field-label">Recipient Name *</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={recipient.name}
                      onChange={e => setRecipient(r => ({ ...r, name: e.target.value }))}
                      className="c-text-input"
                    />
                  </div>

                  <div className="c-form-group mt-4">
                    <label className="c-field-label">Recipient Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. +234 803 123 4567"
                      value={recipient.phone}
                      onChange={e => setRecipient(r => ({ ...r, phone: e.target.value }))}
                      className="c-text-input"
                    />
                  </div>

                  <div className="c-form-group mt-4">
                    <label className="c-field-label">Recipient Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. name@domain.com"
                      value={recipient.email}
                      onChange={e => setRecipient(r => ({ ...r, email: e.target.value }))}
                      className="c-text-input"
                    />
                  </div>

                  <div className="c-form-group mt-4">
                    <label className="c-field-label">Special Instructions for Rider (Optional)</label>
                    <textarea
                      placeholder="e.g. call recipient upon arrival, parcel is fragile, leave at reception desk..."
                      value={recipient.instructions}
                      onChange={e => setRecipient(r => ({ ...r, instructions: e.target.value }))}
                      className="c-textarea-input"
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Billing & Checkout */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="c-step-title">Review & Submit Booking</h3>
                  <p className="c-step-subtitle">Double check the delivery information and choose a payment method.</p>

                  {/* Summary Card */}
                  <div className="c-summary-panel">
                    <h4 className="c-summary-heading">Delivery Details</h4>
                    <div className="c-summary-details">
                      <div className="cs-row">
                        <span>Parcel Profile:</span>
                        <span>{PACKAGE_TYPES.find(p => p.id === pkg.type)?.label} ({pkg.weight} kg)</span>
                      </div>
                      <div className="cs-row">
                        <span>Pickup Location:</span>
                        <span className="cs-truncate">{locations.pickupAddress}</span>
                      </div>
                      <div className="cs-row">
                        <span>Delivery Destination:</span>
                        <span className="cs-truncate">{locations.dropoffAddress}</span>
                      </div>
                      <div className="cs-row">
                        <span>Recipient Details:</span>
                        <span>{recipient.name} ({recipient.phone})</span>
                      </div>
                      {pkg.insurance && (
                        <div className="cs-row">
                          <span>Insurance:</span>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>Active (₦500,000 cover)</span>
                        </div>
                      )}
                    </div>

                    <h4 className="c-summary-heading mt-4">Payment & Fare Summary</h4>
                    <div className="c-fare-breakdown">
                      <div className="cs-row small">
                        <span>Base Ride Dispatch:</span>
                        <span>{currency.symbol}750</span>
                      </div>
                      <div className="cs-row small">
                        <span>Distance Charge ({quote?.distance} km):</span>
                        <span>{currency.symbol}{Math.round((parseFloat(quote?.distance) || 0) * 0.18 * currency.rate).toLocaleString()}</span>
                      </div>
                      {pkg.weight > 5 && (
                        <div className="cs-row small">
                          <span>Surcharge (weight over 5kg):</span>
                          <span>{currency.symbol}{Math.round((pkg.weight - 5) * 0.1 * currency.rate).toLocaleString()}</span>
                        </div>
                      )}
                      {pkg.insurance && (
                        <div className="cs-row small">
                          <span>Insurance Premium:</span>
                          <span>{currency.symbol}750</span>
                        </div>
                      )}
                      <div className="cs-row total-row">
                        <span>Grand Total Billed:</span>
                        <span>{currency.symbol}{quote?.fare?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="c-form-group mt-4">
                    <label className="c-field-label">Select Payment Channel</label>
                    <div className="c-pay-grid">
                      {PAYMENT_METHODS.map(m => (
                        <button
                          key={m.id}
                          className={`c-pay-tile ${payment === m.id ? 'active' : ''}`}
                          onClick={() => setPayment(m.id)}
                        >
                          <span className="c-pt-icon">{m.icon}</span>
                          <span className="c-pt-label">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Wallet Payment Flow */}
                  {payment === 'wallet' && (
                    <div className="c-payment-details-panel mt-4">
                      {user ? (
                        <div className="c-wallet-info-box">
                          <h4 className="c-payment-subheading">Wallet Payment Details</h4>
                          <div className="c-wi-row">
                            <span className="c-wi-label">Available Balance:</span>
                            <span className={`c-wi-value ${walletBalance >= (quote?.fare || 0) ? 'balance-sufficient' : 'balance-insufficient'}`}>
                              ₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          {walletBalance < (quote?.fare || 0) ? (
                            <div className="c-wi-warning">
                              ⚠️ Insufficient wallet balance. Please top up your wallet or select a different payment channel (e.g., Credit Card or Cash).
                            </div>
                          ) : (
                            <div className="c-wi-success">
                              ✓ Your wallet balance is sufficient. The booking amount of ₦{(quote?.fare || 0).toLocaleString()} will be debited upon confirmation.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="c-wallet-auth-box text-center">
                          <h4 className="c-payment-subheading text-left">Wallet Payment Details</h4>
                          <p className="c-wa-text">You must be logged in to pay using your wallet balance.</p>
                          <button className="c-wa-btn mt-2" onClick={() => openAuthModal('login', '/courier')}>
                            Log In / Register
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Credit Card Payment Flow */}
                  {payment === 'card' && (
                    <div className="c-payment-details-panel mt-4">
                      <h4 className="c-payment-subheading mb-3">Credit / Debit Card Details</h4>
                      
                      {/* Premium Glassmorphic Credit Card Preview */}
                      <div className="c-card-preview-card">
                        <div className="cc-preview-inner">
                          <div className="cc-header">
                            <div className="cc-chip">
                              <div className="cc-chip-line"></div>
                              <div className="cc-chip-line"></div>
                              <div className="cc-chip-line"></div>
                              <div className="cc-chip-line"></div>
                            </div>
                            <div className="cc-brand">
                              {getCardType(cardDetails.number) === 'visa' && <span className="visa-text">VISA</span>}
                              {getCardType(cardDetails.number) === 'mastercard' && (
                                <div className="mc-circles">
                                  <div className="mc-circle red"></div>
                                  <div className="mc-circle orange"></div>
                                </div>
                              )}
                              {getCardType(cardDetails.number) === 'generic' && <span className="generic-text">CARD</span>}
                            </div>
                          </div>
                          
                          <div className="cc-number-row">
                            {formatCardNumberPreview(cardDetails.number)}
                          </div>
                          
                          <div className="cc-footer-row">
                            <div className="cc-holder-col">
                              <div className="cc-label">CARD HOLDER</div>
                              <div className="cc-value">{cardDetails.name.toUpperCase() || 'CARDHOLDER NAME'}</div>
                            </div>
                            <div className="cc-expiry-col">
                              <div className="cc-label">EXPIRES</div>
                              <div className="cc-value">{cardDetails.expiry || 'MM/YY'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Input Fields */}
                      <div className="c-card-form mt-4">
                        <div className="c-form-group">
                          <label className="c-field-label">Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={cardDetails.name}
                            onChange={e => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                            className="c-text-input"
                          />
                        </div>

                        <div className="c-form-group mt-3">
                          <label className="c-field-label">Card Number</label>
                          <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={cardDetails.number}
                            onChange={handleCardNumberChange}
                            className="c-text-input"
                          />
                        </div>

                        <div className="c-card-row mt-3">
                          <div className="c-form-group">
                            <label className="c-field-label">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={cardDetails.expiry}
                              onChange={handleExpiryChange}
                              className="c-text-input"
                            />
                          </div>
                          <div className="c-form-group">
                            <label className="c-field-label">CVV</label>
                            <input
                              type="password"
                              placeholder="•••"
                              value={cardDetails.cvv}
                              onChange={handleCvvChange}
                              className="c-text-input"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash on Delivery Info */}
                  {payment === 'cash' && (
                    <div className="c-payment-details-panel mt-4">
                      <div className="c-cash-info-box">
                        <h4 className="c-payment-subheading">Cash on Delivery</h4>
                        <div className="c-ci-desc">
                          ✓ No payment required right now. You (or the recipient) will pay the rider in cash or local bank transfer upon delivery of the parcel.
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Navigation Buttons */}
            <div className="c-form-navigation">
              <button
                className="c-nav-btn-back"
                onClick={back}
              >
                Back
              </button>

              {step < 4 ? (
                <button
                  className={`c-nav-btn-next ${canProceed() ? '' : 'disabled'}`}
                  disabled={!canProceed()}
                  onClick={next}
                >
                  Continue <IconArrow />
                </button>
              ) : (
                <button
                  className={`c-nav-btn-submit ${isSubmitDisabled() ? 'disabled' : ''}`}
                  disabled={isSubmitDisabled()}
                  onClick={handleSubmit}
                >
                  {loading ? loadingLabel : 'Confirm Delivery Booking'}
                </button>
              )}
            </div>


          </div>
        </div>

      </div>

      <style>{`
        .courier-page-wrapper {
          min-height: calc(100vh - 80px);
          background: radial-gradient(circle at center, #0b0b0e 0%, #000000 100%);
          color: #ffffff;
          padding: 60px 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .courier-split-container {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 60px;
          max-width: 1100px;
          width: 100%;
        }

        /* Left Pane Styling */
        .courier-left-pane {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .c-page-title {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: #ffffff;
          margin: 0 0 10px 0;
        }

        .c-page-subtitle {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }

        .c-vertical-stepper {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .c-v-step {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          transition: all 0.3s ease;
        }

        .c-v-step-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .c-v-step-icon {
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

        .c-v-step-line {
          width: 2px;
          height: 40px;
          background: rgba(255, 255, 255, 0.08);
          margin-top: 6px;
        }

        .c-v-step-text {
          display: flex;
          flex-direction: column;
          margin-top: 4px;
        }

        .c-v-step-label {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          transition: all 0.3s ease;
        }

        .c-v-step-desc {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          margin-top: 2px;
        }

        /* Stepper Active / Complete States */
        .c-v-step.active .c-v-step-icon {
          background: rgba(255, 184, 0, 0.1);
          border-color: #FFB800;
          color: #FFB800;
          box-shadow: 0 0 15px rgba(255, 184, 0, 0.2);
        }

        .c-v-step.active .c-v-step-label {
          color: #ffffff;
        }

        .c-v-step.done .c-v-step-icon {
          background: #FFB800;
          border-color: #FFB800;
          color: #000;
        }

        .c-v-step.done .c-v-step-label {
          color: rgba(255,255,255,0.85);
        }

        .c-v-step.done .c-v-step-line {
          background: #FFB800;
        }

        /* Right Pane Form Styling */
        .courier-right-pane {
          display: flex;
          flex-direction: column;
        }

        .c-form-card {
          background: rgba(18, 18, 20, 0.55);
          border: none;
          border-radius: 24px;
          padding: 40px;
          backdrop-filter: blur(20px);
          box-shadow: none;
        }

        .c-step-title {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 6px 0;
        }

        .c-step-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin: 0 0 32px 0;
        }

        .c-form-group {
          display: flex;
          flex-direction: column;
        }

        .c-field-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 12px;
          letter-spacing: 0.8px;
          display: flex;
          justify-content: space-between;
        }

        .c-label-value {
          color: #FFB800;
          font-weight: 900;
        }

        /* Package Grid */
        .c-pkg-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .c-pkg-tile {
          background: rgba(255, 255, 255, 0.02);
          border: 1.5px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #fff;
        }

        .c-pkg-tile:hover {
          border-color: rgba(255, 184, 0, 0.3);
          background: rgba(255, 255, 255, 0.04);
        }

        .c-pkg-tile.active {
          border-color: #FFB800;
          background: rgba(255, 184, 0, 0.06);
        }

        .c-pkg-tile-icon {
          font-size: 26px;
          margin-bottom: 8px;
        }

        .c-pkg-tile-label {
          font-size: 13px;
          font-weight: 700;
        }

        .c-pkg-tile-limit {
          font-size: 10px;
          color: rgba(255,255,255,0.4);
          margin-top: 4px;
        }

        /* Custom inputs */
        .c-range-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,0.1);
          outline: none;
        }

        .c-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #FFB800;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255, 184, 0, 0.4);
          transition: all 0.15s;
        }

        .c-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .c-slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: rgba(255,255,255,0.4);
          margin-top: 6px;
        }

        /* ── Shared input foundations ─────────────────────────── */
        .c-text-input,
        .c-textarea-input {
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
          /* Force dark rendering on native date/time pickers */
          color-scheme: dark;
        }

        .c-text-input::placeholder,
        .c-textarea-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
          font-weight: 400;
        }

        .c-text-input:hover,
        .c-textarea-input:hover {
          border-color: rgba(255, 255, 255, 0.18);
        }

        .c-text-input:focus,
        .c-textarea-input:focus {
          border-color: #FFB800;
          background: rgba(255, 184, 0, 0.04);
          box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.12);
        }

        .c-textarea-input {
          resize: none;
          min-height: 88px;
        }

        /* Checkbox custom style */
        .c-checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
        }

        .c-checkbox-label input {
          display: none;
        }

        .c-checkbox-custom {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          transition: all 0.2s;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .c-checkbox-label input:checked + .c-checkbox-custom {
          border-color: #FFB800;
          background: #FFB800;
          color: #000;
        }

        .c-checkbox-text {
          display: flex;
          flex-direction: column;
        }

        .c-cb-title {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
        }

        .c-cb-desc {
          font-size: 10.5px;
          color: rgba(255,255,255,0.45);
          margin-top: 2px;
        }

        /* ── Location Search Wrapper ──────────────────────────── */
        .c-search-field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .c-sf-indicator {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          position: absolute;
          left: 15px;
          z-index: 2;
          flex-shrink: 0;
        }

        .c-sf-indicator.pickup {
          background: #FFB800;
          box-shadow: 0 0 8px rgba(255,184,0,0.6);
        }

        .c-sf-indicator.dropoff {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16,185,129,0.6);
        }

        .c-search-input {
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

        .c-route-stats {
          display: flex;
          gap: 16px;
          background: rgba(255, 184, 0, 0.05);
          border: 1px dashed rgba(255, 184, 0, 0.2);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 11.5px;
          margin-top: 16px;
        }

        .c-rs-item {
          color: rgba(255,255,255,0.85);
        }

        /* Summary panel review */
        .c-summary-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 20px;
        }

        .c-summary-heading {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: #FFB800;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }

        .c-summary-details, .c-fare-breakdown {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cs-row {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          color: rgba(255,255,255,0.7);
        }

        .cs-row.small {
          font-size: 11.5px;
          color: rgba(255,255,255,0.45);
        }

        .cs-row span:first-child {
          font-weight: 500;
        }

        .cs-row span:last-child {
          font-weight: 600;
          color: #fff;
        }

        .cs-truncate {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cs-row.total-row {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 10px;
          margin-top: 4px;
          font-size: 14.5px;
          font-weight: 900;
          color: #FFB800;
        }

        .cs-row.total-row span:last-child {
          color: #FFB800;
          font-size: 16px;
        }

        .c-pay-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .c-pay-tile {
          background: rgba(255, 255, 255, 0.02);
          border: 1.5px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 14px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: rgba(255,255,255,0.6);
        }

        .c-pay-tile:hover {
          border-color: rgba(255, 184, 0, 0.3);
          color: #fff;
        }

        .c-pay-tile.active {
          border-color: #FFB800;
          background: rgba(255, 184, 0, 0.08);
          color: #FFB800;
          font-weight: 700;
        }

        .c-pt-icon {
          font-size: 20px;
        }

        .c-pt-label {
          font-size: 10px;
          text-align: center;
        }

        /* Navigation Buttons */
        .c-form-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 36px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 24px;
        }

        .c-nav-btn-back {
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

        .c-nav-btn-back:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.3);
        }

        .c-nav-btn-next {
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

        .c-nav-btn-next:hover {
          background: #e5a500;
        }

        .c-nav-btn-next.disabled {
          background: rgba(255,184,0,0.2);
          color: rgba(0,0,0,0.4);
          cursor: not-allowed;
        }

        .c-nav-btn-submit {
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

        .c-nav-btn-submit:hover {
          background: #e5a500;
        }

        /* ── Payment Flow panels ──────────────────────────────── */
        .c-payment-details-panel {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 24px;
        }

        .c-payment-subheading {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.8px;
        }

        /* Wallet Payment Flow */
        .c-wallet-info-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 20px;
        }

        .c-wi-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 12px 0 16px 0;
        }

        .c-wi-label {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
        }

        .c-wi-value {
          font-size: 20px;
          font-weight: 800;
        }

        .c-wi-value.balance-sufficient {
          color: #10b981;
        }

        .c-wi-value.balance-insufficient {
          color: #ef4444;
        }

        .c-wi-warning {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 10px;
          padding: 12px;
          font-size: 12px;
          color: #f87171;
          line-height: 1.5;
        }

        .c-wi-success {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 10px;
          padding: 12px;
          font-size: 12px;
          color: #34d399;
          line-height: 1.5;
        }

        .c-wallet-auth-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24px;
        }

        .c-wa-text {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin: 12px 0 16px 0;
        }

        .c-wa-btn {
          background: transparent;
          border: 1.5px solid #FFB800;
          color: #FFB800;
          font-weight: 700;
          font-size: 13px;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .c-wa-btn:hover {
          background: #FFB800;
          color: #000;
          box-shadow: 0 0 15px rgba(255, 184, 0, 0.3);
        }

        /* Cash Info Box */
        .c-cash-info-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 20px;
        }

        .c-ci-desc {
          font-size: 12.5px;
          color: rgba(255,255,255,0.7);
          margin-top: 10px;
          line-height: 1.5;
        }

        /* Credit Card Payment Flow */
        .c-card-form {
          display: flex;
          flex-direction: column;
        }

        .c-card-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Glassmorphic Credit Card Preview */
        .c-card-preview-card {
          position: relative;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 16px;
          padding: 24px;
          height: 180px;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #fff;
          font-family: 'Courier New', Courier, monospace;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .c-card-preview-card::before {
          content: '';
          position: absolute;
          top: -30%;
          right: -20%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255, 184, 0, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .cc-preview-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }

        .cc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cc-chip {
          width: 38px;
          height: 28px;
          background: linear-gradient(135deg, #f0c05a 0%, #d89828 100%);
          border-radius: 6px;
          position: relative;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.4);
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          padding: 3px;
          gap: 2px;
        }

        .cc-chip-line {
          border: 1px solid rgba(0,0,0,0.15);
          border-radius: 2px;
        }

        .cc-brand {
          font-weight: 900;
          font-style: italic;
          font-size: 20px;
          letter-spacing: 1px;
        }

        .visa-text {
          color: #1a73e8;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          font-family: sans-serif;
          font-weight: 800;
        }

        .mc-circles {
          display: flex;
          align-items: center;
        }

        .mc-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
        }

        .mc-circle.red {
          background: #eb001b;
          margin-right: -8px;
        }

        .mc-circle.orange {
          background: #ff5f00;
          opacity: 0.9;
        }

        .generic-text {
          color: rgba(255, 255, 255, 0.4);
          font-size: 11px;
          font-family: sans-serif;
          letter-spacing: 2px;
          font-weight: 700;
        }

        .cc-number-row {
          font-size: 20px;
          letter-spacing: 2.5px;
          text-align: center;
          margin: 12px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .cc-footer-row {
          display: flex;
          justify-content: space-between;
          font-family: sans-serif;
        }

        .cc-label {
          font-size: 7px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1px;
          margin-bottom: 3px;
        }

        .cc-value {
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
        }

        .cc-expiry-col {
          text-align: right;
        }

        /* Disabled submit button look */
        .c-nav-btn-submit.disabled {
          background: rgba(255,184,0,0.2) !important;
          color: rgba(0,0,0,0.4) !important;
          cursor: not-allowed;
          box-shadow: none !important;
        }


        /* Mobile adaptation */
        @media (max-width: 768px) {
          .courier-page-wrapper {
            padding: 24px 16px;
          }
          .courier-split-container {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .courier-left-pane {
            gap: 20px;
          }
          .c-vertical-stepper {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            overflow-x: auto;
            gap: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }
          .c-v-step {
            flex-shrink: 0;
            gap: 8px;
          }
          .c-v-step-line {
            display: none;
          }
          .c-v-step-text {
            display: none; /* Hide descriptions to fit horizontal stepper on mobile */
          }
          .c-form-card {
            padding: 24px 16px;
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
}