import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-logo">
          <img src="/logo.svg" alt="Queens OS Logo" className="footer-logo-img" />
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '400px', marginBottom: '40px', lineHeight: '1.7' }}>
          🇳🇬 Nigeria's upcoming e-hailing & logistics super app. Starting in Lagos — expanding to Africa and beyond.
        </p>

        <div className="footer-columns">
          <div className="footer-col">
            <h5 className="footer-col-title">Company</h5>
            <Link to="/about">About us</Link>
            <Link to="/newsroom">Newsroom</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/investors">Invest in us</Link>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">Products</h5>
            <Link to="/ride">Ride <span style={{ fontSize: '10px', color: 'var(--color-gold)' }}>Launching Lagos</span></Link>
            <Link to="/drive">Drive & Earn</Link>
            <Link to="/courier">Courier</Link>
            <Link to="/business">Business</Link>
            <Link to="/reserve">Reserve</Link>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">Coming Soon</h5>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', display: 'block', marginBottom: '12px' }}>✈️ Flights</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', display: 'block', marginBottom: '12px' }}>🚂 Trains</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', display: 'block', marginBottom: '12px' }}>📦 Cargo</span>
          </div>

          <div className="footer-col">
            <h5 className="footer-col-title">Trust & Safety</h5>
            <Link to="/safety">Safety</Link>
            <Link to="/safety">SOS Button</Link>
            <Link to="/help">Help Center</Link>
            <Link to="/diversity">Inclusion</Link>
          </div>
        </div>

        <div className="footer-social-row">
          <div className="social-icons-placeholder">
            <Link to="/social/facebook" className="social-icon-box" aria-label="Facebook">FB</Link>
            <Link to="/social/twitter" className="social-icon-box" aria-label="Twitter">TW</Link>
            <Link to="/social/youtube" className="social-icon-box" aria-label="YouTube">YT</Link>
            <Link to="/social/linkedin" className="social-icon-box" aria-label="LinkedIn">LN</Link>
            <Link to="/social/instagram" className="social-icon-box" aria-label="Instagram">IG</Link>
          </div>

          <div className="footer-bottom-text">
            <span>English</span>
            <span>🇳🇬 Lagos, Nigeria</span>
          </div>

          <div>
            <span>© 2026 Queens OS Technologies Ltd. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}