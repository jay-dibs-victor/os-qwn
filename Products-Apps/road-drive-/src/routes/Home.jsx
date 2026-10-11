import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCar, FaBox, FaPlane, FaTrain } from 'react-icons/fa';

export default function Home() {
  const [activeTab, setActiveTab] = useState('ride');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [estimate, setEstimate] = useState('');
  const [email, setEmail] = useState('');
  const [waitlistMsg, setWaitlistMsg] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!pickup || !dropoff) {
      setEstimate('Please enter both pickup and dropoff locations.');
      return;
    }
    setEstimate(`Estimated fare from ${pickup} to ${dropoff}: ₦2,100 – ₦2,950. Sign up to get exact pricing at launch.`);
  };

  const handleWaitlist = (e) => {
    e.preventDefault();
    if (!email) return;
    setWaitlistMsg(`🎉 You're on the list! We'll notify you when Queens OS launches in Lagos.`);
    setEmail('');
  };

  return (
    <div className="home-root">

      {/* Hero Section */}
      <section id="hero" className="home-hero-section">
        <div className="home-hero-bg" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80&w=1200')` }}></div>
        
        <div className="home-hero-container">
          <div className="booking-widget">
            <div className="booking-tabs">
              <button 
                type="button"
                className={`booking-tab ${activeTab === 'ride' ? 'active' : ''}`}
                onClick={() => { setActiveTab('ride'); setEstimate(''); }}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19.5 9.5h-15V8c0-.83.67-1.5 1.5-1.5h12c.83 0 1.5.67 1.5 1.5v1.5zm1.5 1.5v5c0 1.1-.9 2-2 2h-12c-1.1 0-2-.9-2-2v-5H21zm-4.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-9 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
                </svg>
                <span>Ride</span>
              </button>
              
              <button 
                type="button"
                className={`booking-tab ${activeTab === 'delivery' ? 'active' : ''}`}
                onClick={() => { setActiveTab('delivery'); setEstimate(''); }}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z" />
                </svg>
                <span>Delivery</span>
              </button>
            </div>
            
            <form className="booking-form" onSubmit={handleSearch}>
              <h1 className="booking-title">
                {activeTab === 'ride' ? 'Lagos, your ride is coming.' : 'Get it delivered fast.'}
              </h1>
              
              <div className="booking-inputs-container">
                <div className="booking-input-row">
                  <div className="booking-input-icon">
                    <div className="booking-icon-circle"></div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter pickup location (e.g. Lekki Phase 1)" 
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                  />
                  <div className="booking-connector-line"></div>
                </div>
                
                <div className="booking-input-row">
                  <div className="booking-input-icon">
                    <div className="booking-icon-square"></div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Where to? (e.g. Victoria Island)" 
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                  />
                </div>
              </div>

              <div className="booking-date-row">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
                </svg>
                <input type="datetime-local" defaultValue={new Date().toISOString().substring(0, 16)} />
              </div>

              <button type="submit" className="booking-submit-btn">
                {activeTab === 'ride' ? 'Preview fare' : 'Preview delivery'}
              </button>

              {estimate && (
                <div className="booking-estimate-output">
                  {estimate}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Why Queens OS — USP Banner */}
      <section style={{ background: 'linear-gradient(90deg, var(--color-black) 0%, #1a1200 100%)', borderTop: '1px solid var(--color-border-gold)', borderBottom: '1px solid var(--color-border-gold)', padding: '32px 64px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '48px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>🇳🇬</span>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--color-gold)', fontSize: '18px' }}>Made for Nigeria</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Built for Lagos, expanding across Africa</div>
            </div>
          </div> */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>💰</span>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--color-gold)', fontSize: '18px' }}>Lowest Commission</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>More take-home pay for every driver</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>🆘</span>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--color-gold)', fontSize: '18px' }}>Built-in SOS</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>One tap emergency assistance, always on</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>✈️</span>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--color-gold)', fontSize: '18px' }}>Super App Vision</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Rides, flights, trains & cargo — all in one</div>
            </div>
          </div>
        </div>
      </section>

      {/* Suggestions Section */}
      <section className="home-section">
        <h2 className="section-heading">What we're building</h2>
        <div className="suggestions-grid">
          <div className="suggestion-card">
            <div className="suggestion-card-header">
              <h3>Ride</h3>
            </div>
            <p>Safe, affordable rides across Lagos. Real-time tracking, upfront fares, and a driver who shows up.</p>
            <Link to="/ride" className="suggestion-btn">
              Explore
              <span>→</span>
            </Link>
            <div className="suggestion-illustration">
              <svg viewBox="0 0 100 100" width="80" height="80">
                <rect x="10" y="45" width="80" height="30" rx="6" fill="#FFB800" />
                <path d="M22 45 L32 25 L68 25 L78 45 Z" fill="#151515" />
                <circle cx="28" cy="75" r="10" fill="#000000" />
                <circle cx="72" cy="75" r="10" fill="#000000" />
                <circle cx="28" cy="75" r="4" fill="#FFB800" />
                <circle cx="72" cy="75" r="4" fill="#FFB800" />
              </svg>
            </div>
          </div>

          <div className="suggestion-card">
            <div className="suggestion-card-header">
              <h3>Reserve</h3>
            </div>
            <p>Book your ride up to 90 days in advance. Perfect for airport runs, meetings, and early-morning trips.</p>
            <Link to="/reserve" className="suggestion-btn">
              Explore
              <span>→</span>
            </Link>
            <div className="suggestion-illustration">
              <svg viewBox="0 0 100 100" width="80" height="80">
                <rect x="20" y="20" width="60" height="60" rx="8" fill="#151515" />
                <rect x="28" y="32" width="44" height="40" fill="#ffffff" />
                <rect x="34" y="40" width="10" height="10" fill="#FFB800" />
                <rect x="56" y="40" width="10" height="10" fill="#0c0c0c" />
                <rect x="34" y="56" width="10" height="10" fill="#0c0c0c" />
                <rect x="56" y="56" width="10" height="10" fill="#0c0c0c" />
                <rect x="28" y="10" width="6" height="16" rx="3" fill="#FFB800" />
                <rect x="66" y="10" width="6" height="16" rx="3" fill="#FFB800" />
              </svg>
            </div>
          </div>

          <div className="suggestion-card">
            <div className="suggestion-card-header">
              <h3>Courier</h3>
            </div>
            <p>Send packages across Lagos in real time. From documents to parcels — delivered with speed.</p>
            <Link to="/courier" className="suggestion-btn">
              Explore
              <span>→</span>
            </Link>
            <div className="suggestion-illustration">
              <svg viewBox="0 0 100 100" width="80" height="80">
                <polygon points="50,15 90,35 90,75 50,95 10,75 10,35" fill="#151515" />
                <polygon points="50,15 50,95" stroke="#FFB800" strokeWidth="2" />
                <polygon points="10,35 90,35" stroke="#FFB800" strokeWidth="2" />
                <polygon points="50,15 10,75 50,95 90,75 Z" fill="none" stroke="#FFB800" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Super App Vision Teaser */}
      <section className="home-section" style={{ borderTop: '1px solid rgba(255, 184, 0, 0.18)' }}>
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px' }}>
          <span className="eyebrow" style={{ display: 'block', marginBottom: '16px' }}>The Big Picture</span>
          <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: '1.1' }}>One app. Every journey.</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '18px', lineHeight: '1.7' }}>We're starting with rides in Lagos — but our vision is bigger. Queens OS will become your all-in-one logistics and transport super app. Book rides, flights, trains, and cargo shipments. All from one platform.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {[
            { icon: <FaCar />, label: 'Rides', status: 'Launching in Lagos', active: true },
            { icon: <FaBox />, label: 'Cargo', status: 'Coming soon', active: false },
            { icon: <FaPlane />, label: 'Flights', status: 'On the roadmap', active: false },
            { icon: <FaTrain />, label: 'Trains', status: 'On the roadmap', active: false },
          ].map((item) => (
            <div key={item.label} style={{ padding: '32px 24px', backgroundColor: item.active ? 'rgba(255,184,0,0.08)' : 'var(--color-surface-card)', border: `1px solid ${item.active ? 'var(--color-gold)' : 'var(--color-border-gold)'}`, borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{item.icon}</div>
              <div style={{ fontWeight: '700', color: item.active ? 'var(--color-gold)' : 'var(--color-white)', fontSize: '18px', marginBottom: '8px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: item.active ? 'var(--color-gold)' : 'var(--color-text-muted)', fontWeight: item.active ? '600' : '400' }}>{item.status}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Driver Earn Section */}
      <section className="home-section" style={{ borderTop: '1px solid rgba(255, 184, 0, 0.18)' }}>
        <div className="split-promo-section">
          <div className="split-promo-visual">
            <svg viewBox="0 0 600 400" width="100%" height="auto">
              <rect width="600" height="400" fill="#0c0c0c" rx="12" />
              <circle cx="300" cy="200" r="140" fill="#151515" />
              <path d="M300 140 C340 140 370 170 370 200 C370 230 340 260 300 260 C260 260 230 230 230 200 C230 170 260 140 300 140 Z" fill="#000000" />
              <rect x="290" y="100" width="20" height="200" fill="#FFB800" rx="10" transform="rotate(45 300 200)" />
              <circle cx="300" cy="200" r="40" fill="#FFB800" />
              <text x="270" y="208" fill="#000" fontSize="20" fontWeight="bold">₦₦₦</text>
            </svg>
          </div>
          <div className="split-promo-content">
            <span className="eyebrow">For Drivers</span>
            <h2>Keep more of what you earn.</h2>
            <p>Queens OS charges one of the lowest driver commissions in Nigeria. That means more money in your pocket after every single trip — not in ours. Join thousands of founding drivers shaping the future of Nigerian mobility.</p>
            <div className="split-promo-btns">
              <Link className="btn-black" to="/signup">Become a Founding Driver</Link>
              <Link className="btn-underline" to="/drive">Try the driver portal →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="home-section" style={{ borderTop: '1px solid rgba(255, 184, 0, 0.18)', paddingBottom: '96px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <span className="eyebrow" style={{ display: 'block', marginBottom: '16px' }}>Be First in Lagos</span>
          <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>Join the waitlist.</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '40px', fontSize: '18px' }}>Queens OS is preparing to launch in Lagos. Sign up now and be the first to ride, earn, or partner with us.</p>
          
          <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: '12px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', padding: '8px', border: '1px solid var(--color-border-gold)' }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--color-white)', padding: '0 16px', fontSize: '16px', outline: 'none' }}
            />
            <button type="submit" className="booking-submit-btn" style={{ whiteSpace: 'nowrap', padding: '12px 24px', borderRadius: '6px' }}>
              Join Waitlist
            </button>
          </form>

          {waitlistMsg && (
            <div style={{ marginTop: '16px', padding: '14px 20px', backgroundColor: 'rgba(255,184,0,0.1)', border: '1px solid var(--color-gold)', borderRadius: '8px', color: 'var(--color-gold)', fontWeight: '600' }}>
              {waitlistMsg}
            </div>
          )}
          <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>No spam. Unsubscribe at any time.</p>
        </div>
      </section>
    </div>
  );
}
