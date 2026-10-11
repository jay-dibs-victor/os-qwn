"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COUNTRIES = ["Japan", "USA", "UK", "Canada", "Germany", "France", "UAE", "China", "Brazil", "Australia", "Singapore"];
const CITY_AREAS = ["Downtown", "Central District", "Harbor", "Tech Park", "North Ridge", "East Port", "Old Town", "South Station"];

const CARS_DATA = [
  { id: 1, name: "Pilot A.", rating: "4.9", status: "Online", color: "#FFB800" },
  { id: 2, name: "Pilot B.", rating: "4.8", status: "On Trip", color: "#64748b" },
  { id: 3, name: "Pilot C.", rating: "5.0", status: "Online", color: "#FFDA44" },
  { id: 4, name: "Pilot D.", rating: "4.7", status: "Arriving", color: "#1e1e1e" },
];

interface CarData {
  id: number;
  name: string;
  rating: string;
  status: string;
  color: string;
}

interface Point {
  x: number;
  y: number;
}

const ROADS = [
  { id: 'main-artery', d: "M-100,200 C200,200 400,600 600,600 C800,600 1000,200 1300,200" },
  { id: 'west-coast', d: "M-100,600 C150,600 200,100 500,100 C800,100 850,800 1300,800" },
  { id: 'downtown-loop', d: "M500,400 A150,100 0 1,1 500,401" },
  { id: 'highway', d: "M200,-100 C200,300 1000,500 1000,900" },
  { id: 'right-lane-1', d: "M800,-100 C850,200 750,500 800,900" },
  { id: 'right-lane-2', d: "M600,900 C700,500 900,300 1300,100" },
  { id: 'east-bound', d: "M1000,-100 C1100,300 1150,600 1200,900" }
];

const LocationMarker = ({ x, y, color = "#FFB800" }: { x: number, y: number, color?: string }) => (
  <g transform={`translate(${x}, ${y-40})`} filter="url(#glow)">
    <path d="M0,40 L-10,25 A12,12 0 1,1 10,25 Z" fill={color} />
    <circle cx="0" cy="18" r="4" fill="white" />
  </g>
);

const BUILDINGS = [
  { x: 100, y: 100, color: '#1e293b' },
  { x: 250, y: 60, color: '#475569' },
  { x: 400, y: 80, color: '#f8fafc' },
  { x: 550, y: 50, color: '#334155' },
  { x: 700, y: 90, color: '#e2e8f0' },
  { x: 850, y: 60, color: '#94a3b8' },
  { x: 1000, y: 80, color: '#1e293b' },
  { x: 1150, y: 120, color: '#475569' },
  { x: 50, y: 150, color: '#FFB800' },
  { x: 200, y: 180, color: '#cbd5e1' },
  { x: 350, y: 220, color: '#1e293b' },
  { x: 500, y: 180, color: '#334155' },
  { x: 650, y: 220, color: '#475569' },
  { x: 800, y: 150, color: '#FFB800' },
  { x: 950, y: 210, color: '#1e293b' },
  { x: 1100, y: 280, color: '#cbd5e1' },
  { x: 150, y: 350, color: '#334155' },
  { x: 300, y: 400, color: '#475569' },
  { x: 450, y: 380, color: '#FFB800' },
  { x: 600, y: 420, color: '#1e293b' },
  { x: 750, y: 380, color: '#f8fafc' },
  { x: 900, y: 450, color: '#334155' },
  { x: 1050, y: 400, color: '#475569' },
];

const CityBuilding = ({ x, y, color = '#FFB800' }: { x: number, y: number, color?: string }) => {
  return (
    <g transform={`translate(${x-45}, ${y-45}) scale(0.3)`}>
      <circle cx="150" cy="150" r="140" fill="rgba(255,184,0,0.05)" />
      <rect x="80" y="120" width="35" height="100" rx="4" fill={color} opacity="0.8" />
      <rect x="130" y="80" width="35" height="140" rx="4" fill={color} />
      <rect x="180" y="100" width="35" height="120" rx="4" fill={color} opacity="0.8" />
      <circle cx="88" cy="135" r="3" fill="#fff" opacity="0.6" />
      <circle cx="102" cy="135" r="3" fill="#fff" opacity="0.6" />
      <path d="M 60 180 L 80 160 L 100 170 L 120 140 L 140 150 L 160 120 L 180 130 L 200 100 L 220 110 L 240 80" stroke="#FFB800" strokeWidth="2" fill="none" opacity="0.6" />
    </g>
  );
};

