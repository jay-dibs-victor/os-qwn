import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { useUIStore } from '../../../core/store/useUIStore';
import "./Home.css";
import queens_logo_1 from '../../../core/routes/Admin/queens_logo_1.svg';

/**
 * Home (Admin Login) — taxi-admin
 * Redesigned to match the premium GoomTaxi branding.
 * Uses Zustand for authentication and UI feedback.
 */
const Home = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const { token, user } = useAuthStore();
    const addToast = useUIStore((state) => state.addToast);

    // Redirect if already authenticated
    useEffect(() => {
        if (token && user) {
            navigate('/dashboard');
        }
    }, [token, user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            addToast('Please provide both email and password', 'warning');
            return;
        }

        setIsSubmitting(true);
        const result = await login(formData);

        if (result.success) {
            addToast('Access granted. Welcome to terminal.', 'success');
            navigate('/dashboard');
        } else {
            addToast(result.error || 'Authentication failed', 'danger');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-login-wrapper">
            {/* Animated Background Shapes */}
            <div className="login-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>

            <div className="login-card-container">
                <div className="login-card shadow-2xl">
                    <div className="login-header">
                        <div className="login-brand">


                            <img style={{
                                height: "100px",
                                width: "100px"
                            }} src={queens_logo_1} />
                        </div>
                        <p className="login-subtitle">SECURE ADMINISTRATIVE GATEWAY</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group-custom">
                            <label className="form-label-custom">Admin Identifier</label>
                            <div className="input-wrapper-custom">
                                <i className="bi bi-envelope-fill"></i>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control-custom"
                                    placeholder="admin@goomtaxi.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group-custom">
                            <label className="form-label-custom">Security Key</label>
                            <div className="input-wrapper-custom">
                                <i className="bi bi-key-fill"></i>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control-custom"
                                    placeholder="••••••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button-custom"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="d-flex align-items-center gap-2">
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                    AUTHENTICATING...
                                </span>
                            ) : (
                                <>
                                    ENTER DASHBOARD <i className="bi bi-arrow-right-short"></i>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="footer-links">
                        <a href="#" className="footer-link">Lost your security key? Contact Support</a>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', letterSpacing: '2px', fontWeight: 800 }}>
                        &copy; 2024 GOOM LOGISTICS ECOSYSTEM • v2.4.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
