import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWalletHistory } from '../../../core/hooks/useProfileHooks';
import Skeleton, { ListSkeleton } from '../../../core/components/Skeleton';

const WalletHistory = () => {
  const { data: history = [], isLoading } = useWalletHistory();

  if (isLoading && history.length === 0) return (
    <div className="container py-5 mt-5">
      <Skeleton width="200px" height="32px" className="mb-4" />
      <ListSkeleton count={8} />
    </div>
  );
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(item => 
    item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="wallet-history-page py-5 mt-5">
      <div className="container">
        
        <div className="row mb-4 align-items-end">
          <div className="col-md-6">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/wallet">Wallet</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Wallet History</li>
              </ol>
            </nav>
            <h2 className="fw-bold mb-0">Wallet History</h2>
            <p className="text-muted mt-2">View all your transactions and top-ups.</p>
          </div>
          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <div className="d-inline-block position-relative" style={{ maxWidth: '300px', width: '100%' }}>
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input 
                type="text" 
                className="form-control form-control-lg bg-white shadow-sm border-0 ps-5" 
                placeholder="Search references..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '24px' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase fw-bold text-muted">
                  <th className="border-0 px-4 py-3">Date</th>
                  <th className="border-0 py-3">Reference Code</th>
                  <th className="border-0 py-3">Plan / Quotation ID</th>
                  <th className="border-0 py-3">Amount</th>
                  <th className="border-0 px-4 py-3 text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 border-bottom border-light">
                        <span className="d-block fw-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                        <small className="text-muted">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      </td>
                      <td className="border-bottom border-light">
                        <code className="small text-dark fw-bold px-2 py-1 bg-light rounded">{item.reference || 'N/A'}</code>
                      </td>
                      <td className="border-bottom border-light">
                        <span className="text-muted">{item.planId || item.quotationId || 'Wallet Top-up'}</span>
                      </td>
                      <td className="border-bottom border-light">
                        <span className={`fw-bold ${item.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                          {item.type === 'credit' ? '+' : '-'} ₦{item.amount}
                        </span>
                      </td>
                      <td className="px-4 border-bottom border-light text-end">
                        <span className={`badge rounded-pill px-3 py-2 ${item.status === 'success' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                          {item.status || 'Success'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WalletHistory;
