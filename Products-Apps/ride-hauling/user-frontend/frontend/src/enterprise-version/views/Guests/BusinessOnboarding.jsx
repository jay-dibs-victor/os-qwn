import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../core/store/useAuthStore';

import { useData } from '../../core/context/AuthContext';




export default function BusinessOnboarding() {
  const { updateOnboardingData, onboardingData } = useData();

  
  const isLoggedIn = useAuthStore((state) => state.token);

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showRestrictions, setShowRestrictions] = useState(false);
  const [activeRestriction, setActiveRestriction] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const handleUpdate = (key, value) => {
    updateOnboardingData({ [key]: value });
  };

  const renderRestrictionPopup = () => {
    if (!activeRestriction) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="btn-text" onClick={() => setActiveRestriction(null)}>← Back</button>
          <h2>{activeRestriction}</h2>
          <p>Choose your {activeRestriction.toLowerCase()} settings.</p>

          <div className="radio-card" onClick={() => handleUpdate(activeRestriction.toLowerCase().replace(' ', ''), 'Full')}>
            <span>{activeRestriction === 'Spending limit' ? 'Full Coverage' : 'All Day'}</span>
            <input type="radio" checked={onboardingData[activeRestriction.toLowerCase().replace(' ', '')] === 'Full'} readOnly />
          </div>

          <div className="radio-card" onClick={() => handleUpdate(activeRestriction.toLowerCase().replace(' ', ''), 'Limited')}>
            <span>{activeRestriction === 'Spending limit' ? 'Limit coverage' : 'Custom times'}</span>
            <input type="radio" checked={onboardingData[activeRestriction.toLowerCase().replace(' ', '')] === 'Limited'} readOnly />
          </div>

          <button className="btn-black" onClick={() => setActiveRestriction(null)} style={{ marginTop: '20px', width: '100%' }}>Save</button>
        </div>
      </div>
    );
  };

  const renderProgress = () => (
    <div className="wizard-progress-bar">
      <div className={`step ${step >= 1 ? 'completed' : ''}`}>Create Org</div>
      <div className={`step ${step >= 4 ? 'completed' : ''}`}>Setup programs</div>
      <div className={`step ${step >= 5 ? 'completed' : ''}`}>Setup payments</div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboarding-step">
            <h1>Tell us about your company</h1>
            <label>Organization</label>
            <input
              type="text"
              placeholder="Organization Name"
              className="billing-select"
              value={onboardingData.orgName || ''}
              onChange={(e) => handleUpdate('orgName', e.target.value)}
            />

            <label>Work email</label>
            <input
              type="email"
              placeholder="Work email"
              className="billing-select"
              value={onboardingData.workEmail || ''}
              onChange={(e) => handleUpdate('workEmail', e.target.value)}
            />

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label>Company size</label>
                <select
                  className="billing-select"
                  value={onboardingData.companySize || ''}
                  onChange={(e) => handleUpdate('companySize', e.target.value)}
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="200+">200+</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Phone (optional)</label>
                <input
                  type="tel"
                  placeholder="Phone"
                  className="billing-select"
                  value={onboardingData.phone || ''}
                  onChange={(e) => handleUpdate('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="checkbox-group" style={{ marginTop: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input
                type="checkbox"
                checked={onboardingData.agreed || false}
                onChange={(e) => handleUpdate('agreed', e.target.checked)}
              />
              <p style={{ fontSize: '12px', margin: 0 }}>
                I agree, on behalf of my company, to the Uber for Business Terms and Conditions, which govern our use of any Uber for Business products, and to the Uber Health Terms and Conditions, which govern our use of any Uber Health products.
              </p>
            </div>

            <div className="onboarding-actions" style={{ marginTop: '24px' }}>
              <button
                className="btn-black"
                onClick={() => setStep(2)}
                disabled={!onboardingData.orgName || !onboardingData.workEmail || !onboardingData.agreed}
              >
                Next
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="onboarding-step">
            <h1>Welcome Brian!</h1>
            <p>Answer a few quick questions to help us personalize your experience. You can always change your answers later.</p>
            <h3>Which service are you most looking to provide?</h3>
            <div className="radio-card" onClick={() => handleUpdate('service', 'Rides')}>
              <span>🚗 Rides</span>
              <input type="radio" checked={onboardingData.service === 'Rides'} readOnly />
            </div>
            <div className="radio-card" onClick={() => handleUpdate('service', 'Meals')}>
              <span>🍽 Meals</span>
              <input type="radio" checked={onboardingData.service === 'Meals'} readOnly />
            </div>
            <div className="radio-card" onClick={() => handleUpdate('service', 'Package delivery')}>
              <span>📦 Package delivery</span>
              <input type="radio" checked={onboardingData.service === 'Package delivery'} readOnly />
            </div>
            <div className="onboarding-actions">
              <button className="btn-text" onClick={() => setStep(1)}>Back</button>
              <button className="btn-black" onClick={() => setStep(3)}>Next</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="onboarding-step">
            <h1>What is most important for you to do?</h1>
            <p>Your selection will still allow you to access other services.</p>
            <div className="radio-card" onClick={() => handleUpdate('important', 'Manage business deliveries')}>
              <span>📋 Manage business deliveries</span>
              <input type="radio" checked={onboardingData.important === 'Manage business deliveries'} readOnly />
            </div>
            <div className="radio-card" onClick={() => handleUpdate('important', 'Other')}>
              <span>... Other</span>
              <input type="radio" checked={onboardingData.important === 'Other'} readOnly />
            </div>
            <div className="onboarding-actions">
              <button className="btn-text" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-black" onClick={() => setStep(4)}>Next</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="onboarding-step">
            <h1>Choose your program</h1>
            <p>Select your first program to continue. You can add more programs later on.</p>
            <div className="program-card" style={{ display: 'block' }}>
              <div className="program-content">
                <div className="program-header">
                  <h3>🚗 Travel program <span className="badge">Recommended</span></h3>
                </div>
                <p>Make traveling for work feel less like work. Allow employees to charge office commutes, airport rides, or any other business travel.</p>
                <div className="program-details" style={{ margin: '24px 0' }}>
                  <h4 style={{ marginBottom: '8px' }}>Use this program for</h4>
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    <li>Office commutes</li>
                    <li>International or domestic business travel</li>
                    <li>Local business rides</li>
                  </ul>
                </div>
                <button className="btn-black" onClick={() => setShowRestrictions(true)}>Select →</button>
              </div>
            </div>
            <div className="onboarding-actions">
              <button className="btn-text" onClick={() => setStep(3)}>← Back</button>
              <button className="btn-text" onClick={() => navigate('/business/dashboard')}>Skip for now</button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="onboarding-step">
            <h1>Add a payment method</h1>
            <p>This payment method will be charged for activity on your Uber for Business account. You will not be charged until your account is approved and the users on your account begin to order rides, meals, or other Uber products.</p>
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button className="btn-black" onClick={() => alert('Add Payment Method')}>+ Add Payment Method</button>
            </div>

            <h3 style={{ marginTop: '32px' }}>Billing method</h3>
            <div style={{ marginTop: '12px' }}>
              <select className="billing-select" value={onboardingData.billing || 'pay_per_trip'} onChange={(e) => handleUpdate('billing', e.target.value)}>
                <option value="pay_per_trip">Pay per trip</option>
                <option value="monthly">Monthly billing (qualifying orgs)</option>
              </select>
            </div>

            <div className="onboarding-actions" style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-text" onClick={() => setStep(4)}>← Change program</button>
              <button className="btn-black" style={{ marginLeft: '12px' }} onClick={() => navigate('/business/dashboard')}>Save & continue</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-root">
      <div className="onboarding-container">
        {renderStep()}
        {showRestrictions && !activeRestriction && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add travel program restrictions</h2>
              <p>Customize your program. You can always change this later.</p>

              <div className="restriction-item">
                <div><strong>Spending limit</strong><br />{onboardingData.spendinglimit || 'Full coverage'}</div>
                <button className="btn-outline" onClick={() => setActiveRestriction('Spending limit')}>Change</button>
              </div>

              <div className="restriction-item">
                <div><strong>Time</strong><br />{onboardingData.time || '00:00 AM - 11:59 PM'}</div>
                <button className="btn-outline" onClick={() => setActiveRestriction('Time')}>Change</button>
              </div>

              <div className="restriction-item">
                <div><strong>Locations</strong><br />{onboardingData.locations || 'Any location'}</div>
                <button className="btn-outline" onClick={() => setActiveRestriction('Locations')}>Change</button>
              </div>

              <div className="modal-actions" style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button className="btn-text" onClick={() => setShowRestrictions(false)}>Skip for now</button>
                <button className="btn-black" onClick={() => { setShowRestrictions(false); setStep(5); }}>Save restrictions</button>
              </div>
            </div>
          </div>
        )}
        {renderRestrictionPopup()}
      </div>
    </div>
  );
}