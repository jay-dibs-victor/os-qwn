import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, MapPin, Clock, Shield, Zap } from 'lucide-react';

const CourierLanding = () => {
  const navigate = useNavigate();
  const [trackingInput, setTrackingInput] = useState('');

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      navigate(`/courier/track/${trackingInput.trim()}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* HERO SECTION */}
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
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to right, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.3) 100%)',
          zIndex: 1
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '0 20px', width: '100%' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ fontSize: '4rem', fontWeight: 800, color: '#fff', maxWidth: '700px', lineHeight: 1.1, marginBottom: '20px' }}
          >
            Fast, Reliable Courier Delivery
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '600px', marginBottom: '40px' }}
          >
            Send packages across the city with real-time tracking, professional drivers, and guaranteed delivery.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <button 
              onClick={() => navigate('/courier/create')}
              style={{ padding: '16px 32px', fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', background: 'linear-gradient(to right, #667eea, #764ba2)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)' }}
            >
              Send a Package Now
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
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '8px', background: '#667eea', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Track</button>
             </form>
          </div>
          <div style={{ width: '1px', background: '#e2e8f0', height: '60px', margin: '0 10px' }} className="hidden md:block"></div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>Manage Shipments</h3>
            <button 
              onClick={() => navigate('/courier/history')}
              style={{ padding: '12px 24px', borderRadius: '8px', background: 'transparent', color: '#667eea', border: '1px solid #667eea', fontWeight: 600, cursor: 'pointer' }}
            >
              View History
            </button>
          </div>
        </div>
      </div>

      {/* HIGHLIGHTS ROW */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          {[
            { icon: <MapPin size={32} />, title: 'Real-Time Tracking', desc: 'Track your package live on the map from pickup to delivery.' },
            { icon: <Truck size={32} />, title: 'Professional Drivers', desc: 'Vetted, experienced drivers ensure safe and timely delivery.' },
            { icon: <Clock size={32} />, title: 'Fast Delivery', desc: 'Same-day delivery available for packages within the city.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ display: 'flex', gap: '20px' }}
            >
              <div style={{ fontSize: '2.5rem', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', color: '#667eea', borderRadius: '16px' }}>
                {item.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>{item.title}</h4>
                <p style={{ color: '#64748b', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ padding: '80px 20px', background: '#f1f5f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '60px', color: '#0f172a' }}>Why Choose Our Courier Service</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            {[
              { icon: '🛡️', title: 'Insured Delivery', desc: 'All packages are insured up to ₦500,000 for peace of mind.' },
              { icon: '📸', title: 'Proof of Delivery', desc: 'Photo and signature confirmation at every delivery point.' },
              { icon: '💬', title: '24/7 Support', desc: 'Round-the-clock customer support for any issues.' },
              { icon: '⚡', title: 'Instant Quotes', desc: 'Get accurate pricing in seconds based on package details.' }
            ].map((feature, i) => (
              <motion.div 
                key={i} whileHover={{ y: -10 }}
                style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '40px 30px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
              >
                 <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{feature.icon}</div>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '15px', color: '#0f172a' }}>{feature.title}</h3>
                 <p style={{ color: '#64748b', lineHeight: 1.6 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <motion.h2 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}
        >
          Ready to Send Your Package?
        </motion.h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px' }}>
          Get started in minutes. No hidden fees, no surprises. Just fast, reliable delivery.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/courier/create')}
          style={{ padding: '16px 40px', fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', background: 'linear-gradient(to right, #667eea, #764ba2)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)' }}
        >
          Send a Package Now
        </motion.button>
      </section>
    </div>
  );
};

export default CourierLanding;
