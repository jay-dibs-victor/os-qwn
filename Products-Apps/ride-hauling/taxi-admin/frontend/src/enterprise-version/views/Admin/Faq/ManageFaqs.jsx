import React, { useState } from 'react';
import { 
  useFaqsAdmin
} from '../../../core/hooks/adminHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';

/**
 * ManageFaqs — taxi-admin
 * High-fidelity knowledge base and support content management.
 */
const ManageFaqs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: faqs, isLoading } = useFaqsAdmin();
    const addToast = useUIStore((state) => state.addToast);

    const filteredFaqs = faqs?.filter((f) =>
        `${f.question} ${f.category}`.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="faqs-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline">Support Infrastructure</span>
                    <h2 className="fw-800 m-0">Knowledge Base (FAQs)</h2>
                </div>
                <Button variant="primary" onClick={() => addToast('Initializing FAQ editor...', 'info')}>
                    <i className="bi bi-patch-question-fill"></i> Add New FAQ
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
                                placeholder="Search by question or category..." 
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
                                <th>QUESTION / CATEGORY</th>
                                <th style={{ maxWidth: '400px' }}>ANSWER SNIPPET</th>
                                <th className="text-center">VISIBILITY</th>
                                <th className="text-end">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="4" className="text-center py-5"><div className="spinner"></div></td></tr>
                            ) : filteredFaqs.length > 0 ? (
                                filteredFaqs.map((f) => (
                                    <tr key={f._id || f.id}>
                                        <td>
                                            <div className="fw-800 text-dark">{f.question}</div>
                                            <div className="font-11 text-muted text-uppercase">{f.category || 'General Support'}</div>
                                        </td>
                                        <td>
                                            <div className="font-12 text-muted truncate-2" style={{ maxWidth: '400px' }}>
                                                {f.answer || 'No answer defined yet. Click edit to provide response.'}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge badge-success px-3">PUBLISHED</span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-flex justify-content-end gap-2 px-3">
                                                <button className="btn-action bg-light" style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}>
                                                    <i className="bi bi-pencil-fill text-primary"></i>
                                                </button>
                                                <button className="btn-action bg-light" style={{ width: 32, height: 32, borderRadius: 8, border: 'none' }}>
                                                    <i className="bi bi-trash-fill text-danger"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="text-center py-5 text-muted font-13 italic">No FAQ entries found in knowledge base</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ManageFaqs;
