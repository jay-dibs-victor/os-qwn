import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../core/store/useAuthStore';
import { useUIStore } from '../../core/store/useUIStore';

const questions = [
  {
    id: 'rideType',
    question: 'What is your preferred ride type?',
    options: ['Economy', 'Premium', 'Luxury', 'Carpool'],
    icon: 'bi-car-front-fill'
  },
  {
    id: 'musicPreference',
    question: 'How do you like your music during a ride?',
    options: ['Silent', 'Radio', 'Own Playlist', 'Talkative Driver'],
    icon: 'bi-music-note-beamed'
  },
  {
    id: 'accessibilityNeeds',
    question: 'Any specific accessibility needs?',
    options: ['None', 'Wheelchair access', 'Extra luggage space', 'Child seat'],
    icon: 'bi-accessibility'
  },
  {
    id: 'travelFrequency',
    question: 'How often do you plan to use Queens?',
    options: ['Daily', 'Weekly', 'Occasionally', 'First Time'],
    icon: 'bi-calendar-check'
  },
  {
    id: 'preferredPayment',
    question: 'What is your preferred payment method?',
    options: ['Card', 'Wallet', 'Cash', 'Apple/Google Pay'],
    icon: 'bi-credit-card'
  }
];

const PreferenceWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);

  const handleOptionSelect = (option) => {
    const newAnswers = { ...answers, [questions[currentStep].id]: option };
    setAnswers(newAnswers);
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleSkip = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit(answers);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setIsSubmitting(true);
    try {
      // Mock API call or real one if backend is ready
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1'}/user/preferences`, {
        userId: user?._id || user?.id,
        preferences: finalAnswers
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      addToast('Preferences saved! Welcome to Queens.', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving preferences:', error);
      addToast('Proceeding to dashboard...', 'info');
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="pref-wizard-container">
      <div className="pref-wizard-card">
        
        {/* Progress Bar */}
        <div className="pref-progress-wrapper" style={{ height: '8px', background: '#f1f1f1' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="pref-progress-bar"
          />
        </div>

        <div className="pref-wizard-header">
          <span className="pref-step-counter">
            Question {currentStep + 1} of {questions.length}
          </span>
          <button onClick={handleSkip} className="pref-skip-btn">
            Skip this <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="pref-question-section">
              <i className={`bi ${currentQuestion.icon} pref-question-icon`}></i>
              <h2 className="pref-question-title">{currentQuestion.question}</h2>
            </div>

            <div className="pref-options-grid">
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} className="pref-option-col">
                  <motion.div
                    whileHover={{ scale: 1.02, backgroundColor: '#FFB800', color: 'var(--color-text)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionSelect(option)}
                    className="pref-option-item"
                  >
                    {option}
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {isSubmitting && (
           <div className="pref-loading-overlay">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
           </div>
        )}
      </div>

      <style>{`
        .pref-wizard-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 2rem;
        }
        .pref-wizard-card {
            background: #ffffff;
            padding: 4rem;
            border-radius: 40px;
            max-width: 600px;
            width: 100%;
            min-height: 500px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.05);
            position: relative;
            overflow: hidden;
            border: none;
        }
        .pref-progress-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
        }
        .pref-progress-bar {
            height: 100%;
            background: #FFB800;
        }
        .pref-wizard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3rem;
        }
        .pref-step-counter {
            font-weight: 700;
            color: #999;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .pref-skip-btn {
            background: none;
            border: none;
            color: #666;
            font-weight: 700;
            cursor: pointer;
            padding: 0;
            transition: color 0.2s;
        }
        .pref-skip-btn:hover {
            color: #1A1A1A;
        }
        .pref-question-section {
            margin-bottom: 2.5rem;
        }
        .pref-question-icon {
            font-size: 40px;
            color: #FFB800;
            display: block;
            margin-bottom: 1rem;
        }
        .pref-question-title {
            font-weight: 800;
            font-size: 2rem;
            color: #1A1A1A;
            line-height: 1.2;
            margin: 0;
        }
        .pref-options-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }
        .pref-option-item {
            padding: 1.5rem;
            border: 2px solid #f1f1f1;
            border-radius: 16px;
            text-align: center;
            font-weight: 700;
            color: #666;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            background: #fff;
        }
        .pref-loading-overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10;
        }
        
        @media (max-width: 576px) {
            .pref-options-grid {
                grid-template-columns: 1fr;
            }
            .pref-wizard-card {
                padding: 2rem;
                border-radius: 24px;
            }
        }
      `}</style>
    </div>
  );
};

export default PreferenceWizard;
