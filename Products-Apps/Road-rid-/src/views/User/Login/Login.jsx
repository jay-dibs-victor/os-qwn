import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUIStore } from '../../../core/store/useUIStore';
import { useAuthStore } from '../../../core/store/useAuthStore';
import "./Login.css";
import AnimatedHeroBackground from '../Home/AnimatedHeroBackground';
import queens_logo_1 from '../../../core/routes/User/queens_logo_1.svg';


                            


const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();
    const addToast = useUIStore((state) => state.addToast);

    const { login, token, user } = useAuthStore();

    // Redirect if already logged in
    React.useEffect(() => {
        if (token && user) {
            const roles = user.roles || user.role || '';
            const roleStr = Array.isArray(roles) ? roles.join(',') : String(roles);
            const isDriver = roleStr.includes('Individual Driver') || roleStr.includes('Courier Driver');
            if (isDriver) {
                const driverAppUrl = import.meta.env.VITE_DRIVER_APP_URL || 'http://localhost:4000';
                window.location.replace(driverAppUrl);
            } else {
                navigate('/dashboard');
            }
        }
    }, [token, user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            addToast('Please fill all fields', 'warning');
            return;
        }

        // Try to get location for currency/gateway sync
        let loginPayload = { ...formData };
        if ("geolocation" in navigator) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
                });
                loginPayload.lat = position.coords.latitude;
                loginPayload.lng = position.coords.longitude;
            } catch (geoError) {
                console.warn('Geolocation failed or timed out, proceeding with IP-based sync');
            }
        }

        const result = await login(loginPayload);
        if (result.success) {
                // Read the persisted user from localStorage first (login() writes there explicitly)
                let freshUser = null;
                let freshToken = null;
                try {
                    const stored = localStorage.getItem('queens-user-auth');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        freshUser = parsed?.state?.user || null;
                        freshToken = parsed?.state?.token || null;
                    }
                } catch (e) {
                    console.warn('Failed to read queens-user-auth from localStorage', e);
                }
                // Fallback to in-memory store if localStorage entry missing
                if (!freshUser) {
                    freshUser = useAuthStore.getState().user;
                    freshToken = useAuthStore.getState().token;
                }
            const roles = freshUser?.roles || freshUser?.role || '';
            const roleStr = Array.isArray(roles) ? roles.join(',') : String(roles);
            const isDriver = roleStr.includes('Individual Driver') || roleStr.includes('Courier Driver');

            if (isDriver) {
                const { encryptPayload, setSSOCookie } = await import('../../../core/helpers/ssoHelper');
                const freshToken = useAuthStore.getState().token;
                const payload = encryptPayload({ token: freshToken, user: freshUser });
                setSSOCookie(freshToken, freshUser);
                const driverAppUrl = import.meta.env.VITE_DRIVER_APP_URL || 'http://localhost:4000';
                addToast('Driver authenticated! Switching to portal...', 'info');
                setTimeout(() => {
                    window.location.href = `${driverAppUrl}?sso_payload=${payload}`;
                }, 600);
                return;
            }

            addToast('Welcome back to Queens!', 'success');
            navigate('/dashboard');
        } else {
            addToast(result.error || 'Login failed', 'danger');
        }
    };

    return (
    <div className="position-relative overflow-hidden vh-100 d-flex justify-content-center align-items-center" style={{ background: '#000000' }}>
            {/* Background Layer */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.25 }}>
                <AnimatedHeroBackground />
            </div>

            {/* Content Layer */}
            <div className="container position-relative" style={{ zIndex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="border-0 p-5" style={{ borderRadius: '24px', maxWidth: '450px', width: '100%', background: 'rgba(12, 12, 12, 0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 184, 0, 0.15)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>

                    <div className="text-center mb-5">
                        <div className="brand mb-3" style={{ color: '#FFB800', fontWeight: 800, fontSize: '32px' }}>
                            <img style={{
                                height: "100px",
                                width: "100px"
                            }} src={queens_logo_1} />
                        </div>
                        <h3 className="fw-bold" style={{ color: '#FFFFFF' }}>Welcome Back</h3>
                        <p style={{ color: '#A1A1AA' }}>Enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
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
                            <label htmlFor="password" style={{ color: '#A1A1AA' }}>Password</label>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="" id="remember" style={{ borderColor: 'rgba(255,255,255,0.2)', background: '#1a1a1a' }} />
                                <label className="form-check-label small" htmlFor="remember" style={{ color: '#A1A1AA' }}>
                                    Remember me
                                </label>
                            </div>
                            <Link to="/forgot-password" style={{ color: '#FFB800' }} className="small text-decoration-none fw-bold">Forgot password?</Link>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-3 fw-bold rounded-pill mb-4 shadow"
                            style={{ background: '#FFB800', color: '#000000', border: 'none' }}
                        >
                            Sign In
                        </button>

                        <div className="divider d-flex align-items-center my-4">
                            <p className="text-center fw-bold mx-3 mb-0 small" style={{ color: '#52525B' }}>OR</p>
                        </div>

                        <button type="button" className="btn w-100 py-2 rounded-pill mb-3 fw-bold" style={{ border: '1.5px solid rgba(255,255,255,0.15)', color: '#FFFFFF', background: 'transparent' }}>
                            <i className="bi bi-google"></i> Continue with Google
                        </button>
                        <button type="button" className="btn w-100 py-2 rounded-pill fw-bold" style={{ border: '1.5px solid rgba(255,255,255,0.15)', color: '#FFFFFF', background: 'transparent' }}>
                            <i className="bi bi-facebook"></i> Continue with Facebook
                        </button>

                        <p className="text-center mt-4 mb-0 small" style={{ color: '#A1A1AA' }}>
                            Don't have an account? <Link to="/register" className="fw-bold text-decoration-none" style={{ color: '#FFB800' }}>Sign up</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
