import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../../core/store/useUIStore';
import AnimatedHeroBackground from '../Home/AnimatedHeroBackground';
import apiClient from '../../../core/api/apiClient';
import queens_logo_1 from '../../../core/routes/User/queens_logo_1.svg';

     

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email', 'warning');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/forgot_password', { email });
      if (response.data?.status === 'ok' || response.status === 200) {
         addToast('A password reset link has been sent to your email.', 'success');
         localStorage.setItem('resetEmail', email); // Stores email for potential mobile reset sequence if needed
         navigate('/otp-verification');
      }
    } catch (error) {
      addToast(error.response?.data?.msg || error.response?.data?.error || 'Failed to send reset link', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="position-relative overflow-hidden vh-100 d-flex justify-content-center align-items-center py-5">
      {/* Background Layer */}
      <div style={{ opacity: 0.25 }}>
          <AnimatedHeroBackground />
      </div>

      <div className="container position-relative" style={{ zIndex: 1, display: 'flex', justifyContent: 'center' }}>
        <div className="card border-0 shadow-lg p-5" style={{ borderRadius: '24px', maxWidth: '450px', width: '100%', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>

          <div className="text-center mb-4">
            <div className="brand mb-3" style={{ color: '#FFB800', fontWeight: 800, fontSize: '32px' }}>
            <img style={{
                                height: "100px",
                                width: "100px"
                            }} src={queens_logo_1} />
            </div>
            <h3 className="fw-bold">Reset Password</h3>
            <p className="text-muted">Enter your email and instructions will be sent to you.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-4">
              <input
                type="email"
                className="form-control bg-light border-0"
                id="email"
                name="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email">Email address</label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-3 fw-bold rounded-pill mb-4 shadow"
              style={{ background: '#FFB800', color: 'var(--color-text)', border: 'none' }}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className="text-center mt-3 mb-0 text-muted small">
              <Link to="/login" className="fw-bold text-decoration-none text-dark border-bottom border-dark border-2 pb-1">I remember my password</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
