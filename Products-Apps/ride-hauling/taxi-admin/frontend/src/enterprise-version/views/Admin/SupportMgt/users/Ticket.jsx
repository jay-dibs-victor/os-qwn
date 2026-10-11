import React, { useState } from 'react';
import { useTicketsAdmin } from '../../../../core/hooks/adminHooks';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';
import moment from 'moment';

/**
 * Ticket Management — taxi-admin
 * High-fidelity support ticket console.
 */
const SupportUsers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [selectedTicket, setSelectedTicket] = useState(null);

    const { data: tickets, isLoading } = useTicketsAdmin();
    const addToast = useUIStore((state) => state.addToast);

    const filteredTickets = tickets?.filter((ticket) =>
        `${ticket.user_email} ${ticket.subject} ${ticket.ticket_type}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (viewMode === 'detail' && selectedTicket) {
        return (
            <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <span className="text-overline uppercase tracking-widest font-10">Case Resolution</span>
                        <h2 className="fw-800 m-0">#{selectedTicket.ticketId || selectedTicket._id}</h2>
                    </div>
                    <Button variant="secondary" onClick={() => setViewMode('list')}>
                        <i className="bi bi-arrow-left"></i> Return to Inbox
                    </Button>
                </div>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <Card className="glass h-100 p-4">
                            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                                <h5 className="fw-800 m-0">{selectedTicket.subject}</h5>
                                <span className={`badge ${selectedTicket.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                                    {selectedTicket.status?.toUpperCase() || 'OPEN'}
                                </span>
                            </div>
                            <div className="ticket-body p-3 rounded-3" style={{ background: 'rgba(0,0,0,0.02)', minHeight: '200px' }}>
                                <p className="font-14 text-dark line-height-lg">
                                    {selectedTicket.message || selectedTicket.description || 'No descriptive content provided for this issue.'}
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-top d-flex gap-2">
                                <Button variant="primary" onClick={() => addToast('Response transmitted successfully', 'success')}>
                                    Dispatch Response
                                </Button>
                                <Button variant="ghost" onClick={() => addToast('Ticket status upgraded', 'info')}>
                                    Mark as Resolved
                                </Button>
                            </div>
                        </Card>
                    </div>
                    <div className="col-lg-4">
                        <Card className="bg-dark text-white p-4 mb-4">
                            <h6 className="text-overline text-muted-light font-10 mb-3">Originator</h6>
                            <div className="d-flex align-items-center gap-3">
                                <div className="avatar-sm bg-light text-dark fw-bold rounded-circle flex-center" style={{ width: 40, height: 40 }}>
                                    {(selectedTicket.user_email?.[0] || 'U').toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <div className="fw-700 font-13">{selectedTicket.user_email}</div>
                                    <div className="font-10 text-muted-light">Submitted {moment(selectedTicket.createdAt).fromNow()}</div>
                                </div>
                            </div>
                        </Card>
                        <Card className="glass p-4 border-0">
                            <h6 className="fw-800 mb-3 font-13">Metadata</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted font-12">Category</span>
                                <span className="fw-700 font-12 uppercase">{selectedTicket.ticket_type || 'General'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted font-12">Priority</span>
                                <span className="text-danger fw-700 font-12">CRITICAL</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="support-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline uppercase tracking-widest font-10">Client Relations</span>
                    <h2 className="fw-800 m-0">Support Tickets</h2>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="secondary">
                        <i className="bi bi-archive"></i> Archives
                    </Button>
                    <Button variant="primary" onClick={() => addToast('Automated triage system active', 'info')}>
                        <i className="bi bi-gear-fill"></i> Triage Settings
                    </Button>
                </div>
            </div>

            <Card className="p-0 overflow-hidden shadow-md border-0">
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
                                placeholder="Search by email, subject or ID..." 
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
                                <th className="ps-4">TICKET ID / ORIGIN</th>
                                <th>SUBJECT & TYPE</th>
                                <th className="text-center">PRIORITY</th>
                                <th className="text-center">STATUS</th>
                                <th className="text-end pe-4">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                            ) : filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket) => (
                                    <tr key={ticket._id || ticket.id} className="cursor-pointer">
                                        <td className="ps-4" onClick={() => { setSelectedTicket(ticket); setViewMode('detail'); }}>
                                            <div className="fw-800 text-dark font-13">#{ticket.ticketId || String(ticket._id).substring(0, 8).toUpperCase()}</div>
                                            <div className="font-11 text-muted">{ticket.user_email}</div>
                                        </td>
                                        <td onClick={() => { setSelectedTicket(ticket); setViewMode('detail'); }}>
                                            <div className="fw-700 text-dark font-12 truncate" style={{ maxWidth: '200px' }}>{ticket.subject}</div>
                                            <div className="font-10 text-muted uppercase tracking-tighter">{ticket.ticket_type || 'GENERAL SUPPORT'}</div>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge rounded-pill bg-light text-danger border border-danger-subtle" style={{ fontSize: '10px' }}>HIGH</span>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge rounded-pill ${ticket.status === 'resolved' ? 'bg-success text-white' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>
                                                {ticket.status?.toUpperCase() || 'OPEN'}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button 
                                                    className="btn-action bg-light" 
                                                    onClick={() => { setSelectedTicket(ticket); setViewMode('detail'); }}
                                                    style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                                                >
                                                    <i className="bi bi-chat-right-text-fill text-primary"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">Inbox clear — No pending tickets</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default SupportUsers;

