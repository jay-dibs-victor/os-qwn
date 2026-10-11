import React, { useState } from 'react';
import { Card, Button } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';

/**
 * PayStack API Settings — taxi-admin
 * High-fidelity console for payment gateway configuration.
 */
const PayStackSettings = () => {
    const addToast = useUIStore((state) => state.addToast);
    const [config, setConfig] = useState({
        apiMode: 'test',
        testSecretKey: 'sk_test_************************',
        testPublicKey: 'pk_test_************************',
        liveSecretKey: '',
        livePublicKey: '',
    });

    const handleSave = () => {
        addToast('Paystack gateway configuration updated successfully', 'success');
    };

    return (
        <div className="api-settings-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline uppercase tracking-widest font-10">Financial Integrations</span>
                    <h2 className="fw-800 m-0">Paystack Gateway</h2>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="secondary" onClick={() => window.history.back()}>
                        <i className="bi bi-arrow-left"></i> Back to Settings
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        <i className="bi bi-cloud-arrow-up-fill"></i> Commit Changes
                    </Button>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <Card className="p-4 shadow-sm border-0">
                        <h4 className="fw-800 mb-4 pb-3 border-bottom">API Credentials</h4>
                        
                        <div className="mb-4">
                            <label className="form-label text-overline text-muted font-11 mb-2">Environment Mode</label>
                            <select 
                                className="form-select font-13 bg-light border-0 py-3"
                                value={config.apiMode}
                                onChange={(e) => setConfig({ ...config, apiMode: e.target.value })}
                            >
                                <option value="test">Test Mode (Sandbox)</option>
                                <option value="live">Live Mode (Production)</option>
                            </select>
                        </div>

                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <label className="form-label text-overline text-muted font-11 mb-2">Test Platform Public Key</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0 py-3 font-mono font-13" 
                                    value={config.testPublicKey}
                                    placeholder="pk_test_..."
                                    onChange={(e) => setConfig({ ...config, testPublicKey: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-overline text-muted font-11 mb-2">Test Platform Secret Key</label>
                                <input 
                                    type="password" 
                                    className="form-control bg-light border-0 py-3 font-mono font-13" 
                                    value={config.testSecretKey}
                                    placeholder="sk_test_..."
                                    onChange={(e) => setConfig({ ...config, testSecretKey: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label text-overline text-muted font-11 mb-2">Live Platform Public Key</label>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-0 py-3 font-mono font-13" 
                                    value={config.livePublicKey}
                                    placeholder="pk_live_..."
                                    onChange={(e) => setConfig({ ...config, livePublicKey: e.target.value })}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-overline text-muted font-11 mb-2">Live Platform Secret Key</label>
                                <input 
                                    type="password" 
                                    className="form-control bg-light border-0 py-3 font-mono font-13" 
                                    value={config.liveSecretKey}
                                    placeholder="sk_live_..."
                                    onChange={(e) => setConfig({ ...config, liveSecretKey: e.target.value })}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
                
                <div className="col-lg-4">
                    <Card className="bg-dark text-white p-4 mb-4 border-0">
                        <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom border-secondary">
                            <i className="bi bi-shield-lock-fill text-warning" style={{ fontSize: '2rem' }}></i>
                            <div>
                                <h6 className="fw-800 text-white m-0">Security Posture</h6>
                                <p className="font-11 text-muted-light m-0">Credentials are vault encrypted</p>
                            </div>
                        </div>
                        <p className="font-13 line-height-lg text-muted-light m-0 mb-3">
                            These credentials authorize your platform to capture funds and process payouts via the Paystack gateway.
                        </p>
                        <div className="d-flex justify-content-between p-3 rounded-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <span className="font-11 text-muted-light">Active Webhook endpoint:</span>
                            <span className="font-11 fw-800 text-success"><i className="bi bi-circle-fill font-8 me-1"></i> CONNECTED</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PayStackSettings;

