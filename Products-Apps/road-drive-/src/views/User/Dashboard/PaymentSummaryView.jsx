import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PaymentSummaryView = ({ ride, onClose }) => {
  const navigate = useNavigate();

  if (!ride) return null;

  const { fare, recalculated_fare, distance, duration, destination_location } = ride;
  const isRecalculated = !!recalculated_fare;
  const finalFare = recalculated_fare || fare;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay d-flex align-items-center justify-content-center p-3"
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="card border-0 shadow-2xl p-4 p-md-5 bg-white"
        style={{ width: '100%', maxWidth: '500px', borderRadius: '32px' }}
      >
        <div className="text-center mb-4">
          <div className="d-inline-block p-3 rounded-circle bg-success bg-opacity-10 mb-3">
            <i className="bi bi-check-circle-fill text-success fs-1"></i>
          </div>
          <h2 className="fw-bold mb-1">Ride Summary</h2>
          <p className="text-muted">Thank you for riding with Queens</p>
        </div>

        <div className="receipt-details mb-4">
          <div className="d-flex justify-content-between mb-3">
            <span className="text-muted">Destination</span>
            <span className="fw-bold text-end" style={{ maxWidth: '200px' }}>{destination_location.address || 'Lagos Central'}</span>
          </div>
          <div className="d-flex justify-content-between mb-3">
            <span className="text-muted">Distance Traveled</span>
            <span className="fw-bold">{(distance / 1000).toFixed(2)} km</span>
          </div>
          <div className="d-flex justify-content-between mb-3">
            <span className="text-muted">Trip Duration</span>
            <span className="fw-bold">{Math.round(duration / 60)} mins</span>
          </div>
          
          <hr className="my-3 opacity-10" />

          <div className="d-flex justify-content-between mb-2">
             <span className="text-muted">Base Fare</span>
             <span className="fw-bold font-mono">{ride.currency_symbol || '₦'}{fare.toLocaleString()}</span>
          </div>
          
          {isRecalculated && (
            <div className="d-flex justify-content-between mb-2 text-warning">
               <span className="small">Traffic/Delay Surcharge</span>
               <span className="fw-bold font-mono small">+₦{(recalculated_fare - fare).toLocaleString()}</span>
            </div>
          )}

          <div className="d-flex justify-content-between mt-4 align-items-center">
             <span className="fs-5 fw-bold text-dark">Total Paid</span>
             <span className="display-6 fw-bold text-primary font-mono">{ride.currency_symbol || '₦'}{finalFare.toLocaleString()}</span>
          </div>
        </div>

        <div className="alert alert-primary bg-opacity-10 border-0 rounded-4 p-3 mb-4 d-flex align-items-center gap-3">
           <i className="bi bi-info-circle-fill text-primary fs-4"></i>
           <p className="small mb-0 text-muted">A copy of this receipt has been sent to your registered email address.</p>
        </div>

        <div className="row g-3">
           <div className="col-12">
              <button 
                onClick={() => { onClose(); navigate('/ride-history'); }} 
                className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-lg"
              >
                Go to Trip History
              </button>
           </div>
           <div className="col-12 text-center">
              <button 
                onClick={onClose} 
                className="btn btn-link text-muted text-decoration-none small"
              >
                Dismiss
              </button>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentSummaryView;
