import React, { useState } from 'react';
import { Card, Button } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';

import './ManageSettings.css';

/**
 * Settings — GoomTaxi
 * Global configuration & system settings panel.
 * Designed with modern glassmorphism UI and granular control tabs.
 */
const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const addToast = useUIStore((state) => state.addToast);

  const handleSave = () => {
    addToast('System settings updated successfully', 'success');
  };

  return (
    <div className="settings-view animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline">System Administration</span>
          <h2 className="fw-800 m-0">Global Settings</h2>
        </div>
        <Button variant="primary" onClick={handleSave}>
          <i className="bi bi-save2-fill"></i> Save Configurations
        </Button>
      </div>

      <div className="row g-4">
        <div className="col-lg-3">
          <Card className="p-2 h-100 border-0 shadow-sm">
            <div className="d-flex flex-column gap-2">
              <button 
                className={`btn text-start px-3 py-3 rounded-3 fw-600 ${activeTab === 'general' ? 'btn-primary' : 'btn-ghost text-dark'}`}
                onClick={() => setActiveTab('general')}
              >
                <i className="bi bi-sliders me-2"></i> General Setup
              </button>
              <button 
                className={`btn text-start px-3 py-3 rounded-3 fw-600 ${activeTab === 'pricing' ? 'btn-primary' : 'btn-ghost text-dark'}`}
                onClick={() => setActiveTab('pricing')}
              >
                <i className="bi bi-currency-dollar me-2"></i> Pricing & Tariffs
              </button>
              <button 
                className={`btn text-start px-3 py-3 rounded-3 fw-600 ${activeTab === 'api' ? 'btn-primary' : 'btn-ghost text-dark'}`}
                onClick={() => setActiveTab('api')}
              >
                <i className="bi bi-code-square me-2"></i> External APIs
              </button>
              <button 
                className={`btn text-start px-3 py-3 rounded-3 fw-600 ${activeTab === 'security' ? 'btn-primary' : 'btn-ghost text-dark'}`}
                onClick={() => setActiveTab('security')}
              >
                <i className="bi bi-shield-lock me-2"></i> Security Rules
              </button>
            </div>
          </Card>
        </div>

        <div className="col-lg-9">
          <Card className="p-0 overflow-hidden shadow-md border-0 h-100">
            <div className="p-4 border-bottom bg-light">
              <h4 className="fw-800 m-0">
                {activeTab === 'general' && 'Platform Details'}
                {activeTab === 'pricing' && 'Fare & Commission Rates'}
                {activeTab === 'api' && 'Third-Party Credentials'}
                {activeTab === 'security' && 'Admin Security Constraints'}
              </h4>
              <p className="text-muted font-13 m-0 mt-1">
                Configure operational parameters for the taxi platform network.
              </p>
            </div>

            <div className="p-4">
              {activeTab === 'general' && (
                <div className="row g-4 animate-fade-in">
                  <div className="col-md-6">
                    <label className="text-overline">Business Name</label>
                    <input type="text" className="form-control" defaultValue="Goom Logistics Taxi" />
                  </div>
                  <div className="col-md-6">
                    <label className="text-overline">Support Email</label>
                    <input type="email" className="form-control" defaultValue="support@goomtaxi.com" />
                  </div>
                  <div className="col-md-12">
                    <label className="text-overline">Headquarters Address</label>
                    <textarea className="form-control" rows="3" defaultValue="123 Transport Way, Victoria Island, Lagos"></textarea>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="row g-4 animate-fade-in">
                  <div className="col-md-6">
                    <label className="text-overline">Base Fare (₦)</label>
                    <input type="number" className="form-control" defaultValue="500" />
                  </div>
                  <div className="col-md-6">
                    <label className="text-overline">Platform Commission (%)</label>
                    <input type="number" className="form-control" defaultValue="15" />
                  </div>
                  <div className="col-md-6">
                    <label className="text-overline">Per Kilometer Rate (₦)</label>
                    <input type="number" className="form-control" defaultValue="120" />
                  </div>
                  <div className="col-md-6">
                    <label className="text-overline">Surge Multiplier</label>
                    <input type="number" step="0.1" className="form-control" defaultValue="1.5" />
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="row g-4 animate-fade-in">
                  <div className="col-12 text-center py-5">
                    <div className="avatar-lg bg-light text-muted mx-auto mb-3 flex-center rounded-circle" style={{ width: 80, height: 80, fontSize: 32 }}>
                      <i className="bi bi-google"></i>
                    </div>
                    <h5 className="fw-700">Google Maps API Integration</h5>
                    <p className="text-muted font-13">Configure your Geocoding and Places API keys in the restricted system environment.</p>
                    <div className="text-start mt-4 mx-auto" style={{ maxWidth: 500 }}>
                       <label className="text-overline">Production API Key</label>
                       <div className="d-flex gap-2">
                         <input type="password" className="form-control font-monospace" defaultValue="AIzaSyA8892_******************" disabled />
                         <Button variant="secondary">Update</Button>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="row g-4 animate-fade-in">
                  <div className="col-12">
                     <div className="d-flex justify-content-between align-items-center p-3 border rounded-3 mb-3 hover-bg-light cursor-pointer">
                        <div>
                          <div className="fw-700 font-14">Two-Factor Authentication (2FA)</div>
                          <div className="text-muted font-12">Require OTP for all administrator logins.</div>
                        </div>
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" role="switch" defaultChecked style={{ transform: 'scale(1.2)' }} />
                        </div>
                     </div>
                     <div className="d-flex justify-content-between align-items-center p-3 border rounded-3 hover-bg-light cursor-pointer">
                        <div>
                          <div className="fw-700 font-14">Session Timeout</div>
                          <div className="text-muted font-12">Automatically logout inactive administrative sessions after 30 minutes.</div>
                        </div>
                        <div className="form-check form-switch">
                          <input className="form-check-input" type="checkbox" role="switch" defaultChecked style={{ transform: 'scale(1.2)' }} />
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
