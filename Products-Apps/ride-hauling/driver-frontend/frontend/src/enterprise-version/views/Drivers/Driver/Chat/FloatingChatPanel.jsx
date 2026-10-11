import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../../../core/context/SocketContext';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import moment from 'moment';
import './FloatingChatPanel.css';

const FloatingChatPanel = ({ rideId, isOpen, onClose }) => {
    const { socket } = useSocket();
    const { user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!socket || !rideId) return;

        socket.on('new-chat-message', (msg) => {
            if (msg.ride_id === rideId) {
                setMessages(prev => [...prev, msg]);
            }
        });

        // Load history if any (could fetch from API)
        
        return () => socket.off('new-chat-message');
    }, [socket, rideId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const payload = {
            ride_id: rideId,
            sender: user.id || user._id,
            message: inputValue,
            sender_role: 'driver'
        };

        socket.emit('chat-message', payload);
        setInputValue('');
    };

    if (!isOpen) return null;

    return (
        <div className="floating-chat-container animated slideInRight">
            <div className="chat-header">
                <div className="flex-row items-center">
                    <div className="status-indicator online"></div>
                    <h5 className="m-0 font-bold">Rider Chat</h5>
                </div>
                <button onClick={onClose} className="close-btn"><i className="md md-close"></i></button>
            </div>

            <div className="chat-body">
                {messages.length === 0 && (
                    <div className="empty-chat">
                        <i className="md md-chat font-32 opacity-20"></i>
                        <p className="text-muted font-12 m-t-10">Start a conversation with the rider.</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-wrapper ${msg.sender_role === 'driver' ? 'sent' : 'received'}`}>
                        <div className="message-bubble">
                            {msg.message}
                            <span className="timestamp">{moment(msg.createdAt || Date.now()).format('HH:mm')}</span>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef}></div>
            </div>

            <form onSubmit={handleSendMessage} className="chat-footer">
                <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="submit" className="send-btn"><i className="md md-send"></i></button>
            </form>
        </div>
    );
};

export default FloatingChatPanel;
