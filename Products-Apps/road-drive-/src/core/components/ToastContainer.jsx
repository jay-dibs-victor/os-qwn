import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/useUIStore';

const ToastContainer = () => {
    const { toasts, removeToast } = useUIStore();

    return (
        <div 
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                pointerEvents: 'none'
            }}
        >
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        style={{
                            width: '250px',
                            height: '150px',
                            background: 'var(--color-surface)',
                            borderRadius: '16px',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            pointerEvents: 'auto',
                            position: 'relative',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '20px' }}>
                            <div 
                                style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    borderRadius: '12px', 
                                    backgroundColor: toast.type === 'success' ? '#ECFDF5' : '#F3F4F6', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    flexShrink: 0
                                }}
                            >
                                {toast.type === 'success' ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                    </svg>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h6 style={{ margin: 0, fontWeight: '700', color: '#111827', fontSize: '15px' }}>
                                    {toast.type === 'success' ? 'Success' : 'Notification'}
                                </h6>
                                <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '13px', lineHeight: '1.4' }}>
                                    {toast.message}
                                </p>
                            </div>
                            <button 
                                onClick={() => removeToast(toast.id)}
                                style={{ 
                                    position: 'absolute', 
                                    top: '10px', 
                                    right: '10px', 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#D1D5DB', 
                                    cursor: 'pointer',
                                    padding: '5px'
                                }}
                            >
                                &times;
                            </button>
                        </div>
                        
                        {/* Progress Bar */}
                        <div style={{ height: '4px', backgroundColor: '#F3F4F6', width: '100%' }}>
                            <motion.div 
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 4, ease: 'linear' }}
                                style={{ 
                                    height: '100%', 
                                    backgroundColor: toast.type === 'success' ? '#10B981' : '#3B82F6' 
                                }}
                            />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
