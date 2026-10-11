import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../core/store/useAuthStore';
import './header.css';
import queens_logo_1 from '../../../core/routes/User/queens_logo_1.svg';


                        

/**
 * Header — taxibooking-userapp
 * Sticky glassmorphism header with auth-aware nav.
 * - Logged in: shows profile avatar + dropdown (no login/signup)
 * - Logged out: shows Login + Sign Up buttons
 */
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, fetchUser, token } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Sync user data on mount if token exists
  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  const isLandingPage = location.pathname === '/';

  // Sticky behaviour
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setShowDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const isTransparent = isLandingPage && !scrolled;

  return (
    <header className={`app-header ${scrolled ? 'app-header--scrolled' : ''} ${isTransparent ? 'app-header--transparent' : ''}`}>
      <div className="header-inner">

        {/* ── Logo ─────────────────────────────────────── */}
        <Link to="/" className="header-logo">
          <div className="header-logo-icon">
            <img style={{
                                height: "100px",
                                width: "100px"
                            }} src={queens_logo_1} />
            {/* <i className="bi bi-taxi-front-fill" /> */}
          </div>
          <span className="header-brand">
                {/*old logo*/}
          </span>
        </Link>

        {/* ── Nav links (only shown to logged-out users on landing) ── */}
        {!token && (
          <nav className="header-nav">
            {['Home', 'Features', 'Pricing', 'Support'].map((item) => (
              <Link
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className={`header-nav-link ${isTransparent ? 'header-nav-link--light' : ''}`}
              >
                {item}
              </Link>
            ))}
          </nav>
        )}

        {/* ── Authenticated nav links ───────────────── */}
        {token && (
          <nav className="header-nav">
            <Link to="/dashboard" className={`header-nav-link ${isTransparent ? 'header-nav-link--light' : ''}`}>
              Dashboard
            </Link>
            <Link to="/book-ride" className={`header-nav-link ${isTransparent ? 'header-nav-link--light' : ''}`}>
              Book Ride
            </Link>
            <Link to="/wallet" className={`header-nav-link ${isTransparent ? 'header-nav-link--light' : ''}`}>
              Wallet
            </Link>
            <Link to="/rewards" className={`header-nav-link ${isTransparent ? 'header-nav-link--light' : ''}`}>
               Rewards
             </Link>
          </nav>
        )}

        {/* ── Auth Section ─────────────────────────── */}
        <div className="header-auth">
          {token && user ? (
            /* ── Profile Dropdown ─────────────────── */
            <div className="header-profile" ref={dropdownRef}>
              <button
                id="header-profile-btn"
                className={`header-profile-trigger ${isTransparent ? 'header-profile-trigger--light' : ''}`}
                onClick={() => setShowDropdown((v) => !v)}
                aria-haspopup="true"
                aria-expanded={showDropdown}
              >
                <img
                  src={user.avatar || '/assets/images/avatar.png'}
                  alt={`${user.firstname} avatar`}
                  className="header-avatar"
                />
                <span className="header-profile-name">{user.firstname}</span>
                <i className={`bi ${showDropdown ? 'bi-chevron-up' : 'bi-chevron-down'} header-chevron`} />
              </button>

              {showDropdown && (
                <div className="header-dropdown" role="menu">
                  <div className="header-dropdown-user">
                    <img
                      src={user.avatar || '/assets/images/avatar.png'}
                      alt="avatar"
                      className="header-dropdown-avatar"
                    />
                    <div>
                      <div className="header-dropdown-name">{user.firstname} {user.lastname}</div>
                      <div className="header-dropdown-email">{user.email}</div>
                    </div>
                  </div>

                  <div className="header-dropdown-divider" />

                  <Link to="/dashboard" className="header-dropdown-item" role="menuitem">
                    <i className="bi bi-speedometer2" />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/profile" className="header-dropdown-item" role="menuitem">
                    <i className="bi bi-person-circle" />
                    <span>My Profile</span>
                  </Link>
                  <Link to="/wallet" className="header-dropdown-item" role="menuitem">
                    <i className="bi bi-wallet2" />
                    <span>Wallet</span>
                  </Link>
                  <Link to="/ride-history" className="header-dropdown-item" role="menuitem">
                    <i className="bi bi-clock-history" />
                    <span>Ride History</span>
                  </Link>
                  <Link to="/vouchers" className="header-dropdown-item" role="menuitem">
                    <i className="bi bi-ticket-perforated" />
                    <span>My Vouchers</span>
                  </Link>
                  <Link to="/rewards" className="header-dropdown-item" role="menuitem">
                    <i className="bi bi-star-fill" />
                    <span>Rewards Hub</span>
                  </Link>
                  <Link to="/notifications" className="header-dropdown-item" role="menuitem">
                    <i className="bi bi-bell" />
                    <span>Notifications</span>
                  </Link>

                  <div className="header-dropdown-divider" />

                  <button
                    id="header-logout-btn"
                    className="header-dropdown-item header-dropdown-item--danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <i className="bi bi-box-arrow-right" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : token && !user ? (
            <div className="header-profile-loading">
              <div className="spinner-border spinner-border-sm text-warning" />
            </div>
          ) : (
            /* ── Guest Buttons ────────────────────── */
            <div className="header-guest-actions">
              <Link
                to="/login"
                id="header-login-btn"
                className={`header-login-link ${isTransparent ? 'header-login-link--light' : ''}`}
              >
                Log In
              </Link>
              <Link
                to="/register"
                id="header-signup-btn"
                className="header-signup-btn"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
