import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../core/store/useAuthStore';
import { useUIStore } from '../../core/store/useUIStore';

const TIMER_START = 300; // 5 minutes in seconds

export default function Signup() {
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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;
  const register = useAuthStore((s) => s.register);
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const resendVerification = useAuthStore((s) => s.resendVerification);
  const addToast = useUIStore((state) => state.addToast);

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

  if (isLoggedIn) {
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
    return null;
  }

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
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      if (result.requiresVerification) {
        addToast('Please check your email for a verification code', 'info');
        setStep(2);
        setTimer(TIMER_START);
        setCanResend(false);
      } else {
        addToast('Account created successfully!', 'success');
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } else {
      setErrorMsg(result.error || 'Registration failed');
      addToast(result.error || 'Registration failed', 'danger');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      addToast('Please enter a 6-digit code', 'warning');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const result = await verifyEmail(formData.email, verificationCode);
    setLoading(false);

    if (result.success) {
      addToast('Email verified successfully! You can now log in.', 'success');
      navigate('/login');
    } else {
      setErrorMsg(result.error || 'Verification failed');
      addToast(result.error || 'Verification failed', 'danger');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setErrorMsg('');

    const result = await resendVerification(formData.email);
    setLoading(false);

    if (result.success) {
      addToast('New verification code sent!', 'success');
      setTimer(TIMER_START);
      setCanResend(false);
    } else {
      setErrorMsg(result.error || 'Failed to resend code');
      addToast(result.error || 'Failed to resend code', 'danger');
    }
  };

  return (
    <div className="home-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ width: '100%', maxWidth: '500px', border: '1px solid rgba(255, 184, 0, 0.18)', borderRadius: '12px', padding: '40px', backgroundColor: '#0c0c0c', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
        
        {step === 1 ? (
          <>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>Create account</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '28px' }}>Join the Queens OS platform</p>
            
            {errorMsg && (
              <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', backgroundColor: 'rgba(231, 76, 60, 0.15)', border: '1px solid #e74c3c', color: '#e74c3c', fontSize: '14px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>First Name</label>
                  <input 
                    type="text" 
                    name="firstname"
                    placeholder="John" 
                    value={formData.firstname}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255, 184, 0, 0.18)', borderRadius: '8px', color: '#ffffff', outline: 'none' }}
                    required 
                    disabled={loading}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Last Name</label>
                  <input 
                    type="text" 
                    name="lastname"
                    placeholder="Doe" 
                    value={formData.lastname}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255, 184, 0, 0.18)', borderRadius: '8px', color: '#ffffff', outline: 'none' }}
                    required 
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="john.doe@example.com" 
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255, 184, 0, 0.18)', borderRadius: '8px', color: '#ffffff', outline: 'none' }}
                  required 
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Phone Number</label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  placeholder="+234 810 000 0000" 
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255, 184, 0, 0.18)', borderRadius: '8px', color: '#ffffff', outline: 'none' }}
                  required 
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Password</label>
                <input 
                  type="password" 
                  name="password"
                  placeholder="Create password" 
                  value={formData.password}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255, 184, 0, 0.18)', borderRadius: '8px', color: '#ffffff', outline: 'none' }}
                  required 
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="Confirm password" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255, 184, 0, 0.18)', borderRadius: '8px', color: '#ffffff', outline: 'none' }}
                  required 
                  disabled={loading}
                />
              </div>

              <button type="submit" className="booking-submit-btn" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>Verify email</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '28px' }}>
              We've sent a 6-digit verification code to <b style={{ color: '#FFB800' }}>{formData.email}</b>.
            </p>

            {errorMsg && (
              <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', backgroundColor: 'rgba(231, 76, 60, 0.15)', border: '1px solid #e74c3c', color: '#e74c3c', fontSize: '14px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="text"
                  style={{ 
                    width: '100%', padding: '14px', 
                    letterSpacing: '8px', background: 'rgba(255,255,255,0.06)', 
                    border: '1px solid rgba(255,184,0,0.3)', borderRadius: '8px',
                    color: '#FFB800', fontSize: '24px', fontWeight: '700', textAlign: 'center',
                    outline: 'none'
                  }}
                  maxLength="6"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={loading}
                />
              </div>

              <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '14px' }}>
                <div style={{ color: timer > 60 ? '#22c55e' : '#ef4444', fontWeight: '600' }}>
                  Expires in: {formatTime(timer)}
                </div>
                <button 
                  type="button" 
                  onClick={handleResend}
                  disabled={!canResend || loading}
                  style={{ 
                    background: 'none', border: 'none', 
                    color: canResend ? '#FFB800' : '#52525B', 
                    fontWeight: '700', cursor: canResend ? 'pointer' : 'not-allowed'
                  }}
                >
                  Resend Code
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="booking-submit-btn"
                style={{ width: '100%', marginBottom: '16px' }}
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button 
                type="button"
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back to Registration
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
          Already have an account? <Link to="/login" style={{ color: '#FFB800', fontWeight: '600' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
