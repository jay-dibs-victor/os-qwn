import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function BusinessOnboarding() {
  const { isLoggedIn, updateOnboardingData, onboardingData } = useAuth();
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

  const handleRestrictionChange = (type) => {
    setActiveRestriction(type);
  };

  const renderProgress = () => (
    <div className="wizard-progress-bar">
      <div className={`step ${step >= 1 ? 'active' : ''}`}>Create Org</div>
      <div className={`step ${step >= 2 ? 'active' : ''}`}>Setup programs</div>
      <div className={`step ${step >= 3 ? 'active' : ''}`}>Setup payments</div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboarding-step">
            <h1>Welcome Brian!</h1>
            <p>Answer a few quick questions to help us personalize your experience. You can always change your answers later.</p>
            <h3>Which service are you most looking to provide?</h3>
            {['Rides', 'Meals', 'Package delivery'].map(service => (
              <label key={service} className="radio-card">
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <span className="icon">{service === 'Rides' ? '🚗' : service === 'Meals' ? '🍴' : '📦'}</span>
                  {service}
                </div>
                <input 
                    type="radio" 
                    name="service" 
                    value={service} 
                    checked={onboardingData.service === service}
                    onChange={() => handleUpdate('service', service)}
                />
              </label>
            ))}
            <div className="onboarding-actions">
              <button className="btn-text" onClick={() => setStep(step + 1)}>Skip for now</button>
              <button className="btn-black" onClick={() => setStep(step + 1)}>Next</button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="onboarding-step">
            {renderProgress()}
            <h1>What is most important for you to do?</h1>
            <p>Your selection will still allow you to access other services.</p>
            {['Manage business deliveries', 'Other'].map(opt => (
              <label key={opt} className="radio-card">
                <input 
                    type="radio" 
                    name="important" 
                    value={opt} 
                    checked={onboardingData.important === opt}
                    onChange={() => handleUpdate('important', opt)}
                />
                {opt}
              </label>
            ))}
            <div className="onboarding-actions">
              <button className="btn-text" onClick={() => setStep(step - 1)}>Back</button>
              <button className="btn-black" onClick={() => setStep(step + 1)}>Next</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="onboarding-step">
            <h1>Choose your program</h1>
            <p>Select your first program to continue. You can add more programs later on.</p>
            <div className="program-card">
              <div className="program-content">
                <div className="program-header">
                  <h3>🚗 Travel program <span className="badge">Recommended</span></h3>
                </div>
                <p>Make traveling for work feel less like work. Allow employees to charge office commutes, airport rides, or any other business travel.</p>
                <div className="program-details">
                  <h4>Use this program for</h4>
                  <ul>
                    <li>Office commutes</li>
                    <li>International or domestic business travel</li>
                    <li>Local business rides</li>
                  </ul>
                </div>
                <button className="btn-black" onClick={() => setShowRestrictions(true)}>Select →</button>
              </div>
              <div className="program-video-box">
                <div className="video-placeholder">▶</div>
                <div className="btn-video">How it works</div>
              </div>
            </div>
            <div className="onboarding-actions">
              <button className="btn-text" onClick={() => setStep(step - 1)}>← Back</button>
              <button className="btn-text" onClick={() => setStep(step + 1)}>Skip for now</button>
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

        {/* Main Restriction Modal */}
        {showRestrictions && !activeRestriction && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add travel program restrictions</h2>
              <p>Customize your program. You can always change this later.</p>
              <div className="restriction-item">
                <div><strong>Spending limit</strong><br/>{onboardingData.spendinglimit || 'Full coverage'}</div>
                <span onClick={() => handleRestrictionChange('Spending limit')}>Change</span>
              </div>
              <div className="restriction-item">
                <div><strong>Time</strong><br/>{onboardingData.time || '00:00 AM - 11:59 PM'}</div>
                <span onClick={() => handleRestrictionChange('Time')}>Change</span>
              </div>
              <div className="restriction-item">
                <div><strong>Locations</strong><br/>{onboardingData.locations || 'Any location'}</div>
                <span onClick={() => handleRestrictionChange('Locations')}>Change</span>
              </div>
              <div className="modal-actions" style={{marginTop: '32px', display: 'flex', gap: '16px'}}>
                <button className="btn-text" onClick={() => setShowRestrictions(false)}>Skip for now</button>
                <button className="btn-black" onClick={() => navigate('/business/dashboard')}>Save restrictions</button>
              </div>
            </div>
          </div>
        )}

        {/* Nested Restriction Edit Modal */}
        {activeRestriction && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit {activeRestriction}</h2>
              <input 
                placeholder={`Enter new ${activeRestriction}`} 
                style={{width: '100%', padding: '12px', margin: '16px 0', borderRadius: '8px', border: '1px solid #FFB800'}}
                onChange={(e) => handleUpdate(activeRestriction.toLowerCase().replace(' ', ''), e.target.value)}
              />
              <button className="btn-black" onClick={() => setActiveRestriction(null)}>Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
