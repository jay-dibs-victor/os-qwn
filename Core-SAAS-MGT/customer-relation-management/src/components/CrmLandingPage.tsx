import { useState, useEffect } from 'react';
import { Car, User, ShieldAlert, Sparkles, Layers, Cpu, Compass, Gift, Zap, Navigation, Key, Coins, Truck, Smartphone, CheckCircle, UserPlus, FileText, Check, ShieldCheck, Star } from 'lucide-react';

interface CrmLandingPageProps {
  onNavigate: (tab: 'driver' | 'user' | 'admin' | 'coins') => void;
}

export default function CrmLandingPage({ onNavigate }: CrmLandingPageProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 15);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const slidesData = [
    {
      title: "Driver Signup Form",
      badge: "Step 01",
      icon: <UserPlus size={18} />,
      desc: "Get started as a driver partner. Complete the signup form with your legal details and active service city node.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          {/* Signup Form Card */}
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.25rem', display: 'block' }}>DRIVER PARTNER SIGNUP</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>LEGAL FULL NAME</span>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', fontSize: '0.6rem', color: '#fff', fontWeight: 'bold' }}>Amara Diop</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>PHONE NUMBER</span>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', fontSize: '0.6rem', color: '#fff', fontWeight: 'bold' }}>+234 803 123 4567</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>CITY LOCATION NODE</span>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', fontSize: '0.6rem', color: '#fff', fontWeight: 'bold' }}>Lagos Node (LOS)</div>
              </div>
            </div>

            <button style={{ width: '100%', padding: '0.4rem', background: 'var(--primary)', border: 'none', borderRadius: '0.3rem', color: '#000', fontWeight: 'bold', fontSize: '0.55rem', marginTop: '0.1rem' }}>
              Next: Verify Phone
            </button>
          </div>
        </div>
      )
    },
    {
      title: "OTP Verification Inputs",
      badge: "Step 02",
      icon: <Smartphone size={18} />,
      desc: "Verify your phone node with a secure 4-digit OTP. Standard single-use codes secure your account identity.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          {/* Verification Code Inputs Card */}
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)' }}>ENTER 4-DIGIT VERIFICATION CODE</span>

            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', margin: '0.2rem 0' }}>
              {['5', '9', '1', '7'].map((num, i) => (
                <div key={i} style={{ width: '1.75rem', height: '2.25rem', border: '1px solid var(--primary)', borderRadius: '0.35rem', background: 'rgba(255,184,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {num}
                </div>
              ))}
            </div>

            <span style={{ fontSize: '0.45rem', color: 'var(--foreground-muted)' }}>Resend verification code in 45s</span>
            <button style={{ width: '100%', padding: '0.4rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.3rem', color: '#fff', fontWeight: 'bold', fontSize: '0.55rem' }}>
              Verify OTP Code
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Onboarding Flow Documents",
      badge: "Step 03",
      icon: <FileText size={18} />,
      desc: "Complete document onboarding. Securely upload driver licenses and certificates directly into the Cloudinary repository.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          {/* Onboarding Documents Card */}
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.25rem', display: 'block' }}>ONBOARDING ATTACHMENTS</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.2rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.35rem', padding: '0.35rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.5rem', color: '#fff' }}>1. Driver_License.jpg</span>
                <span style={{ fontSize: '0.45rem', color: 'var(--success)', fontWeight: 'bold' }}>VERIFIED OCR</span>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.35rem', padding: '0.35rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.5rem', color: '#fff' }}>2. Vehicle_Insurance.pdf</span>
                <span style={{ fontSize: '0.45rem', color: 'var(--success)', fontWeight: 'bold' }}>VERIFIED OCR</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,184,0,0.03)', border: '1px solid rgba(255,184,0,0.15)', padding: '0.4rem', borderRadius: '0.35rem', marginTop: '0.1rem' }}>
              <CheckCircle size={10} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.45rem', color: 'var(--foreground-muted)' }}>Files synced to Cloudinary vault</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Operator Vetting Flow",
      badge: "Step 04",
      icon: <ShieldCheck size={18} />,
      desc: "Operator vetting processes complete. Displays a detailed checklist showing fully verified assets and document locks.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          {/* Vetting audit checklist card */}
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)' }}>OPERATOR VETTED</span>
              <span style={{ fontSize: '0.45rem', color: 'var(--success)', fontWeight: 'bold' }}>VERIFIED</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {[
                { label: "Credentials Audit", val: "Approved" },
                { label: "Cloudinary Address", val: "Verified" },
                { label: "Agreement Signature", val: "Locked" }
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '0.3rem 0.5rem', borderRadius: '0.35rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.5rem', color: 'var(--foreground-muted)' }}>{row.label}</span>
                  <span style={{ fontSize: '0.5rem', fontWeight: 'bold', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                    <Check size={6} /> {row.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Secure Driver Login",
      badge: "Step 05",
      icon: <Key size={18} />,
      desc: "Connect your mobile node to the spatial grid. Enter your vetted partner username and security password.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', justifyContent: 'center' }}>
          {/* Login Form Card */}
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)' }}>PARTNER LOGIN</span>
              <span style={{ fontSize: '0.45rem', opacity: 0.6 }}>MESH SECURE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>USERNAME</span>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', fontSize: '0.6rem', color: '#fff', fontWeight: 'bold' }}>amara_diop</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>PASSWORD KEYS</span>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 'bold' }}>••••••••••••</div>
              </div>
            </div>

            <button style={{ width: '100%', padding: '0.4rem', background: 'var(--primary)', border: 'none', borderRadius: '0.3rem', color: '#000', fontWeight: 'bold', fontSize: '0.55rem', marginTop: '0.1rem' }}>
              Access Network Mesh
            </button>
          </div>
        </div>
      )
    },
    {
      title: "First-Timer Bonus Coins",
      badge: "Step 06",
      icon: <Gift size={18} />,
      desc: "Unlock your first-timer sign-up reward balance. Recieve +1,000 QCoins credited instantly to your ledger wallet.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          {/* Welcome Bonus Card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(255,184,0,0.2) 0%, rgba(255,184,0,0.03) 100%)', border: '1px solid rgba(255,184,0,0.35)', borderRadius: '0.75rem', padding: '0.85rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.3rem', boxShadow: '0 12px 36px rgba(255,184,0,0.15)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.5rem', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '0.05em' }}>FIRST-TIMER LEDGER BONUS</span>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontFamily: 'var(--font-outfit)' }}>
              <Coins size={20} /> +1,000 Coins
            </h3>

            <p style={{ fontSize: '0.5rem', color: '#fff', fontWeight: 'bold' }}>Welcome Partner Reward</p>
            <span style={{ fontSize: '0.4rem', color: 'var(--foreground-muted)' }}>Dispatched directly to driver account</span>
          </div>
        </div>
      )
    },
    {
      title: "Profile Management Cockpit",
      badge: "Step 07",
      icon: <User size={18} />,
      desc: "Manage your vetted operator credentials. Review safety scores, Tier rank, linked accounts, and active hardware registrations.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          {/* Driver Profile Dashboard */}
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>

            {/* Header with Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #ff8800 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', fontSize: '0.65rem', border: '1.5px solid #fff' }}>AD</div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 'bold' }}>Amara Diop</h4>
                <span style={{ fontSize: '0.4rem', color: 'var(--primary)', fontWeight: 'bold' }}>★ TIER-3 TRUSTED PARTNER</span>
              </div>
            </div>

            {/* Profile Statistics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', marginTop: '0.1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '0.35rem', padding: '0.3rem' }}>
                <span style={{ fontSize: '0.35rem', color: 'var(--foreground-muted)' }}>SAFETY RATING</span>
                <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', marginTop: '0.05rem' }}>4.95 / 5.0</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '0.35rem', padding: '0.3rem' }}>
                <span style={{ fontSize: '0.35rem', color: 'var(--foreground-muted)' }}>COMPLETED FARES</span>
                <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', marginTop: '0.05rem' }}>248 Trips</p>
              </div>
            </div>

            <div style={{ fontSize: '0.42rem', color: 'var(--foreground-dim)', textAlign: 'left', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '0.35rem', marginTop: '0.1rem' }}>
              🚗 Linked: Toyota Camry Hybrid (LOS-882-EV)
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Dashboard App Access",
      badge: "Step 08",
      icon: <Cpu size={18} />,
      desc: "Gain full dashboard controls. Review real-time vehicle parameters, EV statistics, and stand by for location match dispatching.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.3rem', display: 'block' }}>COCKPIT INSTRUMENTS</span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.2rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.4rem', padding: '0.4rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>PROPULSION</span>
                <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', marginTop: '0.1rem' }}>94% EV State</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.4rem', padding: '0.4rem' }}>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>GEOSPATIAL</span>
                <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', marginTop: '0.1rem' }}>Connected</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: '0.5rem', padding: '0.45rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.1rem', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.4rem', color: 'var(--foreground-muted)' }}>COCKPIT DISPATCH STATUS</span>
            <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)' }}>Standby for Matching</p>
          </div>
        </div>
      )
    },
    {
      title: "Ride Request Acceptance",
      badge: "Step 09",
      icon: <Car size={18} />,
      desc: "The real-time AI OS matching engine routes a high-yield ride offer. Click to secure passenger pickup instantly.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', justifyContent: 'center' }}>
          {/* High Fidelity Floating Ride Request Card */}
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid var(--primary)', borderRadius: '0.85rem', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 12px 36px rgba(255,184,0,0.2)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Sparkles size={8} className="animate-pulse" /> NEW TRIP REQUEST
              </span>
              <span style={{ fontSize: '0.45rem', background: 'rgba(255,184,0,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px', color: 'var(--primary)', fontWeight: 'bold' }}>15s LEFT</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.5rem', color: 'var(--foreground-dim)' }}>EST. NET EARNINGS:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--primary)' }}>$45.00 USD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.5rem', color: 'var(--foreground-dim)' }}>PICKUP DISTANCE:</span>
                <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff' }}>1.2 km (4 mins)</span>
              </div>
            </div>

            <button style={{ width: '100%', padding: '0.55rem', background: 'var(--primary)', border: 'none', borderRadius: '0.5rem', color: '#000', fontWeight: 'bold', fontSize: '0.65rem', boxShadow: '0 4px 12px rgba(255,184,0,0.3)', marginTop: '0.2rem' }}>
              Accept Ride Haul
            </button>
          </div>
        </div>
      )
    },
    {
      title: "Take Up Itinerary (Batched Courier)",
      badge: "Step 10",
      icon: <Layers size={18} />,
      desc: "Double your earnings with cart-first courier batching. Accept multi-stop courier itineraries aligned with passenger path.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', justifyContent: 'center' }}>
          {/* Batched Courier Details Card */}
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)' }}>LOGISTICS BATCHED</span>
              <span style={{ fontSize: '0.45rem', color: 'var(--success)', fontWeight: 'bold' }}>+50% INCOME</span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '0.4rem', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ background: 'var(--primary-glow)', padding: '0.3rem', borderRadius: '0.35rem', color: 'var(--primary)' }}>
                <Truck size={12} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff' }}>Simultaneous Courier Stop</p>
                <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>Weight Threshold: &lt; 5.0 kg</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.1rem' }}>
              <span style={{ fontSize: '0.5rem', color: 'var(--foreground-muted)' }}>Additional Commission:</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--success)' }}>+$22.00 USD</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Telemetry Map Movement",
      badge: "Step 11",
      icon: <Navigation size={18} />,
      desc: "Live GPS coordinates route your vehicle. Watch your cockpit indicator smoothly trace coordinate points to destination coordinates.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', justifyContent: 'center' }}>
          {/* Geospatial GPS Screen Map */}
          <div style={{ flex: 1, minHeight: '175px', background: '#020202', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)', zIndex: 1 }}>

            {/* Map Roads Simulation */}
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '15px 15px' }} />

            {/* Background Road path (Thick Vector Grey) */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <path d="M 25,35 Q 75,25 105,85 T 175,135" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" strokeLinecap="round" />
              <path d="M 25,35 Q 75,25 105,85 T 175,135" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="4 4" strokeLinecap="round" />
            </svg>

            {/* Starting Point Marker */}
            <div style={{ position: 'absolute', top: '35px', left: '25px', transform: 'translate(-50%, -50%)', width: '6px', height: '6px', background: '#fff', borderRadius: '50%', border: '1px solid #000', boxShadow: '0 0 4px #fff' }} />
            <div style={{ position: 'absolute', top: '45px', left: '25px', transform: 'translateX(-50%)', background: 'rgba(5,5,5,0.8)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.1rem 0.2rem', borderRadius: '3px', fontSize: '0.35rem', color: 'var(--foreground-muted)', whiteSpace: 'nowrap' }}>
              Pickup Node
            </div>

            {/* Destination Pin Marker */}
            <div style={{ position: 'absolute', top: '135px', left: '175px', transform: 'translate(-50%, -50%)', width: '10px', height: '100px', pointerEvents: 'none' }}>
              {/* Pulsing Target Ring */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', transform: 'translate(-50%, -50%)', borderRadius: '50%', background: 'var(--error)', border: '1px solid #fff', boxShadow: '0 0 8px var(--error)', animation: 'radarRed 1.5s infinite ease-out' }} />
              {/* Destination Tag */}
              <div style={{ position: 'absolute', top: '-15px', left: 0, transform: 'translateX(-50%)', background: 'rgba(239,68,68,0.9)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.1rem 0.25rem', borderRadius: '3px', fontSize: '0.35rem', color: '#fff', fontWeight: 'bold', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                LOS-Node
              </div>
            </div>

            {/* Animating Car along Curved GPS Road Path! */}
            <div className="telemetry-car-vehicle">
              {/* Gold Car Visual Element */}
              <div style={{ width: '14px', height: '14px', background: 'var(--primary)', border: '1.5px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', boxShadow: '0 0 8px var(--primary)' }}>
                <Navigation size={8} style={{ transform: 'rotate(90deg)' }} />
              </div>

              {/* Dynamic Floating Glass Tooltip moving WITH the driver car! */}
              <div className="telemetry-tooltip-floating">
                <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.4rem' }}>Amara Diop (EV)</span>
                <span style={{ opacity: 0.9 }}>94% SOC • Hybrid Camry</span>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Active Route</span>
              </div>
              <div className="telemetry-tooltip-notch" />
            </div>

            {/* Float HUD Over Map */}
            <div style={{ position: 'absolute', bottom: '0.4rem', left: '0.4rem', right: '0.4rem', background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.35rem 0.5rem', borderRadius: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.45rem', color: 'var(--foreground-muted)' }}>Speed: <b style={{ color: '#fff' }}>42 km/h</b></span>
              <span style={{ fontSize: '0.45rem', color: 'var(--primary)', fontWeight: 'bold' }}>ETA: 3 mins</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Commission Debit via Coins",
      badge: "Step 12",
      icon: <Coins size={18} />,
      desc: "Rather than taking cut from cash fares, the platform devalues service commissions directly from QCoins, leaving cash intact.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%', justifyContent: 'center' }}>
          {/* Commission ledger devalue card */}
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', textAlign: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--error)' }}>COMMISSION DEBIT SYNC</span>

            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.1rem', margin: '0.1rem 0' }}>
              <span style={{ fontSize: '0.4rem', color: 'var(--foreground-muted)' }}>PLATFORM COMMISSION FEE</span>
              <h4 style={{ fontSize: '1rem', fontWeight: 'black', color: 'var(--error)' }}>-10 QCoins</h4>
              <span style={{ fontSize: '0.4rem', color: 'var(--foreground-dim)' }}>Subtracted from coin holdings</span>
            </div>

            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.4rem', padding: '0.4rem', fontSize: '0.5rem', color: 'var(--success)', fontWeight: 'bold' }}>
              100% PASSENGER CASH RETAINED
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Driver Wallet Dashboard",
      badge: "Step 13",
      icon: <Coins size={18} />,
      desc: "Manage platform coins and cash ledger balances. Buy additional operational coins or review secure transaction ledgers.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          {/* Driver Wallet Cockpit Card */}
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.25rem', display: 'block' }}>DRIVER WALLET LEDGER</span>

            {/* Double balance grids */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginTop: '0.1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.35rem', padding: '0.35rem' }}>
                <span style={{ fontSize: '0.35rem', color: 'var(--foreground-muted)' }}>CASH ACCOUNT</span>
                <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--success)', marginTop: '0.05rem' }}>$320.00</p>
              </div>
              <div style={{ background: 'rgba(255,184,0,0.03)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: '0.35rem', padding: '0.35rem' }}>
                <span style={{ fontSize: '0.35rem', color: 'var(--primary)' }}>QCOIN BALANCE</span>
                <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.05rem' }}>1,000 Coins</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.1rem' }}>
              <button style={{ flex: 1, padding: '0.35rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '0.25rem', fontSize: '0.45rem', fontWeight: 'bold' }}>
                + Buy QCoins
              </button>
              <button style={{ flex: 1, padding: '0.35rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.25rem', fontSize: '0.45rem', fontWeight: 'bold' }}>
                Transaction History
              </button>
            </div>

            {/* Recent Transaction log */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '0.35rem', padding: '0.3rem', fontSize: '0.4rem', color: 'var(--foreground-dim)', textAlign: 'left', marginTop: '0.1rem' }}>
              🕒 Recent: Commission Debited (-10 Coins)
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Direct Bank Cash-Out",
      badge: "Step 14",
      icon: <Truck size={18} />,
      desc: "Withdraw cash reserves directly to your standard bank account. Platforms process withdrawals in under 2.5 seconds.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          {/* Bank Cash-Out Card */}
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.25rem', display: 'block' }}>SECURE SETTLEMENT DRAW-DOWN</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.45rem', color: 'var(--foreground-muted)' }}>CASH OUT AMOUNT:</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--success)' }}>$180.00 USD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.3rem 0.5rem', borderRadius: '0.35rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.45rem', color: 'var(--foreground-muted)' }}>PAYOUT NODE:</span>
                <span style={{ fontSize: '0.45rem', fontWeight: 'bold', color: '#fff' }}>St. Chartered •••• 4820</span>
              </div>
            </div>

            {/* Instant verification lock status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.4rem', borderRadius: '0.35rem', marginTop: '0.2rem', textAlign: 'left' }}>
              <CheckCircle size={12} style={{ color: 'var(--success)' }} />
              <div>
                <p style={{ fontSize: '0.5rem', color: 'var(--success)', fontWeight: 'bold' }}>SETTLEMENT DISPATCHED</p>
                <span style={{ fontSize: '0.38rem', color: 'var(--foreground-dim)' }}>Sub-second verification complete</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Detailed Receipt & Rating",
      badge: "Step 15",
      icon: <Star size={18} />,
      desc: "Instant trip invoice split calculation. Passengers provide feedback text and star ratings upon cashless transaction settlement.",
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', justifyContent: 'center' }}>
          {/* Final Receipt Feedback Card */}
          <div style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', boxShadow: '0 12px 36px rgba(0,0,0,0.6)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 'bold', color: 'var(--primary)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.3rem', display: 'block' }}>TRIP COMPLETION INVOICE</span>

            {/* detailed invoice splits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.42rem', color: 'var(--foreground-dim)', textAlign: 'left', margin: '0.1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Base Fare:</span>
                <span style={{ color: '#fff' }}>$45.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Logistics Courier Batch:</span>
                <span style={{ color: '#fff' }}>+$22.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.15rem' }}>
                <span>Surge Multiplier:</span>
                <span style={{ color: '#fff' }}>1.0x</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '0.1rem' }}>
                <span style={{ color: 'var(--primary)' }}>NET EARNINGS PAID:</span>
                <span style={{ color: 'var(--success)' }}>$67.00 USD</span>
              </div>
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center', margin: '0.15rem 0' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={10} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
              ))}
            </div>

            <p style={{ fontSize: '0.55rem', fontWeight: 'bold', color: '#fff', fontStyle: 'italic' }}>"Excellent ride, hybrid EV was silent!"</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

      {/* Self-contained CSS for Golden Pulsing Location beacon and fading slides */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes goldenRadarPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            box-shadow: 0 0 0 0 rgba(255, 184, 0, 0.85), 0 0 12px 2px rgba(255, 184, 0, 0.55);
          }
          70% {
            transform: translate(-50%, -50%) scale(1.25);
            box-shadow: 0 0 0 20px rgba(255, 184, 0, 0), 0 0 24px 4px rgba(255, 184, 0, 0);
          }
          100% {
            transform: translate(-50%, -50%) scale(0.8);
            box-shadow: 0 0 0 0 rgba(255, 184, 0, 0), 0 0 0 0 rgba(255, 184, 0, 0);
          }
        }
        .golden-beacon-pointer {
          position: absolute;
          width: 14px;
          height: 14px;
          background: #FFB800;
          border: 2px solid #ffffff;
          border-radius: 50%;
          z-index: 1;
          animation: goldenRadarPulse 2s infinite ease-out;
          filter: drop-shadow(0 0 6px var(--primary));
        }
        .golden-beacon-pointer::after {
          content: '';
          position: absolute;
          inset: 3px;
          background: #000000;
          border-radius: 50%;
        }

        /* En-Route Telemetry Curved Path Animation using CSS offset-path */
        @keyframes travelAlongPath {
          0% { offset-distance: 0%; transform: rotate(0deg); }
          100% { offset-distance: 100%; transform: rotate(0deg); }
        }
        .telemetry-car-vehicle {
          position: absolute;
          width: 14px;
          height: 14px;
          z-index: 5;
          offset-path: path('M 25,35 Q 75,25 105,85 T 175,135');
          animation: travelAlongPath 10s infinite linear;
          transform-origin: center;
        }

        /* Glassmorphic micro-tooltip moving synchronously with the car */
        .telemetry-tooltip-floating {
          position: absolute;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          background: rgba(5, 5, 5, 0.95);
          backdrop-filter: blur(4px);
          border: 1px solid var(--primary);
          padding: 0.25rem 0.4rem;
          border-radius: 0.3rem;
          box-shadow: 0 4px 16px rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          gap: 1px;
          pointer-events: none;
        }
        .telemetry-tooltip-floating span {
          display: block;
          font-family: monospace;
          font-size: 0.35rem;
          line-height: 1.2;
          color: #fff;
        }
        .telemetry-tooltip-notch {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 5px;
          height: 5px;
          background: rgba(5, 5, 5, 0.95);
          border-right: 1px solid var(--primary);
          border-bottom: 1px solid var(--primary);
          z-index: 4;
          pointer-events: none;
        }

        @keyframes radarRed {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}} />

      {/* 1. Cinematic Hero Section */}
      <section className="glass-card glass-card-accent" style={{ position: 'relative', overflow: 'hidden', padding: '3.5rem 2rem', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(255, 184, 0, 0.08) 0%, transparent 60%)', pointerEvents: 'none' }}></div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-glow)', border: '1px solid rgba(255,184,0,0.2)', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)', marginBottom: '1.5rem' }}>
          <Sparkles size={12} /> Transport OS Showcase
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', fontFamily: 'var(--font-outfit)', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '1rem', background: 'linear-gradient(135deg, #ffffff 30%, #FFB800 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          The Unified Mobility Operating System
        </h1>

        <p style={{ maxWidth: '720px', margin: '0 auto 2.5rem auto', fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', color: 'var(--foreground-muted)' }}>
          Orchestrating urban taxi hauls, B2B courier logistics, intercity transits, and global flight aggregation. Powered by an intelligent AI Agent layer over Temporal workflows.
        </p>

        {/* Quick CTA Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.25rem' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('driver')} style={{ minWidth: '220px', fontSize: '0.85rem' }}>
            <Car size={16} /> Driver Partner Signup
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('user')} style={{ minWidth: '220px', fontSize: '0.85rem' }}>
            <User size={16} /> Explore Passenger Center
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('admin')} style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'transparent', fontSize: '0.85rem' }}>
            <ShieldAlert size={16} /> Operator Vetting Console
          </button>
        </div>
      </section>

      {/* 2. Driver Benefits Grid */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.5rem' }}>
            Empowering Our Driver Partners
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--foreground-muted)' }}>
            Why leading suppliers select the Queens OS network for ultimate efficiency and earnings scaling.
          </p>
        </div>

        <div className="grid-2" style={{ gap: '2rem' }}>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
                <Zap size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)' }}>Transparent Surge Multipliers</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>AI Telemetry Driven</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem' }}>
              No hidden platform fees or random adjustments. Our real-time AI mobility graph measures live demand clusters, offering transparent multipliers up to 2.5x during high congestion, keeping your vehicle utilized and highly paid.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
                <Layers size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)' }}>Logistics Multi-Tasking</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>Double Your Earnings</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem' }}>
              Never run dry return trips. Seamlessly batch passenger taxi rides with scheduled parcel delivery hauls. Our B2B logistics routing coordinates pickups directly along your path to optimize every mile driven.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
                <Gift size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)' }}>Milestone Payouts & QCoins</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>Gamified Growth Loops</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem' }}>
              Earn extra rewards through our milestone ledger! Receive direct coin bonuses upon completing documents vetting, maintaining high ratings, and referring driver colleagues. Exchange QCoins for immediate cash payouts or discounted fuel vouchers.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)' }}>
                <Compass size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)' }}>Flexible Partner Leases</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: 'bold' }}>Vehicle Finance Options</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem' }}>
              Unlock vehicle lease-to-own programs. Verified driver partners with excellent safety scores get prioritized access to our low-interest hybrid and EV fleet financing options, allowing you to own your high-yield vehicle.
            </p>
          </div>

        </div>
      </section>


      {/* 3. Interactive Phone Mockup Slideshow */}
      <section className="glass-card" style={{ padding: '3rem 2rem', background: 'rgba(255,255,255,0.01)', border: 'var(--border-glass)' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            <Smartphone size={14} /> Interactive Experience
          </div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.5rem' }}>
            Cinematic Driver Onboarding & Telemetry
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--foreground-muted)' }}>
            Follow the step-by-step transaction flow, from initial signup to seamless QCoins payouts.
          </p>
        </div>

        <div className="mobile-showcase-container">

          {/* Left Column: Glassmorphic Phone Casing */}
          <div className="showcase-phone-column">
            <div className="phone-mockup-frame">
              <div className="phone-mockup-notch" />
              <div className="phone-mockup-screen" style={{ position: 'relative', overflow: 'hidden' }}>

                {/* 1. iOS Style Top Status Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.52rem', fontWeight: 'bold', color: 'var(--foreground-muted)', marginBottom: '0.35rem', padding: '0.2rem 0.4rem 0 0.4rem', zIndex: 2 }}>
                  <span>9:41</span>
                  <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.4rem', opacity: 0.8 }}>5G</span>
                    <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '5px' }}>
                      <div style={{ width: '1px', height: '1.5px', background: 'var(--foreground-muted)' }}></div>
                      <div style={{ width: '1px', height: '2.5px', background: 'var(--foreground-muted)' }}></div>
                      <div style={{ width: '1px', height: '3.5px', background: 'var(--foreground-muted)' }}></div>
                      <div style={{ width: '1px', height: '4.5px', background: 'var(--foreground-muted)' }}></div>
                    </div>
                    <div style={{ width: '11px', height: '5px', border: '1px solid var(--foreground-muted)', borderRadius: '1.5px', display: 'flex', alignItems: 'center', padding: '0.5px' }}>
                      <div style={{ width: '80%', height: '100%', background: 'var(--foreground-muted)', borderRadius: '0.5px' }}></div>
                    </div>
                  </div>
                </div>

                {/* 2. Premium Queens OS Mobile Header App Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0.45rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,5,5,0.5)', backdropFilter: 'blur(8px)', zIndex: 2, marginBottom: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ width: '16px', height: '16px', background: 'var(--primary)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 'bold', color: '#000' }}>Q</div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 'bold', fontFamily: 'var(--font-outfit)', color: '#fff', letterSpacing: '-0.01em' }}>Queens OS</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                    <span style={{ width: '4px', height: '4px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 4px var(--success)' }}></span>
                    <span style={{ fontSize: '0.5rem', color: 'var(--foreground-muted)', fontWeight: 'bold' }}>LOS-HUB</span>
                  </div>
                </div>

                {/* 3. High Fidelity Offline Vector Road view Map Background (EVERY SLIDE!) */}
                <svg
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    background: '#040404',
                    pointerEvents: 'none'
                  }}
                  viewBox="0 0 200 400"
                  preserveAspectRatio="none"
                >
                  {/* Primary Highways (Thicker Gold/Amber Strokes) */}
                  <path d="M 0,80 Q 80,90 120,40 T 200,30" stroke="rgba(255, 184, 0, 0.16)" strokeWidth="3" fill="none" />
                  <path d="M 40,0 Q 60,150 140,250 T 160,400" stroke="rgba(255, 184, 0, 0.16)" strokeWidth="3.5" fill="none" />
                  <path d="M 0,320 C 60,310 140,350 200,310" stroke="rgba(255, 184, 0, 0.14)" strokeWidth="2.5" fill="none" />

                  {/* Secondary Streets (Thinner Grey/White Paths) */}
                  <path d="M 0,160 L 200,180" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.2" fill="none" />
                  <path d="M 0,240 Q 90,220 200,260" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" fill="none" />
                  <path d="M 100,0 L 100,400" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" fill="none" />
                  <path d="M 10,0 Q 20,200 180,400" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.8" fill="none" />
                  <path d="M 190,0 Q 180,200 20,400" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.8" fill="none" />

                  {/* Roundabout Hub */}
                  <circle cx="115" cy="120" r="16" stroke="rgba(255, 184, 0, 0.18)" strokeWidth="2" fill="none" />
                  <circle cx="115" cy="120" r="4" fill="rgba(255, 184, 0, 0.22)" />
                </svg>

                {/* 4. Pulsing Golden GPS Locator Indicator Beacon (Precisely centered on Roundabout Hub!) */}
                <div
                  className="golden-beacon-pointer"
                  style={{
                    top: '30%',
                    left: '57.5%',
                    pointerEvents: 'none'
                  }}
                />

                {/* 5. Animated Inner Viewport Slide Content */}
                <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 1, position: 'relative' }}>
                  {slidesData[activeSlide].content}
                </div>

                {/* 6. Mobile Tab Navigation Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '0.35rem 0', marginTop: '0.6rem', zIndex: 2, borderRadius: '0.5rem 0.5rem 0 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeSlide <= 7 ? 'var(--primary)' : 'var(--foreground-dim)' }}>
                    <Car size={10} />
                    <span style={{ fontSize: '0.4rem', marginTop: '0.1rem' }}>Drive</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: (activeSlide >= 8 && activeSlide <= 10) ? 'var(--primary)' : 'var(--foreground-dim)' }}>
                    <Navigation size={10} />
                    <span style={{ fontSize: '0.4rem', marginTop: '0.1rem' }}>Match</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeSlide === 9 ? 'var(--primary)' : 'var(--foreground-dim)' }}>
                    <Truck size={10} />
                    <span style={{ fontSize: '0.4rem', marginTop: '0.1rem' }}>Logistics</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeSlide >= 11 ? 'var(--primary)' : 'var(--foreground-dim)' }}>
                    <Coins size={10} />
                    <span style={{ fontSize: '0.4rem', marginTop: '0.1rem' }}>Wallet</span>
                  </div>
                </div>

                <div className="phone-mockup-indicator" />
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Feature Steppers Selector */}
          <div className="showcase-info-column" style={{ maxHeight: '580px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {slidesData.map((slide, idx) => (
              <button
                key={idx}
                className={`showcase-stepper-btn ${idx === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(idx)}
                style={{ width: '100%', marginBottom: '0.5rem', padding: '0.75rem 1rem' }}
              >
                <div className="showcase-stepper-icon-box" style={{ padding: '0.35rem' }}>
                  {slide.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.1rem' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'var(--font-outfit)', color: '#fff' }}>
                      {slide.title}
                    </h3>
                    <span className="badge" style={{ background: idx === activeSlide ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)', color: idx === activeSlide ? 'var(--primary)' : 'var(--foreground-dim)', border: idx === activeSlide ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)', fontSize: '0.45rem', padding: '0.1rem 0.3rem' }}>
                      {slide.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.7rem', lineHeight: '1.4' }}>
                    {slide.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

        </div>
      </section>



      {/* Shiny Coins Section */}
      <section className="glass-card glass-card-accent" style={{ padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(255, 184, 0, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

        <div style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '1rem', background: 'linear-gradient(135deg, rgba(255,184,0,0.2) 0%, rgba(255,184,0,0.05) 100%)', borderRadius: '50%', border: '1px solid rgba(255,184,0,0.3)', boxShadow: '0 0 30px rgba(255,184,0,0.2)' }}>
          <Coins size={48} color="#FFB800" />
        </div>

        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'var(--font-outfit)', marginBottom: '1rem', background: 'linear-gradient(135deg, #FFB800 30%, #FFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Queens Coins
        </h2>

        <p style={{ maxWidth: '800px', margin: '0 auto 2rem auto', fontSize: '1.1rem', color: 'var(--foreground-muted)', lineHeight: '1.6' }}>
          We are pioneering a new paradigm in digital wealth generation through Proof of Useful Work. By participating in the Queens OS ecosystem—whether as a driver partner or a passenger—you seamlessly acquire crypto assets. This embedded utility allows the platform to process network commissions entirely through Queens Coins, ensuring 100% of your cash earnings remain untouched while your digital portfolio scales.
        </p>

        <button className="btn btn-primary" onClick={() => onNavigate('coins')} style={{ padding: '0.85rem 2.5rem', fontSize: '1.05rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', zIndex: 1, boxShadow: '0 8px 24px rgba(255,184,0,0.3)' }}>
          <Sparkles size={20} /> Explore More: Driver Early Access
        </button>
      </section>

      {/* 4. Early Access Benefits */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            ✦ Exclusive Early Access
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: 'var(--font-outfit)', marginBottom: '0.5rem' }}>
            Join Before the Masses
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--foreground-muted)', maxWidth: '560px', margin: '0 auto' }}>
            Limited perks for those who move first. Passengers, drivers, and crypto adopters each unlock a dedicated tier of founding privileges.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' }}>

          {/* Passenger Benefits */}
          <div className="glass-card" style={{ borderTop: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '0.6rem', borderRadius: '0.75rem', color: '#3b82f6', flexShrink: 0 }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)', color: '#fff' }}>For Passengers</h3>
                <span style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: '800', textTransform: 'uppercase' }}>Founding Rider Perks</span>
              </div>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { icon: '🎟️', text: '3 free rides credited on account activation — no promo code needed.' },
                { icon: '💰', text: 'Every fare earns passive QCoin cashback, building your digital wallet automatically.' },
                { icon: '🎮', text: 'In-app minigame booster: play during active rides for a 3× coin generation multiplier.' },
                { icon: '⭐', text: 'Founding Tier badge — permanent priority queue during peak-hour surge periods.' },
                { icon: '🔗', text: 'Earn +50 QCN per friend referred, +100 QCN when they complete driver vetting.' },
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>
                  <span style={{ flexShrink: 0, fontSize: '1rem' }}>{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Driver Benefits */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255,184,0,0.1)', padding: '0.6rem', borderRadius: '0.75rem', color: 'var(--primary)', flexShrink: 0 }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="m16 8 5 2v4l-5 2" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)', color: '#fff' }}>For Driver Partners</h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>Genesis Operator Tier</span>
              </div>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { icon: '🪙', text: '+1,000 QCoin Genesis Airdrop credited instantly on approved onboarding.' },
                { icon: '💸', text: '100% of passenger cash fares retained — platform commissions deducted via QCoins only.' },
                { icon: '🚗', text: 'Zero-deposit EV & hybrid lease-to-own scheme for Tier 1 verified founding partners.' },
                { icon: '🏆', text: 'Trip milestone coin rewards: 50 trips, 100 trips, 500 trips — each tier unlocks a coin bonus drop.' },
                { icon: '🗳️', text: 'Founding drivers hold voting rights in the first ever Queens Driver Council elections.' },
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>
                  <span style={{ flexShrink: 0, fontSize: '1rem' }}>{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Crypto Early Adopter Benefits */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--success)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.6rem', borderRadius: '0.75rem', color: 'var(--success)', flexShrink: 0 }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.5 8H14a2.5 2.5 0 0 1 0 5H9.5V8z" /><path d="M9.5 13H15a2.5 2.5 0 0 1 0 5H9.5V13z" /><line x1="9.5" y1="8" x2="9.5" y2="18" /><line x1="7" y1="11" x2="7" y2="11" /></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)', color: '#fff' }}>Crypto Early Adopters</h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: '800', textTransform: 'uppercase' }}>QCoin Genesis Access</span>
              </div>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { icon: '🔐', text: 'Secure non-custodial wallet — you hold your private keys, not us.' },
                { icon: '📈', text: 'Genesis bundle pricing locked at founding rates before open-market listing.' },
                { icon: '⛽', text: 'Use QCoins to pay EV charging, vehicle maintenance, and platform subscriptions at a 15% discount.' },
                { icon: '🌱', text: 'Proof of Useful Work: coins generated by real transport activity, not wasteful mining computation.' },
                { icon: '🎁', text: 'Early stakers qualify for governance token allocation in the upcoming QueensDAO ecosystem vote.' },
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>
                  <span style={{ flexShrink: 0, fontSize: '1rem' }}>{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* 5. AI OS Worker Command Center Simulation */}
      <section className="glass-card" style={{ background: '#020202', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
          <Cpu style={{ color: 'var(--primary)' }} size={20} />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-outfit)' }}>AI OS Execution Telemetry</h3>
            <span style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>Live Temporal & NATS Agent Listener Logs</span>
          </div>
          <span className="badge badge-approved" style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '0.2rem 0.5rem' }}>
            System Standby
          </span>
        </div>

        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#B5CEA8', background: '#000', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
          <p><span style={{ color: 'var(--primary)' }}>[14:38:02]</span> <span style={{ color: 'var(--success)' }}>[AI Agent]</span> Standing by for voice/text intents proxying from API Gateway (port 12000)...</p>
          <p><span style={{ color: 'var(--primary)' }}>[14:38:05]</span> <span style={{ color: 'var(--success)' }}>[AI Agent]</span> Intent received: "Request swift pickup from Westminster to Paddington"</p>
          <p><span style={{ color: 'var(--primary)' }}>[14:38:06]</span> <span style={{ color: '#E5C07B' }}>[NATS]</span> Emitted schema event "os.ride.requested" to connection cluster</p>
          <p><span style={{ color: 'var(--primary)' }}>[14:38:07]</span> <span style={{ color: '#98C379' }}>[Temporal]</span> Launched rideLifecycleWorkflow (wf_ride_demo_228)</p>
          <p><span style={{ color: 'var(--primary)' }}>[14:38:07]</span> <span style={{ color: '#98C379' }}>[Temporal]</span> executing activity: assignDriver (radius search: 1.5km)</p>
          <p><span style={{ color: 'var(--primary)' }}>[14:38:09]</span> <span style={{ color: '#56B6C2' }}>[Ride Service]</span> Assigned Driver Partner "Amara Diop" (Toyota Camry Hybrid)</p>
          <p><span style={{ color: 'var(--primary)' }}>[14:38:10]</span> <span style={{ color: '#E5C07B' }}>[NATS]</span> Emitted "os.ride.assigned" with passenger pickup OTP: 4820</p>
          <p><span style={{ color: 'var(--primary)' }}>[14:38:10]</span> <span style={{ color: '#98C379' }}>[Temporal]</span> Workflow awaiting verification signal (otpVerifiedSignal)...</p>
        </div>
      </section>

    </div>
  );
}
