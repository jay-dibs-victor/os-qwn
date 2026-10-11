import { useState, useEffect } from 'react';
import { 
  Coins, CheckCircle, RefreshCw, Smartphone, Navigation, 
  Award, Sparkles, Sliders, ShieldCheck, 
  Compass, ChevronRight, Gamepad2, Fuel
} from 'lucide-react';
import { useTenantValidation } from '../hooks/useTenantValidation';

interface UserPortalProps {
  onNavigate: (tab: 'home' | 'driver' | 'user' | 'admin' | 'coins' | 'coin-gen') => void;
}

export default function UserPortal({ onNavigate }: UserPortalProps) {
  const { isValid } = useTenantValidation();
  const [preferences, setPreferences] = useState({
    tier: 'Swift',
    quietRide: true,
    acEnabled: true,
    luggageSupport: false,
    childSeat: false,
  });

  const [wallet, setWallet] = useState({
    coins: 100,
    referrals: [
      { name: 'David K. (Passenger)', status: 'COMPLETED', date: '2026-05-12', reward: 50 },
      { name: 'Sarah M. (Driver)', status: 'COMPLETED', date: '2026-05-15', reward: 50 },
    ]
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [otpCode, setOtpCode] = useState('4820');

  // Load coins from local storage to keep state across portals
  useEffect(() => {
    const handleStorageUpdate = () => {
      const storedCoins = localStorage.getItem('passengerCoins');
      if (storedCoins) {
        setWallet(prev => ({ ...prev, coins: parseInt(storedCoins) }));
      }
      
      const storedReferrals = localStorage.getItem('passengerReferrals');
      if (storedReferrals) {
        setWallet(prev => ({ ...prev, referrals: JSON.parse(storedReferrals) }));
      }
    };

    handleStorageUpdate();
    const interval = setInterval(handleStorageUpdate, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.checked });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
  };

  const generateNewOtp = () => {
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(newOtp);
    localStorage.setItem('activeRideOtp', newOtp);
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const serverUrl = window.location.port === '5173' ? 'http://localhost:5000' : '';
      await fetch(`${serverUrl}/api/v1/onboarding/user/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr_demo_100',
          preferences: preferences
        })
      }).catch(() => {
        console.log('Backend offline. Standalone mock preferences saved.');
      });

      localStorage.setItem('passengerPreferences', JSON.stringify(preferences));
      
      setTimeout(() => {
        setSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }, 800);
    } catch (err) {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '1rem 0', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Dynamic Local CSS for Grid-4 & responsive tweaks */}
      <style dangerouslySetInnerHTML={{__html: `
        .grid-4 {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }
        @media (min-width: 576px) {
          .grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 992px) {
          .grid-4 {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}} />

      {/* 1. Header Hero Panel */}
      <section className="glass-card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden', borderLeft: '5px solid var(--primary)' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 184, 0, 0.08) 0%, transparent 60%)', filter: 'blur(30px)', pointerEvents: 'none' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.75rem' }}>
              <ShieldCheck size={12} /> Verified Passenger Node
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '900', fontFamily: 'var(--font-outfit)', color: '#fff', marginBottom: '0.35rem' }}>
              Welcome Back, Sarah Jenkins
            </h1>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem' }}>
              Manage your custom comfort preferences, active coordinate booking OTPs, and accumulated digital wealth.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => onNavigate('coin-gen')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}>
              <Coins size={16} /> Manage QCN Wallet
            </button>
            <button className="btn btn-primary" onClick={() => document.getElementById('comfort-customizer-section')?.scrollIntoView({ behavior: 'smooth' })} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}>
              Manage Settings / Preferences <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Interactive Stats Grid */}
      <section className="grid-4" style={{ gap: '1.25rem' }}>
        
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ background: 'rgba(255,184,0,0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
            <Coins size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>QCoins Balance</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-outfit)' }}>{wallet.coins} QCN</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--success)' }}>
            <Fuel size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>CO₂ Emissions Saved</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-outfit)' }}>12.4 kg</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ background: 'rgba(59,130,246,0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: '#3b82f6' }}>
            <Compass size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Completed Hauls</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-outfit)' }}>48 Trips</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ background: 'rgba(236,72,153,0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: '#ec4899' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Ecosystem Status</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-outfit)' }}>Tier 1 Rank</span>
          </div>
        </div>

      </section>

      {/* 3. Main Dashboard Body Split */}
      <div className="grid-2" style={{ gap: '2rem' }}>
        
        {/* Left Column: comfort details & Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Comfort Customizer Card */}
          <div id="comfort-customizer-section" className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <Sliders style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', color: '#fff' }}>Comfort Customizer</h3>
            </div>

            <form onSubmit={handleSavePreferences}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ color: '#fff', fontWeight: '600' }}>Preferred Fleet Dispatch Tier</label>
                <select name="tier" value={preferences.tier} onChange={handleSelectChange} className="form-select">
                  <option value="Economy">Economy - Standard city travel</option>
                  <option value="Swift">Swift - Instant priority matching</option>
                  <option value="Luxury">Luxury - Tesla / Chauffeur elite fleet</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginBottom: '2rem' }}>
                <label className="toggle-wrapper">
                  <input
                    type="checkbox"
                    name="quietRide"
                    checked={preferences.quietRide}
                    onChange={handleCheckboxChange}
                    className="toggle-checkbox"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Quiet Ride Mode</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>Instruct your driver partner to keep conversation to a polite minimum.</span>
                  </div>
                </label>

                <label className="toggle-wrapper">
                  <input
                    type="checkbox"
                    name="acEnabled"
                    checked={preferences.acEnabled}
                    onChange={handleCheckboxChange}
                    className="toggle-checkbox"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Air Conditioning Climate Control</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>Request climate control to be pre-conditioned prior to boarding.</span>
                  </div>
                </label>

                <label className="toggle-wrapper">
                  <input
                    type="checkbox"
                    name="luggageSupport"
                    checked={preferences.luggageSupport}
                    onChange={handleCheckboxChange}
                    className="toggle-checkbox"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Luggage & Cargo Assistance</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>Ask your driver to assist with heavy suitcases or deliveries.</span>
                  </div>
                </label>

                <label className="toggle-wrapper">
                  <input
                    type="checkbox"
                    name="childSeat"
                    checked={preferences.childSeat}
                    onChange={handleCheckboxChange}
                    className="toggle-checkbox"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Pre-Fitted Infant Child Seat</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>Dispatch only vehicles pre-equipped with vetted toddler safety frames.</span>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.85rem' }} disabled={saving}>
                  {saving ? <RefreshCw size={14} className="spin" /> : 'Save Comfort Settings'}
                </button>
                {saveSuccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <CheckCircle size={14} /> Profile Saved!
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Gamified Playroom Booster Teaser */}
          <div className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(236,72,153,0.05) 0%, rgba(255,184,0,0.05) 100%)', border: '1px solid rgba(236,72,153,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Gamepad2 style={{ color: '#ec4899' }} size={22} />
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-outfit)', color: '#fff' }}>Gamified Playroom Node</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Engage in casual gameplay inside the Queens passenger app while on an active ride. In-transit play applies a **3x Booster** to your coin generation speed!
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.02)' }}>
                Play Offline (Base Yield)
              </button>
              <button className="btn btn-primary" onClick={() => document.getElementById('comfort-customizer-section')?.scrollIntoView({ behavior: 'smooth' })} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', background: 'linear-gradient(90deg, #ec4899 0%, var(--primary) 100%)', border: 'none' }}>
                Configure Settings (3x Boost)
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Active Booking & Referrals Ledger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Active Ride Telemetry & Secure OTP */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <Smartphone style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', color: '#fff' }}>Active Ride Authorization</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Provide this single-use key to your driver upon arrival. The coordinate node requires this code to authenticate the dispatch and start tracking your trip.
            </p>

            <div className="otp-display" style={{ marginBottom: '1.5rem' }}>
              {otpCode.split('').map((char, index) => (
                <div key={index} className="otp-box">
                  {char}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={generateNewOtp}>
                <RefreshCw size={14} /> Regenerate Key
              </button>
            </div>

            {/* Map Simulation Widget */}
            <div className="live-ride-widget" style={{ padding: '1.25rem', borderRadius: '1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.75rem' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fff' }}>
                  <Navigation size={12} style={{ color: 'var(--primary)' }} /> TELEMETRY TRAFFIC MAP
                </span>
                <span className="badge badge-approved" style={{ fontSize: '0.6rem', padding: '0.15rem 0.5rem', marginLeft: 'auto' }}>
                  Driver En-Route
                </span>
              </div>
              
              <div className="live-map-grid" style={{ height: '70px', background: 'rgba(255,184,0,0.02)', borderRadius: '0.5rem', position: 'relative', overflow: 'hidden' }}>
                <div className="map-line"></div>
                <div className="car-indicator" style={{ position: 'absolute', top: '50%', left: '30%', transform: 'translateY(-50%)', fontSize: '1rem', animation: 'bounceDown 1s infinite alternate' }}>🚗</div>
                <div className="pin-indicator" style={{ position: 'absolute', top: '50%', left: '80%', transform: 'translateY(-50%)', fontSize: '1rem' }}>📍</div>
              </div>
              
              <p style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
                Eco-vehicle matching confirmed. Arrival ETA: <b>3 mins</b>.
              </p>
            </div>
          </div>

          {/* Referral Management */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <Sparkles style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', color: '#fff' }}>Referral Achievements</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Earn +50 coins when you invite passenger friends, and +100 coins once a referred partner completes document verification.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {wallet.referrals.map((ref, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: 'var(--border-glass)', borderRadius: '0.75rem', padding: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{ref.name}</h4>
                    <span style={{ fontSize: '0.65rem', color: 'var(--foreground-dim)' }}>
                      Joined: {ref.date}
                    </span>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      +{ref.reward} QCN
                    </span>
                    <span className="badge badge-approved" style={{ fontSize: '0.5rem', padding: '0.1rem 0.35rem', marginTop: '0.15rem' }}>
                      {ref.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', background: 'rgba(255,184,0,0.02)', border: '1px dashed rgba(255,184,0,0.2)', padding: '1.25rem', borderRadius: '0.75rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>YOUR INVITE KEY</p>
              <p style={{ fontFamily: 'monospace', fontSize: '1.35rem', letterSpacing: '0.1em', fontWeight: 'bold', color: '#fff' }}>QUEENS-HAUL-999</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
