import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const maneuverIcons = {
  'turn-left': 'bi-arrow-90deg-left',
  'turn-right': 'bi-arrow-90deg-right',
  'turn-slight-left': 'bi-arrow-up-left',
  'turn-slight-right': 'bi-arrow-up-right',
  'merge': 'bi-sign-merge-right',
  'straight': 'bi-arrow-up',
  'uturn-left': 'bi-arrow-counterclockwise',
  'uturn-right': 'bi-arrow-clockwise'
};

const NavigationHUD = ({ maneuver }) => {
  if (!maneuver) return null;

  const { instruction, distance, type } = maneuver;
  // Clean instruction for display
  const cleanText = instruction.replace(/<[^>]*>?/gm, '');

  return (
    <motion.div 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="nav-hud-glass p-3 d-flex align-items-center gap-3 shadow-lg"
      style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        minWidth: '280px',
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255,255,255,0.3)'
      }}
    >
      <div className="maneuver-icon-container bg-primary p-3 rounded-4 text-white shadow-sm">
        <i className={`bi ${maneuverIcons[type] || 'bi-compass'} fs-3`}></i>
      </div>
      
      <div className="flex-grow-1">
        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.1rem' }}>{cleanText}</h6>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-dark bg-opacity-75 rounded-pill px-3 py-2 small">
            {distance > 1000 ? `${(distance/1000).toFixed(1)} km` : `${Math.round(distance)} m`}
          </span>
          <span className="text-muted small">then proceed straight</span>
        </div>
      </div>
    </motion.div>
  );
};

export default NavigationHUD;
