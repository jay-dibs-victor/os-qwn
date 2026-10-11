import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../../core/store/useAuthStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:12000/api/v1';

const WorkflowMonitor = () => {
    const [workflows, setWorkflows] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const { user } = useAuthStore();

    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const res = await axios.get(`${API_BASE}/os/workflows/active`, {
                    params: { userId: user?.id },
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.data.success) {
                    setWorkflows(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch active workflows');
            }
        };

        fetchWorkflows();
        const interval = setInterval(fetchWorkflows, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [user]);

    if (workflows.length === 0) return null;

    return (
        <div className="fixed bottom-24 left-6 z-[1000]">
            <motion.div 
                className="glass-morphism rounded-2xl border border-white/10 shadow-2xl overflow-hidden bg-black/60 backdrop-blur-2xl"
                initial={{ width: 48, height: 48 }}
                animate={{ 
                    width: isExpanded ? 280 : 48, 
                    height: isExpanded ? 'auto' : 48,
                    maxHeight: 400
                }}
            >
                <div 
                    className="p-3 flex items-center justify-between cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-6 h-6 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black flex items-center justify-center text-[8px] text-white font-bold">
                                {workflows.length}
                            </div>
                        </div>
                        {isExpanded && (
                            <span className="text-white font-bold text-xs tracking-wider">KERNEL PROCESSES</span>
                        )}
                    </div>
                    {isExpanded && (
                        <div className="text-white/40">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                             </svg>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div 
                            className="p-3 pt-0 flex flex-col gap-2 overflow-y-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {workflows.map((wf) => (
                                <div key={wf.workflowId} className="p-3 rounded-xl bg-white/5 border border-white/5">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-cyan-400 font-mono text-[10px]">{wf.type}</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-white/40 text-[9px]">ACTIVE</span>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-[11px] font-medium truncate">ID: {wf.workflowId}</p>
                                    <p className="text-white/40 text-[9px] mt-1">Started: {new Date(wf.startTime).toLocaleTimeString()}</p>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default WorkflowMonitor;
