"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, ArrowRight, Plane } from 'lucide-react';

interface FlightFlowProps {
  activeStep: number;
  formatPrice: (amount: number) => string;
}

export default function FlightFlow({ activeStep, formatPrice }: FlightFlowProps) {
  const isFlightFlow = activeStep >= 9 && activeStep <= 12;

  return (
    <AnimatePresence>
      {isFlightFlow && (
        <motion.div className="absolute inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-[url('/world_map.svg')] bg-cover bg-center opacity-[0.1] filter grayscale" />
          
          {/* Flight Search Home (Step 8 -> 9) */}
          {activeStep === 9 && (
            <>
              <div className="wps-flight-hero">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <h1 className="text-white">READY TO <br/><span>TAKE OFF?</span></h1>
                  <p className="text-white/60 text-lg">Explore the world with ease.</p>
                  <button className="px-8 py-3 bg-primary text-black font-bold rounded-full mt-6 shadow-xl">Fly For Free</button>
                </motion.div>
              </div>
              
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="wps-flight-search-widget absolute bottom-12">
                <div className="wps-flight-tabs">
                  <div className="wps-flight-tab">My Booking</div>
                  <div className="wps-flight-tab active">Flight Status</div>
                  <div className="wps-flight-tab">Charter Flights</div>
                </div>
                <div className="flex gap-4 mb-4">
                  <select className="bg-transparent border-0 font-bold outline-none text-white"><option>One-way</option></select>
                  <select className="bg-transparent border-0 font-bold outline-none text-white"><option>1 Adult</option></select>
                  <select className="bg-transparent border-0 font-bold outline-none text-white"><option>Economy</option></select>
                </div>
                <div className="wps-flight-inputs">
                  <div className="wps-flight-input">
                     <MapPin size={16} className="text-primary"/>
                     <div>
                       <div className="wps-flight-input-label">Where From?</div>
                       <div className="text-white">LHR - London Heathrow</div>
                     </div>
                  </div>
                  <div className="wps-flight-input">
                     <MapPin size={16} className="text-primary"/>
                     <div>
                       <div className="wps-flight-input-label">Where To?</div>
                       <div className="text-white">DXB - Dubai Int.</div>
                     </div>
                  </div>
                  <div className="wps-flight-input">
                     <Calendar size={16} className="text-primary"/>
                     <div>
                       <div className="wps-flight-input-label">Departure Date</div>
                       <div className="text-white">24 Oct 2026</div>
                     </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button className="bg-primary text-black px-8 py-3 rounded-full font-bold flex items-center gap-2">
                    Search Flights <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            </>
          )}

          {/* Flight Results (Step 9 -> 10) */}
          {activeStep === 10 && (
            <div className="w-full max-w-4xl z-10 px-6">
              <motion.h3 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-white font-bold text-2xl mb-8">
                Select Flight: LHR to DXB
              </motion.h3>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1a1a1a] rounded-2xl shadow-xl p-6 mb-4 flex items-center justify-between border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center font-bold text-xl text-white">EK</div>
                  <div>
                    <div className="font-bold text-white">Emirates</div>
                    <div className="text-xs text-white/50">EK 202</div>
                  </div>
                </div>
                <div className="flex-1 px-12">
                  <div className="wps-flight-timeline">
                    <div className="text-center"><div className="font-bold text-xl text-white">09:00</div><div className="text-xs text-white/50">LHR</div></div>
                    <div className="wps-flight-line text-xs text-center text-white/40 pt-6">7h 15m</div>
                    <div className="text-center"><div className="font-bold text-xl text-white">19:15</div><div className="text-xs text-white/50">DXB</div></div>
                  </div>
                </div>
                <div className="text-right pl-6 border-l border-white/10">
                  <div className="text-2xl font-bold font-outfit text-white mb-2">{formatPrice(300)}</div>
                  <button className="bg-primary text-black px-6 py-2 rounded-full font-bold text-sm">Select</button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 rounded-2xl p-6 flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center font-bold text-xl text-white">BA</div>
                  <div>
                    <div className="font-bold text-white">British Airways</div>
                    <div className="text-xs text-white/50">BA 105</div>
                  </div>
                </div>
                <div className="flex-1 px-12 opacity-60">
                  <div className="wps-flight-timeline">
                    <div className="text-center"><div className="font-bold text-xl text-white">12:30</div><div className="text-xs text-white/50">LHR</div></div>
                    <div className="wps-flight-line text-xs text-center text-white/40 pt-6">7h 00m</div>
                    <div className="text-center"><div className="font-bold text-xl text-white">22:30</div><div className="text-xs text-white/50">DXB</div></div>
                  </div>
                </div>
                <div className="text-right pl-6 border-l border-white/10">
                  <div className="text-2xl font-bold font-outfit text-white/60 mb-2">{formatPrice(325)}</div>
                  <button className="border border-primary text-primary px-6 py-2 rounded-full font-bold text-sm">Select</button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Flight Checkout (Step 10 -> 11) */}
          {activeStep === 11 && (
            <div className="w-full max-w-2xl z-10 px-6">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full wps-flight-ticket shadow-2xl">
                <div className="wps-ticket-cutout left" />
                <div className="wps-ticket-cutout right" />
                <div className="wps-ticket-header">
                  <div>
                    <div className="text-xs font-bold uppercase wps-header-subtitle mb-1">Boarding Pass</div>
                    <div className="text-xl font-bold text-black">First Class</div>
                  </div>
                  <Plane size={32} className="text-black/20" />
                </div>
                <div className="wps-ticket-body">
                  <div className="flex justify-between items-center mb-8">
                  </div>
                  <button className="bg-primary text-black px-8 py-3 rounded-xl font-bold">Pay with Wallet</button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Flight En Route (Step 11 -> 12) */}
          {activeStep === 12 && (
            <div className="w-full h-full relative">
              {/* Map Dots for LHR and DXB */}
              <div className="absolute w-3 h-3 bg-primary rounded-full" style={{ top: '35%', left: '48%' }} /> {/* LHR approximate */}
              <div className="absolute w-3 h-3 bg-primary rounded-full" style={{ top: '50%', left: '60%' }} /> {/* DXB approximate */}
              
              {/* Dotted Flight Path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 48% 35% Q 54% 30% 60% 50%" fill="none" stroke="rgba(255, 184, 0, 0.5)" strokeWidth="2" strokeDasharray="5 5" />
              </svg>

              {/* Animated Plane & Tooltip */}
              <motion.div 
                className="wps-flight-tooltip"
                initial={{ top: '35%', left: '48%' }}
                animate={{ top: '50%', left: '60%' }}
                transition={{ duration: 5, ease: "linear" }}
              >
                <Plane size={16} className="text-primary" />
                <div>
                  <div className="text-xs font-bold text-white/50">LHR ✈ DXB</div>
                  <div className="text-sm font-bold">Arriving in 1 hr</div>
                </div>
              </motion.div>
            </div>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  );
}
