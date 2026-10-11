import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Confetti = ({ isAnimating = true }) => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (isAnimating) {
      const colors = ['#FFB800', '#1A1A1A', '#2ed573', '#ff4757', '#1e90ff', '#ffffff'];
      const newPieces = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 2 + 2,
        delay: Math.random() * 0.5
      }));
      setPieces(newPieces);
    } else {
      setPieces([]);
    }
  }, [isAnimating]);

  if (!isAnimating) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: p.y, x: p.x, rotate: 0, scale: p.scale }}
          animate={{
            y: window.innerHeight + 100,
            x: p.x + (Math.random() - 0.5) * 200,
            rotate: p.rotation + 360
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '20px',
            backgroundColor: p.color,
            borderRadius: '2px'
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
