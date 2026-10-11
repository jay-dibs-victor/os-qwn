import React, { useState } from 'react';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';

const S3Bucket = () => {
  const addToast = useUIStore((s) => s.addToast);
  const [cfg, setCfg] = useState({ access_key: '', secret_key: '', bucket_name: '', region: 'us-east-1', provider: 'aws' });

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <span className="text-overline uppercase tracking-widest font-10">Cloud Storage</span>
        <h2 className="fw-800 m-0">Object Storage Configuration</h2>
      </div>
      <div className="row g-4">
        <div className="col-lg-8">
          <Card className="glass shadow-md border-0 p-4">
            <h5 className="fw-800 mb-4 border-bottom pb-3">Storage Bucket Credentials</h5>
            <div className="row g-4">
              <div className="col-md-12">
                <label className="form-label text-overline text-muted font-11 mb-2">Cloud Provider</label>
                <select className="form-select font-13 bg-light border-0 py-3" value={cfg.provider}
                  onChange={(e) => setCfg({ ...cfg, provider: e.target.value })}>
                  <option value="aws">Amazon S3</option>
                  <option value="gcs">Google Cloud Storage</option>
                  <option value="cloudinary">Cloudinary</option>
                  <option value="digitalocean">DigitalOcean Spaces</option>
                </select>
              </div>
              {[
                { label: 'Access Key ID', key: 'access_key', type: 'text', ph: 'AKIA••••••••' },
                { label: 'Secret Access Key', key: 'secret_key', type: 'password', ph: '••••••••••••' },
                { label: 'Bucket Name', key: 'bucket_name', type: 'text', ph: 'goomtaxi-uploads' },
                { label: 'Region', key: 'region', type: 'text', ph: 'us-east-1' },
              ].map(({ label, key, type, ph }) => (
                <div className="col-md-6" key={key}>
                  <label className="form-label text-overline text-muted font-11 mb-2">{label}</label>
                  <input type={type} className="form-control bg-light border-0 py-3 font-13" placeholder={ph}
                    value={cfg[key]} onChange={(e) => setCfg({ ...cfg, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="mt-5 pt-3 border-top d-flex gap-2">
              <Button variant="primary" onClick={() => addToast('Storage credentials saved', 'success')}>
                <i className="bi bi-check2-circle"></i> Save Config
              </Button>
              <Button variant="secondary" onClick={() => addToast('Connectivity test initiated…', 'info')}>
                <i className="bi bi-wifi"></i> Test Connection
              </Button>
            </div>
          </Card>
        </div>
        <div className="col-lg-4">
          <Card className="bg-dark text-white border-0 shadow-lg h-100 p-4">
            <h5 className="fw-800 text-white mb-3">File Storage Usage</h5>
            <p className="font-13 mb-3" style={{ opacity: 0.7 }}>Stores driver documents, profile photos, vehicle images, and trip receipts. IAM role with least-privilege is recommended.</p>
            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <i className="bi bi-lock-fill me-2 text-success font-14"></i>
              <span className="font-12 fw-700">All uploads server-side encrypted</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default S3Bucket;
