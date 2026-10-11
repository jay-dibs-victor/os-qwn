import React from 'react';
import { Card } from '../../core/components';
import LiveMap from './LiveMap';

/**
 * EmbedMap — GoomTaxi Admin
 * High-fidelity live operational map for fleet and trip management.
 */
const EmbedMap = () => {
  return (
    <div className="animate-fade-in dashboard-map-view">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-overline uppercase tracking-widest font-10 text-primary">Operational Intelligence</span>
          <h2 className="fw-800 m-0 text-dark">Fleet Live Observatory</h2>
        </div>
        <div className="d-flex align-items-center gap-2">
           <div className="search-box-map glass-morphism d-flex align-items-center px-3 py-1 rounded-pill">
              <i className="bi bi-search font-12 text-muted me-2"></i>
              <input type="text" placeholder="Search vehicle or ID..." className="border-0 bg-transparent font-12 outline-none" style={{ width: 150 }} />
           </div>
          <span className="badge bg-success px-3 rounded-pill font-11 fw-700 shadow-sm border border-white-20">
            <i className="bi bi-circle-fill me-1 pulse" style={{ fontSize: 6 }}></i> LIVE
          </span>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-xl border-0 glass-morphism" style={{ height: '80vh' }}>
        <div className="p-3 border-bottom bg-white-50 backdrop-blur d-flex justify-content-between align-items-center">
          <div className="d-flex gap-4">
            <div className="d-flex align-items-center gap-2 font-12 fw-700">
              <span className="status-dot bg-primary shadow-primary"></span> Drivers
            </div>
            <div className="d-flex align-items-center gap-2 font-12 fw-700">
              <span className="status-dot bg-success shadow-success"></span> Riders
            </div>
            <div className="d-flex align-items-center gap-2 font-12 fw-700">
              <span className="status-dot bg-purple shadow-purple"></span> Active Trips
            </div>
          </div>
          <div className="d-flex gap-2">
             <button className="btn btn-sm btn-light font-11 fw-700 rounded-pill px-3 border"><i className="bi bi-funnel me-1"></i> Filters</button>
             <button className="btn btn-sm btn-dark font-11 fw-700 rounded-pill px-3"><i className="bi bi-layers me-1"></i> Layers</button>
          </div>
        </div>
        
        <LiveMap />
      </Card>

      <style dangerouslySetInnerHTML={{ __html: `
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .shadow-primary { box-shadow: 0 0 8px #3b82f6; }
        .shadow-success { box-shadow: 0 0 8px #10b981; }
        .shadow-purple { box-shadow: 0 0 8px #8b5cf6; }
        .pulse { animation: pulse 1.5s infinite; }
        @keyframes pulse { 
           0% { opacity: 0.4; } 
           50% { opacity: 1; }
           100% { opacity: 0.4; }
        }
      `}} />
    </div>
  );
};

export default EmbedMap;
