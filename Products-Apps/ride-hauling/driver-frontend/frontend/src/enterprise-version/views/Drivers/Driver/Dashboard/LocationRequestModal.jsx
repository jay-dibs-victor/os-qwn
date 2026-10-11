import React from 'react';
import { motion } from 'framer-motion';

const LocationRequestModal = ({ onEnable }) => {
  return (
    <motion.div
      className="bottom-sheet-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <motion.div
        className="bottom-sheet glass-morphism p-4"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          width: '100%',
          maxWidth: '100%',
          borderRadius: '32px 32px 0 0',
          background: 'white',
          paddingBottom: '40px',
        }}
      >
        <div className="sheet-handle" style={{ width: '40px', height: '4px', background: '#e5e7eb', borderRadius: '2px', margin: '0 auto 20px' }} />

        <div className="text-center px-3">
          <div className="location-icon-anim mb-4 mx-auto" style={{
            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex', alignItems: 'center', justifyInContent: 'center', fontSize: '32px', color: '#3b82f6'
          }}>
            <motion.i 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bi bi-geo-alt-fill" 
            />
          </div>

          <h3 className="fw-900 text-dark mb-2">Enable Live Location</h3>
          <p className="text-muted font-14 mb-4">
            To provide accurate service and receive ride requests, we need access to your live location. 
            This allows passengers to see your real-time ETA and ensures smooth navigation.
          </p>

          <button 
            className="btn btn-dark w-100 py-3 rounded-4 fw-900 shadow-lg font-16 mb-2"
            onClick={onEnable}
          >
            ENABLE LIVE TRACKING
          </button>
          
          <p className="m-0 font-11 text-muted">
            <i className="bi bi-shield-check me-1" /> Your privacy is important. Location is only tracked while you are online.
          </p>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .fw-900 { font-weight: 900; }
          .font-16 { font-size: 16px; }
          .font-14 { font-size: 14px; }
          .font-11 { font-size: 11px; }
          .flex-center { display: flex; align-items: center; justify-content: center; }
        `}} />
      </motion.div>
    </motion.div>
  );
};

export default LocationRequestModal;
