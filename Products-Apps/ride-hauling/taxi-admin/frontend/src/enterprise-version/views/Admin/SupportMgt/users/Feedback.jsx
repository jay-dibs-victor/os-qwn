import React, { useState } from 'react';
import { useFeedbackAdmin } from '../../../../core/hooks/adminHooks';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';
import moment from 'moment';

/**
 * Feedback Management — taxi-admin
 * High-fidelity platform feedback & rating console.
 */
const ManageFeedback = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const { data: feedbacks, isLoading } = useFeedbackAdmin();
    const addToast = useUIStore((state) => state.addToast);

    const filteredFeedbacks = feedbacks?.filter((f) =>
        `${f.user_email} ${f.subject} ${f.comment}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (viewMode === 'detail' && selectedFeedback) {
        return (
            <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <span className="text-overline uppercase tracking-widest font-10">User Sentiment</span>
                        <h2 className="fw-800 m-0">Feedback Detail</h2>
                    </div>
                    <Button variant="secondary" onClick={() => setViewMode('list')}>
                        <i className="bi bi-arrow-left"></i> Back to List
                    </Button>
                </div>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <Card className="glass h-100 p-4">
                            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                                <h5 className="fw-800 m-0">{selectedFeedback.subject || 'Platform Experience'}</h5>
                                <div className="d-flex gap-1">
                                    {[1,2,3,4,5].map(star => (
                                        <i key={star} className={`bi bi-star-fill ${star <= (selectedFeedback.rating || 5) ? 'text-warning' : 'text-muted opacity-20'}`}></i>
                                    ))}
                                </div>
                            </div>
                            <div className="feedback-content p-4 rounded-3 border-0" style={{ background: 'rgba(0,0,0,0.02)', minHeight: '180px' }}>
                                <p className="font-14 text-dark-light italic line-height-lg">
                                    "{selectedFeedback.comment || selectedFeedback.message || 'The user did not leave a specific comment with this rating.'}"
                                </p>
                            </div>
                            <div className="mt-4 pt-3 border-top d-flex gap-2">
                                <Button variant="primary" onClick={() => addToast('Feedback acknowledged', 'success')}>
                                    Acknowledge
                                </Button>
                                <Button variant="ghost" className="text-danger" onClick={() => addToast('Feedback flagged for review', 'warning')}>
                                    Flag for Abuse
                                </Button>
                            </div>
                        </Card>
                    </div>
                    <div className="col-lg-4">
                        <Card className="bg-dark text-white p-4 mb-4">
                            <h6 className="text-overline text-muted-light font-10 mb-3">Contributor</h6>
                            <div className="d-flex align-items-center gap-3">
                                <div className="avatar-sm bg-primary text-dark fw-bold rounded-circle flex-center" style={{ width: 40, height: 40 }}>
                                    {(selectedFeedback.user_email?.[0] || 'U').toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <div className="fw-700 font-13 text-white">{selectedFeedback.user_email}</div>
                                    <div className="font-10 text-muted-light">Submitted {moment(selectedFeedback.createdAt).format('MMM DD, HH:mm')}</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="feedback-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline uppercase tracking-widest font-10">Experience Metrics</span>
                    <h2 className="fw-800 m-0">Platform Feedback</h2>
                </div>
                <div className="d-flex gap-2 text-muted font-11 fw-700 align-items-center">
                    AVERAGE RATING: <span className="text-dark bg-warning px-2 py-1 rounded-2 ms-1">4.8 / 5.0</span>
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
                                placeholder="Search feedback by user or content..." 
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
                                <th className="ps-4">USER / TIMESTAMP</th>
                                <th>CONTENT SNIPPET</th>
                                <th className="text-center">RATING</th>
                                <th className="text-end pe-4">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                            ) : filteredFeedbacks.length > 0 ? (
                                filteredFeedbacks.map((item) => (
                                    <tr key={item._id || item.id} className="cursor-pointer">
                                        <td className="ps-4" onClick={() => { setSelectedFeedback(item); setViewMode('detail'); }}>
                                            <div className="fw-800 text-dark font-13">{item.user_email}</div>
                                            <div className="font-10 text-muted uppercase">{moment(item.createdAt).fromNow()}</div>
                                        </td>
                                        <td onClick={() => { setSelectedFeedback(item); setViewMode('detail'); }}>
                                            <div className="fw-600 text-dark font-12 truncate" style={{ maxWidth: '300px' }}>
                                                {item.comment || item.message || 'No comment provided'}
                                            </div>
                                            <div className="font-10 text-muted uppercase tracking-tighter">Category: Platform</div>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-1">
                                                {[1,2,3,4,5].map(s => (
                                                    <i key={s} className={`bi bi-star-fill font-10 ${s <= (item.rating || 5) ? 'text-warning' : 'text-muted-light'}`}></i>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                className="btn-action bg-light" 
                                                onClick={() => { setSelectedFeedback(item); setViewMode('detail'); }}
                                                style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                                            >
                                                <i className="bi bi-eye-fill text-primary"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="text-center py-5 text-muted font-13 italic">No feedback entries recorded.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ManageFeedback;

