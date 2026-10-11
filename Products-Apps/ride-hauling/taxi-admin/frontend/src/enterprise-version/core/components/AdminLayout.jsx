import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './components.css';

/**
 * AdminLayout — GoomTaxi
 * Core structural wrapper providing sidebar toggle, global header, 
 * and dynamic content outlet with premium transition effects.
 */
export default function AdminLayout() {
  // Sidebar state: defaults to open on desktop, closed on mobile
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const location = useLocation();

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle window resize for responsive defaults
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`admin-layout ${!isSidebarOpen ? 'sidebar-collapsed' : 'sidebar-open'}`}>
      {/* Mobile Backdrop */}
      <div className="sidebar-overlay" onClick={closeSidebar}></div>

      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Global Header */}
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Dynamic Page Content */}
        <main className="admin-content custom-scrollbar">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Optional: Global Footer / Status Bar can be added here */}
      </div>
    </div>
  );
}