const getRandomEdgePoint = () => {
  const side = Math.floor(Math.random() * 4);
  const spread = 1500;
  switch (side) {
    case 0: return { x: Math.random() * 1200, y: -spread };
    case 1: return { x: 1200 + spread, y: Math.random() * 800 };
    case 2: return { x: Math.random() * 1200, y: 800 + spread };
    default: return { x: -spread, y: Math.random() * 800 };
  }
};

const PlaneNode = ({ startX, startY, endX, endY, duration, delay, color = "white", id, onComplete }: { 
  startX: number, startY: number, endX: number, endY: number, duration: number, delay: number, color?: string, id: number, onComplete: () => void 
}) => {
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
  
  const [flightRoute] = useState(() => {
    const origin = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    let dest = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    while(dest === origin) dest = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    return `${origin} ➔ ${dest}`;
  });

  return (
    <motion.g
      initial={{ x: startX, y: startY, opacity: 1, rotate: angle }}
      animate={{ x: endX, y: endY }}
      transition={{ duration, delay, ease: "linear" }}
      onAnimationComplete={onComplete}
    >
      <g transform="scale(0.5)">
        <g filter="url(#glow)">
          <path d="M-30,0 C-30,-4 30,-3 30,0 C30,3 -30,4 -30,0 Z" fill={color} />
          <path d="M-5,0 L-18,22 L-10,22 L5,0 Z" fill={color} />
          <path d="M-5,0 L-18,-22 L-10,-22 L5,0 Z" fill={color} />
          <path d="M-22,0 L-28,10 L-25,10 L-20,0 Z" fill={color} />
          <path d="M-22,0 L-28,-10 L-25,-10 L-20,0 Z" fill={color} />
        </g>
        <foreignObject x="30" y="-60" width="160" height="60">
          <div style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(4px)', color: 'white', padding: '8px', borderRadius: '10px', border: `1px solid ${color}`, fontSize: '9px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ fontWeight: '900', color: color, fontSize: '8px' }}>GA-{id}</div>
            <div style={{ fontWeight: '600', marginTop: '2px' }}>{flightRoute}</div>
          </div>
        </foreignObject>
      </g>
    </motion.g>
  );
};

const RandomPlane = ({ id, color, delay }: { id: number, color: string, delay: number }) => {
  const [flight, setFlight] = useState<{ start: Point, end: Point, key: number, duration: number } | null>(() => {
    const start = getRandomEdgePoint();
    let end = getRandomEdgePoint();
    while(Math.abs(start.x - end.x) < 300 && Math.abs(start.y - end.y) < 300) {
      end = getRandomEdgePoint();
    }
    return { start, end, key: Date.now(), duration: 30 + Math.random() * 20 };
  });

  const spawnFlight = () => {
    const start = getRandomEdgePoint();
    let end = getRandomEdgePoint();
    while(Math.abs(start.x - end.x) < 300 && Math.abs(start.y - end.y) < 300) {
      end = getRandomEdgePoint();
    }
    setFlight({ start, end, key: Date.now(), duration: 30 + Math.random() * 20 });
  };

  if (!flight) return null;

  return (
    <PlaneNode 
      key={flight.key}
      startX={flight.start.x} 
      startY={flight.start.y} 
      endX={flight.end.x} 
      endY={flight.end.y} 
      duration={flight.duration} 
      delay={delay} 
      color={color} 
      id={id} 
      onComplete={spawnFlight}
    />
  );
};

