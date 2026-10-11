import { Link } from 'react-router-dom';

export default function Courier() {
  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section id="hero" className="hero hero-business" style={{ minHeight: '55vh', display: 'flex', alignItems: 'center' }}> 
        <div className="hero-copy" style={{ maxWidth: '760px' }}>
          <span className="eyebrow">📦 Queens OS Courier</span>
          <h1 style={{ fontSize: '58px', lineHeight: '1.05', marginBottom: '24px' }}>
            Lagos deliveries, done right.
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
            Send documents, parcels, and packages anywhere in Lagos — same day, every day. Queens OS Courier uses our existing driver network to get your items delivered fast.
          </p>
          <div style={{ marginTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link className="btn-black" to="/signup">Join Waitlist — Courier</Link>
            <Link className="btn-outline" to="/business">Business deliveries</Link>
          </div>
        </div>
      </section>

      {/* What you can send */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px' }}>
            <span className="eyebrow">Send Anything</span>
            <h2>What can you courier with Queens OS?</h2>
          </div>
          <div className="feature-grid">
            {[
              { icon: '📄', title: 'Documents', body: 'Legal papers, contracts, passports, certificates. Get critical documents across Lagos securely and on time.' },
              { icon: '📦', title: 'Packages', body: 'E-commerce orders, gifts, household items. If it fits in a vehicle, we can move it across Lagos today.' },
              { icon: '🛍️', title: 'Retail Orders', body: 'Run an online store? Use Queens OS Courier as your last-mile delivery partner across the city.' },
              { icon: '💊', title: 'Medical Items', body: 'Urgent medication, lab samples, or medical equipment can be handled with priority routing.' },
              { icon: '🍱', title: 'Food & Meals', body: 'Outside of our Eats platform, use Courier for bulk catering orders or office food runs.' },
              { icon: '🔑', title: 'Keys & Access', body: 'Lost your keys across town? Need to send a spare to someone urgently? We\'ve got you.' },
            ].map((item) => (
              <div key={item.title} className="feature-card">
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{item.icon}</div>
                <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="split-promo-section">
            <div className="split-promo-visual" style={{ background: 'var(--color-surface-card)', minHeight: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: '1px solid var(--color-border-gold)', padding: '48px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
                {[
                  { step: '01', label: 'Request pickup', desc: 'Open the app, enter pickup address and drop-off point.' },
                  { step: '02', label: 'Driver assigned', desc: 'A nearby driver accepts and arrives at your location.' },
                  { step: '03', label: 'Tracked delivery', desc: 'Track the item in real time until it reaches the recipient.' },
                ].map((item) => (
                  <div key={item.step} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>{item.step}</div>
                    <div>
                      <p style={{ fontWeight: '700', marginBottom: '4px' }}>{item.label}</p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="split-promo-content">
              <span className="eyebrow">How It Works</span>
              <h2>Same-day delivery. Zero hassle.</h2>
              <p>Booking a courier on Queens OS is as simple as booking a ride. Your driver picks up the package and delivers it — with real-time tracking the entire way so both sender and receiver stay informed.</p>
              <Link className="btn-black" style={{ marginTop: '24px', display: 'inline-flex' }} to="/signup">Join the waitlist</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Business CTA */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <span className="eyebrow">For Businesses</span>
          <h2>Your delivery partner in Lagos.</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '18px', marginBottom: '32px' }}>
            Scale your business deliveries with Queens OS. Set up accounts for your team, manage multiple pickups in one dashboard, and get volume-based pricing.
          </p>
          <Link className="btn-black" to="/business">Explore Business plan</Link>
        </div>
      </section>
    </div>
  );
}
