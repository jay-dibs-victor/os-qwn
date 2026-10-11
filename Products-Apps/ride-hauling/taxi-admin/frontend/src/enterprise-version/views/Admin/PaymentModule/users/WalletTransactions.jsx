import React, { useState } from 'react';
import { usePaymentHistory } from '../../../../core/hooks/useWalletHooks';
import { Button, Card } from '../../../../core/components';
import moment from 'moment';

/** WalletTransactions — wallet transaction list */
const WalletTransactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: transactions, isLoading } = usePaymentHistory();
  const filtered = transactions?.filter((t) =>
    `${t.reference || t.referenceCode || ''} ${t.user_email || ''} ${t.type || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <span className="text-overline uppercase tracking-widest font-10">Wallet</span>
        <h2 className="fw-800 m-0">Wallet Transactions</h2>
      </div>
      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <div className="p-4 border-bottom bg-light">
          <div className="search-box glass" style={{ maxWidth: 420, padding: '0.65rem 1.4rem', borderRadius: 14, display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid rgba(0,0,0,0.08)' }}>
            <i className="bi bi-search text-muted"></i>
            <input type="text" placeholder="Search transactions…" className="bg-transparent border-0 outline-none font-13 w-100"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle m-0">
            <thead className="bg-light"><tr>
              <th className="ps-4">DATE</th><th>USER</th><th>REFERENCE</th><th>AMOUNT</th><th className="text-center">STATUS</th>
            </tr></thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : filtered.length > 0 ? filtered.map((t, idx) => (
                <tr key={t._id || idx}>
                  <td className="ps-4"><div className="font-12 fw-700">{t.createdAt ? moment(t.createdAt).format('DD MMM YY') : 'N/A'}</div></td>
                  <td><div className="font-12">{t.user_email || t.email || 'N/A'}</div></td>
                  <td><span className="font-monospace font-12 bg-light px-2 py-1 rounded border">{t.reference || t.referenceCode || 'N/A'}</span></td>
                  <td><span className="fw-800 text-success">{t.currency || '₦'}{(t.amount || 0).toLocaleString()}</span></td>
                  <td className="text-center">
                    <span className={`badge px-2 rounded-pill font-10 ${['success','paid'].includes(t.status?.toLowerCase()) ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {(t.status || 'Paid').toUpperCase()}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted font-13 italic">No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default WalletTransactions;
