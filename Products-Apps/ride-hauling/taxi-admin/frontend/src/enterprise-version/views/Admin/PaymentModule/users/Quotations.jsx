import React, { useState } from 'react';
import { useQuotations } from '../../../../core/hooks/useWalletHooks';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';
import moment from 'moment';

/** Quotations — PaymentModule quotations list */
const Quotations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: quotations, isLoading } = useQuotations();
  const addToast = useUIStore((s) => s.addToast);
  const filtered = quotations?.filter((q) =>
    `${q.reference || q.referenceCode || ''} ${q.plan_id || q.planId || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Finance</span>
          <h2 className="fw-800 m-0">Quotations Ledger</h2>
        </div>
        <Button variant="secondary" onClick={() => addToast('Exporting quotations…', 'info')}>
          <i className="bi bi-download"></i> Export
        </Button>
      </div>
      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light">
          <div className="search-box glass" style={{ maxWidth: 420, padding: '0.65rem 1.4rem', borderRadius: 14, display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(0,0,0,0.08)' }}>
            <i className="bi bi-search text-muted"></i>
            <input type="text" placeholder="Search quotations…" className="bg-transparent border-0 outline-none font-13 w-100"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light"><tr>
              <th className="ps-4">DATE</th><th>REFERENCE</th><th>PLAN ID</th><th>AMOUNT</th><th className="text-center">STATUS</th>
            </tr></thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? filtered.map((q, idx) => (
                <tr key={q._id || idx}>
                  <td className="ps-4"><div className="font-12 fw-700">{q.createdAt ? moment(q.createdAt).format('DD MMM YY') : 'N/A'}</div></td>
                  <td><span className="font-monospace font-12 bg-light px-2 py-1 rounded border">{q.reference || q.referenceCode || 'N/A'}</span></td>
                  <td><span className="font-12 fw-600">{q.plan_id || q.planId || 'N/A'}</span></td>
                  <td><span className="fw-800 text-success">{q.currency || '₦'}{(q.amount || 0).toLocaleString()}</span></td>
                  <td className="text-center"><span className="badge bg-success px-2 rounded-pill font-10">QUOTED</span></td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No quotations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default Quotations;
