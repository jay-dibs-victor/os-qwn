"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Mail, CheckCircle2, FileText, Send } from "lucide-react";

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function ProposalModal({ isOpen, onClose, title = "Request Business Proposal" }: ProposalModalProps) {
  const [formData, setFormData] = useState({ email: "", linkedin: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/send-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        alert("Failed to send: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Proposal request error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setFormData({ email: "", linkedin: "" });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-[500px] glass-dark rounded-[40px] border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 transition-all z-10 group"
            >
              <X size={24} className="text-foreground-muted group-hover:text-white transition-colors" />
            </button>

            <div className="modal-container">
              {!success ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key="proposal-form"
                >
                  {/* Header */}
                  <div className="modal-section">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
                      <FileText size={12} className="text-primary" />
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">Document Request</span>
                    </div>
                    <h2 className="text-4xl font-bold font-outfit mb-3 tracking-tight">{title}</h2>
                    <p className="text-base text-foreground-muted font-medium leading-relaxed">
                      Enter your details below to request the Queens OS Business Proposal. Our team will verify your request and send the documents shortly.
                    </p>
                  </div>

                  <form className="modal-form-wrapper" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <label className="demo-modal-label">Work Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/80" size={20} />
                        <input
                          required
                          type="email"
                          placeholder="you@company.com"
                          className="demo-modal-input"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="demo-modal-label">LinkedIn Profile URL (Optional)</label>
                      <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/80 font-bold text-xs">in</div>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          className="demo-modal-input pl-12"
                          value={formData.linkedin}
                          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="demo-modal-btn-primary flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Request Proposal
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-8 text-center text-xs text-foreground-muted">
                    By requesting this document, you agree to our <Link href="/privacy" className="text-white cursor-pointer hover:underline">Privacy Policy</Link>.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key="proposal-success"
                  className="text-center"
                >
                  <div className="modal-success-icon">
                    <CheckCircle2 size={48} className="text-primary" />
                  </div>
                  <h2 className="text-4xl font-bold font-outfit mb-4 tracking-tight">Request Received!</h2>
                  <p className="text-lg text-foreground-muted mb-10 leading-relaxed font-medium">
                    Thank you! We have received your request. <br />
                    Our team will review your profile and send the proposal to <br />
                    <span className="text-white font-bold">{formData.email}</span> shortly.
                  </p>

                  <button
                    onClick={handleClose}
                    className="modal-success-btn"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

