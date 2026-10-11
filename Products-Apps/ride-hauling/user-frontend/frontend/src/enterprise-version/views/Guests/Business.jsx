import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Business() {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="business-root">
      {/* Alert Banner */}
      {showAlert && (
        <div className="business-alert-banner">
          <span>
            Travel managers, your meal policy has gaps. We’ll show you how to fix them June 11.
            <Link to="/contact-sales">Register now</Link>
          </span>
          <span className="business-alert-close" onClick={() => setShowAlert(false)}>✕</span>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="business-hero-section">
        <div className="business-hero-container">
          <div className="business-hero-copy">
            <h1>Queens OS for Business: built for modern teams, designed to scale globally.</h1>
            <p>
              Queens OS for Business helps global enterprises manage rides, deliveries, and employee meals with a safety-first, driver-friendly platform.
              Move faster with better cost control, visibility, and security for every team trip.
            </p>
            <div className="business-hero-actions">
              <Link className="btn-white" to="/business/onboarding">Get started</Link>
              <Link className="btn-outline" to="/contact-sales">Contact sales</Link>
            </div>
          </div>

          <div className="business-hero-img">
            <svg viewBox="0 0 600 400" width="100%" height="100%">
              <rect width="600" height="400" fill="#0c0c0c" rx="12" />
              <rect x="50" y="50" width="500" height="300" rx="8" fill="#000000" stroke="#FFB800" strokeWidth="2" />
              <rect x="80" y="80" width="440" height="40" rx="4" fill="#151515" />
              <circle cx="105" cy="100" r="10" fill="#FFB800" />
              <rect x="130" y="95" width="100" height="10" rx="3" fill="#ffffff" />
              <rect x="80" y="140" width="200" height="180" rx="4" fill="#151515" />
              <rect x="300" y="140" width="220" height="180" rx="4" fill="#151515" />
              <circle cx="120" cy="180" r="25" fill="#222222" />
              <circle cx="120" cy="180" r="15" fill="#FFB800" />
              <rect x="160" y="170" width="100" height="8" rx="2" fill="#ffffff" />
              <rect x="160" y="185" width="60" height="6" rx="2" fill="#afafaf" />
            </svg>
          </div>
        </div>
      </section>

      {/* Value Proposition Cards */}
      <section className="business-values-section">
        <div className="business-values-container">
          <h2 className="business-values-title">Built for modern business teams, designed to scale globally</h2>
          <div className="business-values-grid">
            <div className="value-card">
              <h3>Control costs without sacrificing service</h3>
              <p>Custom travel and meal policies give finance teams the oversight they need, while drivers keep more of what they earn.</p>
            </div>

            <div className="value-card">
              <h3>Track greener fleet choices</h3>
              <p>Monitor emissions for every trip and meal so your company can make smarter sustainability decisions across all your locations.</p>
            </div>

            <div className="value-card">
              <h3>Deliver premium team experiences</h3>
              <p>Give employees, clients, and partners safer rides, faster deliveries, and better meals through one coordinated app.</p>
            </div>

            <div className="value-card">
              <h3>Keep every trip secure</h3>
              <p>From SOS alerts to verified driver profiles and real-time incident updates, Queens OS makes safety a business requirement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="business-solutions-section">
        <div className="business-solutions-container">
          <h2 className="business-values-title" style={{ marginBottom: '40px' }}>How corporate teams use Queens OS</h2>
          <div className="solutions-grid">
            <div className="solution-card-modern">
              <div className="solution-icon-box">
                <svg viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z" />
                </svg>
              </div>
              <h3>Business travel</h3>
              <p>Give your teams safer, more predictable rides with expense controls, in-app reporting, and real-time trip tracking.</p>
              <Link to="/ride" className="btn-underline" style={{ marginTop: '16px', display: 'inline-block', alignSelf: 'flex-start' }}>
                Learn about business travel
              </Link>
            </div>

            <div className="solution-card-modern">
              <div className="solution-icon-box">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <h3>Meal programs</h3>
              <p>Run employee meal stipends and guest catering from one dashboard, with better compliance and local payment flexibility.</p>
              <Link to="/eat" className="btn-underline" style={{ marginTop: '16px', display: 'inline-block', alignSelf: 'flex-start' }}>
                Learn about meal programs
              </Link>
            </div>

            <div className="solution-card-modern">
              <div className="solution-icon-box">
                <svg viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3v12h3v4h14v-8zm-5-2v2H5V6h10zm-9 8H5v-4h10v4H6zm9 4h-9v-2h9v2zm3 0h-1v-4h1v4zm0-6h-1V9h1v3z" />
                </svg>
              </div>
              <h3>Local delivery</h3>
              <p>Move packages, documents, and equipment across your city with visibility, speed, and the same driver network powering our rides business.</p>
              <Link to="/courier" className="btn-underline" style={{ marginTop: '16px', display: 'inline-block', alignSelf: 'flex-start' }}>
                Learn about local delivery
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Panel */}
      <section className="logos-section">
        <div className="logos-container">
          <p className="logos-intro">Trusted by elite teams, startups, and fast-growing companies globally.</p>
          <div className="logos-row">
            <span className="logo-item">Apex Logistics</span>
            <span className="logo-item">Global Prime Ventures</span>
            <span className="logo-item">MarketFleet</span>
            <span className="logo-item">Metropolitan Hospitality</span>
            <span className="logo-item">Riverfront Media</span>
          </div>
        </div>
      </section>

      {/* Customer Testimonial Section */}
      <section className="business-testimonial-section">
        <div className="business-testimonial-container">
          <div>
            <blockquote className="testimonial-blockquote">
              "Providing reliable transport options and meal credits wasn't just a perk, it completely changed how our teams collaborate and remain productive when traveling."
            </blockquote>
            <p className="testimonial-author">Ryan Carter</p>
            <p className="testimonial-role">Founder and CEO, Parachute Media</p>
          </div>

          <div className="testimonial-visual-box">
            <svg viewBox="0 0 400 240" width="100%">
              <rect width="400" height="240" rx="12" fill="#000000" stroke="#FFB800" strokeWidth="1" />
              <polygon points="180,100 240,120 180,140" fill="#FFB800" />
              <rect x="20" y="200" width="360" height="8" rx="4" fill="#151515" />
              <rect x="20" y="200" width="180" height="8" rx="4" fill="#FFB800" />
            </svg>
          </div>
        </div>
      </section>

      {/* Resources section */}
      <section className="resources-section">
        <div className="resources-container">
          <h2 className="business-values-title" style={{ marginBottom: '40px' }}>Interested in learning more?</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h4>How to reduce the carbon footprint of business travel</h4>
              <Link to="/resources/carbon-footprint" className="resource-link">
                See how
                <svg viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" /></svg>
              </Link>
            </div>

            <div className="resource-card">
              <h4>The perks and benefits your employees want now</h4>
              <Link to="/resources/employee-benefits" className="resource-link">
                Find out
                <svg viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" /></svg>
              </Link>
            </div>

            <div className="resource-card">
              <h4>The road to sustainability: executives discuss net zero</h4>
              <Link to="/resources/sustainability-road" className="resource-link">
                Keep reading
                <svg viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}