const CarNode = ({ id, path, duration, delay, activePopup, data }: {
  id: number, path: string, duration: number, delay: number, activePopup: number | null, data: CarData
}) => {
  const [route] = useState(() => {
    const from = CITY_AREAS[Math.floor(Math.random() * CITY_AREAS.length)];
    let to = CITY_AREAS[Math.floor(Math.random() * CITY_AREAS.length)];
    while(to === from) to = CITY_AREAS[Math.floor(Math.random() * CITY_AREAS.length)];
    return { from, to };
  });

  return (
    <g>
      <motion.g
        initial={{ offsetDistance: "0%", opacity: 0 }}
        animate={{ offsetDistance: "100%", opacity: 1 }}
        transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
        style={{ offsetPath: `path("${path}")` } as React.CSSProperties}
      >
        <rect x="-8" y="-5" width="16" height="10" rx="2" fill="#1e293b" />
        <rect x="-6" y="-3" width="12" height="6" rx="1" fill={data.color} />
        <AnimatePresence>
          {activePopup === id && (
            <motion.foreignObject x="15" y="-90" width="150" height="90" initial={{ scale: 0, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0, opacity: 0, y: 10 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', color: '#1e293b', padding: '10px', borderRadius: '12px', border: `2px solid ${data.color}`, fontSize: '9px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontWeight: '800', fontSize: '11px', marginBottom: '2px' }}>{data.name}</div>
                <div style={{ fontSize: '8px', color: '#64748b' }}>{route.from} ➔ {route.to}</div>
                <div style={{ color: '#FFB800', fontWeight: '700', marginTop: '4px' }}>⭐ {data.rating}</div>
              </div>
            </motion.foreignObject>
          )}
        </AnimatePresence>
      </motion.g>
    </g>
  );
};

export default function LiveNetworkAnimation() {
  const [activePopup, setActivePopup] = useState<number | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
    const interval = setInterval(() => {
      const randomCarId = Math.floor(Math.random() * CARS_DATA.length) + 1;
      setActivePopup(randomCarId);
      setTimeout(() => setActivePopup(null), 3000);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  if (!hasMounted) return <div className="absolute inset-0 bg-background/50" />;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Buildings */}
        <g opacity="0.2">
          {BUILDINGS.map((b, i) => (
            <CityBuilding key={`build-${i}`} {...b} />
          ))}
        </g>

        {/* Roads */}
        <g opacity="0.3">
          {ROADS.map(road => (
            <React.Fragment key={road.id}>
              <path d={road.d} stroke="#1e293b" strokeWidth="32" strokeLinecap="round" opacity="0.4" />
              <path d={road.d} stroke="#334155" strokeWidth="28" strokeLinecap="round" />
              <path d={road.d} stroke="#94a3b8" strokeWidth="1" strokeDasharray="6 10" opacity="0.2" />
            </React.Fragment>
          ))}
        </g>

        {/* Data Streams */}
        {ROADS.map((road, i) => (
          <motion.path
            key={`stream-${i}`}
            d={road.d}
            stroke={i % 2 === 0 ? "#FFB800" : "#3b82f6"}
            strokeWidth="1.5"
            opacity="0.15"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{ pathLength: 0.2, pathOffset: 1 }}
            transition={{ duration: 10 + i * 3, repeat: Infinity, ease: "linear" }}
          />
        ))}

        {/* Markers */}
        <LocationMarker x={1050} y={250} color="#FFB800" />
        <LocationMarker x={150} y={150} color="#3b82f6" />

        {/* Cars */}
        <g opacity="0.9">
          {CARS_DATA.map((car, idx) => {
            // Using a deterministic but varied duration based on index to avoid Math.random during render
            const duration = 30 + (idx * 3.7) % 15;
            return (
              <CarNode 
                key={car.id} 
                id={car.id} 
                path={ROADS[idx % ROADS.length].d} 
                duration={duration} 
                delay={idx * 4} 
                activePopup={activePopup} 
                data={car} 
              />
            );
          })}
        </g>

        {/* Planes */}
        <RandomPlane id={101} color="#FFB800" delay={0} />
        <RandomPlane id={102} color="#3b82f6" delay={10} />
        <RandomPlane id={103} color="#ffffff" delay={20} />
      </svg>
    </div>
  );
}
