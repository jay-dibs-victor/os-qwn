import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  const features = [
    { icon: '🛡️', label: 'Verified Safety', color: 'rgba(34,197,94,0.12)', text: '#4ade80' },
    { icon: '⚡', label: 'Instant Dispatch', color: 'rgba(255,184,0,0.12)', text: '#FFB800' },
    { icon: '💳', label: 'Fair Pricing', color: 'rgba(99,102,241,0.12)', text: '#818cf8' },
  ];

  const pillars = [
    { title: 'Our Mission', body: 'To provide seamless, safe, and cost-effective mobility solutions through state-of-the-art technology and a driver-partner ecosystem built on integrity.' },
    { title: 'Innovation First', body: "From real-time socket tracking to AI-driven route optimization, we constantly push the boundaries of what's possible in the mobility sector." },
    { title: 'Sustainability', body: 'We are committed to reducing our carbon footprint by optimizing routes to minimize idle time and encouraging the transition to electric fleets.' },
  ];

  return (
    <main style={{ background: '#000000', minHeight: '100vh', paddingTop: '100px', paddingBottom: '60px' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#121212',
            borderRadius: '32px',
            border: '1px solid rgba(255,255,255,0.07)',
            padding: '48px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <p style={{ color: '#FFB800', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>
                About Queens
              </p>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-2px', color: '#FFFFFF', lineHeight: 1.15, marginBottom: '20px' }}>
                Redefining the{' '}
                <span style={{ color: '#FFB800' }}>Premium</span>{' '}
                Mobility Experience.
              </h1>
              <p style={{ color: '#A1A1AA', lineHeight: 1.7, fontSize: '1rem', marginBottom: '32px' }}>
                Queens is more than just a ride-hailing app. We are a network of trust, safety, and efficiency, committed to providing the most reliable transportation service in the city.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                {features.map(f => (
                  <div key={f.label} style={{
                    background: f.color,
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '120px',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <span style={{ fontSize: '1.8rem' }}>{f.icon}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: f.text, textAlign: 'center' }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div style={{
                background: 'linear-gradient(145deg, #1a1a1a, #0A0A0A)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.07)',
                height: '340px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '6rem',
              }}>
                🚖
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.07)', margin: '40px 0' }} />

          <div className="row g-4">
            {pillars.map(p => (
              <div key={p.title} className="col-md-4">
                <div style={{
                  background: '#0A0A0A',
                  borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '24px',
                  height: '100%',
                }}>
                  <h4 style={{ fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>{p.title}</h4>
                  <p style={{ color: '#A1A1AA', margin: 0, lineHeight: 1.7, fontSize: '0.9rem' }}>{p.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '40px',
            padding: '40px',
            background: 'linear-gradient(135deg, rgba(255,184,0,0.08) 0%, rgba(255,184,0,0.03) 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(255,184,0,0.2)',
            textAlign: 'center',
          }}>
            <h3 style={{ fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>Ready to experience the future?</h3>
            <p style={{ color: '#A1A1AA', marginBottom: '24px' }}>Join thousands of riders already enjoying premium mobility.</p>
            <Link
              to="/book-ride"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FFB800',
                color: '#000',
                borderRadius: '50px',
                padding: '14px 36px',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
                boxShadow: '0 6px 24px rgba(255,184,0,0.3)',
                transition: 'all 0.2s',
              }}
            >
              Book Your First Ride →
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default AboutUs;
