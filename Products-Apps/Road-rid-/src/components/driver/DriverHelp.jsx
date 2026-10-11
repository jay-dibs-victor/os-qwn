import { useState } from 'react';
import { FaHeadset, FaArrowLeft, FaChevronDown, FaChevronUp, FaEnvelope, FaCommentDots } from 'react-icons/fa';

const FAQS = [
  { q: 'How do I receive my earnings?', a: 'Earnings are deposited to your selected payout method. You can withdraw anytime via the Wallet page.' },
  { q: 'How do I update my vehicle details?', a: 'Vehicle details can be updated from your Profile page. Changes may require re-verification.' },
  { q: 'What should I do if a rider cancels?', a: 'If a rider cancels after you have arrived, you may be eligible for a cancellation fee. This is automatically applied.' },
  { q: 'How do I contact support?', a: 'You can reach support through the in-app chat or by emailing driver.support@queensos.com.' },
  { q: 'How are tips handled?', a: '100% of tips go directly to you. Tips are available for withdrawal immediately after the trip.' },
];

export default function DriverHelp({ onBack }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);

  return (
    <div className="dms-page">
      <div className="dms-header">
        <button className="dms-back-btn" onClick={onBack}><FaArrowLeft /></button>
        <h2 className="dms-title"><FaHeadset /> Help</h2>
      </div>

      <div className="dms-help-actions">
        <button className="dms-help-btn glass-card">
          <FaCommentDots />
          <span>Live Chat</span>
        </button>
        <button className="dms-help-btn glass-card">
          <FaEnvelope />
          <span>Email Us</span>
        </button>
      </div>

      <div className="dms-section-title">Frequently Asked Questions</div>
      <div className="dms-faq-list">
        {FAQS.map((faq, i) => (
          <div key={i} className="dms-faq-item glass-card" onClick={() => toggleFaq(i)}>
            <div className="dms-faq-question">
              <span>{faq.q}</span>
              {openFaq === i ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {openFaq === i && <div className="dms-faq-answer">{faq.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
