import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../../core/store/useUIStore';
import Confetti from '../../../core/components/Confetti/Confetti';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../core/api/apiClient';
import queens_logo_1 from '../../../core/routes/User/queens_logo_1.svg';



const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
       addToast('Password must be at least 6 characters', 'warning');
       return;
    }
    if (formData.password !== formData.confirmPassword) {
       addToast('Passwords do not match', 'danger');
       return;
    }

    const email = localStorage.getItem('resetEmail');
    if (!email) {
       addToast('Invalid session. Please start the reset process again.', 'danger');
       navigate('/forgot-password');
       return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/resetpassword/mobile', {
        email,
        password: formData.password
      });
      if (response.data?.status === 'ok' || response.status === 200) {
         setIsSuccess(true);
         addToast('Password Reset Successfully!', 'success');
         localStorage.removeItem('resetEmail');
      }
    } catch (error) {
      addToast(error.response?.data?.msg || error.response?.data?.error || 'Failed to reset password', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueLogin = () => {
    setIsSuccess(false);
    navigate('/login');
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 py-5 position-relative">
      
      {/* Confetti Animation when successful */}
      <Confetti isAnimating={isSuccess} />

      <div className="card border-0 shadow-lg p-5" style={{ borderRadius: '24px', maxWidth: '450px', width: '100%', zIndex: 10 }}>
        <div className="text-center mb-4">
          <div className="brand mb-3" style={{ color: '#FFB800', fontWeight: 800, fontSize: '32px' }}>
            <img style={{
                                height: "100px",
                                width: "100px"
                            }} src={queens_logo_1} />
          </div>
          <h3 className="fw-bold">Create New Password</h3>
          <p className="text-muted">Enter a new secure password underneath.</p>
        </div>

        <form onSubmit={handleReset}>
          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control bg-light border-0"
              id="password"
              name="password"
              required
              placeholder="New Password"
              value={formData.password}
              onChange={handleChange}
            />
            <label htmlFor="password">New Password</label>
          </div>

          <div className="form-floating mb-4">
            <input
              type="password"
              className="form-control bg-light border-0"
              id="confirmPassword"
              name="confirmPassword"
              required
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <label htmlFor="confirmPassword">Confirm Password</label>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-3 fw-bold rounded-pill shadow"
            style={{ background: '#FFB800', color: 'var(--color-text)', border: 'none' }}
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>

      {/* Success Modal Overlay */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
            style={{ zIndex: 1050, backdropFilter: 'blur(5px)' }}
          >
            <motion.div 
               initial={{ scale: 0.8, y: 50 }} 
               animate={{ scale: 1, y: 0 }} 
               className="bg-white p-5 text-center shadow-lg"
               style={{ borderRadius: '24px', maxWidth: '400px', width: '90%' }}
            >
               <div className="d-inline-flex justify-content-center align-items-center mb-4 bg-success bg-opacity-10 rounded-circle" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-shield-check text-success" style={{ fontSize: '40px' }}></i>
               </div>
               <h3 className="fw-bold mb-3">Password Updated!</h3>
               <p className="text-muted mb-4">Your password has been changed successfully. Use your new password to log in.</p>
               <button onClick={handleContinueLogin} className="btn w-100 py-3 fw-bold rounded-pill" style={{ background: '#1A1A1A', color: '#fff' }}>Back to Login</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ResetPassword;
