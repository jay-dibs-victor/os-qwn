import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../../core/context/SocketContext';
import { useBookingStore } from '../../../core/store/useBookingStore';

const RideChat = ({ rideId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { sendMessage } = useSocket();
  const { chatHistory } = useBookingStore();

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(rideId, message);
      setMessage('');
    }
  };

  return (
    <div className="ride-chat-container position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1050 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="card shadow-lg border-0 mb-3"
            style={{ width: '300px', borderRadius: '20px', overflow: 'hidden' }}
          >
            <div className="card-header bg-primary text-white p-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Chat with Driver</h6>
              <button className="btn-close btn-close-white" onClick={() => setIsOpen(false)}></button>
            </div>
            
            <div className="card-body p-3" style={{ height: '300px', overflowY: 'auto', background: 'var(--color-bg)' }}>
              {chatHistory.length === 0 ? (
                <div className="text-center text-muted mt-5 small">No messages yet. Say hello!</div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div key={i} className={`mb-2 d-flex ${msg.sender_role === 'PASSENGER' ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div className={`p-2 rounded-3 small ${msg.sender_role === 'PASSENGER' ? 'bg-primary text-white' : 'bg-white shadow-sm text-dark'}`} style={{ maxWidth: '80%' }}>
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="card-footer bg-white border-0 p-3">
              <form onSubmit={handleSend} className="input-group">
                <input
                  type="text"
                  className="form-control border-light bg-light rounded-pill-start"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button className="btn btn-primary rounded-pill-end shadow-sm" type="submit">
                  <i className="bi bi-send-fill"></i>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary rounded-circle shadow-lg p-3 d-flex align-items-center justify-content-center"
        style={{ width: '60px', height: '60px' }}
      >
        <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'} fs-4`}></i>
      </motion.button>
    </div>
  );
};

export default RideChat;
