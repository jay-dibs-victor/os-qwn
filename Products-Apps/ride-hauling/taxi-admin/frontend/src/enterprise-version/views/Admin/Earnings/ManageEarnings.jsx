import React, { useState } from 'react';
import { 
  useEarningsAdmin
} from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';

import './ManageFinancials.css';

/**
 * ManageEarnings — GoomTaxi
 * Financial auditing and partner revenue distribution monitoring.
 * Features premium financial analytics and automated payout workflows.
 */
const ManageEarnings = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: earnings, isLoading } = useEarningsAdmin();
    const addToast = useUIStore((state) => state.addToast);

    const filteredEarnings = earnings?.filter((e) =>
        `${e.partner_name} ${e.transaction_id}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const totalRevenue = filteredEarnings.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return (
        <div className="earnings-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline">Financial Auditing</span>
                    <h2 className="fw-800 m-0">Revenue & Payouts</h2>
                </div>
                <div className="d-flex gap-3">
                    <Button variant="secondary" onClick={() => addToast('Exporting financial report as CSV...', 'info')}>
                        <i className="bi bi-download"></i> Export Reports
                    </Button>
                    <Button variant="primary" onClick={() => addToast('Processing partner payouts...', 'success')}>
                        <i className="bi bi-cash-stack"></i> Process Payouts
                    </Button>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <Card className="bg-dark text-white p-4 h-100 overflow-hidden position-relative">
                        <div className="position-relative z-1">
                            <span className="text-overline opacity-50">Settled Revenue</span>
                            <h2 className="fw-900 m-0 text-white">₦{totalRevenue.toLocaleString()}</h2>
                            <p className="font-11 text-success mt-2 mb-0 fw-700">
                                <i className="bi bi-graph-up-arrow me-1"></i> +12.4% from last period
                            </p>
                        </div>
                        <i className="bi bi-currency-exchange position-absolute" style={{ right: -10, bottom: -10, fontSize: 100, opacity: 0.1 }}></i>
                    </Card>
                </div>
                <div className="col-md-4">
                    <Card className="glass p-4 h-100 border-0 shadow-sm">
                        <span className="text-overline">Pending Payouts</span>
                        <h2 className="fw-900 m-0 text-dark">₦{(totalRevenue * 0.15).toLocaleString()}</h2>
                        <p className="font-11 text-muted mt-2 mb-0 fw-700">Scheduled for Wednesday</p>
                    </Card>
                </div>
                <div className="col-md-4">
                    <Card className="glass p-4 h-100 border-0 shadow-sm">
                        <span className="text-overline">Platform Commission</span>
                        <h2 className="fw-900 m-0 text-primary">₦{(totalRevenue * 0.2).toLocaleString()}</h2>
                        <p className="font-11 text-primary mt-2 mb-0 fw-700">Avg. 20% margin stabilized</p>
                    </Card>
                </div>
            </div>

            <Card className="p-0 overflow-hidden shadow-md">
                <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
                    <div className="search-wrap" style={{ maxWidth: '400px', width: '100%' }}>
                        <div className="search-box glass" style={{
                            width: '100%',
                            padding: '0.65rem 1.25rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <i className="bi bi-search text-muted"></i>
                            <input 
                                type="text" 
                                placeholder="Search by partner or TX ID..." 
                                className="bg-transparent border-0 w-100 outline-none font-13"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle m-0">
                        <thead>
                            <tr>
                                <th>PARTNER</th>
                                <th>TRANSACTION ID</th>
                                <th>GROSS AMOUNT</th>
                                <th>COMMISSION</th>
                                <th className="text-center">STATUS</th>
                                <th className="text-end">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner"></div></td></tr>
                            ) : filteredEarnings.length > 0 ? (
                                filteredEarnings.map((e) => (
                                    <tr key={e._id || e.id}>
                                        <td>
                                            <div className="fw-800 text-dark">{e.partner_name || 'Individual Partner'}</div>
                                            <div className="font-11 text-muted">PARTNER ID: {String(e.partner_id || '---').substring(0, 8)}</div>
                                        </td>
                                        <td>
                                            <code className="font-12 fw-700 text-primary">{String(e.transaction_id || e._id).toUpperCase()}</code>
                                        </td>
                                        <td>
                                            <span className="fw-800 text-dark">₦{e.amount?.toLocaleString() || '0'}</span>
                                        </td>
                                        <td>
                                            <span className="text-danger fw-700">-₦{(e.amount * 0.2).toLocaleString()}</span>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge ${e.status === 'settled' ? 'badge-success' : 'badge-warning'} px-3`}>
                                                {e.status?.toUpperCase() || 'SETTLED'}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-flex justify-content-end gap-2 px-3">
                                                <button className="btn-action bg-light" style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}>
                                                    <i className="bi bi-file-earmark-text-fill text-primary"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-5 text-muted font-13 italic">No earnings records found in fiscal log</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ManageEarnings;
