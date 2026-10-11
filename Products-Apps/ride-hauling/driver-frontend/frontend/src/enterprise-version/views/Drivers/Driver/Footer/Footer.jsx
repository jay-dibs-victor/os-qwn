import React from 'react';
import './footer.css';

/**
 * Footer — queens-driverapp
 * Simplified functional component.
 */
const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer-container">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 text-center">
            <p className="footer-text">
              &copy; {year} <b>Goom Logistics</b>. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
