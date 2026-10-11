import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LocationSearch from '../../../../core/components/LocationSearch';

const blacklistedCountries = ['Somalia', 'Yemen', 'Syria', 'Afghanistan', 'Iraq', 'South Sudan'];

const RoadTripWizard = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showPriorityCheck, setShowPriorityCheck] = useState(false);
  const [showIdentityForm, setShowIdentityForm] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const [verificationData, setVerificationData] = useState({
    ssn: '', idNumber: '', address: '', location: '', passport: '', license: '', agreed: false
  });

  const [itineraries, setItineraries] = useState([]);
  const [currentItinerary, setCurrentItinerary] = useState({
    pickup: '',
    pickupCoords: null,
    destination: '',
    destinationCoords: null,
    date: '',
    time: '',
    driverOption: 'driver',
    cityOption: 'Intra City',
    hours: ''
  });

  const handleDriverOptionChange = (val) => {
    const isBlacklisted = blacklistedCountries.some(country => 
      currentItinerary.pickup.toLowerCase().includes(country.toLowerCase())
    );

    if (val === 'self-driven' && isBlacklisted) {
      setShowPriorityCheck(true);
      // Don't set state yet, wait for verification
    } else {
      setCurrentItinerary({ ...currentItinerary, driverOption: val });
    }
  };

  const handlePriorityResponse = (isPriority) => {
    setShowPriorityCheck(false);
    if (!isPriority) {
      setCurrentItinerary({ ...currentItinerary, driverOption: 'driver' });
    } else {
      setShowIdentityForm(true);
    }
  };

  const handleVerificationSubmit = () => {
    if (!verificationData.agreed) return;
    setShowIdentityForm(false);
    setCurrentItinerary({ ...currentItinerary, driverOption: 'self-driven' });
  };

  const addItinerary = (e) => {
    e.preventDefault();
    if (!currentItinerary.pickup || !currentItinerary.destination || !currentItinerary.date) return;

    setItineraries([...itineraries, { ...currentItinerary, id: Date.now() }]);
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

  return (
    <div className="road-trip-wizard">
      <div className="wizard-header mb-3">
        <button onClick={onBack} className="btn-back">← Back</button>
        <span className="ms-2 fw-bold small text-uppercase" style={{ color: 'var(--color-text)', letterSpacing: '0.5px' }}>Road Trip Schedule</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Itinerary Summary at Top */}
            <div className="itinerary-preview-top mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="small-label m-0">Planned Route</label>
                {itineraries.length > 2 && (
                  <button className="btn-view-all" onClick={() => setShowAllModal(true)}>
                    View All ({itineraries.length})
                  </button>
                )}
              </div>

              <div className="itinerary-mini-list">
                {itineraries.length === 0 ? (
                  <div className="empty-state-text">No stops added yet.</div>
                ) : (
                  itineraries.slice(0, 2).map((iti, idx) => (
                    <div key={iti.id} className="mini-iti-item">
                      <div className="iti-dot"></div>
                      <div className="iti-text">
                        <strong>{iti.pickup.split(',')[0]}</strong> → <strong>{iti.destination.split(',')[0]}</strong>
                        <span className="iti-time-tag">{iti.date} @ {iti.time}</span>
                      </div>
                      <button className="iti-mini-remove" onClick={() => removeItinerary(iti.id)}>✕</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="itinerary-form-section">
              <label className="small-label">Add a stop</label>

              <div className="input-wrapper mb-3">
                <label className="tiny-label">Pickup</label>
                <div className="input-field">
                  <LocationSearch
                    placeholder="Starting point"
                    value={currentItinerary.pickup}
                    onChange={(val) => setCurrentItinerary(prev => ({ ...prev, pickup: val }))}
                    onLocationSelect={(loc) => setCurrentItinerary(prev => ({ ...prev, pickupCoords: loc }))}
                    className="form-input"
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    }
                  />
                </div>
              </div>

              <div className="input-wrapper mb-3">
                <label className="tiny-label">Destination</label>
                <div className="input-field">
                  <LocationSearch
                    placeholder="Where to?"
                    value={currentItinerary.destination}
                    onChange={(val) => setCurrentItinerary(prev => ({ ...prev, destination: val }))}
                    onLocationSelect={(loc) => setCurrentItinerary(prev => ({ ...prev, destinationCoords: loc }))}
                    className="form-input"
                    icon={
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    }
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="tiny-label">Date</label>
                  <div className="input-with-icon">
                    <input
                      type="date"
                      className="form-input-clean"
                      value={currentItinerary.date}
                      style={{ width: "200px" }}
                      onChange={(e) => setCurrentItinerary(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <label className="tiny-label">Time</label>
                  <div className="input-with-icon">
                    <input
                      style={{ width: "200px" }}
                      type="time"
                      className="form-input-clean"
                      value={currentItinerary.time}
                      onChange={(e) => setCurrentItinerary(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="tiny-label">Driver Option</label>
                <select
                  className="form-input-clean"
                  value={currentItinerary.driverOption}
                  onChange={(e) => handleDriverOptionChange(e.target.value)}
                >
                  <option value="driver">Request a Pro Driver</option>
                  <option value="self-driven">Self-Driven Trip</option>
                </select>
              </div>

              <button className="btn-add-stop" onClick={addItinerary}>
                + Add to Itinerary
              </button>
            </div>

            <button
              className={`btn-ride mt-4 ${itineraries.length > 0 ? 'enabled' : 'disabled'}`}
              disabled={itineraries.length === 0}
              onClick={() => setStep(2)}
            >
              Confirm Planned Road Trip
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-4"
          >
            <div className="success-icon mb-3" style={{ fontSize: '40px' }}>✅</div>
            <h5>Perfect!</h5>
            <p className="text-muted small">Your road trip plan with {itineraries.length} stops has been drafted. We'll find the best cars for your schedule.</p>
            <button className="btn-ride enabled mt-3" onClick={() => onComplete(itineraries)}>
              Finalize & Get Quote
            </button>
            <button className="btn btn-link block w-100 mt-2 text-muted small" onClick={() => setStep(1)}>
              Go back and edit
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPriorityCheck && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 110000 }}>
            <motion.div className="security-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <div style={{ fontSize: '46px', marginBottom: '16px' }}>🔑</div>
              <h5 className="fw-bold mb-2">Priority Preference</h5>
              <p className="text-muted small mb-4">You have selected a self-driven trip in a restricted region. Is maintaining a self-driven option a high priority for this journey?</p>
              <div className="d-flex gap-2 w-100">
                <button className="btn-ride flex-1 bg-light text-dark" onClick={() => handlePriorityResponse(false)}>No, Assign Driver</button>
                <button className="btn-ride flex-1 enabled" onClick={() => handlePriorityResponse(true)}>Yes, It's Priority</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showIdentityForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ zIndex: 110001 }}>
            <motion.div className="itinerary-modal" style={{ maxWidth: '440px', padding: '24px' }}>
              <div className="modal-header-clean border-0 p-0 mb-3">
                <h6 className="m-0 fw-bold">Identity Verification</h6>
                <button className="btn-close-modal" onClick={() => { setShowIdentityForm(false); setCurrentItinerary({ ...currentItinerary, driverOption: 'driver' }); }}>✕</button>
              </div>
              <p className="text-muted tiny-label mb-4">Please provide the following details to activate self-driving in this region.</p>
              
              <div className="verification-form-grid row g-2">
                <div className="col-6 mb-2">
                  <label className="tiny-label">Social Security No.</label>
                  <input type="text" className="form-input-clean" placeholder="SSN" value={verificationData.ssn} onChange={e => setVerificationData({...verificationData, ssn: e.target.value})} />
                </div>
                <div className="col-6 mb-2">
                  <label className="tiny-label">Identity Number</label>
                  <input type="text" className="form-input-clean" placeholder="ID No" value={verificationData.idNumber} onChange={e => setVerificationData({...verificationData, idNumber: e.target.value})} />
                </div>
                <div className="col-12 mb-2">
                  <label className="tiny-label">Residential Address</label>
                  <input type="text" className="form-input-clean" placeholder="Full Address" value={verificationData.address} onChange={e => setVerificationData({...verificationData, address: e.target.value})} />
                </div>
                <div className="col-12 mb-2">
                  <label className="tiny-label">GPS Location (Ref)</label>
                  <input type="text" className="form-input-clean" placeholder="City, Region" value={verificationData.location} onChange={e => setVerificationData({...verificationData, location: e.target.value})} />
                </div>
                <div className="col-6 mb-2">
                  <label className="tiny-label">Intl. Passport</label>
                  <input type="text" className="form-input-clean" placeholder="Passport No" value={verificationData.passport} onChange={e => setVerificationData({...verificationData, passport: e.target.value})} />
                </div>
                <div className="col-6 mb-2">
                  <label className="tiny-label">Driver License</label>
                  <input type="text" className="form-input-clean" placeholder="License No" value={verificationData.license} onChange={e => setVerificationData({...verificationData, license: e.target.value})} />
                </div>
              </div>

              <div className="terms-check mt-3 mb-4 d-flex align-items-start gap-2">
                <input type="checkbox" id="terms" checked={verificationData.agreed} onChange={e => setVerificationData({...verificationData, agreed: e.target.checked})} />
                <label htmlFor="terms" className="small" style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  I agree to the <span className="text-primary text-decoration-underline" style={{ cursor: 'pointer' }} onClick={() => setShowTermsModal(true)}>Use of Terms</span> for self-driven vehicle deployment.
                </label>
              </div>

              <button 
                className={`btn-ride w-100 ${verificationData.agreed ? 'enabled' : 'disabled'}`} 
                onClick={handleVerificationSubmit}
                disabled={!verificationData.agreed}
              >
                Complete Verification
              </button>
            </motion.div>
          </motion.div>
        )}

        {showTermsModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ zIndex: 120000 }}>
            <motion.div className="itinerary-modal" style={{ maxWidth: '400px', padding: '24px' }}>
              <h6 className="fw-bold mb-3">Self-Drive Terms of Use</h6>
              <div className="terms-content text-muted small mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <p>1. By choosing the self-drive option in restricted regions, you assume full liability for the vehicle.</p>
                <p>2. We are required by local law to share your identity details with municipal security databases.</p>
                <p>3. The vehicle is equipped with real-time GPS tracking and remote immobilization security features.</p>
                <p>4. Unauthorized deviations from the planned itinerary may trigger a remote security response.</p>
                <p>Wait times for verification can vary between 2-4 hours before the vehicle is deployed.</p>
              </div>
              <button className="btn-ride enabled w-100" onClick={() => setShowTermsModal(false)}>Understood</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAllModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAllModal(false)}
          >
            <motion.div
              className="itinerary-modal"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header-clean">
                <h6 className="m-0 fw-bold">Full Itinerary</h6>
                <button className="btn-close-modal" onClick={() => setShowAllModal(false)}>✕</button>
              </div>
              <div className="modal-body-scroll">
                {itineraries.map((iti, idx) => (
                  <div key={iti.id} className="modal-iti-item">
                    <div className="idx-circle">{idx + 1}</div>
                    <div className="iti-content">
                      <div className="iti-main-path">{iti.pickup} <br /> ↓ <br /> {iti.destination}</div>
                      <div className="iti-detail-tag">{iti.date} @ {iti.time} • {iti.driverOption}</div>
                    </div>
                    <button className="iti-mini-remove" onClick={() => removeItinerary(iti.id)}>✕</button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .wizard-header {
          display: flex;
          align-items: center;
        }
        .btn-back {
          background: none;
          border: none;
          color: #666;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }
        .small-label {
          font-size: 11px;
          font-weight: 800;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
        }
        .tiny-label {
          font-size: 10px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
          display: block;
        }
        .form-input-clean {
          width: 100%;
          border: 1px solid #f0f0f0;
          background: #f8f9fa;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input-clean:focus {
          border-color: #FFB800;
          background: #fff;
        }
        .btn-add-stop {
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 12px;
          width: 100%;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s;
        }
        .btn-add-stop:hover { background: #333; }
        
        .itinerary-preview-top {
          background: #fafafa;
          border-radius: 12px;
          padding: 12px;
          border: 1px dashed #eee;
        }
        .btn-view-all {
          background: none;
          border: none;
          color: #FFB800;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        .mini-iti-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .mini-iti-item:last-child { border: none; }
        .iti-dot {
          width: 6px;
          height: 6px;
          background: #FFB800;
          border-radius: 50%;
        }
        .iti-text {
          flex: 1;
          font-size: 12px;
          color: #333;
        }
        .iti-time-tag {
          display: block;
          font-size: 10px;
          color: #999;
        }
        .iti-mini-remove {
          background: none;
          border: none;
          color: #ccc;
          font-size: 14px;
          cursor: pointer;
        }
        .iti-mini-remove:hover { color: #ff4757; }
        .empty-state-text {
          font-size: 12px;
          color: #bbb;
          font-style: italic;
          padding: 10px 0;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(4px);
        }
        .itinerary-modal {
          background: #fff;
          width: 90%;
          max-width: 400px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        }
        .modal-header-clean {
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn-close-modal {
          background: none;
          border: none;
          font-size: 18px;
          color: #999;
        }
        .modal-body-scroll {
          max-height: 400px;
          overflow-y: auto;
          padding: 10px 20px;
        }
        .modal-iti-item {
          display: flex;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #f5f5f5;
        }
        .idx-circle {
          width: 24px;
          height: 24px;
          background: #FFB800;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }
        .iti-main-path { font-size: 13px; font-weight: 600; line-height: 1.2; }
        .iti-detail-tag { font-size: 11px; color: #888; margin-top: 4px; }
      `}</style>
    </div>
  );
};

export default RoadTripWizard;
