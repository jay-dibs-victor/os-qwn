"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  Box, 
  Plane, 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Bell, 
  Globe, 
  ArrowRight,
  Truck,
  Zap,
  CreditCard,
  Star,
  CheckCircle,
  Activity
} from 'lucide-react';
import LiveNetworkAnimation from './LiveNetworkAnimation';
import './AppShowcase.css';

const states = [
  {
    id: "network",
    title: "Live Coordination",
    description: "Real-time orchestration of global mobility assets across the Queens Intelligence layer.",
    desktopContent: (
      <div className="w-full h-full relative">
        <LiveNetworkAnimation />
        <div className="absolute bottom-8 left-8 glass-dark p-6 rounded-2xl border-white/10 z-20 max-w-xs">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-primary animate-pulse" size={20} />
            <h4 className="text-lg font-bold">Network Status</h4>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] opacity-40 uppercase font-bold">Active Nodes</span>
              <span className="text-sm font-mono text-primary">12,842</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] opacity-40 uppercase font-bold">Latency</span>
              <span className="text-sm font-mono text-green-500">24ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] opacity-40 uppercase font-bold">Fleet Load</span>
              <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '74%' }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    content: (
      <div className="mobile-container">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="mobile-header-spacing relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold">Global Mesh</h4>
            <div className="px-2 py-1 bg-primary/10 rounded text-primary text-[8px] font-black uppercase">Live</div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="mobile-trip-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    {i === 1 ? <Navigation size={14} className="text-primary"/> : i === 2 ? <Plane size={14} className="text-blue-400"/> : <Truck size={14} className="text-green-400"/>}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold">Node #{1000 + i}</p>
                    <p className="text-[8px] opacity-40">Megacity Hub</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-primary">ONLINE</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 border border-primary/20 rounded-2xl bg-primary/5 text-center">
            <p className="text-[10px] font-bold text-primary mb-1">NETWORK COORDINATION</p>
            <p className="text-[8px] opacity-60">Synchronizing 12k+ nodes...</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "login",
    title: "Secure Portal",
    description: "Enterprise-grade authentication for global fleet coordination.",
    desktopContent: (
      <div className="flex-col-center">
        <div className="mobile-logo-circle mb-6 w-20 h-20 text-2xl mx-auto">Q</div>
        <h2 className="text-5xl font-bold font-outfit mb-6">Command Center</h2>
        <p className="text-lg opacity-40 mb-10 max-w-md mx-auto">Authorize your node to access the Queens Intelligence coordination layer.</p>
        <div className="w-full max-w-md spacing-y-4">
          <div className="h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center px-6 text-sm opacity-30">Username</div>
          <div className="h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center px-6 text-sm opacity-30">Password</div>
          <div className="h-14 bg-primary text-black font-bold rounded-2xl flex items-center justify-center text-lg shadow-xl shadow-primary/20">Access Network</div>
        </div>
      </div>
    ),
    content: (
      <div className="mobile-container">
        <div className="mobile-welcome-card">
          <div className="mobile-logo-circle">
            <div className="w-8 h-8 bg-black rounded-lg" />
          </div>
          <h3 className="text-2xl font-bold font-outfit mb-2">Welcome</h3>
          <p className="text-xs opacity-50 mb-10">Enter your credentials</p>
          <div className="mobile-input-field" />
          <div className="mobile-input-field" />
          <div className="mobile-primary-button">Sign In</div>
        </div>
      </div>
    )
  },
  {
    id: "platform",
    title: "The Web Platform Experience",
    description: "A frictionless booking flow designed for scale. From intent to global logistics, entirely on the web.",
    desktopContent: (
      <div className="desktop-grid px-4">
        <div className="col-7">
           <h1 className="text-5xl font-bold mb-6 font-outfit">Frictionless <br/><span className="text-primary">Flow for Scale</span></h1>
           <p className="text-lg opacity-50 mb-10">From intent to global logistics, orchestrate every asset through a single, unified web intelligence layer.</p>
           <div className="desktop-grid" style={{ gap: '16px' }}>
              {[
                { n: 'Smart Booking', i: <Navigation />, d: 'Sub-second intent match' },
                { n: 'Global Logistics', i: <Truck />, d: 'Real-time settlement' },
                { n: 'Node Sync', i: <Activity />, d: '12k+ Active Hubs' }
              ].map(item => (
                <div key={item.n} className="p-6 glass-dark border-white/5 rounded-3xl hover:border-primary/20 transition-all group col-4">
                   <div className="text-primary mb-4 group-hover:scale-110 transition-transform">{item.i}</div>
                   <p className="font-bold mb-1">{item.n}</p>
                   <p className="text-[10px] opacity-40 uppercase tracking-tighter">{item.d}</p>
                </div>
              ))}
           </div>
        </div>
        <div className="col-5 h-64 glass-dark rounded-3xl border-white/5 flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
           <div className="absolute inset-0 bg-[url('/world_map.svg')] bg-contain bg-center bg-no-repeat opacity-30 mix-blend-screen" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60" />
           <div className="z-10 text-center">
             <div className="w-3 h-3 bg-primary rounded-full animate-ping mx-auto mb-2" />
             <span className="text-[10px] font-bold tracking-widest uppercase text-primary">Global Sync Active</span>
           </div>
        </div>
      </div>
    ),
    content: (
      <div className="mobile-container relative overflow-hidden">
        {/* Main Area: Map/Content */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2066&auto=format&fit=crop')] bg-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
        
        {/* Floating Sidebar Content */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute left-4 top-24 bottom-24 w-12 glass-dark border-white/10 rounded-2xl flex flex-col items-center py-6 gap-6 z-20"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary"><Navigation size={16} /></div>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-40"><Box size={16} /></div>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-40"><Plane size={16} /></div>
          <div className="mt-auto w-8 h-8 rounded-full bg-white/5 border border-white/10" />
        </motion.div>

        <div className="mobile-header-spacing relative z-10 pl-20 pr-6">
          <div className="mb-8">
            <p className="text-[10px] opacity-50 uppercase font-bold tracking-widest text-primary mb-1">Scale Node Active</p>
            <h4 className="text-xl font-bold font-outfit">Platform <br/>Intelligence</h4>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 glass rounded-2xl border-white/5">
              <p className="text-[9px] opacity-40 uppercase font-bold mb-2">Active Logistics</p>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold">1,842</span>
                <span className="text-[8px] text-green-500 font-bold">+12%</span>
              </div>
            </div>
            <div className="p-4 glass rounded-2xl border-white/5">
              <p className="text-[9px] opacity-40 uppercase font-bold mb-2">Network Health</p>
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-4 bg-primary/40 rounded-full" />)}
                  <div className="w-1.5 h-4 bg-primary rounded-full animate-pulse" />
                </div>
                <span className="text-[10px] font-mono">99.9%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-20 right-6 z-10">
          <div className="mobile-primary-button h-12 text-xs">Deploy Fleet</div>
        </div>
      </div>
    )
  },
  {
    id: "flight",
    title: "Queens Air",
    description: "Coordinate international flights and inter-city air mobility.",
    desktopContent: (
      <div className="desktop-hero">
        <div className="hero-left">
          <h1 className="desktop-title" style={{ fontSize: '48px' }}>
            READY TO <br /> <span className="text-primary">TAKE OFF?</span>
          </h1>
          <p className="desktop-subtitle" style={{ fontSize: '16px', maxWidth: '400px' }}>
            Turn every movement into opportunity. Explore the world with Queens Intelligence coordination layer.
          </p>
          <div className="flight-search-widget">
            <div className="widget-tabs"><span className="text-primary">One Way</span><span>Round Trip</span><span>Multi-City</span></div>
            <div className="widget-row">
              <div className="widget-field"><span className="field-label">From</span><div className="field-input"><MapPin size={14} className="text-primary" /><span>MAIN - HUB</span></div></div>
              <div className="widget-field"><span className="field-label">To</span><div className="field-input"><MapPin size={14} className="opacity-40" /><span>GLOBAL - London</span></div></div>
            </div>
            <div className="widget-row">
              <div className="widget-field"><span className="field-label">Departure</span><div className="field-input"><Calendar size={14} className="opacity-40" /><span>May 24, 2026</span></div></div>
              <div className="widget-field"><span className="field-label">Passengers</span><div className="field-input"><Users size={14} className="opacity-40" /><span>1 Adult, First Class</span></div></div>
            </div>
            <button className="search-button">Search Flights</button>
          </div>
        </div>
        <div className="hero-right" />
      </div>
    ),
    content: (
      <div className="mobile-container">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2066&auto=format&fit=crop')] bg-cover" />
        <div className="mobile-header-spacing relative z-10">
           <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold">Queens Air</h4>
              <Plane size={20} className="text-primary" />
           </div>
           <div className="mobile-trip-card">
              <div className="flex justify-between items-center">
                 <div><p className="text-2xl font-bold">LOS</p><p className="text-[10px] opacity-50">Lagos</p></div>
                 <Plane size={16} className="text-primary/40" />
                 <div className="text-right"><p className="text-2xl font-bold">GLOBAL</p><p className="text-[10px] opacity-50">London</p></div>
              </div>
           </div>
        </div>
      </div>
    )
  },
  {
    id: "logistics",
    title: "Global Logistics",
    description: "Enterprise supply chain coordination with sub-second latency.",
    desktopContent: (
      <div className="flex-col-center" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
         <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Truck /></div>
            <h2 className="text-4xl font-bold font-outfit">Logistics Node <span className="text-primary">Active</span></h2>
         </div>
         <div className="desktop-grid w-full" style={{ gap: '16px' }}>
            {[
              { l: 'In Transit', v: '842', s: 'green' },
              { l: 'Pending', v: '12', s: 'yellow' },
              { l: 'Delayed', v: '0', s: 'red' },
              { l: 'Completed', v: '4.2k', s: 'blue' }
            ].map(stat => (
              <div key={stat.l} className="p-6 glass-dark border-white/5 rounded-2xl col-3">
                 <p className="text-[10px] opacity-40 uppercase mb-2 font-bold">{stat.l}</p>
                 <p className="text-2xl font-bold">{stat.v}</p>
                 <div className={`w-full h-1 bg-${stat.s}-500/20 rounded-full mt-4`}>
                    <div className={`w-3/4 h-full bg-${stat.s}-500 rounded-full`} />
                 </div>
              </div>
            ))}
         </div>
         <div className="mt-8 p-6 glass-dark border-primary/20 rounded-3xl w-full flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-white/5 rounded-full" />
               <div><p className="text-sm font-bold">Incoming Fleet: MAIN-772</p><p className="text-xs opacity-50">Estimated arrival in 12 mins</p></div>
            </div>
            <button className="px-6 h-10 bg-primary text-black font-bold rounded-xl text-xs">Manage Fleet</button>
         </div>
      </div>
    ),
    content: (
      <div className="mobile-container">
        <div className="mobile-header-spacing relative z-10">
           <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold">New Delivery</h4>
              <Truck size={20} className="text-primary" />
           </div>
           <div className="mobile-trip-card flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"><Box size={18}/></div>
              <div className="flex-1"><p className="text-xs font-bold">Parcel</p><p className="text-[10px] opacity-50">Under 5kg</p></div>
           </div>
           <div className="mobile-trip-card text-center py-8"><Zap size={24} className="text-primary mx-auto mb-2" /><p className="text-sm font-bold">Optimizing Route</p></div>
        </div>
      </div>
    )
  },
  {
    id: "tracking",
    title: "Live Routing",
    description: "Real-time navigation with predictive obstacle avoidance.",
    desktopContent: (
      <div className="w-full h-full relative">
         <div className="absolute top-0 right-0 w-72 glass-dark p-6 rounded-2xl border-white/10 z-20">
           <div className="flex items-center gap-3 mb-6"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/><p className="text-xs font-bold">NODE: LAG-HUB-04</p></div>
           <div className="spacing-y-6">
             <div><p className="text-[10px] opacity-40">PILOT: TUNDE A.</p><div className="flex gap-2 mt-1">{[1,2,3,4,5].map(i => <Star key={i} size={8} className="text-primary fill-primary" />)}</div></div>
             <div><p className="text-[10px] opacity-40">POSITION</p><p className="text-sm font-bold">Central District</p></div>
             <div className="pt-4 border-t border-white/5"><p className="text-xl font-bold text-primary">ARRIVING</p><p className="text-[10px] opacity-40">IN 4 MINUTES</p></div>
           </div>
         </div>
         <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 400">
           <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, repeat: Infinity }} d="M100,300 C200,280 300,100 600,150" fill="none" stroke="#FFB800" strokeWidth="3" strokeDasharray="6 6" />
         </svg>
         <motion.div animate={{ x: [0, 500], y: [0, -150], rotate: [45, 60, 45] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute top-[300px] left-[100px] -translate-x-1/2 -translate-y-1/2">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40"><Navigation size={28} className="text-black rotate-45" /></div>
         </motion.div>
      </div>
    ),
    content: (
      <div className="mobile-container">
        <div className="mobile-header-spacing relative z-10">
          <div className="mobile-live-hud"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/><div className="flex-1"><p className="text-[9px] opacity-50 uppercase font-bold">Tracking</p><p className="text-xs font-bold">Pilot Arriving</p></div></div>
        </div>
      </div>
    )
  },
  {
    id: "payment",
    title: "Secured Settlement",
    description: "Instant cross-border payments powered by Queens Core OS.",
    desktopContent: (
      <div className="flex-col-center mx-auto max-w-md">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-8 mx-auto"><CreditCard size={40} /></div>
        <h2 className="text-3xl font-bold mb-4 font-outfit">Payment Secured</h2>
        <p className="text-base opacity-50 mb-10">Transaction authorized via Queens Ledger. Sub-second settlement complete.</p>
        <div className="w-full desktop-grid" style={{ gap: '16px' }}>
           <div className="p-6 glass-dark rounded-2xl col-6">
              <p className="text-[10px] opacity-40 uppercase mb-1 font-bold">TOTAL FARE</p>
              <p className="text-xl font-bold">$1,420.00</p>
           </div>
           <div className="p-6 glass-dark rounded-2xl col-6">
              <p className="text-[10px] opacity-40 uppercase mb-1 font-bold">METHOD</p>
              <p className="text-xl font-bold text-primary">Q-WALLET</p>
           </div>
        </div>
      </div>
    ),
    content: (
      <div className="mobile-container items-center justify-center text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-6"><CreditCard size={32}/></div>
        <p className="text-lg font-bold mb-2">Trip Secured</p>
        <p className="text-xs opacity-50">Receipt sent to email</p>
        <div className="mt-12 w-full mobile-primary-button bg-green-500 text-white">View Receipt</div>
      </div>
    )
  },
  {
    id: "rating",
    title: "Pilot Feedback",
    description: "Maintain a 5-star ecosystem with real-time feedback loops.",
    desktopContent: (
      <div className="flex-col-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-orange-500 p-1 mb-6 mx-auto">
           <div className="w-full h-full bg-black rounded-full flex items-center justify-center font-bold text-2xl text-primary">TA</div>
        </div>
        <h3 className="text-2xl font-bold mb-2">How was your trip?</h3>
        <p className="text-sm opacity-50 mb-8">Your feedback helps improve the Global Metropolis Network.</p>
        <div className="flex gap-4 mb-10 justify-center">
           {[1,2,3,4,5].map(i => <Star key={i} size={32} className="text-primary fill-primary" />)}
        </div>
        <button className="px-12 h-14 bg-primary text-black font-bold rounded-xl mx-auto">Submit Rating</button>
      </div>
    ),
    content: (
      <div className="mobile-container">
        <div className="mobile-header-spacing text-center flex flex-col items-center">
           <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6"><Star size={32} /></div>
           <h4 className="text-lg font-bold mb-4">Rate your Pilot</h4>
           <div className="flex gap-2 mb-10">
              {[1,2,3,4,5].map(i => <Star key={i} size={24} className="text-primary fill-primary" />)}
           </div>
           <div className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl mb-6" />
           <div className="mobile-primary-button">Done</div>
        </div>
      </div>
    )
  }
];

export default function AppShowcase() {
  const [activeState, setActiveState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveState((prev) => (prev + 1) % states.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container-custom">
        <div className="app-showcase-grid">
          {/* ── Left: Desktop Mockup ── */}
          <div className="desktop-mockup">
            <div className="browser-header">
              <div className="browser-dots">
                <div className="dot dot-red" />
                <div className="dot dot-yellow" />
                <div className="dot dot-green" />
              </div>
              <div className="browser-address">
                <Globe size={10} />
                <span>https://queens.os/control-center</span>
              </div>
            </div>
            <div className="browser-body">
              <div className="desktop-map-container">
                {/* Detailed SVG Map for high-fidelity look */}
                <svg className="map-svg-overlay" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
                  <path d="M150,200 Q200,150 400,200 T700,250 M100,300 L200,280 L300,320 L400,290 L500,350 L600,310 L700,380 L800,340 L900,400" fill="none" stroke="rgba(255,184,0,0.2)" strokeWidth="1" />
                  <path d="M50,100 Q150,50 300,100 T600,150 T900,100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  
                  {/* Flight Paths */}
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 5, repeat: Infinity }}
                    d="M150,200 Q400,100 700,250" 
                    fill="none" 
                    stroke="#ffb800" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                  />
                </svg>
                
                <div className="map-pulse" style={{ top: '40%', left: '15%' }} />
                <div className="map-pulse" style={{ top: '50%', left: '70%' }} />
              </div>

              <div className="desktop-nav">
                <div className="desktop-logo">
                  <div className="logo-icon">Q</div>
                  <span>Queens OS</span>
                </div>
                <div className="desktop-menu">
                  <span className="menu-item active">Dashboard</span>
                  <span className="menu-item">Fleet</span>
                  <span className="menu-item">Air</span>
                  <span className="menu-item">Network</span>
                </div>
                <div className="flex items-center gap-4">
                  <Bell size={14} className="opacity-40" />
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeState}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.5 }}
                  className="h-full relative z-10"
                >
                  {states[activeState].desktopContent}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Middle: Mobile Mockup ── */}
          <div className="mobile-mockup-wrapper">
            <div className="phone-frame">
              <div className="notch" />
              <div className="phone-screen">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeState}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="h-full w-full"
                  >
                    {states[activeState].content}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Right: Info & Stepper ── */}
          <div className="showcase-info">
            <div>
              <div className="flow-step">Flow 0{activeState + 1}</div>
              <h3 className="flow-title font-outfit">{states[activeState].title}</h3>
              <p className="flow-desc">{states[activeState].description}</p>
            </div>
            <div className="stepper-container">
              {states.map((state, idx) => (
                <button 
                  key={state.id} 
                  onClick={() => setActiveState(idx)}
                  className={`step-button ${idx === activeState ? 'active' : ''}`}
                >
                  <div className="step-indicator-wrapper">
                    <div className="step-indicator" />
                    {idx === activeState && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ duration: 7, ease: "linear" }}
                        className="step-progress-fill"
                      />
                    )}
                  </div>
                  <span className="step-label">{state.id.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
