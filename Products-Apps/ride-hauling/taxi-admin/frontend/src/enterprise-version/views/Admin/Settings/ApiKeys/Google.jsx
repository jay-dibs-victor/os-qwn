import React, { useState } from 'react';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';

const Google = () => {
  const addToast = useUIStore((s) => s.addToast);
  const [keys, setKeys] = useState({ client_id: '', client_secret: '', maps_api_key: '', mode: 'test' });

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <span className="text-overline uppercase tracking-widest font-10">Platform Integrations</span>
        <h2 className="fw-800 m-0">Google API Configuration</h2>
      </div>
      <div className="row g-4">
        <div className="col-lg-8">
          <Card className="glass shadow-md border-0 p-4">
            <h5 className="fw-800 mb-4 border-bottom pb-3">Google Service Credentials</h5>
            <div className="row g-4">
              {[
                { label: 'OAuth Client ID', key: 'client_id', type: 'text', ph: 'xxxx.apps.googleusercontent.com' },
                { label: 'OAuth Client Secret', key: 'client_secret', type: 'password', ph: '••••••••' },
                { label: 'Maps JavaScript API Key', key: 'maps_api_key', type: 'password', ph: 'AIza••••••••' },
              ].map(({ label, key, type, ph }) => (
                <div className="col-md-12" key={key}>
                  <label className="form-label text-overline text-muted font-11 mb-2">{label}</label>
                  <input
                    type={type} className="form-control bg-light border-0 py-3 font-13" placeholder={ph}
                    value={keys[key]} onChange={(e) => setKeys({ ...keys, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="col-md-12">
                <label className="form-label text-overline text-muted font-11 mb-2">Environment</label>
                <select className="form-select font-13 bg-light border-0 py-3" value={keys.mode}
                  onChange={(e) => setKeys({ ...keys, mode: e.target.value })}>
                  <option value="test">Test / Sandbox</option>
                  <option value="live">Live / Production</option>
                </select>
              </div>
            </div>
            <div className="mt-5 pt-3 border-top d-flex gap-2">
              <Button variant="primary" onClick={() => addToast('Google credentials saved', 'success')}>
                <i className="bi bi-check2-circle"></i> Save Keys
              </Button>
              <Button variant="ghost" onClick={() => addToast('Keys cleared', 'warning')}>Clear</Button>
            </div>
          </Card>
        </div>
        <div className="col-lg-4">
          <Card className="bg-dark text-white border-0 shadow-lg h-100 p-4">
            <h5 className="fw-800 text-white mb-3">Google Integration</h5>
            <p className="font-13 mb-3" style={{ opacity: 0.7 }}>Used for Maps, OAuth sign-in, and Places autocomplete across rider and driver portals.</p>
            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <i className="bi bi-google me-2 text-warning font-14"></i>
              <span className="font-12 fw-700">Google Cloud Console</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Google;
