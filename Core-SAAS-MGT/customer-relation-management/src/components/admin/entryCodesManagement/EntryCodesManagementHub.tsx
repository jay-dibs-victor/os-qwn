import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Eye, Trash2, X, Sliders, ArrowLeft, Edit2, Save, AlertTriangle, CheckCircle, PowerOff
} from 'lucide-react';
import Pagination from '../../Pagination';

interface EntryCode {
  id: string;
  code: string;
  description: string;
  glAccount: string;
  type: 'CREDIT' | 'DEBIT';
  category: 'REVENUE' | 'LIABILITY' | 'ASSET' | 'EXPENSE';
  currency: string;
  isReversible: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
  createdAt: string;
}

interface EntryCodesManagementHubProps {
  triggerToast: (msg: string) => void;
  addNewTrigger?: number;
  onViewChange?: (view: 'list' | 'manage') => void;
}

const iSt: React.CSSProperties = { width:'100%', padding:'0.6rem 0.9rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,184,0,0.2)', borderRadius:'0.5rem', color:'#fff', fontSize:'0.83rem', outline:'none', boxSizing:'border-box' };
const lSt: React.CSSProperties = { display:'block', fontSize:'0.65rem', color:'var(--foreground-muted)', fontWeight:'800', letterSpacing:'0.06em', marginBottom:'0.35rem', textTransform:'uppercase' };
const Sec = ({ title }: { title: string }) => <p style={{ fontSize:'0.65rem', color:'var(--foreground-muted)', fontWeight:'800', letterSpacing:'0.07em', margin:'2rem 0 1rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.5rem', textTransform: 'uppercase' }}>{title}</p>;
const G4 = ({ children }: { children: React.ReactNode }) => <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.5rem' }}>{children}</div>;
const F = ({ label, children }: { label: string; children: React.ReactNode }) => <div><label style={lSt}>{label}</label>{children}</div>;
const Val = ({ val }: { val: React.ReactNode }) => <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', minHeight: '36px', display: 'flex', alignItems: 'center' }}>{val || <span style={{opacity: 0.3}}>-</span>}</div>;

