import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <div className="page-wrapper">
      <section id="hero" className="hero hero-business section-padding" style={{minHeight: '50vh', display: 'flex', alignItems: 'center'}}> 
        <div className="hero-copy">
          <span className="eyebrow">Our Offerings</span>
          <h1 style={{fontSize: '56px', marginBottom: '24px'}}>How Queens OS works</h1>
          <p>Whether you’re riding, driving, or ordering food, the Queens OS platform connects you to exactly what you need, right when you need it.</p>
        </div>
      </section>

      {/* Step-by-Step Timeline for Riding */}
      <section className="section-padding" style={{backgroundColor: 'var(--color-surface)'}}>
        <div className="section-copy" style={{marginBottom: '64px'}}>
          <h2>Riding with Queens OS</h2>
          <p>A seamless door-to-door experience from request to dropoff.</p>
        </div>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '48px'}}>
          <div className="timeline-step" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center'}}>
            <div className="step-content" style={{paddingRight: '32px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
                <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px'}}>1</div>
                <h3>Open the app</h3>
              </div>
              <p style={{color: 'var(--color-text-muted)', fontSize: '18px'}}>Enter your destination in the "Where to?" box, confirm your pickup point, and select your preferred ride option (e.g., standard, premium, or extra seats).</p>
            </div>
            <div className="step-visual" style={{height: '300px', backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '16px', backgroundImage: 'radial-gradient(circle at top right, rgba(255,184,0,0.1), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            </div>
          </div>

          <div className="timeline-step" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center'}}>
            <div className="step-visual" style={{height: '300px', backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '16px', backgroundImage: 'radial-gradient(circle at top right, rgba(255,184,0,0.1), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', order: -1}}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.5-4.5h11L19 10H5z"/></svg>
            </div>
            <div className="step-content">
              <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
                <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px'}}>2</div>
                <h3>Get matched</h3>
              </div>
              <p style={{color: 'var(--color-text-muted)', fontSize: '18px'}}>A nearby driver accepts your request. You'll see their name, photo, and vehicle details, and can track their arrival on the map.</p>
            </div>
          </div>

          <div className="timeline-step" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center'}}>
            <div className="step-content" style={{paddingRight: '32px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
                <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px'}}>3</div>
                <h3>Enjoy the ride</h3>
              </div>
              <p style={{color: 'var(--color-text-muted)', fontSize: '18px'}}>Check that the license plate matches the app. Once inside, sit back and relax. You can share your trip status with friends so they know when you'll arrive.</p>
            </div>
            <div className="step-visual" style={{height: '300px', backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-border-gold)', borderRadius: '16px', backgroundImage: 'radial-gradient(circle at top right, rgba(255,184,0,0.1), transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Offerings Grid */}
      <section className="section-padding">
        <div className="split-promo-section">
          <div className="split-promo-content">
            <h2>Driving & Earning</h2>
            <p>Make money on your own schedule. Drive with Queens OS to get the flexibility you need. Turn on the app when you want to earn, and cash out quickly after your shifts.</p>
            <Link className="btn-black" style={{marginTop: '16px'}} to="/drive">Explore Driving</Link>
          </div>
          <div className="split-promo-visual" style={{background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100%25\' height=\'100%25\' viewBox=\'0 0 800 400\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'40\' height=\'40\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 40 0 L 0 0 0 40\' fill=\'none\' stroke=\'%23FFB800\' stroke-opacity=\'0.1\' stroke-width=\'1\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%230c0c0c\'/%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")', minHeight: '350px'}}>
          </div>
        </div>
      </section>
    </div>
  );
}
