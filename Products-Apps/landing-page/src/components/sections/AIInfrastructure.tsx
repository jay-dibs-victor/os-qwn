"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function AIInfrastructure() {
  const [hasMounted, setHasMounted] = useState(false);
  const [nodes] = useState(() => [...Array(8)].map(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`
  })));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-accent-blue font-bold text-sm uppercase tracking-widest mb-4">Deep Intelligence</div>
              <h2 className="fluid-h2 font-bold font-outfit mb-8 leading-tight">
                AI-Native <br />
                <span className="text-accent-blue">Coordination.</span>
              </h2>
              <div className="space-y-8">
                {[
                  { t: "Predictive Routing", d: "Anticipating traffic patterns before they occur using historical data streams." },
                  { t: "Autonomous Dispatch", d: "Removing human error from the coordination of thousands of vehicles." },
                  { t: "Dynamic Pricing", d: "Real-time surge balancing based on hyperlocal demand heatmaps." }
                ].map((item, i) => (
                  <div key={i} className="group cursor-default p-4 glass rounded-xl border-transparent hover:border-accent-blue/20 transition-all">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-accent-blue transition-colors font-outfit">{item.t}</h3>
                    <p className="text-foreground-muted leading-relaxed text-lg">{item.d}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/2 relative h-[600px] w-full flex items-center justify-center">
            <div className="absolute inset-0 bg-accent-blue/5 rounded-full blur-[120px]" />
            {/* Animated AI Visualization */}
            <div className="relative h-full w-full max-w-lg lg:max-w-full glass rounded-[40px] border-white/5 overflow-hidden flex items-center justify-center shadow-2xl">
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
                <defs>
                  <pattern id="grid-ai" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-ai)" />
              </svg>

              {/* Neural Network Nodes Simulation */}
              <div className="relative w-80 h-80">
                {hasMounted && nodes.map((node, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.4
                    }}
                    className="absolute w-4 h-4 rounded-full bg-accent-blue shadow-[0_0_15px_#0EA5E9]"
                    style={{
                      top: node.top,
                      left: node.left
                    }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-48 h-48 rounded-full border border-accent-blue/30 border-dashed"
                  />
                  <div className="absolute w-32 h-32 rounded-full bg-accent-blue/10 blur-2xl animate-pulse" />
                  <div className="text-accent-blue text-[10px] font-mono font-bold tracking-[0.3em] uppercase">Core Intel</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

