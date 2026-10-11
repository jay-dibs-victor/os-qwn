import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Search, Eye, Trash2, X, Sliders, ArrowLeft, Edit2, Save, AlertTriangle, CheckCircle 
} from 'lucide-react';
import Pagination from '../../Pagination';

interface FeeRule {
  id: string;
  name: string;
  category: string;
  rateType: 'PERCENTAGE' | 'FIXED';
  value: number;
  capAmount?: number;
  status: 'ACTIVE' | 'PAUSED';
  description: string;
}

interface FeesManagementHubProps {
  triggerToast: (msg: string) => void;
  addNewTrigger?: number;
  onViewChange?: (view: 'list' | 'manage') => void;
}

export default function FeesManagementHub({ triggerToast, addNewTrigger, onViewChange }: FeesManagementHubProps) {
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
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formRateType, setFormRateType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [formValue, setFormValue] = useState<number>(0);
  const [formCap, setFormCap] = useState<number>(0);
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');

  const [feeRules, setFeeRules] = useState<FeeRule[]>([
    {
      id: 'fee_rev_001',
      name: 'Standard Reversal Processing Fee',
      category: 'Reversals',
      rateType: 'PERCENTAGE',
      value: 1.5,
      capAmount: 25.00,
      status: 'ACTIVE',
      description: 'Applied to all successful driver reversal payouts.'
    },
    {
      id: 'fee_chama_002',
      name: 'Chama Escrow Trust Settlement',
      category: 'Chama Groups',
      rateType: 'FIXED',
      value: 10.00,
      status: 'ACTIVE',
      description: 'Flat fee charged when Chama cycle trust funds are disbursed.'
    },
    {
      id: 'fee_fuel_003',
      name: 'Solar Swap Premium Surcharge',
      category: 'Fuel & Swap',
      rateType: 'PERCENTAGE',
      value: 0.8,
      capAmount: 5.00,
      status: 'PAUSED',
      description: 'Charged on fast energy replenishment outside operating zones.'
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
    setFormName('');
    setFormCategory('General');
    setFormRateType('PERCENTAGE');
    setFormValue(0);
    setFormCap(0);
    setFormDesc('');
    setFormStatus('ACTIVE');
    setIsEditMode(true); // Always active in create mode
    setView('manage');
    onViewChange?.('manage');
  };

  const handleOpenManage = (fee: FeeRule) => {
    setSelectedId(fee.id);
    setFormName(fee.name);
    setFormCategory(fee.category);
    setFormRateType(fee.rateType);
    setFormValue(fee.value);
    setFormCap(fee.capAmount || 0);
    setFormDesc(fee.description);
    setFormStatus(fee.status);
    setIsEditMode(false); // Disabled in edit mode until clicked to edit
    setView('manage');
    onViewChange?.('manage');
  };

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      triggerToast('Please provide a valid rule name.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    const isNew = selectedId === null;
    const finalId = isNew ? 'fee_' + Math.floor(Math.random() * 10000) : selectedId!;
    
    const updatedFee: FeeRule = {
      id: finalId,
      name: formName,
      category: formCategory,
      rateType: formRateType,
      value: formValue,
      capAmount: formCap > 0 ? formCap : undefined,
      status: formStatus,
      description: formDesc
    };

    if (isNew) {
      setFeeRules(prev => [...prev, updatedFee]);
      triggerToast(`Fee rule ${finalId} created successfully.`);
    } else {
      setFeeRules(prev => prev.map(f => f.id === selectedId ? updatedFee : f));
      triggerToast(`Fee rule ${selectedId} updated successfully.`);
    }

    setShowSaveConfirm(false);
    setShowSaveSuccess(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId === null) return;
    setFeeRules(prev => prev.filter(f => f.id !== selectedId));
    setShowDeleteConfirm(false);
    triggerToast(`Fee rule ${selectedId} deleted successfully.`);
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
              <DollarSign style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Spread Coefficients & Platform Fees</h3>
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
                placeholder="Search fee rules..."
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
                  <th>Rule ID</th>
                  <th>Fee Rule Title</th>
                  <th>Category</th>
                  <th>Formula Rate</th>
                  <th>Cap Limit</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = feeRules.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase()));
                  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                  return paginated.map(fee => (
                    <tr key={fee.id}>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{fee.id}</td>
                      <td>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{fee.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>{fee.description}</div>
                      </td>
                      <td>{fee.category}</td>
                      <td style={{ fontWeight: 'bold' }}>
                        {fee.value}{fee.rateType === 'PERCENTAGE' ? '%' : ' USD'}
                      </td>
                      <td>{fee.capAmount ? `$${fee.capAmount.toFixed(2)}` : 'None'}</td>
                      <td>
                        <span className={`badge ${fee.status === 'ACTIVE' ? 'badge-approved' : 'badge-rejected'}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} 
                          onClick={() => handleOpenManage(fee)}
                        >
                          <Sliders size={12} /> Manage Rule
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
              totalItems={feeRules.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase())).length}
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
                  <DollarSign size={22} style={{ color: 'var(--primary)' }} /> {selectedId === null ? 'Deploy New Fee Rule' : `Manage Fee Rule: ${formName}`}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                  Coefficients registry • ID: <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{selectedId === null ? 'NEW_FEE' : selectedId}</span>
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
                  <Trash2 size={14} /> Remove Rule
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>FEE RULE TITLE</label>
                  <input 
                    type="text" 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)} 
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>CATEGORY</label>
                  <input 
                    type="text" 
                    value={formCategory} 
                    onChange={(e) => setFormCategory(e.target.value)} 
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>FORMULA TYPE</label>
                  <select 
                    value={formRateType} 
                    onChange={(e) => setFormRateType(e.target.value as any)} 
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      background: isEditMode ? '#1a1a1a' : '#0a0a0a',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                      fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed (USD)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>VALUE</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formValue} 
                    onChange={(e) => setFormValue(parseFloat(e.target.value) || 0)} 
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>CAP LIMIT AMOUNT ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formCap} 
                    onChange={(e) => setFormCap(parseFloat(e.target.value) || 0)} 
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
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>RULE APPLICATION DESCRIPTION</label>
                <textarea 
                  value={formDesc} 
                  onChange={(e) => setFormDesc(e.target.value)} 
                  disabled={!isEditMode}
                  rows={3}
                  style={{
                    width: '100%', padding: '0.65rem 1rem',
                    background: isEditMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                    fontSize: '0.85rem', outline: 'none', resize: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>FEE ROUTING STATE</label>
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
                  <option value="ACTIVE">ACTIVE (Instantly Applied)</option>
                  <option value="PAUSED">PAUSED (Inactive)</option>
                </select>
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
                  <Save size={14} /> {selectedId === null ? 'Create Rule' : 'Save Changes'}
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Confirm Fee Registry Update?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to deploy these changes? Modified rates will be applied to matching transactions immediately.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowSaveConfirm(false)}>No, Cancel</button>
              <button className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '700' }} onClick={handleConfirmSave}>Yes, Apply</button>
            </div>
          </div>
        </div>
      )}

      {showSaveSuccess && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Fee Coefficients Configured</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              The system spread parameters have been updated and broadcasted to the NATS ledger coordinator.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowSaveSuccess(false); setIsEditMode(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Decommission Fee Rule?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              This will permanently delete the fee rule. Any transaction under this tier will default to base system pricing.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={handleConfirmDelete}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
