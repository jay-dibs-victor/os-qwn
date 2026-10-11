import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <main className="support-page py-5" style={{ marginTop: '80px', minHeight: '100vh', background: '#fcfcfc' }}>
      <div className="container">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="card border-0 shadow-sm p-5" 
          style={{ borderRadius: '24px' }}
        >
          <h1 className="fw-bold mb-4">Privacy Policy</h1>
          <p className="text-muted">Last Updated: April 2026</p>
          
          <div className="terms-content mt-5">
            <section className="mb-5">
              <h4 className="fw-bold">1. Information We Collect</h4>
              <p>We collect location data to enable ride tracking and safety features. We also collect contact information and payment details to process your transactions.</p>
            </section>

            <section className="mb-5">
              <h4 className="fw-bold">2. Use of Information</h4>
              <p>Your data is used to provide, maintain, and improve our services, including real-time navigation and traffic alerts.</p>
            </section>

            <section className="mb-5">
              <h4 className="fw-bold">3. Sharing with Drivers</h4>
              <p>When you request a ride, your pickup and destination locations are shared with the driver to facilitate the service.</p>
            </section>

            <section className="mb-5">
              <h4 className="fw-bold">4. Data Security</h4>
              <p>We implement industry-standard security measures to protect your personal information from unauthorized access.</p>
            </section>

            <section className="mb-5">
              <h4 className="fw-bold">5. Your Choices</h4>
              <p>You can manage your notification preferences and location sharing via the settings menu in the application.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
