import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUIStore } from './enterprise-version/core/store/useUIStore';
import { useAuthStore } from './enterprise-version/core/store/useAuthStore';
import AuthGuard from './enterprise-version/core/routes/AuthGuard';

// Views
import Header from './enterprise-version/views/Drivers/Driver/Header/Header';
import Footer from './enterprise-version/views/Drivers/Driver/Footer/Footer';
import DriverRoutes from './enterprise-version/core/routes/Driver/DriverRoutes';

// Replaces the old class component with functional pattern
// Removes all jQuery $(document).ready and #loader animation triggers
// Uses Zustand useUIStore for the loading state
const App = () => {
  const loaderVisible = useUIStore((state) => state.loaderVisible);
  const hideLoader = useUIStore((state) => state.hideLoader);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  useEffect(() => {
    // Artificial delay to simulate the old loader behavior but cleaner
    const timer = setTimeout(() => {
      hideLoader();
    }, 1500);
    return () => clearTimeout(timer);
  }, [hideLoader]);

  return (
    <div className="app-shell">
      {/* App Loader Overlay — styled in index.css */}
      <div className={`app-loader ${!loaderVisible ? 'hidden' : ''}`}>
        <div className="app-loader__spinner"></div>
      </div>

      {!loaderVisible && (
        <>
          <Header />
          <main className="app-content">
            <DriverRoutes />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
};

export default App;
