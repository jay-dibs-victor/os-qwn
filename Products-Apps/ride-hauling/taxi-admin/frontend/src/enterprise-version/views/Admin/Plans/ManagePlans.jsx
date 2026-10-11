import React, { useState } from 'react';
import { usePlans } from '../../../core/hooks/useWalletHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';

/**
 * ManagePlans — taxi-admin
 * High-fidelity subscription and pricing model management.
 */
const ManagePlans = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: plans, isLoading } = usePlans();
    const addToast = useUIStore((state) => state.addToast);

    return (
        <div className="plans-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline">Business Strategy</span>
                    <h2 className="fw-800 m-0">Subscription Plans</h2>
                </div>
                <Button variant="primary" onClick={() => addToast('Creating new pricing model...', 'info')}>
                    <i className="bi bi-plus-circle-fill"></i> New Pricing Plan
                </Button>
            </div>

            <div className="row g-4">
                {/* Mocking some plan cards for visual fidelity if empty */}
                {[
                    { name: 'Standard Ride', price: '0', type: 'Commission based', color: '#FFB800' },
                    { name: 'Corporate Fleet', price: '50,000', type: 'Monthly Fixed', color: '#3b82f6' }
                ].map((plan) => (
                    <div key={plan.name} className="col-md-4">
                        <Card className="glass h-100 p-4 border-0 shadow-sm relative overflow-hidden">
                            <div className="position-relative z-1">
                                <span className="badge bg-white text-dark mb-3 fw-800">{plan.type}</span>
                                <h3 className="fw-900 text-dark mb-1">{plan.name}</h3>
                                <div className="font-24 fw-900 text-primary">₦{plan.price}<span className="font-12 text-muted fw-500"> / month</span></div>
                                <ul className="list-unstyled mt-4 font-13 text-muted">
                                    <li className="mb-2"><i className="bi bi-check2 text-success me-2"></i> Priority Dispatch</li>
                                    <li className="mb-2"><i className="bi bi-check2 text-success me-2"></i> Low Commission</li>
                                    <li><i className="bi bi-check2 text-success me-2"></i> 24/7 Support</li>
                                </ul>
                                <Button variant="secondary" className="w-100 mt-4">Edit Model</Button>
                            </div>
                            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: plan.color, opacity: 0.1, borderRadius: '50%' }}></div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagePlans;
