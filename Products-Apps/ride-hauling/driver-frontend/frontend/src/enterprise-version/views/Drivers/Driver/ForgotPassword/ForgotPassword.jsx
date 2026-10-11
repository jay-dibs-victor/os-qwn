import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedHeroBackground from '../Home/AnimatedHeroBackground';
import '../Login.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.body.classList.add('auth-page');
        return () => document.body.classList.remove('auth-page');
    }, []);

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email address').required('Required'),
        }),
        onSubmit: async (values) => {
            try {
                // Mocking API call for now — in real app use mutated hook
                console.log('Resetting password for:', values.email);
                setSubmitted(true);
            } catch (err) {
                setError('Failed to send reset email. Please try again.');
            }
        },
    });

    return (
        <div className="auth-wrapper">
            <div className="auth-bg">
                <AnimatedHeroBackground />
            </div>

            <div className="auth-content container flex-row items-center justify-center min-vh-100">
                <div className="glass-auth-card animated fadeInUp shadow-lg">
                    <div className="text-center m-b-30">
                        <div className="auth-logo-icon bg-primary m-b-20 mx-auto flex-row items-center justify-center shadow-lg" style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#FFB800' }}>
                           <i className="md md-lock font-28 text-dark"></i>
                        </div>
                        <h2 className="auth-title">Reset Password</h2>
                        <p className="auth-subtitle">
                            {submitted 
                                ? "Check your inbox for a reset link." 
                                : "Enter your email and we'll send you instructions."}
                        </p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="form-group m-b-20">
                                <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-5 block">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className={`form-control premium-input ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                                    placeholder="driver@queens.com"
                                    {...formik.getFieldProps('email')}
                                />
                                {formik.touched.email && formik.errors.email && (
                                    <div className="text-danger font-11 m-t-5">{formik.errors.email}</div>
                                )}
                            </div>

                            {error && <div className="alert alert-danger font-12 m-b-20">{error}</div>}

                            <button type="submit" className="btn-premium w-full" disabled={formik.isSubmitting}>
                                {formik.isSubmitting ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="m-b-30 p-25" style={{ borderRadius: '20px', background: '#f8fafc', border: '1px solid #edf2f7' }}>
                                <i className="md md-check-circle text-success font-48 m-b-15"></i>
                                <p className="text-dark font-14">A verification email has been sent to <strong>{formik.values.email}</strong>. Please follow the instructions to reset your password.</p>
                            </div>
                            <Link to="/login" className="btn-premium w-full no-decoration">
                                Back to Login
                            </Link>
                        </div>
                    )}

                    <div className="m-t-30 text-center border-top p-t-20" style={{ borderTop: '1px solid #eeeeee' }}>
                        <p className="text-muted font-13">Remembered your password? <Link to="/login" className="auth-footer-link color-primary font-bold no-decoration hover-underline" style={{ color: '#FFB800' }}>Log In</Link></p>
                    </div>
                </div>
            </div>

            <div className="auth-footer-note relative z-10 text-center p-b-30">
                <p className="text-muted font-12">&copy; 2026 Goom Logistics. Secure Driving.</p>
            </div>
        </div>
    );
};

export default ForgotPassword;
