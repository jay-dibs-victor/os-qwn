import React, { useEffect } from 'react';

const MAP = () => {
  return (
    <div className="map-page py-5 mt-5">
      <div className="container">
        
        <div className="row mb-4">
          <div className="col-12">
             <h2 className="fw-bold">Live Tracking</h2>
             <p className="text-muted">Track your vehicle via GPS</p>
          </div>
        </div>

        <div className="card shadow-sm border-0" style={{ borderRadius: '24px', overflow: 'hidden' }}>
          <div id="map" style={{ minHeight: '600px', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="text-center text-muted">
               <i className="bi bi-map display-1 d-block mb-3 opacity-25"></i>
               Map container ready for Google Maps integration
            </div>
          </div>
          <p id="info" className="info d-none"></p>
        </div>

      </div>
    </div>
  );
};

export default MAP;
