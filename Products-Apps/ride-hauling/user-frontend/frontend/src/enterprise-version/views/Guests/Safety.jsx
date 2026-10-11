import { Link } from 'react-router-dom';

export default function Safety() {
  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section id="hero" className="hero hero-business section-padding" style={{ minHeight: '55vh', display: 'flex', alignItems: 'center' }}> 
        <div className="hero-copy" style={{ maxWidth: '780px' }}>
          <span className="eyebrow">Safety</span>
          <h1 style={{ fontSize: '60px', lineHeight: '1.05', marginBottom: '24px' }}>
            Safety is built in, not bolted on.
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
            Safety is non-negotiable. That's why Queens OS is built from the ground up with safety features that protect every rider and driver on every single trip.
          </p>
        </div>
      </section>

      {/* SOS Button - Front and Center */}
      <section className="section-padding" style={{ backgroundColor: '#0d0000', borderTop: '1px solid rgba(220,53,69,0.3)', borderBottom: '1px solid rgba(220,53,69,0.3)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{ width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(220,53,69,0.15)', border: '2px solid rgba(220,53,69,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', animation: 'pulse 2s infinite' }}>
                <div style={{ width: '140px', height: '140px', borderRadius: '50%', backgroundColor: 'rgba(220,53,69,0.25)', border: '2px solid rgba(220,53,69,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#dc3545', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 30px rgba(220,53,69,0.6)' }}>
                    <span style={{ color: 'white', fontWeight: '900', fontSize: '22px', letterSpacing: '1px' }}>SOS</span>
                  </div>
                </div>
              </div>
              <p style={{ marginTop: '24px', color: 'rgba(220,53,69,0.9)', fontWeight: '700', fontSize: '14px' }}>ONE TAP EMERGENCY BUTTON</p>
            </div>
          </div>
          <div>
            <span className="eyebrow" style={{ color: 'rgba(220,53,69,0.9)' }}>Our #1 Feature</span>
            <h2 style={{ fontSize: '44px', marginBottom: '20px' }}>The SOS Button</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '18px', lineHeight: '1.7', marginBottom: '24px' }}>
              Every Queens OS trip includes a built-in SOS emergency button. At any point during your ride, one tap will:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'Alert your pre-registered emergency contacts with your live location',
                'Notify local emergency services (police, ambulance)',
                'Share full trip details: driver info, vehicle plate, and GPS route',
                'Automatically record audio as evidence if needed',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'rgba(220,53,69,0.9)', fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>✓</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Additional Safety Features */}
      <section className="section-padding">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <span className="eyebrow">Safety Toolkit</span>
          <h2 style={{ marginBottom: '48px' }}>Every trip, every time</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="var(--color-gold)" style={{ marginBottom: '16px' }}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Driver Verification</h3>
              <p>Every Queens OS driver goes through a thorough background check including license verification and vehicle inspection before they can accept a single trip.</p>
            </div>
            <div className="feature-card">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="var(--color-gold)" style={{ marginBottom: '16px' }}><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Share Your Trip</h3>
              <p>Share a live link to your trip with friends and family, including driver name, vehicle plate, and real-time GPS location from pickup to dropoff.</p>
            </div>
            <div className="feature-card">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="var(--color-gold)" style={{ marginBottom: '16px' }}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>24/7 Support</h3>
              <p>Our dedicated safety response team is available around the clock to assist with any incident, concern, or emergency that happens during a trip.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety CTA */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', marginBottom: '20px' }}>Ready for a safer ride?</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '18px', marginBottom: '40px' }}>Queens OS is launching in your city soon. Join the waitlist and be among the first to experience the safest e-hailing platform.</p>
          <Link to="/" className="btn-black" style={{ padding: '16px 40px', fontSize: '18px' }}>Join the Waitlist</Link>
        </div>
      </section>
    </div>
  );
}
