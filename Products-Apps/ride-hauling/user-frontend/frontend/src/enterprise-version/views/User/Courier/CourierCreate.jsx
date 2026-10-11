import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Package, MapPin, Phone, Mail, DollarSign, AlertCircle, CheckCircle, Truck } from 'lucide-react';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { useUIStore } from '../../../core/store/useUIStore';

const CourierCreate = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { addToast } = useUIStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    packageType: 'documents',
    weight: '',
    description: '',
    value: '',
    insurance: false,
    pickupAddress: '',
    pickupCoords: null,
    dropoffAddress: '',
    dropoffCoords: null,
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    specialInstructions: '',
    paymentMethod: 'wallet'
  });

  const [quote, setQuote] = useState(null);
  const [mapStep, setMapStep] = useState('pickup'); // 'pickup' or 'dropoff'
  const [selectedCoords, setSelectedCoords] = useState(null);

  const packageTypes = [
    { id: 'documents', label: 'Documents', icon: '📄', maxWeight: 1 },
    { id: 'small', label: 'Small Package', icon: '📦', maxWeight: 5 },
    { id: 'medium', label: 'Medium Package', icon: '📫', maxWeight: 15 },
    { id: 'large', label: 'Large Package', icon: '🎁', maxWeight: 50 }
  ];

  const calculateQuote = async () => {
    if (!formData.pickupCoords || !formData.dropoffCoords) {
      addToast('Please select both pickup and dropoff locations', 'warning');
      return;
    }

    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
      const response = await fetch(`${API_URL}/courier/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          pickupCoords: formData.pickupCoords,
          dropoffCoords: formData.dropoffCoords,
          packageType: formData.packageType,
          weight: parseFloat(formData.weight) || 1,
          value: parseFloat(formData.value) || 0,
          insurance: formData.insurance
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQuote(data);
        setStep(4);
      } else {
        addToast('Failed to calculate quote', 'error');
      }
    } catch (error) {
      console.error('Quote error:', error);
      addToast('Error calculating quote', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShipment = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
      const response = await fetch(`${API_URL}/courier/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.id || user?._id,
          totalPrice: quote?.totalPrice
        })
      });

      if (response.ok) {
        const data = await response.json();
        addToast('Shipment created successfully!', 'success');
        navigate(`/courier/track/${data.shipmentId}`);
      } else {
        addToast('Failed to create shipment', 'error');
      }
    } catch (error) {
      console.error('Create shipment error:', error);
      addToast('Error creating shipment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const MapPicker = ({ onSelect }) => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        onSelect({ lat, lng });
      }
    });
    return null;
  };

  const handleAddressSelect = (coords) => {
    if (mapStep === 'pickup') {
      setFormData(prev => ({
        ...prev,
        pickupCoords: coords,
        pickupAddress: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
      }));
      setMapStep('dropoff');
      addToast('Pickup location set. Now select dropoff location.', 'success');
    } else {
      setFormData(prev => ({
        ...prev,
        dropoffCoords: coords,
        dropoffAddress: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
      }));
      setStep(3);
      addToast('Dropoff location set.', 'success');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '40px' }}>
          <button 
            onClick={() => navigate('/courier')}
            style={{ background: 'none', border: 'none', color: '#667eea', fontSize: '1rem', cursor: 'pointer', marginBottom: '20px' }}
          >
            ← Back to Courier
          </button>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>Send a Package</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>Step {step} of 4</p>
        </motion.div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
          {[1, 2, 3, 4].map(s => (
            <div 
              key={s}
              style={{
                flex: 1,
                height: '4px',
                background: s <= step ? '#667eea' : '#e2e8f0',
                borderRadius: '2px',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Package Details */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '30px', color: '#0f172a' }}>Package Details</h2>

                {/* Package Type Selection */}
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '15px', color: '#0f172a' }}>Package Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                    {packageTypes.map(type => (
                      <motion.button
                        key={type.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setFormData(prev => ({ ...prev, packageType: type.id }))}
                        style={{
                          padding: '20px',
                          border: formData.packageType === type.id ? '2px solid #667eea' : '2px solid #e2e8f0',
                          borderRadius: '12px',
                          background: formData.packageType === type.id ? '#eff6ff' : '#fff',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{type.icon}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{type.label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '5px' }}>Up to {type.maxWeight}kg</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Weight */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Weight (kg)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="Enter package weight"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What's in the package?"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', minHeight: '100px', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Value */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Package Value (₦)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Estimated value"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                  />
                </div>

                {/* Insurance */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.insurance}
                    onChange={(e) => setFormData(prev => ({ ...prev, insurance: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>Add insurance (₦500 - covers up to ₦500,000)</span>
                </label>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setStep(2)}
                  style={{ width: '100%', padding: '14px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Next: Select Locations
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Location Selection */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', color: '#0f172a' }}>
                  {mapStep === 'pickup' ? 'Select Pickup Location' : 'Select Dropoff Location'}
                </h2>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Click on the map to select the {mapStep} location</p>

                <div style={{ height: '400px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                  <MapContainer center={[6.5244, 3.3792]} zoom={15} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png" />
                    <MapPicker onSelect={handleAddressSelect} />
                    {formData.pickupCoords && (
                      <Marker position={[formData.pickupCoords.lat, formData.pickupCoords.lng]} />
                    )}
                    {formData.dropoffCoords && (
                      <Marker position={[formData.dropoffCoords.lat, formData.dropoffCoords.lng]} />
                    )}
                  </MapContainer>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Pickup Address</label>
                    <input
                      type="text"
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                      placeholder="Pickup address"
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Dropoff Address</label>
                    <input
                      type="text"
                      value={formData.dropoffAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, dropoffAddress: e.target.value }))}
                      placeholder="Dropoff address"
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setStep(1)}
                    style={{ flex: 1, padding: '14px', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => calculateQuote()}
                    disabled={loading || !formData.pickupCoords || !formData.dropoffCoords}
                    style={{ flex: 1, padding: '14px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', opacity: loading || !formData.pickupCoords || !formData.dropoffCoords ? 0.5 : 1 }}
                  >
                    {loading ? 'Calculating...' : 'Get Quote'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Recipient Details */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '30px', color: '#0f172a' }}>Recipient Details</h2>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Recipient Name</label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="Full name"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.recipientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipientPhone: e.target.value }))}
                    placeholder="+234 800 000 0000"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Email Address</label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="email@example.com"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                  />
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Special Instructions</label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    placeholder="Any special delivery instructions?"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', minHeight: '100px', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setStep(2)}
                    style={{ flex: 1, padding: '14px', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => calculateQuote()}
                    disabled={loading}
                    style={{ flex: 1, padding: '14px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
                  >
                    {loading ? 'Calculating...' : 'Review & Pay'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Review & Payment */}
          {step === 4 && quote && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '30px', color: '#0f172a' }}>Review & Payment</h2>

                {/* Summary */}
                <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0' }}>From</p>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{formData.pickupAddress}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0' }}>To</p>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{formData.dropoffAddress}</p>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '15px' }}>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 5px 0' }}>Package: {formData.description}</p>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Recipient: {formData.recipientName}</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', color: '#0f172a' }}>Price Breakdown</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#64748b' }}>Base Fare</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>₦{quote.baseFare?.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#64748b' }}>Distance Charge</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>₦{quote.distanceCharge?.toLocaleString()}</span>
                  </div>
                  {formData.insurance && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: '#64748b' }}>Insurance</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>₦500</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>Total</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#667eea' }}>₦{quote.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '15px', color: '#0f172a' }}>Payment Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    {['wallet', 'card'].map(method => (
                      <motion.button
                        key={method}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                        style={{
                          padding: '15px',
                          border: formData.paymentMethod === method ? '2px solid #667eea' : '2px solid #e2e8f0',
                          borderRadius: '12px',
                          background: formData.paymentMethod === method ? '#eff6ff' : '#fff',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{method === 'wallet' ? '💰' : '💳'}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{method === 'wallet' ? 'Wallet' : 'Card'}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setStep(3)}
                    style={{ flex: 1, padding: '14px', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={handleCreateShipment}
                    disabled={loading}
                    style={{ flex: 1, padding: '14px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
                  >
                    {loading ? 'Processing...' : 'Confirm & Send'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CourierCreate;
