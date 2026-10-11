import { Link } from 'react-router-dom';

export default function Eats() {
  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section id="hero" className="hero hero-business" style={{ minHeight: '55vh', display: 'flex', alignItems: 'center' }}> 
        <div className="hero-copy" style={{ maxWidth: '760px' }}>
          <span className="eyebrow">🍽️ Queens OS Eats</span>
          <h1 style={{ fontSize: '58px', lineHeight: '1.05', marginBottom: '24px' }}>
            Premium flavor, at your door.
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
            From local spots to fine dining — Queens OS Eats connects you to the best food your city has to offer, delivered fast and fresh.
          </p>
          <div style={{ marginTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link className="btn-black" to="/signup">Join Waitlist — Eats</Link>
            <Link className="btn-outline" to="/business">Corporate meal plans</Link>
          </div>
          <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>🚀 Launching alongside Queens OS Rides</p>
        </div>
      </section>

      {/* How it Works */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="eyebrow">Simple & Fast</span>
            <h2>Order in 3 easy steps</h2>
          </div>
          <div className="feature-grid">
            <div className="feature-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>1. Browse restaurants</h3>
              <p>Explore hundreds of local restaurants, local chefs, and food vendors near you — from classic local dishes to international cuisine.</p>
            </div>
            <div className="feature-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>2. Place your order</h3>
              <p>Pick your meal, customise it, and confirm your delivery address. Pay with card, transfer, or Queens OS Pay (coming soon).</p>
            </div>
            <div className="feature-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏍️</div>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>3. Track & enjoy</h3>
              <p>Watch your rider pick up your food and track them in real time as they zip through traffic straight to your door.</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Restaurants */}
      <section className="section-padding">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="split-promo-section">
            <div className="split-promo-content">
              <span className="eyebrow">For Restaurant Owners</span>
              <h2>Grow your restaurant with us.</h2>
              <p>Partner with Queens OS Eats and reach thousands of hungry customers in your city. We provide the technology — you provide the taste.</p>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  'Access to our growing rider network',
                  'Real-time order management dashboard',
                  'Marketing support for new restaurant listings',
                  'Transparent payout reporting and analytics',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--color-gold)', fontSize: '20px', flexShrink: 0 }}>✓</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link className="btn-black" style={{ marginTop: '32px', display: 'inline-flex' }} to="/signup">Register your restaurant</Link>
            </div>
            <div className="split-promo-visual" style={{ background: 'radial-gradient(circle at 40% 60%, rgba(255,184,0,0.12), transparent 70%), var(--color-surface-card)', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: '1px solid var(--color-border-gold)' }}>
              <div style={{ textAlign: 'center', padding: '32px' }}>
                <div style={{ fontSize: '80px', marginBottom: '16px' }}>🍛</div>
                <p style={{ color: 'var(--color-gold)', fontWeight: '700' }}>Diverse Cuisine</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '8px' }}>Local Specialties · Pizza · Sushi · Burgers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Meals */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <span className="eyebrow">For Companies</span>
          <h2>Feed your team, the smart way.</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '18px', marginBottom: '32px' }}>
            Set meal budgets, manage team orders, and let employees enjoy lunch without the expense-report drama. Queens OS for Business handles the rest.
          </p>
          <Link className="btn-black" to="/business">Explore Business meal plans</Link>
        </div>
      </section>
    </div>
  );
}
