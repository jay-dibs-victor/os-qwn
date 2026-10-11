import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Package, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../../core/store/useUIStore';

const CourierHistory = () => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, in_transit, delivered, cancelled

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';
        const response = await fetch(`${API_URL}/courier/shipments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setShipments(data);
        } else {
          addToast('Failed to load shipments', 'error');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        addToast('Error loading shipments', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  const filteredShipments = filter === 'all' 
    ? shipments 
    : shipments.filter(s => s.status === filter);

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
      case 'pending': return <Clock size={16} />;
      case 'accepted': return <CheckCircle size={16} />;
      case 'in_transit': return <Package size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'cancelled': return <AlertCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  const stats = [
    { label: 'Total Shipments', value: shipments.length, icon: '📦' },
    { label: 'Delivered', value: shipments.filter(s => s.status === 'delivered').length, icon: '✅' },
    { label: 'In Transit', value: shipments.filter(s => s.status === 'in_transit').length, icon: '🚚' },
    { label: 'Pending', value: shipments.filter(s => s.status === 'pending').length, icon: '⏳' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '40px' }}>
          <button 
            onClick={() => navigate('/courier')}
            style={{ background: 'none', border: 'none', color: '#667eea', fontSize: '1rem', cursor: 'pointer', marginBottom: '20px' }}
          >
            ← Back to Courier
          </button>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>Shipment History</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>Track and manage all your shipments</p>
        </motion.div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }}
              style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{stat.icon}</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0' }}>{stat.label}</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
          {[
            { id: 'all', label: 'All Shipments' },
            { id: 'pending', label: 'Pending' },
            { id: 'in_transit', label: 'In Transit' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' }
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

        {/* Shipments List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📦</div>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Loading shipments...</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📭</div>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '20px' }}>No shipments found</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/courier/create')}
              style={{ padding: '10px 20px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Send a Package
            </motion.button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredShipments.map((shipment, index) => (
              <motion.div
                key={shipment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate(`/courier/track/${shipment.id}`)}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '20px', alignItems: 'center' }}>
                  
                  {/* Tracking ID & Package */}
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0' }}>Tracking ID</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{shipment.id}</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '5px 0 0 0' }}>📦 {shipment.packageType}</p>
                  </div>

                  {/* Route */}
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0' }}>Route</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} style={{ color: '#667eea' }} />
                      <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 500 }}>
                        {shipment.pickupAddress?.split(',')[0]} → {shipment.dropoffAddress?.split(',')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0' }}>Date</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                      {new Date(shipment.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Price */}
                  <div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0' }}>Total</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#667eea', margin: 0 }}>
                      ₦{shipment.totalPrice?.toLocaleString()}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: `${getStatusColor(shipment.status)}20`,
                    color: getStatusColor(shipment.status),
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}>
                    {getStatusIcon(shipment.status)}
                    {shipment.status?.toUpperCase()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierHistory;
