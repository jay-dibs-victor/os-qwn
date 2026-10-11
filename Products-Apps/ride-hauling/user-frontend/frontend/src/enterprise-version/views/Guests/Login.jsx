import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../core/store/useAuthStore';
import { useUIStore } from '../../core/store/useUIStore.js';
import EmailPhoneInput from '../../core/components/EmailPhoneInput.jsx';

export default function Login() {
  const [loginInput, setLoginInput] = useState({ type: 'email', value: '' });
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const formRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;
  const login = useAuthStore((s) => s.login);
  const addToast = useUIStore((state) => state.addToast);

  if (isLoggedIn) {
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginInput.value || !password) {
      addToast('Please fill in all fields', 'warning');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Call the real API login
    const result = await login({ email: loginInput.value, password });
    setLoading(false);

    if (result.success) {
      addToast('Welcome back to Queens!', 'success');
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.error || 'Login failed. Please check your credentials.');
      addToast(result.error || 'Login failed', 'danger');
    }
  };

  return (
    <div className="home-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ width: '100%', maxWidth: '440px', border: '1px solid rgba(255, 184, 0, 0.18)', borderRadius: '12px', padding: '40px', backgroundColor: '#0c0c0c', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>Welcome back</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '28px' }}>Log in to your Queens OS profile</p>
        
        {errorMsg && (
          <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', backgroundColor: 'rgba(231, 76, 60, 0.15)', border: '1px solid #e74c3c', color: '#e74c3c', fontSize: '14px' }}>
            {errorMsg}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit}>
          <EmailPhoneInput
            label="Email or phone"
            value={loginInput}
            onChange={setLoginInput}
            onSubmit={() => formRef.current?.requestSubmit()}
          />

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Password</label>
            <input 
              type="password" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255, 184, 0, 0.18)', borderRadius: '8px', color: '#ffffff', outline: 'none' }}
              required 
              disabled={loading}
            />
          </div>

          <button type="submit" className="booking-submit-btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#FFB800', fontWeight: '600' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
