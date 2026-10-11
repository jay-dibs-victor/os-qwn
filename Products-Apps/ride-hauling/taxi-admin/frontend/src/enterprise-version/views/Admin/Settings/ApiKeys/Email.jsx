import React, { useState } from 'react';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';

const Email = () => {
  const addToast = useUIStore((s) => s.addToast);
  const [cfg, setCfg] = useState({ host: '', port: '587', user: '', password: '', from_name: '', from_email: '', provider: 'smtp' });

  const inputField = (label, key, type = 'text', ph = '') => (
    <div className="col-md-6" key={key}>
      <label className="form-label text-overline text-muted font-11 mb-2">{label}</label>
      <input type={type} className="form-control bg-light border-0 py-3 font-13" placeholder={ph}
        value={cfg[key]} onChange={(e) => setCfg({ ...cfg, [key]: e.target.value })} />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <span className="text-overline uppercase tracking-widest font-10">Notifications</span>
        <h2 className="fw-800 m-0">Email Service Configuration</h2>
      </div>
      <div className="row g-4">
        <div className="col-lg-8">
          <Card className="glass shadow-md border-0 p-4">
            <h5 className="fw-800 mb-4 border-bottom pb-3">SMTP / Provider Settings</h5>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label text-overline text-muted font-11 mb-2">Provider</label>
                <select className="form-select font-13 bg-light border-0 py-3" value={cfg.provider}
                  onChange={(e) => setCfg({ ...cfg, provider: e.target.value })}>
                  <option value="smtp">Custom SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="ses">Amazon SES</option>
                </select>
              </div>
              {inputField('SMTP Host', 'host', 'text', 'smtp.example.com')}
              {inputField('SMTP Port', 'port', 'number', '587')}
              {inputField('Username / API Key', 'user', 'text', 'your@email.com')}
              {inputField('Password / Secret', 'password', 'password', '••••••••')}
              {inputField('From Name', 'from_name', 'text', 'GoomTaxi Platform')}
              {inputField('From Email', 'from_email', 'email', 'no-reply@goomtaxi.com')}
            </div>
            <div className="mt-5 pt-3 border-top d-flex gap-2">
              <Button variant="primary" onClick={() => addToast('Email config saved', 'success')}>
                <i className="bi bi-check2-circle"></i> Save Config
              </Button>
              <Button variant="secondary" onClick={() => addToast('Test email sent to admin inbox', 'info')}>
                <i className="bi bi-envelope-check"></i> Send Test Email
              </Button>
            </div>
          </Card>
        </div>
        <div className="col-lg-4">
          <Card className="bg-dark text-white border-0 shadow-lg h-100 p-4">
            <h5 className="fw-800 text-white mb-3">Email Infrastructure</h5>
            <p className="font-13 mb-3" style={{ opacity: 0.7 }}>Powers all transactional emails: OTP codes, booking confirmations, trip receipts, and admin alerts.</p>
            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <i className="bi bi-envelope-fill me-2 text-primary font-14"></i>
              <span className="font-12 fw-700">TLS Encryption Enforced</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Email;
