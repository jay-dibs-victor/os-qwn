import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import { useUIStore } from '../../../../core/store/useUIStore';

/**
 * AdminHeader — taxi-admin
 * Modernized with Premium Yellow & Dark theme.
 * features: Sleek topbar with glassmorphism, profile dropdown, and global state integration.
 */
const AdminHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'md-dashboard' },
    { label: 'Users', path: '/manage-users', icon: 'md-people' },
    { label: 'Drivers', path: '/manage-drivers', icon: 'md-local-taxi' },
    { label: 'Bookings', path: '/manage-bookings', icon: 'md-event-available' },
    { label: 'Fleet', path: '/manage-cars', icon: 'md-directions-car' },
    { label: 'Settings', path: '/settings', icon: 'md-settings' },
  ];

  return (
    <header className="app-header glass-dark m-15" style={{ borderRadius: '16px', border: '1px solid rgba(255,184,0,0.1)', position: 'sticky', top: '15px', zIndex: 1000, color: '#fff' }}>
      <div className="container-fluid p-10 flex-row items-center justify-between">
        {/* Left: Branding */}
        <div className="flex-row items-center">
          <Link to="/dashboard" className="brand-logo flex-row items-center no-decoration">
            <div className="logo-icon bg-primary m-r-10 flex-row items-center justify-center shadow-sm" style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFB800' }}>
              <i className="md md-security font-20 text-dark"></i>
            </div>
            <span className="font-18 font-bold text-white hidden-xs">
              GOOM<span className="text-primary" style={{ color: '#FFB800' }}>ADMIN</span>
            </span>
          </Link>

          <div className="vertical-divider m-l-20 m-r-20 hidden-xs" style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>

          {/* Persistent Nav Links (Top-level) */}
          <nav className="hidden-sm hidden-xs">
            <ul className="flex-row list-none m-0 p-0">
              {menuItems.slice(0, 4).map((item) => (
                <li key={item.path} className="m-r-20">
                  <Link 
                    to={item.path} 
                    className="font-13 font-semibold text-white no-decoration hover-primary transition-fast"
                    style={{ opacity: 0.8 }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex-row items-center">
          {/* Quick Stats / Info */}
          <div className="status-pill glass m-r-20 hidden-xs p-5 p-l-15 p-r-15 flex-row items-center" style={{ borderRadius: '50px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="font-11 font-bold text-muted uppercase m-r-10">System Status:</span>
            <span className="font-11 font-bold text-success flex-row items-center">
              <span className="pulse-dot m-r-5" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ed573' }}></span>
              Online
            </span>
          </div>

          {/* User Profile */}
          <div className="relative">
            <div 
              className="flex-row items-center cursor-pointer p-5" 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              style={{ borderRadius: '50px', border: '1px solid rgba(255,184,0,0.2)', background: 'rgba(255,184,0,0.05)' }}
            >
              <img src="/avatar-admin.png" alt="admin-img" className="img-circle" style={{ width: '30px', height: '30px' }} />
              <span className="m-l-10 m-r-5 text-white font-13 font-bold hidden-xs">{user?.firstname || 'Admin'}</span>
              <i className={`md ${showProfileDropdown ? 'md-expand-less' : 'md-expand-more'} text-muted`}></i>
            </div>

            {showProfileDropdown && (
              <div className="dropdown-menu-custom animated fadeIn shadow-lg p-10" style={{ position: 'absolute', top: '100%', right: 0, width: '200px', background: '#222', borderRadius: '12px', marginTop: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <li>
                  <Link to="/admin-profile" className="flex-row items-center p-10 text-white no-decoration hover-bg-dark" style={{ borderRadius: '8px' }}>
                    <i className="md md-face-unlock m-r-10 text-primary" style={{ color: '#FFB800' }}></i> Profile
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="flex-row items-center p-10 text-white no-decoration hover-bg-dark" style={{ borderRadius: '8px' }}>
                    <i className="md md-settings m-r-10 text-primary" style={{ color: '#FFB800' }}></i> Settings
                  </Link>
                </li>
                <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '5px 0' }} />
                <li>
                  <button onClick={handleLogout} className="btn-link flex-row items-center p-10 text-danger w-full text-left no-decoration transition-fast" style={{ borderRadius: '8px' }}>
                    <i className="md md-settings-power m-r-10"></i> Logout
                  </button>
                </li>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
