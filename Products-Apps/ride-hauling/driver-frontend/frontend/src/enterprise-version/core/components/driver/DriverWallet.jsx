import { useState } from 'react';
import { FaWallet, FaArrowLeft, FaUniversity, FaMobileAlt, FaPlus, FaCheck, FaTimes, FaExchangeAlt, FaEdit, FaTrashAlt } from 'react-icons/fa';

const MOCK_TRANSACTIONS = [
  { type: 'credit', desc: 'Ride — Ikeja to VI', amount: 2400, date: 'Today, 2:30 PM', status: 'completed' },
  { type: 'debit', desc: 'Withdrawal to GTBank', amount: -5000, date: 'Today, 1:15 PM', status: 'completed' },
  { type: 'credit', desc: 'Weekly bonus', amount: 1500, date: 'Yesterday', status: 'completed' },
  { type: 'credit', desc: 'Ride — Surulere to Lekki', amount: 3100, date: 'Yesterday', status: 'completed' },
  { type: 'credit', desc: 'Ride — Oshodi to Ajah', amount: 4100, date: 'Jun 3, 2026', status: 'completed' },
  { type: 'debit', desc: 'Withdrawal to Opay', amount: -10000, date: 'Jun 2, 2026', status: 'completed' },
  { type: 'credit', desc: 'Ride — Maryland to VI', amount: 3800, date: 'Jun 2, 2026', status: 'completed' },
];

