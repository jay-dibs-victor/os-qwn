import { useState, useRef, useEffect } from 'react';
import { FaTimes, FaChevronRight, FaSearch, FaCar, FaCreditCard, FaUserShield, FaShieldAlt, FaBox, FaGift, FaCommentDots, FaEnvelope, FaPhoneAlt, FaExclamationTriangle, FaCheckCircle, FaRegClock, FaArrowLeft, FaRobot, FaPaperPlane, FaHeadset, FaTicketAlt, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/* ============================================================
   FAQ DATA
   ============================================================ */
const FAQ_DATA = {
  ride: {
    title: 'Ride Issues',
    icon: <FaCar />,
    questions: [
      { q: 'How do I request a ride?', a: 'Open the app, enter your pickup and dropoff locations, select a ride option, and tap "Request". Your driver will be matched automatically.' },
      { q: 'How can I cancel a ride?', a: 'Go to your active trip in the app and tap "Cancel". Cancellation fees may apply depending on how long you wait.' },
      { q: 'What if my driver doesn\'t show up?', a: 'Wait at least 5 minutes past the estimated arrival, then cancel the trip and report "Driver didn\'t show" to avoid fees.' },
      { q: 'How are fares calculated?', a: 'Fares are based on distance, time, demand (surge pricing), and the ride type you selected.' },
      { q: 'Can I request a ride for someone else?', a: 'Yes! You can book a ride for a friend or family member by entering their destination and selecting "Ride for someone else".' },
    ],
  },
  payment: {
    title: 'Payment & Pricing',
    icon: <FaCreditCard />,
    questions: [
      { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, cash, and Queens OS Coin. You can add or change your payment method in the Wallet section.' },
      { q: 'Why was I charged more than the estimate?', a: 'The estimate is an approximation. The final fare may differ due to actual route distance, time, tolls, or dynamic pricing.' },
      { q: 'How do I get a refund?', a: 'Go to your trip history, select the trip, and tap "Report an issue". Our support team will review and process refunds within 5-7 business days.' },
      { q: 'Is there a cancellation fee?', a: 'Yes, if your driver has already started heading to you, a cancellation fee of ₦200-₦500 may apply based on distance traveled.' },
    ],
  },
  account: {
    title: 'Account & Login',
    icon: <FaUserShield />,
    questions: [
      { q: 'How do I reset my password?', a: 'On the login screen, tap "Forgot password". Enter your email and we\'ll send you a reset link.' },
      { q: 'How do I delete my account?', a: 'Go to Account > Security > Delete Account. Follow the confirmation steps. Your data will be permanently deleted after 30 days.' },
      { q: 'Can I have multiple profiles?', a: 'Yes, you can switch between rider and driver profiles from the same account.' },
      { q: 'How do I update my phone number?', a: 'Go to Account > Personal Info and tap the phone number field to edit it.' },
    ],
  },
  safety: {
    title: 'Safety & Trust',
    icon: <FaShieldAlt />,
    questions: [
      { q: 'How does Queens OS ensure driver safety?', a: 'All drivers undergo background checks, vehicle inspections, and identity verification before joining the platform.' },
      { q: 'What is the SOS feature?', a: 'The SOS button in the app connects you directly to emergency services and shares your real-time location with your emergency contacts.' },
      { q: 'Can I share my trip with someone?', a: 'Yes! Tap "Share Status" during a ride to share your real-time location and trip details with trusted contacts.' },
      { q: 'How do I report a safety incident?', a: 'Immediately tap the SOS button, then report the incident through the app or contact our 24/7 safety team.' },
    ],
  },
  courier: {
    title: 'Delivery / Courier',
    icon: <FaBox />,
    questions: [
      { q: 'How do I send a package?', a: 'Select "Courier" from the home screen, enter pickup and dropoff addresses, package details, and confirm your order.' },
      { q: 'What items can I send?', a: 'Documents, food, electronics, clothing, and most household items. Restricted items include hazardous materials, perishables (unless insulated), and valuables over ₦500,000.' },
      { q: 'How do I track my delivery?', a: 'You\'ll receive real-time updates and a live map showing your delivery driver\'s location throughout the journey.' },
      { q: 'What if my package is damaged?', a: 'Report damage within 24 hours of delivery through the app. Our team will investigate and provide compensation coverage.' },
    ],
  },
  promo: {
    title: 'Promotions & Credits',
    icon: <FaGift />,
    questions: [
      { q: 'How do I apply a promo code?', a: 'Go to Wallet > Promotions & Vouchers > Add promo code. Enter your code and tap "Apply".' },
      { q: 'Why isn\'t my promo code working?', a: 'Promo codes have expiry dates, usage limits, and geographic restrictions. Check the terms or try entering it without spaces.' },
      { q: 'Can I transfer my promo credit?', a: 'No, promo credits are non-transferable and can only be used on the account they were applied to.' },
      { q: 'Do promo codes expire?', a: 'Yes, all promo codes have an expiration date. Check the Promotions section in your Wallet to see expiry dates.' },
    ],
  },
};

const SAMPLE_TICKETS = [
  { id: 'TKT-001', issue: 'Driver did not show up', category: 'Ride Issues', status: 'open', date: '2 Jun 2026', messages: [{ from: 'user', text: 'My driver didn\'t show up and I was charged a cancellation fee.', time: '2 Jun 2026, 14:30' }, { from: 'support', text: 'Thank you for reporting this. We\'re reviewing your trip and will get back to you within 24 hours.', time: '2 Jun 2026, 14:45' }] },
  { id: 'TKT-002', issue: 'Refund request — overcharged', category: 'Payment & Pricing', status: 'in-progress', date: '1 Jun 2026', messages: [{ from: 'user', text: 'I was charged ₦4,500 but the estimate was ₦2,800.', time: '1 Jun 2026, 10:00' }, { from: 'support', text: 'We\'ve reviewed your trip and found a discrepancy. A partial refund of ₦1,700 is being processed.', time: '1 Jun 2026, 11:20' }, { from: 'user', text: 'Thank you, when will it reflect?', time: '1 Jun 2026, 11:30' }, { from: 'support', text: 'Refunds typically take 3-5 business days to appear in your account.', time: '1 Jun 2026, 11:35' }] },
  { id: 'TKT-003', issue: 'Lost item in vehicle', category: 'Ride Issues', status: 'resolved', date: '28 May 2026', messages: [{ from: 'user', text: 'I left my phone charger in the car.', time: '28 May 2026, 19:00' }, { from: 'support', text: 'We\'ve contacted your driver. They confirmed finding the item and will return it.', time: '28 May 2026, 20:00' }, { from: 'user', text: 'Got it back! Thank you.', time: '29 May 2026, 09:00' }] },
];

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function SupportModal({ title, children, onClose, wide }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-gold)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: wide ? '560px' : '480px', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '20px', padding: '4px' }}><FaTimes /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder, hint, error, multiline, rows = 4 }) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>{label}</label>}
      <Tag
        type={multiline ? undefined : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={multiline ? rows : undefined}
        style={{
          width: '100%', padding: '14px 16px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: error ? '1px solid #e74c3c' : '1px solid var(--color-border-gold)',
          borderRadius: '8px',
          color: 'var(--color-white)',
          fontSize: '15px',
          outline: 'none',
          fontFamily: 'inherit',
          resize: multiline ? 'vertical' : 'none',
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
    'in-progress': { bg: 'rgba(52,152,219,0.12)', text: '#3498db' },
  };
  const c = colors[type] || colors.muted;
  return <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '999px', backgroundColor: c.bg, color: c.text }}>{text}</span>;
}

