import React, { useState } from 'react';
import { 
  ArrowRight, ArrowLeft, Scale, TrendingUp, Activity, Wallet, 
  CreditCard, Banknote, Percent, RotateCcw, Shield, FileBarChart
} from 'lucide-react';

interface ReportingHubProps {
  triggerToast: (msg: string) => void;
}

type WorkbenchType = 
  | 'gl-trial-balance' 
  | 'pnl-statement' 
  | 'cash-flow' 
  | 'wallet-extract' 
  | 'overdraft-portfolio' 
  | 'loan-arrears' 
  | 'commission-yield' 
  | 'reversal-audit' 
  | 'system-audit' 
  | null;

export default function ReportingHub({ triggerToast }: ReportingHubProps) {
  const [activeWorkbench, setActiveWorkbench] = useState<WorkbenchType>(null);

  const modules = [
    { id: 'gl-trial-balance', title: 'GL Trial Balance', icon: <Scale size={20} />, description: 'Extract global trial balances and ledger health.' },
    { id: 'pnl-statement', title: 'Profit & Loss Statement', icon: <TrendingUp size={20} />, description: 'Platform revenue, expenses, and yield metrics.' },
    { id: 'cash-flow', title: 'Cash Flow Summary', icon: <Activity size={20} />, description: 'Inbound and outbound fiat liquidity tracking.' },
    { id: 'wallet-extract', title: 'Wallet Balance Extract', icon: <Wallet size={20} />, description: 'User-level ecosystem wallet liability report.' },
    { id: 'overdraft-portfolio', title: 'Overdraft Portfolio Report', icon: <CreditCard size={20} />, description: 'Metrics on outstanding overdrafts and defaults.' },
    { id: 'loan-arrears', title: 'Loan Arrears Report', icon: <Banknote size={20} />, description: 'Analysis of non-performing driver loans.' },
    { id: 'commission-yield', title: 'Commission & Fees Yield', icon: <Percent size={20} />, description: 'Aggregated revenue from platform fees.' },
    { id: 'reversal-audit', title: 'Reversal Audit Log', icon: <RotateCcw size={20} />, description: 'Compliance tracking for rolled-back transactions.' },
    { id: 'system-audit', title: 'System Audit Trail', icon: <Shield size={20} />, description: 'Immutable log of administrative overrides.' }
  ];

  const handleOpenWorkbench = (id: WorkbenchType) => {
    setActiveWorkbench(id);
  };

  const getActiveTitle = () => {
    return modules.find(m => m.id === activeWorkbench)?.title || 'Reporting Interface';
  };

  return (
    <div style={{ width: '100%' }}>
      {activeWorkbench === null ? (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileBarChart size={24} style={{ color: 'var(--primary)' }} /> Financial & System Reporting
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginTop: '0.4rem' }}>
              Access regulatory, compliance, and financial intelligence reports across the platform.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {modules.map((mod) => (
              <div 
                key={mod.id}
                onClick={() => handleOpenWorkbench(mod.id as WorkbenchType)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,184,0,0.05)';
                  e.currentTarget.style.border = '1px solid rgba(255,184,0,0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: 'var(--primary)', background: 'rgba(255,184,0,0.1)', padding: '0.6rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {mod.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>{mod.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>{mod.description}</p>
                  </div>
                </div>
                <ArrowRight size={18} style={{ color: 'var(--foreground-muted)' }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '2.5rem', minHeight: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
            <button 
              onClick={() => setActiveWorkbench(null)} 
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              title="Back to Reports"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', color: '#fff' }}>
                {getActiveTitle()}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem', fontWeight: 'bold' }}>
                DATA AGGREGATION ENGINE ACTIVE
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', opacity: 0.6 }}>
            <FileBarChart size={48} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Generating Report Parameters...</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginTop: '0.5rem' }}>
              The {getActiveTitle()} data model is currently initializing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
