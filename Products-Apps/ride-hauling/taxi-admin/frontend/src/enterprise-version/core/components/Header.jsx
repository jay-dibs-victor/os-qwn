import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import './components.css';

/**
 * Utility to map routes to descriptive titles
 */
const getPageTitle = (pathname) => {
  const titles = {
    '/dashboard': 'Dashboard Overview',
    '/manage-users': 'User Management',
    '/manage-drivers': 'Driver Fleet',
    '/manage-admins': 'Staff Directory',
    '/manage-privileges': 'RBAC Control',
    '/manage-cars': 'Vehicle Inventory',
    '/manage-inspections': 'Asset Audits',
    '/manage-bookings': 'Live Bookings',
    '/wallet-history': 'Financial Ledger',
    '/manage-plans': 'Service Packages',
    '/manage-sos': 'Emergency Alerts',
    '/manage-tickets': 'Support Tickets',
    '/manage-faqs': 'Knowledge Base',
    '/audit-logs': 'System Audit Trail',
    '/settings': 'Global Configurations',
  };
  return titles[pathname] || 'Admin Portal';
};

/**
 * Header — GoomTaxi Admin Top Navigation
 * Featuring toggle controls, search, notifications, and live status.
 */
export default function Header({ onToggleSidebar, isSidebarOpen }) {
  const location = useLocation();
  const { user } = useAuthStore();
  const title = getPageTitle(location.pathname);
  
  // Live clock state
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="admin-topbar glass">
      <div className="topbar-left">
        <button 
          className={`sidebar-toggle-btn ${!isSidebarOpen ? 'collapsed' : ''}`} 
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <i className={`bi ${isSidebarOpen ? 'bi-text-indent-left' : 'bi-text-indent-right'}`}></i>
        </button>
        <div className="header-breadcrumbs">
          <span className="breadcrumb-sub">Administration /</span>
          <h4 className="breadcrumb-current">{title}</h4>
        </div>
      </div>

      <div className="topbar-center d-none d-lg-flex">
        <div className="search-field">
          <i className="bi bi-search"></i>
          <input 
            type="text" 
            className="input-premium" 
            placeholder="Search resources, users, or tickets..." 
          />
        </div>
      </div>

      <div className="topbar-right">
        <div className="status-clock d-none d-md-flex">
          <i className="bi bi-clock"></i>
          <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="header-actions">
          <div className="action-icon-wrapper">
            <i className="bi bi-bell"></i>
            <span className="notification-indicator"></span>
          </div>
        </div>

        <div className="user-profile-trigger">
          <div className="user-identity d-none d-sm-block">
            <div className="user-name">{user?.firstname || 'System'} {user?.lastname || 'Admin'}</div>
            <div className="user-role">{user?.role || 'Super Administrator'}</div>
          </div>
          <div className="avatar-rounded">
            {user?.avatar ? (
              <img src={user.avatar} alt="P" />
            ) : (
              (user?.firstname?.[0] || 'A').toUpperCase()
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
