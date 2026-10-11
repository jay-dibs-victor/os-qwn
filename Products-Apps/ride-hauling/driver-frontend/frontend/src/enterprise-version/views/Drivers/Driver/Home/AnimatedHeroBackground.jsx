import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COUNTRIES = ["Nigeria", "Japan", "USA", "UK", "Canada", "Germany", "France", "UAE", "China", "Brazil", "Australia"];
const CITY_AREAS = ["Lekki Phase 1", "Victoria Island", "Ikeja G.R.A", "Surulere", "Yaba", "Maryland", "Ikoyi", "Ajah"];

const CARS_DATA = [
  { id: 1, name: "Samuel O.", rating: "4.9", status: "Online", color: "#FFB800" },
  { id: 2, name: "David K.", rating: "4.8", status: "On Trip", color: "#64748b" },
  { id: 3, name: "Blessing E.", rating: "5.0", status: "Online", color: "#FFDA44" },
  { id: 4, name: "John D.", rating: "4.7", status: "Arriving", color: "#1e1e1e" },
];

const ROADS = [
  { id: 'main-artery', d: "M-100,200 C200,200 400,600 600,600 C800,600 1000,200 1300,200" },
  { id: 'west-coast', d: "M-100,600 C150,600 200,100 500,100 C800,100 850,800 1300,800" },
  { id: 'downtown-loop', d: "M500,400 A150,100 0 1,1 500,401" },
  { id: 'highway', d: "M200,-100 C200,300 1000,500 1000,900" },
  { id: 'right-lane-1', d: "M800,-100 C850,200 750,500 800,900" },
  { id: 'right-lane-2', d: "M600,900 C700,500 900,300 1300,100" },
  { id: 'east-bound', d: "M1000,-100 C1100,300 1150,600 1200,900" }
];

const LocationMarker = ({ x, y, color = "#FFB800" }) => (
  <g transform={`translate(${x}, ${y-40})`} filter="url(#glow)">
    <path d="M0,40 L-10,25 A12,12 0 1,1 10,25 Z" fill={color} />
    <circle cx="0" cy="18" r="4" fill="white" />
  </g>
);

const BUILDINGS = [
  { x: 100, y: 100, type: 'skyscraper', h: 80, color: '#1e293b' },
  { x: 250, y: 60, type: 'building', h: 40, color: '#475569' },
  { x: 400, y: 80, type: 'building', h: 50, color: '#f8fafc' },
  { x: 550, y: 50, type: 'skyscraper', h: 110, color: '#334155' },
  { x: 700, y: 90, type: 'building', h: 35, color: '#e2e8f0' },
  { x: 850, y: 60, type: 'building', h: 45, color: '#94a3b8' },
  { x: 1000, y: 80, type: 'skyscraper', h: 100, color: '#1e293b' },
  { x: 1150, y: 120, type: 'building', h: 40, color: '#475569' },
  { x: 50, y: 150, type: 'shop', h: 25, color: '#FFB800' },
  { x: 200, y: 180, type: 'building', h: 60, color: '#cbd5e1' },
  { x: 350, y: 220, type: 'skyscraper', h: 95, color: '#1e293b' },
  { x: 500, y: 180, type: 'building', h: 50, color: '#334155' },
  { x: 650, y: 220, type: 'skyscraper', h: 80, color: '#475569' },
  { x: 800, y: 150, type: 'building', h: 45, color: '#FFB800' },
  { x: 950, y: 210, type: 'building', h: 55, color: '#1e293b' },
  { x: 1100, y: 280, type: 'building', h: 40, color: '#cbd5e1' },
];

const CityBuilding = ({ x, y, color = '#FFB800' }) => {
  return (
    <g transform={`translate(${x-45}, ${y-45}) scale(0.3)`}>
      <circle cx="150" cy="150" r="140" fill="rgba(255,184,0,0.05)" />
      <rect x="80" y="120" width="35" height="100" rx="4" fill={color} opacity="0.8" />
      <rect x="130" y="80" width="35" height="140" rx="4" fill={color} />
      <rect x="180" y="100" width="35" height="120" rx="4" fill={color} opacity="0.8" />
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

const AnimatedHeroBackground = () => {
  const [activePopup, setActivePopup] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomCarId = Math.floor(Math.random() * CARS_DATA.length) + 1;
      setActivePopup(randomCarId);
      setTimeout(() => setActivePopup(null), 4000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-bg-animated-map" style={{ 
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 0, opacity: 0.7, pointerEvents: 'none'
    }}>
      <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g opacity="0.4">
          {BUILDINGS.map((b, i) => (
            <CityBuilding key={`build-${i}`} {...b} />
          ))}
        </g>

        <g opacity="0.8">
          {ROADS.map(road => (
            <React.Fragment key={road.id}>
              <path d={road.d} stroke="#cbd5e1" strokeWidth="32" strokeLinecap="round" opacity="0.4" />
              <path d={road.d} stroke="#e2e8f0" strokeWidth="28" strokeLinecap="round" />
              <path d={road.d} stroke="#94a3b8" strokeWidth="1" strokeDasharray="6 10" opacity="0.6" />
            </React.Fragment>
          ))}
        </g>

        {ROADS.map((road, i) => (
          <motion.path
            key={`stream-${i}`}
            d={road.d}
            stroke={i % 2 === 0 ? "#FFB800" : "#3b82f6"}
            strokeWidth="2"
            opacity="0.25"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{ pathLength: 0.2, pathOffset: 1 }}
            transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
          />
        ))}

        <LocationMarker x={1050} y={250} color="#FFB800" />
        <LocationMarker x={150} y={150} color="#3b82f6" />

        <g opacity="0.8">
          {CARS_DATA.map((car, idx) => (
            <CarNode 
              key={car.id} 
              id={car.id} 
              path={ROADS[idx % ROADS.length].d} 
              duration={40 + Math.random() * 20} 
              delay={idx * 5} 
              activePopup={activePopup} 
              data={car} 
            />
          ))}
        </g>

        <RandomPlane id={101} color="#FFB800" delay={0} />
        <RandomPlane id={102} color="#3b82f6" delay={15} />
      </svg>
    </div>
  );
};

