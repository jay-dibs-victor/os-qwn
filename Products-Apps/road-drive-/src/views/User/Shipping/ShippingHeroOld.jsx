import React from 'react';
import { motion } from 'framer-motion';

/**
 * Ultra-Detailed Isometric Vector Van
 * Professional logistics illustration style
 */
const VectorVan = ({ delay = 0, pathPoints }) => {
    const xCoords = pathPoints.map(p => p[0]);
    const yCoords = pathPoints.map(p => p[1]);

    return (
        <motion.g
            initial={{ x: xCoords[0], y: yCoords[0] }}
            animate={{
                x: xCoords,
                y: yCoords,
            }}
            transition={{
                duration: 25,
                repeat: Infinity,
                delay,
                ease: "linear"
            }}
        >
            {/* Dynamic Shadow */}
            <path d="M -40,60 L 40,20 L 120,60 L 40,100 Z" fill="rgba(0,0,0,0.1)" filter="blur(6px)" />

            <g transform="translate(0, 0)">
                {/* Rear Cargo Box */}
                <path d="M 10,0 L 45,-18 L 115,18 L 80,36 Z" fill="#FFB800" /> {/* Roof */}
                <path d="M 10,0 L 10,50 L 80,86 L 80,36 Z" fill="#E6A600" /> {/* Side Panel */}
                <path d="M 80,36 L 80,86 L 115,68 L 115,18 Z" fill="#CC9400" /> {/* Rear Face */}

                {/* Side Door Detail */}
                <path d="M 25,15 L 25,65 L 65,85 L 65,35 Z" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
                <rect x="55" y="45" width="4" height="10" fill="rgba(0,0,0,0.3)" rx="1" transform="skewY(26)" />

                {/* Front Cabin Section */}
                <g transform="translate(-35, 22)">
                    {/* Hood & Roof */}
                    <path d="M 0,0 L 45,-22 L 45,5 L 0,27 Z" fill="#FFB800" /> {/* Front Grille Face */}
                    <path d="M 0,0 L 45,-22 L 45,-35 L 5,-15 Z" fill="#FFB800" /> {/* Hood */}
                    <path d="M 45,-35 L 55,-30 L 55,20 L 45,25 Z" fill="#E6A600" /> {/* Pillar */}

                    {/* Windshield */}
                    <path d="M 5,-12 L 42,-30 L 42,-10 L 5,8 Z" fill="url(#windshieldGrad)" />

                    {/* Bumper & Lights */}
                    <path d="M 0,20 L 40,0 L 40,10 L 0,30 Z" fill="#333" />
                    <rect x="5" y="15" width="8" height="4" fill="#FFF" opacity="0.9" rx="1" transform="skewY(-20)" />
                    <rect x="25" y="5" width="8" height="4" fill="#FFF" opacity="0.9" rx="1" transform="skewY(-20)" />

                    {/* Side Mirror */}
                    <rect x="42" y="-20" width="4" height="8" fill="#111" transform="skewY(26)" />
                </g>

                {/* Wheels with Hubcaps */}
                <g>
                    <circle cx="10" cy="72" r="12" fill="#111" />
                    <circle cx="10" cy="72" r="6" fill="#666" />
                    <circle cx="90" cy="82" r="12" fill="#111" />
                    <circle cx="90" cy="82" r="6" fill="#666" />
                </g>

                {/* Logistics Text */}
                <text x="25" y="30" fontSize="9" fontWeight="900" fill="#000" opacity="0.8" transform="skewY(-26)">GO-SHIPP</text>
            </g>

            <defs>
                <linearGradient id="windshieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#475569" />
                </linearGradient>
            </defs>
        </motion.g>
    );
};

const LogisticsHub = ({ x, y, name, type }) => (
    <g transform={`translate(${x}, ${y})`}>
        {/* Base Plate */}
        <path d="M -150,0 L 0,-75 L 150,0 L 0,75 Z" fill="#cbd5e0" opacity="0.5" />

        {/* Complex Building */}
        <path d="M -100,-40 L 0,-90 L 100,-40 L 0,10 Z" fill="#fff" /> {/* Main Roof */}
        <path d="M -100,-40 L -100,80 L 0,130 L 0,10 Z" fill="#f8fafc" /> {/* West Wing */}
        <path d="M 0,10 L 0,130 L 100,80 L 100,-40 Z" fill="#f1f5f9" /> {/* East Wing */}

        {/* Skylights */}
        <rect x="-60" y="-60" width="20" height="10" fill="#e2e8f0" transform="skewX(-45) rotate(15)" />
        <rect x="-20" y="-75" width="20" height="10" fill="#e2e8f0" transform="skewX(-45) rotate(15)" />

        {/* Rolling Bay Doors */}
        <rect x="-80" y="40" width="60" height="60" fill="#334155" transform="skewY(26)" />
        <rect x="-75" y="45" width="50" height="2" fill="#FFB800" transform="skewY(26)" />

        {/* Entrance */}
        <rect x="20" y="40" width="30" height="50" fill="#64748b" transform="skewY(-26)" />

        {/* Branding Tower */}
        <rect x="-110" y="-20" width="20" height="100" fill="#1e293b" />
        <rect x="-110" y="-30" width="20" height="10" fill="#FFB800" />

        <text x="0" y="-110" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="900" style={{ letterSpacing: '1px' }}>{name}</text>
        <text x="0" y="-95" textAnchor="middle" fill="#FFB800" fontSize="10" fontWeight="bold">{type}</text>
    </g>
);

