import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../../../core/store/useUIStore';
import { useAuthStore } from '../../../core/store/useAuthStore';
import "./Register.css";
import AnimatedHeroBackground from '../Home/AnimatedHeroBackground';
import queens_logo_1 from '../../../core/routes/User/queens_logo_1.svg';


const TIMER_START = 300; // 5 minutes in seconds

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    user_type: 'Individual'
  });

  const [step, setStep] = useState(1); // 1: Details, 2: Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(TIMER_START);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const addToast = useUIStore((state) => state.addToast);
  const { register, verifyEmail, resendVerification, loading } = useAuthStore();
  // Preserve the page we came from so we can return there after successful auth
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match', 'danger');
      return;
    }
    
    const result = await register(formData);
    if (result.success) {
      if (result.requiresVerification) {
        addToast('Please check your email for a verification code', 'info');
        setStep(2);
        setTimer(TIMER_START);
        setCanResend(false);
      } else {
        addToast('Account created successfully!', 'success');
        navigate(from, { replace: true });
      }
    } else {
      addToast(result.error || 'Registration failed', 'danger');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      addToast('Please enter a 6-digit code', 'warning');
      return;
    }

    const result = await verifyEmail(formData.email, verificationCode);
    if (result.success) {
      addToast('Email verified! Please sign in to continue.', 'success');
      // Pass from forward so Login.jsx can redirect there after sign in
      navigate('/login', { state: { from: { pathname: from } } });
    } else {
      addToast(result.error || 'Verification failed', 'danger');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    const result = await resendVerification(formData.email);
    if (result.success) {
      addToast('New verification code sent!', 'success');
      setTimer(TIMER_START);
      setCanResend(false);
    } else {
      addToast(result.error || 'Failed to resend code', 'danger');
    }
  };

  return (
    <div className="position-relative overflow-hidden min-vh-100 d-flex justify-content-center align-items-center py-5" style={{ background: '#000000' }}>
      {/* Background Layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.2 }}>
          <AnimatedHeroBackground />
      </div>

      <div className="container position-relative" style={{ zIndex: 1, display: 'flex', justifyContent: 'center' }}>
        <div className="border-0 p-5" style={{ 
          borderRadius: '24px', maxWidth: '600px', width: '100%',
          background: 'rgba(12, 12, 12, 0.92)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 184, 0, 0.15)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>

          <div className="text-center mb-5">
            <div className="brand mb-3" style={{ color: '#FFB800', fontWeight: 800, fontSize: '32px' }}>
             <img style={{
                                height: "100px",
                                width: "100px"
                            }} src={queens_logo_1} />
            </div>
            <h3 className="fw-bold" style={{ color: '#FFFFFF' }}>Create an Account</h3>
            <p style={{ color: '#A1A1AA' }}>Join GoTrip and ride safely and in style.</p>
          </div>

          {step === 1 ? (
             <form onSubmit={handleSubmit}>
               {/* Previous Form Fields */}
               <div className="row g-3 mb-3">
                 <div className="col-md-6 form-floating">
                   <input
                     type="text"
                     className="form-control border-0"
                     id="firstname"
                     name="firstname"
                     required
                     placeholder="John"
                     value={formData.firstname}
                     onChange={handleChange}
                     style={{ background: '#1a1a1a', color: '#FFFFFF', borderRadius: '10px' }}
                   />
                   <label htmlFor="firstname" className="ms-2" style={{ color: '#A1A1AA' }}>First Name</label>
                 </div>
                 <div className="col-md-6 form-floating">
                   <input
                     type="text"
                     className="form-control border-0"
                     id="lastname"
                     name="lastname"
                     required
                     placeholder="Doe"
                     value={formData.lastname}
                     onChange={handleChange}
                     style={{ background: '#1a1a1a', color: '#FFFFFF', borderRadius: '10px' }}
                   />
                   <label htmlFor="lastname" className="ms-2" style={{ color: '#A1A1AA' }}>Last Name</label>
                 </div>
               </div>

               <div className="form-floating mb-3">
                 <input
                   type="email"
                   className="form-control border-0"
                   id="email"
                   name="email"
                   required
                   placeholder="name@example.com"
                   value={formData.email}
                   onChange={handleChange}
                   style={{ background: '#1a1a1a', color: '#FFFFFF', borderRadius: '10px' }}
                 />
                 <label htmlFor="email" style={{ color: '#A1A1AA' }}>Email address</label>
               </div>

               <div className="form-floating mb-3">
                 <input
                   type="tel"
                   className="form-control border-0"
                   id="phoneNumber"
                   name="phoneNumber"
                   required
                   placeholder="+1 234 567 89"
                   value={formData.phoneNumber}
                   onChange={handleChange}
                   style={{ background: '#1a1a1a', color: '#FFFFFF', borderRadius: '10px' }}
                 />
                 <label htmlFor="phoneNumber" style={{ color: '#A1A1AA' }}>Phone Number</label>
               </div>

               <div className="row g-3 mb-4">
                 <div className="col-md-6 form-floating">
                   <input
                     type="password"
                     className="form-control border-0"
                     id="password"
                     name="password"
                     required
                     placeholder="Password"
                     value={formData.password}
                     onChange={handleChange}
                     style={{ background: '#1a1a1a', color: '#FFFFFF', borderRadius: '10px' }}
                   />
                   <label htmlFor="password" className="ms-2" style={{ color: '#A1A1AA' }}>Password</label>
                 </div>
                 <div className="col-md-6 form-floating">
                   <input
                     type="password"
                     className="form-control border-0"
                     id="confirmPassword"
                     name="confirmPassword"
                     required
                     placeholder="Confirm Password"
                     value={formData.confirmPassword}
                     onChange={handleChange}
                     style={{ background: '#1a1a1a', color: '#FFFFFF', borderRadius: '10px' }}
                   />
                   <label htmlFor="confirmPassword" className="ms-2" style={{ color: '#A1A1AA' }}>Confirm Password</label>
                 </div>
               </div>

               <button
                 type="submit"
                 disabled={loading}
                 className="btn btn-primary w-100 py-3 fw-bold rounded-pill mb-4 shadow"
                 style={{ background: '#FFB800', color: '#000000', border: 'none' }}
               >
                 {loading ? 'Processing...' : 'Create Account'}
               </button>

               <p className="text-center mt-3 mb-0 small" style={{ color: '#A1A1AA' }}>
                 Already have an account? <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#FFB800' }}>Log in</Link>
               </p>
             </form>
          ) : (
            <div className="verification-step text-center">
              <p className="mb-4" style={{ color: '#A1A1AA' }}>We've sent a 6-digit code to <b style={{ color: '#FFFFFF' }}>{formData.email}</b>. It expires in 5 minutes.</p>
              
              <form onSubmit={handleVerify}>
                <div className="form-floating mb-4">
                  <input
                    type="text"
                    className="form-control border-0 text-center fw-bold fs-4"
                    style={{ letterSpacing: '10px', background: '#1a1a1a', color: '#FFB800', borderRadius: '10px' }}
                    maxLength="6"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <label style={{ color: '#A1A1AA' }}>Enter 6-Digit Code</label>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                  <div className="timer fw-bold" style={{ color: timer > 60 ? '#22c55e' : '#ef4444' }}>
                     Expires in: {formatTime(timer)}
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-link text-decoration-none fw-bold p-0"
                    disabled={!canResend || loading}
                    onClick={handleResend}
                    style={{ color: canResend ? '#FFB800' : '#52525B' }}
                  >
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow"
                  style={{ background: '#FFB800', color: '#000000', border: 'none' }}
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <button 
                   type="button"
                   className="btn btn-link mt-3"
                   style={{ color: '#A1A1AA' }}
                   onClick={() => setStep(1)}
                >
                   Back to Registration
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