const RandomPlane = ({ id, color, delay }) => {
  const [flight, setFlight] = useState(null);

  const spawnFlight = () => {
    const start = getRandomEdgePoint();
    let end = getRandomEdgePoint();
    while(Math.abs(start.x - end.x) < 300 && Math.abs(start.y - end.y) < 300) {
      end = getRandomEdgePoint();
    }
    setFlight({ start, end, key: Date.now() });
  };

  useEffect(() => {
    spawnFlight();
  }, []);

  if (!flight) return null;

  return (
    <PlaneNode 
      key={flight.key}
      startX={flight.start.x} 
      startY={flight.start.y} 
      endX={flight.end.x} 
      endY={flight.end.y} 
      duration={35 + Math.random() * 15} 
      delay={delay} 
      color={color} 
      id={id} 
      onComplete={spawnFlight}
    />
  );
};

const PlaneNode = ({ startX, startY, endX, endY, duration, delay, color = "white", id, onComplete }) => {
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
  const flightRoute = useMemo(() => {
    const origin = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    let dest = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    while(dest === origin) dest = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    return `${origin} ➔ ${dest}`;
  }, []);

  return (
    <motion.g
      initial={{ x: startX, y: startY, opacity: 1, rotate: angle }}
      animate={{ x: endX, y: endY }}
      transition={{ duration, delay, ease: "linear" }}
      onAnimationComplete={onComplete}
    >
      <g transform="scale(0.7)">
        <path d="M-25,45 C-10,45 10,45 25,45 M-10,35 L-20,60 M-10,55 L-20,30" stroke="rgba(0,0,0,0.08)" strokeWidth="3" />
        <g filter="url(#glow)">
          <path d="M-30,0 C-30,-4 30,-3 30,0 C30,3 -30,4 -30,0 Z" fill={color} />
          <path d="M-5,0 L-18,22 L-10,22 L5,0 Z" fill={color} />
          <path d="M-5,0 L-18,-22 L-10,-22 L5,0 Z" fill={color} />
        </g>
        <foreignObject x="30" y="-60" width="180" height="70">
          <div style={{ background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)', color: 'var(--color-text)', padding: '10px', borderRadius: '12px', border: `1px solid ${color}`, fontSize: '11px', fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: '900', color: color, fontSize: '9px' }}>AIR GOOM • GA-{id}</div>
            <div style={{ fontWeight: '600', fontSize: '11px', marginTop: '4px' }}>{flightRoute}</div>
          </div>
        </foreignObject>
      </g>
    </motion.g>
  );
};

const CarNode = ({ id, path, duration, delay, activePopup, data }) => {
  const route = useMemo(() => {
    const from = CITY_AREAS[Math.floor(Math.random() * CITY_AREAS.length)];
    let to = CITY_AREAS[Math.floor(Math.random() * CITY_AREAS.length)];
    while(to === from) to = CITY_AREAS[Math.floor(Math.random() * CITY_AREAS.length)];
    return { from, to };
  }, []);

  return (
    <g>
      <motion.g
        initial={{ offsetDistance: "0%", opacity: 0 }}
        animate={{ offsetDistance: "100%", opacity: 1 }}
        transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
        style={{ offsetPath: `path("${path}")`, position: 'relative' }}
      >
        <rect x="-12" y="-7" width="24" height="14" rx="3" fill="#1e293b" />
        <rect x="-10" y="-5" width="20" height="10" rx="2" fill={data.color} />
        <AnimatePresence>
          {activePopup === id && (
            <motion.foreignObject x="20" y="-110" width="180" height="110" initial={{ scale: 0, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0, opacity: 0, y: 20 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)', color: '#1e293b', padding: '12px', borderRadius: '16px', border: `2px solid ${data.color}`, fontSize: '11px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontWeight: '800', fontSize: '13px', marginBottom: '4px' }}>{data.name}</div>
                <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '8px' }}>Trip: <span style={{color: '#1e293b', fontWeight: 700}}>{route.from} ➔ {route.to}</span></div>
                <div style={{ color: '#FFB800', fontWeight: '700' }}>⭐ {data.rating} • {data.status}</div>
              </div>
            </motion.foreignObject>
          )}
        </AnimatePresence>
      </motion.g>
    </g>
  );
};

export default AnimatedHeroBackground;
