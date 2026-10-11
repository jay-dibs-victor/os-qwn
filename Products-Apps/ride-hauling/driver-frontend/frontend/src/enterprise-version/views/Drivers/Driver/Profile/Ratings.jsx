import React from 'react';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import './ratings.css';

const DriverRatings = () => {
    const { user } = useAuthStore();
    
    // Mock rating breakdown
    const ratings = [
        { stars: 5, count: 85, percentage: 85 },
        { stars: 4, count: 10, percentage: 10 },
        { stars: 3, count: 3, percentage: 3 },
        { stars: 2, count: 1, percentage: 1 },
        { stars: 1, count: 1, percentage: 1 }
    ];

    const reviews = [
        { id: 1, user: "Sarah M.", rating: 5, comment: "Very professional driver, clean car and arrived exactly on time.", date: "Oct 12, 2026" },
        { id: 2, user: "James K.", rating: 5, comment: "Smooth ride, polite and helpful with luggage.", date: "Oct 10, 2026" },
        { id: 3, user: "David L.", rating: 4, comment: "Good driver, but took a slightly longer route.", date: "Oct 08, 2026" }
    ];

    return (
        <div className="ratings-page-container animated fadeIn p-t-40">
            <div className="page-header m-b-40 text-center">
                <h1 className="font-40 font-bold text-dark tracking-tight">Performance Scores</h1>
                <p className="text-muted font-16 mx-auto" style={{ maxWidth: '600px' }}>Your rating is calculated from the last 100 passenger reviews. Keep it above 4.5 to remain eligible for premium rides.</p>
            </div>

            <div className="row">
                <div className="col-lg-5">
                    <div className="card-box shadow-md" style={{ borderRadius: '24px', padding: '40px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <div className="overall-score text-center m-b-40">
                            <h2 className="font-64 font-bold text-dark m-0 line-height-1" style={{ fontSize: '80px' }}>{user?.rating || '4.9'}</h2>
                            <div className="stars-row m-b-10" style={{ color: '#FFB800', fontSize: '24px' }}>
                                <i className="md md-star"></i>
                                <i className="md md-star"></i>
                                <i className="md md-star"></i>
                                <i className="md md-star"></i>
                                <i className="md md-star"></i>
                            </div>
                            <p className="text-muted font-14 uppercase font-bold tracking-widest">Average Driver Rating</p>
                        </div>

                        <div className="rating-breakdown">
                            {ratings.map((item) => (
                                <div key={item.stars} className="breakdown-item flex-row items-center m-b-15">
                                    <span className="star-label text-muted font-12 font-bold m-r-15" style={{ minWidth: '60px' }}>{item.stars} Stars</span>
                                    <div className="progress-track flex-1" style={{ height: '8px', borderRadius: '10px', background: '#f1f5f9' }}>
                                        <div className="progress-fill bg-primary" style={{ height: '100%', borderRadius: '10px', width: `${item.percentage}%`, background: '#FFB800' }}></div>
                                    </div>
                                    <span className="count-label text-dark font-12 font-bold m-l-15" style={{ minWidth: '30px' }}>{item.count}</span>
                                </div>
                            ))}
                        </div>

                        <div className="m-t-40 p-25 text-center transition-fast" style={{ background: 'rgba(255,184,0,0.05)', borderRadius: '20px', border: '1px dashed rgba(255,184,0,0.2)' }}>
                            <h4 className="text-primary font-bold m-b-10" style={{ color: '#FFB800' }}>Top Tier Driver</h4>
                            <p className="text-muted font-13 m-0">You are in the top 5% of drivers in your region this month!</p>
                        </div>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="reviews-section m-l-20">
                        <h3 className="text-dark font-bold m-b-25">Recent Feedback</h3>
                        
                        {reviews.map((review) => (
                            <div key={review.id} className="review-card glass m-b-25 p-25 shadow-sm" style={{ borderRadius: '20px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                                <div className="flex-row justify-between items-start m-b-15">
                                    <div className="flex-row items-center">
                                        <div className="bg-primary text-dark font-bold flex-row items-center justify-center m-r-15" style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFB800' }}>
                                            {review.user.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="m-0 font-bold text-dark font-15">{review.user}</h4>
                                            <div style={{ color: '#FFB800', fontSize: '12px' }}>
                                                {[...Array(review.rating)].map((_, i) => <i key={i} className="md md-star"></i>)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-muted font-11 font-bold uppercase tracking-wider">{review.date}</span>
                                </div>
                                <p className="m-0 text-muted font-14 line-height-lg">"{review.comment}"</p>
                            </div>
                        ))}

                        <div className="m-t-30 text-center">
                            <button className="btn-link text-dark opacity-60 hover-opacity-100 transition-fast no-decoration font-bold" style={{ border: 'none', background: 'transparent' }}>Show More Reviews</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverRatings;
