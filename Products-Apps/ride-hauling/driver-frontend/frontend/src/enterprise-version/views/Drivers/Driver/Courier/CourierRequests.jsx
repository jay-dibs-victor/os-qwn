import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Package, DollarSign, Clock, Phone, MessageCircle, CheckCircle, X } from 'lucide-react';
import { useUIStore } from '../../../../core/store/useUIStore';
import { useSocket } from '../../../../core/context/SocketContext';

const CourierRequests = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const { socket } = useSocket();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, nearby, high_value
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
        const response = await fetch(`${API_URL}/courier/requests`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // Poll for new requests every 3 seconds
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  // Listen for new courier requests via Socket.io
  useEffect(() => {
    if (!socket) return;
    
    socket.on('new-courier-request', (request) => {
      setRequests(prev => [request, ...prev]);
      addToast('New courier request available!', 'success');
    });

    return () => socket.off('new-courier-request');
  }, [socket]);

  const handleAcceptRequest = async (requestId) => {
    try {
      setAcceptingId(requestId);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
      const response = await fetch(`${API_URL}/courier/requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        addToast('Courier request accepted!', 'success');
        setRequests(prev => prev.filter(r => r.id !== requestId));
        
        // Emit socket event
        if (socket) {
          socket.emit('courier-accepted', { shipmentId: requestId });
        }
        
        navigate(`/courier/${requestId}`);
      } else {
        addToast('Failed to accept request', 'error');
      }
    } catch (error) {
      console.error('Accept error:', error);
      addToast('Error accepting request', 'error');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
      const response = await fetch(`${API_URL}/courier/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setRequests(prev => prev.filter(r => r.id !== requestId));
        addToast('Request rejected', 'info');
      }
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : filter === 'nearby'
    ? requests.filter(r => r.distance < 5)
    : requests.filter(r => r.totalPrice > 5000);

  const getEarningsColor = (price) => {
    if (price > 10000) return '#10b981';
    if (price > 5000) return '#667eea';
    return '#fbbf24';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>Courier Requests</h1>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Accept delivery requests and earn extra income</p>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          {[
            { label: 'Available Requests', value: requests.length, icon: '📦' },
            { label: 'Avg. Earnings', value: `₦${Math.round(requests.reduce((sum, r) => sum + (r.totalPrice || 0), 0) / Math.max(requests.length, 1)).toLocaleString()}`, icon: '💰' },
            { label: 'Nearby Requests', value: requests.filter(r => r.distance < 5).length, icon: '📍' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
              style={{ background: '#fff', borderRadius: '12px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{stat.icon}</div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 5px 0' }}>{stat.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'nearby', label: 'Nearby (< 5km)' },
            { id: 'high_value', label: 'High Value (> ₦5k)' }
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: filter === tab.id ? '2px solid #667eea' : '1px solid #e2e8f0',
                background: filter === tab.id ? '#eff6ff' : '#fff',
                color: filter === tab.id ? '#667eea' : '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📦</div>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading courier requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📭</div>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No courier requests available</p>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '10px' }}>Check back soon for new delivery opportunities</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            <AnimatePresence>
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Request ID</p>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '3px 0 0 0' }}>{request.id}</p>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: `${getEarningsColor(request.totalPrice)}20`,
                      color: getEarningsColor(request.totalPrice),
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      ₦{request.totalPrice?.toLocaleString()}
                    </div>
                  </div>

                  {/* Package Info */}
                  <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Package size={20} style={{ color: '#667eea', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Package</p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: '2px 0 0 0' }}>
                        {request.packageType} • {request.weight}kg
                      </p>
                    </div>
                  </div>

                  {/* Locations */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <MapPin size={16} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Pickup</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0f172a', margin: '2px 0 0 0' }}>
                          {request.pickupAddress?.substring(0, 40)}...
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <MapPin size={16} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Dropoff</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0f172a', margin: '2px 0 0 0' }}>
                          {request.dropoffAddress?.substring(0, 40)}...
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Distance & Time */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Distance</p>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '3px 0 0 0' }}>
                        {request.distance?.toFixed(1)} km
                      </p>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Est. Time</p>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '3px 0 0 0' }}>
                        {request.estimatedTime} min
                      </p>
                    </div>
                  </div>

                  {/* Sender Info */}
                  <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '12px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 8px 0' }}>Sender</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                      {request.senderName}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '3px 0 0 0' }}>
                      {request.senderPhone}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={acceptingId === request.id}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: '#667eea',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        opacity: acceptingId === request.id ? 0.7 : 1
                      }}
                    >
                      <CheckCircle size={16} />
                      {acceptingId === request.id ? 'Accepting...' : 'Accept'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRejectRequest(request.id)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: '#e2e8f0',
                        color: '#0f172a',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <X size={16} />
                      Reject
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierRequests;
