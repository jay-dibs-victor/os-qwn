import React from 'react';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import './notifications.css';

const NotificationsDriver = () => {
    const { user } = useAuthStore();
    
    // Mock notifications for now
    const notifications = [
        {
            id: 1,
            title: "Performance Weekly Report",
            message: "You maintained a 4.9 rating this week! Keep up the great work.",
            time: "2 hours ago",
            type: "success",
            icon: "md-star"
        },
        {
            id: 2,
            title: "Policy Update",
            message: "Our peak hour commission rates have been adjusted. Review the new terms in the driver handbook.",
            time: "5 hours ago",
            type: "info",
            icon: "md-info-outline"
        },
        {
            id: 3,
            title: "New Ride Request Alert",
            message: "You missed a request from Victoria Island. Stay online to maximize earnings.",
            time: "1 day ago",
            type: "warning",
            icon: "md-warning"
        }
    ];

    return (
        <div className="notifications-page-container animated fadeIn p-t-40">
            <div className="page-header m-b-40 flex-row justify-between items-end">
                <div>
                    <h1 className="font-32 font-bold text-dark tracking-tight">Notifications</h1>
                    <p className="text-muted font-16">Stay updated with the latest alerts and messages.</p>
                </div>
                <button className="btn-link text-primary font-bold no-decoration hover-underline m-b-10" style={{ border: 'none', background: 'transparent' }}>Mark all as read</button>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="notifications-list">
                        {notifications.map((note) => (
                            <div key={note.id} className="notification-card m-b-15 p-25 flex-row items-center shadow-sm" style={{ borderRadius: '20px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                                <div className={`note-icon-box m-r-20 flex-row items-center justify-center shadow-sm`} style={{ width: '54px', height: '54px', borderRadius: '14px', background: `rgba(255,184,0,0.1)`, color: '#FFB800' }}>
                                    <i className={`md ${note.icon} font-24`}></i>
                                </div>
                                <div className="flex-1">
                                    <div className="flex-row justify-between items-center m-b-5">
                                        <h4 className="m-0 font-bold text-dark font-16">{note.title}</h4>
                                        <span className="text-muted font-11 uppercase font-bold tracking-wider">{note.time}</span>
                                    </div>
                                    <p className="m-0 text-muted font-14 line-height-md">{note.message}</p>
                                </div>
                                <div className="m-l-20">
                                    <button className="btn-icon-only text-muted hover-text-dark transition-fast" style={{ background: 'none', border: 'none' }}>
                                        <i className="md md-more-vert font-20"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {notifications.length === 0 && (
                        <div className="empty-state-card p-50 text-center" style={{ borderRadius: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <i className="md md-notifications-none font-64 text-muted m-b-20 opacity-30"></i>
                            <h3 className="text-dark font-bold">All Quiet!</h3>
                            <p className="text-muted">You're all caught up with your notifications.</p>
                        </div>
                    )}
                </div>

                <div className="col-lg-4">
                    <div className="card-box" style={{ borderRadius: '24px', padding: '30px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                        <h4 className="text-dark font-bold m-b-20">Notification Settings</h4>
                        <div className="setting-item flex-row justify-between items-center m-b-20">
                            <span className="text-dark font-14">Email Notifications</span>
                            <div className="custom-toggle active"></div>
                        </div>
                        <div className="setting-item flex-row justify-between items-center m-b-20">
                            <span className="text-dark font-14">Push Alerts</span>
                            <div className="custom-toggle active"></div>
                        </div>
                        <div className="setting-item flex-row justify-between items-center">
                            <span className="text-dark font-14">SMS Weekly Summary</span>
                            <div className="custom-toggle"></div>
                        </div>
                        
                        <div className="m-t-40 p-20" style={{ borderRadius: '16px', background: '#f8fafc', border: '1px solid #edf2f7' }}>
                            <p className="text-muted font-12 m-0">Queens Driver portal prioritizes important safety and technical alerts above all other notifications.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsDriver;
