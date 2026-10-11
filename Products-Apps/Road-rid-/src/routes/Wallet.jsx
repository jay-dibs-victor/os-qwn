import { useState, useEffect } from 'react';
import { FaTimes, FaChevronRight, FaPlus, FaTrashAlt, FaStar, FaGift, FaMoneyBillWave, FaCreditCard, FaWallet as FaWalletIcon, FaArrowLeft, FaCheckCircle, FaTimesCircle, FaRegClock, FaCcVisa, FaCcMastercard, FaUniversity, FaMobileAlt, FaPercentage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useUserWalletBalance, useWalletHistory, useTopUpWalletMutation } from '../core/hooks/useProfileHooks';
import { useAuthStore } from '../core/store/useAuthStore';

/* ---------- Reusable Sub-components ---------- */

function WalletRow({ label, status, statusType, onClick, icon }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '20px 0',
        borderBottom: '1px solid var(--color-border-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 150ms',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {icon && <span style={{ color: 'var(--color-gold)', fontSize: '18px', width: '24px', textAlign: 'center' }}>{icon}</span>}
        <div>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>{label}</div>
          {status && (
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{status}</div>
          )}
        </div>
      </div>
      <FaChevronRight style={{ color: 'var(--color-text-muted)', fontSize: '12px' }} />
    </div>
  );
}

function WalletModal({ title, children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-gold)',
          borderRadius: '12px',
          padding: '32px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '20px', padding: '4px' }}>
            <FaTimes />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder, hint, error }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '14px 16px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: error ? '1px solid #e74c3c' : '1px solid var(--color-border-gold)',
          borderRadius: '8px',
          color: 'var(--color-white)',
          fontSize: '15px',
          outline: 'none',
        }}
      />
      {hint && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>{hint}</div>}
      {error && <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '6px' }}>{error}</div>}
    </div>
  );
}

function StatusBadge({ text, type }) {
  const colors = {
    success: { bg: 'rgba(255,184,0,0.12)', text: 'var(--color-gold)' },
    warning: { bg: 'rgba(240,173,78,0.12)', text: '#f0ad4e' },
    muted: { bg: 'rgba(255,255,255,0.06)', text: 'var(--color-text-muted)' },
    danger: { bg: 'rgba(231,76,60,0.12)', text: '#e74c3c' },
  };
  const c = colors[type] || colors.muted;
  return (
    <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '999px', backgroundColor: c.bg, color: c.text }}>
      {text}
    </span>
  );
}

function PaymentMethodCard({ method, onSetPreferred, onRemove }) {
  const iconMap = {
    visa: <FaCcVisa style={{ fontSize: '32px' }} />,
    mastercard: <FaCcMastercard style={{ fontSize: '32px' }} />,
    bank: <FaUniversity style={{ fontSize: '24px' }} />,
    cash: <FaMoneyBillWave style={{ fontSize: '24px' }} />,
    mobile: <FaMobileAlt style={{ fontSize: '24px' }} />,
  };
  return (
    <div style={{
      padding: '16px', marginBottom: '12px',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: '8px',
      border: method.preferred ? '1px solid var(--color-gold)' : '1px solid var(--color-border-gold)',
      display: 'flex', alignItems: 'center', gap: '16px',
    }}>
      <span style={{ color: 'var(--color-gold)', width: '40px', textAlign: 'center' }}>
        {iconMap[method.icon] || <FaCreditCard style={{ fontSize: '24px' }} />}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>{method.label}</span>
          {method.preferred && <StatusBadge text="Preferred" type="success" />}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          {method.detail}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {!method.preferred && (
          <button onClick={() => onSetPreferred(method.id)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border-gold)', background: 'transparent', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
            <FaStar />
          </button>
        )}
        <button onClick={() => onRemove(method.id)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
          <FaTrashAlt />
        </button>
      </div>
    </div>
  );
}

function PromoCodeCard({ promo, onRemove }) {
  return (
    <div style={{
      padding: '16px', marginBottom: '12px',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: '8px',
      border: '1px solid var(--color-border-gold)',
      display: 'flex', alignItems: 'center', gap: '16px',
    }}>
      <span style={{ color: 'var(--color-gold)', fontSize: '24px', width: '36px', textAlign: 'center' }}>
        <FaGift />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '600' }}>{promo.code}</div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{promo.desc} · Expires {promo.expires}</div>
      </div>
      <button onClick={() => onRemove(promo.id)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
        <FaTrashAlt />
      </button>
    </div>
  );
}

