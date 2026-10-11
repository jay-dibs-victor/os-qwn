import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section id="hero" className="hero hero-business section-padding" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}> 
        <div className="hero-copy" style={{ maxWidth: '820px' }}>
          <span className="eyebrow">🇳🇬 About Queens OS</span>
          <h1 style={{ fontSize: '60px', lineHeight: '1.05', marginBottom: '24px' }}>
            Nigeria's mobility revolution starts here.
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
            Queens OS is an early-stage Nigerian e-hailing and logistics startup building the country's most driver-friendly, safety-first, and ambitious transport super app — launching first in Lagos.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="split-promo-section section-padding" style={{ borderTop: '1px solid var(--color-border-gold)' }}>
        <div className="split-promo-visual" style={{ background: 'radial-gradient(circle at 60% 40%, rgba(255,184,0,0.15), transparent 70%), var(--color-surface-card)', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: '1px solid var(--color-border-gold)' }}>
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <img src="/logo.svg" alt="Queens OS" style={{ height: '80px', marginBottom: '24px' }} />
            <p style={{ color: 'var(--color-gold)', fontWeight: '700', fontSize: '18px' }}>Queens OS Technologies</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '8px' }}>Incorporated in Nigeria · Lagos HQ</p>
          </div>
        </div>
        <div className="split-promo-content">
          <span className="eyebrow">Our Mission</span>
          <h2>Affordable, safe, and seamless transport for every Nigerian.</h2>
          <p>We believe Lagos deserves a homegrown mobility platform — one that treats drivers fairly, keeps passengers safe, and evolves into a complete logistics ecosystem. Starting with rides, we're building toward a future where one app handles your car ride, flight ticket, cargo shipment, and train booking.</p>
          <Link className="btn-black" style={{ marginTop: '24px', display: 'inline-flex' }} to="/investors">Partner with us</Link>
        </div>
      </section>

      {/* Why Queens OS is Different */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px' }}>
            <span className="eyebrow">Our Edge</span>
            <h2>Why Queens OS wins in Nigeria</h2>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>💰</div>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Lowest Driver Commission</h3>
              <p>We take a smaller cut than every major competitor. That means drivers earn more per trip, which means higher driver satisfaction, more reliable supply, and better service for riders.</p>
            </div>
            <div className="feature-card">
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🆘</div>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Built-in SOS Button</h3>
              <p>Security is non-negotiable in Lagos. Every Queens OS trip includes a one-tap SOS emergency button that alerts local authorities and emergency contacts instantly.</p>
            </div>
            <div className="feature-card">
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🌍</div>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Pan-African Ambition</h3>
              <p>We're starting in Lagos, but the vision is continental. Queens OS is engineered to scale across Nigeria first, then expand to other African cities and beyond.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Super App Roadmap */}
      <section className="section-padding">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px', textAlign: 'center' }}>
            <span className="eyebrow">The Roadmap</span>
            <h2>From rides to a full transport ecosystem</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '16px auto 0' }}>We are phasing our product launches strategically — perfecting rides first, then expanding into a full logistics super app.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { phase: 'Phase 1', title: 'E-Hailing Rides', detail: 'Launching in Lagos with affordable, safe, driver-empowering ride-hailing.', status: '🟡 In Development', color: 'var(--color-gold)' },
              { phase: 'Phase 2', title: 'Package Delivery & Courier', detail: 'Adding intra-city cargo and package delivery services via the same driver network.', status: '🔵 Planned', color: 'rgba(255,255,255,0.4)' },
              { phase: 'Phase 3', title: 'Flight & Train Tickets', detail: 'Integrated booking for domestic flights and rail transport across Nigeria.', status: '🔵 Planned', color: 'rgba(255,255,255,0.4)' },
              { phase: 'Phase 4', title: 'Pan-African Expansion', detail: 'Scaling the full platform to other African markets and eventually globally.', status: '🔵 Planned', color: 'rgba(255,255,255,0.4)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: '24px', padding: '32px 0', borderBottom: '1px solid var(--color-border-gold)', alignItems: 'start' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: '600', paddingTop: '4px' }}>{item.phase}</div>
                <div>
                  <h3 style={{ color: item.color, fontSize: '22px', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>{item.detail}</p>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', paddingTop: '4px' }}>{item.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA to Investors */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '40px', marginBottom: '20px' }}>Believe in this vision?</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '560px', margin: '0 auto 32px', fontSize: '18px' }}>We are currently raising our seed round. Talk to the founding team and request our pitch deck.</p>
        <Link className="btn-black" to="/investors">Invest in Queens OS</Link>
      </section>
    </div>
  );
}
