import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { useUIStore } from '../../../core/store/useUIStore';
import { useBookingStore } from '../../../core/store/useBookingStore';

const VoucherWallet = () => {
    const user = useAuthStore(state => state.user);
    const { addToast } = useUIStore();
    const { voucherBalance, updateVoucherBalance } = useBookingStore();
    
    const [voucherCode, setVoucherCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRedeem = async (e) => {
        e.preventDefault();
        if (!voucherCode.trim()) return;

        setIsSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
            const response = await fetch(`${API_URL}/vouchers/redeem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: user?.id || user?._id,
                    code: voucherCode
                })
            });
            const data = await response.json();
            
            if (data.status === 200) {
                updateVoucherBalance(data.data.newBalance);
                addToast(`Successfully added ₦${data.data.amountAdded} to your voucher wallet!`, "success");
                setVoucherCode('');
            } else {
                addToast(data.message || "Invalid or expired voucher code", "error");
            }
        } catch (e) {
            addToast("Redemption failed. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="voucher-wallet-page py-5 mt-5 bg-white min-vh-100">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <header className="mb-5 text-center">
                            <h2 className="fw-900 text-dark mb-2">Voucher Wallet</h2>
                            <p className="text-muted">Manage your travel credits and promotional codes.</p>
                        </header>

                        {/* Balance Card */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="voucher-balance-card p-5 mb-5 rounded-5 shadow-lg position-relative overflow-hidden"
                            style={{ 
                                background: 'linear-gradient(135deg, #1A1A1A, #333)',
                                color: '#fff'
                            }}
                        >
                            <div className="position-absolute top-0 end-0 p-4 opacity-10">
                                <i className="bi bi-ticket-perforated" style={{ fontSize: '10rem' }}></i>
                            </div>
                            
                            <div className="position-relative z-1">
                                <span className="text-uppercase small fw-bold opacity-50 tracking-wider">Available Credit</span>
                                <h1 className="fw-900 display-4 mb-3 mt-1">₦{parseFloat(voucherBalance || 0).toLocaleString()}</h1>
                                <p className="text-white-50 small mb-0">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Voucher balance is automatically applied to your next booking.
                                </p>
                            </div>
                        </motion.div>

                        {/* Redeem Form */}
                        <div className="redeem-section p-4 p-md-5 rounded-5 border bg-light shadow-sm">
                            <h4 className="fw-bold mb-4">Redeem New Voucher</h4>
                            <form onSubmit={handleRedeem}>
                                <div className="input-group input-group-lg mb-3 shadow-sm rounded-pill overflow-hidden border">
                                    <span className="input-group-text bg-white border-0 ps-4">
                                        <i className="bi bi-upc-scan text-muted"></i>
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control border-0 px-3" 
                                        placeholder="Enter voucher code (e.g. QUEENS50)" 
                                        value={voucherCode}
                                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                        disabled={isSubmitting}
                                    />
                                    <button 
                                        className="btn btn-primary px-4 fw-bold" 
                                        type="submit"
                                        disabled={isSubmitting || !voucherCode}
                                    >
                                        {isSubmitting ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : 'Redeem'}
                                    </button>
                                </div>
                                <p className="text-muted small ps-3">
                                    Check your email or rewards hub for current promotional codes.
                                </p>
                            </form>
                        </div>

                        {/* Help Section */}
                        <div className="mt-5 grid-2-cols gap-4">
                            <div className="p-4 rounded-4 border">
                                <i className="bi bi-shield-check text-success fs-3 mb-2 d-block"></i>
                                <h6 className="fw-bold">Secured Credit</h6>
                                <p className="text-muted small m-0">All vouchers are verified and secured by our 256-bit encryption protocol.</p>
                            </div>
                            <div className="p-4 rounded-4 border">
                                <i className="bi bi-clock-history text-warning fs-3 mb-2 d-block"></i>
                                <h6 className="fw-bold">No Expiry</h6>
                                <p className="text-muted small m-0">Standard wallet credits never expire, so use them whenever you're ready.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .fw-900 { font-weight: 900; }
                .tracking-wider { letter-spacing: 0.1em; }
                .shadow-glow { box-shadow: 0 0 20px rgba(255, 184, 0, 0.3); }
                .grid-2-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                @media (max-width: 768px) { .grid-2-cols { grid-template-columns: 1fr; } }
            `}} />
        </div>
    );
};

export default VoucherWallet;
