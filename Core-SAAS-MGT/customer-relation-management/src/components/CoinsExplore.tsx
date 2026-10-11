import { ArrowLeft, Coins, TrendingUp, ShieldCheck, Lock, Gift, DollarSign, Sparkles } from 'lucide-react';

interface CoinsExploreProps {
  onNavigate: (tab: 'home' | 'driver' | 'user' | 'admin' | 'coins' | 'coin-gen') => void;
}

export default function CoinsExplore({ onNavigate }: CoinsExploreProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Back Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button 
          onClick={() => onNavigate('home')} 
          style={{ background: 'transparent', border: 'none', color: 'var(--foreground-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back to Ecosystem Home
        </button>
      </div>

      {/* Hero Section */}
      <section className="glass-card glass-card-accent" style={{ textAlign: 'center', padding: '4rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at top center, rgba(255, 184, 0, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        
        <div style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '1rem', background: 'linear-gradient(135deg, rgba(255,184,0,0.2) 0%, rgba(255,184,0,0.05) 100%)', borderRadius: '50%', border: '1px solid rgba(255,184,0,0.3)', boxShadow: '0 0 30px rgba(255,184,0,0.2)' }}>
          <Coins size={48} color="#FFB800" />
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', fontFamily: 'var(--font-outfit)', marginBottom: '1rem', background: 'linear-gradient(135deg, #FFB800 30%, #FFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Dismantling the Coin Approach
        </h1>
        
        <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', color: 'var(--foreground-muted)', lineHeight: '1.6' }}>
          We are redefining mobility by embedding crypto utility directly into your daily workflow. Get early access as a driver partner, earn digital wealth alongside your regular cash income, and let Queens Coins handle all platform commissions seamlessly.
        </p>
      </section>

      {/* Details Grid */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.5rem' }}>
            Why Queens Coins?
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--foreground-muted)' }}>
            Understanding the utility and benefits of our built-in crypto ecosystem.
          </p>
        </div>

        <div className="grid-2" style={{ gap: '2rem' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)', width: 'fit-content' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)' }}>Proof of Useful Work</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
              Forget mining with GPUs. Queens Coins are distributed based on "Proof of Useful Work." Every mile driven, every package delivered, and every passenger securely transported directly contributes to the network and rewards you with tokens.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--success)', width: 'fit-content' }}>
              <DollarSign size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)' }}>Commission-Free Cash</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
              Traditional ride-hailing apps take 20-30% of your cash. The Queens OS network charges 0% cash commission. Instead, platform fees are settled transparently by burning a small fraction of your Queens Coins, letting you keep 100% of passenger cash.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: '#3b82f6', width: 'fit-content' }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)' }}>Secure Digital Wealth</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
              Integrated directly into your Driver Portal wallet, your coins are secured by cryptographic ledgers. They can be held for long-term appreciation or seamlessly swapped on supported decentralized exchanges.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: '#ec4899', width: 'fit-content' }}>
              <Gift size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)' }}>Early Access Airdrops</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
              As a foundational driver partner, you are eligible for the Phase 1 Genesis Airdrop. Complete your vetting and onboarding now to receive your welcome bonus of 1,000 QCoins, kickstarting your digital portfolio before the public launch.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem', background: 'linear-gradient(135deg, rgba(10,10,10,0.9) 0%, rgba(20,20,20,0.9) 100%)', border: '1px solid rgba(255,184,0,0.2)' }}>
        <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-outfit)', marginBottom: '1rem' }}>
          Ready to Start Earning?
        </h2>
        <p style={{ color: 'var(--foreground-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto' }}>
          Join the mobility revolution. Onboard today, secure your vehicle match, and receive your Early Access QCoin Airdrop.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.25rem' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('driver')} style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} /> Begin Driver Onboarding
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('coin-gen')} style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <Coins size={18} /> Access Coin Generator Hub
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--foreground-dim)', marginTop: '1.5rem' }}>
          Already signed up? Navigate to the Generator Hub to manage wallets, swap assets, and buy coin bundles.
        </p>
      </section>

    </div>
  );
}
