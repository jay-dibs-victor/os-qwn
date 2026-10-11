"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Calendar, User, Mail, CheckCircle2, Clock } from "lucide-react";

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookDemoModal({ isOpen, onClose }: BookDemoModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", email: "", date: "", time: "", prettyDate: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/schedule-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStep(3);
      } else {
        alert("Scheduling failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      // Skip weekends for demos? Or keep them? Let's skip weekends.
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        dates.push({
          d: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          iso: d.toISOString().split('T')[0], // YYYY-MM-DD
          t: ["9:00 AM", "11:00 AM", "1:30 PM", "3:00 PM", "4:30 PM"],
        });
      }
    }
    return dates;
  };

  const availableDates = generateDates();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[540px] glass-dark rounded-[40px] border border-white/10 shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 transition-all z-10 group"
            >
              <X size={24} className="text-foreground-muted group-hover:text-white transition-colors" />
            </button>

            <div className="modal-container">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key="step1"
                >
                  <div className="modal-section">
                    <h2 className="text-4xl font-bold font-outfit mb-3 tracking-tight">Book a Demo</h2>
                    <p className="text-lg text-foreground-muted font-medium">Experience the platform in action.</p>
                  </div>

                  <form className="modal-form-wrapper" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                    <div className="space-y-1" style={{ marginBottom: "20px" }}>
                      <label className="demo-modal-label">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/80" size={20} />
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

                    <div className="space-y-1" style={{ marginBottom: "20px" }}>
                      <label className="demo-modal-label">Work Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/80" size={20} />
                        <input
                          required
                          type="email"
                          placeholder="youremail@company.com"
                          className="demo-modal-input"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="demo-modal-btn-primary mt-4"
                    >
                      Choose Session Time
                    </button>
                    
                    <p className="mt-8 text-center text-[10px] text-foreground-muted uppercase tracking-widest font-bold opacity-60">
                      By booking, you agree to our <br/>
                      <Link href="/terms" className="text-white hover:text-primary transition-colors">Terms</Link> & <Link href="/privacy" className="text-white hover:text-primary transition-colors">Privacy Policy</Link>
                    </p>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key="step2"
                >
                  <div className="modal-section">
                    <h2 className="text-4xl font-bold font-outfit mb-2 tracking-tight">Select Time</h2>
                    <p className="text-lg text-foreground-muted font-medium">Book a live 30-min walkthrough.</p>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto pr-4 -mr-4 scrollbar-hide space-y-8">
                    {availableDates.map((day) => (
                      <div key={day.iso} className="space-y-4">
                        <div className="flex items-center gap-3 text-sm font-extrabold text-primary uppercase tracking-widest sticky top-0 bg-surface/80 backdrop-blur-md py-2 z-10 -mx-2 px-2 rounded-lg">
                          <Calendar size={16} />
                          {day.d}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {day.t.map((time) => (
                            <button
                              key={`${day.iso}-${time}`}
                              type="button"
                              onClick={() => setFormData({ ...formData, date: day.iso, time, prettyDate: day.d })}
                              className={`time-slot-btn ${formData.time === time && formData.prettyDate === day.d ? 'active' : ''}`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-10">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 glass text-white font-bold rounded-2xl hover:bg-white/10 transition-all border-white/5"
                    >
                      Back
                    </button>
                    <button
                      disabled={!formData.time || isSubmitting}
                      onClick={handleSubmit}
                      className="flex-[2] demo-modal-btn-primary"
                    >
                      {isSubmitting ? "Syncing Calendar..." : "Confirm Booking"}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key="success"
                  className="text-center"
                >
                  <div className="modal-success-icon">
                    <CheckCircle2 size={48} className="text-primary" />
                  </div>
                  <h2 className="text-4xl font-bold font-outfit mb-4 tracking-tight">You&apos;re Booked!</h2>
                  <p className="text-lg text-foreground-muted mb-10 leading-relaxed font-medium">
                    A Google Meet invitation has been sent to <br />
                    <span className="text-white font-bold">{formData.email}</span>
                  </p>
                  <div className="modal-success-card">
                    <div className="flex items-center gap-4 mb-4 text-foreground-muted font-bold text-xs uppercase tracking-widest opacity-60">
                      <Clock size={16} />
                      <span>30-minute Demo & Discovery</span>
                    </div>
                    <div className="flex items-center gap-4 text-xl font-bold text-white font-outfit">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Calendar size={20} className="text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-primary/80 mb-0.5">{formData.prettyDate || formData.date}</span>
                        <span>{formData.time} · Upcoming Session</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
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
