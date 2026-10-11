import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Investors() {
  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section id="hero" className="hero hero-business section-padding" style={{ minHeight: '55vh', display: 'flex', alignItems: 'center' }}> 
        <div className="hero-copy" style={{ maxWidth: '760px' }}>
          <span className="eyebrow">Investor Relations</span>
          <h1 style={{ fontSize: '60px', lineHeight: '1.05', marginBottom: '24px' }}>
            Invest in Nigeria's next mobility giant.
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
            Queens OS is raising its seed round. We're building the e-hailing app that Lagos — and Africa — has been waiting for.
          </p>
          <div style={{ marginTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="#pitch-form" className="btn-black">Request Pitch Deck</a>
            <Link className="btn-outline" to="/about">Our Story</Link>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <span className="eyebrow">The Opportunity</span>
          <h2 style={{ marginBottom: '48px' }}>Why Nigeria. Why now.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{ padding: '40px 32px', backgroundColor: 'var(--color-black)', borderLeft: '4px solid var(--color-gold)', borderRadius: '0 12px 12px 0' }}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--color-gold)', marginBottom: '12px' }}>220M+</div>
              <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Population</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Nigeria is Africa's most populous nation — a massive addressable market ripe for tech disruption.</div>
            </div>
            <div style={{ padding: '40px 32px', backgroundColor: 'var(--color-black)', borderLeft: '4px solid var(--color-gold)', borderRadius: '0 12px 12px 0' }}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--color-gold)', marginBottom: '12px' }}>$2.3B</div>
              <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Ride-hailing TAM</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>The Nigerian ride-hailing market is projected to exceed $2.3 billion by 2028, growing 18% YoY.</div>
            </div>
            <div style={{ padding: '40px 32px', backgroundColor: 'var(--color-black)', borderLeft: '4px solid var(--color-gold)', borderRadius: '0 12px 12px 0' }}>
              <div style={{ fontSize: '48px', fontWeight: '800', color: 'var(--color-gold)', marginBottom: '12px' }}>21M+</div>
              <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>Lagos Population</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Lagos is Africa's largest city and commercial capital — and deeply underserved by existing solutions.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="section-padding">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <span className="eyebrow">Why We Win</span>
          <h2 style={{ marginBottom: '48px' }}>Our competitive advantages</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {[
              { icon: '💰', title: 'Driver-First Economics', body: 'Our low-commission model is the lowest in the market. This drives high driver supply, better availability for riders, and organic word-of-mouth growth — all without expensive ads.' },
              { icon: '🆘', title: 'Safety as a Feature', body: 'A built-in SOS button is a critical differentiator in the Nigerian market. Security-conscious riders and their families will choose Queens OS specifically for this peace-of-mind feature.' },
              { icon: '🚀', title: 'Super App Expansion', body: 'Our long-term roadmap includes flights, trains, and cargo — making Queens OS a platform, not just an app. This creates multiple high-margin revenue streams and massive user retention.' },
              { icon: '🌍', title: 'Pan-African Scale', body: 'We are starting in Lagos, but our technology is built to scale. Nigeria is our proof-of-concept before we expand into Ghana, Kenya, and the rest of Africa.' },
            ].map((item) => (
              <div key={item.title} style={{ display: 'flex', gap: '24px', padding: '32px', backgroundColor: 'var(--color-surface-card)', borderRadius: '12px', border: '1px solid var(--color-border-gold)' }}>
                <div style={{ fontSize: '36px' }}>{item.icon}</div>
                <div>
                  <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px', fontSize: '20px' }}>{item.title}</h3>
                  <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funding Ask */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <span className="eyebrow">Seed Round</span>
          <h2 style={{ fontSize: '48px', marginBottom: '20px' }}>We are raising now.</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '18px', lineHeight: '1.7', marginBottom: '48px' }}>
            Queens OS is currently raising its pre-seed / seed round to fund our Lagos launch, technology buildout, driver acquisition, and initial marketing. We're looking for investors who believe in the African tech ecosystem.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
            <div style={{ padding: '24px', backgroundColor: 'var(--color-black)', borderRadius: '12px', border: '1px solid var(--color-border-gold)' }}>
              <div style={{ color: 'var(--color-gold)', fontWeight: '800', fontSize: '24px', marginBottom: '8px' }}>Technology</div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>App development, infrastructure, and platform scaling</p>
            </div>
            <div style={{ padding: '24px', backgroundColor: 'var(--color-black)', borderRadius: '12px', border: '1px solid var(--color-border-gold)' }}>
              <div style={{ color: 'var(--color-gold)', fontWeight: '800', fontSize: '24px', marginBottom: '8px' }}>Driver Growth</div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Onboarding, training, and incentive programs for founding drivers</p>
            </div>
            <div style={{ padding: '24px', backgroundColor: 'var(--color-black)', borderRadius: '12px', border: '1px solid var(--color-border-gold)' }}>
              <div style={{ color: 'var(--color-gold)', fontWeight: '800', fontSize: '24px', marginBottom: '8px' }}>Market Launch</div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Go-to-market campaigns across Lagos for rider acquisition</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="pitch-form" className="section-padding">
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <span className="eyebrow">Get in Touch</span>
          <h2 style={{ marginBottom: '12px' }}>Request our pitch deck</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '40px' }}>Fill in the form below and a member of the Queens OS founding team will be in touch within 48 hours.</p>

          {submitted ? (
            <div style={{ padding: '32px', backgroundColor: 'rgba(255,184,0,0.1)', border: '1px solid var(--color-gold)', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '8px' }}>Thank you, {form.name}!</h3>
              <p style={{ color: 'var(--color-text-muted)' }}>We'll be in touch at <strong style={{ color: 'var(--color-white)' }}>{form.email}</strong> within 48 hours with our pitch deck and next steps.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Adaeze Okonkwo" style={{ width: '100%', padding: '14px 16px', background: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '16px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Company / Fund</label>
                  <input name="company" value={form.company} onChange={handleChange} placeholder="e.g. Ventures Platform" style={{ width: '100%', padding: '14px 16px', background: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '16px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Email Address *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" style={{ width: '100%', padding: '14px 16px', background: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '16px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Message (Optional)</label>
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your investment thesis or any questions..." rows={4} style={{ width: '100%', padding: '14px 16px', background: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '16px', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <button type="submit" className="booking-submit-btn" style={{ marginTop: '8px' }}>
                Request Pitch Deck
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
