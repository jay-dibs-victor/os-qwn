"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MapLayerProps {
  activeStep: number;
}

export default function MapLayer({ activeStep }: MapLayerProps) {
  const isFlightFlow = activeStep >= 9 && activeStep <= 12;
  const isItineraryFlow = activeStep === 25;

  return (
    <AnimatePresence>
      {(!isFlightFlow && !isItineraryFlow) && (
        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <svg className="wps-map-svg" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
            {/* Simulated roads for Ride Flow */}
            {activeStep > 0 && activeStep < 9 && (
              <>
                <path d="M-100,100 L300,200 L500,150 L800,300 L1100,250" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <path d="M200,-50 L300,200 L250,500 L100,700" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <path d="M600,-50 L500,150 L650,400 L500,700" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
              </>
            )}
            
            {/* Active Route (Steps 1-6 -> 2-7) */}
            {activeStep > 1 && activeStep !== 4 && activeStep < 8 && (
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
                d="M300,200 L500,150 L650,400" 
                fill="none" 
                stroke="#ffb800" 
                strokeWidth="4" 
                strokeDasharray="8 8"
              />
            )}
            
            {/* Markers (Steps 1-7 -> 2-8) */}
            {activeStep > 1 && activeStep !== 4 && activeStep <= 8 && (
              <>
                {activeStep < 7 && <circle cx="300" cy="200" r="8" fill="#34a853" />}
                <circle cx="650" cy="400" r="8" fill="#ea4335" />
              </>
            )}

            {/* Moving Car / Driver Pin (Steps 4-7 -> 5-8) */}
            {activeStep >= 5 && activeStep <= 8 && (
              <motion.circle 
                r="10" 
                fill="#ffb800"
                initial={{ cx: 200, cy: -50 }}
                animate={{ 
                  cx: activeStep === 5 ? 300 : activeStep === 6 ? 500 : 650, 
                  cy: activeStep === 5 ? 200 : activeStep === 6 ? 150 : 400 
                }}
                transition={{ duration: 4, ease: "linear" }}
              />
            )}

            {/* Dubai Local Map Markers (Steps 12-13 -> 13-14) */}
            {activeStep >= 13 && activeStep <= 14 && (
              <>
                <path d="M400,200 L600,300 L800,200" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <circle cx="400" cy="200" r="8" fill="#34a853" /> {/* DXB Airport */}
                <circle cx="800" cy="200" r="8" fill="#ea4335" /> {/* Burj Al Arab */}
              </>
            )}

            {/* Moving Car DXB (Steps 12-13 -> 13-14) */}
            {activeStep >= 13 && activeStep <= 14 && (
              <motion.circle 
                r="10" 
                fill="#ffb800"
                initial={{ cx: 400, cy: 200 }}
                animate={{ 
                  cx: activeStep === 13 ? 400 : 800, 
                  cy: activeStep === 13 ? 200 : 200 
                }}
                transition={{ duration: 4, ease: "linear" }}
              />
            )}

            {/* Logistics Industrial Map (Steps 14-17 -> 15-18) */}
            {activeStep >= 15 && activeStep <= 18 && (
              <>
                <path d="M100,500 L400,400 L700,450 L900,150" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle cx="100" cy="500" r="12" fill="#34a853" /> {/* Jebel Ali Port */}
                <circle cx="900" cy="150" r="12" fill="#ea4335" /> {/* Warehouse */}
              </>
            )}

            {/* Moving Freight Truck (Steps 15-17 -> 16-18) */}
            {activeStep >= 16 && activeStep <= 18 && (
              <>
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: activeStep === 16 ? 0.7 : 1 }}
                  transition={{ duration: 4, ease: "linear" }}
                  d="M100,500 L400,400 L700,450 L900,150" 
                  fill="none" 
                  stroke="#ffb800" 
                  strokeWidth="6" 
                  strokeDasharray="12 12"
                />
                <motion.rect 
                  width="24" height="16" fill="#ffb800" rx="4"
                  initial={{ x: 100, y: 500 }}
                  animate={{ 
                    x: activeStep === 16 ? 700 : 900, 
                    y: activeStep === 16 ? 450 : 150 
                  }}
                  transition={{ duration: 4, ease: "linear" }}
                  style={{ transformOrigin: 'center' }}
                />
              </>
            )}

            {/* Train Map (Steps 18-20 -> 19-21) */}
            {activeStep >= 19 && activeStep <= 21 && (
              <>
                <path d="M100,300 L900,300" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <path d="M100,300 L900,300" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="100" cy="300" r="8" fill="#34a853" /> {/* St Pancras */}
                <circle cx="900" cy="300" r="8" fill="#ea4335" /> {/* Gare du Nord */}
              </>
            )}

            {/* Moving Train (Steps 19-20 -> 20-21) */}
            {activeStep >= 20 && activeStep <= 21 && (
              <>
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: activeStep === 20 ? 0.6 : 1 }}
                  transition={{ duration: 4, ease: "linear" }}
                  d="M100,300 L900,300" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="4" 
                />
                <motion.circle 
                  r="10" 
                  fill="#3b82f6"
                  initial={{ cx: 100, cy: 300 }}
                  animate={{ 
                    cx: activeStep === 20 ? 600 : 900, 
                    cy: 300 
                  }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              </>
            )}

            {/* Ferry Map (Steps 21-23 -> 22-24) */}
            {activeStep >= 22 && activeStep <= 24 && (
              <>
                <path d="M200,400 Q500,200 800,400" fill="none" stroke="rgba(0, 188, 212, 0.2)" strokeWidth="8" />
                <path d="M200,400 Q500,200 800,400" fill="none" stroke="rgba(0, 188, 212, 0.4)" strokeWidth="2" strokeDasharray="10 5" />
                <circle cx="200" cy="400" r="8" fill="#34a853" /> {/* Marina */}
                <circle cx="800" cy="400" r="8" fill="#ea4335" /> {/* Island */}
              </>
            )}

            {/* Moving Ferry (Steps 22-23 -> 23-24) */}
            {activeStep >= 23 && activeStep <= 24 && (
              <>
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: activeStep === 23 ? 0.5 : 1 }}
                  transition={{ duration: 4, ease: "linear" }}
                  d="M200,400 Q500,200 800,400" 
                  fill="none" 
                  stroke="#00bcd4" 
                  strokeWidth="4" 
                />
                <motion.circle 
                  r="10" 
                  fill="#00bcd4"
                  initial={{ cx: 200, cy: 400 }}
                  animate={{ 
                    cx: activeStep === 23 ? 500 : 800, 
                    cy: activeStep === 23 ? 300 : 400 
                  }}
                  transition={{ duration: 4, ease: "linear" }}
                />
              </>
            )}
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
