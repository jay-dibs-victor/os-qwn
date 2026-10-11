import React, { useState } from 'react';
import { useQuotations } from '../../../core/hooks/useWalletHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';
import moment from 'moment';

/**
 * QuoteSubscriptionHistoryAdmin — taxi-admin
 * Quotation and subscription history ledger.
 */
const QuoteSubscriptionHistoryAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: quotations, isLoading } = useQuotations();
  const addToast = useUIStore((s) => s.addToast);

  const filtered = quotations?.filter((q) =>
    `${q.plan_id || q.planId || ''} ${q.reference || q.referenceCode || ''} ${q.status || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="quote-history animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Subscription Records</span>
          <h2 className="fw-800 m-0">Quotation History</h2>
        </div>
        <Button variant="secondary" onClick={() => addToast('Exporting quotation history…', 'info')}>
          <i className="bi bi-file-earmark-spreadsheet"></i> Export
        </Button>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
          <div className="search-box glass" style={{ maxWidth: 420, padding: '0.65rem 1.4rem', borderRadius: 14, display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(0,0,0,0.08)', width: '100%' }}>
            <i className="bi bi-search text-muted"></i>
            <input type="text" placeholder="Search by plan ID or reference…" className="bg-transparent border-0 outline-none font-13 w-100"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="font-12 fw-700 text-muted ms-3 text-nowrap">
            RECORDS: <span className="bg-warning text-dark px-2 py-1 rounded-2 ms-1">{filtered.length}</span>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">DATE</th>
                <th>REFERENCE CODE</th>
                <th>PLAN ID</th>
                <th>AMOUNT</th>
                <th className="text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((q, idx) => (
                  <tr key={q._id || q.id || idx}>
                    <td className="ps-4">
                      <div className="font-12 fw-700 text-dark">{q.createdAt ? moment(q.createdAt).format('DD MMM YYYY') : 'N/A'}</div>
                      <div className="font-11 text-muted">{q.createdAt ? moment(q.createdAt).format('hh:mm A') : ''}</div>
                    </td>
                    <td><span className="font-monospace font-12 bg-light px-2 py-1 rounded border">{q.reference || q.referenceCode || 'N/A'}</span></td>
                    <td><span className="font-12 fw-600 text-dark">{q.plan_id || q.planId || 'Pay-As-You-Go'}</span></td>
                    <td><span className="fw-800 text-primary">{q.currency || '₦'}{(q.amount || 0).toLocaleString()}</span></td>
                    <td className="text-center">
                      <span className={`badge px-3 rounded-pill font-10 ${['success','paid'].includes(q.status?.toLowerCase()) ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {(q.status || 'Active').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No quotation records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default QuoteSubscriptionHistoryAdmin;