function TransactionItem({ tx, onClick }) {
  const statusIcons = {
    completed: <FaCheckCircle style={{ color: 'var(--color-gold)' }} />,
    pending: <FaRegClock style={{ color: '#f0ad4e' }} />,
    failed: <FaTimesCircle style={{ color: '#e74c3c' }} />,
  };
  return (
    <div
      onClick={() => onClick(tx)}
      style={{
        padding: '16px 0', borderBottom: '1px solid var(--color-border-gold)',
        display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer',
        transition: 'background-color 150ms',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div style={{ fontSize: '18px', width: '32px', textAlign: 'center' }}>
        {tx.icon || statusIcons[tx.status]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '500' }}>{tx.description}</div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{tx.date}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: tx.amount > 0 ? 'var(--color-gold)' : 'var(--color-white)' }}>
          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 })}
        </div>
        <StatusBadge text={tx.status === 'completed' ? 'Completed' : tx.status === 'pending' ? 'Pending' : 'Failed'} type={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'danger'} />
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */

export default function Wallet() {
  const [activeModal, setActiveModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const navigate = useNavigate();

  // Real API hooks:
  const user = useAuthStore(state => state.user);
  const { data: realBalance } = useUserWalletBalance();
  const { data: realTransactions = [] } = useWalletHistory();
  const topUpMutation = useTopUpWalletMutation();

  const balance = realBalance !== undefined ? parseFloat(realBalance) : 0;
  const [topUpAmount, setTopUpAmount] = useState('');

  // Payment methods — sync to localStorage
  const [paymentMethods, setPaymentMethods] = useState(() => {
    const saved = localStorage.getItem('qos_payment_methods');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { id: 1, icon: 'visa', label: 'Visa', detail: '···· 4532 · Exp 08/27', preferred: false },
      { id: 2, icon: 'mastercard', label: 'Mastercard', detail: '···· 8712 · Exp 03/26', preferred: false },
      { id: 3, icon: 'cash', label: 'Cash', detail: 'Pay at pickup', preferred: true },
    ];
  });

  // Persist methods to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('qos_payment_methods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  // Add payment method step
  const [addMethodStep, setAddMethodStep] = useState('type'); // 'type' | 'card'

  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardError, setCardError] = useState('');

  // Promos
  const [promos, setPromos] = useState([
    { id: 1, code: 'LAGOS20', desc: '20% off your next 3 rides', expires: '30 Jun 2026' },
    { id: 2, code: 'RIDE50', desc: '50% off first ride (up to ₦1,000)', expires: '15 Jul 2026' },
  ]);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // Transaction history mapped from real API data
  const transactions = realTransactions.map(tx => ({
    id: tx._id || tx.id,
    description: tx.description || tx.reason || 'Wallet transaction',
    date: tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'Recently',
    amount: tx.amount || 0,
    status: tx.status?.toLowerCase() || 'completed',
    icon: tx.amount > 0 ? <FaMoneyBillWave /> : <FaWalletIcon />,
    receipt: tx.transaction_reference || 'REF-N/A',
    paymentMethod: tx.gateway || 'Wallet'
  }));
  const [selectedTx, setSelectedTx] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const closeModal = () => {
    setActiveModal(null);
    setAddMethodStep('type');
    setTopUpAmount('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardName('');
    setCardError('');
    setPromoInput('');
    setPromoError('');
    setSelectedTx(null);
  };

  // Top up using Paystack / Stripe multi-gateway integration
  const handleTopUp = async () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount <= 0) return;
    
    closeModal();
    showToast('Initiating payment gateway...');
    
    let lat = 6.5244;
    let lng = 3.3792;
    if ("geolocation" in navigator) {
      try {
        const position = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 3000 });
        });
        if (position) {
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        }
      } catch {}
    }

    topUpMutation.mutate({ amount, lat, lng, gateway: 'paystack' });
  };

  // Add payment method
  const detectCardType = (num) => {
    const first = num[0];
    if (first === '4') return { icon: 'visa', label: 'Visa' };
    if (first === '5') return { icon: 'mastercard', label: 'Mastercard' };
    if (num.startsWith('506') || num.startsWith('507') || num.startsWith('508')) return { icon: 'visa', label: 'Verve' };
    return { icon: 'visa', label: 'Card' };
  };

  const handleAddCard = () => {
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      setCardError('Please fill in all fields');
      return;
    }
    const last4 = cardNumber.slice(-4);
    const cardInfo = detectCardType(cardNumber);
    const nextId = Math.max(...paymentMethods.map((m) => m.id), 0) + 1;
    setPaymentMethods((prev) => [...prev, { id: nextId, icon: cardInfo.icon, label: `${cardInfo.label} ···· ${last4}`, detail: `Exp ${cardExpiry}`, preferred: false }]);
    closeModal();
    showToast('Payment method added');
  };

  const handleAddCash = () => {
    const nextId = Math.max(...paymentMethods.map((m) => m.id), 0) + 1;
    setPaymentMethods((prev) => [...prev, { id: nextId, icon: 'cash', label: 'Cash', detail: 'Pay at pickup', preferred: false }]);
    closeModal();
    showToast('Cash payment method added');
  };

  const handleAddWallet = () => {
    const nextId = Math.max(...paymentMethods.map((m) => m.id), 0) + 1;
    setPaymentMethods((prev) => [...prev, { id: nextId, icon: 'mobile', label: 'Queens OS Coin', detail: 'Pay with coin balance', preferred: false }]);
    closeModal();
    showToast('Wallet payment method added');
  };

  // Set preferred
  const handleSetPreferred = (id) => {
    setPaymentMethods((prev) => prev.map((m) => ({ ...m, preferred: m.id === id })));
    showToast('Preferred payment method updated');
  };

  // Remove payment method
  const handleRemoveMethod = (id) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
    showToast('Payment method removed');
  };

  // Apply promo
  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    if (promoInput.toUpperCase() === 'QUEENS10') {
      const nextId = Math.max(...promos.map((p) => p.id), 0) + 1;
      setPromos((prev) => [...prev, { id: nextId, code: 'QUEENS10', desc: '₦1,000 off your next ride', expires: '31 Dec 2026' }]);
      setPromoInput('');
      closeModal();
      showToast('Promo code QUEENS10 applied!');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  // Remove promo
  const handleRemovePromo = (id) => {
    setPromos((prev) => prev.filter((p) => p.id !== id));
    showToast('Promo code removed');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-black)', color: 'var(--color-white)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>
            <FaArrowLeft />
          </button>
          <h2 style={{ fontSize: '28px', fontWeight: '700' }}>Wallet</h2>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '32px' }}>Manage your payment methods and transactions</p>

        {/* ===== WALLET BALANCE CARD ===== */}
        <div style={{
          padding: '32px', marginBottom: '32px',
          backgroundColor: 'var(--color-surface-card)',
          borderRadius: '16px',
          border: '1px solid var(--color-border-gold)',
          background: 'linear-gradient(135deg, var(--color-surface-card) 0%, rgba(255,184,0,0.05) 100%)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Queens OS Coin</div>
              <div style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px' }}>
                ₦{balance.toLocaleString()}.00
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,184,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', fontSize: '22px' }}>
              <FaWalletIcon />
            </div>
          </div>
          <button
            onClick={() => setActiveModal('topUp')}
            style={{ padding: '14px 32px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}
          >
            Top up
          </button>
        </div>

        {/* ===== PAYMENT METHODS ===== */}
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Payment Methods</h3>
        {paymentMethods.map((method) => (
          <PaymentMethodCard key={method.id} method={method} onSetPreferred={handleSetPreferred} onRemove={handleRemoveMethod} />
        ))}
        <button
          onClick={() => setActiveModal('addPaymentType')}
          style={{ padding: '14px 20px', width: '100%', borderRadius: '8px', border: '1px dashed var(--color-border-gold)', background: 'transparent', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}
        >
          <FaPlus /> Add payment method
        </button>

        {/* ===== PROMOTIONS & VOUCHERS ===== */}
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Promotions & Vouchers</h3>
        {promos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border-gold)', borderRadius: '8px', marginBottom: '16px' }}>
            <FaGift style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.4 }} />
            <div style={{ fontSize: '14px' }}>No active promotions</div>
          </div>
        ) : (
          promos.map((promo) => (
            <PromoCodeCard key={promo.id} promo={promo} onRemove={handleRemovePromo} />
          ))
        )}
        <button
          onClick={() => setActiveModal('addPromo')}
          style={{ marginTop: '8px', padding: '14px 20px', width: '100%', borderRadius: '8px', border: '1px dashed var(--color-border-gold)', background: 'transparent', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}
        >
          <FaPlus /> Add promo code
        </button>

        {/* ===== RECENT TRANSACTIONS ===== */}
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Transactions</h3>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border-gold)', borderRadius: '8px' }}>
            <FaWalletIcon style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.4 }} />
            <div style={{ fontSize: '14px' }}>No transactions yet</div>
          </div>
        ) : (
          transactions.map((tx) => (
            <TransactionItem key={tx.id} tx={tx} onClick={setSelectedTx} />
          ))
        )}

        {/* ===== TOAST ===== */}
        {toastMsg && (
          <div style={{
            position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-gold)',
            borderRadius: '8px', padding: '12px 24px',
            color: 'var(--color-gold)', fontWeight: '600', fontSize: '14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 2000,
            animation: 'walletToastSlideUp 300ms ease-out',
          }}>
            {toastMsg}
          </div>
        )}
      </div>

      {/* ===== MODALS ===== */}

      {/* Top Up Modal */}
      {activeModal === 'topUp' && (
        <WalletModal title="Top up wallet" onClose={closeModal}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Amount (NGN)</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[1000, 2000, 5000, 10000, 20000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(amt.toString())}
                  style={{
                    padding: '10px 20px', borderRadius: '8px',
                    backgroundColor: parseInt(topUpAmount) === amt ? 'rgba(255,184,0,0.15)' : 'rgba(255,255,255,0.06)',
                    border: parseInt(topUpAmount) === amt ? '1px solid var(--color-gold)' : '1px solid var(--color-border-gold)',
                    color: parseInt(topUpAmount) === amt ? 'var(--color-gold)' : 'var(--color-white)',
                    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                  }}
                >
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="Or enter custom amount"
              style={{
                width: '100%', padding: '14px 16px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--color-border-gold)',
                borderRadius: '8px',
                color: 'var(--color-white)',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>
          <button
            onClick={handleTopUp}
            disabled={!topUpAmount || parseInt(topUpAmount) <= 0}
            style={{
              width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
              backgroundColor: topUpAmount && parseInt(topUpAmount) > 0 ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)',
              color: topUpAmount && parseInt(topUpAmount) > 0 ? 'var(--color-black)' : 'var(--color-text-muted)',
              fontWeight: '600', cursor: topUpAmount && parseInt(topUpAmount) > 0 ? 'pointer' : 'not-allowed', fontSize: '16px',
            }}
          >
            Add ₦{parseInt(topUpAmount) > 0 ? parseInt(topUpAmount).toLocaleString() : '0'}
          </button>
        </WalletModal>
      )}

      {/* Add Payment Method — Type Selection */}
      {activeModal === 'addPaymentType' && (
        <WalletModal title="Add payment method" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>Select the type of payment method you want to add.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleAddWallet}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--color-border-gold)', background: 'rgba(255,255,255,0.03)', color: 'var(--color-white)', cursor: 'pointer', fontSize: '15px', fontWeight: '600', textAlign: 'left', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              <span style={{ fontSize: '24px', color: 'var(--color-gold)', width: '36px', textAlign: 'center' }}><FaWalletIcon /></span>
              <div>
                <div>Wallet</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Pay with Queens OS Coin balance</div>
              </div>
            </button>
            <button
              onClick={() => { setAddMethodStep('card'); setActiveModal('addCard'); }}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--color-border-gold)', background: 'rgba(255,255,255,0.03)', color: 'var(--color-white)', cursor: 'pointer', fontSize: '15px', fontWeight: '600', textAlign: 'left', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              <span style={{ fontSize: '24px', color: 'var(--color-gold)', width: '36px', textAlign: 'center' }}><FaCreditCard /></span>
              <div>
                <div>Card</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Add debit or credit card</div>
              </div>
            </button>
            <button
              onClick={handleAddCash}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '12px', border: '1px solid var(--color-border-gold)', background: 'rgba(255,255,255,0.03)', color: 'var(--color-white)', cursor: 'pointer', fontSize: '15px', fontWeight: '600', textAlign: 'left', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              <span style={{ fontSize: '24px', color: 'var(--color-gold)', width: '36px', textAlign: 'center' }}><FaMoneyBillWave /></span>
              <div>
                <div>Cash</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Pay with cash at pickup</div>
              </div>
            </button>
          </div>
        </WalletModal>
      )}

      {/* Add Card Modal */}
      {activeModal === 'addCard' && addMethodStep === 'card' && (
        <WalletModal title="Add card" onClose={closeModal}>
          <Input label="Cardholder name" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="John Doe" />
          <Input label="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} placeholder="1234 5678 9012 3456" />
          {cardNumber.length >= 4 && (
            <div style={{ fontSize: '12px', color: 'var(--color-gold)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {detectCardType(cardNumber).label}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <Input label="Expiry" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d{0,2})/, '$1/$2'))} placeholder="MM/YY" />
            </div>
            <div style={{ flex: 1 }}>
              <Input label="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" />
            </div>
          </div>
          {cardError && <div style={{ fontSize: '13px', color: '#e74c3c', marginBottom: '16px' }}>{cardError}</div>}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border-gold)', background: 'transparent', color: 'var(--color-white)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
            <button onClick={handleAddCard} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', cursor: 'pointer', fontWeight: '600' }}>Add card</button>
          </div>
        </WalletModal>
      )}

      {/* Add Promo Modal */}
      {activeModal === 'addPromo' && (
        <WalletModal title="Add promo code" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Enter a promo code to get discounts on your rides and deliveries.
          </p>
          <Input
            label="Promo code"
            value={promoInput}
            onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
            placeholder="e.g. QUEENS10"
            hint="Try QUEENS10 for ₦1,000 off"
            error={promoError}
          />
          <button onClick={handleApplyPromo} disabled={!promoInput.trim()} style={{
            width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
            backgroundColor: promoInput.trim() ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)',
            color: promoInput.trim() ? 'var(--color-black)' : 'var(--color-text-muted)',
            fontWeight: '600', cursor: promoInput.trim() ? 'pointer' : 'not-allowed', fontSize: '16px',
          }}>
            Apply
          </button>
        </WalletModal>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <WalletModal title="Transaction details" onClose={closeModal}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '36px', color: 'var(--color-gold)', marginBottom: '12px' }}>
              {selectedTx.amount > 0 ? <FaMoneyBillWave /> : <FaWalletIcon />}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: selectedTx.amount > 0 ? 'var(--color-gold)' : 'var(--color-white)' }}>
              {selectedTx.amount > 0 ? '+' : ''}{selectedTx.amount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 })}
            </div>
            <StatusBadge text={selectedTx.status === 'completed' ? 'Completed' : selectedTx.status === 'pending' ? 'Pending' : 'Failed'} type={selectedTx.status === 'completed' ? 'success' : selectedTx.status === 'pending' ? 'warning' : 'danger'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border-gold)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Description</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedTx.description}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border-gold)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Date</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedTx.date}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border-gold)' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Payment method</span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{selectedTx.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Receipt</span>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-gold)', fontFamily: 'monospace' }}>{selectedTx.receipt}</span>
            </div>
          </div>
        </WalletModal>
      )}

      <style>{`
        @keyframes walletToastSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
