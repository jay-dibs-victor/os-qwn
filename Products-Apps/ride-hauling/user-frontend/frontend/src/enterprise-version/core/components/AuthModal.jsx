import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import queens_logo_1 from '../routes/User/queens_logo_1.svg';

const AuthModal = () => {
    const navigate = useNavigate();
    const {
        isAuthModalOpen, authModalView, closeAuthModal,
        openAuthModal, addToast,
        pendingRedirect, clearPendingRedirect
    } = useUIStore();
    const { login, register } = useAuthStore();
    const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });

    if (!isAuthModalOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            addToast('Please fill all fields', 'warning');
            return;
        }
        
        let loginPayload = { ...formData };
        if ("geolocation" in navigator) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
                });
                loginPayload.lat = position.coords.latitude;
                loginPayload.lng = position.coords.longitude;
            } catch (geoError) {
                console.warn('Geolocation failed');
            }
        }

        const result = await login(loginPayload);
        if (result.success) {
            addToast('Welcome back to Queens!', 'success');
            closeAuthModal();
            if (pendingRedirect) {
                const dest = pendingRedirect;
                clearPendingRedirect();
                navigate(dest);
            }
        } else {
            addToast(result.error || 'Login failed', 'danger');
        }
    };


    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password || !formData.name) {
            addToast('Please fill all required fields', 'warning');
            return;
        }

        const result = await register({
            email: formData.email,
            password: formData.password,
            full_name: formData.name,
            phone: formData.phone,
            role: "Individual User"
        });

        if (result.success) {
            if (result.requiresVerification) {
                addToast('Please verify your email.', 'info');
                // You could switch view to OTP verification here if needed
            } else {
                addToast('Registration successful!', 'success');
            }
            closeAuthModal();
        } else {
            addToast(result.error || 'Registration failed', 'danger');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-backdrop-custom"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    style={{
                        background: 'var(--color-surface)',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '450px',
                        padding: '40px',
                        position: 'relative',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}
                >
                    <button
                        onClick={closeAuthModal}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#888'
                        }}
                    >
                        &times;
                    </button>

                    <div className="text-center mb-4">
                        <div className="mb-2">
                            <img style={{ height: "60px", width: "60px" }} src={queens_logo_1} alt="Logo" />
                        </div>
                        <h3 className="fw-bold">{authModalView === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
                        <p className="text-muted small">
                            {authModalView === 'login' 
                                ? 'Enter your credentials to continue.' 
                                : 'Join us and start booking rides and flights.'}
                        </p>
                    </div>

                    {authModalView === 'login' ? (
                        <form onSubmit={handleLoginSubmit}>
                            <div className="form-floating mb-3">
                                <input
                                    type="email"
                                    className="form-control bg-light border-0"
                                    name="email"
                                    required
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <label>Email address</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input
                                    type="password"
                                    className="form-control bg-light border-0"
                                    name="password"
                                    required
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <label>Password</label>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="remember-modal" />
                                    <label className="form-check-label small text-muted" htmlFor="remember-modal">Remember me</label>
                                </div>
                                <span onClick={() => openAuthModal('forgot')} style={{ color: '#FFB800', cursor: 'pointer' }} className="small text-decoration-none fw-bold">Forgot password?</span>
                            </div>
                            <button type="submit" className="btn w-100 py-3 fw-bold rounded-pill mb-3" style={{ background: '#FFB800', color: 'var(--color-text)' }}>
                                Sign In
                            </button>
                            <p className="text-center mb-0 text-muted small">
                                Don’t have an account? <span onClick={() => openAuthModal('signup')} style={{ cursor: 'pointer' }} className="fw-bold text-dark border-bottom border-dark border-2 pb-1">Sign up</span>
                            </p>
                        </form>
                    ) : authModalView === 'signup' ? (
                        <form onSubmit={handleRegisterSubmit}>
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control bg-light border-0"
                                    name="name"
                                    required
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                <label>Full Name</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input
                                    type="email"
                                    className="form-control bg-light border-0"
                                    name="email"
                                    required
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <label>Email address</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control bg-light border-0"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                <label>Phone Number (Optional)</label>
                            </div>
                            <div className="form-floating mb-3">
                                <input
                                    type="password"
                                    className="form-control bg-light border-0"
                                    name="password"
                                    required
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <label>Password</label>
                            </div>
                            <button type="submit" className="btn w-100 py-3 fw-bold rounded-pill mb-3" style={{ background: '#FFB800', color: 'var(--color-text)' }}>
                                Create Account
                            </button>
                            <p className="text-center mb-0 text-muted small">
                                Already have an account? <span onClick={() => openAuthModal('login')} style={{ cursor: 'pointer' }} className="fw-bold text-dark border-bottom border-dark border-2 pb-1">Sign in</span>
                            </p>
                        </form>
                    ) : (
                        <div className="text-center">
                            <p className="text-muted small mb-4">Please contact support or visit the main forgot password page.</p>
                            <button onClick={() => openAuthModal('login')} className="btn btn-outline-dark w-100 py-2 rounded-pill">Back to Login</button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AuthModal;
