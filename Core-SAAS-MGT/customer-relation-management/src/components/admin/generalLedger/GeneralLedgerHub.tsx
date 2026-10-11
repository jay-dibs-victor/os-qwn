import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Eye, Trash2, X, Sliders, ArrowLeft, Edit2, Save, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore'
import { createGlAccount, getGlAccount, getGlAccountsTree, listGlAccounts, updateGlAccount, type GlAccount, type GlAccountType } from '../../../api/ledger'
import Pagination from '../../Pagination'

type UiAccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
type UiAccountStatus = 'ACTIVE' | 'FROZEN'

const uiToApiType: Record<UiAccountType, GlAccountType> = {
  ASSET: 'asset',
  LIABILITY: 'liability',
  EQUITY: 'equity',
  REVENUE: 'income',
  EXPENSE: 'expense',
}

function apiToUiType(type: GlAccountType): UiAccountType {
  if (type === 'income') return 'REVENUE'
  return type.toUpperCase() as UiAccountType
}

function toNumber(value: number | string) {
  if (typeof value === 'number') return value
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

interface GeneralLedgerHubProps {
  triggerToast: (msg: string) => void;
  addNewTrigger?: number;
  onViewChange?: (view: 'list' | 'manage') => void;
}

export default function GeneralLedgerHub({ triggerToast, addNewTrigger, onViewChange }: GeneralLedgerHubProps) {
  const [view, setView] = useState<'list' | 'manage'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const tenantId = useAuthStore((s) => s.tenantId)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTreeModal, setShowTreeModal] = useState(false)
  const [treeText, setTreeText] = useState('')

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<UiAccountType>('ASSET');
  const [formBalance, setFormBalance] = useState<number>(0);
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formStatus, setFormStatus] = useState<UiAccountStatus>('ACTIVE');
  const [formDesc, setFormDesc] = useState('');

  const [accounts, setAccounts] = useState<GlAccount[]>([]);

  useEffect(() => {
    if (!tenantId) return
    void (async () => {
      try {
        const rows = await listGlAccounts(tenantId)
        setAccounts(rows)
      } catch {
        triggerToast('Failed to load ledger accounts.')
      }
    })()
  }, [tenantId])

  // Listen to Add New trigger from header
  useEffect(() => {
    if (addNewTrigger && addNewTrigger > 0) {
      handleOpenCreate();
    }
  }, [addNewTrigger]);

  const handleOpenCreate = () => {
    setSelectedId(null);
    setSelectedCode(null);
    setFormName('');
    setFormType('ASSET');
    setFormBalance(0);
    setFormCurrency('USD');
    setFormStatus('ACTIVE');
    setFormDesc('');
    setIsEditMode(true); // Always active in create mode
    setView('manage');
    onViewChange?.('manage');
  };

  const handleOpenManage = (account: GlAccount) => {
    setSelectedId(account.id);
    setSelectedCode(account.code);
    setFormName(account.name);
    setFormType(apiToUiType(account.type));
    setFormBalance(toNumber(account.balance));
    setFormCurrency(account.currency);
    setFormStatus((account.status ?? 'ACTIVE') as UiAccountStatus);
    setFormDesc(account.description ?? '');
    setIsEditMode(false); // Disabled in edit mode until clicked to edit
    setView('manage');
    onViewChange?.('manage');

    void (async () => {
      try {
        const fresh = await getGlAccount(account.id)
        setAccounts((prev) => prev.map((a) => (a.id === account.id ? fresh : a)))
        setFormName(fresh.name);
        setFormType(apiToUiType(fresh.type));
        setFormBalance(toNumber(fresh.balance));
        setFormCurrency(fresh.currency);
        setFormStatus((fresh.status ?? 'ACTIVE') as UiAccountStatus);
        setFormDesc(fresh.description ?? '');
      } catch {
        triggerToast('Failed to refresh ledger account.')
      }
    })()
  };

  const handleLoadTree = async () => {
    try {
      const tree = await getGlAccountsTree()
      setTreeText(JSON.stringify(tree, null, 2))
      setShowTreeModal(true)
    } catch {
      triggerToast('Failed to load chart of accounts tree.')
    }
  }

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      triggerToast('Please provide an account name.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    const isNew = selectedId === null;
    const finalCode = isNew ? 'GL-' + Math.floor(1000 + Math.random() * 9000) : selectedCode!;

    if (!tenantId) {
      setShowSaveConfirm(false)
      triggerToast('Tenant is not resolved for this session.')
      return
    }

    try {
      if (isNew) {
        const created = await createGlAccount({
          tenantId,
          code: finalCode,
          name: formName,
          type: uiToApiType[formType],
          currency: formCurrency,
          status: formStatus,
          description: formDesc,
        })
        setAccounts((prev) => [...prev, created])
        setSelectedId(created.id)
        setSelectedCode(created.code)
        triggerToast(`Ledger account ${created.code} created successfully.`)
      } else {
        const updated = await updateGlAccount(selectedId!, {
          name: formName,
          type: uiToApiType[formType],
          currency: formCurrency,
          status: formStatus,
          description: formDesc,
        })
        setAccounts((prev) => prev.map((a) => (a.id === selectedId ? updated : a)))
        triggerToast(`Ledger account ${finalCode} updated successfully.`)
      }

      setShowSaveConfirm(false)
      setShowSaveSuccess(true)
    } catch {
      setShowSaveConfirm(false)
      triggerToast('Failed to save ledger account.')
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedId === null) return;
    try {
      const updated = await updateGlAccount(selectedId, { status: 'FROZEN' })
      setAccounts((prev) => prev.map((a) => (a.id === selectedId ? updated : a)))
      setShowDeleteConfirm(false);
      triggerToast(`Ledger account ${selectedCode ?? selectedId} decommissioned.`);
      setView('list');
      onViewChange?.('list');
    } catch {
      setShowDeleteConfirm(false);
      triggerToast('Failed to freeze ledger account.');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>General Ledger & Double-Entry Accounts</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  placeholder="Search ledger accounts..."
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

              <button
                className="btn btn-secondary"
                style={{ height: '38px', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', textTransform: 'none' }}
                onClick={handleLoadTree}
              >
                <Eye size={14} /> COA Tree
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Account Number</th>
                  <th>Account Title</th>
                  <th>Classification</th>
                  <th>Ledger Balance</th>
                  <th>Currency</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = accounts.filter(a =>
                    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.code.includes(searchQuery)
                  );
                  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                  return (
                    <>
                      {paginated.map(account => (
                        <tr key={account.id}>
                          <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{account.code}</td>
                          <td>
                            <div style={{ fontWeight: 'bold', color: '#fff' }}>{account.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>{account.description}</div>
                          </td>
                          <td>{apiToUiType(account.type)}</td>
                          <td style={{ fontWeight: 'bold', color: toNumber(account.balance) >= 0 ? '#10b981' : '#ef4444' }}>
                            ${toNumber(account.balance).toLocaleString()}
                          </td>
                          <td>{account.currency}</td>
                          <td>
                            <span className={`badge ${(account.status ?? 'ACTIVE') === 'ACTIVE' ? 'badge-approved' : 'badge-rejected'}`}>
                              {account.status ?? 'ACTIVE'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}
                              onClick={() => handleOpenManage(account)}
                            >
                              <Sliders size={12} /> Manage Account
                            </button>
                          </td>
                        </tr>
                      ))}
                      {paginated.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>No ledger accounts found.</td>
                        </tr>
                      )}
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={accounts.filter(a =>
              a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.code.includes(searchQuery)
            ).length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
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
                  <FileText size={22} style={{ color: 'var(--primary)' }} /> {selectedId === null ? 'Open New GL Account' : `Manage GL Account: ${formName}`}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                  Double entry registry • Account Number: <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{selectedId === null ? 'NEW_ACCOUNT' : (selectedCode ?? selectedId)}</span>
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
                  <Trash2 size={14} /> Freeze/Close Account
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>ACCOUNT TITLE / NAME</label>
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>CLASSIFICATION TYPE</label>
                  <select 
                    value={formType} 
                    onChange={(e) => setFormType(e.target.value as any)} 
                    disabled={!isEditMode}
                    style={{
                      width: '100%', padding: '0.65rem 1rem',
                      background: isEditMode ? '#1a1a1a' : '#0a0a0a',
                      border: `1px solid ${isEditMode ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: '0.5rem', color: isEditMode ? '#fff' : 'var(--foreground-muted)',
                      fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    <option value="ASSET">ASSET (Cash, float accounts)</option>
                    <option value="LIABILITY">LIABILITY (Customer escrow deposits)</option>
                    <option value="EQUITY">EQUITY (Capital pools)</option>
                    <option value="REVENUE">REVENUE (Service commissions)</option>
                    <option value="EXPENSE">EXPENSE (Platform operating overhead)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>OPENING BALANCE</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formBalance} 
                    onChange={(e) => setFormBalance(parseFloat(e.target.value) || 0)} 
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
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>BASE CURRENCY</label>
                  <input 
                    type="text" 
                    value={formCurrency} 
                    onChange={(e) => setFormCurrency(e.target.value)} 
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

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>LEDGER ACCOUNT DESCRIPTION</label>
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem' }}>ACCOUNT STATE</label>
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
                  <option value="ACTIVE">ACTIVE (Open for postings)</option>
                  <option value="FROZEN">FROZEN (Halt all entry posting)</option>
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
                  <Save size={14} /> {selectedId === null ? 'Create Account' : 'Save Changes'}
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Confirm Ledger Post?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to adjust parameters on this general ledger control account? Any offset imbalance will impact system trial balance auditing.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowSaveConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '700' }} onClick={handleConfirmSave}>Commit Post</button>
            </div>
          </div>
        </div>
      )}

      {showSaveSuccess && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>General Ledger Modulated</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Account metrics updated and broadcasted to NATS ledger nodes.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowSaveSuccess(false); setIsEditMode(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Freeze General Ledger Account?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to lock this account? Postings will be blocked immediately.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={handleConfirmDelete}>Confirm Lock</button>
            </div>
          </div>
        </div>
      )}

      {showTreeModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '780px', width: '92%', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900' }}>Chart of Accounts Tree</h3>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.9rem' }} onClick={() => setShowTreeModal(false)}>Close</button>
            </div>
            <pre style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', padding: '1rem', overflowX: 'auto', maxHeight: '65vh', whiteSpace: 'pre-wrap', color: '#fff' }}>
              {treeText || 'No data.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
