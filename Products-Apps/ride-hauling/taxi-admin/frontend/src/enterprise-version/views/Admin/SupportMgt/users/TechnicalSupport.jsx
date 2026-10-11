import React, { useState } from 'react';
import { useTechSupportAdmin } from '../../../../core/hooks/adminHooks';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';
import moment from 'moment';

/**
 * Technical Support Management — taxi-admin
 * High-fidelity console for critical system & account technical issues.
 */
const TechnicalSupport = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [selectedRequest, setSelectedRequest] = useState(null);

    const { data: supportRequests, isLoading } = useTechSupportAdmin();
    const addToast = useUIStore((state) => state.addToast);

    const filteredRequests = supportRequests?.filter((r) =>
        `${r.user_email} ${r.subject} ${r.ticketId}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (viewMode === 'detail' && selectedRequest) {
        return (
            <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <span className="text-overline uppercase tracking-widest font-10">Technical Escalation</span>
                        <h2 className="fw-800 m-0">Case #{selectedRequest.ticketId || selectedRequest._id}</h2>
                    </div>
                    <Button variant="secondary" onClick={() => setViewMode('list')}>
                        <i className="bi bi-arrow-left"></i> Return to Queue
                    </Button>
                </div>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <Card className="glass h-100 p-4 shadow-xl border-0">
                            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                                <h5 className="fw-800 m-0">{selectedRequest.subject}</h5>
                                <span className={`badge ${selectedRequest.status === 'resolved' ? 'bg-success' : 'bg-danger animate-pulse'}`} style={{ fontSize: 10 }}>
                                    {selectedRequest.status?.toUpperCase() || 'CRITICAL'}
                                </span>
                            </div>
                            <div className="p-4 rounded-3" style={{ background: 'rgba(255,255,255,0.4)', minHeight: '220px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <p className="font-14 text-dark-light line-height-relaxed m-0">
                                    {selectedRequest.message || selectedRequest.description || 'No detailed log provided for this technical escalation.'}
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-top d-flex gap-2">
                                <Button variant="primary" onClick={() => addToast('Engineer dispatched to system node', 'success')}>
                                    Assign to Engineering
                                </Button>
                                <Button variant="ghost" className="text-warning" onClick={() => addToast('Case priority adjusted', 'info')}>
                                    Escalate Level
                                </Button>
                            </div>
                        </Card>
                    </div>
                    <div className="col-lg-4">
                        <Card className="bg-dark text-white p-4 mb-4">
                            <h6 className="text-overline text-muted-light font-10 mb-3">Affected Entity</h6>
                            <div className="d-flex align-items-center gap-3">
                                <div className="avatar-sm bg-warning text-dark fw-bold rounded-3 flex-center" style={{ width: 44, height: 44, borderRadius: 14 }}>
                                    {(selectedRequest.user_email?.[0] || 'T').toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <div className="fw-700 font-14 text-white">{selectedRequest.user_email}</div>
                                    <div className="font-10 text-muted-light">Logged {moment(selectedRequest.createdAt).fromNow()}</div>
                                </div>
                            </div>
                        </Card>
                        <Card className="glass p-4 border-0">
                            <h6 className="fw-800 mb-3 font-13">System Diagnostics</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted font-11">Incident Type</span>
                                <span className="fw-700 font-11 uppercase text-primary">{selectedRequest.ticket_type || 'Internal Error'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted font-11">SLA Target</span>
                                <span className="text-danger fw-700 font-11">2 Hours</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tech-support-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline uppercase tracking-widest font-10">Infrastructure Resilience</span>
                    <h2 className="fw-800 m-0">Technical Support</h2>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="secondary" className="glass">
                        <i className="bi bi-activity"></i> System Status
                    </Button>
                </div>
            </div>

            <Card className="p-0 overflow-hidden shadow-2xl border-0 bg-white">
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
                            <i className="bi bi-cpu-fill text-muted"></i>
                            <input 
                                type="text" 
                                placeholder="Filter by endpoint, user or ticket ID..." 
                                className="bg-transparent border-0 w-100 outline-none font-13"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="font-11 fw-800 text-danger animate-pulse">
                        <i className="bi bi-circle-fill me-1 font-8"></i> LIVE MONITORING ACTIVE
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle m-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">TICKET ORIGIN</th>
                                <th>INCIDENT DESCRIPTION</th>
                                <th className="text-center">DIVERSITY</th>
                                <th className="text-center">STATUS</th>
                                <th className="text-end pe-4">MANAGEMENT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                            ) : filteredRequests.length > 0 ? (
                                filteredRequests.map((req) => (
                                    <tr key={req._id || req.id} className="cursor-pointer border-bottom-0">
                                        <td className="ps-4" onClick={() => { setSelectedRequest(req); setViewMode('detail'); }}>
                                            <div className="fw-800 text-dark font-13">{req.user_email}</div>
                                            <div className="font-10 text-muted uppercase">ID: {String(req._id || req.id).substring(0, 10)}</div>
                                        </td>
                                        <td onClick={() => { setSelectedRequest(req); setViewMode('detail'); }}>
                                            <div className="fw-700 text-dark font-12 truncate" style={{ maxWidth: '300px' }}>{req.subject}</div>
                                            <div className="font-10 text-muted-dark">{moment(req.createdAt).format('HH:mm [on] MMM DD')}</div>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge rounded-pill bg-light text-primary border border-primary-subtle" style={{ fontSize: '9px' }}>CORE-NODE</span>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge rounded-pill ${req.status === 'resolved' ? 'bg-success' : 'bg-danger'} text-white shadow-sm`} style={{ fontSize: '10px', padding: '4px 10px' }}>
                                                {req.status?.toUpperCase() || 'URGENT'}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                className="btn-action bg-light" 
                                                onClick={() => { setSelectedRequest(req); setViewMode('detail'); }}
                                                style={{ width: 34, height: 34, borderRadius: 10, border: 'none' }}
                                            >
                                                <i className="bi bi-terminal-fill text-dark"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic p-5">Infrastructure health nominal — No critical escalations.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default TechnicalSupport;

