import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { FaUser, FaRegQuestionCircle, FaWallet, FaHistory, FaUserCog, FaCar, FaUtensils, FaBriefcase, FaSlidersH, FaBell } from 'react-icons/fa';
import DriverMenu from './driver/DriverMenu.jsx';

export default function NavBar() {
  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isDriver = location.pathname.startsWith('/drive');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand-logo">
          <img src="/logo.svg" alt="Queens OS Logo" className="nav-logo-img" />
        </Link>
        <nav className="nav-links">
          <div className="nav-dropdown">
            <Link to="/about#hero" className="nav-menu-item dropdown-toggle">
              Company
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" /></svg>
            </Link>
            <div className="nav-dropdown-menu">
              <Link to="/about" className="nav-dropdown-item">About us</Link>
              <Link to="/how-it-works" className="nav-dropdown-item">Our offerings</Link>
              <Link to="/how-it-works" className="nav-dropdown-item">How Queens OS works</Link>
              <Link to="/about" className="nav-dropdown-item">Global citizenship</Link>
              <Link to="/newsroom" className="nav-dropdown-item">Newsroom</Link>
              <Link to="/investors" className="nav-dropdown-item">Investor relations</Link>
              <Link to="/blog" className="nav-dropdown-item">Blog</Link>
              <Link to="/careers" className="nav-dropdown-item">Careers</Link>
            </div>
          </div>
          <div className="nav-dropdown">
            <Link to="/ride#hero" className="nav-menu-item dropdown-toggle">
              Products
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" /></svg>
            </Link>
            <div className="nav-dropdown-menu">
              <Link to="/ride" className="nav-dropdown-item">Ride</Link>
              <Link to="/drive" className="nav-dropdown-item">Drive</Link>
              <Link to="/courier" className="nav-dropdown-item">Deliver</Link>
              <Link to="/eat" className="nav-dropdown-item">Eat</Link>
              <Link to="/business" className="nav-dropdown-item">Queens OS for Business</Link>
              <Link to="/freight" className="nav-dropdown-item">Queens OS Freight</Link>
            </div>
          </div>
          <div className="nav-menu-item">
            <Link to="/safety">Safety</Link>
          </div>
          <div className="nav-menu-item">
            <a href={`${import.meta.env.VITE_DRIVER_APP_URL || 'http://localhost:4004'}/onboarding`}>Drive for Queens</a>
          </div>
        </nav>
      </div>

      <div className="nav-actions">
        <button className="nav-btn nav-lang">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm6.9 5h-2.7c-.3-1.6-.9-3-1.7-4.1 1.9.9 3.5 2.4 4.4 4.1zM8 1.6c.7 1 1.3 2.3 1.6 3.4H6.4c.3-1.1.9-2.4 1.6-3.4zm-5.2.5C2 3.2 1.4 4.6 1.1 5h2.7c-.3-1.6-.9-3-1.7-4.1zM1.1 11c.3 1.4.9 2.8 1.7 4.1.8-1.1 1.4-2.5 1.7-4.1H1.1zm5.3 3.4c-.7-1-1.3-2.3-1.6-3.4h6.4c-.3 1.1-.9 2.4-1.6 3.4zm5.2-.5c.8-1.1 1.4-2.5 1.7-4.1h2.7c-.3 1.4-.9 2.8-1.7 4.1zM13.1 10H2.9c-.1-.7-.2-1.3-.2-2s.1-1.3.2-2h10.2c.1.7.2 1.3.2 2s-.1 1.3-.2 2z" />
          </svg>
          EN
        </button>
        <Link className="nav-btn" to="/help">Help</Link>
        {isLoggedIn ? (
          <div className="user-avatar-container" ref={menuRef}>
            <button
              className="user-avatar-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <div className="user-avatar-text">Brian</div>
              <div className="user-avatar">
                <FaUser />
              </div>
            </button>
            {menuOpen && (
              <div className="user-dropdown-menu">
                {isDriver ? (
                  <DriverMenu onNavigate={() => setMenuOpen(false)} />
                ) : (
                  <>
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-name">Brian Oshinbolu</div>
                      <div className="user-dropdown-avatar">
                        <FaUser />
                      </div>
                    </div>
                    <div className="user-dropdown-grid">
                      <Link to="/help" className="user-dropdown-grid-item"><FaRegQuestionCircle /><span>Help</span></Link>
                      <Link to="/wallet" className="user-dropdown-grid-item"><FaWallet /><span>Wallet</span></Link>
                      <Link to="/ride/history" className="user-dropdown-grid-item"><FaHistory /><span>Activity</span></Link>
                    </div>
                    <div className="user-dropdown-divider" />
                    <Link to="/account" className="user-dropdown-item"><FaUserCog /> Manage account</Link>
                    <Link to="/preferences" className="user-dropdown-item"><FaSlidersH /> Preferences</Link>
                    <Link to="/notifications" className="user-dropdown-item"><FaBell /> Notifications</Link>
                    <Link to="/ride" className="user-dropdown-item"><FaCar /> Ride</Link>
                    <Link to="/drive" className="user-dropdown-item"><FaCar /> Drive & deliver</Link>
                    <Link to="/eat" className="user-dropdown-item"><FaUtensils /> Uber Eats</Link>
                    <Link to="/business" className="user-dropdown-item"><FaBriefcase /> Uber for Business</Link>
                    <div className="user-dropdown-divider" />
                    <button className="user-dropdown-item user-dropdown-logout" onClick={() => { setMenuOpen(false); logout(); }}>
                      Sign out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <Link className="nav-btn nav-login" to="/login">Log in</Link>
            <Link className="nav-btn nav-signup" to="/signup">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
