import React, { useState, useEffect } from 'react';
import { 
  Banknote, Search, Eye, Trash2, X, Sliders, ArrowLeft, Edit2, Save, AlertTriangle, CheckCircle 
} from 'lucide-react';
import Pagination from '../../Pagination';

interface Charge {
  id: string;
  name: string;
  amount: number;
  frequency: 'ONE_OFF' | 'RECURRING';
  applicableTo: 'ALL' | 'DRIVERS' | 'PASSENGERS';
  status: 'ACTIVE' | 'INACTIVE';
}

interface ChargesManagementHubProps {
  triggerToast: (msg: string) => void;
  addNewTrigger?: number;
  onViewChange?: (view: 'list' | 'manage') => void;
}

export default function ChargesManagementHub({ triggerToast, addNewTrigger, onViewChange }: ChargesManagementHubProps) {
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
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formFrequency, setFormFrequency] = useState<'ONE_OFF' | 'RECURRING'>('ONE_OFF');
  const [formApplicableTo, setFormApplicableTo] = useState<'ALL' | 'DRIVERS' | 'PASSENGERS'>('ALL');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const [charges, setCharges] = useState<Charge[]>([
    {
      id: 'chg_001',
      name: 'Driver Registration Fee',
      amount: 50.0,
      frequency: 'ONE_OFF',
      applicableTo: 'DRIVERS',
      status: 'ACTIVE'
    },
    {
      id: 'chg_002',
      name: 'Platform Access Charge',
      amount: 15.0,
      frequency: 'RECURRING',
      applicableTo: 'ALL',
      status: 'ACTIVE'
    }
  ]);

  useEffect(() => {
    if (addNewTrigger && addNewTrigger > 0) {
      handleOpenCreate();
    }
  }, [addNewTrigger]);

  const handleOpenCreate = () => {
    setSelectedId(null);
    setFormName('');
    setFormAmount(0);
    setFormFrequency('ONE_OFF');
    setFormApplicableTo('ALL');
    setFormStatus('ACTIVE');
    setIsEditMode(true);
    setView('manage');
    onViewChange?.('manage');
  };

  const handleOpenManage = (charge: Charge) => {
    setSelectedId(charge.id);
    setFormName(charge.name);
    setFormAmount(charge.amount);
    setFormFrequency(charge.frequency);
    setFormApplicableTo(charge.applicableTo);
    setFormStatus(charge.status);
    setIsEditMode(false);
    setView('manage');
    onViewChange?.('manage');
  };

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formAmount < 0) {
      triggerToast('Please provide valid charge parameters.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    const isNew = selectedId === null;
    const finalId = isNew ? 'chg_' + Math.floor(Math.random() * 10000) : selectedId!;

    const updatedCharge: Charge = {
      id: finalId,
      name: formName,
      amount: formAmount,
      frequency: formFrequency,
      applicableTo: formApplicableTo,
      status: formStatus
    };

    if (isNew) {
      setCharges(prev => [...prev, updatedCharge]);
      triggerToast(`Charge ${finalId} created successfully.`);
    } else {
      setCharges(prev => prev.map(c => c.id === selectedId ? updatedCharge : c));
      triggerToast(`Charge ${selectedId} updated successfully.`);
    }

    setShowSaveConfirm(false);
    setShowSaveSuccess(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId === null) return;
    setCharges(prev => prev.filter(c => c.id !== selectedId));
    setShowDeleteConfirm(false);
    triggerToast(`Charge ${selectedId} deleted.`);
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
              <Banknote style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>System Charges & Deductions</h3>
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
                placeholder="Search charges..."
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
                  <th>ID</th>
                  <th>Charge Name</th>
                  <th>Amount</th>
                  <th>Frequency</th>
                  <th>Applicable To</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = charges.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
                  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                  return paginated.map(charge => (
                    <tr key={charge.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{charge.id}</td>
                      <td><div style={{ fontWeight: 'bold', color: '#fff' }}>{charge.name}</div></td>
                      <td><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${charge.amount.toFixed(2)}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{charge.frequency}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{charge.applicableTo}</td>
                      <td>
                        <span className={`badge ${charge.status === 'ACTIVE' ? 'badge-approved' : 'badge-rejected'}`}>
                          {charge.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} 
                          onClick={() => handleOpenManage(charge)}
                        >
                          <Sliders size={12} /> Manage
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
              totalItems={charges.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            />
          </div>
        </div>
      )}

      {/* ── MANAGE VIEW ── */}
      {view === 'manage' && (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
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
                  <Banknote size={22} style={{ color: 'var(--primary)' }} /> {selectedId === null ? 'Create System Charge' : `Manage Charge: ${formName}`}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                  Charge configuration • ID: <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{selectedId === null ? 'NEW_CHARGE' : selectedId}</span>
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
                  <Trash2 size={14} /> Delete
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
                    <Edit2 size={14} /> Edit Charge
                  </button>
                )
              )}
            </div>
          </div>

          <form onSubmit={handleRequestSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>CHARGE NAME</label>
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>AMOUNT ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formAmount} 
                    onChange={(e) => setFormAmount(parseFloat(e.target.value))} 
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      background: isEditMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.5rem', color: isEditMode ? 'var(--primary)' : 'var(--foreground-muted)',
                      fontSize: '0.85rem', outline: 'none'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>FREQUENCY</label>
                  <select 
                    value={formFrequency} 
                    onChange={(e) => setFormFrequency(e.target.value as any)} 
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      background: isEditMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                      fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value="ONE_OFF">One-Off</option>
                    <option value="RECURRING">Recurring</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>APPLICABLE TO</label>
                  <select 
                    value={formApplicableTo} 
                    onChange={(e) => setFormApplicableTo(e.target.value as any)} 
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      background: isEditMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                      fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value="ALL">All Users</option>
                    <option value="DRIVERS">Drivers</option>
                    <option value="PASSENGERS">Passengers</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>STATUS</label>
                  <select 
                    value={formStatus} 
                    onChange={(e) => setFormStatus(e.target.value as any)} 
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      background: isEditMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                      fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {isEditMode && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }} onClick={() => selectedId === null ? (setView('list'), onViewChange?.('list')) : setIsEditMode(false)}>
                  Discard
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}
                >
                  <Save size={14} /> {selectedId === null ? 'Create Charge' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* MODALS */}
      {showSaveConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Confirm Save</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to save changes to this system charge?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowSaveConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '700' }} onClick={handleConfirmSave}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showSaveSuccess && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Successfully Saved</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Charge parameters have been updated and synchronized.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowSaveSuccess(false); setIsEditMode(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Delete Charge?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete this system charge?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={handleConfirmDelete}>Delete Charge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
