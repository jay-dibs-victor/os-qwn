import { Link } from 'react-router-dom';
import AboutHero from "./AboutHero"


import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPinned,
  Car,
  Wallet,
  Truck,
  Building2,
  Globe,
  Users,
  Sparkles,
  Target,
} from "lucide-react";

import "./about.css";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
    },
  },
};

const stats = [
  {
    value: "10+",
    label: "Services Planned",
  },
  {
    value: "24/7",
    label: "Real Time Platform",
  },
  {
    value: "100%",
    label: "Future Ready",
  },
  {
    value: "∞",
    label: "Growth Potential",
  },
];

const ecosystem = [
  {
    icon: Car,
    title: "Mobility",
    desc: "Ride-hailing services connecting riders and drivers seamlessly.",
  },
  {
    icon: Truck,
    title: "Logistics",
    desc: "Smart delivery and courier solutions for individuals and businesses.",
  },
  {
    icon: Wallet,
    title: "Financial Services",
    desc: "Payments, rewards, wallets and future digital asset ecosystems.",
  },
  {
    icon: Building2,
    title: "Business Solutions",
    desc: "Enterprise mobility and operational management tools.",
  },
  {
    icon: Globe,
    title: "Commerce",
    desc: "Connecting merchants, customers and service providers.",
  },
  {
    icon: Sparkles,
    title: "Future Technologies",
    desc: "AI, blockchain and digital infrastructure powering tomorrow.",
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* ================= HERO ================= */}

      <section className="about-hero">
        <div className="hero-overlay" />

        <svg
          className="route-svg"
          viewBox="0 0 1600 900"
          preserveAspectRatio="none"
        >
          <path
            d="M0 500 C300 100 600 800 900 400 S1400 200 1600 500"
            className="route-path"
          />
          <path
            d="M0 700 C400 400 600 850 1000 300 S1400 100 1600 300"
            className="route-path secondary"
          />
        </svg>

        <div className="container hero-content">
          <motion.div
            initial="hidden"
            animate="whileInView"
            variants={fadeUp}
          >
            <span className="eyebrow">
              Reimagining Movement Across Africa
            </span>

            <h1>
              The Operating System For
              <span> Mobility, Commerce & Finance</span>
            </h1>

            <p>
              Queens OS is building the infrastructure powering transportation,
              logistics, payments and future digital ecosystems for the next
              generation.
            </p>

            <div className="hero-actions">
              <button className="primary-btn">
                Explore Ecosystem
                <ArrowRight size={18} />
              </button>

              <button className="secondary-btn">
                Join Our Journey
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= VISION ================= */}

      <section className="vision-section">
        <div className="container vision-grid">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="whileInView"
          >
            <span className="section-tag">Our Vision</span>

            <h2>
              We believe movement creates opportunity.
            </h2>

            <p>
              Whether it's moving people, goods, money, services or ideas,
              every journey creates new possibilities.
            </p>

            <p>
              Queens OS exists to remove barriers and make those opportunities
              accessible to everyone.
            </p>
          </motion.div>

          <motion.div
            className="vision-card"
            variants={fadeUp}
            initial="hidden"
            whileInView="whileInView"
          >
            <div className="vision-network">
              <Users />
              <MapPinned />
              <Wallet />
              <Truck />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= STORY ================= */}

      <section className="story-section">
        <div className="container">
          <motion.div
            className="section-header"
            variants={fadeUp}
            initial="hidden"
            whileInView="whileInView"
          >
            <span className="section-tag">Our Story</span>

            <h2>Building The Future Step By Step</h2>
          </motion.div>

          <div className="timeline">
            <div className="timeline-card">
              <div className="timeline-year">2025</div>

              <h3>The Beginning</h3>

              <p>
                Queens OS started as a mobility platform designed to simplify
                transportation and create opportunities for drivers.
              </p>
            </div>

            <div className="timeline-card">
              <div className="timeline-year">Today</div>

              <h3>Expanding The Ecosystem</h3>

              <p>
                Logistics, deliveries, digital payments and business solutions
                are becoming part of the Queens OS platform.
              </p>
            </div>

            <div className="timeline-card">
              <div className="timeline-year">Tomorrow</div>

              <h3>Connected Cities</h3>

              <p>
                Smart mobility, financial inclusion, AI-powered experiences and
                Web3 infrastructure powering future economies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CEO ================= */}

      <section className="ceo-section">
        <div className="container">
          <motion.div
            className="ceo-card"
            variants={fadeUp}
            initial="hidden"
            whileInView="whileInView"
          >
            <div className="ceo-image">
              <div className="ceo-avatar">
                <Users size={70} />
              </div>
            </div>

            <div className="ceo-content">
              <span className="section-tag">Message From Leadership</span>

              <h2>A Letter From Our Founder</h2>

              <p>
                At Queens OS, technology is not simply about software.
              </p>

              <p>
                It is about creating opportunities, empowering communities and
                making everyday life easier for riders, drivers, merchants,
                businesses and future ecosystem partners.
              </p>

              <p>
                Every product we build starts with one question:
              </p>

              <blockquote>
                “How can we help people move forward faster?”
              </blockquote>

              <button className="primary-btn">
                Read Full Letter
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= STATS ================= */}

      <section className="stats-section">
        <div className="container stats-grid">
          {stats.map((item) => (
            <motion.div
              key={item.label}
              className="stat-card"
              variants={fadeUp}
              initial="hidden"
              whileInView="whileInView"
            >
              <h3>{item.value}</h3>
              <p>{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= ECOSYSTEM ================= */}

      <section className="ecosystem-section">
        <div className="container">
          <motion.div
            className="section-header"
            variants={fadeUp}
            initial="hidden"
            whileInView="whileInView"
          >
            <span className="section-tag">
              Ecosystem
            </span>

            <h2>More Than Mobility</h2>

            <p>
              Queens OS is building an interconnected ecosystem designed to
              power how people move, transact and grow.
            </p>
          </motion.div>

          <div className="ecosystem-grid">
            {ecosystem.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  className="ecosystem-card"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="whileInView"
                >
                  <div className="eco-icon">
                    <Icon size={30} />
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}


// export default function About() {
//   return (
//     <div className="page-wrapper">
//       {/* Hero */}
//       {/* <section id="hero" className="hero hero-business section-padding" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
//         <div className="hero-copy" style={{ maxWi dth: '820px' }}>
//           <span className="eyebrow">🌐 About Queens OS</span>
//           <h1 style={{ fontSize: '60px', lineHeight: '1.05', marginBottom: '24px' }}>
//             The global mobility revolution starts here.
//           </h1>
//           <p style={{ fontSize: '20px', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
//             Queens OS is an early-stage global e-hailing and logistics startup building the most driver-friendly, safety-first, and ambitious transport super app.
//           </p>
//         </div>
//       </section> */}

//       <AboutHero />

//       {/* Mission Statement */}
//       <section className="split-promo-section section-padding" style={{ borderTop: '1px solid var(--color-border-gold)' }}>
//         <div className="split-promo-visual" style={{ background: 'radial-gradient(circle at 60% 40%, rgba(255,184,0,0.15), transparent 70%), var(--color-surface-card)', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: '1px solid var(--color-border-gold)' }}>
//           <div style={{ textAlign: 'center', padding: '32px' }}>
//             <img src="/logo.svg" alt="Queens OS" style={{ height: '80px', marginBottom: '24px' }} />
//             <p style={{ color: 'var(--color-gold)', fontWeight: '700', fontSize: '18px' }}>Queens OS Technologies</p>
//             <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '8px' }}>Global Headquarters</p>
//           </div>
//         </div>
//         <div className="split-promo-content">
//           <span className="eyebrow">Our Mission</span>
//           <h2>Affordable, safe, and seamless transport for everyone.</h2>
//           <p>We believe the world deserves a premium mobility platform — one that treats drivers fairly, keeps passengers safe, and evolves into a complete logistics ecosystem. Starting with rides, we're building toward a future where one app handles your car ride, flight ticket, cargo shipment, and train booking.</p>
//           <Link className="btn-black" style={{ marginTop: '24px', display: 'inline-flex' }} to="/investors">Partner with us</Link>
//         </div>
//       </section>

//       {/* Why Queens OS is Different */}
//       <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)' }}>
//         <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
//           <div style={{ marginBottom: '56px' }}>
//             <span className="eyebrow">Our Edge</span>
//             <h2>Why Queens OS Wins</h2>
//           </div>
//           <div className="feature-grid">
//             <div className="feature-card">
//               <div style={{ fontSize: '40px', marginBottom: '16px' }}>💰</div>
//               <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Lowest Driver Commission</h3>
//               <p>We take a smaller cut than every major competitor. That means drivers earn more per trip, which means higher driver satisfaction, more reliable supply, and better service for riders.</p>
//             </div>
//             <div className="feature-card">
//               <div style={{ fontSize: '40px', marginBottom: '16px' }}>🆘</div>
//               <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Built-in SOS Button</h3>
//               <p>Security is non-negotiable. Every Queens OS trip includes a one-tap SOS emergency button that alerts local authorities and emergency contacts instantly.</p>
//             </div>
//             <div className="feature-card">
//               <div style={{ fontSize: '40px', marginBottom: '16px' }}>🌍</div>
//               <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>Global-First Scale</h3>
//               <p>We're starting locally, but the vision is global. Queens OS is engineered to scale across cities and countries around the world.</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Super App Roadmap */}
//       <section className="section-padding">
//         <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
//           <div style={{ marginBottom: '56px', textAlign: 'center' }}>
//             <span className="eyebrow">The Roadmap</span>
//             <h2>From rides to a full transport ecosystem</h2>
//             <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '16px auto 0' }}>We are phasing our product launches strategically — perfecting rides first, then expanding into a full logistics super app.</p>
//           </div>

//           <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
//             {[
//               { phase: 'Phase 1', title: 'E-Hailing Rides', detail: 'Launching with affordable, safe, driver-empowering ride-hailing.', status: '🟡 In Development', color: 'var(--color-gold)' },
//               { phase: 'Phase 2', title: 'Package Delivery & Courier', detail: 'Adding intra-city cargo and package delivery services via the same driver network.', status: '🔵 Planned', color: 'rgba(255,255,255,0.4)' },
//               { phase: 'Phase 3', title: 'Flight & Train Tickets', detail: 'Integrated booking for domestic flights and rail transport.', status: '🔵 Planned', color: 'rgba(255,255,255,0.4)' },
//               { phase: 'Phase 4', title: 'Global Scaling', detail: 'Scaling the full platform to international markets and eventually globally.', status: '🔵 Planned', color: 'rgba(255,255,255,0.4)' },
//             ].map((item, i) => (
//               <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: '24px', padding: '32px 0', borderBottom: '1px solid var(--color-border-gold)', alignItems: 'start' }}>
//                 <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: '600', paddingTop: '4px' }}>{item.phase}</div>
//                 <div>
//                   <h3 style={{ color: item.color, fontSize: '22px', marginBottom: '8px' }}>{item.title}</h3>
//                   <p style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>{item.detail}</p>
//                 </div>
//                 <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', paddingTop: '4px' }}>{item.status}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA to Investors */}
//       <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)', textAlign: 'center' }}>
//         <h2 style={{ fontSize: '40px', marginBottom: '20px' }}>Believe in this vision?</h2>
//         <p style={{ color: 'var(--color-text-muted)', maxWidth: '560px', margin: '0 auto 32px', fontSize: '18px' }}>We are currently raising our seed round. Talk to the founding team and request our pitch deck.</p>
//         <Link className="btn-black" to="/investors">Invest in Queens OS</Link>
//       </section>
//     </div>
//   );
// }