"use client";

import { motion } from "framer-motion";
import { 
  Smartphone, 
  Car, 
  Crown, 
  Package, 
  Bus, 
  Code2, 
  Building2, 
  Settings, 
  CreditCard 
} from "lucide-react";

const nodes = [
  { id: "rider", label: "Rider App", x: "15%", y: "20%", icon: <Smartphone size={24} /> },
  { id: "driver", label: "Driver App", x: "85%", y: "20%", icon: <Car size={24} /> },
  { id: "core", label: "Queens Core OS", x: "50%", y: "50%", main: true, icon: <Crown size={32} /> },
  { id: "logistics", label: "Logistics Hub", x: "15%", y: "50%", icon: <Package size={24} /> },
  { id: "travel", label: "Intercity Travel", x: "85%", y: "50%", icon: <Bus size={24} /> },
  { id: "api", label: "3rd Party APIs", x: "15%", y: "80%", icon: <Code2 size={24} /> },
  { id: "infra", label: "Smart Terminals", x: "85%", y: "80%", icon: <Building2 size={24} /> },
  { id: "dispatch", label: "Dispatch Engine", x: "50%", y: "15%", icon: <Settings size={24} /> },
  { id: "payments", label: "Payment Layer", x: "50%", y: "85%", icon: <CreditCard size={24} /> },
];

export default function ProductEcosystem() {
  return (
    <section className="py-24 bg-background relative overflow-hidden flex flex-col items-center">
      <div className="container-custom text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div style={{ marginTop: "40px" }} className="text-primary font-bold text-sm uppercase tracking-widest mb-4">The Network Architecture</div>
          <h2 className="fluid-h2 font-bold font-outfit mb-6">Interactive Product Ecosystem</h2>
          <p className="fluid-body text-foreground-muted text-center mx-auto max-w-3xl leading-relaxed">
            A unified infrastructure where every transport mode—from intra-city rides to cross-border 
            logistics—is coordinated in real-time by a central intelligence layer.
          </p>
        </motion.div>
      </div>

      <div className="container-custom w-full flex justify-center">
        <div className="network-container relative h-[600px] lg:h-[750px] w-full max-w-5xl border border-white/5 rounded-[40px] glass-dark overflow-hidden flex items-center justify-center shadow-2xl">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" stroke="white" strokeWidth="1">
            {nodes.filter(n => !n.main).map(node => (
              <line key={node.id} x1="50%" y1="50%" x2={node.x} y2={node.y} />
            ))}
          </svg>

          {nodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${node.main ? 'z-20' : 'z-10'
                }`}
              style={{ top: node.y, left: node.x }}
            >
              <div className={`
                flex flex-col items-center gap-3 p-5 rounded-2xl glass border-white/10
                ${node.main ? 'bg-primary/10 border-primary/40 min-w-[240px] py-8' : 'min-w-[180px]'}
              `}>
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                  ${node.main ? 'bg-primary text-background' : 'bg-white/5 text-primary'}
                `}>
                  {node.icon}
                </div>
                <div className="text-center">
                  <span className={`block text-base font-bold tracking-tight ${node.main ? 'text-primary' : 'text-white'}`}>
                    {node.label}
                  </span>
                  {!node.main && (
                    <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-widest opacity-60">
                      Sync Active
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Animated pulse at center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-0 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