function CategoryCard({ icon, title, desc, onClick }) {
  return (
    <div onClick={onClick} style={{ padding: '24px', backgroundColor: 'var(--color-surface-card)', borderRadius: '12px', border: '1px solid var(--color-border-gold)', cursor: 'pointer', transition: 'all 150ms', display: 'flex', flexDirection: 'column', gap: '12px' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-gold)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-gold)'}
    >
      <span style={{ fontSize: '24px', color: 'var(--color-gold)' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{desc}</div>
      </div>
    </div>
  );
}

function FaqAccordion({ questions, onContact }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div>
      {questions.map((item, i) => (
        <div key={i} style={{ borderBottom: '1px solid var(--color-border-gold)' }}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            style={{ width: '100%', padding: '18px 0', background: 'transparent', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontSize: '15px', fontWeight: '500', color: openIndex === i ? 'var(--color-gold)' : 'var(--color-white)', flex: 1 }}>{item.q}</span>
            <FaChevronDown style={{ color: 'var(--color-text-muted)', fontSize: '12px', transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms', flexShrink: 0, marginLeft: '12px' }} />
          </button>
          {openIndex === i && (
            <div style={{ padding: '0 0 18px', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
      <button onClick={onContact} style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--color-border-gold)', background: 'transparent', color: 'var(--color-gold)', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <FaHeadset /> Still need help? Contact support
      </button>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.from === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
      <div style={{
        maxWidth: '80%', padding: '12px 16px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        backgroundColor: isUser ? 'var(--color-gold)' : 'rgba(255,255,255,0.06)',
        color: isUser ? 'var(--color-black)' : 'var(--color-white)',
        fontSize: '14px', lineHeight: '1.5',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          {!isUser && <FaRobot style={{ fontSize: '12px', color: 'var(--color-gold)' }} />}
          <span style={{ fontSize: '11px', fontWeight: '600', opacity: 0.7 }}>{isUser ? 'You' : 'Queens OS Support'}</span>
        </div>
        {msg.text}
        <div style={{ fontSize: '10px', color: isUser ? 'rgba(0,0,0,0.5)' : 'var(--color-text-muted)', marginTop: '6px', textAlign: 'right' }}>{msg.time}</div>
      </div>
    </div>
  );
}

function TicketItem({ ticket, onClick }) {
  return (
    <div onClick={() => onClick(ticket)} style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--color-border-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px', transition: 'border-color 150ms' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-gold)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-gold)'}
    >
      <div style={{ fontSize: '20px', color: 'var(--color-gold)', width: '32px', textAlign: 'center' }}>
        {ticket.status === 'resolved' ? <FaCheckCircle /> : ticket.status === 'in-progress' ? <FaRegClock /> : <FaExclamationTriangle />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '600' }}>{ticket.issue}</div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{ticket.id} · {ticket.date}</div>
      </div>
      <StatusBadge text={ticket.status === 'open' ? 'Open' : ticket.status === 'in-progress' ? 'In Progress' : 'Resolved'} type={ticket.status === 'resolved' ? 'success' : ticket.status === 'in-progress' ? 'in-progress' : 'warning'} />
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function Support() {
  const [activeModal, setActiveModal] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const navigate = useNavigate();

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { from: 'support', text: 'Hello! How can I help you today?', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Email form
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  // Report issue form
  const [reportCategory, setReportCategory] = useState('');
  const [reportTrip, setReportTrip] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  // Tickets
  const [tickets, setTickets] = useState(SAMPLE_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };
  const closeModal = () => {
    setActiveModal(null);
    setEmailSubject('');
    setEmailMessage('');
    setReportCategory('');
    setReportTrip('');
    setReportDescription('');
    setSelectedTicket(null);
  };

  // Chat
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { from: 'user', text: chatInput, time }]);
    setChatInput('');
    setTimeout(() => {
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const botReplies = [
        'Thank you for reaching out. Let me look into that for you.',
        'I understand your concern. Let me check the details.',
        'Thanks! I\'ve noted your request. Our team will review it shortly.',
        'I\'m sorry about that. Let me connect you with a specialist.',
        'Great question! Let me find the best answer for you.',
      ];
      setChatMessages((prev) => [...prev, { from: 'support', text: botReplies[Math.floor(Math.random() * botReplies.length)], time: botTime }]);
    }, 1500);
  };

  // Submit email
  const handleEmailSubmit = () => {
    if (!emailSubject || !emailMessage) return;
    const newId = `TKT-${String(tickets.length + 1).padStart(3, '0')}`;
    setTickets((prev) => [{ id: newId, issue: emailSubject, category: 'Other', status: 'open', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), messages: [{ from: 'user', text: emailMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }, ...prev]);
    closeModal();
    showToast(`Ticket ${newId} created. We'll get back to you within 24 hours.`);
  };

  // Submit report
  const handleReportSubmit = () => {
    if (!reportCategory || !reportDescription) return;
    const newId = `TKT-${String(tickets.length + 1).padStart(3, '0')}`;
    setTickets((prev) => [{ id: newId, issue: reportCategory + (reportTrip ? ` — ${reportTrip}` : ''), category: reportCategory, status: 'open', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), messages: [{ from: 'user', text: reportDescription, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }, ...prev]);
    closeModal();
    showToast(`Issue reported. Ticket ${newId} created.`);
  };

  // Filter FAQs by search
  const filteredFaqs = activeFaq
    ? { [activeFaq]: FAQ_DATA[activeFaq] }
    : search.trim()
      ? Object.fromEntries(
          Object.entries(FAQ_DATA).filter(([, cat]) =>
            cat.title.toLowerCase().includes(search.toLowerCase()) ||
            cat.questions.some((q) => q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase()))
          )
        )
      : null;

  const hasSearchResults = !search.trim() || (filteredFaqs && Object.keys(filteredFaqs).length > 0);

  return (
    <div style={{ backgroundColor: 'var(--color-black)', color: 'var(--color-white)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}><FaArrowLeft /></button>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700' }}>Help & Support</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '2px' }}>Get help with rides, deliveries, payments, and more</p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <FaSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '16px' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveFaq(null); }}
            placeholder="Search for help (e.g., cancel ride, refund, payment)..."
            style={{
              width: '100%', padding: '16px 16px 16px 48px',
              backgroundColor: 'var(--color-surface-card)',
              border: '1px solid var(--color-border-gold)',
              borderRadius: '12px',
              color: 'var(--color-white)',
              fontSize: '15px',
              outline: 'none',
            }}
          />
        </div>

        {/* ===== QUICK HELP CATEGORIES (shown when no FAQ or search active) ===== */}
        {!activeFaq && !search.trim() && (
          <>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>How can we help you?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              {Object.entries(FAQ_DATA).map(([key, cat]) => (
                <CategoryCard key={key} icon={cat.icon} title={cat.title} desc={`${cat.questions.length} questions`} onClick={() => setActiveFaq(key)} />
              ))}
            </div>
          </>
        )}

        {/* ===== SEARCH RESULTS / ACTIVE FAQ ===== */}
        {activeFaq || search.trim() ? (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              {activeFaq && (
                <button onClick={() => { setActiveFaq(null); setSearch(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', padding: '0' }}>
                  <FaArrowLeft /> Back
                </button>
              )}
            </div>
            {!hasSearchResults ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border-gold)', borderRadius: '12px' }}>
                <FaSearch style={{ fontSize: '32px', marginBottom: '16px', opacity: 0.4 }} />
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-white)' }}>No results found</div>
                <div style={{ fontSize: '14px', marginBottom: '24px' }}>Try different keywords or browse our help categories</div>
                <button onClick={() => setActiveModal('chat')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', cursor: 'pointer', fontWeight: '600' }}>
                  Contact support
                </button>
              </div>
            ) : (
              Object.entries(search.trim() ? filteredFaqs : { [activeFaq]: FAQ_DATA[activeFaq] }).map(([key, cat]) => (
                <div key={key}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '22px', color: 'var(--color-gold)' }}>{cat.icon}</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '600' }}>{cat.title}</h3>
                  </div>
                  <FaqAccordion questions={cat.questions} onContact={() => setActiveModal('chat')} />
                </div>
              ))
            )}
          </div>
        ) : null}

        {/* ===== CONTACT CHANNELS ===== */}
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', marginTop: activeFaq ? '0' : '0' }}>Contact Us</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '40px' }}>
          <button onClick={() => setActiveModal('chat')} style={{ padding: '20px', backgroundColor: 'var(--color-surface-card)', borderRadius: '12px', border: '1px solid var(--color-border-gold)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--color-white)' }}>
            <FaCommentDots style={{ fontSize: '28px', color: 'var(--color-gold)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Live Chat</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Reply in ~2 min</span>
          </button>
          <button onClick={() => setActiveModal('email')} style={{ padding: '20px', backgroundColor: 'var(--color-surface-card)', borderRadius: '12px', border: '1px solid var(--color-border-gold)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--color-white)' }}>
            <FaEnvelope style={{ fontSize: '28px', color: 'var(--color-gold)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Email Us</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Reply in ~24 hrs</span>
          </button>
          <button onClick={() => setActiveModal('call')} style={{ padding: '20px', backgroundColor: 'var(--color-surface-card)', borderRadius: '12px', border: '1px solid var(--color-border-gold)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--color-white)' }}>
            <FaPhoneAlt style={{ fontSize: '28px', color: 'var(--color-gold)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Call Us</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>24/7 support</span>
          </button>
          <button onClick={() => setActiveModal('report')} style={{ padding: '20px', backgroundColor: 'var(--color-surface-card)', borderRadius: '12px', border: '1px solid var(--color-border-gold)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--color-white)' }}>
            <FaExclamationTriangle style={{ fontSize: '28px', color: 'var(--color-gold)' }} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Report Issue</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Trip or account</span>
          </button>
        </div>

        {/* ===== MY TICKETS ===== */}
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>My Tickets</h3>
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border-gold)', borderRadius: '12px', marginBottom: '40px' }}>
            <FaTicketAlt style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.4 }} />
            <div style={{ fontSize: '14px' }}>No tickets yet</div>
          </div>
        ) : (
          tickets.map((t) => <TicketItem key={t.id} ticket={t} onClick={setSelectedTicket} />)
        )}

        {/* ===== TOAST ===== */}
        {toastMsg && (
          <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-gold)', borderRadius: '8px', padding: '12px 24px', color: 'var(--color-gold)', fontWeight: '600', fontSize: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 2000, animation: 'helpToastSlideUp 300ms ease-out' }}>
            {toastMsg}
          </div>
        )}
      </div>

      {/* ===== MODALS ===== */}

      {/* Live Chat Modal */}
      {activeModal === 'chat' && (
        <SupportModal title="Live Chat" onClose={closeModal} wide>
          <div style={{ height: '300px', overflowY: 'auto', marginBottom: '16px', padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            {chatMessages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat(); }} placeholder="Type your message..." style={{ flex: 1, padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '15px', outline: 'none' }} />
            <button onClick={handleSendChat} disabled={!chatInput.trim()} style={{ padding: '14px 20px', borderRadius: '8px', border: 'none', backgroundColor: chatInput.trim() ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)', color: chatInput.trim() ? 'var(--color-black)' : 'var(--color-text-muted)', cursor: chatInput.trim() ? 'pointer' : 'not-allowed', fontWeight: '600' }}><FaPaperPlane /></button>
          </div>
        </SupportModal>
      )}

      {/* Email Modal */}
      {activeModal === 'email' && (
        <SupportModal title="Email Support" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>Send us a message and we'll get back to you within 24 hours.</p>
          <Input label="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="e.g., Refund request" />
          <Input label="Message" value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Describe your issue in detail..." multiline rows={5} />
          <button onClick={handleEmailSubmit} disabled={!emailSubject || !emailMessage} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: emailSubject && emailMessage ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)', color: emailSubject && emailMessage ? 'var(--color-black)' : 'var(--color-text-muted)', fontWeight: '600', cursor: emailSubject && emailMessage ? 'pointer' : 'not-allowed', fontSize: '16px' }}>Submit</button>
        </SupportModal>
      )}

      {/* Call Modal */}
      {activeModal === 'call' && (
        <SupportModal title="Call Support" onClose={closeModal}>
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <FaPhoneAlt style={{ fontSize: '48px', color: 'var(--color-gold)', marginBottom: '16px' }} />
            <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', letterSpacing: '1px' }}>+234 800 000 0000</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>Available 24/7 for urgent issues</div>
            <a href="tel:+2348000000000" style={{ display: 'inline-block', padding: '14px 48px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', fontWeight: '600', fontSize: '16px', textDecoration: 'none' }}>Call now</a>
          </div>
        </SupportModal>
      )}

      {/* Report Issue Modal */}
      {activeModal === 'report' && (
        <SupportModal title="Report an Issue" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>Select the category and trip related to your issue.</p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Category</label>
            <select value={reportCategory} onChange={(e) => setReportCategory(e.target.value)} style={{ width: '100%', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '15px', outline: 'none' }}>
              <option value="">Select a category</option>
              <option value="Ride Issues">Ride Issues</option>
              <option value="Payment & Pricing">Payment & Pricing</option>
              <option value="Account & Login">Account & Login</option>
              <option value="Safety & Trust">Safety & Trust</option>
              <option value="Delivery / Courier">Delivery / Courier</option>
              <option value="Promotions & Credits">Promotions & Credits</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <Input label="Trip (optional)" value={reportTrip} onChange={(e) => setReportTrip(e.target.value)} placeholder="e.g., Lekki to VI, 2 Jun 2026" />
          <Input label="Description" value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} placeholder="Describe what happened..." multiline rows={5} />
          <button onClick={handleReportSubmit} disabled={!reportCategory || !reportDescription} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: reportCategory && reportDescription ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)', color: reportCategory && reportDescription ? 'var(--color-black)' : 'var(--color-text-muted)', fontWeight: '600', cursor: reportCategory && reportDescription ? 'pointer' : 'not-allowed', fontSize: '16px' }}>Submit report</button>
        </SupportModal>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <SupportModal title={selectedTicket.issue} onClose={closeModal} wide>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{selectedTicket.id}</span>
            <StatusBadge text={selectedTicket.status === 'open' ? 'Open' : selectedTicket.status === 'in-progress' ? 'In Progress' : 'Resolved'} type={selectedTicket.status === 'resolved' ? 'success' : selectedTicket.status === 'in-progress' ? 'in-progress' : 'warning'} />
          </div>
          <div style={{ height: '280px', overflowY: 'auto', padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '16px' }}>
            {selectedTicket.messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
          </div>
          {selectedTicket.status !== 'resolved' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Reply to this ticket..." style={{ flex: 1, padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '15px', outline: 'none' }} />
              <button onClick={() => showToast('Your reply has been sent to our support team')} style={{ padding: '14px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', cursor: 'pointer', fontWeight: '600' }}><FaPaperPlane /></button>
            </div>
          )}
        </SupportModal>
      )}

      <style>{`@keyframes helpToastSlideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}
