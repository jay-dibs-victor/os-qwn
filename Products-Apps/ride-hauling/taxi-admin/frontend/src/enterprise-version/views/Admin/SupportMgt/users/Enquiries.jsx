import React, { useState } from 'react';
import { useEnquiriesAdmin } from '../../../../core/hooks/adminHooks';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';
import moment from 'moment';

/**
 * Enquiries Management — taxi-admin
 * High-fidelity console for general platform enquiries.
 */
const ManageEnquiries = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    const { data: enquiries, isLoading } = useEnquiriesAdmin();
    const addToast = useUIStore((state) => state.addToast);

    const filteredEnquiries = enquiries?.filter((e) =>
        `${e.user_email} ${e.subject} ${e.message}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (viewMode === 'detail' && selectedEnquiry) {
        return (
            <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <span className="text-overline uppercase tracking-widest font-10">Client Communications</span>
                        <h2 className="fw-800 m-0">Enquiry #{String(selectedEnquiry._id || selectedEnquiry.id).substring(0, 8)}</h2>
                    </div>
                    <Button variant="secondary" onClick={() => setViewMode('list')}>
                        <i className="bi bi-arrow-left"></i> Return to Inbox
                    </Button>
                </div>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <Card className="glass h-100 p-4 border-0">
                            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                                <h5 className="fw-800 m-0">{selectedEnquiry.subject || 'General Information Request'}</h5>
                                <span className="badge bg-light text-dark border">
                                    {selectedEnquiry.status?.toUpperCase() || 'UNREAD'}
                                </span>
                            </div>
                            <div className="p-4 rounded-3" style={{ background: '#f8f9fa', minHeight: '220px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <p className="font-14 text-dark-light line-height-relaxed m-0">
                                    {selectedEnquiry.message || selectedEnquiry.description || 'No detailed message provided for this enquiry.'}
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-top d-flex gap-2">
                                <Button variant="primary" onClick={() => addToast('Response draft initiated', 'success')}>
                                    Compose Response
                                </Button>
                                <Button variant="ghost" onClick={() => addToast('Enquiry marked as resolved', 'info')}>
                                    Close Ticket
                                </Button>
                            </div>
                        </Card>
                    </div>
                    <div className="col-lg-4">
                        <Card className="bg-dark text-white p-4 mb-4">
                            <h6 className="text-overline text-muted-light font-10 mb-3">Sender Details</h6>
                            <div className="d-flex align-items-center gap-3">
                                <div className="avatar-sm bg-info text-dark fw-bold rounded-3 flex-center" style={{ width: 44, height: 44, borderRadius: 14 }}>
                                    {(selectedEnquiry.user_email?.[0] || 'G').toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <div className="fw-700 font-14 text-white">{selectedEnquiry.user_email}</div>
                                    <div className="font-10 text-muted-light">Received {moment(selectedEnquiry.createdAt).format('MMM DD, YYYY')}</div>
                                </div>
                            </div>
                        </Card>
                        <Card className="glass p-4 border-0">
                            <h6 className="fw-800 mb-3 font-13">Category Tags</h6>
                            <div className="d-flex flex-wrap gap-2">
                                <span className="badge rounded-pill bg-light text-dark border font-10">Sales</span>
                                <span className="badge rounded-pill bg-light text-dark border font-10">Fleet Partnerships</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="enquiries-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline uppercase tracking-widest font-10">Communications</span>
                    <h2 className="fw-800 m-0">Public Enquiries</h2>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="secondary" className="glass">
                        <i className="bi bi-funnel"></i> Filter
                    </Button>
                </div>
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
                            <i className="bi bi-envelope text-muted"></i>
                            <input 
                                type="text" 
                                placeholder="Search sender or keywords..." 
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
                                <th className="ps-4">SENDER & DATE</th>
                                <th>SUBJECT & MESSAGE</th>
                                <th className="text-center">LABEL</th>
                                <th className="text-end pe-4">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                            ) : filteredEnquiries.length > 0 ? (
                                filteredEnquiries.map((req) => (
                                    <tr key={req._id || req.id} className="cursor-pointer border-bottom-0">
                                        <td className="ps-4" onClick={() => { setSelectedEnquiry(req); setViewMode('detail'); }}>
                                            <div className="fw-800 text-dark font-13">{req.user_email || 'Guest Visitor'}</div>
                                            <div className="font-10 text-muted">{moment(req.createdAt).fromNow()}</div>
                                        </td>
                                        <td onClick={() => { setSelectedEnquiry(req); setViewMode('detail'); }}>
                                            <div className="fw-700 text-dark font-12 truncate" style={{ maxWidth: '300px' }}>{req.subject || 'General Enquiry'}</div>
                                            <div className="font-10 text-muted-dark truncate" style={{ maxWidth: '350px' }}>{req.message}</div>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge rounded-pill bg-info text-dark" style={{ fontSize: '9px', opacity: 0.8 }}>GENERAL</span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                className="btn-action bg-light" 
                                                onClick={() => { setSelectedEnquiry(req); setViewMode('detail'); }}
                                                style={{ width: 34, height: 34, borderRadius: 10, border: 'none' }}
                                            >
                                                <i className="bi bi-reply-fill text-dark"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="text-center py-5 text-muted font-13 italic p-5">Inbox void. No active enquiries.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ManageEnquiries;

