"use client";

import { motion } from "framer-motion";

const metrics = [
  { label: "Urban Trips Simulated", value: "50K+" },
  { label: "Global Mobility Market", value: "$450B+" },
  { label: "Coordination Latency", value: "<25ms" },
  { label: "Active Nodes Projected", value: "500+" },
];

export default function Metrics() {
  return (
    <section className="py-24 bg-surface border-y border-white/5">
      <div className="container-custom">
        <div className="card-grid-4 gap-12">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl lg:text-6xl font-bold font-outfit text-primary mb-2 tracking-tighter">
                {metric.value}
              </div>
              <div className="text-xs lg:text-sm font-bold text-foreground-muted uppercase tracking-[0.2em]">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
