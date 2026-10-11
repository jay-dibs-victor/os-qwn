import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpcomingTrips } from '../../../../core/hooks/useBookingHooks';
import moment from 'moment';
import './History.css';

const PlanHistoryList = () => {
    const navigate = useNavigate();
    const { data: trips, isLoading } = useUpcomingTrips();

    if (isLoading) return <div className="p-40 text-center"><div className="app-loader__spinner"></div></div>;

    const plannedTrips = trips?.filter(t => t.booking_type === 'PLANNED') || [];

    return (
        <div className="history-list-container animated fadeIn p-t-40">
            <div className="history-header m-b-40">
                <h1 className="font-32 font-bold text-dark tracking-tight">Scheduled Plans</h1>
                <p className="text-muted font-16">Manage your upcoming pre-booked itineraries.</p>
            </div>

            {plannedTrips.length === 0 ? (
                <div className="empty-history text-center p-y-80" style={{ borderRadius: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <i className="md md-event-note font-64 text-muted m-b-20 opacity-20"></i>
                    <h4 className="text-dark font-bold">No planned itineraries</h4>
                    <p className="text-muted">Scheduled trips assigned to you will appear here.</p>
                </div>
            ) : (
                <div className="history-grid">
                    {plannedTrips.map((trip) => (
                        <div 
                            key={trip._id} 
                            className="history-card"
                            onClick={() => navigate(`/history/${trip._id}`)}
                        >
                            <div className="card-top flex-row justify-between items-center m-b-20">
                                <span className="trip-date">{moment(trip.scheduled_time || trip.createdAt).format('MMM DD, HH:mm')}</span>
                                <span className="trip-fare" style={{ color: '#FFB800', fontSize: '12px', background: 'rgba(255,184,0,0.1)', padding: '4px 12px', borderRadius: '50px' }}>PLANNED</span>
                            </div>
                            
                            <div className="location-summary m-b-25">
                                <div className="flex-row items-center m-b-10">
                                    <div className="point-dot pickup m-r-15"></div>
                                    <div className="address-text">{trip.pickup_address || 'Pickup Point'}</div>
                                </div>
                                <div className="flex-row items-center">
                                    <div className="point-dot dropoff m-r-15"></div>
                                    <div className="address-text">{trip.destination_address || 'Destination'}</div>
                                </div>
                            </div>

                            <div className="card-bottom flex-row justify-between items-center p-t-20" style={{ borderTop: '1px solid #f1f5f9' }}>
                                <div className="rider-info flex-row items-center">
                                    <div className="mini-avatar">
                                        {trip.user_name?.[0] || 'G'}
                                    </div>
                                    <span className="font-13 font-bold text-dark">{trip.user_name || 'Guest'}</span>
                                </div>
                                <span className="status-tag searching">
                                    {trip.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlanHistoryList;
