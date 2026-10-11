import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, Eye, Trash2, X, Sliders, ArrowLeft, Edit2, Save, AlertTriangle, CheckCircle 
} from 'lucide-react';
import Pagination from '../../Pagination';

interface OverdraftLimit {
  id: string;
  driverName: string;
  driverId: string;
  maxLimit: number;
  currentOverdraft: number;
  interestRate: number;
  status: 'APPROVED' | 'SUSPENDED' | 'REVIEW_REQUIRED';
  updatedAt: string;
}

interface OverdraftManagementHubProps {
  triggerToast: (msg: string) => void;
  addNewTrigger?: number;
  onViewChange?: (view: 'list' | 'manage') => void;
}

export default function OverdraftManagementHub({ triggerToast, addNewTrigger, onViewChange }: OverdraftManagementHubProps) {
  const [view, setView] = useState<'list' | 'manage'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals state
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form State
  const [formDriverName, setFormDriverName] = useState('');
  const [formMaxLimit, setFormMaxLimit] = useState<number>(0);
  const [formCurrentOverdraft, setFormCurrentOverdraft] = useState<number>(0);
  const [formInterestRate, setFormInterestRate] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<OverdraftLimit['status']>('APPROVED');

  const [limits, setLimits] = useState<OverdraftLimit[]>([
    {
      id: 'ovd_9912',
      driverName: 'Marcus Vance',
      driverId: 'drv_9821_demo',
      maxLimit: 500.00,
      currentOverdraft: 120.00,
      interestRate: 5.0,
      status: 'APPROVED',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ovd_9913',
      driverName: 'Amara Diop',
      driverId: 'drv_4512_demo',
      maxLimit: 1000.00,
      currentOverdraft: 0.00,
      interestRate: 4.5,
      status: 'APPROVED',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ovd_9914',
      driverName: 'Evans Boateng',
      driverId: 'drv_2210',
      maxLimit: 250.00,
      currentOverdraft: 250.00,
      interestRate: 6.0,
      status: 'REVIEW_REQUIRED',
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  // Listen to Add New trigger from header
  useEffect(() => {
    if (addNewTrigger && addNewTrigger > 0) {
      handleOpenCreate();
    }
  }, [addNewTrigger]);

  const handleOpenCreate = () => {
    setSelectedId(null);
    setFormDriverName('');
    setFormMaxLimit(200);
    setFormCurrentOverdraft(0);
    setFormInterestRate(5.0);
    setFormStatus('REVIEW_REQUIRED');
    setIsEditMode(true); // Always active in create mode
    setView('manage');
    onViewChange?.('manage');
  };

  const handleOpenManage = (limit: OverdraftLimit) => {
    setSelectedId(limit.id);
    setFormDriverName(limit.driverName);
    setFormMaxLimit(limit.maxLimit);
    setFormCurrentOverdraft(limit.currentOverdraft);
    setFormInterestRate(limit.interestRate);
    setFormStatus(limit.status);
    setIsEditMode(false); // Disabled in edit mode until clicked to edit
    setView('manage');
    onViewChange?.('manage');
  };

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDriverName.trim()) {
      triggerToast('Please specify a driver profile.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    const isNew = selectedId === null;
    const finalId = isNew ? 'ovd_' + Math.floor(Math.random() * 10000) : selectedId!;

    const updatedLimit: OverdraftLimit = {
      id: finalId,
      driverName: formDriverName,
      driverId: isNew ? 'drv_' + Math.floor(Math.random() * 10000) : limits.find(l => l.id === selectedId)?.driverId || 'drv_gen',
      maxLimit: formMaxLimit,
      currentOverdraft: formCurrentOverdraft,
      interestRate: formInterestRate,
      status: formStatus,
      updatedAt: new Date().toISOString()
    };

    if (isNew) {
      setLimits(prev => [...prev, updatedLimit]);
      triggerToast(`Overdraft account ${finalId} created successfully.`);
    } else {
      setLimits(prev => prev.map(l => l.id === selectedId ? updatedLimit : l));
      triggerToast(`Overdraft account ${selectedId} updated successfully.`);
    }

    setShowSaveConfirm(false);
    setShowSaveSuccess(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId === null) return;
    setLimits(prev => prev.filter(l => l.id !== selectedId));
    setShowDeleteConfirm(false);
    triggerToast(`Overdraft account record ${selectedId} suspended.`);
    setView('list');
    onViewChange?.('list');
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Driver Overdraft & Microcredit Registers</h3>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              height: '38px',
              boxSizing: 'border-box'
            }}>
              <input
                type="text"
                placeholder="Search driver limit..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{
                  height: '100%',
                  padding: '0 1rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.8rem',
                  outline: 'none',
                  width: '220px'
                }}
              />
              <button
                onClick={() => triggerToast(`Searching for "${searchQuery}"...`)}
                style={{
                  height: '100%',
                  padding: '0 1.25rem',
                  background: 'rgba(15,15,15,0.95)',
                  border: 'none',
                  borderLeft: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#000';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15,15,15,0.95)';
                  e.currentTarget.style.color = '#fff';
                }}
              >
                <Search size={15} />
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Limit ID</th>
                  <th>Driver / Entity Name</th>
                  <th>Overdraft Limit</th>
                  <th>Balance Utilized</th>
                  <th>Interest Charge</th>
                  <th>Risk Assessment</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = limits.filter(l => l.driverName.toLowerCase().includes(searchQuery.toLowerCase()) || l.id.includes(searchQuery));
                  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                  return paginated.map(limit => (
                    <tr key={limit.id}>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{limit.id}</td>
                      <td>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{limit.driverName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>ID: {limit.driverId}</div>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>${limit.maxLimit.toLocaleString()}</td>
                      <td style={{ color: limit.currentOverdraft > 0 ? '#ef4444' : 'var(--foreground-muted)' }}>
                        ${limit.currentOverdraft.toLocaleString()}
                      </td>
                      <td>{limit.interestRate}%</td>
                      <td>
                        <span className={`badge ${limit.status === 'APPROVED' ? 'badge-approved' : limit.status === 'REVIEW_REQUIRED' ? 'badge-pending' : 'badge-rejected'}`}>
                          {limit.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} 
                          onClick={() => handleOpenManage(limit)}
                        >
                          <Sliders size={12} /> Manage Limit
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={limits.filter(l => l.driverName.toLowerCase().includes(searchQuery.toLowerCase()) || l.id.includes(searchQuery)).length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          </div>
        </div>
      )}

      {/* ── MANAGE VIEW ── */}
      {view === 'manage' && (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={() => { setView('list'); onViewChange?.('list'); }} 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                title="Back to List"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={22} style={{ color: 'var(--primary)' }} /> {selectedId === null ? 'Establish New Overdraft Limit' : `Manage Limit: ${formDriverName}`}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                  Overdraft registry • Limit ID: <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{selectedId === null ? 'NEW_LIMIT' : selectedId}</span>
                  {!isEditMode && <span style={{ marginLeft: '0.75rem', background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(255,184,0,0.2)' }}>VIEW ONLY</span>}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {selectedId !== null && (
                <button 
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }} 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={14} /> Suspend Credit Line
                </button>
              )}
              {selectedId !== null && (
                isEditMode ? (
                  <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setIsEditMode(false)}>
                    <X size={14} /> Cancel Edit
                  </button>
                ) : (
                  <button 
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} 
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit2 size={14} /> Edit Parameters
                  </button>
                )
              )}
            </div>
          </div>

          <form onSubmit={handleRequestSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '280px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>DRIVER PROFILE / ENTITY NAME</label>
                  <input 
                    type="text" 
                    value={formDriverName} 
                    onChange={(e) => setFormDriverName(e.target.value)} 
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      background: isEditMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                      fontSize: '0.85rem', outline: 'none'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>MAX OVERDRAFT LIMIT ($)</label>
                  <input 
                    type="number" 
                    value={formMaxLimit} 
                    onChange={(e) => setFormMaxLimit(parseInt(e.target.value) || 0)} 
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      background: isEditMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                      fontSize: '0.85rem', outline: 'none'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>CURRENT BALANCE UTILIZED ($)</label>
                  <input 
                    type="number" 
                    value={formCurrentOverdraft} 
                    onChange={(e) => setFormCurrentOverdraft(parseInt(e.target.value) || 0)} 
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      background: isEditMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                      fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>INTEREST CHARGE RATE (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formInterestRate} 
                    onChange={(e) => setFormInterestRate(parseFloat(e.target.value) || 0)} 
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      background: isEditMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                      fontSize: '0.85rem', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>CREDIT STATUS STATE</label>
                  <select 
                    value={formStatus} 
                    onChange={(e) => setFormStatus(e.target.value as any)} 
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      background: isEditMode ? '#1a1a1a' : '#0a0a0a',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                      fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value="APPROVED">APPROVED (Active Limit)</option>
                    <option value="SUSPENDED">SUSPENDED (Block Payouts)</option>
                    <option value="REVIEW_REQUIRED">REVIEW REQUIRED (Manual Review)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom actions - shown when isEditMode is active (which is always true in create mode or when clicked in edit) */}
            {isEditMode && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }} onClick={() => selectedId === null ? (setView('list'), onViewChange?.('list')) : setIsEditMode(false)}>
                  Discard
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}
                >
                  <Save size={14} /> {selectedId === null ? 'Create Limit' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── CONFIRMATIONS & SUCCESS MODALS ── */}
      {showSaveConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Confirm Credit Limit Adjust?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to deploy this overdraft change? The driver's mobile wallet will update with the new borrowing cap instantly.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowSaveConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '700' }} onClick={handleConfirmSave}>Yes, Apply</button>
            </div>
          </div>
        </div>
      )}

      {showSaveSuccess && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Credit Line Allocated</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              The modified parameters are live. Driver wallet checkouts have been updated.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowSaveSuccess(false); setIsEditMode(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Suspend Overdraft Facility?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to suspend this driver's microcredit line? They will not be able to borrow fuel advances.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={handleConfirmDelete}>Confirm Suspend</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
