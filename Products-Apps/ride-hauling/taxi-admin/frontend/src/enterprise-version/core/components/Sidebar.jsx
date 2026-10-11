import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import './components.css';

/**
 * SidebarItem — Nav link utility with active state
 */
const SidebarItem = ({ to, icon, label, active, onClick }) => (
  <Link 
    to={to} 
    className={`nav-item-premium ${active ? 'active' : ''}`}
    onClick={onClick}
  >
    <i className={`bi ${icon}`}></i>
    <span className="nav-label">{label}</span>
  </Link>
);

/**
 * SidebarSection — Visual separator for nav groups
 */
const SidebarSection = ({ title }) => (
  <div className="nav-section-title">{title}</div>
);

/**
 * Sidebar — High-fidelity administration navigation
 * Supports collapsing, mobile overlays, and premium dark-mode aesthetics.
 */
export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`admin-sidebar glass-dark ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">G</div>
          <div className="brand-text">
            GoomTaxi <span className="text-primary-light">ADM</span>
          </div>
        </div>
        <button className="sidebar-close-mobile" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <nav className="sidebar-nav custom-scrollbar">
        <SidebarSection title="Insights" />
        <SidebarItem 
          to="/dashboard" 
          icon="bi-grid-1x2-fill" 
          label="Dashboard" 
          active={isActive('/dashboard')} 
        />

        <SidebarSection title="Core Management" />
        <SidebarItem 
          to="/manage-users" 
          icon="bi-people-fill" 
          label="Users" 
          active={isActive('/manage-users')} 
        />
        <SidebarItem 
          to="/manage-drivers" 
          icon="bi-person-badge-fill" 
          label="Drivers" 
          active={isActive('/manage-drivers')} 
        />
        <SidebarItem 
          to="/manage-partners" 
          icon="bi-building-fill-check" 
          label="Fleet Partners" 
          active={isActive('/manage-partners')} 
        />

        <SidebarSection title="Operations" />
        <SidebarItem 
          to="/manage-cars" 
          icon="bi-car-front-fill" 
          label="Vehicles Mgt" 
          active={isActive('/manage-cars')} 
        />
        <SidebarItem 
          to="/manage-inspections" 
          icon="bi-clipboard-check-fill" 
          label="Inspections" 
          active={isActive('/manage-inspections')} 
        />
        <SidebarItem 
          to="/manage-bookings" 
          icon="bi-calendar-check-fill" 
          label="Live Bookings" 
          active={isActive('/manage-bookings')} 
        />

        <SidebarSection title="Financials" />
        <SidebarItem 
          to="/wallet-history" 
          icon="bi-wallet2" 
          label="Wallet Ledger" 
          active={isActive('/wallet-history')} 
        />
        <SidebarItem 
          to="/manage-plans" 
          icon="bi-card-list" 
          label="Subscription Plans" 
          active={isActive('/manage-plans')} 
        />
        <SidebarItem 
          to="/manage-earnings" 
          icon="bi-cash-stack" 
          label="Revenue Logs" 
          active={isActive('/manage-earnings')} 
        />

        <SidebarSection title="Resources & Support" />
        <SidebarItem 
          to="/manage-sos" 
          icon="bi-exclamation-triangle-fill" 
          label="SOS Alerts" 
          active={isActive('/manage-sos')} 
        />
        <SidebarItem 
          to="/manage-tickets" 
          icon="bi-ticket-detailed-fill" 
          label="Support Tickets" 
          active={isActive('/manage-tickets')} 
        />
        <SidebarItem 
          to="/manage-faqs" 
          icon="bi-question-circle-fill" 
          label="Help Center" 
          active={isActive('/manage-faqs')} 
        />

        <SidebarSection title="Security & Governance" />
        <SidebarItem 
          to="/manage-admins" 
          icon="bi-shield-lock-fill" 
          label="Staff Directory" 
          active={isActive('/manage-admins')} 
        />
        <SidebarItem 
          to="/manage-privileges" 
          icon="bi-key-fill" 
          label="RBAC Settings" 
          active={isActive('/manage-privileges')} 
        />
        <SidebarItem 
          to="/audit-logs" 
          icon="bi-journal-text" 
          label="Audit Trail" 
          active={isActive('/audit-logs')} 
        />

        <SidebarSection title="Global" />
        <SidebarItem 
          to="/settings" 
          icon="bi-gear-fill" 
          label="Configuration" 
          active={isActive('/settings')} 
        />
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <i className="bi bi-power"></i>
          <span>Revoke Session</span>
        </button>
      </div>
    </aside>
  );
}
