import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationSearch from '../../../core/components/LocationSearch';
import UniversalMap from '../../../core/components/UniversalMap';

const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const IconBolt = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFB800" stroke="none">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconChevronUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FloatingCard = ({ title, children, defaultCollapsed = false, draggable = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <motion.div 
      className={`floating-stack-card ${isCollapsed ? 'collapsed' : ''}`}
      layout
    >
      <div className="card-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <span className="card-title">{title}</span>
        <div className="card-toggle">
          {isCollapsed ? <IconChevronDown /> : <IconChevronUp />}
        </div>
      </div>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            className="card-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FloatingActionStack = ({ 
  wizardStep, 
  pickup, setPickup, 
  destination, setDestination, 
  routeResult, 
  isEstimating, 
  estimatedFare, 
  currency,
  handleRequestRide, 
  setWizardStep,
  assignedDriver,
  rideStatus,
  liveFare,
  routePath,
  markers
}) => {
  console.log("FloatingActionStack rendering, wizardStep:", wizardStep);
  return (
    <motion.div 
      className="floating-action-stack"
      drag
      dragMomentum={false}
      initial={{ x: 10, y: 80 }}
      style={{ 
        position: 'fixed', 
        zIndex: 10001, 
        width: '320px',
        top: 0,
        left: 0,
        pointerEvents: 'auto'
      }}
    >
      <div className="drag-handle-main" title="Drag to move stack">
        <div className="drag-handle-bar" />
        <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase' }}>Drag to Move</span>
      </div>

      <div className="stack-items">
        {/* Step 2: Route & Fare */}
        {(wizardStep === 2 || wizardStep === 3) && (
          <>
            <FloatingCard title="Trip Route">
              <div className="mini-route-inputs">
                <div className="mini-input-row">
                  <div className="mini-dot pickup" />
                  <LocationSearch
                    placeholder="Pickup"
                    value={pickup.address}
                    onLocationSelect={setPickup}
                    className="mini-input"
                  />
                </div>
                <div className="mini-input-row">
                  <div className="mini-dot destination" />
                  <LocationSearch
                    placeholder="Destination"
                    value={destination?.address || ''}
                    onLocationSelect={setDestination}
                    className="mini-input"
                  />
                </div>
              </div>
            </FloatingCard>

            <FloatingCard title="Distance & Map">
              <div className="mini-metrics">
                <div className="metric">
                  <span className="label">Distance</span>
                  <span className="value">{routeResult?.distance?.toFixed(1) || '0.0'} km</span>
                </div>
                <div className="metric">
                  <span className="label">Est. Time</span>
                  <span className="value">{routeResult?.duration || '0 mins'}</span>
                </div>
              </div>
              <div className="mini-map-box">
                <UniversalMap 
                  center={[pickup?.lat || 6.5244, pickup?.lng || 3.3792]}
                  zoom={14}
                  routePath={routePath}
                  markers={markers}
                  style={{ height: '120px', width: '100%' }}
                />
              </div>
            </FloatingCard>

            <FloatingCard title="Estimated Fare">
              <div className="mini-fare-card">
                <div className="fare-info">
                  <span className="label">Total</span>
                  <span className="value">{currency}{estimatedFare.toLocaleString()}</span>
                </div>
                {wizardStep === 2 ? (
                   <button className="mini-action-btn" onClick={() => setWizardStep(3)}>Continue</button>
                ) : (
                   <button className="mini-action-btn confirm" onClick={handleRequestRide}>Book Now</button>
                )}
              </div>
            </FloatingCard>
          </>
        )}

        {/* Step 1: Booking Type */}
        {wizardStep === 1 && (
          <FloatingCard title="Select Service">
             <div className="mini-service-options">
                <div className="mini-service-item" onClick={() => setWizardStep(2)}>
                   <IconBolt />
                   <span>Quick Ride</span>
                </div>
             </div>
          </FloatingCard>
        )}

        {/* Step 5: Active Trip */}
        {wizardStep === 5 && assignedDriver && (
           <FloatingCard title="Active Trip">
              <div className="mini-driver-info">
                 <div className="driver-header">
                    <strong>{assignedDriver.driver_name}</strong>
                    <span>{rideStatus}</span>
                 </div>
                 <div className="mini-fare-display">
                    {currency}{liveFare.toLocaleString()}
                 </div>
              </div>
           </FloatingCard>
        )}

        {/* Fallback / Debug Card */}
        {![1, 2, 3, 5].includes(wizardStep) && (
          <FloatingCard title="Trip Info">
             <div style={{ textAlign: 'center', padding: '10px' }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 700 }}>Processing Trip Step {wizardStep}...</p>
                <div className="loading-spinner" style={{ margin: '10px auto' }} />
             </div>
          </FloatingCard>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .floating-action-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: auto;
        }
        .drag-handle-main {
          height: 24px;
          background: rgba(255, 184, 0, 0.9);
          border-radius: 12px 12px 0 0;
          cursor: grab;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          box-shadow: 0 2px 10px rgba(255,184,0,0.2);
        }
        .drag-handle-bar {
          width: 30px;
          height: 3px;
          background: rgba(0,0,0,0.2);
          border-radius: 2px;
        }
        .floating-stack-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: all 0.2s;
        }
        .floating-stack-card.collapsed {
          opacity: 0.8;
        }
        .card-header {
          padding: 10px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          background: rgba(0,0,0,0.02);
        }
        .card-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #666;
        }
        .card-body {
          padding: 12px;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .mini-route-inputs {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mini-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mini-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .mini-dot.pickup { background: #34a853; }
        .mini-dot.destination { background: #ea4335; }
        .mini-input {
          font-size: 12px;
          font-weight: 600;
          border: none;
          background: transparent;
          width: 100%;
          outline: none;
        }
        .mini-metrics {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .mini-metrics .metric {
          text-align: center;
        }
        .mini-metrics .label {
          display: block;
          font-size: 9px;
          color: #999;
          font-weight: 700;
          text-transform: uppercase;
        }
        .mini-metrics .value {
          font-size: 13px;
          font-weight: 800;
          color: #333;
        }
        .mini-map-box {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #eee;
        }
        .mini-fare-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mini-fare-card .label {
          display: block;
          font-size: 9px;
          color: #999;
          font-weight: 700;
        }
        .mini-fare-card .value {
          font-size: 18px;
          font-weight: 900;
          color: #FFB800;
        }
        .mini-action-btn {
          background: #1a1a1a;
          color: #fff;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }
        .mini-action-btn.confirm {
          background: #FFB800;
          color: #1a1a1a;
        }
        .mini-service-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: #f8f8f8;
          border-radius: 12px;
          cursor: pointer;
        }
        .mini-service-item span {
          font-weight: 700;
          font-size: 13px;
        }
        .mini-driver-info {
           display: flex;
           justify-content: space-between;
           align-items: center;
        }
        .driver-header {
           display: flex;
           flex-direction: column;
        }
        .driver-header strong { font-size: 13px; }
        .driver-header span { font-size: 10px; color: #34a853; font-weight: 700; }
        .mini-fare-display {
           font-size: 16px;
           font-weight: 900;
           color: #FFB800;
        }
      `}} />
    </motion.div>
  );
};

export default FloatingActionStack;
