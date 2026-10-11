import { Link } from 'react-router-dom';

export default function Freight() {
  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section id="hero" className="hero hero-business" style={{ minHeight: '55vh', display: 'flex', alignItems: 'center' }}> 
        <div className="hero-copy" style={{ maxWidth: '780px' }}>
          <span className="eyebrow">🚛 Queens OS Freight</span>
          <h1 style={{ fontSize: '58px', lineHeight: '1.05', marginBottom: '24px' }}>
            Nigeria's logistics network, reimagined.
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
            Queens OS Freight is our long-haul logistics division — connecting shippers with certified carriers for interstate and international cargo movement across Nigeria and Africa.
          </p>
          <div style={{ marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '12px 20px', backgroundColor: 'rgba(255,184,0,0.1)', border: '1px solid var(--color-border-gold)', borderRadius: '8px' }}>
            <span style={{ fontSize: '20px' }}>🗓️</span>
            <p style={{ color: 'var(--color-gold)', fontWeight: '600', margin: 0 }}>Coming Soon — Launching after Queens OS Rides & Courier</p>
          </div>
          <div style={{ marginTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link className="btn-black" to="/investors">Partner with us</Link>
            <Link className="btn-outline" to="/about">Learn about our roadmap</Link>
          </div>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <span className="eyebrow">The Problem We're Solving</span>
          <h2 style={{ marginBottom: '48px' }}>Nigerian logistics is broken. We're fixing it.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {[
              { icon: '❌', title: 'Current Pain: Opaque Pricing', body: 'Nigerian shippers can\'t get instant quotes or transparent pricing for cargo movement — it\'s all phone calls and haggling.' },
              { icon: '✅', title: 'Queens OS Fix: Instant Quotes', body: 'Our platform provides real-time, transparent pricing based on cargo weight, route, and vehicle type — no more guesswork.' },
              { icon: '❌', title: 'Current Pain: No Real-time Tracking', body: 'Once your cargo leaves, you have no visibility of where it is until it (hopefully) arrives.' },
              { icon: '✅', title: 'Queens OS Fix: Live GPS Tracking', body: 'Track your cargo in real time from dispatch to delivery. Get alerts at every milestone — pickup, transit, and arrival.' },
            ].map((item) => (
              <div key={item.title} style={{ padding: '32px', backgroundColor: 'var(--color-black)', borderRadius: '12px', border: '1px solid var(--color-border-gold)' }}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ color: item.icon === '✅' ? 'var(--color-gold)' : 'rgba(255,255,255,0.5)', marginBottom: '12px', fontSize: '18px' }}>{item.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we'll offer */}
      <section className="section-padding">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="eyebrow">Product Roadmap</span>
            <h2>What Queens OS Freight will offer</h2>
          </div>
          <div className="feature-grid">
            {[
              { icon: '🚛', title: 'Interstate Trucking', body: 'Lagos to Abuja, Port Harcourt, Kano and beyond — moving goods reliably across Nigeria with certified carriers.' },
              { icon: '🚢', title: 'Port Logistics', body: 'Container tracking, customs documentation support, and last-mile delivery from Lagos and Apapa ports.' },
              { icon: '✈️', title: 'Air Cargo', body: 'Time-sensitive shipments via domestic and international air routes, tracked in real time from origin to destination.' },
              { icon: '📱', title: 'Digital Dashboard', body: 'Manage all your shipments, invoices, carrier documents, and delivery confirmations from one unified platform.' },
              { icon: '🤝', title: 'Carrier Network', body: 'We onboard, verify, and manage a network of trucking companies, riders, and logistics partners so you don\'t have to.' },
              { icon: '📊', title: 'Analytics & Reporting', body: 'Full visibility into your supply chain — cost breakdowns, delivery times, carrier performance, and route optimization.' },
            ].map((item) => (
              <div key={item.title} className="feature-card">
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{item.icon}</div>
                <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Access / Investor CTA */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <span className="eyebrow">Get Involved Early</span>
          <h2>Be a founding logistics partner.</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '18px', marginBottom: '40px', lineHeight: '1.7' }}>
            Whether you're a business with regular shipping needs, a carrier looking for more load, or an investor who believes in Nigeria's logistics opportunity — we want to hear from you.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="btn-black" to="/investors">Invest in Queens OS</Link>
            <Link className="btn-outline" to="/contact-sales">Talk to us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
