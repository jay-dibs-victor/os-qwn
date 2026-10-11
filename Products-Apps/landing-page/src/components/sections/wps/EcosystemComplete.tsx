"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Check } from 'lucide-react';

interface EcosystemCompleteProps {
  activeStep: number;
}

export default function EcosystemComplete({ activeStep }: EcosystemCompleteProps) {
  const isItineraryFlow = activeStep === 25;

  if (!isItineraryFlow) return null;

  return (
    <AnimatePresence>
      {isItineraryFlow && (
        <motion.div className="wps-itinerary-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="wps-itinerary-checklist">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-4">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-3xl font-bold text-white">Ecosystem Complete</h2>
              <p className="text-white/50 mt-2 text-center">Your entire global journey and cargo settlement successfully executed.</p>
            </div>

            <div className="flex flex-col gap-2">
              <motion.div className="wps-itinerary-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <div className="wps-itinerary-icon done"><Check size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-white">Local Ride</div>
                  <div className="text-xs text-white/50">Lekki to MMA • Paid</div>
                </div>
              </motion.div>

              <motion.div className="wps-itinerary-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <div className="wps-itinerary-icon done"><Check size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-white">International Flight</div>
                  <div className="text-xs text-white/50">LHR to DXB • First Class</div>
                </div>
              </motion.div>

              <motion.div className="wps-itinerary-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <div className="wps-itinerary-icon done"><Check size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-white">B2B Logistics</div>
                  <div className="text-xs text-white/50">Jebel Ali Freight • Delivered</div>
                </div>
              </motion.div>

              <motion.div className="wps-itinerary-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <div className="wps-itinerary-icon done"><Check size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-white">Intercity Rail</div>
                  <div className="text-xs text-white/50">London to Paris • TGV POS</div>
                </div>
              </motion.div>

              <motion.div className="wps-itinerary-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <div className="wps-itinerary-icon done"><Check size={20} /></div>
                <div className="flex-1">
                  <div className="font-bold text-white">Marine Transit</div>
                  <div className="text-xs text-white/50">Marina Water Taxi • Docked</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
