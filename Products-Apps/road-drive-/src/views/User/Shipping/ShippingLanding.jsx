import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ShippingLanding = () => {
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState('');

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      navigate(`/shipping/track/${trackingInput.trim()}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ 
        position: 'relative', 
        width: '100%', 
        height: '80vh',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Background Image with Overlay */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(/assets/shipping/shipping_hero_truck_1777050882976.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to right, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 100%)',
          zIndex: 1
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ fontSize: '4rem', fontWeight: 800, color: '#fff', maxWidth: '700px', lineHeight: 1.1, marginBottom: '20px' }}
          >
            Go the distance with seamless inland transport
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '600px', marginBottom: '40px' }}
          >
            The ground network you need for simple, reliable logistics. Discover our enhanced booking and tracking platform.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <button 
              onClick={() => navigate('/shipping/new')}
              style={{ padding: '16px 32px', fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', background: 'linear-gradient(to right, #fbbf24, #f59e0b)', color: '#0f172a', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(251, 191, 36, 0.4)' }}
            >
              Book a Shipment Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* SEARCH / TRACK BAR (Floating) */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '-50px auto 0', 
        position: 'relative', 
        zIndex: 10, 
        padding: '0 20px' 
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(16px)', 
          borderRadius: '16px', 
          padding: '20px 30px', 
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
             <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>Track your shipment</h3>
             <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Enter tracking number..."
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', outline: 'none' }}
                />
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '8px', background: '#3b82f6', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Track</button>
             </form>
          </div>
          <div style={{ width: '1px', background: '#e2e8f0', height: '60px', margin: '0 10px' }} className="hidden md:block"></div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>Manage Logistics</h3>
            <button 
              onClick={() => navigate('/shipping/history')}
              style={{ padding: '12px 24px', borderRadius: '8px', background: 'transparent', color: '#d97706', border: '1px solid #d97706', fontWeight: 600, cursor: 'pointer' }}
            >
              View History
            </button>
          </div>
        </div>
      </div>

      {/* 2. HIGHLIGHTS ROW */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          {[
            { icon: '🔍', title: 'Full visibility', desc: 'Detailed tracking for all your shipments across the globe in real-time.' },
            { icon: '⚡', title: 'Easy booking', desc: 'A seamless, multi-step interface to quote and book instantly.' },
            { icon: '🌐', title: 'Expertise & Network', desc: 'Integrated with top-tier carriers like FedEx and DHL for global reach.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ display: 'flex', gap: '20px' }}
            >
              <div style={{ fontSize: '2.5rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', color: '#3b82f6', borderRadius: '16px' }}>{item.icon}</div>
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>{item.title}</h4>
                <p style={{ color: '#64748b', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. PROMO SECTION */}
      <section style={{ padding: '60px 20px', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <motion.h2 
             initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
             style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}
          >
             Be ready for anything to go all the way
          </motion.h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px' }}>
             Unpredictable supply chains demand a logistics partner who is always prepared. We provide the control and flexibility you need to adapt on the fly.
          </p>
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
             style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'relative' }}
          >
             <img src="/assets/shipping/shipping_promo_thumbnail_1777051079197.png" alt="Promo" style={{ width: '100%', display: 'block' }} />
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', background: 'rgba(251,191,36,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 30px rgba(251,191,36,0.5)' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M8 5v14l11-7z"/></svg>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 4. LOGISTICS SERVICES */}
      <section style={{ padding: '100px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '10px', color: '#0f172a' }}>Logistics services and solutions</h2>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '60px' }}>Integrated supply chain solutions that connect and simplify your logistics.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            {[
              { icon: '🚚', title: 'Transportation', desc: 'From the factory to the final destination, via road, rail, air, and ocean.' },
              { icon: '🏢', title: 'Supply Chain', desc: 'End-to-end management ensuring your cargo moves efficiently.' },
              { icon: '💻', title: 'Digital Solutions', desc: 'API integrations and platform access for complete operational control.' },
              { icon: '📋', title: 'Customs', desc: 'Seamless clearance and compliance handling at major global ports.' }
            ].map((service, i) => (
              <motion.div 
                key={i} whileHover={{ y: -10 }}
                style={{ background: 'var(--color-surface)', border: '1px solid #e2e8f0', padding: '40px 30px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
              >
                 <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{service.icon}</div>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '15px', color: '#0f172a' }}>{service.title}</h3>
                 <p style={{ color: '#64748b', lineHeight: 1.6 }}>{service.desc}</p>
                 <a href="#" style={{ color: '#d97706', fontWeight: 600, display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>Learn more →</a>
              </motion.div>
            ))}
        </div>
      </section>

      {/* 5. CONTENT BLOCKS */}
      <section style={{ padding: '0 20px 100px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Trend Map Block */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px', marginBottom: '80px', background: 'var(--color-surface)', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ flex: '1 1 400px', padding: '40px' }}>
             <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}>The Logistics Trend Map</h2>
             <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '30px', lineHeight: 1.6 }}>
                Visualize supply chain disruptions and optimize routes dynamically with our proprietary global networking algorithm.
             </p>
             <button style={{ padding: '12px 24px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Explore the map</button>
          </div>
          <div style={{ flex: '1 1 500px', minHeight: '400px', backgroundImage: 'url(/assets/shipping/shipping_trend_map_1777051132172.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        </div>

      </section>

      {/* 6. INDUSTRY SECTORS */}
      <section style={{ padding: '80px 20px', background: '#f1f5f9' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '10px', color: '#0f172a' }}>Industry sectors</h2>
            <p style={{ color: '#64748b', marginBottom: '40px' }}>Specialized logistics solutions tailored to the unique demands of your industry.</p>
            
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
               {['Retail', 'Technology', 'FMCG', 'Automotive', 'Healthcare', 'Chemicals'].map((industry, i) => (
                  <div key={i} style={{ minWidth: '160px', padding: '30px 20px', background: 'var(--color-surface)', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                     <div style={{ fontSize: '2rem', marginBottom: '15px', color: '#d97706' }}>
                        {i === 0 ? '🛍️' : i === 1 ? '💻' : i === 2 ? '🥫' : i === 3 ? '🚗' : i === 4 ? '⚕️' : '🧪'}
                     </div>
                     <div style={{ fontWeight: 600, color: '#0f172a' }}>{industry}</div>
                  </div>
               ))}
            </div>
         </div>
      </section>

    </div>
  );
};

export default ShippingLanding;
