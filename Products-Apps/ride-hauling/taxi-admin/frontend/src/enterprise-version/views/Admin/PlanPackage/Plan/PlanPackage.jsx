import React, { useState } from 'react';
import { usePlans, useAddPlanMutation } from '../../../../core/hooks/useWalletHooks';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';

/**
 * PlanPackage — taxi-admin
 * High-fidelity subscription and pricing model management.
 */
const PlanPackage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [selectedPlan, setSelectedPlan] = useState(null);

    const { data: plans, isLoading } = usePlans();
    const { mutate: addPlan } = useAddPlanMutation();
    const addToast = useUIStore((state) => state.addToast);

    const filteredPlans = plans?.filter((p) =>
        `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleSavePlan = () => {
        // Mock save for now
        addToast('Subscription plan saved successfully', 'success');
        setViewMode('list');
    };

    if (viewMode === 'add' || viewMode === 'detail') {
        const isEdit = viewMode === 'detail';
        return (
            <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <span className="text-overline uppercase tracking-widest font-10">Business Strategy</span>
                        <h2 className="fw-800 m-0">{isEdit ? 'Update Pricing Plan' : 'Define New Plan'}</h2>
                    </div>
                    <Button variant="secondary" onClick={() => setViewMode('list')}>
                        <i className="bi bi-arrow-left"></i> Back to Models
                    </Button>
                </div>
                
                <div className="row g-4">
                    <div className="col-lg-8">
                        <Card className="glass shadow-md border-0 p-4">
                            <h5 className="fw-800 mb-4 border-bottom pb-3">Plan Blueprint</h5>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label text-overline text-muted font-11 mb-2">Plan Name</label>
                                    <input 
                                        className="form-control bg-light border-0 py-3 font-13" 
                                        placeholder="Corporate Fleet"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-overline text-muted font-11 mb-2">Pricing (₦)</label>
                                    <input 
                                        className="form-control bg-light border-0 py-3 font-13" 
                                        type="number"
                                        placeholder="50000"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-overline text-muted font-11 mb-2">Category</label>
                                    <select className="form-select font-13 bg-light border-0 py-3">
                                        <option value="driver">Driver Subscription</option>
                                        <option value="partner">Fleet Partner Tier</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-overline text-muted font-11 mb-2">Billing Cycle</label>
                                    <select className="form-select font-13 bg-light border-0 py-3">
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Annually</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label text-overline text-muted font-11 mb-2">Description / Perks</label>
                                    <textarea 
                                        className="form-control bg-light border-0 py-3 font-13" 
                                        rows="3"
                                        placeholder="Describe the plan benefits..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-5 pt-3 border-top d-flex gap-2">
                                <Button variant="primary" onClick={handleSavePlan}>
                                    <i className="bi bi-check2-circle"></i> {isEdit ? 'Commit Changes' : 'Deploy Plan'}
                                </Button>
                                <Button variant="ghost" onClick={() => setViewMode('list')}>Discard</Button>
                            </div>
                        </Card>
                    </div>
                    <div className="col-lg-4">
                        <Card className="bg-dark text-white border-0 shadow-lg h-100 p-4">
                            <h5 className="fw-800 text-white mb-3">Monetization Guard</h5>
                            <p className="font-13 text-muted-light mb-4" style={{ opacity: 0.7 }}>
                                Existing subscriptions will not be strictly recalibrated immediately. Only new signups are affected instantly by price increments.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="plans-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline uppercase tracking-widest font-10">Business Strategy</span>
                    <h2 className="fw-800 m-0">Subscription Plans</h2>
                </div>
                <Button variant="primary" onClick={() => setViewMode('add')}>
                    <i className="bi bi-tag-fill"></i> Add Plan
                </Button>
            </div>

            <Card className="p-0 overflow-hidden shadow-sm border-0">
                <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                    <div className="search-wrap" style={{ maxWidth: '400px', width: '100%' }}>
                        <div className="search-box glass" style={{
                            width: '100%',
                            padding: '0.65rem 1.4rem',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            border: '1px solid rgba(0,0,0,0.08)'
                        }}>
                            <i className="bi bi-search text-muted"></i>
                            <input 
                                type="text" 
                                placeholder="Search pricing plans..." 
                                className="bg-transparent border-0 w-100 outline-none font-13"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle m-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">PLAN NAME</th>
                                <th>CATEGORY</th>
                                <th>PRICE (₦)</th>
                                <th>STATUS</th>
                                <th className="text-end pe-4">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                            ) : filteredPlans.length > 0 ? (
                                filteredPlans.map((plan, idx) => (
                                    <tr key={plan._id || plan.id || idx} className="border-bottom-0">
                                        <td className="ps-4">
                                            <div className="fw-700 text-dark">{plan.name}</div>
                                            <div className="font-11 text-muted truncate" style={{maxWidth: 200}}>{plan.description}</div>
                                        </td>
                                        <td>
                                            <span className="badge rounded-pill bg-dark text-white font-10 px-3 uppercase tracking-widest border border-dark">
                                                {plan.category || 'Standard'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="fw-800 text-primary font-14">₦{plan.price?.toLocaleString()}</span>
                                        </td>
                                        <td>
                                            <span className="badge px-3 rounded-pill bg-success font-10 text-white uppercase tracking-widest">
                                                Active
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                className="btn-action bg-light" 
                                                onClick={() => { setSelectedPlan(plan); setViewMode('detail'); }}
                                                title="Edit Plan"
                                                style={{ width: 34, height: 34, borderRadius: 10, border: 'none' }}
                                            >
                                                <i className="bi bi-pencil-square text-dark"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic p-5">No subscription models defined yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default PlanPackage;
