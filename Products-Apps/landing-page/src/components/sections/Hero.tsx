"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Map as MapIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useModal } from "@/context/ModalContext";

export default function Hero() {
  const { openDemoModal } = useModal();

  return (
    <section className="relative  flex items-center overflow-hidden bg-background" style={{ height: "700px" }}>
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-purple/10 rounded-full blur-[140px]" />
      </div>

      <div className="section-inner relative z-10 pt-28 pb-20 grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* ── Left: Copy ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-primary text-sm font-semibold mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Next-Gen Mobility Infrastructure
          </motion.div>

          {/* Headline */}
          <h1 className="fluid-h1 font-bold font-outfit mb-8">
            The Intelligence Layer <br className="hidden lg:block" />
            for <span className="text-gradient-primary">Movement.</span>
          </h1>

          {/* Sub-headline */}
          <p className="fluid-body text-foreground-muted mb-10 max-w-lg mx-auto lg:mx-0">
            Queens OS is a unified transportation operating system coordinating ride-hailing, 
            logistics, and payments into a single, self-optimizing network.
          </p>

          {/* CTA Buttons */}
          <div style={{ marginTop: "20px" }} className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <button
              onClick={openDemoModal}
              className="inline-flex butten-padded items-center gap-2.5 px-8 py-4 bg-primary text-black font-bold text-base rounded-2xl hover:bg-primary-dark transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_32px_rgba(255,184,0,0.35)]"
            >
              Book a Demo <ArrowRight size={18} />
            </button>
            <Link
              href="/pitch-deck"
              className="inline-flex butten-padded items-center gap-2.5 px-8 py-4 glass text-white font-bold text-base rounded-2xl border-white/10 hover:bg-white/5 transition-all duration-200"
            >
              See Pitch  Deck
            </Link>
          </div>
        </motion.div>

        {/* ── Right: Dashboard Mockup ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="relative hidden lg:block"
        >
          {/* Main card */}
          <div className="glass-dark rounded-3xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Titlebar */}
            <div className="flex items-center justify-between mb-8" style={{ marginBottom: "20px" }}>
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="Q" className="w-9 h-9 object-contain" />
                <div>
                  <p className="text-sm font-bold leading-tight">Queens OS Dashboard</p>
                  <p className="text-[11px] text-foreground-muted">Tier-1 Real-time Node v2.4</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
            </div>



            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass p-8 rounded-2xl" style={{ padding: "20px" }}>
                <div className="flex items-center gap-2 text-primary mb-2">
                  <MapIcon size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Live Routes</span>
                </div>
                <div className="text-3xl font-bold font-outfit tracking-tight">1,248</div>
              </div>
              <div className="glass p-8 rounded-2xl" style={{ padding: "20px" }}>
                <div className="flex items-center gap-2 text-accent-blue mb-2">
                  <BarChart3 size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Demand</span>
                </div>
                <div className="text-3xl font-bold font-outfit tracking-tight">+24.5%</div>
              </div>
            </div>

            {/* Map area */}
            <div className="relative h-52 bg-black/50 rounded-2xl border border-white/5 overflow-hidden">
              <div className="absolute inset-0 bg-grid-white opacity-10" />
              <motion.div
                animate={{ x: [60, 160, 120, 200, 60], y: [40, 120, 80, 160, 40] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_#FFB800]"
              />
              <motion.div
                animate={{ x: [200, 80, 160, 40, 200], y: [120, 40, 150, 80, 120] }}
                transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
                className="absolute w-2.5 h-2.5 bg-accent-blue rounded-full shadow-[0_0_10px_#0EA5E9]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-mono text-primary/60 uppercase tracking-widest bg-black/70 px-3 py-1.5 rounded-lg">
                  AI Routing Active
                </span>
              </div>
            </div>

            {/* Log stream */}
            <div className="mt-5 space-y-2" style={{ padding: "20px", marginBottom: "20px" }}>
              {[
                { ts: "19:42:04", msg: "Optimizing Dispatch Node #429" },
                { ts: "19:42:05", msg: "Re-routing Fleet Segment G-7 (Traffic)" },
              ].map((entry) => (
                <div key={entry.ts} className="flex items-center gap-3 text-[11px] font-mono text-foreground-muted">
                  <span className="text-primary shrink-0">{entry.ts}</span>
                  <span>{entry.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating uptime badge */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-5 -left-5 glass border-primary/20 px-5 py-4 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-[10px] text-foreground-muted uppercase font-bold tracking-wider">System Health</div>
                <div className="text-sm font-bold">99.98% Uptime</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
