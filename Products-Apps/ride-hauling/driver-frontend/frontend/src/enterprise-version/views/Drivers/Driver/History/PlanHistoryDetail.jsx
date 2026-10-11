import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripDetail } from '../../../../core/hooks/useBookingHooks';
import moment from 'moment';
import './History.css';

const PlanHistoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: trip, isLoading } = useTripDetail(id);

    if (isLoading) return <div className="p-40 text-center"><div className="app-loader__spinner"></div></div>;
    if (!trip) return <div className="p-40 text-center">Scheduled itinerary record not found.</div>;

    return (
        <div className="history-detail-container animated fadeIn">
            <div className="flex-row justify-between items-center m-b-30">
                <button onClick={() => navigate(-1)} className="btn btn-sm btn-white font-bold p-x-20" style={{ borderRadius: '12px' }}>
                    <i className="md md-arrow-back m-r-5"></i> Back to Archive
                </button>
                <div className="flex-row items-center gap-2">
                    <span className="premium-badge" style={{ background: '#1a1a1a', color: '#FFB800' }}>PLANNED</span>
                    <span className="premium-badge">{trip.status}</span>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card-box p-30 shadow-sm" style={{ borderRadius: '24px' }}>
                        <div className="flex-row justify-between items-start m-b-30">
                            <div>
                                <h3 className="m-0 font-bold">Planned Itinerary</h3>
                                <p className="text-muted font-13">Scheduled for: <span className="text-primary font-bold">{moment(trip.scheduled_time || trip.createdAt).format('MMMM DD, YYYY at HH:mm')}</span></p>
                            </div>
                            <div className="text-right">
                                <h2 className="m-0 font-bold">₦{trip.fare?.toLocaleString()}</h2>
                                <p className="text-muted font-10 uppercase font-bold tracking-widest">Calculated Fare</p>
                            </div>
                        </div>

                        <div className="receipt-location-track m-b-30 p-20" style={{ background: '#f8fafc', borderRadius: '16px' }}>
                            <div className="receipt-step m-b-20">
                                <div className="receipt-dot green"></div>
                                <div className="receipt-info">
                                    <label className="text-muted font-10 uppercase font-bold m-0">Collection Point</label>
                                    <p className="m-0 font-14 font-bold">{trip.pickup_address || 'Address pending'}</p>
                                </div>
                            </div>
                            <div className="receipt-step">
                                <div className="receipt-dot yellow"></div>
                                <div className="receipt-info">
                                    <label className="text-muted font-10 uppercase font-bold m-0">Destination</label>
                                    <p className="m-0 font-14 font-bold">{trip.destination_address || 'Address pending'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="m-t-40 p-25" style={{ background: 'rgba(255, 184, 0, 0.05)', borderRadius: '20px', border: '1px solid rgba(255, 184, 0, 0.1)' }}>
                            <h5 className="font-bold m-b-15">Journey Particulars</h5>
                            <div className="row">
                                <div className="col-md-4">
                                    <p className="m-0 text-muted font-11 uppercase font-bold">Distance</p>
                                    <p className="font-15 font-bold">{(trip.distance / 1000).toFixed(2)} km</p>
                                </div>
                                <div className="col-md-4">
                                    <p className="m-0 text-muted font-11 uppercase font-bold">Est. Duration</p>
                                    <p className="font-15 font-bold">{trip.estimated_duration || '25'} mins</p>
                                </div>
                                <div className="col-md-4">
                                    <p className="m-0 text-muted font-11 uppercase font-bold">Booking Type</p>
                                    <p className="font-15 font-bold">{trip.booking_type}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card-box p-25 shadow-sm" style={{ borderRadius: '24px' }}>
                        <h5 className="font-bold m-b-20">Passenger Dossier</h5>
                        <div className="flex-row items-center m-b-20">
                            <div className="history-rider-avatar" style={{ background: '#1a1a1a', color: '#FFB800' }}>
                                {trip.user_name?.[0] || 'G'}
                            </div>
                            <div>
                                <h5 className="m-0 font-bold">{trip.user_name || 'Individual Client'}</h5>
                                <p className="m-0 text-muted font-12">Account Verified <i className="md md-verified-user text-success"></i></p>
                            </div>
                        </div>
                        
                        <div className="m-t-30">
                            <button className="btn btn-primary w-100 font-bold p-y-12" style={{ borderRadius: '14px', background: '#FFB800', border: 'none', color: 'var(--color-text)' }}>
                                Initiate Pickup
                            </button>
                            <button className="btn btn-link w-100 m-t-10 text-muted font-12">View Special Instructions</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanHistoryDetail;
