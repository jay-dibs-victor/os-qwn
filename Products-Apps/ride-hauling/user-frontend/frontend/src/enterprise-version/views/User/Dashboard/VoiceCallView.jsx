import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceCallView = ({ contactName, contactAvatar, onHangUp, onAccept, isRinging }) => {
  const [callDuration, setCallDuration] = useState(0);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (isRinging) return;
    
    // Request microphone access to simulate real WebRTC call for the demo
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        localStreamRef.current = stream;
      })
      .catch(err => console.warn('Microphone access denied or unavailable:', err));

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(timer);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRinging]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="voice-call-overlay d-flex align-items-center justify-content-center"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="text-center text-white" style={{ maxWidth: '400px', width: '90%' }}>
        <div className="mb-5 position-relative d-inline-block">
          {/* Audio Visualization Ripples */}
          <div className="call-ripple-1"></div>
          <div className="call-ripple-2"></div>
          <img 
            src={contactAvatar || "/assets/images/avatar.png"} 
            className="rounded-circle shadow-2xl position-relative z-1"
            style={{ width: '150px', height: '150px', border: '4px solid #FFB800', objectFit: 'cover' }}
            alt="Contact"
          />
        </div>

        <h2 className="fw-bold mb-1 display-6">{contactName}</h2>
        <p className="text-white-50 fs-5 mb-4">{isRinging ? 'Incoming Call...' : 'Queens Voice Link'}</p>
        
        {!isRinging && (
          <div className="bg-white bg-opacity-10 rounded-pill px-4 py-2 d-inline-block mb-5">
             <span className="font-monospace fs-4">{formatTime(callDuration)}</span>
          </div>
        )}

        <div className="d-flex justify-content-center align-items-center gap-4 mt-5">
           {isRinging && onAccept ? (
              <>
                 <button 
                   onClick={onAccept}
                   className="btn btn-success rounded-circle p-4 shadow-lg hover-scale"
                   style={{ width: '80px', height: '80px' }}
                 >
                    <i className="bi bi-telephone-fill fs-2"></i>
                 </button>
                 <button 
                   onClick={onHangUp}
                   className="btn btn-danger rounded-circle p-4 shadow-lg hover-scale"
                   style={{ width: '80px', height: '80px' }}
                 >
                    <i className="bi bi-telephone-x-fill fs-2"></i>
                 </button>
              </>
           ) : (
              <>
                <button className="btn btn-light rounded-circle p-3 shadow-lg hover-scale" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-mic-fill fs-4 text-dark"></i>
                </button>
                <button 
                  onClick={onHangUp}
                  className="btn btn-danger rounded-circle p-4 shadow-lg hover-scale"
                  style={{ width: '80px', height: '80px' }}
                >
                    <i className="bi bi-telephone-x-fill fs-2"></i>
                </button>
                <button className="btn btn-light rounded-circle p-3 shadow-lg hover-scale" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-volume-up-fill fs-4 text-dark"></i>
                </button>
              </>
           )}
        </div>
      </div>

      <style>{`
        .call-ripple-1, .call-ripple-2 {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          width: 150px;
          height: 150px;
          z-index: 0;
        }
        .call-ripple-1 { animation: ripple 2s infinite; }
        .call-ripple-2 { animation: ripple 2s infinite 1s; }
        
        @keyframes ripple {
          0% { width: 150px; height: 150px; opacity: 1; }
          100% { width: 350px; height: 350px; opacity: 0; }
        }
        .hover-scale:hover { transform: scale(1.1); }
      `}</style>
    </motion.div>
  );
};

export default VoiceCallView;
