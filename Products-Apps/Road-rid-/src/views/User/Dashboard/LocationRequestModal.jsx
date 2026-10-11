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
            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 184, 0, 0.1)',
            display: 'flex', alignItems: 'center', justifyInContent: 'center', fontSize: '32px', color: '#FFB800'
          }}>
            <motion.i 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="bi bi-geo-alt-fill" 
            />
          </div>

          <h3 className="fw-900 text-dark mb-2">Enable Precise Pickups</h3>
          <p className="text-muted font-14 mb-4">
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
            className="btn btn-link w-100 py-2 font-13 text-muted text-decoration-none fw-700"
            onClick={onReject}
          >
            MAYBE LATER
          </button>
          
          <p className="m-0 font-11 text-muted mt-3">
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
