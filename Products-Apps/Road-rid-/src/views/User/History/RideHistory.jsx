import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRideRequests } from '../../../core/hooks/useBookingHooks';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton, { ListSkeleton } from '../../../core/components/Skeleton';

const RideHistory = () => {
    const navigate = useNavigate();
    const { data: rides = [], isLoading, error } = useRideRequests();

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return '#4ade80';
            case 'cancelled': return '#f87171';
            case 'searching': return '#FFB800';
            default: return '#60aff5';
        }
    };

    const getStatusBg = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'rgba(34,197,94,0.12)';
            case 'cancelled': return 'rgba(239,68,68,0.12)';
            case 'searching': return 'rgba(255,184,0,0.15)';
            default: return 'rgba(33,150,243,0.12)';
        }
    };

    if (isLoading) return (
        <div className="container py-5 mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="skeleton-box" style={{ width: '200px', height: '40px' }}></div>
            </div>
            <ListSkeleton count={5} />
        </div>
    );

    return (
        <div className="ride-history-page py-5 mt-5 min-vh-100">
            <div className="container">
                <header className="mb-5">
                    <p style={{ color: '#A1A1AA', fontSize: '0.8rem', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                        Overview
                    </p>
                    <h2 style={{ fontWeight: 900, color: '#FFFFFF', marginBottom: '8px', fontSize: '2rem' }}>
                        Trip History
                    </h2>
                    <p style={{ color: '#A1A1AA', margin: 0 }}>Review your past travels and ride details.</p>
                </header>

                <div className="row">
                    <div className="col-lg-10 mx-auto">
                        <AnimatePresence>
                            {rides.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        textAlign: 'center',
                                        padding: '60px 40px',
                                        background: '#121212',
                                        borderRadius: '24px',
                                        border: '1px solid rgba(255,255,255,0.07)',
                                    }}
                                >
                                    <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.4 }}>🗓️</div>
                                    <h4 style={{ fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>No trips found</h4>
                                    <p style={{ color: '#A1A1AA', marginBottom: '24px' }}>When you take a ride, it will appear here.</p>
                                    <button
                                        style={{
                                            background: '#FFB800',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '50px',
                                            padding: '12px 28px',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 6px 20px rgba(255,184,0,0.3)',
                                        }}
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Book your first ride
                                    </button>
                                </motion.div>
                            ) : (
                                rides.map((ride, idx) => (
                                    <motion.div
                                        key={ride.id || ride._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="ride-history-card"
                                        style={{
                                            background: '#121212',
                                            borderRadius: '20px',
                                            border: '1px solid rgba(255,255,255,0.07)',
                                            marginBottom: '12px',
                                            padding: '20px 24px',
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                        }}
                                        whileHover={{
                                            translateY: -3,
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                                        }}
                                    >
                                        <div className="row align-items-center">
                                            <div className="col-md-2 text-center" style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                                                <div>
                                                    <span style={{ display: 'block', fontWeight: 900, fontSize: '1.6rem', color: '#FFFFFF' }}>
                                                        {new Date(ride.createdAt).getDate()}
                                                    </span>
                                                    <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: '#A1A1AA', letterSpacing: '1px' }}>
                                                        {new Date(ride.createdAt).toLocaleString('default', { month: 'short' })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="col-md-6 px-4 py-2 py-md-0">
                                                <div className="location-timeline position-relative">
                                                    <div className="loc-item mb-3">
                                                        <span style={{ color: '#FFB800', marginRight: '10px', fontSize: '10px' }}>●</span>
                                                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#FFFFFF', maxWidth: '90%' }} className="text-truncate d-inline-block">
                                                            {ride.pickup_address || 'Pickup Point'}
                                                        </span>
                                                    </div>
                                                    <div className="loc-item">
                                                        <span style={{ color: '#f87171', marginRight: '10px', fontSize: '10px' }}>◆</span>
                                                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#A1A1AA', maxWidth: '90%' }} className="text-truncate d-inline-block">
                                                            {ride.destination_address || 'Destination Point'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-md-2 text-center py-2 py-md-0" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                                                <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FFB800' }}>
                                                    ₦{parseFloat(ride.estimated_price || 0).toLocaleString()}
                                                </span>
                                                <span style={{ display: 'block', fontSize: '0.75rem', color: '#A1A1AA', marginTop: '2px' }}>Economy</span>
                                            </div>

                                            <div className="col-md-2 text-end">
                                                <span style={{
                                                    display: 'inline-block',
                                                    background: getStatusBg(ride.status),
                                                    color: getStatusColor(ride.status),
                                                    borderRadius: '50px',
                                                    padding: '5px 14px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                }}>
                                                    {ride.status || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .ride-history-page { background: #000000; }
                .location-timeline::before {
                    content: '';
                    position: absolute;
                    left: 4.5px;
                    top: 15px;
                    bottom: 10px;
                    width: 1px;
                    border-left: 1px dashed rgba(255,255,255,0.12);
                }
            `}} />
        </div>
    );
};

export default RideHistory;
