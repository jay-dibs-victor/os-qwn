import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldCheck, Search, Eye, Trash2, X, Sliders, ArrowLeft, Edit2, Save, AlertTriangle, CheckCircle, PowerOff
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import * as rbacApi from '../../../api/rbac';
import { isApprovalInterceptedResponse } from '../../../api/client';
import Pagination from '../../Pagination';

interface PermissionRule {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
  createdAt: string;
}

interface PermissionsManagementHubProps {
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

export default function PermissionsManagementHub({ triggerToast, addNewTrigger, onViewChange }: PermissionsManagementHubProps) {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const authStatus = useAuthStore((s) => s.status);
  const [view, setView] = useState<'list' | 'manage'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showDeprecateConfirm, setShowDeprecateConfirm] = useState(false);

  const [formData, setFormData] = useState<Partial<PermissionRule>>({});

  const permissionsQuery = useQuery({
    queryKey: ['rbac', 'permissions', tenantId],
    queryFn: () => rbacApi.listPermissions(tenantId as string),
    enabled: authStatus === 'authenticated' && !!tenantId,
  });

  const permissions: PermissionRule[] = (permissionsQuery.data?.data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    status: 'ACTIVE',
    createdAt: p.createdAt ?? new Date().toISOString(),
  }));

  const createMutation = useMutation({
    mutationFn: (payload: rbacApi.CreatePermissionRequest) =>
      rbacApi.createPermission(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rbac', 'permissions', tenantId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: rbacApi.UpdatePermissionRequest }) =>
      rbacApi.updatePermission(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rbac', 'permissions', tenantId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rbacApi.deletePermission(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rbac', 'permissions', tenantId] });
    },
  });

  useEffect(() => {
    if (addNewTrigger && addNewTrigger > 0) {
      handleOpenCreate();
    }
  }, [addNewTrigger]);

  const handleOpenCreate = () => {
    setSelectedId(null);
    setFormData({
      slug: '',
      name: '',
      description: '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });
    setIsEditMode(true);
    setView('manage');
    onViewChange?.('manage');
  };

  const handleOpenManage = (perm: PermissionRule) => {
    setSelectedId(perm.id);
    setFormData(perm);
    setIsEditMode(false);
    setView('manage');
    onViewChange?.('manage');
  };

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      triggerToast('Tenant is not resolved for this domain.');
      return;
    }
    if (!formData.slug?.trim() || !formData.name?.trim()) {
      triggerToast('Please provide a valid slug and name.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    const isNew = selectedId === null;
    const payloadBase = {
      slug: formData.slug || '',
      name: formData.name || '',
      description: formData.description || '',
    };

    try {
      if (isNew) {
        const res = await createMutation.mutateAsync({ ...payloadBase, tenantId: tenantId as string } as any);
        triggerToast(isApprovalInterceptedResponse(res) ? 'Submitted for approval.' : 'Permission created successfully.');
      } else {
        const res = await updateMutation.mutateAsync({ id: selectedId as string, payload: payloadBase } as any);
        triggerToast(isApprovalInterceptedResponse(res) ? 'Submitted for approval.' : 'Permission updated successfully.');
      }
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to save permission.');
      setShowSaveConfirm(false);
      return;
    }

    setShowSaveConfirm(false);
    setShowSaveSuccess(true);
  };

  const handleConfirmDeprecate = async () => {
    if (selectedId === null) return;
    try {
      const res = await deleteMutation.mutateAsync(selectedId as any);
      setShowDeprecateConfirm(false);
      triggerToast(isApprovalInterceptedResponse(res) ? 'Submitted for approval.' : 'Permission deleted.');
      setView('list');
      onViewChange?.('list');
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to delete permission.');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Global Permission Blocks</h3>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', overflow: 'hidden', height: '38px', boxSizing: 'border-box'
            }}>
              <select
                value={filterLevel}
                onChange={(e) => { setFilterLevel(e.target.value); setCurrentPage(1); triggerToast(`Permissions filtered by level: ${e.target.value}`); }}
                style={{ height: '100%', padding: '0 1rem', background: 'var(--primary)', color: '#000', border: 'none', fontSize: '0.8rem', fontWeight: '700', outline: 'none', cursor: 'pointer', margin: 0 }}
              >
                <option value="ALL" style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>All Modules</option>
                <option value="payments" style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>Payments</option>
                <option value="ledger" style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>Ledger</option>
                <option value="accounts" style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>Accounts</option>
                <option value="rbac" style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>RBAC</option>
              </select>

              <input
                type="text" placeholder="Search resources..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ height: '100%', padding: '0 1rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', outline: 'none', width: '220px' }}
              />
              <button
                style={{ height: '100%', padding: '0 1.25rem', background: 'rgba(15,15,15,0.95)', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                  <th>Name / Description</th>
                  <th>Slug</th>
                  <th>Module</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = permissions.filter(p => {
                    const q = searchQuery.toLowerCase();
                    const matchesSearch =
                      p.name.toLowerCase().includes(q) ||
                      p.slug.toLowerCase().includes(q) ||
                      (p.description || '').toLowerCase().includes(q);
                    const matchesLevel = filterLevel === 'ALL' || p.slug.toLowerCase().startsWith(filterLevel.toLowerCase() + '.');
                    return matchesSearch && matchesLevel;
                  });
                  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                  return paginated.map(perm => (
                    <tr key={perm.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{perm.id}</td>
                      <td>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{perm.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{perm.description || '-'}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
                        <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          {perm.slug}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontWeight: 'bold' }}>
                        {perm.slug.split('.')[0] || '-'}
                      </td>
                      <td>
                        <span className={`badge ${perm.status === 'ACTIVE' ? 'badge-approved' : perm.status === 'INACTIVE' ? 'badge-pending' : 'badge-rejected'}`}>
                          {perm.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} onClick={() => handleOpenManage(perm)}>
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
              totalItems={permissions.filter(p => {
                const q = searchQuery.toLowerCase();
                const matchesSearch = p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
                const matchesLevel = filterLevel === 'ALL' || p.slug.toLowerCase().startsWith(filterLevel.toLowerCase() + '.');
                return matchesSearch && matchesLevel;
              }).length}
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
                  <ShieldCheck size={22} style={{ color: 'var(--primary)' }} /> {selectedId === null ? 'Create Permission' : `Manage Permission: ${formData.name}`}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedId || 'NEW_PERM'}</span>
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
                  <PowerOff size={14} /> Deprecate Block
                </button>
              )}
              {selectedId !== null && (
                isEditMode ? (
                  <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => { setIsEditMode(false); setFormData(permissions.find(p=>p.id===selectedId)||{}) }}>
                    <X size={14} /> Cancel Edit
                  </button>
                ) : (
                  <button 
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} 
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit2 size={14} /> Edit Block
                  </button>
                )
              )}
            </div>
          </div>

          {!isEditMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Sec title="Block Identification" />
              <G4>
                <F label="Name"><Val val={formData.name} /></F>
                <F label="Description"><Val val={formData.description} /></F>
                <F label="Slug"><Val val={<span style={{fontFamily:'monospace'}}>{formData.slug}</span>} /></F>
                <F label="Created At"><Val val={new Date(formData.createdAt || '').toLocaleDateString()} /></F>
              </G4>
              
              <Sec title="Status Metadata" />
              <G4>
                <F label="Current Status">
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: formData.status === 'ACTIVE' ? '#10b981' : formData.status === 'INACTIVE' ? 'var(--primary)' : '#ef4444', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', minHeight: '36px', display: 'flex', alignItems: 'center' }}>
                    {formData.status}
                  </div>
                </F>
              </G4>
            </div>
          ) : (
            <form onSubmit={handleRequestSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Sec title="Block Identification" />
                <G4>
                  <F label="Name"><input type="text" style={iSt} value={formData.name||''} onChange={e=>setFormData({...formData, name: e.target.value})} required /></F>
                  <F label="Description"><input type="text" style={iSt} value={formData.description||''} onChange={e=>setFormData({...formData, description: e.target.value})} /></F>
                  <F label="Slug"><input type="text" style={{...iSt, fontFamily:'monospace'}} value={formData.slug||''} placeholder="e.g. payment.create" onChange={e=>setFormData({...formData, slug: e.target.value})} required /></F>
                </G4>

                <Sec title="Status Metadata" />
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
                <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }} onClick={() => selectedId === null ? (setView('list'), onViewChange?.('list')) : (setIsEditMode(false), setFormData(permissions.find(p=>p.id===selectedId)||{}))}>
                  Discard
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}>
                  <Save size={14} /> {selectedId === null ? 'Create Permission' : 'Save Permission'}
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
              Are you sure you want to save changes to this permission block?
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
              Security constraints have been updated globally.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowSaveSuccess(false); setIsEditMode(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}

      {showDeprecateConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Deprecate Permission Block?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently deprecate this permission block? Associated users may lose access.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDeprecateConfirm(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={handleConfirmDeprecate}>Deprecate Block</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