export default function EntryCodesManagementHub({ triggerToast, addNewTrigger, onViewChange }: EntryCodesManagementHubProps) {
  const [view, setView] = useState<'list' | 'manage'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showDeprecateConfirm, setShowDeprecateConfirm] = useState(false);

  const [formData, setFormData] = useState<Partial<EntryCode>>({});

  const [entryCodes, setEntryCodes] = useState<EntryCode[]>([
    {
      id: 'ec_1001',
      code: 'EC-SUB-01',
      description: 'Driver Subscription Payment',
      glAccount: 'GL-1044',
      type: 'CREDIT',
      category: 'REVENUE',
      currency: 'USD',
      isReversible: true,
      status: 'ACTIVE',
      createdAt: '2025-01-15T08:00:00Z'
    },
    {
      id: 'ec_1002',
      code: 'EC-PEN-02',
      description: 'Late Penalty Deduction',
      glAccount: 'GL-2051',
      type: 'DEBIT',
      category: 'LIABILITY',
      currency: 'USD',
      isReversible: false,
      status: 'ACTIVE',
      createdAt: '2025-02-10T14:30:00Z'
    }
  ]);

  useEffect(() => {
    if (addNewTrigger && addNewTrigger > 0) {
      handleOpenCreate();
    }
  }, [addNewTrigger]);

  const handleOpenCreate = () => {
    setSelectedId(null);
    setFormData({
      type: 'CREDIT',
      category: 'REVENUE',
      currency: 'USD',
      isReversible: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });
    setIsEditMode(true);
    setView('manage');
    onViewChange?.('manage');
  };

  const handleOpenManage = (code: EntryCode) => {
    setSelectedId(code.id);
    setFormData(code);
    setIsEditMode(false);
    setView('manage');
    onViewChange?.('manage');
  };

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code?.trim() || !formData.glAccount?.trim()) {
      triggerToast('Please provide valid entry code parameters.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    const isNew = selectedId === null;
    const finalId = isNew ? 'ec_' + Math.floor(Math.random() * 10000) : selectedId!;

    const updatedCode: EntryCode = {
      id: finalId,
      code: formData.code || '',
      description: formData.description || '',
      glAccount: formData.glAccount || '',
      type: formData.type || 'CREDIT',
      category: formData.category || 'REVENUE',
      currency: formData.currency || 'USD',
      isReversible: formData.isReversible || false,
      status: formData.status || 'ACTIVE',
      createdAt: formData.createdAt || new Date().toISOString()
    };

    if (isNew) {
      setEntryCodes(prev => [...prev, updatedCode]);
      triggerToast(`Entry code ${finalId} created successfully.`);
    } else {
      setEntryCodes(prev => prev.map(c => c.id === selectedId ? updatedCode : c));
      triggerToast(`Entry code ${selectedId} updated successfully.`);
    }

    setShowSaveConfirm(false);
    setShowSaveSuccess(true);
  };

  const handleConfirmDeprecate = () => {
    if (selectedId === null) return;
    setEntryCodes(prev => prev.map(c => c.id === selectedId ? { ...c, status: 'DEPRECATED' } : c));
    setShowDeprecateConfirm(false);
    triggerToast(`Entry code ${selectedId} deprecated.`);
    setFormData(prev => ({ ...prev, status: 'DEPRECATED' }));
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Entry Codes Directory</h3>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', overflow: 'hidden', height: '38px', boxSizing: 'border-box'
            }}>
              <input
                type="text" placeholder="Search codes..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ height: '100%', padding: '0 1rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', outline: 'none', width: '220px' }}
              />
              <button
                style={{
                  height: '100%', padding: '0 1.25rem', background: 'rgba(15,15,15,0.95)', border: 'none',
                  borderLeft: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
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
                  <th>Code Target</th>
                  <th>Description & GL</th>
                  <th>Category</th>
                  <th>Transaction Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = entryCodes.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase()));
                  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                  return paginated.map(code => (
                    <tr key={code.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold' }}>{code.code}</td>
                      <td>
                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{code.description}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>GL Link: {code.glAccount}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{code.category}</td>
                      <td>
                        <span style={{ color: code.type === 'CREDIT' ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {code.type}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${code.status === 'ACTIVE' ? 'badge-approved' : code.status === 'INACTIVE' ? 'badge-pending' : 'badge-rejected'}`}>
                          {code.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} onClick={() => handleOpenManage(code)}>
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
              totalItems={entryCodes.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase())).length}
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
              <button onClick={() => { setView('list'); onViewChange?.('list'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={22} style={{ color: 'var(--primary)' }} /> {selectedId === null ? 'Provision Entry Code' : `Manage Code: ${formData.code}`}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedId || 'NEW_CODE'}</span>
                  {!isEditMode && <span style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(255,184,0,0.2)' }}>VIEW ONLY</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {selectedId !== null && formData.status !== 'DEPRECATED' && (
                <button 
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }} 
                  onClick={() => setShowDeprecateConfirm(true)}
                >
                  <PowerOff size={14} /> Deprecate Code
                </button>
              )}
              {selectedId !== null && (
                isEditMode ? (
                  <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => { setIsEditMode(false); setFormData(entryCodes.find(c=>c.id===selectedId)||{}) }}>
                    <X size={14} /> Cancel Edit
                  </button>
                ) : (
                  <button 
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} 
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit2 size={14} /> Edit Target
                  </button>
                )
              )}
            </div>
          </div>

          {!isEditMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Sec title="Code Definitions" />
              <G4>
                <F label="Entry Code"><Val val={formData.code} /></F>
                <F label="Description"><Val val={formData.description} /></F>
                <F label="GL Account Target"><Val val={formData.glAccount} /></F>
                <F label="Transaction Type"><Val val={formData.type} /></F>
              </G4>
              
              <Sec title="Financial Parameters" />
              <G4>
                <F label="Classification Category"><Val val={formData.category} /></F>
                <F label="Base Currency"><Val val={formData.currency} /></F>
                <F label="Is Reversible"><Val val={formData.isReversible ? 'Yes' : 'No'} /></F>
              </G4>

              <Sec title="System Metadata" />
              <G4>
                <F label="Current Status">
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: formData.status === 'ACTIVE' ? '#10b981' : formData.status === 'INACTIVE' ? 'var(--primary)' : '#ef4444', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', minHeight: '36px', display: 'flex', alignItems: 'center' }}>
                    {formData.status}
                  </div>
                </F>
                <F label="Date Generated"><Val val={new Date(formData.createdAt || '').toLocaleDateString()} /></F>
              </G4>
            </div>
          ) : (
            <form onSubmit={handleRequestSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Sec title="Code Definitions" />
                <G4>
                  <F label="Entry Code"><input type="text" style={iSt} value={formData.code||''} onChange={e=>setFormData({...formData, code: e.target.value})} required /></F>
                  <F label="Description"><input type="text" style={iSt} value={formData.description||''} onChange={e=>setFormData({...formData, description: e.target.value})} required /></F>
                  <F label="GL Account Target"><input type="text" style={iSt} value={formData.glAccount||''} onChange={e=>setFormData({...formData, glAccount: e.target.value})} required /></F>
                  <F label="Transaction Type">
                    <select style={iSt} value={formData.type||''} onChange={e=>setFormData({...formData, type: e.target.value as any})}>
                      <option value="CREDIT">Credit (+)</option>
                      <option value="DEBIT">Debit (-)</option>
                    </select>
                  </F>
                </G4>

                <Sec title="Financial Parameters" />
                <G4>
                  <F label="Classification Category">
                    <select style={iSt} value={formData.category||''} onChange={e=>setFormData({...formData, category: e.target.value as any})}>
                      <option value="REVENUE">Revenue</option>
                      <option value="LIABILITY">Liability</option>
                      <option value="ASSET">Asset</option>
                      <option value="EXPENSE">Expense</option>
                    </select>
                  </F>
                  <F label="Base Currency">
                    <select style={iSt} value={formData.currency||''} onChange={e=>setFormData({...formData, currency: e.target.value})}>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </F>
                  <F label="Is Reversible">
                    <select style={iSt} value={formData.isReversible ? 'true' : 'false'} onChange={e=>setFormData({...formData, isReversible: e.target.value === 'true'})}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </F>
                </G4>

                <Sec title="System Metadata" />
                <G4>
                  <F label="Status">
                    <select style={iSt} value={formData.status||''} onChange={e=>setFormData({...formData, status: e.target.value as any})}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="DEPRECATED">Deprecated</option>
                    </select>
                  </F>
                </G4>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }} onClick={() => selectedId === null ? (setView('list'), onViewChange?.('list')) : (setIsEditMode(false), setFormData(entryCodes.find(c=>c.id===selectedId)||{}))}>
                  Discard
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}>
                  <Save size={14} /> {selectedId === null ? 'Create Code' : 'Save Config'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* MODALS */}
      {showSaveConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Confirm Save</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to save changes to this entry code?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowSaveConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '700' }} onClick={handleConfirmSave}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showSaveSuccess && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Successfully Saved</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Entry code routing rules have been updated.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowSaveSuccess(false); setIsEditMode(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}

      {showDeprecateConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Deprecate Entry Code?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to deprecate this entry code? Associated automated ledger entries may fail if they rely on this active path.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDeprecateConfirm(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={handleConfirmDeprecate}>Deprecate Code</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
