import React, { useState, useEffect } from 'react';
import { Terminal, X, Play, RefreshCw, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';

export default function DeveloperConsole({ transactions, onWebhookTriggered, activeUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState('');
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Add default log
    addLog('Developer Sandbox initialized. Monitoring transactions...');
  }, []);

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message, type }, ...prev]);
  };

  const pendingTx = transactions.filter((tx) => tx.status === 'PENDING');

  const triggerMockWebhook = async (provider) => {
    if (!selectedTx) {
      alert('Please select a pending transaction reference first!');
      return;
    }

    const tx = transactions.find((t) => t.reference === selectedTx);
    if (!tx) return;

    setIsLoading(true);
    addLog(`Initiating real webhook verification cycle on backend for ${provider}...`, 'warn');

    const url = `http://localhost:5050/api/payments/sandbox/trigger-webhook`;
    const payload = {
      provider,
      reference: tx.reference,
    };

    try {
      addLog(`Sending POST to ${url} with reference ${tx.reference}...`, 'info');
      const response = await axios.post(url, payload);
      
      addLog(`Backend processed webhook successfully! Status: ${response.status}`, 'success');
      addLog(`Response: ${JSON.stringify(response.data)}`, 'success');
      
      if (onWebhookTriggered) {
        onWebhookTriggered(tx.reference);
      }
      setSelectedTx('');
    } catch (error) {
      addLog(`Webhook simulation failed: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Sliding Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full bg-violet-600 px-5 text-white shadow-lg transition-transform hover:scale-105"
        style={{
          background: 'var(--gradient-primary)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
        }}
      >
        <Terminal size={18} />
        <span style={{ fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Sandbox Console
        </span>
      </button>

      {/* Slide-out Panel */}
      {isOpen && (
        <div
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-white/10 bg-slate-950 p-6 shadow-2xl animate-fade md:w-[480px]"
          style={{
            background: 'rgba(8, 9, 13, 0.95)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid var(--border-color)',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="text-violet-400" size={20} />
              <h3 className="text-lg font-bold text-white">Developer Sandbox Console</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Webhook Simulation Card */}
          <div className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h4 className="mb-2 text-sm font-semibold text-gray-300">Simulate Webhook Callback</h4>
            <p className="mb-4 text-xs text-gray-500">
              Trigger a direct POST webhook event with HMAC validation to the NestJS server.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Select Pending Transaction</label>
                <select
                  value={selectedTx}
                  onChange={(e) => setSelectedTx(e.target.value)}
                  className="w-full rounded border border-white/10 bg-white/5 p-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <option value="">-- Choose Transaction Reference --</option>
                  {pendingTx.map((tx) => (
                    <option key={tx.reference} value={tx.reference}>
                      {tx.reference} ({tx.provider.toUpperCase()} - {tx.currency} {tx.amount})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTx && (
                <div>
                  <label className="mb-2 block text-xs text-gray-400">Trigger Webhook Simulation</label>
                  {(() => {
                    const tx = transactions.find((t) => t.reference === selectedTx);
                    if (!tx) return null;
                    const provider = tx.provider.toLowerCase();
                    const isSync = ['paypal', 'googlepay', 'applepay'].includes(provider);

                    if (isSync) {
                      return (
                        <div
                          className="flex items-start gap-2.5 rounded-lg p-3 text-xs text-amber-200"
                          style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}
                        >
                          <AlertTriangle size={16} className="shrink-0 text-amber-400" />
                          <span>
                            {tx.provider.toUpperCase()} processes transactions synchronously. Webhook simulation is not required for this gateway.
                          </span>
                        </div>
                      );
                    }

                    // Map provider name to nice colors
                    let btnColor = 'var(--gradient-primary)';
                    let label = `${tx.provider.toUpperCase()} Webhook`;
                    if (provider === 'paystack' || provider === 'verve') {
                      btnColor = 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)';
                    } else if (provider === 'moniepoint') {
                      btnColor = 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)';
                    } else if (provider === 'opay') {
                      btnColor = 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)';
                    } else if (provider === 'stripe' || provider === 'mastercard') {
                      btnColor = 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)';
                    } else if (provider === 'kuda') {
                      btnColor = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
                    } else if (provider === 'alipay') {
                      btnColor = 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)';
                    }

                    return (
                      <button
                        onClick={() => triggerMockWebhook(provider)}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                        style={{ border: 'none', cursor: 'pointer', background: btnColor, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                      >
                        <Send size={14} /> Send {label}
                      </button>
                    );
                  })()}
                </div>
              )}

              {pendingTx.length === 0 && (
                <div
                  className="flex items-start gap-2.5 rounded-lg p-3 text-xs text-amber-200"
                  style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}
                >
                  <AlertTriangle size={16} className="shrink-0 text-amber-400" />
                  <span>No pending transactions available. Initialize a payment checkout first.</span>
                </div>
              )}
            </div>
          </div>

          {/* Console Output Log */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-white/5 bg-slate-950">
            <div className="flex items-center justify-between border-b border-white/5 bg-slate-900/60 px-4 py-2">
              <span className="text-xs font-semibold text-gray-400">Activity & API Logs</span>
              <button
                onClick={() => setLogs([])}
                className="text-xs text-gray-500 hover:text-white"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed">
              {logs.length === 0 && <div className="text-gray-600 text-center py-8">Console log empty.</div>}
              {logs.map((log, index) => (
                <div key={index} className="mb-2 flex items-start gap-2">
                  <span className="text-gray-600 shrink-0 select-none">[{log.time}]</span>
                  <span
                    className={
                      log.type === 'success'
                        ? 'text-emerald-400'
                        : log.type === 'error'
                          ? 'text-red-400'
                          : log.type === 'warn'
                            ? 'text-amber-400'
                            : 'text-gray-300'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
