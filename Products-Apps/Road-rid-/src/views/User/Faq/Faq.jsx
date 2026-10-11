import React from 'react';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const faqs = [
    { id: 'faq1', question: 'How do I book a ride?', answer: 'You can quickly book a ride from your Dashboard by selecting "Quick Ride" and choosing your pickup and destination locations.' },
    { id: 'faq2', question: 'What payment methods are supported?', answer: 'We support in-app wallet, credit/debit cards, and corporate gift vouchers for a seamless experience.' },
    { id: 'faq3', question: 'How do I top up my wallet?', answer: 'Navigate to the Wallet tab from the main menu, enter your desired amount, and proceed to complete payment via Paystack securely.' },
    { id: 'faq4', question: 'Can I choose my driver?', answer: 'Yes! If you select a "Planned Trip", you can view car models and even choose backup options from available drivers.' },
    { id: 'faq5', question: 'How do I contact customer support?', answer: 'You can submit a ticket from the "Support Tickets" page or call the emergency contact line in the app.' },
    { id: 'faq6', question: 'Is my card information secure?', answer: 'Absolutely. All sensitive transaction data is processed securely through trusted payment gateways and not stored on our servers directly.' }
  ];

  return (
    <div style={{ background: '#000000', minHeight: '100vh', padding: '100px 0 60px' }}>
      <div className="container">

        <div className="row mb-5 justify-content-center text-center">
          <div className="col-md-8">
            <p style={{ color: '#FFB800', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>
              Help Center
            </p>
            <h2 style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '2.2rem', marginBottom: '12px' }}>
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#A1A1AA', maxWidth: '560px', margin: '0 auto' }}>
              Having difficulties navigating our app? Read through our most common questions and learn how to get the most out of Queens.
            </p>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-10">
            <div style={{
              background: '#121212',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '12px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            }}>
              {faqs.map((faq, idx) => (
                <details
                  key={faq.id}
                  style={{
                    borderRadius: '14px',
                    marginBottom: '6px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    overflow: 'hidden',
                    background: '#0A0A0A',
                    transition: 'all 0.2s',
                  }}
                >
                  <summary style={{
                    padding: '18px 22px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none',
                  }}>
                    {faq.question}
                    <span style={{ color: '#FFB800', fontSize: '1.1rem', flexShrink: 0, marginLeft: '12px' }}>＋</span>
                  </summary>
                  <div style={{
                    padding: '0 22px 18px',
                    color: '#A1A1AA',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '14px',
                    marginTop: '0',
                  }}>
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        details[open] summary span { transform: rotate(45deg); display: inline-block; }
        details[open] { border-color: rgba(255,184,0,0.2) !important; }
        details summary::-webkit-details-marker { display: none; }
      `}} />
    </div>
  );
};

export default FAQ;
