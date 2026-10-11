import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShippingStore } from '../../../core/store/useShippingStore';
import apiClient from '../../../core/api/apiClient';
import FlightMap from '../flightBookings/FlightMap'; // Reusing map component for visual flair
import './shipping.css';

const ShippingTracking = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const { currentShipment, setCurrentShipment, setLoading, setError, isLoading, error } = useShippingStore();
  const [localError, setLocalError] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(true); // Default to full screen like explorer

  useEffect(() => {
    const fetchShipment = async () => {
      setLoading(true);
      setLocalError('');
      try {
        const response = await apiClient.get(`/shipping/${trackingNumber}`);
        if (response.data && response.data.success) {
          setCurrentShipment(response.data.data);
        } else {
          setLocalError('Shipment not found.');
          setCurrentShipment(null);
        }
      } catch (err) {
        setLocalError(err.response?.data?.message || 'Error fetching shipment details.');
        setCurrentShipment(null);
      } finally {
        setLoading(false);
      }
    };

    if (trackingNumber) {
      fetchShipment();
    }
  }, [trackingNumber, setCurrentShipment, setLoading]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'IN_TRANSIT': return 'status-in_transit';
      case 'DELIVERED': return 'status-delivered';
      case 'EXCEPTION': return 'status-exception';
      default: return 'status-default';
    }
  };

  const calculateProgress = () => {
    if (!currentShipment) return 0;
    switch (currentShipment.status) {
      case 'PENDING': return 10;
      case 'IN_TRANSIT': return 50;
      case 'ARRIVED_AT_TERMINAL': return 75;
      case 'OUT_FOR_DELIVERY': return 90;
      case 'DELIVERED': return 100;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8faff' }}>
        <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', borderTop: '4px solid #fbbf24', borderBottom: '4px solid #fbbf24', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#f8faff', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Navbar space */}
      <div style={{ height: '80px' }}></div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {localError && (
          <div className="error-box" style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 50, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            {localError}
          </div>
        )}

        {currentShipment && (
          <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 80px)' }}>
            {/* Background Map */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
               <FlightMap 
                 originCoords={[51.5074, -0.1278]} // Mock coords for visual
                 destCoords={[40.7128, -74.0060]} 
                 style={{ width: '100%', height: '100%' }}
               />
            </div>

            {/* Draggable floating panel */}
            <motion.div
              drag
              dragMomentum={false}
              dragElastic={0.05}
              className="tracking-panel"
              whileDrag={{ cursor: 'grabbing', scale: 1.01, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
            >
              {/* Drag Handle */}
              <div className="drag-handle">
                 <div className="drag-pill"></div>
              </div>

              {/* Panel Content (Scrollable) */}
              <div className="panel-content">
                <button 
                  onClick={() => navigate('/shipping/history')}
                  className="btn btn-secondary"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem', marginBottom: '1.5rem', borderRadius: '0.5rem' }}
                >
                  <svg style={{ width: '1rem', height: '1rem', marginRight: '0.375rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  Back to History
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>{currentShipment.trackingNumber}</h2>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b', marginTop: '0.125rem' }}>Via {currentShipment.carrier}</p>
                  </div>
                  <div className={`status-badge ${getStatusColor(currentShipment.status)}`}>
                    {currentShipment.status.replace(/_/g, ' ')}
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '2rem', paddingTop: '0.5rem', position: 'relative' }}>
                  <div className="progress-track">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress()}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`progress-fill ${getStatusColor(currentShipment.status)}`}
                      style={{ border: 'none' }}
                    ></motion.div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                    <span>Origin</span>
                    <span>Transit</span>
                    <span>Destination</span>
                  </div>
                </div>

                <div className="grid-2" style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>From</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={currentShipment.origin.address}>{currentShipment.origin.address}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>To</p>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={currentShipment.destination.address}>{currentShipment.destination.address}</p>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <svg style={{ width: '1.25rem', height: '1.25rem', color: '#fbbf24', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Audit Log
                </h3>
                
                <div style={{ position: 'relative', paddingLeft: '0.5rem', marginLeft: '0.75rem', borderLeft: '2px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {currentShipment.auditLog && currentShipment.auditLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((log, index) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={index} 
                      style={{ position: 'relative', paddingLeft: '1.5rem' }}
                    >
                      <div style={{ position: 'absolute', left: '-29px', top: '0.25rem', width: '1rem', height: '1rem', borderRadius: '50%', border: '4px solid #ffffff', background: index === 0 ? '#fbbf24' : '#cbd5e1' }}></div>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.125rem', color: index === 0 ? '#0f172a' : '#475569' }}>{log.status.replace(/_/g, ' ')}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>{log.description}</p>
                        <p style={{ fontSize: '0.625rem', fontWeight: 500, color: '#94a3b8' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingTracking;
