import { ArrowLeft, Wallet, CreditCard, BatteryCharging, ShieldCheck, Zap, Activity, Coins, TrendingUp } from 'lucide-react';

interface CoinGenerationSystemProps {
  onNavigate: (tab: 'home' | 'driver' | 'user' | 'admin' | 'coins' | 'coin-gen') => void;
}

export default function CoinGenerationSystem({ onNavigate }: CoinGenerationSystemProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Back Navigation */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button 
          onClick={() => onNavigate('coins')} 
          style={{ background: 'transparent', border: 'none', color: 'var(--foreground-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back to Coin Architecture
        </button>
      </div>

      {/* Main Dashboard Hero */}
      <section className="glass-card" style={{ padding: '3rem 2rem', position: 'relative', overflow: 'hidden', border: '1px solid var(--primary)', boxShadow: '0 12px 48px rgba(255,184,0,0.1)' }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255, 184, 0, 0.1) 0%, transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
            
            <div style={{ flex: '1', minWidth: '300px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '1rem' }}>
                <Activity size={14} /> LIVE LEDGER NODE
              </div>
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', fontFamily: 'var(--font-outfit)', marginBottom: '0.5rem', color: '#fff' }}>
                Coin Generation Matrix
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--foreground-muted)' }}>
                Acquire, store, and deploy Queens Coins. Fund your secure wallet to cover network commissions and unlock exclusive mobility benefits.
              </p>
            </div>

            {/* Wallet Balance Card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(30,30,30,0.95) 100%)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '1rem', minWidth: '320px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', fontWeight: 'bold' }}>SECURE WALLET BALANCE</span>
                <Wallet size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-outfit)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                1,450.00 <span style={{ fontSize: '1rem', color: 'var(--primary)' }}>QCN</span>
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '1rem' }}>
                <button className="btn btn-primary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <CreditCard size={16} /> Buy Coins
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={16} /> Trade / Swap
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Utility Ecosystem */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.5rem' }}>
            The Ultimate Ecosystem Multiplier
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--foreground-muted)' }}>
            Why leading suppliers store their wealth in Queens Coins.
          </p>
        </div>

        <div className="grid-3" style={{ gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '2rem 1.5rem' }}>
            <div style={{ background: 'rgba(255, 184, 0, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--primary)', width: 'fit-content', marginBottom: '1rem' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.5rem' }}>Zero Cash Commission</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
              100% of physical cash from fares goes directly into your bank. Platform deductions (typically 20%) are debited dynamically from your QCoin wallet instead. Keeping your liquid assets liquid.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem 1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: 'var(--success)', width: 'fit-content', marginBottom: '1rem' }}>
              <BatteryCharging size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.5rem' }}>EV Charging Subsidies</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
              Pay for hybrid fuel and EV charging across our global supplier network using your generated QCoins. Receive up to a 15% discount on energy costs by opting for crypto payments at partnered hubs.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem 1.5rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '0.75rem', color: '#3b82f6', width: 'fit-content', marginBottom: '1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.5rem' }}>Priority Algorithm Match</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
              Drivers holding a premium balance of QCoins get VIP "Tier 1" access to the matching engine. You receive priority alerts for high-yield multi-stop courier routes before standard cash-only drivers.
            </p>
          </div>

        </div>
      </section>

      {/* Gamification & Proof of Useful Work */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.5rem' }}>
            Proof of Gamified Work
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--foreground-muted)' }}>
            Generating coins is tied to ecosystem utility. The more you engage, the higher your minting yield.
          </p>
        </div>

        <div className="grid-2" style={{ gap: '2rem' }}>
          
          {/* Driver Gamification */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--primary)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} color="var(--primary)" /> For Driver Partners
            </h3>
            
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', padding: '0.3rem', borderRadius: '50%', display: 'inline-flex' }}>
                  <TrendingUp size={16} />
                </span>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.2rem' }}>Completed Trips Milestone</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Receive tiered coin payouts for hitting trip milestones (e.g., 50, 100, 500 trips). Higher ratings act as a multiplier on your milestone payout.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', padding: '0.3rem', borderRadius: '50%', display: 'inline-flex' }}>
                  <ShieldCheck size={16} />
                </span>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.2rem' }}>Daily Quests & Challenges</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Complete targeted logistics quests, such as accepting 3 courier batch deliveries during peak hours, to instantly unlock bonus QCN drops.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', padding: '0.3rem', borderRadius: '50%', display: 'inline-flex' }}>
                  <BatteryCharging size={16} />
                </span>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.2rem' }}>Eco-Driving Streak</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Maintain smooth acceleration and EV efficiency. The OS telemetry monitors eco-friendly driving and rewards streaks with daily coin injections.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* User Gamification */}
          <div className="glass-card" style={{ borderTop: '4px solid var(--success)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--success)" /> For Passengers & Users
            </h3>
            
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.3rem', borderRadius: '50%', display: 'inline-flex' }}>
                  <CreditCard size={16} />
                </span>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.2rem' }}>Standard Ride Bookings</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Every fiat dollar spent on taxi fares or intercity coaches automatically yields a fractional "Cashback" equivalent in QCN directly to your passenger wallet.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.3rem', borderRadius: '50%', display: 'inline-flex' }}>
                  <Activity size={16} />
                </span>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.2rem' }}>In-Transit Minigames (Booster)</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Play integrated casual games in the Queens OS app while on an active ride. Gameplay during a transit applies a massive 3x booster multiplier to your coin generation!</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '0.3rem', borderRadius: '50%', display: 'inline-flex' }}>
                  <Coins size={16} />
                </span>
                <div>
                  <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.2rem' }}>Idle Play Yields</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Playing the minigames without an active ride booking still earns you coins, but at a base fractional rate. Book a ride to supercharge your playtime!</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Buy/Generate Interface Mockup */}
      <section className="glass-card" style={{ padding: '3rem 2rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,10,10,0.6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
          <Coins size={40} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-outfit)' }}>Acquire Utility Tokens</h2>
          <p style={{ color: 'var(--foreground-muted)' }}>
            To participate in the zero-cash-commission network, ensure your wallet is funded. You can buy Queens Coins directly using fiat or earn them by completing gamified ecosystem requests.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s ease' }} className="hover-scale">
              <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Buy $50 Bundle</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>Yields: 5,000 QCN</p>
            </div>
            <div style={{ flex: '1 1 200px', background: 'rgba(255,184,0,0.05)', border: '1px solid var(--primary)', borderRadius: '0.75rem', padding: '1.5rem', cursor: 'pointer', position: 'relative' }} className="hover-scale">
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--success)', color: '#fff', fontSize: '0.6rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', borderRadius: '1rem', textTransform: 'uppercase' }}>Best Value</div>
              <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Buy $200 Bundle</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>Yields: 22,500 QCN</p>
            </div>
            <div style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s ease' }} className="hover-scale">
              <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Buy $500 Bundle</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>Yields: 60,000 QCN</p>
            </div>
          </div>
          
          <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
            Connect Bank to Purchase
          </button>
        </div>
      </section>

    </div>
  );
}
