import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserWalletBalance, useWalletHistory } from '../../../core/hooks/useProfileHooks';
import { useUIStore } from '../../../core/store/useUIStore';
import { useBookingStore } from '../../../core/store/useBookingStore';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { soundService } from '../../../core/services/SoundService';

const Wallet = () => {
    const { data: balance, isLoading: isBalanceLoading } = useUserWalletBalance();
    const { data: history = [], isLoading: isHistoryLoading } = useWalletHistory();
    const addToast = useUIStore((state) => state.addToast);
    const { voucherBalance, updateVoucherBalance } = useBookingStore();
    const { user } = useAuthStore();

    const [topUpAmount, setTopUpAmount] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    // Voucher State
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [voucherCode, setVoucherCode] = useState('');
    const [redeeming, setRedeeming] = useState(false);

    const handleTopUp = () => {
        if (!topUpAmount || isNaN(topUpAmount) || topUpAmount <= 0) {
            addToast('Please enter a valid amount', 'warning');
            return;
        }
        addToast(`Successfully topped up ₦${topUpAmount}!`, 'success');
        soundService.playCoin();
        setTopUpAmount('');
        setShowModal(false);
    };

    const handleRedeemVoucher = async () => {
        if (!voucherCode.trim()) return addToast('Please enter a voucher code', 'warning');
        
        setRedeeming(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
            const response = await fetch(`${API_URL}/vouchers/redeem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: user.id || user._id,
                    code: voucherCode
                })
            });
            const data = await response.json();
            
            if (data.status === 200) {
                updateVoucherBalance(data.data.newBalance);
                addToast(`Successfully added ₦${data.data.amountAdded} to your voucher balance!`, "success");
                soundService.playCoin();
                setVoucherCode('');
                setShowVoucherModal(false);
            } else {
                addToast(data.message || 'Verification failed', "error");
            }
        } catch (e) {
            addToast("Redemption failed. Check your network.", "error");
        } finally {
            setRedeeming(false);
        }
    };

    return (
        <div className="wallet-page py-5 mt-5">
            <div className="container">
                {/* HEADER */}
                <div className="row mb-5 align-items-center">
                    <div className="col-md-6">
                        <h2 className="fw-bold mb-1">My Wallet & Gifts</h2>
                        <p className="text-muted">Manage your funds and redeem trip vouchers.</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <button
                            className="btn btn-outline-dark px-4 py-2 fw-bold me-2"
                            onClick={() => setShowVoucherModal(true)}
                        >
                            <i className="bi bi-gift me-2"></i> Redeem Voucher
                        </button>
                        <button
                            className="btn btn-primary px-4 py-2 fw-bold"
                            style={{ background: '#FFB800', border: 'none', color: 'var(--color-text)' }}
                            onClick={() => setShowModal(true)}
                        >
                            <i className="bi bi-plus-lg me-2"></i> Top up Wallet
                        </button>
                    </div>
                </div>

                <div className="row g-4">
                    {/* BALANCE CARD */}
                    <div className="col-lg-4">
                        <div className="card bg-dark text-white border-0 shadow-lg p-4 mb-4" style={{ borderRadius: '24px', height: '180px' }}>
                            <div className="card-body">
                                <h6 className="text-uppercase small fw-bold text-muted mb-3">Total Balance</h6>
                                <h2 className="fw-bold" style={{ color: '#FFB800' }}>
                                    ₦{isBalanceLoading ? '...' : (balance || '0.00')}
                                </h2>
                            </div>
                        </div>

                        {/* VOUCHER CARD */}
                        <div className="card border-0 shadow-lg p-4" style={{ borderRadius: '24px', background: 'linear-gradient(135deg, #1e90ff 0%, #0077ff 100%)', color: 'white', height: '180px' }}>
                            <div className="card-body">
                                <h6 className="text-uppercase small fw-bold text-white-50 mb-3">Gift Voucher Balance</h6>
                                <h2 className="fw-bold">
                                    ₦{parseFloat(voucherBalance).toLocaleString()}
                                </h2>
                                <p className="small mb-0 opacity-75 mt-2">Valid for ride payments only.</p>
                            </div>
                        </div>
                    </div>

                    {/* HISTORY TABLE */}
                    <div className="col-lg-8">
                        {/* ... existing history card ... */}
                        <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: '24px' }}>
                           {/* (Rest of history logic remains same as previously viewed) */}
                           <div className="d-flex justify-content-between align-items-center mb-4">
                               <h5 className="fw-bold mb-0">Recent Transactions</h5>
                               <Link to="/wallet" className="btn btn-link btn-sm text-decoration-none fw-bold text-primary">View All</Link>
                           </div>

                           <div className="table-responsive">
                               <table className="table table-hover align-middle">
                                   <thead className="table-light">
                                       <tr className="small text-uppercase fw-bold text-muted">
                                           <th className="border-0 px-4">Date</th>
                                           <th className="border-0">Reference</th>
                                           <th className="border-0">Amount</th>
                                           <th className="border-0 px-4 text-end">Status</th>
                                       </tr>
                                   </thead>
                                   <tbody>
                                       {isHistoryLoading ? (
                                           <tr><td colSpan="4" className="text-center py-5">Loading history...</td></tr>
                                       ) : history.length === 0 ? (
                                           <tr><td colSpan="4" className="text-center py-5 text-muted">No transactions found.</td></tr>
                                       ) : (
                                           history.map((item, idx) => (
                                               <tr key={idx}>
                                                   <td className="px-4 border-0">
                                                       <span className="d-block fw-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                                                       <small className="text-muted">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                                   </td>
                                                   <td className="border-0">
                                                       <code className="small text-dark fw-bold">{item.reference || 'N/A'}</code>
                                                   </td>
                                                   <td className="border-0">
                                                       <span className={`fw-bold ${item.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                                                           {item.type === 'credit' ? '+' : '-'} ₦{item.amount}
                                                       </span>
                                                   </td>
                                                   <td className="px-4 border-0 text-end">
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
            </div>

            {/* TOP UP MODAL */}
            {showModal && (
                <div className="modal d-block" tabIndex="-1">
                    <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '24px' }}>
                            <div className="modal-header border-0 p-4 pb-0">
                                <h5 className="modal-title fw-bold">Top up Wallet</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-uppercase">Enter Amount (₦)</label>
                                    <input type="number" className="form-control form-control-lg bg-light border-0" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
                                </div>
                                <button className="btn btn-primary w-100 py-3 fw-bold rounded-pill" style={{ background: '#FFB800', border: 'none', color: 'var(--color-text)' }} onClick={handleTopUp}>
                                    Verify & Pay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VOUCHER REDEEM MODAL */}
            {showVoucherModal && (
                <div className="modal d-block" tabIndex="-1">
                    <div className="modal-backdrop fade show" onClick={() => setShowVoucherModal(false)}></div>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '24px' }}>
                            <div className="modal-header border-0 p-4 pb-0">
                                <h5 className="modal-title fw-bold">Redeem Trip Voucher</h5>
                                <button type="button" className="btn-close" onClick={() => setShowVoucherModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="text-muted small mb-4">Enter your 12-digit voucher code below to instantly top up your trip credits.</p>
                                <div className="mb-4">
                                    <label className="form-label small fw-bold text-uppercase">Voucher Code</label>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-lg bg-light border-0 text-center fw-bold" 
                                        style={{ letterSpacing: '2px' }}
                                        placeholder="XXXX-XXXX-XXXX"
                                        value={voucherCode} 
                                        onChange={(e) => setVoucherCode(e.target.value)} 
                                    />
                                </div>
                                <button 
                                    className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow-pulse" 
                                    disabled={redeeming}
                                    style={{ background: '#1e90ff', border: 'none' }} 
                                    onClick={handleRedeemVoucher}
                                >
                                    {redeeming ? 'Redeeming...' : 'Apply Voucher Credit'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wallet;



