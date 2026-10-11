"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, MessageSquare, Phone, Truck, Receipt, Train, Ship, Star
} from 'lucide-react';

interface OverlayHUDProps {
  activeStep: number;
}

export default function OverlayHUD({ activeStep }: OverlayHUDProps) {
  return (
    <>
      {/* Scanning Overlay (Step 4 / index 3 -> Step 5 / index 4) */}
      <AnimatePresence>
        {activeStep === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="wps-scan-overlay">
            <div className="wps-radar">
              <div className="w-4 h-4 bg-primary rounded-full" />
              <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white/20 rounded-full" />
              <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-white/20 rounded-full" />
            </div>
            <h2 className="text-3xl font-bold font-outfit mb-2">Locating nearby captains...</h2>
            <p className="text-primary font-mono text-sm">Radius expanded to 5km</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driver HUD Overlay (Steps 5-7 -> 6-8, 13 -> 14) */}
      <AnimatePresence>
        {(activeStep >= 5 && activeStep <= 7) || activeStep === 13 ? (
          <>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="wps-live-badge">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" /> LIVE TRACKING
            </motion.div>
            <motion.div initial={{ y: 100, opacity: 0, x: '-50%' }} animate={{ y: 0, opacity: 1, x: '-50%' }} exit={{ y: 100, opacity: 0, x: '-50%' }} className="wps-driver-hud">
              <div className="flex items-center gap-4 flex-1">
                <div className="wps-driver-avatar flex items-center justify-center">
                   <ShieldCheck size={32} className="text-black/50" />
                </div>
                <div className="wps-driver-info">
                  <h4>{activeStep === 13 ? 'Hassan M.' : 'Samuel O.'}</h4>
                  <p>{activeStep === 13 ? 'Lexus ES • DXB-991 • ★ 5.0' : 'Toyota Corolla • KJA-552-XZ • ★ 4.9'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><MessageSquare size={20} /></button>
                <button className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/30 transition-colors"><Phone size={20} /></button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      {/* Logistics Fleet Overlay (Steps 15-16 -> 16-17) */}
      <AnimatePresence>
        {(activeStep >= 16 && activeStep <= 17) && (
          <>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="wps-live-badge" style={{ background: 'rgba(255, 184, 0, 0.2)', color: '#ffb800' }}>
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" /> FLEET TELEMETRY
            </motion.div>
            <motion.div initial={{ y: 100, opacity: 0, x: '-50%' }} animate={{ y: 0, opacity: 1, x: '-50%' }} exit={{ y: 100, opacity: 0, x: '-50%' }} className="wps-driver-hud">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                   <Truck size={24} className="text-primary" />
                </div>
                <div className="wps-driver-info">
                  <h4>Logistics Corp</h4>
                  <p>Volvo FH16 • QOS-8821 • 14 Tons</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"><Receipt size={20} /></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Train Fleet Overlay (Steps 19-20 -> 20-21) */}
      <AnimatePresence>
        {(activeStep >= 20 && activeStep <= 21) && (
          <>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="wps-live-badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" /> RAIL TELEMETRY
            </motion.div>
            <motion.div initial={{ y: 100, opacity: 0, x: '-50%' }} animate={{ y: 0, opacity: 1, x: '-50%' }} exit={{ y: 100, opacity: 0, x: '-50%' }} className="wps-driver-hud">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                   <Train size={24} className="text-blue-400" />
                </div>
                <div className="wps-driver-info">
                  <h4>Eurostar Network</h4>
                  <p>TGV POS • Carriage 4 • Seat 12A</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Marine Fleet Overlay (Steps 22-23 -> 23-24) */}
      <AnimatePresence>
        {(activeStep >= 23 && activeStep <= 24) && (
          <>
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="wps-live-badge" style={{ background: 'rgba(0, 188, 212, 0.2)', color: '#00bcd4' }}>
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" /> MARINE TRACKING
            </motion.div>
            <motion.div initial={{ y: 100, opacity: 0, x: '-50%' }} animate={{ y: 0, opacity: 1, x: '-50%' }} exit={{ y: 100, opacity: 0, x: '-50%' }} className="wps-driver-hud">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                   <Ship size={24} className="text-cyan-400" />
                </div>
                <div className="wps-driver-info">
                  <h4>Marina Water Taxi</h4>
                  <p>Private Ferry • Captain Ali</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hotel Reservation Card (Step 14 -> 15) */}
      <AnimatePresence>
        {activeStep === 14 && (
          <motion.div 
            className="wps-hotel-card"
            initial={{ opacity: 0, scale: 0.9, y: 50, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0 }}
            style={{ bottom: '100px', left: '50%' }}
          >
            <div className="wps-hotel-img" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=400")' }} />
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-xl">Burj Al Arab</h4>
              <div className="flex items-center text-primary text-sm font-bold"><Star size={14} className="fill-current mr-1" /> 5.0</div>
            </div>
            <p className="text-white/50 text-sm mb-4">Royal Suite • 2 Nights</p>
            <div className="flex gap-2">
              <span className="bg-white/10 text-xs px-2 py-1 rounded">Checked In</span>
              <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded">Digital Key Ready</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
