import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from './Confetti/Confetti';

const OnboardingModal = ({ show, onStartOnboarding, onSkip, isMandatory = false }) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          <Confetti isAnimating={true} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="onboarding-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="onboarding-card"
            >
              <div className="onboarding-icon-container">
                <i className="bi bi-shield-check"></i>
              </div>
              
              <h2 className="onboarding-title">Email Verified!</h2>
              <p className="onboarding-text">
                Great! Now we need to collect some important documents and information to get you on the road.
              </p>
              
              <div className="onboarding-actions">
                <button
                  onClick={onStartOnboarding}
                  className="onboarding-btn onboarding-btn-primary"
                >
                  Start Onboarding
                </button>
                {!isMandatory && (
                  <button
                    onClick={onSkip}
                    className="onboarding-btn onboarding-btn-secondary"
                  >
                    Skip for Now
                  </button>
                )}
              </div>
              
              <p className="onboarding-footer">
                Note: You won't be able to accept rides until onboarding is complete and vetted.
              </p>
            </motion.div>
          </motion.div>

          <style>{`
            .onboarding-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: rgba(26, 26, 26, 0.85);
              backdrop-filter: blur(8px);
              z-index: 1050;
            }
            .onboarding-card {
              background: #ffffff;
              padding: 3rem;
              text-align: center;
              border-radius: 32px;
              max-width: 480px;
              width: 90%;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
            .onboarding-icon-container {
              display: inline-flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 1.5rem;
              width: 100px;
              height: 100px;
              border-radius: 50%;
              background: linear-gradient(135deg, #FFB800 0%, #FF8A00 100%);
              box-shadow: 0 10px 20px rgba(255, 184, 0, 0.3);
            }
            .onboarding-icon-container i {
              color: #ffffff;
              font-size: 48px;
            }
            .onboarding-title {
              font-weight: 700;
              margin-bottom: 1rem;
              color: #1A1A1A;
            }
            .onboarding-text {
              color: #666666;
              margin-bottom: 2rem;
              font-size: 1.125rem;
              line-height: 1.6;
            }
            .onboarding-actions {
              display: flex;
              flex-direction: column;
              gap: 1rem;
            }
            .onboarding-btn {
              padding: 1rem;
              font-weight: 700;
              border-radius: 9999px;
              border: none;
              font-size: 1.125rem;
              transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s;
              cursor: pointer;
            }
            .onboarding-btn:active {
              transform: scale(0.98);
            }
            .onboarding-btn-primary {
              background: #FFB800;
              color: #1A1A1A;
              box-shadow: 0 4px 6px -1px rgba(255, 184, 0, 0.2);
            }
            .onboarding-btn-secondary {
              background: transparent;
              border: 2px solid #f1f1f1;
              color: #666666;
            }
            .onboarding-btn-secondary:hover {
              background: #f8f9fa;
              border-color: #e9ecef;
            }
            .onboarding-footer {
              margin-top: 1.5rem;
              color: #999999;
              font-size: 0.875rem;
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
