import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useSignupMutation } from '../../../../core/hooks/useAuthHooks';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import AnimatedHeroBackground from '../Home/AnimatedHeroBackground';
import OnboardingModal from '../../../../core/components/OnboardingModal';
import '../Login.css';

const Register = () => {
    const navigate = useNavigate();
    const { mutate: signup, isPending } = useSignupMutation();
    const verifyEmail = useAuthStore((state) => state.verifyEmail);
    const resendVerification = useAuthStore((state) => state.resendVerification);

    const [step, setStep] = useState(1); // 1: Registration, 2: Verification
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(0);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [showConfettiModal, setShowConfettiModal] = useState(false);

    useEffect(() => {
        document.body.classList.add('auth-page');
        return () => document.body.classList.remove('auth-page');
    }, []);

    // Handle timer for resend
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown(c => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const formik = useFormik({
        initialValues: {
            firstname: '',
            lastname: '',
            username: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            user_type: 'Individual',
        },
        validationSchema: Yup.object({
            firstname: Yup.string().required('Required'),
            lastname: Yup.string().required('Required'),
            username: Yup.string().required('Required'),
            email: Yup.string().email('Invalid email').required('Required'),
            phoneNumber: Yup.string().required('Required'),
            password: Yup.string().min(6, 'Min 6 chars').required('Required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Required'),
        }),
        onSubmit: (values) => {
            signup(values, {
                onSuccess: (result) => {
                    if (result.success) {
                        setEmail(values.email);
                        setStep(2);
                        setCountdown(300); // 5 minutes
                    }
                }
            });
        },
    });

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newCode = [...verificationCode];
        newCode[index] = value.substring(value.length - 1);
        setVerificationCode(newCode);

        // Auto focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleVerify = async () => {
        const code = verificationCode.join('');
        if (code.length < 6) return;

        const result = await verifyEmail(email, code);
        if (result.success) {
            setShowConfettiModal(true);
        } else {
            setMsg({ text: result.error, type: 'danger' });
        }
    };

    const handleStartOnboarding = () => {
        setShowConfettiModal(false);
        navigate('/onboarding');
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        const result = await resendVerification(email);
        if (result.success) {
            setCountdown(300);
            setMsg({ text: 'Code resent!', type: 'success' });
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-bg">
                <AnimatedHeroBackground />
            </div>

            <div className="auth-content container flex-row items-center justify-center min-vh-100">
                <div className={`glass-auth-card animated ${step === 1 ? 'fadeInUp' : 'fadeIn'} shadow-lg`} style={{ maxWidth: step === 1 ? '600px' : '460px' }}>
                    <div className="text-center m-b-30">
                        <div className="auth-logo-icon bg-primary m-b-20 mx-auto flex-row items-center justify-center shadow-lg" style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#FFB800' }}>
                            <i className="md md-local-taxi font-28 text-dark"></i>
                        </div>
                        <h2 className="auth-title">{step === 1 ? 'Join the Fleet' : 'Secure Verification'}</h2>
                        <p className="auth-subtitle">
                            {step === 1
                                ? 'Complete the form to start your journey with Goom Logistics.'
                                : `We've sent a 6-digit code to ${email}`}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={formik.handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 m-b-15">
                                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-5 block">First Name</label>
                                    <input {...formik.getFieldProps('firstname')} className="form-control premium-input" placeholder="John" />
                                    {formik.touched.firstname && formik.errors.firstname && <div className="text-danger font-11 m-t-5">{formik.errors.firstname}</div>}
                                </div>
                                <div className="col-md-6 m-b-15">
                                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-5 block">Last Name</label>
                                    <input {...formik.getFieldProps('lastname')} className="form-control premium-input" placeholder="Doe" />
                                    {formik.touched.lastname && formik.errors.lastname && <div className="text-danger font-11 m-t-5">{formik.errors.lastname}</div>}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 m-b-15">
                                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-5 block">Email Address</label>
                                    <input {...formik.getFieldProps('email')} className="form-control premium-input" placeholder="john@example.com" />
                                    {formik.touched.email && formik.errors.email && <div className="text-danger font-11 m-t-5">{formik.errors.email}</div>}
                                </div>
                                <div className="col-md-6 m-b-15">
                                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-5 block">Phone Number</label>
                                    <input {...formik.getFieldProps('phoneNumber')} className="form-control premium-input" placeholder="+234..." />
                                    {formik.touched.phoneNumber && formik.errors.phoneNumber && <div className="text-danger font-11 m-t-5">{formik.errors.phoneNumber}</div>}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 m-b-20">
                                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-5 block">Password</label>
                                    <input type="password" {...formik.getFieldProps('password')} className="form-control premium-input" placeholder="••••••••" />
                                    {formik.touched.password && formik.errors.password && <div className="text-danger font-11 m-t-5">{formik.errors.password}</div>}
                                </div>
                                <div className="col-md-6 m-b-20">
                                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-5 block">Confirm Password</label>
                                    <input type="password" {...formik.getFieldProps('confirmPassword')} className="form-control premium-input" placeholder="••••••••" />
                                    {formik.touched.confirmPassword && formik.errors.confirmPassword && <div className="text-danger font-11 m-t-5">{formik.errors.confirmPassword}</div>}
                                </div>
                            </div>

                            <button type="submit" className="btn-premium w-full m-t-10" disabled={isPending}>
                                {isPending ? <div className="spinner-border spinner-border-sm text-dark"></div> : 'Register as Driver'}
                            </button>
                        </form>
                    ) : (
                        <div className="verification-ui">
                            {msg.text && <div className={`alert alert-${msg.type} font-12 m-b-20`}>{msg.text}</div>}

                            <div className="otp-box-container flex-row justify-center gap-10 m-b-30">
                                {verificationCode.map((val, i) => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        className="otp-box text-center font-24 font-bold"
                                        style={{ 
                                            width: '50px', 
                                            height: '60px', 
                                            borderRadius: '12px', 
                                            border: '2px solid #eee',
                                            background: '#f8fafc',
                                            color: 'var(--color-text)'
                                        }}
                                        value={val}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        maxLength="1"
                                    />
                                ))}
                            </div>

                            <button onClick={handleVerify} className="btn-premium w-full m-t-10">Verify & Activate Account</button>

                            <div className="text-center m-t-30">
                                <p className="text-muted font-13">
                                    Didn't receive the code?{' '}
                                    <button
                                        onClick={handleResend}
                                        className="btn-link font-bold text-primary no-decoration hover-underline"
                                        disabled={countdown > 0}
                                        style={{ border: 'none', background: 'none', padding: 0 }}
                                    >
                                        {countdown > 0 ? `Resend in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}` : 'Resend Code'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="m-t-30 text-center border-top p-t-20" style={{ borderTop: '1px solid #eeeeee' }}>
                        <p className="text-muted font-13">Already have a driver account? <Link to="/login" className="auth-footer-link color-primary font-bold no-decoration hover-underline" style={{ color: '#FFB800' }}>Log In</Link></p>
                    </div>
                </div>
            </div>

            <OnboardingModal
                show={showConfettiModal}
                onStartOnboarding={handleStartOnboarding}
                onSkip={() => navigate('/')}
                isMandatory={true}
            />
        </div>
    );
};

export default Register;
