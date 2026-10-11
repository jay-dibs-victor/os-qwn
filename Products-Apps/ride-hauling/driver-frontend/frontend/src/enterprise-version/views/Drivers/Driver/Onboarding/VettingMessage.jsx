import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedHeroBackground from '../Home/AnimatedHeroBackground';

const VettingMessage = () => {
    return (
        <div className="auth-wrapper">
            <div className="auth-bg">
                <AnimatedHeroBackground />
            </div>

            <div className="auth-content container flex-row items-center justify-center min-vh-100">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-auth-card text-center shadow-lg"
                    style={{ maxWidth: '550px' }}
                >
                    <div className="m-b-30">
                        <motion.div
                            animate={{ 
                                scale: [1, 1.05, 1],
                                rotate: [0, 2, -2, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="bg-primary mx-auto flex-row items-center justify-center shadow-lg"
                            style={{ width: '100px', height: '100px', borderRadius: '30px', background: '#FFB800' }}
                        >
                            <i className="md md-verified-user font-48 text-dark"></i>
                        </motion.div>
                    </div>

                    <h1 className="auth-title m-b-15">Identity Verification</h1>
                    <p className="text-muted font-16 m-b-40">
                        Sit tight! Our administration team is currently vetting your documents. 
                        A decision is typically reached within <strong>24-48 business hours</strong>.
                    </p>

                    <div className="glass p-30 m-b-40 text-left" style={{ borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.02)' }}>
                        <h5 className="text-primary font-bold m-b-15" style={{ color: '#FFB800' }}>Vetting Pipeline</h5>
                        <div className="flex-row items-start m-b-15">
                            <i className="md md-check-circle text-success m-r-10 m-t-2"></i>
                            <p className="text-muted font-13 m-0">Submission received and securely encrypted.</p>
                        </div>
                        <div className="flex-row items-start m-b-15">
                            <i className="md md-schedule text-warning m-r-10 m-t-2"></i>
                            <p className="text-muted font-13 m-0">Background check and document validation in progress.</p>
                        </div>
                        <div className="flex-row items-start">
                            <i className="md md-mail-outline text-muted m-r-10 m-t-2"></i>
                            <p className="text-muted font-13 m-0">Final approval notice via registered email.</p>
                        </div>
                    </div>

                    <Link 
                        to="/login" 
                        className="btn-premium w-full no-decoration"
                    >
                        Return to Portal Login
                    </Link>

                    <div className="m-t-30">
                        <p className="text-muted font-11 uppercase font-bold tracking-widest">Status: PENDING REVIEW</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default VettingMessage;
