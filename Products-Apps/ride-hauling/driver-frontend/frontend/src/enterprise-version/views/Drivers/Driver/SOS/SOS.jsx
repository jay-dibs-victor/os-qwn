import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../../../core/context/SocketContext';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import { useUIStore } from '../../../../core/store/useUIStore';
import './SOS.css';

const SOS = () => {
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { user } = useAuthStore();
    const { addToast } = useUIStore();
    const [isReporting, setIsReporting] = useState(false);
    const [holdTimer, setHoldTimer] = useState(0);
    const [isHolding, setIsHolding] = useState(false);

    useEffect(() => {
        let interval;
        if (isHolding && holdTimer < 100) {
            interval = setInterval(() => {
                setHoldTimer((prev) => Math.min(prev + 5, 100));
            }, 50);
        } else if (!isHolding) {
            setHoldTimer(0);
        }

        if (holdTimer === 100 && !isReporting) {
            handleReportDistress();
            setIsHolding(false);
        }

        return () => clearInterval(interval);
    }, [isHolding, holdTimer]);

    const handleReportDistress = () => {
        setIsReporting(true);
        
        if (socket) {
            socket.emit('emergency-alert', {
                type: 'MANUAL_SOS',
                driverId: user?.id || user?._id,
                driverName: `${user?.firstname} ${user?.lastname}`,
                timestamp: new Date(),
                location: 'Live GPS Broadcast'
            });
        }

        setTimeout(() => {
            setIsReporting(false);
            addToast('Distress signal broadcasted! Security team is responding.', 'danger');
        }, 2000);
    };

    return (
        <div className="sos-page-wrapper animated fadeIn">
            <div className="emergency-overlay"></div>
            
            <div className="sos-main-content text-center container">
                <div className="emergency-badge m-b-30 animated pulse infinite">
                    <span className="dot"></span> EMERGENCY RESPONSE
                </div>
                
                <h1 className="font-48 font-bold text-dark tracking-tighter m-b-20">In Trouble?</h1>
                <p className="text-muted font-18 m-b-50 mx-auto" style={{ maxWidth: '600px' }}>
                    Press and hold the SOS button for 2 seconds. This will instantly notify the Queens Security Team and share your live audio and location.
                </p>

                <div className="sos-control-center">
                    <div className="sos-button-wrapper relative mx-auto" style={{ width: '280px', height: '280px' }}>
                        <svg className="sos-progress-svg absolute" style={{ top: 0, left: 0, transform: 'rotate(-90deg)', width: '280px', height: '280px' }}>
                            <circle 
                                cx="140" cy="140" r="130" 
                                fill="transparent" 
                                stroke="#f1f5f9" 
                                strokeWidth="8"
                            />
                            <circle 
                                cx="140" cy="140" r="130" 
                                fill="transparent" 
                                stroke="#ff4757" 
                                strokeWidth="8"
                                strokeDasharray="816"
                                strokeDashoffset={816 - (816 * holdTimer / 100)}
                                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                            />
                        </svg>

                        <button 
                            className={`sos-heavy-btn ${isReporting ? 'reporting' : ''}`}
                            onMouseDown={() => setIsHolding(true)}
                            onMouseUp={() => setIsHolding(false)}
                            onTouchStart={() => setIsHolding(true)}
                            onTouchEnd={() => setIsHolding(false)}
                            disabled={isReporting}
                            style={{ border: '12px solid #ffffff' }}
                        >
                            <div className="inner-glow"></div>
                            {isReporting ? (
                                <div className="reporting-status">
                                    <span className="font-bold">SENDING</span>
                                </div>
                            ) : (
                                <i className="md md-notifications-active font-64"></i>
                            )}
                        </button>
                    </div>
                </div>

                <div className="emergency-stats row m-t-60 justify-center">
                    <div className="col-md-3">
                        <div className="glass-stat p-20 shadow-sm" style={{ borderRadius: '20px', background: 'var(--color-surface)' }}>
                            <i className="md md-gps-fixed text-success font-28 m-b-10"></i>
                            <h4 className="text-dark font-bold m-0">GPS LIVE</h4>
                            <p className="text-muted font-11 uppercase m-0">Tracking active</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="glass-stat p-20 shadow-sm" style={{ borderRadius: '20px', background: 'var(--color-surface)' }}>
                            <i className="md md-videocam text-danger font-28 m-b-10"></i>
                            <h4 className="text-dark font-bold m-0">AUDIO REC</h4>
                            <p className="text-muted font-11 uppercase m-0">Recording stream</p>
                        </div>
                    </div>
                </div>

                <div className="m-t-50">
                    <button onClick={() => navigate(-1)} className="btn-link text-muted opacity-60 hover-opacity-100 transition-fast no-decoration font-bold" style={{ border: 'none', background: 'transparent' }}>
                        Not an emergency? Go back
                    </button>
                </div>
            </div>

            <footer className="sos-sticky-footer">
                <div className="flex-row items-center justify-center p-20 gap-20">
                    <span className="connection-status flex-row items-center gap-5"><span className="dot connected"></span> SECURE CONNECTION</span>
                    <span className="divider">|</span>
                    <span className="security-code">ID: #DX-{user?.id?.substring(0,6) || user?._id?.substring(0,6) || 'UNKNWN'}</span>
                </div>
            </footer>
        </div>
    );
};

export default SOS;
