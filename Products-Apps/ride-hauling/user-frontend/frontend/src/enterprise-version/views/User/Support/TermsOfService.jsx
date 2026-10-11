import React from 'react';
import { motion } from 'framer-motion';

const TermsOfService = () => {
  return (
    <main className="support-page py-5" style={{ marginTop: '80px', minHeight: '100vh', background: '#fcfcfc' }}>
      <div className="container">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="card border-0 shadow-sm p-5" 
          style={{ borderRadius: '24px' }}
        >
          <h1 className="fw-bold mb-4">Terms of Service</h1>
          <p className="text-muted">Last Updated: April 2026</p>
          
          <div className="terms-content mt-5">
            <section className="mb-5">
              <h4 className="fw-bold">1. Acceptance of Terms</h4>
              <p>By accessing and using Queens, you agree to be bound by these Terms of Service. If you do not agree, please refrain from using our platform.</p>
            </section>

            <section className="mb-5">
              <h4 className="fw-bold">2. Service Description</h4>
              <p>Queens provides a technology platform that connects users with independent third-party transportation providers. We do not provide transportation services ourselves.</p>
            </section>

            <section className="mb-5">
              <h4 className="fw-bold">3. User Conduct</h4>
              <p>Users are expected to treat drivers with respect. Any form of harassment, violence, or illegal activity during a ride will result in immediate termination of access to the platform.</p>
            </section>

            <section className="mb-5">
              <h4 className="fw-bold">4. Payment & Cancellation</h4>
              <p>Fares are calculated based on distance, duration, and traffic. Cancellations made 5 minutes after a driver has accepted the request may incur a fee.</p>
            </section>

            <section className="mb-5">
              <h4 className="fw-bold">5. Limitation of Liability</h4>
              <p>Queens is not liable for indirect, incidental, special, or consequential damages arising out of the use of the services.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default TermsOfService;
