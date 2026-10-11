import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTopUpWalletMutation } from '../../../core/hooks/useProfileHooks';
import { useUIStore } from '../../../core/store/useUIStore';
import { useAuthStore } from '../../../core/store/useAuthStore';

const PRESETS = [1000, 2500, 5000, 10000];

const TopUpModal = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState(null);
  const { mutate: topUp, isPending } = useTopUpWalletMutation();
  const { addToast } = useUIStore();
  const user = useAuthStore(state => state.user);
  const activeSymbol = user?.local_wallet?.symbol || '₦';

  const handlePreset = (val) => {
    setSelected(val);
    setAmount(String(val));
  };

  const handleSubmit = () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      addToast('Please enter a valid amount', 'warning');
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          topUp({ 
            amount: parsed, 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude,
            gateway: user?.local_wallet?.code === 'USD' ? 'stripe' : 'paystack' 
          });
        },
        () => {
          // Fallback if location blocked
          topUp({ amount: parsed, gateway: 'paystack' });
        }
      );
    } else {
      topUp({ amount: parsed, gateway: 'paystack' });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        id="topup-modal-overlay"
        className="dash-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="dash-modal-card"
          initial={{ y: 40, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          {/* Header */}
          <div className="dash-modal-header">
            <div className="dash-modal-icon-wrap" style={{ background: 'linear-gradient(135deg,#FFB800,#ff8c00)' }}>
              <i className="bi bi-wallet2" style={{ fontSize: '22px', color: '#fff' }} />
            </div>
            <div>
              <h5 className="dash-modal-title">Top-Up Wallet</h5>
              <p className="dash-modal-sub">Add funds instantly to your {activeSymbol} balance</p>
            </div>
            <button className="dash-modal-close" onClick={onClose}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {/* Preset chips */}
          <div className="topup-preset-grid">
            {PRESETS.map((val) => (
              <button
                key={val}
                id={`topup-preset-${val}`}
                className={`topup-preset-chip ${selected === val ? 'active' : ''}`}
                onClick={() => handlePreset(val)}
              >
                {activeSymbol}{val.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Custom amount input */}
          <div className="topup-input-wrap">
            <span className="topup-currency">{activeSymbol}</span>
            <input
              id="topup-custom-amount"
              type="number"
              className="topup-amount-input"
              placeholder="Or enter custom amount"
              value={amount}
              min="100"
              onChange={(e) => {
                setAmount(e.target.value);
                setSelected(null);
              }}
            />
          </div>

          <p className="topup-note">
            <i className="bi bi-shield-check me-1 text-success" />
            Secured Payment · Instant credit to your wallet
          </p>

          <button
            id="topup-submit-btn"
            className="dash-btn-primary w-100"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <><span className="spinner-border spinner-border-sm me-2" /> Redirecting to payment...</>
            ) : (
              <><i className="bi bi-arrow-right-circle me-2" />Proceed to Pay {activeSymbol}{amount ? parseFloat(amount).toLocaleString() : '—'}</>
            )}
          </button>

          <button className="dash-btn-ghost w-100 mt-2" onClick={onClose}>
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TopUpModal;
