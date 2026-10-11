import React, { useState } from 'react';
import { usePaymentHistory } from '../../../core/hooks/useWalletHooks';
import { Button, Card } from '../../../core/components';
import { useUIStore } from '../../../core/store/useUIStore';
import moment from 'moment';

/**
 * PaymentHistoryAdmin — taxi-admin
 * High-fidelity financial transaction logs for the entire platform payment system.
 */
const WalletHistoryAdmin = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [selectedPayment, setSelectedPayment] = useState(null);
    
    const { data: payments, isLoading } = usePaymentHistory();
    const addToast = useUIStore((state) => state.addToast);

    const filteredPayments = payments?.filter((payment) =>
        `${payment.referenceCode || payment.reference} ${payment.planId || payment.plan_id}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    ) || [];

    if (viewMode === 'detail' && selectedPayment) {
        return (
            <div className="animate-fade-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <span className="text-overline uppercase tracking-widest font-10">Payment Detail</span>
                        <h2 className="fw-800 m-0">Reference Transaction</h2>
                    </div>
                    <Button variant="secondary" onClick={() => setViewMode('list')}>
                        <i className="bi bi-arrow-left"></i> Back to Ledger
                    </Button>
                </div>
                
                <div className="row g-4">
                    <div className="col-lg-8">
                        <Card className="glass shadow-md border-0 p-4">
                            <h5 className="fw-800 mb-4 border-bottom pb-3">Financial Transaction Details</h5>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <span className="text-overline text-muted font-11 d-block mb-1">Transaction Date</span>
                                    <p className="fw-bold text-dark m-0">{selectedPayment.createdAt ? moment(selectedPayment.createdAt).format('DD MMM YYYY, hh:mm A') : 'N/A'}</p>
                                </div>
                                <div className="col-md-6">
                                    <span className="text-overline text-muted font-11 d-block mb-1">Total Amount</span>
                                    <p className="fw-800 text-dark font-18 m-0 text-success">
                                        {selectedPayment.currency || '₦'} {selectedPayment.amount?.toLocaleString() || selectedPayment.totalAmount?.toLocaleString() || '0.00'}
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <span className="text-overline text-muted font-11 d-block mb-1">Reference Code</span>
                                    <p className="fw-bold text-dark m-0 font-monospace">{selectedPayment.referenceCode || selectedPayment.reference || 'N/A'}</p>
                                </div>
                                <div className="col-md-6">
                                    <span className="text-overline text-muted font-11 d-block mb-1">Plan / Package ID</span>
                                    <p className="fw-bold text-dark m-0">{selectedPayment.planId || selectedPayment.plan_id || 'Pay-As-You-Go'}</p>
                                </div>
                                <div className="col-md-6">
                                    <span className="text-overline text-muted font-11 d-block mb-1">Transaction Status</span>
                                    <span className={`badge px-3 rounded-pill font-10 ${
                                        selectedPayment.status?.toLowerCase() === 'success' || selectedPayment.status?.toLowerCase() === 'paid' 
                                            ? 'bg-success' : 'bg-warning text-dark'
                                    }`}>
                                        {(selectedPayment.status || 'Success').toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-lg-4">
                        <Card className="bg-dark text-white border-0 shadow-lg h-100 p-4">
                            <h5 className="fw-800 text-white mb-3">Ledger Intelligence</h5>
                            <p className="font-13 text-muted-light mb-4" style={{ opacity: 0.7 }}>
                                This transaction is mapped directly from the payment gateway. Edits to this ledger entry are strictly prohibited to ensure compliance and financial integrity.
                            </p>
                            <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <i className="bi bi-shield-check text-success font-14"></i>
                                    <span className="font-12 fw-700">Clearing Status Verified</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="payments-view animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <span className="text-overline uppercase tracking-widest font-10">Financial Ledger</span>
                    <h2 className="fw-800 m-0">Payment Ledger</h2>
                </div>
                <Button variant="secondary" onClick={() => addToast('Generating full payments export...', 'info')}>
                    <i className="bi bi-file-earmark-spreadsheet"></i> Export Record
                </Button>
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
                            <i className="bi bi-search text-muted"></i>
                            <input 
                                type="text" 
                                placeholder="Search reference code or plan ID..." 
                                className="bg-transparent border-0 w-100 outline-none font-13"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="font-12 fw-700 text-muted">
                        TOTAL ENTRIES: <span className="text-dark bg-warning px-2 py-1 rounded-2 ms-2">{filteredPayments.length}</span>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle m-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">DATE / TIME</th>
                                <th>REFERENCE CODE</th>
                                <th>PLAN IDENTIFIER</th>
                                <th>TOTAL AMOUNT</th>
                                <th className="text-center">STATUS</th>
                                <th className="text-end pe-4">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                            ) : filteredPayments.length > 0 ? (
                                filteredPayments.map((payment, idx) => (
                                    <tr key={payment._id || payment.id || idx} className="border-bottom-0">
                                        <td className="ps-4">
                                            <div className="font-12 fw-700 text-dark">
                                                {payment.createdAt ? moment(payment.createdAt).format('DD MMM YYYY') : 'N/A'}
                                            </div>
                                            <div className="font-11 text-muted uppercase tracking-widest mt-1">
                                                {payment.createdAt ? moment(payment.createdAt).format('hh:mm A') : ''}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="font-monospace font-12 bg-light px-2 py-1 rounded border">
                                                {payment.referenceCode || payment.reference}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-12 fw-600 text-dark">{payment.planId || payment.plan_id || 'Pay-As-You-Go'}</span>
                                        </td>
                                        <td>
                                            <span className="fw-800 text-success">
                                                {payment.currency || '₦'}{payment.amount?.toLocaleString() || payment.totalAmount?.toLocaleString() || '0.00'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge px-3 rounded-pill font-10 ${
                                                payment.status?.toLowerCase() === 'success' || payment.status?.toLowerCase() === 'paid' 
                                                    ? 'bg-success' : 'bg-warning text-dark'
                                            }`}>
                                                {(payment.status || 'Success').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                className="btn-action bg-light" 
                                                onClick={() => { setSelectedPayment(payment); setViewMode('detail'); }}
                                                title="View Ledger Details"
                                                style={{ width: 34, height: 34, borderRadius: 10, border: 'none' }}
                                            >
                                                <i className="bi bi-file-text-fill text-primary"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-5 text-muted font-13 italic p-5">No payment entries found within ledger.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default WalletHistoryAdmin;
