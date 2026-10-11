import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaMapMarkerAlt, FaClock, FaArrowRight } from 'react-icons/fa';

const JOB_LISTINGS = {
  engineering: [
    { title: 'Senior Frontend Engineer', location: 'Lagos, Nigeria', type: 'Full-time', dept: 'Engineering' },
    { title: 'Backend Engineer — Go/Python', location: 'Lagos, Nigeria', type: 'Full-time', dept: 'Engineering' },
    { title: 'Mobile Engineer — React Native', location: 'Lagos, Nigeria', type: 'Full-time', dept: 'Engineering' },
    { title: 'ML Engineer — Routing & ETA', location: 'Lagos, Nigeria', type: 'Full-time', dept: 'Engineering' },
  ],
  design: [
    { title: 'Product Designer', location: 'Lagos, Nigeria', type: 'Full-time', dept: 'Design' },
    { title: 'UX Researcher', location: 'Lagos, Nigeria', type: 'Contract', dept: 'Design' },
    { title: 'Design Operations Lead', location: 'Lagos, Nigeria', type: 'Full-time', dept: 'Design' },
  ],
  operations: [
    { title: 'Driver Operations Manager', location: 'Lagos, Nigeria', type: 'Full-time', dept: 'Operations' },
    { title: 'City Launch Lead', location: 'Abuja, Nigeria', type: 'Full-time', dept: 'Operations' },
    { title: 'Logistics Coordinator', location: 'Lagos, Nigeria', type: 'Full-time', dept: 'Operations' },
  ],
};

export default function Careers() {
  const [showJobs, setShowJobs] = useState(null);

  return (
    <div className="page-wrapper">
      <section id="hero" className="hero hero-business section-padding" style={{minHeight: '60vh', display: 'flex', alignItems: 'center'}}> 
        <div className="hero-copy" style={{width: '100%'}}>
          <h1 style={{fontSize: '64px', marginBottom: '24px'}}>Come build with us.</h1>
          <p style={{marginBottom: '32px'}}>Join a team of visionaries and builders working to change how the world moves.</p>
          
          <div style={{display: 'flex', backgroundColor: 'var(--color-surface)', borderRadius: '8px', padding: '8px', border: '1px solid var(--color-border-gold)', maxWidth: '600px'}}>
            <input 
              type="text" 
              placeholder="Search for jobs by title, keyword, or location" 
              style={{flex: 1, backgroundColor: 'transparent', border: 'none', color: 'var(--color-white)', padding: '0 16px', fontSize: '16px'}}
            />
            <button className="primary-button" style={{padding: '12px 24px'}}>Search</button>
          </div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="section-padding" style={{backgroundColor: 'var(--color-surface)'}}>
        <div className="section-copy" style={{marginBottom: '48px', textAlign: 'center'}}>
          <h2>Find your team</h2>
        </div>
        <div className="feature-grid">
          <div className="feature-card" style={{border: '1px solid var(--color-border-gold)', backgroundColor: 'var(--color-black)'}}>
            <h3 style={{color: 'var(--color-gold)', marginBottom: '16px'}}>Engineering</h3>
            <p>Tackle complex scaling, routing, and machine learning problems that impact millions of users globally.</p>
            <button onClick={() => setShowJobs('engineering')} style={{display: 'inline-block', marginTop: '24px', border: 'none', background: 'none', color: 'var(--color-white)', borderBottom: '1px solid var(--color-white)', cursor: 'pointer', padding: 0, fontSize: 'inherit'}}>View Engineering roles</button>
          </div>
          <div className="feature-card" style={{border: '1px solid var(--color-border-gold)', backgroundColor: 'var(--color-black)'}}>
            <h3 style={{color: 'var(--color-gold)', marginBottom: '16px'}}>Design & Research</h3>
            <p>Craft beautiful, intuitive, and accessible experiences that our users rely on every day.</p>
            <button onClick={() => setShowJobs('design')} style={{display: 'inline-block', marginTop: '24px', border: 'none', background: 'none', color: 'var(--color-white)', borderBottom: '1px solid var(--color-white)', cursor: 'pointer', padding: 0, fontSize: 'inherit'}}>View Design roles</button>
          </div>
          <div className="feature-card" style={{border: '1px solid var(--color-border-gold)', backgroundColor: 'var(--color-black)'}}>
            <h3 style={{color: 'var(--color-gold)', marginBottom: '16px'}}>Operations</h3>
            <p>Keep our cities moving smoothly and efficiently by managing our massive physical and digital networks.</p>
            <button onClick={() => setShowJobs('operations')} style={{display: 'inline-block', marginTop: '24px', border: 'none', background: 'none', color: 'var(--color-white)', borderBottom: '1px solid var(--color-white)', cursor: 'pointer', padding: 0, fontSize: 'inherit'}}>View Operations roles</button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding">
        <div className="section-copy" style={{marginBottom: '48px'}}>
          <h2>Life at Queens OS</h2>
          <p>We provide comprehensive benefits to ensure you are healthy, happy, and empowered.</p>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '48px'}}>
          <div style={{display: 'flex', gap: '24px'}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <div>
              <h3>Health & Wellness</h3>
              <p style={{color: 'var(--color-text-muted)', marginTop: '8px'}}>Top-tier medical, dental, and vision coverage, plus mental health resources and wellness stipends.</p>
            </div>
          </div>
          <div style={{display: 'flex', gap: '24px'}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4-2.37z"/></svg>
            <div>
              <h3>Flexible Time Off</h3>
              <p style={{color: 'var(--color-text-muted)', marginTop: '8px'}}>Take the time you need to recharge with our generous paid time off and global recharge days.</p>
            </div>
          </div>
          <div style={{display: 'flex', gap: '24px'}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <div>
              <h3>Family Support</h3>
              <p style={{color: 'var(--color-text-muted)', marginTop: '8px'}}>Comprehensive parental leave, fertility benefits, and child care support.</p>
            </div>
          </div>
          <div style={{display: 'flex', gap: '24px'}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--color-gold)"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
            <div>
              <h3>Financial Growth</h3>
              <p style={{color: 'var(--color-text-muted)', marginTop: '8px'}}>Competitive equity packages, 401(k) matching, and personal finance counseling.</p>
            </div>
          </div>
        </div>
      </section>

      {showJobs && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '560px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-gold)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--color-border-gold)' }}>
              <h3 style={{ margin: 0, color: 'var(--color-gold)' }}>{showJobs.charAt(0).toUpperCase() + showJobs.slice(1)} roles</h3>
              <button onClick={() => setShowJobs(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '20px', padding: '4px' }}>
                <FaTimes />
              </button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {JOB_LISTINGS[showJobs].map((job, i) => (
                <div key={i} style={{ padding: '16px', backgroundColor: 'var(--color-surface-card)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>{job.title}</div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaMapMarkerAlt /> {job.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaClock /> {job.type}</span>
                  </div>
                  <button style={{ marginTop: '12px', color: 'var(--color-gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Apply now <FaArrowRight />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border-gold)', fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Don't see what you're looking for? <Link to="/contact-sales" style={{ color: 'var(--color-gold)' }}>Get in touch</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
