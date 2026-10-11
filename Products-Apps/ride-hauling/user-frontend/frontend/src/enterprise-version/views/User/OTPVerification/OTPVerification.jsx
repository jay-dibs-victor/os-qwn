import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../../core/store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingModal from '../../../core/components/OnboardingModal';
import queens_logo_1 from '../../../core/routes/User/queens_logo_1.svg';



const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // take the last character typed
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // move to next input if value is typed
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      addToast('Please enter all 6 digits', 'warning');
      return;
    }

    // Mock API success
    setIsSuccess(true);
    addToast('Verified Successfully!', 'success');
  };

  const handleContinue = () => {
    setIsSuccess(false);
    navigate('/reset-password');
  };

  const handleStartOnboarding = () => {
    setIsSuccess(false);
    navigate('/preferences');
  };

  const handleProceedToBooking = () => {
    setIsSuccess(false);
    navigate('/dashboard');
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 py-5 position-relative">
      

      <div className="card border-0 shadow-lg p-5" style={{ borderRadius: '24px', maxWidth: '450px', width: '100%', zIndex: 10 }}>
        <div className="text-center mb-4">
          <div className="brand mb-3" style={{ color: '#FFB800', fontWeight: 800, fontSize: '32px' }}>
            <img style={{
                                height: "100px",
                                width: "100px"
                            }} src={queens_logo_1} />
          </div>
          <h3 className="fw-bold">OTP Verification</h3>
          <p className="text-muted">Enter the 6-digit code sent to your email.</p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="d-flex justify-content-between mb-4">
            {otp.map((value, index) => (
              <input
                key={index}
                type="text"
                ref={(el) => (inputRefs.current[index] = el)}
                className="form-control text-center fw-bold fs-4 bg-light shadow-sm"
                style={{ width: '50px', height: '60px', borderRadius: '12px', border: value ? '2px solid #FFB800' : '2px solid transparent', transition: 'all 0.2s' }}
                value={value}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-3 fw-bold rounded-pill mb-4 shadow"
            style={{ background: '#FFB800', color: 'var(--color-text)', border: 'none' }}
          >
            Verify Code
          </button>

          <p className="text-center mt-3 mb-0 text-muted small">
            Didn't receive the code? <span className="fw-bold cursor-pointer text-dark border-bottom border-dark border-2 pb-1" style={{ cursor: 'pointer' }} onClick={() => addToast('Code resent', 'info')}>Resend</span>
          </p>
        </form>
      </div>

      {/* Onboarding Success Modal */}
      <OnboardingModal 
        show={isSuccess}
        onStartOnboarding={handleStartOnboarding}
        onSkip={handleProceedToBooking}
      />

    </div>
  );
};

export default OTPVerification;
