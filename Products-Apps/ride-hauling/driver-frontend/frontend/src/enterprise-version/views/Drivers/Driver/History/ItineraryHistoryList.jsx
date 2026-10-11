import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompletedTrips } from '../../../../core/hooks/useBookingHooks';
import moment from 'moment';
import './History.css';

const ItineraryHistoryList = () => {
    const navigate = useNavigate();
    const { data: trips, isLoading } = useCompletedTrips();

    if (isLoading) return (
        <div className="p-y-80 text-center">
            <div className="app-loader__spinner m-b-20 mx-auto"></div>
            <p className="text-muted font-bold font-12 uppercase tracking-widest">Loading Records...</p>
        </div>
    );

    return (
        <div className="history-list-container animated fadeIn p-t-40">
            <div className="page-header m-b-40">
                <h1 className="font-32 font-bold text-dark tracking-tight">Trip History</h1>
                <p className="text-muted font-16">Explore your completed journeys and detailed earning reports.</p>
            </div>

            {trips?.length === 0 ? (
                <div className="empty-history text-center p-y-80" style={{ borderRadius: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <i className="md md-history font-64 text-muted m-b-20 opacity-20"></i>
                    <h4 className="text-dark font-bold">Safe Travels!</h4>
                    <p className="text-muted">You haven't completed any trips yet. Go online to start earning.</p>
                </div>
            ) : (
                <div className="history-grid">
                    {trips?.map((trip) => (
                        <div 
                            key={trip._id} 
                            className="history-card"
                            onClick={() => navigate(`/history/${trip._id}`)}
                        >
                            <div className="card-top flex-row justify-between items-center m-b-20">
                                <span className="trip-date">{moment(trip.createdAt).format('MMM DD, YYYY')}</span>
                                <span className="trip-fare">{trip.currency_symbol || '₦'}{trip.fare?.toLocaleString()}</span>
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
                                    <span className="font-13 font-bold text-dark transition-fast">{trip.user_name || 'Guest User'}</span>
                                </div>
                                <span className={`status-tag ${trip.status.toLowerCase()}`}>
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

export default ItineraryHistoryList;
