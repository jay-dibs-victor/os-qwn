import React, { useState } from 'react';
import { 
  usePartnersAdmin, 
  useAddPartner 
} from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';

import './ManagePartners.css';

/**
 * ManagePartners — GoomTaxi
 * High-fidelity partner management for multi-fleet operations.
 * Features premium partner cards and automated onboarding workflows.
 */
const ManagePartners = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: partners, isLoading } = usePartnersAdmin();
    const addToast = useUIStore((state) => state.addToast);

    const filteredPartners = partners?.filter((p) =>
        `${p.name} ${p.email} ${p.company_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="partners-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline">Business Ecosystem</span>
                    <h2 className="fw-800 m-0">Fleet Partners</h2>
                </div>
                <Button variant="primary" onClick={() => addToast('Partner onboarding protocol initiated...', 'info')}>
                    <i className="bi bi-person-plus-fill"></i> Register New Partner
                </Button>
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
                                placeholder="Search by name, email or company..." 
                                className="bg-transparent border-0 w-100 outline-none font-13"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="font-12 fw-700 text-muted">
                        TOTAL PARTNERS: <span className="text-dark bg-warning px-2 py-1 rounded-2 ms-1">{filteredPartners.length}</span>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle m-0">
                        <thead>
                            <tr>
                                <th>PARTNER / COMPANY</th>
                                <th>CONTACT</th>
                                <th>FLEET SIZE</th>
                                <th className="text-center">STATUS</th>
                                <th className="text-end">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner"></div></td></tr>
                            ) : filteredPartners.length > 0 ? (
                                filteredPartners.map((p) => (
                                    <tr key={p._id || p.id}>
                                        <td>
                                            <div className="fw-800 text-dark">{p.name || p.company_name}</div>
                                            <div className="font-11 text-muted text-uppercase">{p.company_name ? 'Corporate Fleet' : 'Individual Partner'}</div>
                                        </td>
                                        <td>
                                            <div className="font-13 fw-600 text-dark">{p.email}</div>
                                            <div className="font-11 text-muted">{p.phone_number || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-car-front-fill text-muted"></i>
                                                <span className="fw-700">{p.fleet_count || 0} Vehicles</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge badge-success px-3">ACTIVE</span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-flex justify-content-end gap-2 px-3">
                                                <button className="btn-action bg-light" style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}>
                                                    <i className="bi bi-eye-fill text-primary"></i>
                                                </button>
                                                <button className="btn-action bg-light" style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}>
                                                    <i className="bi bi-pencil-square text-dark"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No partners found in ecosystem registry</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ManagePartners;
