import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useShippingStore } from '../../../core/store/useShippingStore';
import apiClient from '../../../core/api/apiClient';
import './shipping.css';

const ShippingHistory = () => {
  const navigate = useNavigate();
  const { shipments, setShipments, setLoading, isLoading } = useShippingStore();
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setLocalError('');
      try {
        // In a real app, grab the actual user ID from auth context or local storage
        const userStr = localStorage.getItem('user');
        let ownerId = 'SYSTEM'; // Fallback
        if (userStr) {
           const user = JSON.parse(userStr);
           ownerId = user.id || user._id || 'SYSTEM';
        }

        const response = await apiClient.get(`/shipping/owner/${ownerId}`);
        if (response.data && response.data.success) {
          setShipments(response.data.data);
        } else {
          setLocalError('Failed to fetch shipment history.');
        }
      } catch (err) {
        setLocalError(err.response?.data?.message || 'Error fetching history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [setShipments, setLoading]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-slate-600 bg-slate-100 border-slate-200';
      case 'IN_TRANSIT': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'DELIVERED': return 'text-green-700 bg-green-50 border-green-200';
      case 'EXCEPTION': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="shipping-wrapper">
      <div className="shipping-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="shipping-title">Your Shipments</h1>
            <p className="shipping-subtitle">Manage and track all your logistics operations.</p>
          </div>
          <button 
            onClick={() => navigate('/shipping/new')}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <svg className="w-5 h-5 mr-2" style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            New Shipment
          </button>
        </div>

        {localError && (
          <div className="error-box">
            {localError}
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', borderTop: '2px solid #fbbf24', borderBottom: '2px solid #fbbf24', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : shipments.length === 0 ? (
          <div className="shipping-card" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div style={{ width: '5rem', height: '5rem', margin: '0 auto 1rem', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '2.5rem', height: '2.5rem', color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>No shipments yet</h3>
            <p style={{ color: '#64748b', maxWidth: '28rem', margin: '0 auto 1.5rem' }}>You haven't created any shipments yet. Click the button below to start your first delivery.</p>
            <button 
              onClick={() => navigate('/shipping/new')}
              className="btn btn-primary"
            >
              Create Shipment
            </button>
          </div>
        ) : (
          <div className="history-grid">
            {shipments.map((shipment, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={shipment.trackingNumber || index}
                onClick={() => navigate(`/shipping/track/${shipment.trackingNumber}`)}
                className="shipping-card shipping-card-hover"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#94a3b8', textTransform: 'uppercase' }}>Tracking Number</span>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#d97706'} onMouseLeave={(e) => e.target.style.color = '#0f172a'}>{shipment.trackingNumber}</h3>
                  </div>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(shipment.status).split(' ')[1].split('-')[1] === 'slate' ? '#f1f5f9' : getStatusColor(shipment.status).split(' ')[1].split('-')[1] === 'blue' ? '#eff6ff' : getStatusColor(shipment.status).split(' ')[1].split('-')[1] === 'green' ? '#f0fdf4' : getStatusColor(shipment.status).split(' ')[1].split('-')[1] === 'red' ? '#fef2f2' : '#fffbeb', color: getStatusColor(shipment.status).split(' ')[0].split('-')[1] === 'slate' ? '#475569' : getStatusColor(shipment.status).split(' ')[0].split('-')[1] === 'blue' ? '#1d4ed8' : getStatusColor(shipment.status).split(' ')[0].split('-')[1] === 'green' ? '#15803d' : getStatusColor(shipment.status).split(' ')[0].split('-')[1] === 'red' ? '#b91c1c' : '#b45309' }}>
                    {shipment.status.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#94a3b8', marginRight: '0.75rem', marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>From</p>
                      <p style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{shipment.origin.address}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#fbbf24', marginRight: '0.75rem', marginTop: '0.125rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>To</p>
                      <p style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{shipment.destination.address}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center' }}>
                    <svg style={{ width: '1rem', height: '1rem', marginRight: '0.375rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {new Date(shipment.created_at || Date.now()).toLocaleDateString()}
                  </span>
                  <div className={`carrier-badge carrier-${(shipment.carrier || 'INTERNAL').toLowerCase()}`}>
                    {shipment.carrier || 'INTERNAL'}
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

export default ShippingHistory;
