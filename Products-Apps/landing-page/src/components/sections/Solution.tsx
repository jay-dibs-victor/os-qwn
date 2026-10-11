"use client";

import { motion } from "framer-motion";
import { Car, Package, Truck, Cpu, Wallet, Users, Navigation, TrendingUp, BrainCircuit } from "lucide-react";

const modules = [
  { name: "Ride-hailing", icon: <Car size={24} /> },
  { name: "Logistics", icon: <Package size={24} /> },
  { name: "Fleet Management", icon: <Truck size={24} /> },
  { name: "AI Dispatch", icon: <Cpu size={24} /> },
  { name: "Smart Payments", icon: <Wallet size={24} /> },
  { name: "Driver Ops", icon: <Users size={24} /> },
  { name: "Real-time Tracking", icon: <Navigation size={24} /> },
  { name: "Route Optimization", icon: <BrainCircuit size={24} /> },
  { name: "Demand Prediction", icon: <TrendingUp size={24} /> },
];

export default function Solution() {
  return (
    <section className="section-wrapper bg-surface">
      <div className="section-inner">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-5xl lg:text-7xl font-bold font-outfit mb-6 leading-tight"
          >
            An AI-Driven <br />
            <span className="text-primary">Coordination Layer.</span>
          </motion.h2>
          <p className="text-xl butten-padded text-foreground-muted text-center mx-auto leading-relaxed">
            Standardizing how transportation services connect, transact, and scale by transforming
            fragmented silos into a single, coordinated, and extensible network.
          </p>
        </div>

        {/* Module cards */}
        <div className="card-grid card-grid-3">
          {modules.map((module, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.04 }}
              className="card glass flex-col items-center justify-center text-center group cursor-default hover:border-primary/40 transition-all duration-300"
              style={{ alignItems: "center", justifyContent: "center", minHeight: "180px" }}
            >
              <div
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 shrink-0 group-hover:bg-primary group-hover:text-background transition-all duration-300"
                style={{ boxShadow: "0 0 0 rgba(255,184,0,0)" }}
              >
                {module.icon}
              </div>
              <h3 className="font-bold text-lg font-outfit tracking-tight">{module.name}</h3>
            </motion.div>
          ))}
        </div>

        {/* Core Architecture strip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 glass-dark rounded-3xl p-10 lg:p-14 shadow-2xl relative overflow-hidden"
          style={{ marginTop: "40px" }}
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-primary font-bold text-xs uppercase tracking-widest mb-4">Core Architecture</div>
              <h3 className="text-3xl lg:text-4xl font-bold font-outfit mb-6">Built for enterprise scale.</h3>
              <p className="text-foreground-muted leading-relaxed mb-8 text-lg">
                Modular and API-first — governments and large-scale enterprises can integrate Queens OS into
                existing infrastructure seamlessly without ripping and replacing.
              </p>
              <ul className="space-y-3">
                {[
                  "Unified Mobility Coordination",
                  "High-Frequency Trip Optimization",
                  "Real-time Fleet Liquidity Engine",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-base font-medium">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center" style={{ padding: "20px" }}>
              <div className="aspect-square w-full max-w-xs bg-gradient-to-tr from-primary/20 to-accent-purple/20 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                <div className="flex flex-col items-center gap-4">
                  <div className="glass p-4 rounded-xl border border-primary/30 shadow-[0_0_24px_rgba(255,184,0,0.2)]">
                    <div className="w-10 h-10 bg-primary rounded-lg" />
                  </div>
                  <div className="h-8 w-px bg-gradient-to-b from-primary to-transparent" />
                  <div className="flex gap-4">
                    <div className="glass p-3 rounded-xl border border-accent-blue/30"><div className="w-7 h-7 bg-accent-blue rounded" /></div>
                    <div className="glass p-3 rounded-xl border border-accent-purple/30"><div className="w-7 h-7 bg-accent-purple rounded" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
