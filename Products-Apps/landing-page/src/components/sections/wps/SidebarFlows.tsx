"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Calendar, CreditCard, Wallet, Building, 
  CornerUpRight, CheckCircle, Star, Car, Hotel, 
  Truck, Package, FileSignature, Train, Ship, Ticket, Anchor, Waves
} from 'lucide-react';
import { steps } from './constants';

interface SidebarFlowsProps {
  activeStep: number;
  formatPrice: (amount: number) => string;
}

export default function SidebarFlows({ activeStep, formatPrice }: SidebarFlowsProps) {
  const getSidebarSteps = () => {
    if (activeStep > 0 && activeStep < 9) return steps.slice(1, 9);
    if (activeStep >= 13 && activeStep <= 14) return steps.slice(13, 15);
    if (activeStep >= 15 && activeStep <= 18) return steps.slice(15, 19);
    if (activeStep >= 19 && activeStep <= 21) return steps.slice(19, 22);
    if (activeStep >= 22 && activeStep <= 24) return steps.slice(22, 25);
    return [];
  };
  const sidebarSteps = getSidebarSteps();
  const showSidebar = (activeStep > 0 && activeStep < 9) || (activeStep >= 13 && activeStep < 25);

  if (!showSidebar) return null;

  return (
    <div className="wps-sidebar">
      <div className="wps-sidebar-header">
        <div className="wps-sidebar-title">
          <div className="w-8 h-8 bg-primary text-black rounded-lg flex items-center justify-center text-sm">Q</div>
          Queens
        </div>
        <div className="wps-steps-indicator">
          {sidebarSteps.map((s) => {
            const stepIndexInArray = steps.findIndex(x => x.id === s.id);
            return <div key={s.id} className={`wps-step-dot ${activeStep >= stepIndexInArray ? 'active' : ''}`} />;
          })}
        </div>
      </div>

      <div className="wps-sidebar-content">
        <AnimatePresence mode="wait">
          {/* Step 1: Intent */}
          {activeStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6">Select how you&apos;d like to travel.</h3>
              <div className="wps-card active flex items-start gap-4 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><Zap size={20}/></div>
                <div>
                  <h4 className="font-bold text-white mb-1">Quick Ride</h4>
                  <p className="text-sm text-white/50">Instant pickup. Go now.</p>
                </div>
              </div>
              <div className="wps-card flex items-start gap-4 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 shrink-0"><Calendar size={20}/></div>
                <div>
                  <h4 className="font-bold text-white mb-1">Planned Trip</h4>
                  <p className="text-sm text-white/50">Schedule for later.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Routing */}
          {activeStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6">Where to?</h3>
              <div className="wps-input-group">
                <div className="wps-route-dot pickup" />
                <div className="flex-1">
                  <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Pickup</div>
                  <div className="text-sm font-semibold">14 Admiralty Way, Lekki</div>
                </div>
              </div>
              <div className="wps-input-group">
                <div className="wps-route-dot dest" />
                <div className="flex-1">
                  <div className="text-[10px] text-white/40 font-bold uppercase mb-1">Destination</div>
                  <div className="text-sm font-semibold">Murtala Muhammed Airport</div>
                </div>
              </div>
              
              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex justify-between text-white/50 text-sm mb-2">
                  <span>Distance: 32.4 km</span>
                  <span>Est. Time: 45 mins</span>
                </div>
                <div className="wps-fare-display">{formatPrice(8.5)}</div>
                <button className="wps-btn-primary">Continue to Payment →</button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {activeStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6">Payment Method</h3>
              <div className="wps-card mb-8">
                <div className="text-xs text-white/50 font-bold uppercase mb-2">Total Amount</div>
                <div className="text-3xl font-bold font-outfit text-white">{formatPrice(8.5)}</div>
              </div>
              
              <div className="wps-payment-option active">
                <div className="flex items-center gap-3">
                  <Wallet size={18} className="text-primary"/>
                  <span className="font-bold">In-App Wallet</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              </div>
              <div className="wps-payment-option">
                <div className="flex items-center gap-3 text-white/50">
                  <CreditCard size={18} />
                  <span className="font-bold">Card Payment</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-white/20" />
              </div>
              <div className="wps-payment-option">
                <div className="flex items-center gap-3 text-white/50">
                  <Building size={18} />
                  <span className="font-bold">Bank Transfer</span>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-white/20" />
              </div>

              <button className="wps-btn-primary mt-8">Confirm Booking</button>
            </motion.div>
          )}

          {/* Step 4: Dispatch */}
          {activeStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-primary">Coordinating Node...</h3>
              <div className="wps-card border-primary/20 bg-primary/5">
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                  Queens OS is currently broadcasting your intent to optimal nodes within the active mesh.
                </p>
                <div className="flex justify-between text-xs text-primary font-mono">
                  <span>Elapsed: 00:12</span>
                  <span className="animate-pulse">Searching</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Live Tracking */}
          {activeStep === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-green-400">Driver En Route</h3>
              <div className="wps-card border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-green-400"><CornerUpRight size={16} /></div>
                  <span className="text-sm font-bold">Arriving in 4 mins</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-400"
                    initial={{ width: "0%" }}
                    animate={{ width: "70%" }}
                    transition={{ duration: 5 }}
                  />
                </div>
              </div>
              
              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="text-xs text-white/50 font-bold uppercase mb-4">Security PIN</div>
                <div className="flex gap-2">
                  {[5, 2, 9, 4].map((num, idx) => (
                    <div key={idx} className="flex-1 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-xl font-bold text-primary">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 6: Navigating */}
          {activeStep === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-primary">Trip in Progress</h3>
              <div className="wps-turn-instruction">
                <div className="wps-turn-icon"><CornerUpRight size={24} /></div>
                <div>
                  <div className="text-[10px] text-white/50 uppercase font-bold tracking-wider mb-1">In 400m</div>
                  <div className="text-sm font-bold">Turn right onto Ozumba Mbadiwe Ave</div>
                </div>
              </div>
              <div className="wps-card">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-white/50">Est. Arrival</span>
                  <span className="font-bold text-white">14:42 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Distance Left</span>
                  <span className="font-bold text-white">18.2 km</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 7: Arriving */}
          {activeStep === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-green-400">Arriving Soon</h3>
              <div className="wps-card border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-green-400 animate-bounce"><CheckCircle size={16} /></div>
                  <span className="text-sm font-bold">Arriving in 1 min</span>
                </div>
                <div className="text-xs text-white/50 mt-2">Your destination is on the right.</div>
              </div>
            </motion.div>
          )}

          {/* Step 8: Completed */}
          {activeStep === 8 && (
            <motion.div key="step8" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                  <CheckCircle size={32} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-center text-white">Trip Completed</h3>
              <p className="text-sm text-white/50 text-center mb-8">Hope you had a great ride.</p>
              
              <div className="wps-card text-center py-6">
                <div className="text-xs text-white/50 uppercase font-bold mb-2">Final Fare</div>
                <div className="text-4xl font-bold font-outfit text-white mb-4">{formatPrice(8.5)}</div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold">
                  <CheckCircle size={12} /> Paid via Wallet
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="text-sm font-bold mb-2">Rate Samuel O.</div>
                <div className="wps-rating-stars justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={24} className={star <= 5 ? 'filled' : ''} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 13: Airport Pickup */}
          {activeStep === 13 && (
            <motion.div key="step12" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-green-400">Driver Waiting</h3>
              <div className="wps-card border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-3 mb-4">
                  <Car size={16} className="text-green-400" />
                  <span className="text-sm font-bold">DXB Terminal 3 Arrivals</span>
                </div>
                <div className="text-xs text-white/50 mt-2">Your ground transfer is ready.</div>
              </div>
            </motion.div>
          )}

          {/* Step 14: Destination Reservation */}
          {activeStep === 14 && (
            <motion.div key="step13" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-primary">Destination Reached</h3>
              <div className="wps-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Hotel size={16} className="text-primary" />
                    <span className="font-bold text-sm">Burj Al Arab</span>
                  </div>
                  <span className="badge bg-primary/20 text-primary text-xs px-2 py-1 rounded">Confirmed</span>
                </div>
                <div className="text-xs text-white/50 mb-2">Check-in ready for your suite lounge reservation.</div>
              </div>
            </motion.div>
          )}

          {/* Step 15: Cargo Booking */}
          {activeStep === 15 && (
            <motion.div key="step15" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6">Book Freight Delivery</h3>
              <div className="wps-card active flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><Truck size={20}/></div>
                <div>
                  <h4 className="font-bold text-white mb-1">Heavy-Duty Truck</h4>
                  <p className="text-sm text-white/50">10-20 Tons Capacity</p>
                </div>
              </div>
              <div className="wps-card flex items-start gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 shrink-0"><Package size={20}/></div>
                <div>
                  <h4 className="font-bold text-white mb-1">Standard Cargo</h4>
                  <p className="text-sm text-white/50">Up to 2 Tons</p>
                </div>
              </div>
              <div className="wps-fare-display">{formatPrice(1200)}</div>
              <button className="wps-btn-primary mt-6">Confirm Dispatch</button>
            </motion.div>
          )}

          {/* Step 16: Freight in Transit */}
          {activeStep === 16 && (
            <motion.div key="step16" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-primary">Freight in Transit</h3>
              <div className="wps-card border-primary/20 bg-primary/5 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-primary">ID: QOS-8821</span>
                  <span className="badge bg-white/10 text-xs px-2 py-1 rounded">On Schedule</span>
                </div>
                <div className="text-xs text-white/50">Jebel Ali Port → Al Quoz Warehouse</div>
              </div>
              <div className="wps-card">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-white/50">Est. Arrival</span>
                  <span className="font-bold text-white">16:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Cargo Temp.</span>
                  <span className="font-bold text-green-400">-18°C (Monitored)</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 17: Warehouse Offloading */}
          {activeStep === 17 && (
            <motion.div key="step17" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-green-400">Warehouse Arrival</h3>
              <div className="wps-card mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package size={16} className="text-green-400" />
                  <span className="text-sm font-bold">Offloading Cargo...</span>
                </div>
                <div className="wps-progress-track">
                  <motion.div 
                    className="wps-progress-fill bg-green-400"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5 }}
                  />
                </div>
              </div>
              <div className="text-xs text-white/50">Dock 4 authorized. Digital manifest verified against smart contract.</div>
            </motion.div>
          )}

          {/* Step 18: Cargo Receipt */}
          {activeStep === 18 && (
            <motion.div key="step18" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-white">Proof of Delivery</h3>
              <div className="wps-card">
                <div className="wps-signature-box">
                  <svg viewBox="0 0 200 50" width="100%" height="100%">
                    <path className="wps-signature-path" d="M20,30 Q40,10 60,30 T100,20 T140,40 T180,20" fill="none" stroke="#ffb800" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-4 text-xs text-white/50">
                  <FileSignature size={14} /> Signed by Warehouse Manager
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-4">
                  <span className="text-sm text-white/50">Settlement</span>
                  <span className="font-bold text-lg text-green-400">{formatPrice(1200)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 19: Train Booking */}
          {activeStep === 19 && (
            <motion.div key="step19" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-white">Intercity Rail Network</h3>
              <div className="wps-card active flex items-start gap-4 mb-4 border-blue-500/30">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0"><Train size={20}/></div>
                <div>
                  <h4 className="font-bold text-white mb-1">High-Speed Express</h4>
                  <p className="text-sm text-white/50">320 km/h • Direct Route</p>
                </div>
              </div>
              <div className="wps-card mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-white/50">From</span>
                  <span className="font-bold">London St Pancras</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/50">To</span>
                  <span className="font-bold">Paris Gare du Nord</span>
                </div>
              </div>
              <div className="wps-fare-display">{formatPrice(120)}</div>
              <button className="wps-btn-primary mt-6 bg-blue-500 text-white hover:bg-blue-600">Purchase Ticket</button>
            </motion.div>
          )}

          {/* Step 20: Train Transit */}
          {activeStep === 20 && (
            <motion.div key="step20" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-blue-400">High-Speed Transit</h3>
              <div className="wps-card border-blue-500/20 bg-blue-500/5 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-blue-400"><CornerUpRight size={16} /></div>
                  <span className="text-sm font-bold">Arriving in 1h 15m</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-400"
                    initial={{ width: "0%" }}
                    animate={{ width: "60%" }}
                    transition={{ duration: 5 }}
                  />
                </div>
              </div>
              <div className="text-xs text-white/50">Current Speed: 315 km/h. Channel Tunnel clearance confirmed.</div>
            </motion.div>
          )}

          {/* Step 21: Train Arrival */}
          {activeStep === 21 && (
            <motion.div key="step21" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-white">Platform Arrival</h3>
              <div className="wps-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Ticket size={16} className="text-blue-400" />
                    <span className="font-bold text-sm">Paris Gare du Nord</span>
                  </div>
                  <span className="badge bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Arrived</span>
                </div>
                <div className="text-xs text-white/50 mb-2">Platform 4. Smart gate pass generated.</div>
              </div>
            </motion.div>
          )}

          {/* Step 22: Ferry Booking */}
          {activeStep === 22 && (
            <motion.div key="step22" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-white">Marine Network</h3>
              <div className="wps-card active flex items-start gap-4 mb-4 border-cyan-500/30">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0"><Ship size={20}/></div>
                <div>
                  <h4 className="font-bold text-white mb-1">Island Water Taxi</h4>
                  <p className="text-sm text-white/50">Private Charter • 4 Guests</p>
                </div>
              </div>
              <div className="wps-card mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-white/50">Departure</span>
                  <span className="font-bold">Dubai Marina</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/50">Arrival</span>
                  <span className="font-bold">Bluewaters Island</span>
                </div>
              </div>
              <div className="wps-fare-display">{formatPrice(45)}</div>
              <button className="wps-btn-primary mt-6 bg-cyan-500 text-black hover:bg-cyan-600">Reserve Vessel</button>
            </motion.div>
          )}

          {/* Step 23: Ferry Transit */}
          {activeStep === 23 && (
            <motion.div key="step23" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-cyan-400">Marine Transit</h3>
              <div className="wps-card border-cyan-500/20 bg-cyan-500/5 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <Waves size={16} className="text-cyan-400" />
                  <span className="text-sm font-bold">Docking in 12 mins</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-400"
                    initial={{ width: "0%" }}
                    animate={{ width: "50%" }}
                    transition={{ duration: 5 }}
                  />
                </div>
              </div>
              <div className="text-xs text-white/50">Smooth sailing. Clear weather reported by marine nodes.</div>
            </motion.div>
          )}

          {/* Step 24: Ferry Arrival */}
          {activeStep === 24 && (
            <motion.div key="step24" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-bold mb-6 text-white">Marina Docking</h3>
              <div className="wps-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Anchor size={16} className="text-cyan-400" />
                    <span className="font-bold text-sm">Bluewaters Island Pier</span>
                  </div>
                  <span className="badge bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Docked</span>
                </div>
                <div className="text-xs text-white/50 mb-2">Pier 7 Secured. Safe disembarking.</div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
