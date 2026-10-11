import React, { useState } from 'react';
import { usePaymentHistory } from '../../../../core/hooks/useWalletHooks';
import { Button, Card } from '../../../../core/components';
import { useUIStore } from '../../../../core/store/useUIStore';
import moment from 'moment';

/**
 * Payments — taxi-admin / PaymentModule
 * Centralized gateway payment ledger with full history and search.
 */
const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: payments, isLoading } = usePaymentHistory();
  const addToast = useUIStore((state) => state.addToast);

  const filtered = payments?.filter((p) =>
    `${p.reference || p.referenceCode} ${p.user_email || ''} ${p.status || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="payments-view animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10">Financial Gateway</span>
          <h2 className="fw-800 m-0">Payment Transactions</h2>
        </div>
        <Button variant="secondary" onClick={() => addToast('Exporting payment data…', 'info')}>
          <i className="bi bi-cloud-download"></i> Export
        </Button>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
          <div className="search-wrap" style={{ maxWidth: 400, width: '100%' }}>
            <div className="search-box glass" style={{
              width: '100%', padding: '0.65rem 1.4rem', borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              border: '1px solid rgba(0,0,0,0.08)'
            }}>
              <i className="bi bi-search text-muted"></i>
              <input
                type="text"
                placeholder="Search by reference or email…"
                className="bg-transparent border-0 w-100 outline-none font-13"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="font-12 fw-700 text-muted">
            TOTAL: <span className="bg-warning text-dark px-2 py-1 rounded-2 ms-2">{filtered.length}</span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">DATE</th>
                <th>REFERENCE</th>
                <th>USER</th>
                <th>AMOUNT</th>
                <th className="text-center">GATEWAY</th>
                <th className="text-center">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((p, idx) => (
                  <tr key={p._id || p.id || idx}>
                    <td className="ps-4">
                      <div className="font-12 fw-700 text-dark">{p.createdAt ? moment(p.createdAt).format('DD MMM YYYY') : 'N/A'}</div>
                      <div className="font-11 text-muted">{p.createdAt ? moment(p.createdAt).format('hh:mm A') : ''}</div>
                    </td>
                    <td><span className="font-monospace font-12 bg-light px-2 py-1 rounded border">{p.reference || p.referenceCode || 'N/A'}</span></td>
                    <td>
                      <div className="font-13 fw-600 text-dark">{p.user_email || p.email || 'Unknown'}</div>
                    </td>
                    <td><span className="fw-800 text-success">{p.currency || '₦'}{(p.amount || 0).toLocaleString()}</span></td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border font-10 px-3 rounded-pill uppercase">
                        {p.gateway || p.provider || 'Paystack'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge px-3 rounded-pill font-10 ${
                        ['success','paid','completed'].includes(p.status?.toLowerCase()) ? 'bg-success' : 'bg-warning text-dark'
                      }`}>
                        {(p.status || 'Success').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted font-13 italic">No payment records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Payments;
