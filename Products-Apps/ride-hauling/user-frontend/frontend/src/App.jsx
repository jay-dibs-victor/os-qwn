import React, { useEffect } from 'react';
import { useUIStore } from './enterprise-version/core/store/useUIStore';
import Header from './enterprise-version/views/User/Header/Header';
import Footer from './enterprise-version/views/User/Footer/Footer';
import UserRoutes from './enterprise-version/core/routes/User/UserRoutes';
import queens_logo_1 from './enterprise-version/core/routes/User/queens_logo_1.svg';
import AuthModal from './enterprise-version/core/components/AuthModal';
import ToastContainer from './enterprise-version/core/components/ToastContainer';
import { useLocation } from 'react-router-dom';

import NavBar2 from "./enterprise-version/core/components/NavBar.jsx";
import Footer2 from "./enterprise-version/core/components/Footer.jsx";

import "./styles.css"

// import "./index.css"
/**
 * App — taxibooking-userapp
 * Refactored to a functional component.
 * Removes legacy jQuery and vanilla JS logic.
 */
const App = () => {
  const loaderVisible = useUIStore((state) => state.loaderVisible);
  const hideLoader = useUIStore((state) => state.hideLoader);
  const location = useLocation();

  useEffect(() => {
    // Artificial delay to simulate the old loader behavior but cleaner
    const timer = setTimeout(() => {
      hideLoader();
    }, 1500);
    return () => clearTimeout(timer);
  }, [hideLoader]);

  return (
    <div className="app-shell">
      {/* App Loader Overlay */}
      {/* <div className={`app-loader ${!loaderVisible ? 'hidden' : ''}`}>
        <div className="app-loader__spinner"></div>
      </div> */}
      <div className={`app-loader ${!loaderVisible ? 'hidden' : ''}`}>
        <div className="app-loader__indicator">
          <img src={queens_logo_1} alt="Queens Logo" />
        </div>
      </div>

      {!loaderVisible && (
        <>
          <NavBar2 />  {/* .  <Header />    */}




          <main className={(location.pathname.startsWith('/ride') || location.pathname.startsWith('/drive')) ? "app-content portal-content" : "app-content page-content"}>
            <UserRoutes />
          </main>



          <Footer />
          <AuthModal />
          <ToastContainer />



        </>
      )}
    </div>
  );
};

export default App;
