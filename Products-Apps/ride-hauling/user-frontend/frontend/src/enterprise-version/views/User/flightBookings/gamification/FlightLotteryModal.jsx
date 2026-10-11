import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useUIStore } from '../../../../core/store/useUIStore';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import apiClient from '../../../../core/api/apiClient';
import './gamification.css';

const FlightLotteryModal = ({ isOpen, onClose }) => {
    const [scene, setScene] = useState(1); // 1: Mystery Box, 2: Payment, 3: Success
    const [isCurtainsOpen, setIsCurtainsOpen] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [boxResult, setBoxResult] = useState(null); // 'win' or 'lose'
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [lotteryNumber, setLotteryNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'paystack', 'stripe'
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    const { addToast } = useUIStore();
    const { user } = useAuthStore();

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setScene(1);
            setIsCurtainsOpen(false);
            setBoxResult(null);
            setLotteryNumber('');
            // Auto open curtains after a short delay
            setTimeout(() => setIsCurtainsOpen(true), 800);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBoxClick = () => {
        if (boxResult) return;
        setIsShaking(true);
        
        setTimeout(() => {
            setIsShaking(false);
            // 50% chance to win the right to play
            const won = Math.random() > 0.5;
            setBoxResult(won ? 'win' : 'lose');
            
            if (won) {
                setTimeout(() => setScene(2), 2000);
            }
        }, 1500);
    };

    const handleTryAgain = () => {
        setBoxResult(null);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setIsProcessingPayment(true);
        
        try {
            // Mock payment & ticket generation via backend
            const { data } = await apiClient.post('/bookings/flights/lottery/initiate', {
                amount: 1000,
                currency: 'NGN',
                gateway: paymentMethod
            });

            if (data.status === 200 || data.success) {
                // Mock verifying payment
                const verifyRes = await apiClient.post('/bookings/flights/lottery/verify', {
                    reference: data.data.reference || data.reference
                });

                if (verifyRes.data.status === 200 || verifyRes.data.success) {
                    setLotteryNumber(verifyRes.data.data.lottery_number || verifyRes.data.lottery_number);
                    setScene(3);
                } else {
                    addToast('Payment verification failed', 'danger');
                }
            }
        } catch (error) {
            console.error('Lottery Error', error);
            // Fallback for demonstration if backend not ready
            addToast('Simulating successful payment for demo', 'info');
            setTimeout(() => {
                setLotteryNumber(Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString());
                setScene(3);
            }, 1500);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(lotteryNumber);
        addToast('Lottery number copied to clipboard!', 'success');
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="gamification-modal-overlay"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="gamification-modal-content"
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '15px', right: '20px', zIndex: 100,
                            background: 'none', border: 'none', fontSize: '28px', color: scene === 1 ? '#000' : '#888', cursor: 'pointer'
                        }}
                    >
                        &times;
                    </button>

                    {/* Scene 1: Mystery Box */}
                    {scene === 1 && (
                        <>
                            <div className="curtains-container">
                                <motion.div
                                    className="curtain-left"
                                    animate={{ x: isCurtainsOpen ? '-100%' : '0%' }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                                <motion.div
                                    className="curtain-right"
                                    animate={{ x: isCurtainsOpen ? '100%' : '0%' }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                            </div>

                            <div className="mystery-box-scene">
                                <h3 className="fw-bold mb-4" style={{ zIndex: 2 }}>{boxResult === 'win' ? 'You found a Golden Ticket!' : boxResult === 'lose' ? 'Empty Box!' : 'Open the Mystery Box'}</h3>
                                
                                <div 
                                    className={`mystery-box ${isShaking ? 'box-shake' : ''}`}
                                    onClick={handleBoxClick}
                                    style={{ zIndex: 2 }}
                                >
                                    {boxResult === 'win' ? '🎫' : boxResult === 'lose' ? '💨' : '🎁'}
                                </div>

                                {boxResult === 'lose' && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="btn btn-dark mt-4 px-5 rounded-pill"
                                        onClick={handleTryAgain}
                                        style={{ zIndex: 2 }}
                                    >
                                        Try Again
                                    </motion.button>
                                )}
                                {boxResult === 'win' && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-success fw-bold mt-4"
                                        style={{ zIndex: 2 }}
                                    >
                                        Proceeding to Lottery...
                                    </motion.p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Scene 2: Payment */}
                    {scene === 2 && (
                        <div className="payment-scene">
                            <h3 className="fw-bold text-center mb-2">Flight Bonanza Lottery</h3>
                            <p className="text-center text-muted mb-4">You're one step away from winning a free flight! Purchase your lottery ticket for ₦1,000.</p>
                            
                            <form onSubmit={handlePayment}>
                                <div className="mb-4">
                                    <label className="fw-bold mb-2">Select Payment Method</label>
                                    <div className="d-flex gap-3">
                                        <div 
                                            className={`border rounded p-3 flex-grow-1 text-center ${paymentMethod === 'card' ? 'border-warning bg-light' : ''}`}
                                            onClick={() => setPaymentMethod('card')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            💳 Card
                                        </div>
                                        <div 
                                            className={`border rounded p-3 flex-grow-1 text-center ${paymentMethod === 'paystack' ? 'border-warning bg-light' : ''}`}
                                            onClick={() => setPaymentMethod('paystack')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Paystack
                                        </div>
                                        <div 
                                            className={`border rounded p-3 flex-grow-1 text-center ${paymentMethod === 'stripe' ? 'border-warning bg-light' : ''}`}
                                            onClick={() => setPaymentMethod('stripe')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Stripe
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn w-100 py-3 fw-bold rounded-pill"
                                    style={{ background: '#FFB800', color: 'var(--color-text)' }}
                                    disabled={isProcessingPayment}
                                >
                                    {isProcessingPayment ? (
                                        <><span className="spinner-border spinner-border-sm me-2" /> Processing...</>
                                    ) : (
                                        'Pay ₦1,000 & Get Ticket'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Scene 3: Success / Confetti */}
                    {scene === 3 && (
                        <div className="success-scene text-center position-relative">
                            <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />
                            
                            <div className="mb-4" style={{ fontSize: '60px' }}>🎉</div>
                            <h2 className="fw-bold text-success mb-2">Payment Successful!</h2>
                            <p className="text-muted">Here is your 16-digit Flight Bonanza Lottery Number. Keep it safe!</p>
                            
                            <div className="lottery-ticket d-flex justify-content-between align-items-center">
                                <span>{lotteryNumber.match(/.{1,4}/g)?.join('-') || lotteryNumber}</span>
                                <button 
                                    onClick={copyToClipboard}
                                    className="btn btn-sm btn-dark ms-3 rounded-circle"
                                    title="Copy to clipboard"
                                >
                                    <i className="bi bi-clipboard"></i>
                                </button>
                            </div>

                            <p className="small text-muted mt-4">
                                Winners are announced at the end of every month. We will notify you via email if you win!
                            </p>

                            <button 
                                onClick={onClose}
                                className="btn btn-outline-dark px-5 py-2 mt-3 rounded-pill fw-bold"
                            >
                                Back to Flights
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FlightLotteryModal;
