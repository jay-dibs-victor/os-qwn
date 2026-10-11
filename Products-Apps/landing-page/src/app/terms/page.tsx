"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, FileText } from "lucide-react";
import Image from "next/image";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Header */}
      <header style={{ height: "100px", padding: "10px" }} className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="section-inner py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground-muted hover:text-white transition-colors group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold font-outfit">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Queens OS" width={32} height={32} className="object-contain" />
            <span className="font-bold font-outfit text-sm">Terms of Service</span>
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
            <FileText size={16} />
            Service Agreement
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold font-outfit mb-12 tracking-tight">
            Terms of <span className="text-primary">Service.</span>
          </h1>

          <p className="legal-text text-xl mb-16">
            Last Updated: May 15, 2026. Please read these terms carefully before using the Queens OS platform. By accessing or using our services, you agree to be bound by these terms.
          </p>

          <div className="legal-content">
            <section className="legal-section">
              <h2 className="legal-title">1. Acceptance of Terms</h2>
              <p className="legal-text">
                By using Queens OS, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the platform.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-title">2. Platform Description</h2>
              <p className="legal-text">
                Queens OS is a mobility operating system designed to coordinate transportation, logistics, and payments. Our services include but are not limited to AI-driven routing, fleet management, and coordination of mobility nodes.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-title">3. User Responsibilities</h2>
              <ul className="legal-list">
                <li>You must provide accurate information when creating an account.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree to use the platform only for lawful purposes and in accordance with these terms.</li>
                <li>You may not use the platform in a way that could disable, overburden, or impair our servers.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2 className="legal-title">4. Payment Terms</h2>
              <p className="legal-text">
                Usage of certain features of Queens OS may be subject to fees. All payments are processed through our secure payment partners. You agree to provide valid payment information and authorize us to charge all applicable fees to your payment method.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-title">5. Intellectual Property</h2>
              <p className="legal-text">
                The platform and its entire contents (including logos, software, text, and images) are the property of Queens Inc and are protected by intellectual property laws. You are granted a limited, non-exclusive license to use the platform for its intended purpose.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-title">6. Limitation of Liability</h2>
              <p className="legal-text">
                To the maximum extent permitted by law, Queens Inc shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-title">7. Modifications to Terms</h2>
              <p className="legal-text">
                We reserve the right to modify these terms at any time. We will notify you of any changes by updating the &quot;Last Updated&quot; date at the top of this page. Your continued use of the platform after changes are posted constitutes your acceptance of the revised terms.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="legal-title">8. Governing Law</h2>
              <p className="legal-text">
                These terms shall be governed by and construed in accordance with international business laws, without regard to its conflict of law principles.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black/40">
        <div className="section-inner text-center">
          <p className="text-sm text-foreground-muted">
            © 2026 Queens Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
