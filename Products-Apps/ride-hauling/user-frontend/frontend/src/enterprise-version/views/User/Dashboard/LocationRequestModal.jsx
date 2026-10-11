import React from 'react';
import { motion } from 'framer-motion';

const LocationRequestModal = ({ onEnable, onReject }) => {
  return (
    <motion.div
      className="bottom-sheet-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(5px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <motion.div
        className="bottom-sheet glass-morphism p-4"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          width: 'min(100%, 400px)',
          maxWidth: '400px',
          borderRadius: '32px 32px 0 0',
          background: 'var(--color-surface, #121212)',
          border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.45)',
          paddingBottom: '40px',
        }}
      >
        <div className="sheet-handle" style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.18)', borderRadius: '2px', margin: '0 auto 20px' }} />

        <div className="text-center px-3">
          <div className="location-icon-anim mb-4 mx-auto" style={{
            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 184, 0, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#FFB800'
          }}>
            <motion.i 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="bi bi-geo-alt-fill" 
            />
          </div>

          <h3 className="fw-900 mb-2" style={{ color: 'var(--color-text, #fff)' }}>Enable Precise Pickups</h3>
          <p className="font-14 mb-4" style={{ color: 'var(--color-text-muted, #A1A1AA)' }}>
            To show you the nearest cars and set your pickup location automatically, we need access to your live location. 
            This makes booking effort-free and ensures your driver finds you easily.
          </p>

          <button 
            className="btn btn-warning w-100 py-3 rounded-4 fw-900 shadow-md font-16 mb-2 text-white"
            onClick={onEnable}
            style={{ background: '#FFB800', border: 'none' }}
          >
            USE MY CURRENT LOCATION
          </button>

          <button 
            className="btn btn-link w-100 py-2 font-13 text-decoration-none fw-700"
            onClick={onReject}
            style={{ color: 'var(--color-text-muted, #A1A1AA)' }}
          >
            MAYBE LATER
          </button>
          
          <p className="m-0 font-11 mt-3" style={{ color: 'var(--color-text-muted, #A1A1AA)' }}>
            <i className="bi bi-lock-fill me-1" /> Your location is used only to improve your booking experience.
          </p>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .fw-900 { font-weight: 900; }
          .font-16 { font-size: 16px; }
          .font-14 { font-size: 14px; }
          .font-11 { font-size: 11px; }
        `}} />
      </motion.div>
    </motion.div>
  );
};

export default LocationRequestModal;
