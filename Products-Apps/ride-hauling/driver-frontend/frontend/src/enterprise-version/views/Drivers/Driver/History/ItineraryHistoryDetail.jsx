import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripDetail } from '../../../../core/hooks/useBookingHooks';
import moment from 'moment';
import './History.css';

const ItineraryHistoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: trip, isLoading } = useTripDetail(id);

    if (isLoading) return <div className="p-40 text-center"><div className="app-loader__spinner"></div></div>;
    if (!trip) return <div className="p-40 text-center">Trip record not found.</div>;

    return (
        <div className="history-detail-container animated fadeIn p-t-40">
            <div className="flex-row justify-between items-center m-b-30">
                <button onClick={() => navigate(-1)} className="btn btn-sm shadow-sm font-bold p-x-20" style={{ borderRadius: '12px', background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                    <i className="md md-arrow-back m-r-5"></i> Back to Archive
                </button>
                <span className={`status-tag ${trip.status?.toLowerCase() || 'completed'}`} style={{ padding: '8px 20px', fontSize: '12px' }}>{trip.status}</span>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card-box p-40 shadow-md" style={{ borderRadius: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div className="flex-row justify-between items-start m-b-40">
                            <div>
                                <h3 className="m-0 font-bold text-dark font-24">Trip Summary</h3>
                                <p className="text-muted font-14 m-t-5">{moment(trip.createdAt).format('MMMM DD, YYYY at HH:mm')}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="m-0 font-800 text-dark">{trip.currency_symbol || '₦'}{trip.fare?.toLocaleString()}</h2>
                                <p className="text-muted font-10 uppercase font-bold tracking-widest">Total Earned</p>
                            </div>
                        </div>

                        <div className="receipt-location-track m-b-40 p-25" style={{ background: '#f8fafc', borderRadius: '20px', border: '1px solid #edf2f7' }}>
                            <div className="receipt-step m-b-20 flex-row items-start">
                                <div className="receipt-dot m-r-15" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2ed573', marginTop: '4px' }}></div>
                                <div className="receipt-info">
                                    <label className="text-muted font-10 uppercase font-bold m-0 block">Pickup</label>
                                    <p className="m-0 font-16 font-bold text-dark">{trip.pickup_address || 'Pickup address not available'}</p>
                                </div>
                            </div>
                            <div className="receipt-step flex-row items-start">
                                <div className="receipt-dot m-r-15" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff4757', marginTop: '4px' }}></div>
                                <div className="receipt-info">
                                    <label className="text-muted font-10 uppercase font-bold m-0 block">Destination</label>
                                    <p className="m-0 font-16 font-bold text-dark">{trip.destination_address || 'Destination address not available'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="fare-breakdown m-t-40">
                            <h5 className="font-bold text-dark m-b-25 font-16 border-b p-b-15" style={{ borderColor: '#f1f5f9' }}>Payment Breakdown</h5>
                            <div className="flex-row justify-between p-y-12">
                                <span className="text-muted font-14">Base Fare</span>
                                <span className="font-bold text-dark">{trip.currency_symbol || '₦'}{Math.round(trip.fare * 0.4 || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex-row justify-between p-y-12">
                                <span className="text-muted font-14">Distance ({(trip.distance / 1000 || 0).toFixed(2)} km)</span>
                                <span className="font-bold text-dark">{trip.currency_symbol || '₦'}{Math.round(trip.fare * 0.5 || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex-row justify-between p-y-12">
                                <span className="text-muted font-14">Time ({trip.estimated_duration || 0} mins)</span>
                                <span className="font-bold text-dark">{trip.currency_symbol || '₦'}{Math.round(trip.fare * 0.1 || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex-row justify-between p-t-25 m-t-15 border-t items-center" style={{ borderColor: '#f1f5f9' }}>
                                <span className="font-bold text-dark font-16">Total Earnings</span>
                                <h3 className="m-0 font-800 text-primary" style={{ color: '#FFB800' }}>{trip.currency_symbol || '₦'}{trip.fare?.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card-box p-30 shadow-md" style={{ borderRadius: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <h5 className="font-bold text-dark m-b-25 font-16">Rider Insight</h5>
                        <div className="flex-row items-center m-b-25">
                            <div className="history-rider-avatar m-r-15 flex-row items-center justify-center font-bold" style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,184,0,0.1)', color: '#FFB800', fontSize: '20px' }}>
                                {trip.user_name?.[0] || 'G'}
                            </div>
                            <div>
                                <h5 className="m-0 font-bold text-dark font-16">{trip.user_name || 'Guest Rider'}</h5>
                                <p className="m-0 text-muted font-12 font-bold uppercase tracking-wider">Rating: {trip.rating || '5.0'} <i className="md md-star text-warning"></i></p>
                            </div>
                        </div>
                        <div className="p-20 m-b-30" style={{ background: '#f8fafc', borderRadius: '16px', border: '1px dashed #ced4da' }}>
                            <p className="m-0 font-14 text-muted italic line-height-md">" {trip.feedback_comment || 'No feedback provided for this trip.'} "</p>
                        </div>
                        
                        <div className="actions">
                            <button className="btn-premium w-full p-y-15 m-b-10">
                                <i className="md md-file-download m-r-8"></i> Download Receipt
                            </button>
                            <button className="btn-link w-full text-muted font-bold font-12 uppercase tracking-widest no-decoration hover-underline" style={{ border: 'none', background: 'transparent' }}>Report an Issue</button>
                        </div>
                    </div>

                    <div className="m-t-30 p-25" style={{ background: 'rgba(255,184,0,0.05)', borderRadius: '20px', border: '1px solid rgba(255,184,0,0.1)' }}>
                        <p className="text-muted font-12 m-0 line-height-md">This payment has been successfully settled and will be reflected in your weekly payout report on Tuesday.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItineraryHistoryDetail;
