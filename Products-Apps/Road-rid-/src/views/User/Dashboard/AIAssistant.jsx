import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveKitRoom, useTracks, VideoConference } from '@livekit/components-react';
import { Track } from 'livekit-client';
import axios from 'axios';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { useUIStore } from '../../../core/store/useUIStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [token, setToken] = useState(null);
  const [delegationToken, setDelegationToken] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI OS Assistant. I can help you book rides, track packages, and even process photos or screenshots of your location. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated) || !!user;
  const { addToast } = useUIStore();

  const fileInputRef = useRef(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Proactively fetch token on mount to enable background OS connectivity
    if (isAuthenticated && !token) {
      fetchToken();
    }
  }, [isAuthenticated]);

  const toggleAssistant = () => setIsOpen(!isOpen);

  // 🛰️ Data Channel Listener for OS Alerts
  const onDataReceived = (payload) => {
    try {
      const decoder = new TextDecoder();
      const str = decoder.decode(payload);
      const data = JSON.parse(str);

      if (data.type === 'SAFETY_ALERT') {
        window.dispatchEvent(new CustomEvent('OS_SYSTEM_ALERT', {
          detail: {
            title: 'SAFETY SENTINEL',
            message: data.message,
            type: 'SAFETY'
          }
        }));
      } else if (data.type === 'OS_COORDINATION_ALERT') {
        window.dispatchEvent(new CustomEvent('OS_SYSTEM_ALERT', {
          detail: {
            title: 'FLIGHT COORDINATOR',
            message: data.message,
            type: 'INFO'
          }
        }));
      }
    } catch (e) {
      console.warn('OS Data parsing failed', e);
    }
  };

  const fetchToken = async () => {
    try {
      const res = await axios.get(`${API_BASE}/os/session/token`, {
        params: { userId: user?.id, role: 'user' },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setToken(res.data.token);
      setDelegationToken(res.data.delegationToken);
    } catch (err) {
      console.error('Failed to connect to AI OS Background Service');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMsg = { role: 'user', content: inputText, image: selectedImage };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    const currentImage = selectedImage;
    setInputText('');
    setSelectedImage(null);

    try {
      const res = await axios.post(`${API_BASE}/os/ai/command`, {
        userId: user?.id,
        message: currentInput,
        image: currentImage, // base64 string
        sessionId: user?.id, // Simplified for PoC
        delegationToken: delegationToken // 🔑 Pass the proxy identity
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing that request.' }]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <input 
        type="file" 
        hidden 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*"
      />
      {/* Floating Action Button */}
      <motion.button
        className="ai-fab shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleAssistant}
      >
        <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-cpu-fill'}`}></i>
        {!isOpen && <div className="ai-pulse"></div>}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-panel glass-morphism shadow-2xl"
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
          >
            <div className="ai-header p-3 border-bottom border-white-10">
              <div className="d-flex align-items-center gap-2">
                <div className="ai-status-dot"></div>
                <span className="fw-800 font-14 text-white">AI OS COMPANION</span>
              </div>
            </div>

            <div className="ai-chat-body p-3" ref={scrollRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`ai-msg-wrapper ${msg.role}`}>
                  <div className={`ai-msg-bubble ${msg.role}`}>
                    {msg.image && (
                      <img src={msg.image} className="img-fluid rounded-lg mb-2 border border-white-10" alt="attached" />
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}
              {selectedImage && (
                <div className="ai-msg-wrapper user opacity-50">
                   <div className="ai-msg-bubble user">
                      <img src={selectedImage} className="img-fluid rounded-lg" alt="preview" />
                      <div className="text-[10px] mt-1 italic">Ready to send...</div>
                   </div>
                </div>
              )}
            </div>

            <div className="ai-footer p-3 border-top border-white-10">
              <div className="input-group glass-dark rounded-pill overflow-hidden border border-white-10">
                <input
                  type="text"
                  className="form-control bg-transparent border-0 text-white font-12 ps-3"
                  placeholder="Ask anything..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  className="btn btn-link text-white-50 px-2"
                  onClick={() => fileInputRef.current.click()}
                >
                  <i className="bi bi-camera"></i>
                </button>
                <button 
                  className="btn btn-link text-white-50"
                  onClick={() => setIsListening(!isListening)}
                >
                  <i className={`bi ${isListening ? 'bi-mic-fill text-danger' : 'bi-mic'}`}></i>
                </button>
                <button 
                  className="btn btn-primary px-3 rounded-pill m-1 font-11 fw-800"
                  onClick={handleSendMessage}
                >
                  SEND
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛠️ AI OS Kernel Connection (Background) */}
      {token && (
        <div style={{ display: 'none' }}>
          <LiveKitRoom
            video={false}
            audio={isListening}
            token={token}
            serverUrl={import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880'}
            onDisconnected={() => setToken(null)}
            onDataReceived={onDataReceived}
          >
          </LiveKitRoom>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .ai-fab {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 20px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          border: none;
          color: white;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          cursor: pointer;
        }
        .ai-pulse {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 20px;
          border: 2px solid #a855f7;
          animation: ai-pulse-anim 2s infinite;
        }
        @keyframes ai-pulse-anim {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .ai-panel {
          position: fixed;
          bottom: 170px;
          right: 24px;
          width: 320px;
          height: 480px;
          background: rgba(15, 17, 26, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          z-index: 999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .ai-chat-body {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ai-msg-wrapper { display: flex; width: 100%; }
        .ai-msg-wrapper.user { justify-content: flex-end; }
        .ai-msg-bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 13px;
          line-height: 1.4;
        }
        .ai-msg-bubble.assistant {
          background: rgba(255,255,255,0.05);
          color: #e2e8f0;
          border-bottom-left-radius: 4px;
        }
        .ai-msg-bubble.user {
          background: #6366f1;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .ai-status-dot {
          width: 8px; height: 8px; background: #22c55e; border-radius: 50%;
          box-shadow: 0 0 10px #22c55e;
        }
        .glass-dark { background: rgba(255,255,255,0.05); }
      `}} />
    </>
  );
};

export default AIAssistant;
