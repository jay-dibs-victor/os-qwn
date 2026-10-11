import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer — taxibooking-userapp
 * Modernized premium footer with multi-column layout, social links, and app badges.
 * Styles integrated into index.css / footer.css.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Company',
      links: ['About Us', 'Features', 'Our Fleet', 'News & Blog']
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security']
    },
    {
      title: 'Support',
      links: ['Help Center', 'FAQ', 'Contact Us', 'SOS Information']
    }
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="row mb-4">
          <div className="col-md-4">
            <h4 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px" }}>Queens</h4>
            <p style={{ color: "#999", fontSize: "14px" }}>
              Making urban mobility accessible, affordable, and reliable for everyone.
            </p>
          </div>

          <div className="col-md-2">
            <h6>Company</h6>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li><Link to="/about-us" style={{ color: "#999", textDecoration: "none", transition: "0.3s" }} onMouseEnter={e => e.target.style.color = "#FFB800"} onMouseLeave={e => e.target.style.color = "#999"}>About Us</Link></li>
              <li><a href="#" style={{ color: "#999", textDecoration: "none", transition: "0.3s" }} onMouseEnter={e => e.target.style.color = "#FFB800"} onMouseLeave={e => e.target.style.color = "#999"}>Careers</a></li>
              <li><a href="#" style={{ color: "#999", textDecoration: "none", transition: "0.3s" }} onMouseEnter={e => e.target.style.color = "#FFB800"} onMouseLeave={e => e.target.style.color = "#999"}>Blog</a></li>
            </ul>
          </div>

          <div className="col-md-2">
            <h6>For Riders</h6>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li><a href="#" style={{ color: "#999", textDecoration: "none", transition: "0.3s" }} onMouseEnter={e => e.target.style.color = "#FFB800"} onMouseLeave={e => e.target.style.color = "#999"}>Download App</a></li>
              <li><a href="#" style={{ color: "#999", textDecoration: "none", transition: "0.3s" }} onMouseEnter={e => e.target.style.color = "#FFB800"} onMouseLeave={e => e.target.style.color = "#999"}>Help & Support</a></li>
              <li><a href="#" style={{ color: "#999", textDecoration: "none", transition: "0.3s" }} onMouseEnter={e => e.target.style.color = "#FFB800"} onMouseLeave={e => e.target.style.color = "#999"}>Safety</a></li>
            </ul>
          </div>

          <div className="col-md-2">
            <h6>Legal</h6>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li><Link to="/privacy" style={{ color: "#999", textDecoration: "none", transition: "0.3s" }} onMouseEnter={e => e.target.style.color = "#FFB800"} onMouseLeave={e => e.target.style.color = "#999"}>Privacy Policy</Link></li>
              <li><Link to="/terms" style={{ color: "#999", textDecoration: "none", transition: "0.3s" }} onMouseEnter={e => e.target.style.color = "#FFB800"} onMouseLeave={e => e.target.style.color = "#999"}>Terms of Service</Link></li>
              <li><a href="#" style={{ color: "#999", textDecoration: "none", transition: "0.3s" }} onMouseEnter={e => e.target.style.color = "#FFB800"} onMouseLeave={e => e.target.style.color = "#999"}>Contact</a></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "24px", textAlign: "center", color: 'var(--color-text-muted)', fontSize: "14px" }}>
          <p style={{ margin: 0 }}>© 2026 Queens. All rights reserved. Crafted for seamless urban mobility.</p>
        </div>

      </div>
    </footer>
  )
};

export default Footer;
