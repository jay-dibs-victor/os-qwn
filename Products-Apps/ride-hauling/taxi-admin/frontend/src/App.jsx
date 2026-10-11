import React, { useEffect } from 'react';
import { useUIStore } from './enterprise-version/core/store/useUIStore';
import AdminRoutes from './enterprise-version/core/routes/Admin/AdminRoutes';
import RouteLoader from './enterprise-version/core/routes/Admin/RouteLoader';
/**
 * App — taxi-admin
 * Modernized functional component.
 * Replaces legacy AuthProvider and jQuery loader logic.
 */
const App = () => {
  const loaderVisible = useUIStore((state) => state.loaderVisible);
  const hideLoader = useUIStore((state) => state.hideLoader);

  useEffect(() => {
    const timer = setTimeout(() => {
      hideLoader();
    }, 1500);
    return () => clearTimeout(timer);
  }, [hideLoader]);

  return (
    <div className="admin-shell">
      {/* Admin App Loader Overlay */}
      {/* <div className={`app-loader ${!loaderVisible ? 'hidden' : ''}`}>
        <div className="app-loader__spinner"></div>
      </div> */}

      {loaderVisible && <RouteLoader />}

      {!loaderVisible && (
        <div id="admin-wrapper">
          <main className="admin-content">
            <AdminRoutes />
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