export default function DriverWallet({ onBack }) {
  const [balance] = useState(45230);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [periodTab, setPeriodTab] = useState('today');

  const [payoutMethods, setPayoutMethods] = useState([
    { id: 1, type: 'bank', name: 'GTBank', accountName: 'Brian Osh', accountNumber: '0123456789', bankName: 'GTBank', detail: '••••6789', primary: true },
    { id: 2, type: 'mobile', name: 'Opay', accountName: 'Brian Osh', phoneNumber: '07031234567', provider: 'Opay', detail: '0703••••567', primary: false },
  ]);

  const [payoutModal, setPayoutModal] = useState(null); // null | 'add' | {edit}
  const [editMethod, setEditMethod] = useState(null);
  const [payoutType, setPayoutType] = useState('bank');
  const [payoutBank, setPayoutBank] = useState('');
  const [payoutAccountName, setPayoutAccountName] = useState('');
  const [payoutAccountNumber, setPayoutAccountNumber] = useState('');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [payoutProvider, setPayoutProvider] = useState('');
  const [payoutError, setPayoutError] = useState('');

  const periodEarnings = { today: 8450, week: 45230, month: 182000 };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseInt(withdrawAmount) <= 0) return;
    if (parseInt(withdrawAmount) > balance) return;
    setWithdrawSuccess(true);
    setTimeout(() => {
      setShowWithdraw(false);
      setWithdrawSuccess(false);
      setWithdrawAmount('');
    }, 2000);
  };

  const openAddPayout = () => {
    setEditMethod(null);
    setPayoutType('bank');
    setPayoutBank('');
    setPayoutAccountName('');
    setPayoutAccountNumber('');
    setPayoutPhone('');
    setPayoutProvider('');
    setPayoutError('');
    setPayoutModal('add');
  };

  const openEditPayout = (method) => {
    setEditMethod(method);
    setPayoutType(method.type);
    setPayoutBank(method.bankName || '');
    setPayoutAccountName(method.accountName || '');
    setPayoutAccountNumber(method.accountNumber || '');
    setPayoutPhone(method.phoneNumber || '');
    setPayoutProvider(method.provider || '');
    setPayoutError('');
    setPayoutModal('edit');
  };

  const closePayoutModal = () => {
    setPayoutModal(null);
    setEditMethod(null);
    setPayoutError('');
  };

  const savePayoutMethod = () => {
    const nextId = Math.max(...payoutMethods.map(m => m.id), 0) + 1;

    if (payoutType === 'bank') {
      if (!payoutBank || !payoutAccountName || !payoutAccountNumber) {
        setPayoutError('Please fill in all bank fields');
        return;
      }
      if (payoutAccountNumber.length < 10) {
        setPayoutError('Please enter a valid account number');
        return;
      }
      const last4 = payoutAccountNumber.slice(-4);
      if (editMethod) {
        setPayoutMethods(prev => prev.map(m => m.id === editMethod.id ? {
          ...m, type: 'bank', name: payoutBank, accountName: payoutAccountName, accountNumber: payoutAccountNumber, bankName: payoutBank, detail: `••••${last4}`
        } : m));
      } else {
        setPayoutMethods(prev => [...prev, {
          id: nextId, type: 'bank', name: payoutBank, accountName: payoutAccountName, accountNumber: payoutAccountNumber, bankName: payoutBank, detail: `••••${last4}`, primary: false
        }]);
      }
    } else {
      if (!payoutPhone || !payoutProvider) {
        setPayoutError('Please fill in all mobile money fields');
        return;
      }
      if (payoutPhone.length < 10) {
        setPayoutError('Please enter a valid phone number');
        return;
      }
      const last4 = payoutPhone.slice(-4);
      if (editMethod) {
        setPayoutMethods(prev => prev.map(m => m.id === editMethod.id ? {
          ...m, type: 'mobile', name: payoutProvider, phoneNumber: payoutPhone, provider: payoutProvider, detail: `${payoutPhone.slice(0, 4)}••••${last4}`
        } : m));
      } else {
        setPayoutMethods(prev => [...prev, {
          id: nextId, type: 'mobile', name: payoutProvider, phoneNumber: payoutPhone, provider: payoutProvider, detail: `${payoutPhone.slice(0, 4)}••••${last4}`, primary: false
        }]);
      }
    }
    closePayoutModal();
  };

  const deletePayoutMethod = (id) => {
    setPayoutMethods(prev => prev.filter(m => m.id !== id));
    closePayoutModal();
  };

  const setPrimaryPayout = (id) => {
    setPayoutMethods(prev => prev.map(m => ({ ...m, primary: m.id === id })));
  };

  return (
    <div className="dms-page">
      <div className="dms-header">
        <button className="dms-back-btn" onClick={onBack}><FaArrowLeft /></button>
        <h2 className="dms-title"><FaWallet /> Wallet</h2>
      </div>

      <div className="dms-balance-card glass-card">
        <div className="dms-balance-label">Available Balance</div>
        <div className="dms-balance-amount">₦{balance.toLocaleString()}</div>
        <div className="dms-balance-change">+12% from last week</div>
        <button className="dms-btn-gold" onClick={() => { setWithdrawMethod(payoutMethods.find(m => m.primary)?.id || payoutMethods[0]?.id); setShowWithdraw(true); }}>
          <FaExchangeAlt /> Withdraw
        </button>
      </div>

      <div className="dms-period-tabs">
        {['today', 'week', 'month'].map(t => (
          <button key={t} className={`dms-period-tab ${periodTab === t ? 'active' : ''}`} onClick={() => setPeriodTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="dms-period-amount">₦{periodEarnings[periodTab].toLocaleString()}</div>

      <div className="dms-section-title">Payout Methods</div>
      <div className="dms-payout-list">
        {payoutMethods.map(m => (
          <div key={m.id} className={`dms-payout-item ${m.primary ? 'primary' : ''}`}>
            <div className="dms-payout-icon">{m.type === 'bank' ? <FaUniversity /> : <FaMobileAlt />}</div>
            <div style={{ flex: 1 }}>
              <div className="dms-payout-name">{m.name}</div>
              <div className="dms-payout-detail">{m.detail}</div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {m.primary && <FaCheck className="dms-payout-check" />}
              {!m.primary && (
                <button className="dms-payout-action" onClick={() => setPrimaryPayout(m.id)} title="Set as primary">
                  <FaCheck style={{ fontSize: '12px' }} />
                </button>
              )}
              <button className="dms-payout-action" onClick={() => openEditPayout(m)} title="Edit">
                <FaEdit style={{ fontSize: '12px' }} />
              </button>
              <button className="dms-payout-action danger" onClick={() => deletePayoutMethod(m.id)} title="Delete">
                <FaTrashAlt style={{ fontSize: '12px' }} />
              </button>
            </div>
          </div>
        ))}
        <button className="dms-payout-add" onClick={openAddPayout}><FaPlus /> Add payout method</button>
      </div>

      <div className="dms-section-title">Recent Transactions</div>
      <div className="dms-transaction-list">
        {MOCK_TRANSACTIONS.map((tx, i) => (
          <div key={i} className="dms-tx-row">
            <div className={`dms-tx-icon ${tx.type}`}>
              {tx.type === 'credit' ? <FaWallet /> : <FaExchangeAlt />}
            </div>
            <div className="dms-tx-info">
              <div className="dms-tx-desc">{tx.desc}</div>
              <div className="dms-tx-date">{tx.date}</div>
            </div>
            <div className={`dms-tx-amount ${tx.type}`}>
              {tx.type === 'credit' ? '+' : ''}{tx.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Payout Modal */}
      {payoutModal && (
        <div className="dms-overlay" onClick={closePayoutModal}>
          <div className="dms-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="dms-modal-header">
              <h3>{editMethod ? 'Edit' : 'Add'} Payout Method</h3>
              <button className="dms-modal-close" onClick={closePayoutModal}><FaTimes /></button>
            </div>
            <div className="dms-modal-body">
              <div className="dms-input-group">
                <label>Method type</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className={`dms-method-option ${payoutType === 'bank' ? 'active' : ''}`}
                    onClick={() => setPayoutType('bank')}
                    style={{ flex: 1 }}
                  >
                    <FaUniversity /> Bank account
                  </button>
                  <button
                    className={`dms-method-option ${payoutType === 'mobile' ? 'active' : ''}`}
                    onClick={() => setPayoutType('mobile')}
                    style={{ flex: 1 }}
                  >
                    <FaMobileAlt /> Mobile money
                  </button>
                </div>
              </div>

              {payoutType === 'bank' ? (
                <>
                  <div className="dms-input-group">
                    <label>Bank name</label>
                    <input className="dms-input" placeholder="e.g. GTBank" value={payoutBank} onChange={e => { setPayoutBank(e.target.value); setPayoutError(''); }} />
                  </div>
                  <div className="dms-input-group">
                    <label>Account name</label>
                    <input className="dms-input" placeholder="Full name on account" value={payoutAccountName} onChange={e => { setPayoutAccountName(e.target.value); setPayoutError(''); }} />
                  </div>
                  <div className="dms-input-group">
                    <label>Account number</label>
                    <input className="dms-input" placeholder="10-digit account number" value={payoutAccountNumber} onChange={e => { setPayoutAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setPayoutError(''); }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="dms-input-group">
                    <label>Phone number</label>
                    <input className="dms-input" placeholder="e.g. 07031234567" value={payoutPhone} onChange={e => { setPayoutPhone(e.target.value.replace(/\D/g, '').slice(0, 11)); setPayoutError(''); }} />
                  </div>
                  <div className="dms-input-group">
                    <label>Provider</label>
                    <input className="dms-input" placeholder="e.g. Opay, PalmPay" value={payoutProvider} onChange={e => { setPayoutProvider(e.target.value); setPayoutError(''); }} />
                  </div>
                </>
              )}

              {payoutError && <div style={{ fontSize: '13px', color: '#e74c3c', marginBottom: '12px' }}>{payoutError}</div>}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="dms-btn-cancel" onClick={closePayoutModal} style={{ flex: 1 }}>Cancel</button>
                <button className="dms-btn-gold dms-btn-full" onClick={savePayoutMethod} style={{ flex: 1 }}>
                  {editMethod ? 'Save changes' : 'Add method'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="dms-overlay" onClick={() => { if (!withdrawSuccess) setShowWithdraw(false); }}>
          <div className="dms-modal glass-card" onClick={e => e.stopPropagation()}>
            {withdrawSuccess ? (
              <div className="dms-withdraw-success">
                <FaCheck className="dms-success-icon" />
                <h3>Withdrawal Submitted</h3>
                <p>₦{parseInt(withdrawAmount).toLocaleString()} will be sent to your {payoutMethods.find(m => m.id === withdrawMethod)?.name || 'account'}.</p>
              </div>
            ) : (
              <>
                <div className="dms-modal-header">
                  <h3>Withdraw Funds</h3>
                  <button className="dms-modal-close" onClick={() => setShowWithdraw(false)}><FaTimes /></button>
                </div>
                <div className="dms-modal-body">
                  <div className="dms-modal-balance">Balance: ₦{balance.toLocaleString()}</div>
                  <div className="dms-input-group">
                    <label>Amount</label>
                    <input type="number" className="dms-input" placeholder="0" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
                  </div>
                  <div className="dms-input-group">
                    <label>Transfer to</label>
                    <div className="dms-method-select">
                      {payoutMethods.map(m => (
                        <button
                          key={m.id}
                          className={`dms-method-option ${withdrawMethod === m.id ? 'active' : ''}`}
                          onClick={() => setWithdrawMethod(m.id)}
                        >
                          {m.type === 'bank' ? <FaUniversity /> : <FaMobileAlt />} {m.name} {m.detail}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="dms-withdraw-fee">Fee: ₦100 • Arrives in 1-3 business days</div>
                  <button className="dms-btn-gold dms-btn-full" onClick={handleWithdraw} disabled={!withdrawAmount || parseInt(withdrawAmount) <= 0 || parseInt(withdrawAmount) > balance}>
                    Withdraw ₦{parseInt(withdrawAmount || 0).toLocaleString()}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