const ShippingHero = () => {
    return (
        <section className="shipping-hero-pro-v2" style={{
            height: '100vh',
            width: '100vw',
            background: '#f8fafc',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <svg
                viewBox="0 0 1600 1000"
                preserveAspectRatio="xMidYMid slice"
                style={{ width: '100%', height: '100%', zIndex: 1 }}
            >
                {/* Background Details */}
                <pattern id="isoGrid" width="120" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 120,0 L 0,60 M 0,0 L 120,60" stroke="#e2e8f0" strokeWidth="1" fill="none" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#isoGrid)" />

                {/* Roads: Precise Isometric Pathing */}
                {/* Artery 1 */}
                <path d="M -300,400 L 1900,1500 L 1900,1650 L -300,550 Z" fill="#e2e8f0" />
                <path d="M -300,475 L 1900,1575" stroke="#fff" strokeWidth="4" strokeDasharray="40,40" />

                {/* Artery 2 */}
                <path d="M 1900,-200 L -300,900 L -300,1050 L 1900,-50 Z" fill="#e2e8f0" />
                <path d="M 1900,-125 L -300,975" stroke="#fff" strokeWidth="4" strokeDasharray="40,40" />

                {/* Hub Locations */}
                <LogisticsHub x={300} y={300} name="LOGISTICS HUB A" type="DISTRIBUTION CENTER" />
                <LogisticsHub x={900} y={150} name="LOGISTICS HUB B" type="SORTING FACILITY" />
                <LogisticsHub x={1200} y={600} name="CARGO TERMINAL 4" type="EXPORT GATEWAY" />
                <LogisticsHub x={500} y={750} name="DOCK STATION" type="LAST MILE HUB" />

                {/* Detailed Vector Vans */}
                <VectorVan
                    delay={0}
                    pathPoints={[
                        [-200, 420], [200, 620], [600, 820], [1000, 1020], [1400, 1220]
                    ]}
                />
                <VectorVan
                    delay={10}
                    pathPoints={[
                        [1700, 0], [1300, 200], [900, 400], [500, 600], [100, 800], [-300, 1000]
                    ]}
                />
                <VectorVan
                    delay={5}
                    pathPoints={[
                        [1400, -100], [1000, 100], [600, 300], [200, 500], [-200, 700]
                    ]}
                />

                {/* Distant Sea/Port Detail */}
                <g transform="translate(1400, -200) rotate(15)">
                    <rect width="600" height="400" fill="#cbd5e0" opacity="0.3" />
                    <g transform="translate(50, 100)">
                        <path d="M 0,0 L 200,0 L 250,50 L -50,50 Z" fill="#1e293b" />
                        <rect x="80" y="-40" width="60" height="40" fill="#FFB800" />
                        <text x="85" y="-15" fill="#000" fontSize="12" fontWeight="900">GO-SHIP</text>
                    </g>
                </g>
            </svg>

            {/* UI Content Layer */}
            <div className="ui-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                padding: '0 8%',
                pointerEvents: 'none'
            }}>
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    style={{ maxWidth: '650px', pointerEvents: 'auto' }}
                >
                    <div className="badge-wrapper mb-4 d-flex align-items-center gap-3">
                        <span className="h-line" style={{ width: '40px', height: '3px', background: '#FFB800' }}></span>
                        <span className="text-uppercase fw-900 text-slate-500" style={{ fontSize: '12px', letterSpacing: '4px' }}>Logistics 4.0</span>
                    </div>

                    <h1 className="display-1 fw-900 text-slate-900 mb-4" style={{ lineHeight: 0.9 }}>
                        Global <br /> <span style={{ color: '#FFB800' }}>Logistics</span> <br /> Network.
                    </h1>

                    <p className="lead text-slate-600 mb-5 fw-500" style={{ fontSize: '1.4rem', maxWidth: '500px' }}>
                        The most advanced autonomous shipping network connecting businesses to the world.
                    </p>

                    <div className="btn-group-custom d-flex gap-4">
                        <button className="btn-go-main">Ship Now</button>
                        <button className="btn-go-outline">Track Hubs</button>
                    </div>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .fw-900 { font-weight: 900; }
                .fw-500 { font-weight: 500; }
                .btn-go-main {
                    background: #FFB800;
                    color: #000;
                    border: none;
                    padding: 24px 50px;
                    border-radius: 16px;
                    font-weight: 900;
                    font-size: 1.1rem;
                    box-shadow: 0 10px 30px rgba(255, 184, 0, 0.3);
                    transition: all 0.3s;
                }
                .btn-go-main:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(255, 184, 0, 0.4);
                }
                .btn-go-outline {
                    background: #000;
                    color: #FFB800;
                    border: none;
                    padding: 24px 50px;
                    border-radius: 16px;
                    font-weight: 900;
                    font-size: 1.1rem;
                    transition: all 0.3s;
                }
                .btn-go-outline:hover {
                    background: #333;
                    transform: translateY(-3px);
                }
            `}} />
        </section>
    );
};

export default ShippingHero;
