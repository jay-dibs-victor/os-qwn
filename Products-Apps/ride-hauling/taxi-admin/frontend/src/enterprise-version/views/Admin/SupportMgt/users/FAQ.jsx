import React, { useState } from 'react';
import { useFaqsAdmin } from '../../../../core/hooks/adminHooks';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';
import moment from 'moment';

/**
 * FAQ Management — taxi-admin
 * High-fidelity knowledge base & common queries module.
 */
const ManageFaqs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [selectedFaq, setSelectedFaq] = useState(null);

    const { data: faqs, isLoading } = useFaqsAdmin();
    const addToast = useUIStore((state) => state.addToast);

    const filteredFaqs = faqs?.filter((faq) =>
        `${faq.question} ${faq.answer}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (viewMode === 'detail' && selectedFaq) {
        return (
            <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <span className="text-overline tracking-widest font-10">Knowledge Repository</span>
                        <h2 className="fw-800 m-0">FAQ Entry Details</h2>
                    </div>
                    <Button variant="secondary" onClick={() => setViewMode('list')}>
                        <i className="bi bi-arrow-left"></i> Back to Archive
                    </Button>
                </div>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <Card className="glass h-100 p-4">
                            <div className="mb-4">
                                <span className="text-overline font-10 text-muted">Question</span>
                                <h4 className="fw-800 text-dark">{selectedFaq.question}</h4>
                            </div>
                            <div className="mb-4">
                                <span className="text-overline font-10 text-muted">Answer Payload</span>
                                <div className="p-3 rounded-3" style={{ background: 'rgba(0,0,0,0.03)', minHeight: '150px' }}>
                                    <p className="font-14 text-dark-light line-height-lg m-0">
                                        {selectedFaq.answer || 'No defined response has been cached for this query yet.'}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-top d-flex gap-2">
                                <Button variant="primary" onClick={() => addToast('Knowledge base updated', 'success')}>
                                    Modify Entry
                                </Button>
                                <Button variant="ghost" className="text-danger" onClick={() => addToast('Entry purged from repository', 'warning')}>
                                    Purge Entry
                                </Button>
                            </div>
                        </Card>
                    </div>
                    <div className="col-lg-4">
                        <Card className="bg-dark text-white p-4">
                            <h5 className="fw-800 text-white mb-3">Governance</h5>
                            <p className="font-12 text-muted-light">FAQs are globally visible to all users. Ensure information is accurate and reflects current platform policy.</p>
                            <div className="mt-4 p-3 rounded-2" style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '3px solid var(--color-primary)' }}>
                                <span className="font-10 fw-800 text-uppercase d-block text-muted">Entry Index</span>
                                <span className="font-13 fw-700">STATUS: {selectedFaq.status?.toUpperCase() || 'PUBLISHED'}</span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="faqs-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline tracking-widest font-10">Self-Service Portal</span>
                    <h2 className="fw-800 m-0">FAQ Repository</h2>
                </div>
                <Button variant="primary" onClick={() => addToast('Initialization of new query...', 'info')}>
                    <i className="bi bi-plus-lg"></i> Author New FAQ
                </Button>
            </div>

            <Card className="p-0 overflow-hidden shadow-sm border-0">
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
                                placeholder="Search queries or keywords..." 
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
                                <th className="ps-4">VERSION / ID</th>
                                <th>QUESTION</th>
                                <th className="text-center">VISIBILITY</th>
                                <th className="text-end pe-4">MANAGEMENT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                            ) : filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq) => (
                                    <tr key={faq._id || faq.id} className="cursor-pointer">
                                        <td className="ps-4" onClick={() => { setSelectedFaq(faq); setViewMode('detail'); }}>
                                            <div className="fw-800 text-dark font-13">#{String(faq._id || faq.id).substring(0, 6).toUpperCase()}</div>
                                            <div className="font-10 text-muted">{moment(faq.createdAt).format('MMM DD, YYYY')}</div>
                                        </td>
                                        <td onClick={() => { setSelectedFaq(faq); setViewMode('detail'); }}>
                                            <div className="fw-700 text-dark font-12 truncate" style={{ maxWidth: '350px' }}>{faq.question}</div>
                                            <div className="font-10 text-muted uppercase">Query String</div>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge rounded-pill ${faq.status === 'active' ? 'bg-success text-white' : 'bg-light text-dark border'}`} style={{ fontSize: '10px' }}>
                                                {faq.status?.toUpperCase() || 'PUBLIC'}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button 
                                                    className="btn-action bg-light" 
                                                    onClick={() => { setSelectedFaq(faq); setViewMode('detail'); }}
                                                    style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                                                >
                                                    <i className="bi bi-eye-fill text-primary"></i>
                                                </button>
                                                <button 
                                                    className="btn-action bg-light" 
                                                    style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}
                                                >
                                                    <i className="bi bi-pencil-fill text-dark"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="text-center py-5 text-muted font-13 italic">Knowledge base is currently void.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ManageFaqs;

