"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashFlowProps {
  activeStep: number;
}

export default function SplashFlow({ activeStep }: SplashFlowProps) {
  const isSplashFlow = activeStep === 0;

  // Generate some random coordinates for network nodes
  const nodes = [
    { cx: 10, cy: 20 }, { cx: 80, cy: 15 }, { cx: 20, cy: 80 }, { cx: 90, cy: 90 },
    { cx: 50, cy: 10 }, { cx: 10, cy: 50 }, { cx: 90, cy: 50 }, { cx: 50, cy: 90 },
    { cx: 30, cy: 30 }, { cx: 70, cy: 30 }, { cx: 30, cy: 70 }, { cx: 70, cy: 70 }
  ];

  return (
    <AnimatePresence>
      {isSplashFlow && (
        <motion.div 
          className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center z-50 overflow-hidden"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1 }}
        >
          {/* Animated SVG Network Mesh */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            {nodes.map((node, i) => (
              <g key={i}>
                <motion.line 
                  x1="50%" y1="50%" 
                  x2={`${node.cx}%`} y2={`${node.cy}%`} 
                  stroke="#ffb800" 
                  strokeWidth="1" 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 0.5, 0.2] }}
                  transition={{ 
                    duration: 2, 
                    delay: i * 0.1, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut" 
                  }}
                />
                <motion.circle 
                  cx={`${node.cx}%`} cy={`${node.cy}%`} r="3" fill="#ffb800"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0.5], scale: [0, 1.5, 1] }}
                  transition={{ 
                    duration: 2, 
                    delay: i * 0.1, 
                    repeat: Infinity, 
                    repeatType: "reverse"
                  }}
                />
              </g>
            ))}
          </svg>

          {/* Center Logo Node */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Pulsating background glow */}
            <motion.div 
              className="absolute w-32 h-32 bg-primary/20 rounded-full blur-2xl"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute w-24 h-24 bg-primary/40 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
            
            {/* The Logo */}
            <motion.div 
              className="w-20 h-20 bg-primary text-black rounded-2xl flex items-center justify-center text-4xl font-bold relative shadow-[0_0_40px_rgba(255,184,0,0.5)] border border-white/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Q
            </motion.div>
            
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <h1 className="text-3xl font-bold font-outfit text-white tracking-widest uppercase mb-2">Queens OS</h1>
              <div className="flex items-center justify-center gap-2 text-primary font-mono text-xs uppercase tracking-widest">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Initializing Surge Network
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
