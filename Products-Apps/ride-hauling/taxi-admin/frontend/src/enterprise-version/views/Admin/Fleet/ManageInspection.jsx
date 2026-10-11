import React, { useState } from 'react';
import { 
  useInspectionsAdmin
} from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';
import moment from 'moment';

/**
 * ManageInspection — taxi-admin
 * High-fidelity vehicle inspection and safety compliance monitoring.
 */
const ManageInspection = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: inspections, isLoading } = useInspectionsAdmin();
    const addToast = useUIStore((state) => state.addToast);

    const filteredInspections = inspections?.filter((i) =>
        `${i.car_plate} ${i.driver_name} ${i.inspection_center}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="inspections-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline">Fleet Integrity</span>
                    <h2 className="fw-800 m-0">Safety Inspections</h2>
                </div>
                <Button variant="primary" onClick={() => addToast('Scheduling new inspection slot...', 'info')}>
                    <i className="bi bi-calendar-plus-fill"></i> Schedule Inspection
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
                                placeholder="Search by plate, driver or center..." 
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
                                <th>VEHICLE / PLATE</th>
                                <th>INSPECTION LOG</th>
                                <th>CENTER</th>
                                <th className="text-center">COMPLIANCE</th>
                                <th className="text-end">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner"></div></td></tr>
                            ) : filteredInspections.length > 0 ? (
                                filteredInspections.map((i) => (
                                    <tr key={i._id || i.id}>
                                        <td>
                                            <div className="fw-800 text-dark">{i.car_plate || 'ABC-123-XY'}</div>
                                            <div className="font-11 text-muted text-uppercase">Driver: {i.driver_name || 'Fleet Operator'}</div>
                                        </td>
                                        <td>
                                            <div className="font-13 fw-600 text-dark">{moment(i.createdAt).format('DD MMM YYYY')}</div>
                                            <div className="font-11 text-muted">Scheduled: {moment(i.inspection_date).format('HH:mm')}</div>
                                        </td>
                                        <td>
                                            <div className="font-13 fw-700 text-dark">{i.inspection_center || 'Main Hub Lagos'}</div>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge ${i.status === 'passed' ? 'badge-success' : 'badge-warning'} px-3`}>
                                                {i.status?.toUpperCase() || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-flex justify-content-end gap-2 px-3">
                                                <button className="btn-action bg-light" style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}>
                                                    <i className="bi bi-clipboard2-pulse-fill text-primary"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No safety inspection records found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ManageInspection;
