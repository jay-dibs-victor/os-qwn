"use client";

import { motion } from "framer-motion";
import { AlertCircle, Link as LinkIcon, ZapOff, Users } from "lucide-react";

const problems = [
  {
    title: "Systemic Fragmentation",
    description: "Intra-city, logistics, and intercity travel operate in isolated silos with zero interoperability.",
    icon: <LinkIcon size={28} className="text-red-400" />,
  },
  {
    title: "Duplicated Supply",
    description: "Drivers and assets are locked into single-vertical platforms, leading to massive utilization waste.",
    icon: <Users size={28} className="text-orange-400" />,
  },
  {
    title: "Fragmented Demand",
    description: "Users face disjointed discovery and inconsistent pricing when moving between transport modes.",
    icon: <ZapOff size={28} className="text-yellow-400" />,
  },
  {
    title: "Infrastructure Void",
    description: "No shared identity or payment layer exists to unify the $5T mobility ecosystem.",
    icon: <AlertCircle size={28} className="text-primary" />,
  },
];

export default function Problem() {
  return (
    <section className="section-wrapper bg-background">
      <div className="section-inner">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl lg:text-7xl font-bold font-outfit mb-6 leading-tight p-6"
          >
            Transportation is not lacking services, <br />
            <span className="text-red-500">it is lacking coordination.</span>
          </motion.h2>
          <p className="text-xl text-foreground-muted  text-center mx-auto leading-relaxed mb-4">
            Across urban mobility, logistics, and intercity travel, systems operate independently
            with duplicated supply pools and fragmented demand discovery.
          </p>
        </div>

        {/* Cards */}
        <div className="card-grid card-grid-4">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card glass group hover:border-white/20 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shrink-0 group-hover:scale-110 transition-transform duration-300">
                {problem.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 font-outfit">{problem.title}</h3>
              <p className="text-sm text-foreground-muted leading-relaxed grow">{problem.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
}
