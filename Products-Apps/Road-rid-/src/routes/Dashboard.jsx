import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="home-root" style={{ backgroundColor: 'var(--color-black)', color: 'var(--color-white)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section className="home-section" style={{ padding: '64px 0', borderBottom: '1px solid var(--color-border-gold)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '800', marginBottom: '48px', lineHeight: '1.1', color: 'var(--color-white)' }}>Get ready for your first trip</h1>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', maxWidth: '800px' }}>
            <div style={{ flex: 1, backgroundColor: 'var(--color-surface-card)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', border: '1px solid var(--color-border-gold)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', marginRight: '12px' }}></div>
                <input type="text" placeholder="Pickup location" style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '16px', color: 'var(--color-white)' }} />
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--color-surface-card)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', border: '1px solid var(--color-border-gold)' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-gold)', marginRight: '12px' }}></div>
                <input type="text" placeholder="Dropoff location" style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '16px', color: 'var(--color-white)' }} />
            </div>
            <Link to="/ride"><button style={{ padding: '16px 32px', borderRadius: '8px', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}>See prices</button></Link>
          </div>
        </div>
      </section>

      {/* Book your trip section */}
      <section className="home-section" style={{ padding: '64px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '48px', color: 'var(--color-white)' }}>Book your trip on your phone or computer</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
            {[
              { title: '1. Add your trip details', desc: 'Enter your pickup spot and destination, and check prices for your trip.' },
              { title: '2. Pay easily', desc: 'Add your preferred payment method, then choose among the ride options available in your location.' },
              { title: '3. Meet your driver', desc: 'Uber will match you with a driver nearby, and you\'ll get updates on your phone or computer about when to meet them.' },
            ].map((step, i) => (
              <div key={i}>
                <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--color-surface-card)', marginBottom: '24px', borderRadius: '12px', border: '1px solid var(--color-border-gold)' }}></div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'var(--color-gold)' }}>{step.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', lineHeight: '1.5' }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/ride"><button style={{ marginTop: '32px', padding: '12px 24px', borderRadius: '24px', backgroundColor: 'var(--color-surface-card)', color: 'var(--color-white)', fontWeight: '600', cursor: 'pointer', fontSize: '16px', border: '1px solid var(--color-border-gold)' }}>Book your first ride</button></Link>
        </div>
      </section>

      {/* Ways to ride */}
      <section className="home-section" style={{ padding: '64px 0', borderTop: '1px solid var(--color-border-gold)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '48px', color: 'var(--color-white)' }}>Ways to ride and more</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {[
                  { name: 'Ride', path: '/ride', desc: 'Safe, affordable rides across Lagos.' },
                  { name: 'Reserve', path: '/reserve', desc: 'Book your ride up to 90 days in advance.' },
                  { name: 'Courier', path: '/courier', desc: 'Send packages and parcels in real time.' },
                  { name: 'Flights', path: '/flights', desc: 'Compare and book domestic & international flights.' },
                  { name: 'Shipping & Cargo', path: '/shipping', desc: 'Logistics, cargo tracking, and global delivery.' },
                  { name: 'SOS Safety Hub', path: '/sos', desc: 'Emergency broadcast alerts and safety contacts.' },
                ].map(item => (
                    <Link to={item.path} key={item.name} style={{ display: 'block', textDecoration: 'none' }}>
                      <div style={{ backgroundColor: 'var(--color-surface-card)', padding: '24px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--color-border-gold)', height: '100%', transition: 'all 0.2s' }} className="hover-card">
                          <div style={{ flex: 1, paddingRight: '12px' }}>
                              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-white)' }}>{item.name}</h3>
                              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>{item.desc}</p>
                              <button style={{ padding: '8px 16px', backgroundColor: 'var(--color-surface)', color: 'var(--color-gold)', borderRadius: '24px', border: '1px solid var(--color-border-gold)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Explore →</button>
                          </div>
                          <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--color-black)', borderRadius: '8px', border: '1px solid var(--color-border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
                            {item.name === 'Ride' && '🚗'}
                            {item.name === 'Reserve' && '📅'}
                            {item.name === 'Courier' && '📦'}
                            {item.name === 'Flights' && '✈️'}
                            {item.name === 'Shipping & Cargo' && '🚢'}
                            {item.name === 'SOS Safety Hub' && '🆘'}
                          </div>
                      </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* Plan your journey */}
      <section className="home-section" style={{ padding: '64px 0', backgroundColor: 'var(--color-surface)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px', color: 'var(--color-white)' }}>Plan your journey</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '16px' }}>It takes an average of 6-13 minutes to get a ride within Lagos, and on average those rides cost between NGN 4,317-NGN 13,074.</p>
            <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1 }}>
                    {['Nike Art Gallery', 'J. Randle Centre', 'National Museum Lagos', 'Apapa Amusement Park'].map(place => (
                        <div key={place} style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border-gold)', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--color-white)' }}>{place}</span>
                            <button style={{ padding: '4px 12px', borderRadius: '16px', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', cursor: 'pointer', fontWeight: '600' }}>Go</button>
                        </div>
                    ))}
                </div>
                <div style={{ flex: 2, height: '300px', backgroundColor: 'var(--color-surface-card)', borderRadius: '12px', border: '1px solid var(--color-border-gold)' }}>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}

