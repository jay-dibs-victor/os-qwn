import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const ReceiptModal = ({ item, symbol, onClose }) => {
  if (!item) return null;

  const isCredit = item.type === 'credit';
  const activeSymbol = symbol || '₦';

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <motion.div
        id="receipt-modal-overlay"
        className="dash-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="dash-modal-card receipt-modal-card"
          initial={{ y: 40, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          {/* Printable receipt */}
          <div id="printable-receipt">
            {/* Brand header */}
            <div className="receipt-brand-header">
              <div className="receipt-logo">
                <i className="bi bi-taxi-front-fill" style={{ fontSize: '24px', color: '#FFB800' }} />
                <span>Queens</span>
              </div>
              <span className={`receipt-badge ${isCredit ? 'credit' : 'debit'}`}>
                {isCredit ? 'Credit' : 'Debit'}
              </span>
            </div>

            {/* Amount */}
            <div className="receipt-amount-section">
              <p className="receipt-amount-label">TRANSACTION AMOUNT</p>
              <h2 className={`receipt-amount ${isCredit ? 'credit-amount' : 'debit-amount'}`}>
                {isCredit ? '+' : '-'} {activeSymbol}{parseFloat(item.amount || 0).toLocaleString()}
              </h2>
              <span className={`receipt-status-pill ${item.status === 'success' ? 'success' : 'pending'}`}>
                <i className={`bi ${item.status === 'success' ? 'bi-check-circle-fill' : 'bi-clock-fill'} me-1`} />
                {item.status || 'success'}
              </span>
            </div>

            {/* Divider */}
            <div className="receipt-dashed-line" />

            {/* Details */}
            <div className="receipt-details-grid">
              <div className="receipt-detail-row">
                <span className="receipt-detail-key">Reference</span>
                <span className="receipt-detail-val mono">{item.reference || 'N/A'}</span>
              </div>
              <div className="receipt-detail-row">
                <span className="receipt-detail-key">Date</span>
                <span className="receipt-detail-val">{moment(item.createdAt).format('DD MMM YYYY')}</span>
              </div>
              <div className="receipt-detail-row">
                <span className="receipt-detail-key">Time</span>
                <span className="receipt-detail-val">{moment(item.createdAt).format('hh:mm A')}</span>
              </div>
              <div className="receipt-detail-row">
                <span className="receipt-detail-key">Type</span>
                <span className="receipt-detail-val" style={{ textTransform: 'capitalize' }}>{item.type || 'wallet'}</span>
              </div>
              {item.description && (
                <div className="receipt-detail-row">
                  <span className="receipt-detail-key">Description</span>
                  <span className="receipt-detail-val">{item.description}</span>
                </div>
              )}
              {item.planId && (
                <div className="receipt-detail-row">
                  <span className="receipt-detail-key">Plan</span>
                  <span className="receipt-detail-val mono">{item.planId}</span>
                </div>
              )}
            </div>

            <div className="receipt-dashed-line" />
            <p className="receipt-footer-note">
              <i className="bi bi-shield-check me-1 text-success" />
              Transaction secured by Queens Payments
            </p>
          </div>

          {/* Action buttons (hidden in print) */}
          <div className="receipt-actions no-print">
            <button id="receipt-print-btn" className="dash-btn-primary" onClick={handlePrint}>
              <i className="bi bi-printer me-2" />Download / Print
            </button>
            <button className="dash-btn-ghost" onClick={onClose}>Close</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReceiptModal;
