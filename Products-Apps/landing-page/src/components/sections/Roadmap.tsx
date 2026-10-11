"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

const phases = [
  {
    phase: "Phase 1",
    title: "Liquidity Layer",
    status: "Active",
    description: "Establishing high-frequency data loops through urban ride-hailing and courier services in initial megacities.",
    items: [
      "Real-time driver-passenger matching",
      "Dynamic pricing & AI dispatch",
      "Last-mile courier integration",
      "Wallet & payment orchestration"
    ]
  },
  {
    phase: "Phase 2",
    title: "Network Expansion",
    status: "Upcoming",
    description: "Extending the coordination layer to intercity travel and structured, long-distance movement.",
    items: [
      "Intercity road-travel integration",
      "Scheduled transport coordination",
      "Multi-leg journey planning",
      "Fleet management APIs"
    ]
  },
  {
    phase: "Phase 3",
    title: "Ecosystem Layer",
    status: "Planned",
    description: "Opening the intelligence layer to third-party operators and global mobility providers.",
    items: [
      "Public API exposure",
      "Predictive demand forecasting for partners",
      "Cross-modal routing standard",
      "Global travel aggregation"
    ]
  },
  {
    phase: "Phase 4",
    title: "Infrastructure Integration",
    status: "Vision",
    description: "Selective investment in high-efficiency dispatch hubs and advanced transport systems.",
    items: [
      "Smart terminal & dispatch hubs",
      "Autonomous fleet support",
      "Specialized mobility infrastructure",
      "Next-gen aerial transport integration"
    ]
  }
];

export default function Roadmap() {
  return (
    <section className="section-wrapper bg-background" id="roadmap">
      <div className="section-inner">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Strategic Execution</div>
            <h2 className="text-5xl lg:text-7xl font-bold font-outfit mb-6 tracking-tight">
              Phased <span className="text-primary">Evolution.</span>
            </h2>
            <p className="text-xl text-foreground-muted text-center mx-auto leading-relaxed">
              Queens OS scales through verified liquidity layers, ensuring each phase is
              operationally stable before expanding the network.
            </p>
          </motion.div>
        </div>

        <div style={{ marginTop: "20px", padding: "20px" }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {phases.map((phase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className={`h-full glass-dark rounded-[32px] p-8 border border-white/5 group-hover:border-primary/30 transition-all duration-500 flex flex-col`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                    {phase.phase}
                  </div>
                  {phase.status === "Active" ? (
                    <div className="flex items-center gap-1.5 text-green-500 text-[10px] font-bold uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      {phase.status}
                    </div>
                  ) : (
                    <div className="text-foreground-muted/40 text-[10px] font-bold uppercase tracking-widest">
                      {phase.status}
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold font-outfit mb-4 group-hover:text-primary transition-colors">{phase.title}</h3>
                <p className="text-sm text-foreground-muted leading-relaxed mb-8">
                  {phase.description}
                </p>

                <div className="mt-auto space-y-3">
                  {phase.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs font-medium text-foreground-muted/80">
                      <div className="mt-0.5 shrink-0">
                        {phase.status === "Active" ? (
                          <CheckCircle2 size={14} className="text-primary" />
                        ) : (
                          <Circle size={14} className="text-white/10" />
                        )}
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {index < phases.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 translate-y-[-50%] z-10 text-white/5 group-hover:text-primary/20 transition-colors">
                  <ArrowRight size={32} strokeWidth={1} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: "20px", padding: "20px" }} className="mt-24 p-12 glass rounded-[40px] border-white/5 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <h3 className="text-3xl font-bold font-outfit mb-4">The End State</h3>
          <p className="text-lg text-foreground-muted text-center mx-auto leading-relaxed">
            &quot;A unified transportation operating system that coordinates movement across people and goods,
            standardizing how infrastructure integrates into a single, consistent framework.&quot;
          </p>
        </div>
      </div>
    </section >
  );
}
