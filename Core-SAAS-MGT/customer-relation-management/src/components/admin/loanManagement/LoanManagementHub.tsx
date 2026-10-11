import React, { useState, useEffect } from 'react';
import { 
  Banknote, Search, Eye, Trash2, X, Sliders, ArrowLeft, Edit2, Save, AlertTriangle, CheckCircle 
} from 'lucide-react';
import Pagination from '../../Pagination';

interface Loan {
  id: string;
  borrower: string;
  principal: number;
  interestRate: number;
  status: 'ACTIVE' | 'PAID' | 'DEFAULTED';
  nextPaymentDate: string;
  durationMonths?: number;
  totalRepaid?: number;
}

interface LoanManagementHubProps {
  triggerToast: (msg: string) => void;
  addNewTrigger?: number;
  onViewChange?: (view: 'list' | 'manage') => void;
}

export default function LoanManagementHub({ triggerToast, addNewTrigger, onViewChange }: LoanManagementHubProps) {
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
  const [formBorrower, setFormBorrower] = useState('');
  const [formPrincipal, setFormPrincipal] = useState<number>(0);
  const [formRate, setFormRate] = useState<number>(5.0);
  const [formDuration, setFormDuration] = useState<number>(12);
  const [formRepaid, setFormRepaid] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<Loan['status']>('ACTIVE');

  const [loans, setLoans] = useState<Loan[]>([
    {
      id: 'ln_3312',
      borrower: 'Chama Pool Group A',
      principal: 5000.00,
      interestRate: 4.5,
      status: 'ACTIVE',
      nextPaymentDate: new Date(Date.now() + 86400000 * 15).toISOString(),
      durationMonths: 12,
      totalRepaid: 1250.00
    },
    {
      id: 'ln_3313',
      borrower: 'Evans Vehicle Finance',
      principal: 12500.00,
      interestRate: 6.0,
      status: 'DEFAULTED',
      nextPaymentDate: new Date(Date.now() - 86400000 * 30).toISOString(),
      durationMonths: 24,
      totalRepaid: 3400.00
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
    setFormBorrower('');
    setFormPrincipal(1000);
    setFormRate(5.0);
    setFormDuration(12);
    setFormRepaid(0);
    setFormStatus('ACTIVE');
    setIsEditMode(true); // Always active in create mode
    setView('manage');
    onViewChange?.('manage');
  };

  const handleOpenManage = (loan: Loan) => {
    setSelectedId(loan.id);
    setFormBorrower(loan.borrower);
    setFormPrincipal(loan.principal);
    setFormRate(loan.interestRate);
    setFormDuration(loan.durationMonths || 12);
    setFormRepaid(loan.totalRepaid || 0);
    setFormStatus(loan.status);
    setIsEditMode(false); // Disabled in edit mode until clicked to edit
    setView('manage');
    onViewChange?.('manage');
  };

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBorrower.trim() || formPrincipal <= 0) {
      triggerToast('Please provide valid loan details.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    const isNew = selectedId === null;
    const finalId = isNew ? 'ln_' + Math.floor(Math.random() * 10000) : selectedId!;

    const updatedLoan: Loan = {
      id: finalId,
      borrower: formBorrower,
      principal: formPrincipal,
      interestRate: formRate,
      status: formStatus,
      nextPaymentDate: isNew ? new Date(Date.now() + 86400000 * 30).toISOString() : loans.find(l => l.id === selectedId)?.nextPaymentDate || new Date().toISOString(),
      durationMonths: formDuration,
      totalRepaid: formRepaid
    };

    if (isNew) {
      setLoans(prev => [...prev, updatedLoan]);
      triggerToast(`Loan record ${finalId} created successfully.`);
    } else {
      setLoans(prev => prev.map(l => l.id === selectedId ? updatedLoan : l));
      triggerToast(`Loan record ${selectedId} updated successfully.`);
    }

    setShowSaveConfirm(false);
    setShowSaveSuccess(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId === null) return;
    setLoans(prev => prev.filter(l => l.id !== selectedId));
    setShowDeleteConfirm(false);
    triggerToast(`Loan record ${selectedId} deleted.`);
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
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Vehicle & Group Loan Portfolio</h3>
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
                placeholder="Search borrower..."
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
                  <th>Loan ID</th>
                  <th>Borrower / Entity</th>
                  <th>Principal Amount</th>
                  <th>Interest Rate</th>
                  <th>Next Payment Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = loans.filter(l => l.borrower.toLowerCase().includes(searchQuery.toLowerCase()));
                  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                  return paginated.map(loan => (
                    <tr key={loan.id}>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{loan.id}</td>
                      <td><div style={{ fontWeight: 'bold' }}>{loan.borrower}</div></td>
                      <td style={{ fontWeight: 'bold' }}>${loan.principal.toLocaleString()}</td>
                      <td>{loan.interestRate}%</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
                        {new Date(loan.nextPaymentDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${loan.status === 'ACTIVE' ? 'badge-approved' : loan.status === 'PAID' ? 'badge-approved' : 'badge-rejected'}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} 
                          onClick={() => handleOpenManage(loan)}
                        >
                          <Sliders size={12} /> Manage Loan
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
              totalItems={loans.filter(l => l.borrower.toLowerCase().includes(searchQuery.toLowerCase())).length}
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
                  <Banknote size={22} style={{ color: 'var(--primary)' }} /> {selectedId === null ? 'Disburse New Loan' : `Manage Loan: ${formBorrower}`}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                  Loan registry • Portfolio ID: <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{selectedId === null ? 'NEW_LOAN' : selectedId}</span>
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
                  <Trash2 size={14} /> Remove Record
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>BORROWER / ENTITY NAME</label>
                  <input 
                    type="text" 
                    value={formBorrower} 
                    onChange={(e) => setFormBorrower(e.target.value)} 
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>PRINCIPAL AMOUNT ($)</label>
                  <input 
                    type="number" 
                    value={formPrincipal} 
                    onChange={(e) => setFormPrincipal(parseInt(e.target.value) || 0)} 
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>INTEREST RATE (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formRate} 
                    onChange={(e) => setFormRate(parseFloat(e.target.value) || 0)} 
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>DURATION (MONTHS)</label>
                  <select 
                    value={formDuration} 
                    onChange={(e) => setFormDuration(parseInt(e.target.value) || 12)}
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      background: isEditMode ? '#1a1a1a' : '#0a0a0a',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                      fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                    <option value={24}>24 Months</option>
                    <option value={36}>36 Months</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>TOTAL REPAID ($)</label>
                  <input 
                    type="number" 
                    value={formRepaid} 
                    onChange={(e) => setFormRepaid(parseInt(e.target.value) || 0)} 
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', fontWeight: 'bold' }}>OUTSTANDING BALANCE</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.2rem' }}>
                    ${(formPrincipal - formRepaid).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>LOAN PORTFOLIO STATUS</label>
                  <select 
                    value={formStatus} 
                    onChange={(e) => setFormStatus(e.target.value as any)} 
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.5rem',
                      background: isEditMode ? '#1a1a1a' : '#0a0a0a',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.35rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                      fontSize: '0.8rem', outline: 'none'
                    }}
                  >
                    <option value="ACTIVE">ACTIVE (Accruing Repayments)</option>
                    <option value="PAID">PAID (Settled)</option>
                    <option value="DEFAULTED">DEFAULTED (Written Off)</option>
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
                  <Save size={14} /> {selectedId === null ? 'Create Loan' : 'Save Changes'}
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Confirm Loan Disbursal/Update?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to commit these loan registry values? Financial ledger balances will reflect this adjustment.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowSaveConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '700' }} onClick={handleConfirmSave}>Yes, Commit</button>
            </div>
          </div>
        </div>
      )}

      {showSaveSuccess && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Loan Ledger Commited</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              The modified parameters are live. Outstanding balances have been recalculated.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowSaveSuccess(false); setIsEditMode(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Delete Loan Portfolio Record?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              This will permanently delete the loan contract entry. This action cannot be undone.
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
