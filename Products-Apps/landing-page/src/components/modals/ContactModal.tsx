"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, MessageSquare, CheckCircle2, Send } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
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
      console.error("Contact error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setFormData({ name: "", email: "", message: "" });
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
            className="relative w-full max-w-[520px] glass-dark rounded-[40px] border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden"
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
                  key="contact-form"
                >
                  {/* Header */}
                  <div className="modal-section">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
                      <Mail size={12} className="text-primary" />
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">Get In Touch</span>
                    </div>
                    <h2 className="text-4xl font-bold font-outfit mb-3 tracking-tight">Contact Us</h2>
                    <p className="text-base text-foreground-muted font-medium leading-relaxed">
                      Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll get back to you shortly.
                    </p>
                  </div>

                  <form className="modal-form-wrapper" onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="demo-modal-label">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/80" size={18} />
                        <input
                          required
                          type="text"
                          placeholder="Enter your name"
                          className="demo-modal-input"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="demo-modal-label">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/80" size={18} />
                        <input
                          required
                          type="email"
                          placeholder="you@example.com"
                          className="demo-modal-input"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label className="demo-modal-label">Message</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-5 top-5 text-primary/80" size={18} />
                        <textarea
                          required
                          rows={4}
                          placeholder="Lets build something scalable."
                          className="demo-modal-input resize-none pt-4 pb-4"
                          style={{ paddingLeft: "48px", height: "auto" }}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key="contact-success"
                  className="text-center"
                >
                  <div className="modal-success-icon">
                    <CheckCircle2 size={48} className="text-primary" />
                  </div>
                  <h2 className="text-4xl font-bold font-outfit mb-4 tracking-tight">Message Sent!</h2>
                  <p className="text-lg text-foreground-muted mb-10 leading-relaxed font-medium">
                    Thanks, <span className="text-white font-bold">{formData.name}</span>!<br />
                    We&apos;ll get back to you at{" "}
                    <span className="text-white font-bold">{formData.email}</span> shortly.
                  </p>
                  <button
                    onClick={handleClose}
                    className="modal-success-btn"
                  >
                    Return to Home
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
