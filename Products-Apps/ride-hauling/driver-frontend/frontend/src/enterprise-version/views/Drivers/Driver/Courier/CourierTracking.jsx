import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Phone, MessageCircle, MapPin, Package, CheckCircle, Camera, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../../../core/store/useUIStore';
import { useSocket } from '../../../../core/context/SocketContext';

const CourierTracking = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const { socket } = useSocket();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState([6.5244, 3.3792]);
  const [routePath, setRoutePath] = useState([]);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofData, setProofData] = useState({
    recipientName: '',
    otp: '',
    notes: '',
    photo: null
  });

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
        const response = await fetch(`${API_URL}/courier/shipments/${shipmentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setShipment(data);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
    const interval = setInterval(fetchShipment, 5000);
    return () => clearInterval(interval);
  }, [shipmentId]);

  // Watch driver location
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const newLocation = [pos.coords.latitude, pos.coords.longitude];
        setDriverLocation(newLocation);
        
        // Emit location update via Socket.io
        if (socket) {
          socket.emit('driver-location-update', {
            shipmentId,
            location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
          });
        }
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [shipmentId, socket]);

  // Build route path
  useEffect(() => {
    if (shipment?.pickupCoords && shipment?.dropoffCoords && driverLocation) {
      setRoutePath([
        driverLocation,
        [shipment.pickupCoords.lat, shipment.pickupCoords.lng],
        [shipment.dropoffCoords.lat, shipment.dropoffCoords.lng]
      ]);
    }
  }, [shipment, driverLocation]);

  const handleMarkPickedUp = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
      const response = await fetch(`${API_URL}/courier/shipments/${shipmentId}/pickup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setShipment(prev => ({ ...prev, status: 'in_transit' }));
        addToast('Package picked up!', 'success');
        
        if (socket) {
          socket.emit('shipment-status-update', { shipmentId, status: 'in_transit' });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to update status', 'error');
    }
  };

  const handleSubmitProof = async () => {
    if (!proofData.recipientName || !proofData.otp) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('recipientName', proofData.recipientName);
      formData.append('otp', proofData.otp);
      formData.append('notes', proofData.notes);
      if (proofData.photo) {
        formData.append('photo', proofData.photo);
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
      const response = await fetch(`${API_URL}/courier/shipments/${shipmentId}/deliver`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        setShipment(prev => ({ ...prev, status: 'delivered' }));
        addToast('Delivery confirmed!', 'success');
        setShowProofModal(false);
        
        if (socket) {
          socket.emit('shipment-status-update', { shipmentId, status: 'delivered' });
        }

        setTimeout(() => navigate('/courier-requests'), 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to submit delivery proof', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📦</div>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading shipment...</p>
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
            onClick={() => navigate('/courier-requests')}
            style={{ background: 'none', border: 'none', color: '#667eea', fontSize: '1rem', cursor: 'pointer', marginBottom: '20px' }}
          >
            ← Back to Requests
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 5px 0' }}>Delivery #{shipmentId}</h1>
              <p style={{ color: '#64748b', margin: 0 }}>Status: <span style={{ fontWeight: 600, color: '#667eea' }}>{shipment.status?.toUpperCase()}</span></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 5px 0' }}>Earnings</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', margin: 0 }}>₦{shipment.totalPrice?.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          
          {/* LEFT: Map */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: '500px' }}>
            <MapContainer center={driverLocation} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png" />
              <Marker position={driverLocation} />
              {shipment.pickupCoords && <Marker position={[shipment.pickupCoords.lat, shipment.pickupCoords.lng]} />}
              {shipment.dropoffCoords && <Marker position={[shipment.dropoffCoords.lat, shipment.dropoffCoords.lng]} />}
              {routePath.length > 0 && <Polyline positions={routePath} color="#667eea" weight={4} opacity={0.7} />}
            </MapContainer>
          </motion.div>

          {/* RIGHT: Details & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Package Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', color: '#0f172a' }}>Package Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Type</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{shipment.packageType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Weight</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{shipment.weight} kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Description</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{shipment.description}</span>
                </div>
              </div>
            </motion.div>

            {/* Recipient Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', color: '#0f172a' }}>Recipient</h3>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 5px 0' }}>{shipment.recipientName}</p>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 10px 0' }}>{shipment.recipientPhone}</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button whileHover={{ scale: 1.05 }} style={{ flex: 1, padding: '10px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Phone size={16} /> Call
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} style={{ flex: 1, padding: '10px', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <MessageCircle size={16} /> Message
                </motion.button>
              </div>
            </motion.div>

            {/* Locations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', color: '#0f172a' }}>Locations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0' }}>📍 Pickup</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{shipment.pickupAddress}</p>
                </div>
                <div style={{ height: '1px', background: '#e2e8f0' }} />
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0' }}>📍 Dropoff</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{shipment.dropoffAddress}</p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {shipment.status === 'accepted' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handleMarkPickedUp}
                  style={{ padding: '14px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <CheckCircle size={18} /> Mark as Picked Up
                </motion.button>
              )}
              {shipment.status === 'in_transit' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowProofModal(true)}
                  style={{ padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Camera size={18} /> Complete Delivery
                </motion.button>
              )}
              {shipment.status === 'delivered' && (
                <div style={{ padding: '14px', background: '#10b981', color: '#fff', borderRadius: '8px', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <CheckCircle size={18} /> Delivery Completed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Proof Modal */}
      {showProofModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fff', borderRadius: '16px', padding: '30px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', color: '#0f172a' }}>Delivery Proof</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Recipient Name</label>
              <input
                type="text"
                value={proofData.recipientName}
                onChange={(e) => setProofData(prev => ({ ...prev, recipientName: e.target.value }))}
                placeholder="Full name"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>OTP Verification</label>
              <input
                type="text"
                value={proofData.otp}
                onChange={(e) => setProofData(prev => ({ ...prev, otp: e.target.value }))}
                placeholder="4-digit OTP"
                maxLength="4"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Delivery Notes</label>
              <textarea
                value={proofData.notes}
                onChange={(e) => setProofData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special notes?"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', minHeight: '80px', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofData(prev => ({ ...prev, photo: e.target.files?.[0] }))}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowProofModal(false)}
                style={{ flex: 1, padding: '12px', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleSubmitProof}
                style={{ flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirm Delivery
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CourierTracking;
