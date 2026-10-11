import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import './Dashboard.css'; // Reuse existing dashboard styles for glassmorphism

const SystemOverlay = () => {
    const [alerts, setAlerts] = useState([]);
    const { user } = useAuthStore();

    useEffect(() => {
        // In a real scenario, this would connect to the OS socket or EventSource
        // For PoC, we'll listen for specific global window events or socket broadcasts
        const handleOSAlert = (event) => {
            const newAlert = {
                id: Date.now(),
                ...event.detail
            };
            setAlerts(prev => [...prev, newAlert]);
            
            // Auto-dismiss after 8 seconds
            setTimeout(() => {
                setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
            }, 8000);
        };

        window.addEventListener('OS_SYSTEM_ALERT', handleOSAlert);
        return () => window.removeEventListener('OS_SYSTEM_ALERT', handleOSAlert);
    }, []);

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {alerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className="pointer-events-auto"
                    >
                        <div className="glass-morphism p-4 rounded-xl border border-white/20 shadow-2xl min-w-[300px] flex items-start gap-4 bg-black/40 backdrop-blur-xl">
                            <div className={`p-2 rounded-lg ${
                                alert.type === 'SAFETY' ? 'bg-red-500/20 text-red-400' : 
                                alert.type === 'TACTICAL' ? 'bg-yellow-500/20 text-yellow-400' :
                                alert.type === 'GUARDIAN' ? 'bg-purple-500/20 text-purple-400 animate-pulse' :
                                'bg-cyan-500/20 text-cyan-400'
                            }`}>
                                {alert.type === 'SAFETY' ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                ) : alert.type === 'TACTICAL' ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                ) : alert.type === 'GUARDIAN' ? (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-bold text-sm mb-1">{alert.title || 'SYSTEM OS'}</h4>
                                <p className="text-white/70 text-xs leading-relaxed">{alert.message}</p>
                                {alert.action && (
                                    <button 
                                        onClick={() => alert.action()}
                                        className="mt-2 text-cyan-400 text-xs font-semibold hover:underline"
                                    >
                                        View Details
                                    </button>
                                )}
                            </div>
                            <button 
                                onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                                className="text-white/30 hover:text-white"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default SystemOverlay;
