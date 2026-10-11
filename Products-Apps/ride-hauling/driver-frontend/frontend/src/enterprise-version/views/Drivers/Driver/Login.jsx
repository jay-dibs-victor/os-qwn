import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLoginMutation } from '../../../core/hooks/useAuthHooks';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedHeroBackground from './Home/AnimatedHeroBackground';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { mutate: login, isPending } = useLoginMutation();
    const [requiresVerification, setRequiresVerification] = useState(false);
    const [emailForVerification, setEmailForVerification] = useState('');

    useEffect(() => {
        document.body.classList.add('auth-page');
        return () => document.body.classList.remove('auth-page');
    }, []);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Invalid email address')
                .required('Required'),
            password: Yup.string()
                .min(6, 'Must be at least 6 characters')
                .required('Required'),
        }),
        onSubmit: async (values) => {
            let loginPayload = { ...values };
            if ("geolocation" in navigator) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
                    });
                    loginPayload.lat = position.coords.latitude;
                    loginPayload.lng = position.coords.longitude;
                } catch (geoError) {
                    console.warn('Geolocation failed or timed out for driver login');
                }
            }

            login(loginPayload, {
                onSuccess: (result) => {
                    if (result.success) {
                        if (result.requiresVerification) {
                            setEmailForVerification(values.email);
                            setRequiresVerification(true);
                            setTimeout(() => {
                                navigate(`/signup`);
                            }, 2000);
                        } else {
                            navigate('/dashboard');
                        }
                    } else if (result.requiresVerification) {
                        setEmailForVerification(values.email);
                        setRequiresVerification(true);
                        setTimeout(() => {
                            navigate(`/signup`);
                        }, 2000);
                    }
                }
            });
        },
    });

    return (
        <div className="auth-wrapper">
            <div className="auth-bg">
                <AnimatedHeroBackground />
            </div>

            <div className="auth-content container flex-row items-center justify-center min-vh-100">
                <div className="glass-auth-card animated fadeInUp">
                    <div className="text-center m-b-30">
                        <div className="auth-logo-icon bg-primary m-b-20 mx-auto flex-row items-center justify-center shadow-lg" style={{ width: '64px', height: '64px', borderRadius: '18px', background: '#FFB800' }}>
                           <i className="md md-local-taxi font-32 text-dark"></i>
                        </div>
                        <h2 className="auth-title">Driver Portal</h2>
                        <p className="auth-subtitle">Welcome back! Please login to start driving.</p>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="form-group m-b-20">
                            <label className="text-muted font-12 font-bold uppercase tracking-wider m-b-5 block">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className={`form-control premium-input ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                                placeholder="driver@queens.com"
                                {...formik.getFieldProps('email')}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-danger font-12 m-t-5">{formik.errors.email}</div>
                            )}
                        </div>

                        <div className="form-group m-b-25">
                            <div className="flex-row justify-between items-center m-b-5">
                                <label className="text-muted font-12 font-bold uppercase tracking-wider">Password</label>
                                <Link to="/recovery" className="font-12 text-primary font-bold no-decoration hover-underline">Forgot?</Link>
                            </div>
                            <input
                                type="password"
                                name="password"
                                className={`form-control premium-input ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                                placeholder="••••••••"
                                {...formik.getFieldProps('password')}
                            />
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-danger font-12 m-t-5">{formik.errors.password}</div>
                            )}
                        </div>

                        <div className="form-group text-center m-t-30">
                            <button
                                type="submit"
                                className="btn-premium w-full"
                                disabled={isPending}
                            >
                                {isPending ? <div className="spinner-border spinner-border-sm text-dark"></div> : 'Login into Account'}
                            </button>
                        </div>

                        <div className="m-t-30 text-center">
                            <p className="text-muted font-14">
                                New to the fleet?{' '}
                                <Link to="/signup" className="auth-footer-link color-primary font-bold no-decoration hover-underline" style={{ color: '#FFB800' }}>Apply to Drive</Link>
                            </p>
                        </div>

                        <div className="social-login-separator m-t-40 m-b-30 relative">
                            <hr style={{ borderColor: 'var(--color-border)' }} />
                            <span className="absolute px-3 bg-white text-muted font-12 font-bold uppercase tracking-wider" style={{ left: '50%', transform: 'translateX(-50%)', top: '-10px' }}>Or continue with</span>
                        </div>

                        <div className="flex-row items-center justify-center gap-20 m-b-20">
                            <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1'}/auth/google`} className="social-btn shadow-sm" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                                <img src="/assets/images/google.png" alt="Google" style={{ width: '24px' }} className="mx-auto" />
                            </a>
                            <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1'}/auth/facebook`} className="social-btn shadow-sm" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#3b5998', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                                <i className="bi bi-facebook text-white font-20 mx-auto"></i>
                            </a>
                            <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1'}/auth/instagram`} className="social-btn shadow-sm" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                                <i className="bi bi-instagram text-white font-20 mx-auto"></i>
                            </a>
                        </div>
                    </form>
                </div>
            </div>

            <div className="auth-footer-note relative z-10 text-center p-b-30">
                <p className="text-muted font-12">&copy; 2026 Goom Logistics. Drive with Excellence.</p>
            </div>
        </div>
    );
};

export default Login;
