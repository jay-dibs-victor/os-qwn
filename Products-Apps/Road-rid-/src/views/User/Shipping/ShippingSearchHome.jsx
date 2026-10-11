import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShippingStore } from '../../../core/store/useShippingStore';
import apiClient from '../../../core/api/apiClient';
import { useNavigate } from 'react-router-dom';
import './shipping.css';

const ShippingSearchHome = () => {
  const navigate = useNavigate();
  const { newShipment, setNewShipment, resetNewShipment, setLoading, setError, isLoading } = useShippingStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [localError, setLocalError] = useState('');

  const handleInputChange = (field, value, nestedObject = null) => {
    if (nestedObject) {
      setNewShipment({
        [nestedObject]: { ...newShipment[nestedObject], [field]: value }
      });
    } else {
      setNewShipment({ [field]: value });
    }
  };

  const handlePackageChange = (index, field, value, nestedField = null) => {
    const updatedPackages = [...newShipment.packages];
    if (nestedField) {
      updatedPackages[index].dimensions[nestedField] = value;
    } else {
      updatedPackages[index][field] = value;
    }
    setNewShipment({ packages: updatedPackages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/shipping', newShipment);
      if (response.data && response.data.success) {
        resetNewShipment();
        navigate(`/shipping/track/${response.data.data.trackingNumber}`);
      } else {
        setLocalError(response.data.message || 'Failed to create shipment.');
      }
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStepIndicators = () => (
    <div className="steps-container">
      {[
        { num: 1, label: 'Origin' },
        { num: 2, label: 'Destination' },
        { num: 3, label: 'Packages' },
        { num: 4, label: 'Carrier' }
      ].map((step, index) => {
        const isCompleted = currentStep > step.num;
        const isActive = currentStep === step.num;
        return (
          <div key={step.num} className="step-item">
            {/* Vertical Line Connector */}
            {index < 3 && (
              <div className={`step-line ${isCompleted ? 'active' : ''}`} />
            )}
            
            {/* Circle Indicator */}
            <motion.div 
              className={`step-circle ${isCompleted ? 'done' : isActive ? 'active' : ''}`}
              animate={isCompleted ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isCompleted ? (
                <motion.svg initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </motion.svg>
              ) : (
                step.num
              )}
            </motion.div>
            
            {/* Label */}
            <div className={`step-label ${isActive ? 'active' : isCompleted ? 'done' : ''}`}>
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="shipping-wrapper">
      <div className="shipping-container">
        <div className="shipping-header">
          <h1 className="shipping-title">Book a Shipment</h1>
          <p className="shipping-subtitle">Send packages anywhere in the world with real-time tracking.</p>
        </div>

        <div className="shipping-card grid-2" style={{ gridTemplateColumns: '1fr 3fr' }}>
          
          {/* LEFT: Vertical Steps */}
          <div>
            {renderStepIndicators()}
          </div>

          {/* RIGHT: Form */}
          <div>
            {localError && (
              <div className="error-box">
                {localError}
              </div>
            )}

        <form onSubmit={currentStep === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="form-section"
              >
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>Origin Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Pickup Address</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter full pickup address..."
                      value={newShipment.origin.address}
                      onChange={(e) => handleInputChange('address', e.target.value, 'origin')}
                      required
                    />
                  </div>
                  {/* Coordinates would normally be geocoded from address in a real app */}
                  <div style={{ display: 'none' }}>
                    <input type="number" value={newShipment.origin.coordinates[0]} onChange={(e) => handleInputChange('coordinates', [parseFloat(e.target.value), newShipment.origin.coordinates[1]], 'origin')} />
                    <input type="number" value={newShipment.origin.coordinates[1]} onChange={(e) => handleInputChange('coordinates', [newShipment.origin.coordinates[0], parseFloat(e.target.value)], 'origin')} />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="form-section"
              >
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>Destination & Contact</h3>
                <div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Delivery Address</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter delivery address..."
                      value={newShipment.destination.address}
                      onChange={(e) => handleInputChange('address', e.target.value, 'destination')}
                      required
                    />
                  </div>
                  <div className="grid-2">
                    <div>
                      <label className="form-label">Recipient Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="John Doe"
                        value={newShipment.customerDetails.name}
                        onChange={(e) => handleInputChange('name', e.target.value, 'customerDetails')}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Recipient Phone</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+1 234 567 8900"
                        value={newShipment.customerDetails.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value, 'customerDetails')}
                        required
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Recipient Email</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="john@example.com"
                        value={newShipment.customerDetails.email}
                        onChange={(e) => handleInputChange('email', e.target.value, 'customerDetails')}
                        required
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="form-section"
              >
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>Package Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {newShipment.packages.map((pkg, index) => (
                    <div key={index} style={{ padding: '1.5rem', borderRadius: '1rem', backgroundColor: 'var(--color-surface)', border: '1px solid #e2e8f0' }}>
                      <div className="grid-2">
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label className="form-label">Description / Contents</label>
                          <input
                            type="text"
                            className="form-input"
                            value={pkg.description}
                            onChange={(e) => handlePackageChange(index, 'description', e.target.value)}
                            placeholder="e.g., Electronics, Documents..."
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Weight (kg)</label>
                          <input
                            type="number"
                            className="form-input"
                            min="0.1"
                            step="0.1"
                            value={pkg.weight}
                            onChange={(e) => handlePackageChange(index, 'weight', parseFloat(e.target.value))}
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Quantity</label>
                          <input
                            type="number"
                            className="form-input"
                            min="1"
                            value={pkg.quantity}
                            onChange={(e) => handlePackageChange(index, 'quantity', parseInt(e.target.value))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '1.5rem' }}>
                        <label className="form-label">Dimensions (cm)</label>
                        <div className="grid-3">
                          <div>
                            <input
                              type="number"
                              className="form-input"
                              style={{ textAlign: 'center' }}
                              placeholder="L"
                              value={pkg.dimensions.length}
                              onChange={(e) => handlePackageChange(index, null, parseFloat(e.target.value), 'length')}
                              required
                            />
                            <div className="text-xs text-slate-500 text-center mt-1">Length</div>
                          </div>
                          <div>
                            <input
                              type="number"
                              className="form-input"
                              style={{ textAlign: 'center' }}
                              placeholder="W"
                              value={pkg.dimensions.width}
                              onChange={(e) => handlePackageChange(index, null, parseFloat(e.target.value), 'width')}
                              required
                            />
                            <div className="text-xs text-slate-500 text-center mt-1">Width</div>
                          </div>
                          <div>
                            <input
                              type="number"
                              className="form-input"
                              style={{ textAlign: 'center' }}
                              placeholder="H"
                              value={pkg.dimensions.height}
                              onChange={(e) => handlePackageChange(index, null, parseFloat(e.target.value), 'height')}
                              required
                            />
                            <div className="text-xs text-slate-500 text-center mt-1">Height</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    + Add Another Package (Coming Soon)
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="form-section"
              >
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>Carrier & Review</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label className="form-label">Select Carrier</label>
                    <div className="grid-3">
                      {['INTERNAL', 'FEDEX', 'DHL'].map(carrier => (
                        <div 
                          key={carrier}
                          onClick={() => handleInputChange('carrier', carrier)}
                          style={{
                            padding: '1.25rem',
                            borderRadius: '1rem',
                            border: `2px solid ${newShipment.carrier === carrier ? '#fbbf24' : '#e2e8f0'}`,
                            backgroundColor: newShipment.carrier === carrier ? '#fffbeb' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '1.125rem', color: carrier === 'FEDEX' ? '#4d148c' : carrier === 'DHL' ? '#d40511' : '#0f172a' }}>
                            {carrier}
                          </div>
                          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>
                            {carrier === 'INTERNAL' ? 'Standard Delivery' : 'Express Worldwide'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', borderRadius: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Shipment Summary</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontWeight: 500 }}>From:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{newShipment.origin.address}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontWeight: 500 }}>To:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{newShipment.destination.address}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontWeight: 500 }}>Recipient:</span>
                        <span style={{ fontWeight: 600 }}>{newShipment.customerDetails.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 500 }}>Total Weight:</span>
                        <span style={{ fontWeight: 600 }}>{newShipment.packages.reduce((acc, p) => acc + p.weight, 0)} kg</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', gap: '1rem' }}>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
                style={{ width: '33%' }}
              >
                Back
              </button>
            ) : <div style={{ width: '33%' }} />}
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '66%' }}
            >
              {isLoading ? 'Processing...' : currentStep === 4 ? 'Confirm & Book Shipment' : 'Continue'}
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingSearchHome;
