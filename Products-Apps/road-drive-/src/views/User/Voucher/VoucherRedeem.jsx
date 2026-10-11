import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../../core/store/useUIStore';
import { useBookingStore } from '../../../core/store/useBookingStore';
import { useAuthStore } from '../../../core/store/useAuthStore';

/**
 * VoucherRedeem — Entry point for encrypted voucher links
 * URL: /redeem/:hash
 */
const VoucherRedeem = () => {
   const { hash } = useParams();
   const navigate = useNavigate();
   const { addToast } = useUIStore();
   const { updateVoucherBalance, voucherBalance } = useBookingStore();
   const { user } = useAuthStore();
   
   const [voucherData, setVoucherData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [redeeming, setRedeeming] = useState(false);

   useEffect(() => {
      const fetchVoucher = async () => {
         try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/vouchers/link/${hash}`, {
               headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
               }
            });
            const data = await response.json();
            if (data.status === 200) {
               setVoucherData(data.data);
            } else {
               addToast(data.message || "Invalid voucher link", "error");
               navigate('/dashboard');
            }
         } catch (e) {
            addToast("Failed to validate link", "error");
            navigate('/dashboard');
         } finally {
            setLoading(false);
         }
      };

      if (hash) fetchVoucher();
   }, [hash, navigate, addToast]);

   const handleRedeem = async () => {
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
               userId: user.id,
               code: voucherData.code
            })
         });
         const data = await response.json();
         
         if (data.status === 200) {
            updateVoucherBalance(data.data.newBalance);
            addToast(`Successfully added ₦${data.data.amountAdded} to your voucher balance!`, "success");
            
            // Per request: Redirect to itinerary plan page
            setTimeout(() => navigate('/plan'), 2000);
         } else {
            addToast(data.message, "error");
         }
      } catch (e) {
         addToast("Redemption failed", "error");
      } finally {
         setRedeeming(false);
      }
   };

   if (loading) return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
         <div className="spinner-border text-primary" role="status"></div>
      </div>
   );

   return (
      <div className="redeem-container vh-100 d-flex align-items-center justify-content-center bg-dark text-white p-4">
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="redeem-card pro-card p-5 text-center shadow-lg border-0"
            style={{ maxWidth: '500px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRadius: '24px' }}
         >
            <div className="mb-4">
               <div className="voucher-icon bg-primary rounded-circle d-inline-flex p-4 mb-3 shadow-glow">
                  <i className="ri-ticket-2-line fs-1"></i>
               </div>
               <h2 className="fw-bold mb-2">Voucher Found!</h2>
               <p className="text-muted">You've unlocked a travel credit. Add it to your balance to pay for your next ride.</p>
            </div>

            <div className="voucher-details bg-white bg-opacity-10 p-4 rounded-3 mb-4 shadow-inner">
               <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">New Credit</span>
                  <h3 className="mb-0 text-primary fw-bold">₦{voucherData?.amount?.toLocaleString()}</h3>
               </div>
               <hr className="opacity-10" />
               <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Current Balance</span>
                  <span className="fw-bold">₦{parseFloat(voucherBalance).toLocaleString()}</span>
               </div>
            </div>

            <button 
               className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-pulse"
               disabled={redeeming}
               onClick={handleRedeem}
            >
               {redeeming ? 'Redeeming...' : 'Apply Credit & Start Planning'}
            </button>
            
            <button 
               className="btn btn-link text-muted mt-3" 
               onClick={() => navigate('/dashboard')}
            >
               Skip for now
            </button>
         </motion.div>
      </div>
   );
};

export default VoucherRedeem;
