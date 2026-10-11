import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Phone, MessageCircle, MapPin, Clock, Package, CheckCircle, AlertCircle, Truck } from 'lucide-react';
import { useUIStore } from '../../../core/store/useUIStore';

const CourierTracking = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [shipment, setShipment] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);
  const [routePath, setRoutePath] = useState([]);

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
        const response = await fetch(`${API_URL}/courier/shipments/${trackingId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setShipment(data);
          if (data.driver) {
            setDriver(data.driver);
            setDriverLocation([data.driver.location?.coordinates[1], data.driver.location?.coordinates[0]]);
          }
        } else {
          addToast('Shipment not found', 'error');
          navigate('/courier');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        addToast('Error loading shipment', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchShipment, 5000);
    return () => clearInterval(interval);
  }, [trackingId]);

  // Simulate route path
  useEffect(() => {
    if (shipment?.pickupCoords && shipment?.dropoffCoords && driverLocation) {
      setRoutePath([
        driverLocation,
        [shipment.pickupCoords.lat, shipment.pickupCoords.lng],
        [shipment.dropoffCoords.lat, shipment.dropoffCoords.lng]
      ]);
    }
  }, [shipment, driverLocation]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#fbbf24';
      case 'accepted': return '#3b82f6';
      case 'in_transit': return '#667eea';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'in_transit': return '🚚';
      case 'delivered': return '📦';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const statusSteps = [
    { status: 'pending', label: 'Order Placed', icon: '📋' },
    { status: 'accepted', label: 'Driver Accepted', icon: '✅' },
    { status: 'in_transit', label: 'In Transit', icon: '🚚' },
    { status: 'delivered', label: 'Delivered', icon: '📦' }
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📦</div>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '20px' }} />
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Shipment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '30px' }}>
          <button 
            onClick={() => navigate('/courier')}
            style={{ background: 'none', border: 'none', color: '#667eea', fontSize: '1rem', cursor: 'pointer', marginBottom: '20px' }}
          >
            ← Back to Courier
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 5px 0' }}>Tracking #{trackingId}</h1>
              <p style={{ color: '#64748b', margin: 0 }}>Status: <span style={{ fontWeight: 600, color: getStatusColor(shipment.status) }}>{shipment.status?.toUpperCase()}</span></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 5px 0' }}>Estimated Delivery</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Today, 5:30 PM</p>
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* LEFT: Map & Driver Info */}
          <div>
            {/* Map */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '400px' }}>
              <MapContainer center={[6.5244, 3.3792]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png" />
                {driverLocation && <Marker position={driverLocation} />}
                {shipment.pickupCoords && <Marker position={[shipment.pickupCoords.lat, shipment.pickupCoords.lng]} />}
                {shipment.dropoffCoords && <Marker position={[shipment.dropoffCoords.lat, shipment.dropoffCoords.lng]} />}
                {routePath.length > 0 && <Polyline positions={routePath} color="#667eea" weight={4} opacity={0.7} />}
              </MapContainer>
            </motion.div>

            {/* Driver Info */}
            {driver && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', color: '#0f172a' }}>Your Driver</h3>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                  <img src={driver.avatar || '/assets/images/avatar.png'} alt={driver.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{driver.name}</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '5px 0 0 0' }}>⭐ {driver.rating || 4.8} • {driver.trips || 250} trips</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <motion.button whileHover={{ scale: 1.05 }} style={{ flex: 1, padding: '10px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Phone size={16} /> Call
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} style={{ flex: 1, padding: '10px', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <MessageCircle size={16} /> Message
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT: Details & Timeline */}
          <div>
            {/* Package Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', color: '#0f172a' }}>Package Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Type</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{shipment.packageType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Weight</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{shipment.weight} kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Description</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{shipment.description}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Insurance</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{shipment.insurance ? '✓ Covered' : 'Not covered'}</span>
                </div>
              </div>
            </motion.div>

            {/* Locations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', color: '#0f172a' }}>Locations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0' }}>📍 Pickup</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{shipment.pickupAddress}</p>
                </div>
                <div style={{ height: '1px', background: '#e2e8f0' }} />
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0' }}>📍 Dropoff</p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{shipment.dropoffAddress}</p>
                </div>
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: '#0f172a' }}>Delivery Timeline</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {statusSteps.map((step, index) => {
                  const isCompleted = statusSteps.findIndex(s => s.status === shipment.status) >= index;
                  const isCurrent = step.status === shipment.status;
                  
                  return (
                    <div key={step.status} style={{ display: 'flex', gap: '15px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: isCompleted ? '#10b981' : isCurrent ? '#667eea' : '#e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          color: isCompleted || isCurrent ? '#fff' : '#64748b'
                        }}>
                          {isCompleted ? '✓' : step.icon}
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div style={{
                            width: '2px',
                            height: '40px',
                            background: isCompleted ? '#10b981' : '#e2e8f0',
                            margin: '5px 0'
                          }} />
                        )}
                      </div>
                      <div style={{ paddingTop: '5px' }}>
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: isCurrent ? '#667eea' : isCompleted ? '#10b981' : '#64748b', margin: 0 }}>
                          {step.label}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '3px 0 0 0' }}>
                          {isCurrent ? 'In progress' : isCompleted ? 'Completed' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierTracking;
