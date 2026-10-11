"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5" style={{ height: "100px", padding: "10px" }}>
        <div className="section-inner py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground-muted hover:text-white transition-colors group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold font-outfit">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3" >
            <Image src="/logo.svg" alt="Queens OS" width={32} height={32} className="object-contain" />
            <span className="font-bold font-outfit text-sm">Privacy Policy</span>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 section-inner legal-content" style={{ marginTop: "120px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8">
            <Shield size={16} />
            Data Protection Commitment
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold font-outfit mb-12 tracking-tight">
            Privacy <span className="text-primary">Policy.</span>
          </h1>

          <p className="legal-text text-xl mb-16">
            Last Updated: May 15, 2026. At Queens Inc (&quot;Queens OS&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;),
            we are committed to protecting your privacy and ensuring the security of your mobility data.
          </p>

          <div className="legal-content">
            <section className="legal-section">
              <h2 className="legal-title">1. Information We Collect</h2>
              <p className="legal-text">
                As an operating system for mobility, we collect data necessary to provide and optimize our transportation services:
              </p>
              <ul className="legal-list">
                <li><strong>Account Information:</strong> Name, email address, phone number, and professional details.</li>
                <li><strong>Location Data:</strong> Real-time GPS data for routing, dispatching, and safety features.</li>
                <li><strong>Usage Data:</strong> How you interact with our platform, including ride history and payment patterns.</li>
                <li><strong>Device Information:</strong> IP address, device type, and operating system version.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-title">2. How We Use Your Information</h2>
              <p className="legal-text">
                We use the collected information for the following purposes:
              </p>
              <ul className="legal-list">
                <li>To facilitate intelligent routing and fleet coordination.</li>
                <li>To process payments and manage billing for mobility services.</li>
                <li>To improve system performance and AI-driven predictive analytics.</li>
                <li>To ensure safety and security of all participants in the mobility network.</li>
                <li>To comply with legal obligations and regulatory requirements in the jurisdictions we operate.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-title">3. Data Sharing and Disclosure</h2>
              <p className="legal-text">
                Queens OS does not sell your personal data. We only share information:
              </p>
              <ul className="legal-list">
                <li>With service providers who assist in our operations (e.g., cloud hosting, payment processors).</li>
                <li>When required by law or to protect the rights and safety of our community.</li>
                <li>In the context of a corporate transaction, such as a merger or acquisition.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-title">4. Data Security</h2>
              <p className="legal-text">
                We implement industry-standard technical and organizational measures to protect your data. This includes end-to-end encryption for sensitive data and regular security audits of our infrastructure.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-title">5. Your Rights</h2>
              <p className="legal-text">
                Depending on your location, you may have the right to access, correct, or delete your personal information. You can manage your privacy settings within the Queens OS application or by contacting our data protection officer.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-title">6. Contact Us</h2>
              <p className="legal-text">
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <span className="text-primary font-bold">privacy@queensos.com</span>
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black/40">
        <div className="section-inner text-center">
          <p className="text-sm text-foreground-muted">
            © 2026 Queens Inc. Built for the World. Protected by Intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
