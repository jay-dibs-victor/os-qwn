import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import { useUIStore } from '../../../../core/store/useUIStore';
import { useTheme } from '../../../../core/context/ThemeContext';
import './header.css';

/**
 * Header — queens-driverapp
 * Modernized to match user-app aesthetics.
 * - Logged in: shows profile avatar + dropdown (no login/signup)
 * - Logged out: shows Login + Apply to Drive buttons
 */
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, token } = useAuthStore();
  const { walletBalance, notificationCount } = useUIStore();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Sticky behaviour
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
    navigate('/login');
  };

  const authenticated = isAuthenticated();
  const isAuthPage = ['/login', '/signup', '/recovery', '/onboarding'].includes(location.pathname);
  const isTransparent = isAuthPage && !scrolled;

  return (
    <header className={`app-header ${scrolled ? 'app-header--scrolled' : ''} ${isTransparent ? 'app-header--transparent' : ''}`}>
      <div className="header-inner">
        {/* ── Logo ─────────────────────────────────────── */}
        <Link to={authenticated ? "/dashboard" : "/"} className="header-logo">
          <div className="header-logo-icon">
            <i className="md md-local-taxi text-dark"></i>
          </div>
          <span className="header-brand">
            GO<span className="header-brand-accent">DRIVER</span>
          </span>
        </Link>

        {/* ── Driver Nav Links (Optional) ──────────────── */}
        <nav className="header-nav">
          {/* Add nav links if necessary */}
        </nav>

        {/* ── Auth Section / Actions ───────────────────── */}
        <div className="header-auth" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {authenticated ? (
            <>
              {/* Wallet Pill */}
              <div className="wallet-pill hidden-xs" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,184,0,0.1)', padding: '6px 12px', borderRadius: '50px', border: '1px solid rgba(255,184,0,0.3)' }}>
                <i className="md md-account-balance-wallet" style={{ color: '#ffb800', marginRight: '8px', fontSize: '1.2rem' }}></i>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{user?.local_wallet?.symbol || '₦'}{walletBalance || '0.00'}</span>
              </div>

              {/* Notifications */}
              <Link to="/notifications" className="nav-icon position-relative" style={{ color: isTransparent ? '#fff' : '#1a1a1a', textDecoration: 'none', fontSize: '1.4rem' }}>
                <i className="md md-notifications"></i>
                {notificationCount > 0 && (
                  <span className="badge bg-danger rounded-circle position-absolute" style={{ top: '-4px', right: '-8px', fontSize: '0.65rem', padding: '3px 5px' }}>
                    {notificationCount}
                  </span>
                )}
              </Link>

              {/* Profile Dropdown matching User App */}
              <div className="header-profile" ref={dropdownRef}>
                <button
                  id="header-profile-btn"
                  className={`header-profile-trigger ${isTransparent ? 'header-profile-trigger--light' : ''}`}
                  onClick={() => setShowDropdown((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={showDropdown}
                >
                  <img
                    src={user?.profile || '/assets/images/avatar.png'}
                    alt="driver avatar"
                    className="header-avatar"
                  />
                  <span className="header-profile-name">{user?.firstname || 'Driver'}</span>
                  {/* Since driver app uses Material Icons instead of Bootstrap Icons sometimes */}
                  <i className={`md ${showDropdown ? 'md-expand-less' : 'md-expand-more'} header-chevron`} style={{ fontSize: '1rem' }} />
                </button>

                {showDropdown && (
                  <div className="header-dropdown" role="menu">
                    <div className="header-dropdown-user">
                      <img
                        src={user?.profile || '/assets/images/avatar.png'}
                        alt="avatar"
                        className="header-dropdown-avatar"
                      />
                      <div>
                        <div className="header-dropdown-name">{user?.firstname} {user?.lastname}</div>
                        <div className="header-dropdown-email">{user?.email}</div>
                      </div>
                    </div>

                    <div className="header-dropdown-divider" />

                    <Link to="/dashboard" className="header-dropdown-item" role="menuitem">
                      <i className="md md-dashboard" />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/profile" className="header-dropdown-item" role="menuitem">
                      <i className="md md-person" />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/assignedvehiclehistory" className="header-dropdown-item" role="menuitem">
                      <i className="md md-directions-car" />
                      <span>My Vehicles</span>
                    </Link>
                    <Link to="/itinerary-history" className="header-dropdown-item" role="menuitem">
                      <i className="md md-account-balance" />
                      <span>Earnings History</span>
                    </Link>
                    <Link to="/sos-history" className="header-dropdown-item" role="menuitem">
                      <i className="md md-history" />
                      <span>SOS History</span>
                    </Link>
                    <Link to="/faqs" className="header-dropdown-item" role="menuitem">
                      <i className="md md-help" />
                      <span>Help Center</span>
                    </Link>

                    <div className="header-dropdown-divider" />

                    <button
                      className="header-dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTheme();
                      }}
                      role="menuitem"
                      style={{ justifyContent: 'space-between', width: '100%' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <i className={`md ${theme === 'dark' ? 'md-brightness-7' : 'md-brightness-4'}`} />
                        <span>Dark Mode</span>
                      </div>
                      <div style={{
                        width: '32px', height: '18px', borderRadius: '10px',
                        background: theme === 'dark' ? '#FFB800' : '#ddd',
                        position: 'relative', transition: '0.3s'
                      }}>
                        <div style={{
                          width: '14px', height: '14px', borderRadius: '50%', background: 'var(--color-surface)',
                          position: 'absolute', top: '2px', left: theme === 'dark' ? '16px' : '2px',
                          transition: '0.3s'
                        }} />
                      </div>
                    </button>

                    <div className="header-dropdown-divider" />

                    <button
                      id="header-logout-btn"
                      className="header-dropdown-item header-dropdown-item--danger"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <i className="md md-exit-to-app" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="header-guest-actions">
              <Link
                to="/login"
                id="header-login-btn"
                className={`header-login-link ${isTransparent ? 'header-login-link--light' : ''}`}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                id="header-signup-btn"
                className="header-signup-btn"
              >
                Apply to Drive
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
