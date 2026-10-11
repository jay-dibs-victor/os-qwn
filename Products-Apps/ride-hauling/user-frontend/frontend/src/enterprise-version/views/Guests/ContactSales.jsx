import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa';

export default function ContactSales() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', interest: 'rides', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', padding: '48px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px' }}>
            <FaCheck />
          </div>
          <h2 style={{ marginBottom: '12px' }}>Thank you, {form.name}!</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
            Our team will reach out to {form.email} within 24 hours to discuss how Queens OS for Business can help {form.company || 'your company'}.
          </p>
          <Link to="/business" className="btn-black">Back to Business</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <section className="section-padding" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Link to="/business" style={{ color: 'var(--color-text-muted)', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px' }}>
          ← Back to Queens OS for Business
        </Link>
        <h1 style={{ fontSize: '44px', marginBottom: '12px' }}>Contact sales</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '18px', marginBottom: '48px' }}>
          Tell us about your business and we'll build a custom plan for your team.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>Full name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '12px 16px', backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '15px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>Company name *</label>
              <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={{ width: '100%', padding: '12px 16px', backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '15px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>Work email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '12px 16px', backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '15px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>Phone number</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '12px 16px', backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '15px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>I'm interested in *</label>
            <select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} style={{ width: '100%', padding: '12px 16px', backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '15px' }}>
              <option value="rides">Business rides & travel</option>
              <option value="meals">Employee meal programs</option>
              <option value="delivery">Local delivery & courier</option>
              <option value="freight">Freight & logistics</option>
              <option value="all">Multiple / all services</option>
              <option value="other">Something else</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-muted)' }}>Message</label>
            <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your team size, current setup, and what you're looking for..." style={{ width: '100%', padding: '12px 16px', backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', color: 'var(--color-white)', fontSize: '15px', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <button type="submit" className="btn-black" style={{ padding: '16px 32px', fontSize: '16px', alignSelf: 'flex-start' }}>
            Submit inquiry
          </button>
        </form>
      </section>
    </div>
  );
}