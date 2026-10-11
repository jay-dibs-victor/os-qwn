import { useState, useEffect, useRef } from 'react';

const API = 'http://localhost:5050/api/payments';

// ─── Provider metadata ─────────────────────────────────────────────────────
const PROVIDERS = [
  {
    id: 'paystack',
    label: 'Paystack',
    icon: '🟢',
    currency: 'NGN',
    category: 'card',
    description: 'Pay with card via Paystack. Supports Verve, Visa, Mastercard.',
    tag: 'Redirect',
  },
  {
    id: 'verve',
    label: 'Verve Card',
    icon: '🔵',
    currency: 'NGN',
    category: 'card',
    description: 'Nigerian Verve debit card — routed via Paystack.',
    tag: 'Card',
  },
  {
    id: 'mastercard',
    label: 'Mastercard',
    icon: '🔴',
    currency: 'USD',
    category: 'card',
    description: 'Mastercard payments processed by Stripe.',
    tag: 'Card',
  },
  {
    id: 'stripe',
    label: 'Stripe',
    icon: '💳',
    currency: 'USD',
    category: 'card',
    description: 'Direct Stripe card payment. VISA, Mastercard, Amex accepted.',
    tag: 'Card',
  },
  {
    id: 'moniepoint',
    label: 'Moniepoint (Monnify)',
    icon: '🏦',
    currency: 'NGN',
    category: 'bank',
    description: 'Pay via bank transfer or card using Moniepoint/Monnify checkout.',
    tag: 'Redirect',
  },
  {
    id: 'opay',
    label: 'OPay',
    icon: '🟡',
    currency: 'NGN',
    category: 'wallet',
    description: 'Pay with OPay cashier — card, USSD, bank transfer.',
    tag: 'Redirect',
  },
  {
    id: 'kuda',
    label: 'Kuda Bank',
    icon: '💚',
    currency: 'NGN',
    category: 'bank',
    description: 'Pay via bank transfer to a virtual Kuda account.',
    tag: 'Transfer',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    icon: '🔷',
    currency: 'USD',
    category: 'wallet',
    description: 'Pay in USD with your PayPal account.',
    tag: 'Redirect',
  },
  {
    id: 'alipay',
    label: 'Alipay+',
    icon: '🀄',
    currency: 'USD',
    category: 'wallet',
    description: 'Alipay+ global cross-border payments via QR or redirect.',
    tag: 'QR / Redirect',
  },
  {
    id: 'googlepay',
    label: 'Google Pay',
    icon: '🔵',
    currency: 'USD',
    category: 'digital',
    description: 'Fast checkout using your Google Pay wallet.',
    tag: 'Wallet',
  },
  {
    id: 'applepay',
    label: 'Apple Pay',
    icon: '🍎',
    currency: 'USD',
    category: 'digital',
    description: 'Pay instantly with Apple Pay — Face ID / Touch ID.',
    tag: 'Biometric',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Methods' },
  { id: 'card', label: '💳 Card' },
  { id: 'bank', label: '🏦 Bank Transfer' },
  { id: 'wallet', label: '👛 Wallet' },
  { id: 'digital', label: '📱 Digital Wallet' },
];

const TAG_COLORS = {
  Redirect: '#6366f1',
  Card: '#10b981',
  Transfer: '#f59e0b',
  Wallet: '#3b82f6',
  'QR / Redirect': '#ef4444',
  Biometric: '#8b5cf6',
};

export default function CheckoutForm({ plan, user, onClose, onSuccess }) {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const filteredProviders =
    activeCategory === 'all'
      ? PROVIDERS
      : PROVIDERS.filter((p) => p.category === activeCategory);

  const displayAmount = (provider) => {
    if (!plan) return '';
    const p = PROVIDERS.find((pr) => pr.id === provider);
    if (p?.currency === 'USD') return `$${plan.usdAmount}`;
    return `₦${plan.amount?.toLocaleString()}`;
  };

  const startPolling = (reference, provider, maxAttempts = 10) => {
    let attempts = 0;
    pollingRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(
          `${API}/verify/${encodeURIComponent(reference)}?provider=${provider}`,
        );
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          clearInterval(pollingRef.current);
          setResult({ success: true, reference, data });
          setShowModal(false);
          onSuccess?.({ reference, provider, plan });
        } else if (data.status === 'FAILED' || attempts >= maxAttempts) {
          clearInterval(pollingRef.current);
          if (data.status === 'FAILED') {
            setError('Payment failed. Please try again.');
          } else {
            setResult({ pending: true, reference });
          }
          setShowModal(false);
        }
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(pollingRef.current);
          setShowModal(false);
        }
      }
    }, 3000);
  };

  const handlePay = async () => {
    if (!selectedProvider || !plan) return;
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API}/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.username || 'guest_user',
          planId: plan.id,
          provider: selectedProvider,
          callbackUrl: `${window.location.origin}/payment/callback`,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Initialization failed');

      const { checkoutUrl, extraData, reference } = data;

      // Handle provider-specific flows
      if (selectedProvider === 'kuda') {
        // Kuda: show bank transfer details modal
        setModalData({ type: 'bank_transfer', reference, extraData });
        setShowModal(true);
        startPolling(reference, selectedProvider);
      } else if (selectedProvider === 'alipay') {
        // Alipay+: show QR code or redirect
        if (extraData?.qrCodeContent) {
          setModalData({ type: 'qr', reference, extraData, checkoutUrl });
          setShowModal(true);
          startPolling(reference, selectedProvider);
        } else if (checkoutUrl) {
          window.open(checkoutUrl, '_blank');
          setModalData({ type: 'redirect_pending', reference, checkoutUrl });
          setShowModal(true);
          startPolling(reference, selectedProvider);
        }
      } else if (selectedProvider === 'googlepay') {
        // Google Pay: trigger native browser API (simulated here)
        setModalData({ type: 'googlepay', reference, extraData, amount: plan.usdAmount });
        setShowModal(true);
      } else if (selectedProvider === 'applepay') {
        // Apple Pay: trigger native Apple Pay session
        setModalData({ type: 'applepay', reference, extraData, amount: plan.usdAmount });
        setShowModal(true);
      } else if (selectedProvider === 'stripe' || selectedProvider === 'mastercard') {
        // Stripe: use clientSecret with Stripe.js (show info modal)
        setModalData({ type: 'stripe', reference, extraData, checkoutUrl });
        setShowModal(true);
      } else if (checkoutUrl) {
        // Redirect-based providers: Paystack, OPay, Moniepoint, PayPal, Verve
        window.open(checkoutUrl, '_blank');
        setModalData({ type: 'redirect_pending', reference, checkoutUrl });
        setShowModal(true);
        startPolling(reference, selectedProvider);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGooglePaySimulate = async () => {
    if (!modalData) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/googlepay/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: modalData.reference,
          token: `gp_token_${Date.now()}`,
          username: user?.username || 'guest_user',
          planId: plan.id,
        }),
      });
      const data = await res.json();
      setShowModal(false);
      if (data.status === 'SUCCESS') {
        setResult({ success: true, reference: modalData.reference, data });
        onSuccess?.({ reference: modalData.reference, provider: 'googlepay', plan });
      } else {
        setError('Google Pay payment could not be completed.');
      }
    } catch (err) {
      setError(err.message);
      setShowModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplePaySimulate = async () => {
    if (!modalData) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/applepay/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: modalData.reference,
          token: { token: `ap_token_${Date.now()}`, paymentData: {} },
          username: user?.username || 'guest_user',
          planId: plan.id,
        }),
      });
      const data = await res.json();
      setShowModal(false);
      if (data.status === 'SUCCESS') {
        setResult({ success: true, reference: modalData.reference, data });
        onSuccess?.({ reference: modalData.reference, provider: 'applepay', plan });
      } else {
        setError('Apple Pay payment could not be completed.');
      }
    } catch (err) {
      setError(err.message);
      setShowModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const providerInfo = PROVIDERS.find((p) => p.id === selectedProvider);

  return (
    <div style={styles.overlay}>
      <div style={styles.drawer}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <div style={styles.headerTitle}>Choose Payment Method</div>
            {plan && (
              <div style={styles.headerSubtitle}>
                {plan.name} — {providerInfo ? displayAmount(selectedProvider) : `₦${plan.amount?.toLocaleString()} / $${plan.usdAmount}`}
              </div>
            )}
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Category Filters */}
        <div style={styles.filterRow}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              style={{
                ...styles.filterChip,
                ...(activeCategory === cat.id ? styles.filterChipActive : {}),
              }}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Provider Grid */}
        <div style={styles.providerGrid}>
          {filteredProviders.map((provider) => (
            <button
              key={provider.id}
              style={{
                ...styles.providerCard,
                ...(selectedProvider === provider.id ? styles.providerCardSelected : {}),
              }}
              onClick={() => setSelectedProvider(provider.id)}
            >
              <div style={styles.providerCardTop}>
                <span style={styles.providerIcon}>{provider.icon}</span>
                <span
                  style={{
                    ...styles.providerTag,
                    background: TAG_COLORS[provider.tag] || '#6366f1',
                  }}
                >
                  {provider.tag}
                </span>
              </div>
              <div style={styles.providerName}>{provider.label}</div>
              <div style={styles.providerDesc}>{provider.description}</div>
              <div style={styles.providerCurrency}>{provider.currency}</div>
              {selectedProvider === provider.id && (
                <div style={styles.selectedCheck}>✓</div>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBanner}>
            ⚠️ {error}
          </div>
        )}

        {/* Success */}
        {result?.success && (
          <div style={styles.successBanner}>
            ✅ Payment successful! Reference: <strong>{result.reference}</strong>
          </div>
        )}
        {result?.pending && (
          <div style={styles.pendingBanner}>
            ⏳ Payment pending. Reference: <strong>{result.reference}</strong> — we'll notify you once confirmed.
          </div>
        )}

        {/* Pay Button */}
        {!result?.success && (
          <div style={styles.footer}>
            {selectedProvider && providerInfo && (
              <div style={styles.selectedSummary}>
                <span>{providerInfo.icon} {providerInfo.label}</span>
                <span style={styles.amountBadge}>{displayAmount(selectedProvider)}</span>
              </div>
            )}
            <button
              style={{
                ...styles.payBtn,
                ...((!selectedProvider || isLoading) ? styles.payBtnDisabled : {}),
              }}
              onClick={handlePay}
              disabled={!selectedProvider || isLoading}
            >
              {isLoading ? (
                <span style={styles.spinner}>⟳ Processing…</span>
              ) : selectedProvider ? (
                `Pay with ${providerInfo?.label}`
              ) : (
                'Select a payment method'
              )}
            </button>
          </div>
        )}
      </div>

      {/* ─── Modals ────────────────────────────────────────────────────── */}
      {showModal && modalData && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            {/* Bank Transfer — Kuda */}
            {modalData.type === 'bank_transfer' && (
              <>
                <div style={styles.modalIcon}>🏦</div>
                <h3 style={styles.modalTitle}>Transfer to Kuda Virtual Account</h3>
                <p style={styles.modalSubtitle}>
                  Send exactly <strong>{displayAmount('kuda')}</strong> to the account below.
                  Your subscription activates automatically once payment is confirmed.
                </p>
                <div style={styles.bankDetails}>
                  {[
                    ['Bank', modalData.extraData?.kudaBankName || 'Kuda Microfinance Bank'],
                    ['Account Number', modalData.extraData?.kudaAccountNumber || '9012345678'],
                    ['Account Name', modalData.extraData?.kudaAccountName || 'Taxi Booking App'],
                    ['Amount', displayAmount('kuda')],
                    ['Reference', modalData.reference],
                    ['Expires', modalData.extraData?.expiryDate ? new Date(modalData.extraData.expiryDate).toLocaleTimeString() : '60 minutes'],
                  ].map(([label, value]) => (
                    <div key={label} style={styles.bankRow}>
                      <span style={styles.bankLabel}>{label}</span>
                      <span
                        style={styles.bankValue}
                        onClick={() => navigator.clipboard?.writeText(String(value))}
                        title="Click to copy"
                      >
                        {value} <span style={styles.copyHint}>📋</span>
                      </span>
                    </div>
                  ))}
                </div>
                <div style={styles.pollingNote}>
                  <div style={styles.pollingDot} /> Waiting for payment confirmation…
                </div>
                <button style={styles.modalClose} onClick={() => { clearInterval(pollingRef.current); setShowModal(false); }}>
                  Cancel
                </button>
              </>
            )}

            {/* QR Code — Alipay+ */}
            {modalData.type === 'qr' && (
              <>
                <div style={styles.modalIcon}>🀄</div>
                <h3 style={styles.modalTitle}>Scan with Alipay+</h3>
                <p style={styles.modalSubtitle}>
                  Open your Alipay app and scan the QR code to pay <strong>{displayAmount('alipay')}</strong>.
                </p>
                <div style={styles.qrBox}>
                  {/* QR rendered as a styled placeholder — in production use qrcode.react */}
                  <div style={styles.qrPlaceholder}>
                    <div style={styles.qrGrid}>
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            ...styles.qrCell,
                            background: [0,2,6,8,14,18,21,22,23,27,28,30,35,36,40,42,43,44,48].includes(i) ? '#1a1a2e' : 'transparent',
                          }}
                        />
                      ))}
                    </div>
                    <div style={styles.qrLabel}>
                      {modalData.extraData?.qrCodeContent?.slice(0, 20)}…
                    </div>
                  </div>
                </div>
                {modalData.checkoutUrl && (
                  <a href={modalData.checkoutUrl} target="_blank" rel="noreferrer" style={styles.openLinkBtn}>
                    Or open Alipay+ page →
                  </a>
                )}
                <div style={styles.pollingNote}>
                  <div style={styles.pollingDot} /> Scanning for payment…
                </div>
                <button style={styles.modalClose} onClick={() => { clearInterval(pollingRef.current); setShowModal(false); }}>
                  Cancel
                </button>
              </>
            )}

            {/* Google Pay */}
            {modalData.type === 'googlepay' && (
              <>
                <div style={styles.modalIcon}>🔵</div>
                <h3 style={styles.modalTitle}>Google Pay</h3>
                <p style={styles.modalSubtitle}>
                  Confirm payment of <strong>${plan?.usdAmount}</strong> using your Google Pay wallet.
                </p>
                <div style={styles.digitalWalletCard}>
                  <div style={styles.walletLogo}>G Pay</div>
                  <div style={styles.walletDetails}>
                    <div style={styles.walletAmount}>${plan?.usdAmount} USD</div>
                    <div style={styles.walletPlan}>{plan?.name}</div>
                  </div>
                </div>
                <button
                  style={{ ...styles.payBtn, marginTop: '1.5rem' }}
                  onClick={handleGooglePaySimulate}
                  disabled={isLoading}
                >
                  {isLoading ? '⟳ Processing…' : '✓ Confirm with Google Pay'}
                </button>
                <button style={styles.modalClose} onClick={() => setShowModal(false)}>Cancel</button>
              </>
            )}

            {/* Apple Pay */}
            {modalData.type === 'applepay' && (
              <>
                <div style={styles.modalIcon}>🍎</div>
                <h3 style={styles.modalTitle}>Apple Pay</h3>
                <p style={styles.modalSubtitle}>
                  Authenticate with Face ID / Touch ID to pay <strong>${plan?.usdAmount}</strong>.
                </p>
                <div style={styles.digitalWalletCard}>
                  <div style={{ ...styles.walletLogo, background: '#1a1a1a' }}>  Pay</div>
                  <div style={styles.walletDetails}>
                    <div style={styles.walletAmount}>${plan?.usdAmount} USD</div>
                    <div style={styles.walletPlan}>{plan?.name}</div>
                  </div>
                </div>
                <div style={styles.biometricRing}>
                  <div style={styles.biometricIcon}>👆</div>
                </div>
                <button
                  style={{ ...styles.payBtn, marginTop: '1rem', background: 'linear-gradient(135deg, #1a1a1a, #444)' }}
                  onClick={handleApplePaySimulate}
                  disabled={isLoading}
                >
                  {isLoading ? '⟳ Authenticating…' : ' Pay — Touch ID / Face ID'}
                </button>
                <button style={styles.modalClose} onClick={() => setShowModal(false)}>Cancel</button>
              </>
            )}

            {/* Stripe Payment Intent Info */}
            {modalData.type === 'stripe' && (
              <>
                <div style={styles.modalIcon}>💳</div>
                <h3 style={styles.modalTitle}>Stripe Card Payment</h3>
                <p style={styles.modalSubtitle}>
                  A Payment Intent has been created. Integrate Stripe.js on your checkout page
                  using the <code>clientSecret</code> below to render the card form.
                </p>
                <div style={styles.stripeInfo}>
                  <div style={styles.stripeRow}>
                    <span>Reference</span>
                    <code>{modalData.reference}</code>
                  </div>
                  <div style={styles.stripeRow}>
                    <span>Client Secret</span>
                    <code style={{ fontSize: '0.7rem' }}>
                      {modalData.extraData?.clientSecret?.slice(0, 30)}…
                    </code>
                  </div>
                  <div style={styles.stripeRow}>
                    <span>Amount</span>
                    <code>${plan?.usdAmount} USD</code>
                  </div>
                </div>
                <button style={styles.modalClose} onClick={() => setShowModal(false)}>Close</button>
              </>
            )}

            {/* Redirect-based pending */}
            {modalData.type === 'redirect_pending' && (
              <>
                <div style={styles.modalIcon}>🔄</div>
                <h3 style={styles.modalTitle}>Complete Payment in New Tab</h3>
                <p style={styles.modalSubtitle}>
                  A new tab has opened with the payment page. Complete your payment there
                  and return here — we'll update your status automatically.
                </p>
                <div style={styles.pollingNote}>
                  <div style={styles.pollingDot} /> Checking payment status every 3 seconds…
                </div>
                <a href={modalData.checkoutUrl} target="_blank" rel="noreferrer" style={styles.openLinkBtn}>
                  Reopen Payment Page →
                </a>
                <button
                  style={styles.modalClose}
                  onClick={() => { clearInterval(pollingRef.current); setShowModal(false); }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex', justifyContent: 'flex-end',
  },
  drawer: {
    width: '520px', maxWidth: '100vw',
    background: 'linear-gradient(180deg, #0f0f1a 0%, #13131f 100%)',
    display: 'flex', flexDirection: 'column',
    height: '100vh', overflowY: 'auto',
    borderLeft: '1px solid rgba(255,255,255,0.08)',
  },
  header: {
    padding: '1.5rem 1.5rem 1rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
  },
  headerTitle: {
    color: '#fff', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.01em',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginTop: '0.2rem',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.1)', border: 'none',
    color: '#fff', cursor: 'pointer', borderRadius: '8px',
    width: '32px', height: '32px', fontSize: '1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  filterRow: {
    display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
    padding: '1rem 1.5rem 0.5rem',
  },
  filterChip: {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px', color: 'rgba(255,255,255,0.6)',
    padding: '0.3rem 0.85rem', cursor: 'pointer', fontSize: '0.78rem',
    fontWeight: 500, transition: 'all 0.2s',
  },
  filterChipActive: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: '1px solid transparent', color: '#fff',
  },
  providerGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem', padding: '1rem 1.5rem',
    flex: 1,
  },
  providerCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px', padding: '1rem',
    cursor: 'pointer', textAlign: 'left',
    transition: 'all 0.2s', position: 'relative',
    color: '#fff',
  },
  providerCardSelected: {
    border: '1px solid #6366f1',
    background: 'rgba(99,102,241,0.12)',
    boxShadow: '0 0 0 2px rgba(99,102,241,0.3)',
  },
  providerCardTop: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  providerIcon: {
    fontSize: '1.6rem',
  },
  providerTag: {
    fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.05em', padding: '2px 7px', borderRadius: '20px',
    color: '#fff',
  },
  providerName: {
    fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem',
    color: '#e8e8ff',
  },
  providerDesc: {
    fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.4, marginBottom: '0.5rem',
  },
  providerCurrency: {
    fontSize: '0.68rem', fontWeight: 700,
    color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em',
  },
  selectedCheck: {
    position: 'absolute', bottom: '0.75rem', right: '0.75rem',
    background: '#6366f1', color: '#fff',
    width: '20px', height: '20px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.7rem', fontWeight: 700,
  },
  errorBanner: {
    margin: '0 1.5rem 0.5rem',
    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px', padding: '0.75rem 1rem',
    color: '#fca5a5', fontSize: '0.85rem',
  },
  successBanner: {
    margin: '0 1.5rem 0.5rem',
    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '10px', padding: '0.75rem 1rem',
    color: '#6ee7b7', fontSize: '0.85rem',
  },
  pendingBanner: {
    margin: '0 1.5rem 0.5rem',
    background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
    borderRadius: '10px', padding: '0.75rem 1rem',
    color: '#fcd34d', fontSize: '0.85rem',
  },
  footer: {
    padding: '1rem 1.5rem 1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  selectedSummary: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem',
  },
  amountBadge: {
    background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
    padding: '2px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem',
  },
  payBtn: {
    width: '100%', padding: '1rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', borderRadius: '12px',
    color: '#fff', fontWeight: 700, fontSize: '1rem',
    cursor: 'pointer', transition: 'all 0.2s',
    letterSpacing: '-0.01em',
  },
  payBtnDisabled: {
    background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)',
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block', animation: 'spin 1s linear infinite',
  },
  // ── Modal Styles ──
  modalOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)',
    zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: 'linear-gradient(180deg, #13131f 0%, #0f0f1a 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px', padding: '2rem',
    width: '400px', maxWidth: '90vw',
    textAlign: 'center', color: '#fff',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  },
  modalIcon: { fontSize: '3rem', marginBottom: '0.5rem' },
  modalTitle: {
    fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem', color: '#e8e8ff',
  },
  modalSubtitle: {
    color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem',
    lineHeight: 1.5, marginBottom: '1.25rem',
  },
  bankDetails: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '1rem',
    textAlign: 'left', marginBottom: '1rem',
  },
  bankRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  bankLabel: {
    color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500,
  },
  bankValue: {
    color: '#e8e8ff', fontWeight: 600, fontSize: '0.85rem',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
  },
  copyHint: { fontSize: '0.7rem', opacity: 0.5 },
  pollingNote: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem',
    marginBottom: '1rem',
  },
  pollingDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#10b981',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  qrBox: {
    display: 'flex', justifyContent: 'center', marginBottom: '1rem',
  },
  qrPlaceholder: {
    background: '#fff', padding: '1.25rem', borderRadius: '12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
  },
  qrGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(7, 24px)',
    gap: '2px',
  },
  qrCell: { width: '24px', height: '24px', borderRadius: '2px' },
  qrLabel: {
    fontSize: '0.65rem', color: '#888', fontFamily: 'monospace',
    maxWidth: '168px', textAlign: 'center', wordBreak: 'break-all',
  },
  openLinkBtn: {
    display: 'block', textAlign: 'center',
    color: '#a5b4fc', fontSize: '0.85rem', textDecoration: 'none',
    marginBottom: '1rem', fontWeight: 600,
  },
  digitalWalletCard: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '1rem',
    marginBottom: '0.5rem',
  },
  walletLogo: {
    background: '#4285F4', color: '#fff', fontWeight: 900,
    fontSize: '1rem', padding: '0.75rem 1rem', borderRadius: '10px',
    letterSpacing: '-0.05em',
  },
  walletDetails: { textAlign: 'left' },
  walletAmount: { fontWeight: 700, fontSize: '1.1rem', color: '#e8e8ff' },
  walletPlan: { color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' },
  biometricRing: {
    width: '72px', height: '72px', borderRadius: '50%',
    border: '3px solid rgba(99,102,241,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '1.25rem auto 0.5rem',
    boxShadow: '0 0 30px rgba(99,102,241,0.3)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  biometricIcon: { fontSize: '2rem' },
  stripeInfo: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px', padding: '1rem',
    textAlign: 'left', marginBottom: '1rem',
  },
  stripeRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
    fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)',
  },
  modalClose: {
    background: 'rgba(255,255,255,0.08)', border: 'none',
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
    borderRadius: '8px', padding: '0.5rem 1.5rem',
    marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 500,
    width: '100%',
  },
};
