import React, { useState } from 'react';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';

const Instagram = () => {
  const addToast = useUIStore((s) => s.addToast);
  const [keys, setKeys] = useState({ app_id: '', app_secret: '', access_token: '' });

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <span className="text-overline uppercase tracking-widest font-10">Social Integration</span>
        <h2 className="fw-800 m-0">Instagram API Configuration</h2>
      </div>
      <div className="row g-4">
        <div className="col-lg-8">
          <Card className="glass shadow-md border-0 p-4">
            <h5 className="fw-800 mb-4 border-bottom pb-3">Instagram Graph API Credentials</h5>
            <div className="row g-4">
              {[
                { label: 'Instagram App ID', key: 'app_id', type: 'text', ph: 'App ID from Meta Portal' },
                { label: 'Instagram App Secret', key: 'app_secret', type: 'password', ph: '••••••••••••••' },
                { label: 'Long-lived Access Token', key: 'access_token', type: 'password', ph: 'EAAxxxxxxxxxxxxxx' },
              ].map(({ label, key, type, ph }) => (
                <div className="col-md-12" key={key}>
                  <label className="form-label text-overline text-muted font-11 mb-2">{label}</label>
                  <input type={type} className="form-control bg-light border-0 py-3 font-13" placeholder={ph}
                    value={keys[key]} onChange={(e) => setKeys({ ...keys, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="mt-5 pt-3 border-top d-flex gap-2">
              <Button variant="primary" onClick={() => addToast('Instagram credentials saved', 'success')}>
                <i className="bi bi-check2-circle"></i> Save Keys
              </Button>
            </div>
          </Card>
        </div>
        <div className="col-lg-4">
          <Card className="bg-dark text-white border-0 shadow-lg h-100 p-4">
            <h5 className="fw-800 text-white mb-3">Instagram Integration</h5>
            <p className="font-13 mb-3" style={{ opacity: 0.7 }}>Used for social auth, marketing automation, and promotional content feeds across the GoomTaxi platform.</p>
            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <i className="bi bi-instagram me-2 font-14" style={{ color: '#E1306C' }}></i>
              <span className="font-12 fw-700">Graph API v18.0</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Instagram;
