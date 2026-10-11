import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldAlert, Search, Eye, Trash2, X, Sliders, ArrowLeft, Edit2, Save, AlertTriangle, CheckCircle, PowerOff, Plus, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import * as rbacApi from '../../../api/rbac';
import { isApprovalInterceptedResponse } from '../../../api/client';
import Pagination from '../../Pagination';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  departmentScope: string;
  maxUsersAllowed: number;
  approvalRequired: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';
  createdAt: string;
}

interface RolesManagementHubProps {
  triggerToast: (msg: string) => void;
  addNewTrigger?: number;
  onViewChange?: (view: 'list' | 'manage') => void;
}

const iSt: React.CSSProperties = { width:'100%', padding:'0.6rem 0.9rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,184,0,0.2)', borderRadius:'0.5rem', color:'#fff', fontSize:'0.83rem', outline:'none', boxSizing:'border-box' };
const lSt: React.CSSProperties = { display:'block', fontSize:'0.65rem', color:'var(--foreground-muted)', fontWeight:'800', letterSpacing:'0.06em', marginBottom:'0.35rem', textTransform:'uppercase' };
const Sec = ({ title }: { title: string }) => <p style={{ fontSize:'0.65rem', color:'var(--foreground-muted)', fontWeight:'800', letterSpacing:'0.07em', margin:'2rem 0 1rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.5rem', textTransform: 'uppercase' }}>{title}</p>;
const G4 = ({ children }: { children: React.ReactNode }) => <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.5rem' }}>{children}</div>;
const G2 = ({ children }: { children: React.ReactNode }) => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>{children}</div>;
const F = ({ label, children }: { label: string; children: React.ReactNode }) => <div><label style={lSt}>{label}</label>{children}</div>;
const Val = ({ val }: { val: React.ReactNode }) => <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', minHeight: '36px', display: 'flex', alignItems: 'center' }}>{val || <span style={{opacity: 0.3}}>-</span>}</div>;

export default function RolesManagementHub({ triggerToast, addNewTrigger, onViewChange }: RolesManagementHubProps) {
  const queryClient = useQueryClient();
  const tenantId = useAuthStore((s) => s.tenantId);
  const authStatus = useAuthStore((s) => s.status);
  const [view, setView] = useState<'list' | 'manage'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showDeprecateConfirm, setShowDeprecateConfirm] = useState(false);

  const [showPermissionDrawer, setShowPermissionDrawer] = useState(false);
  const [permSearch, setPermSearch] = useState('');
  const [draggedPerm, setDraggedPerm] = useState<string | null>(null);
  const [permPage, setPermPage] = useState(1);
  const permsPerPage = 21;

  const [formData, setFormData] = useState<Partial<Role>>({});

  const permissionsQuery = useQuery({
    queryKey: ['rbac', 'permissions', tenantId],
    queryFn: () => rbacApi.listPermissions(tenantId as string),
    enabled: authStatus === 'authenticated' && !!tenantId,
  });

  const permissionById = new Map(
    (permissionsQuery.data?.data ?? []).map((p) => [p.id, p]),
  );

  const rolesQuery = useQuery({
    queryKey: ['rbac', 'roles', tenantId],
    queryFn: () => rbacApi.listRoles(tenantId as string),
    enabled: authStatus === 'authenticated' && !!tenantId,
  });

  const roles: Role[] = (rolesQuery.data?.data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description || '',
    permissions: r.permissionIds ?? [],
    isSystem: false,
    departmentScope: 'General',
    maxUsersAllowed: 0,
    approvalRequired: false,
    status: 'ACTIVE',
    createdAt: r.createdAt ?? new Date().toISOString(),
  }));

  const createMutation = useMutation({
    mutationFn: (payload: rbacApi.CreateRoleRequest) => rbacApi.createRole(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rbac', 'roles', tenantId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: rbacApi.UpdateRoleRequest }) =>
      rbacApi.updateRole(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rbac', 'roles', tenantId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rbacApi.deleteRole(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rbac', 'roles', tenantId] });
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
      permissions: [],
      isSystem: false,
      departmentScope: 'General',
      maxUsersAllowed: 0,
      approvalRequired: false,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });
    setIsEditMode(true);
    setView('manage');
    onViewChange?.('manage');
  };

  const handleOpenManage = (role: Role) => {
    setSelectedId(role.id);
    setFormData(role);
    setIsEditMode(false);
    setView('manage');
    onViewChange?.('manage');
  };

  const removePermission = (perm: string) => {
    if (!isEditMode) return;
    setFormData(prev => ({
      ...prev,
      permissions: (prev.permissions || []).filter(p => p !== perm)
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedPerm && !formData.permissions?.includes(draggedPerm)) {
      setFormData(prev => ({
        ...prev,
        permissions: [...(prev.permissions || []), draggedPerm]
      }));
    }
    setDraggedPerm(null);
  };

  const handleAddPermissionClick = (perm: string) => {
    if (!formData.permissions?.includes(perm)) {
      setFormData(prev => ({
        ...prev,
        permissions: [...(prev.permissions || []), perm]
      }));
    }
  };

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      triggerToast('Tenant is not resolved for this domain.');
      return;
    }
    if (!formData.name?.trim()) {
      triggerToast('Please provide a role name.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    const isNew = selectedId === null;
    const permissionIds = formData.permissions || []
    const payloadBase = {
      name: formData.name || '',
      description: formData.description || '',
      permissionIds,
    }

    try {
      if (isNew) {
        const res = await createMutation.mutateAsync({ ...payloadBase, tenantId: tenantId as string } as any)
        triggerToast(isApprovalInterceptedResponse(res) ? 'Submitted for approval.' : 'Role created successfully.')
      } else {
        const res = await updateMutation.mutateAsync({ id: selectedId as string, payload: payloadBase } as any)
        triggerToast(isApprovalInterceptedResponse(res) ? 'Submitted for approval.' : 'Role updated successfully.')
      }
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to save role.')
      setShowSaveConfirm(false)
      return
    }

    setShowSaveConfirm(false);
    setShowSaveSuccess(true);
  };

  const handleConfirmDeprecate = async () => {
    if (selectedId === null) return;
    try {
      const res = await deleteMutation.mutateAsync(selectedId as any)
      setShowDeprecateConfirm(false)
      triggerToast(isApprovalInterceptedResponse(res) ? 'Submitted for approval.' : 'Role deleted.')
      setView('list')
      onViewChange?.('list')
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to delete role.')
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>System Roles & Profiles</h3>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', overflow: 'hidden', height: '38px', boxSizing: 'border-box'
            }}>
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); triggerToast(`Roles filtered by type: ${e.target.value}`); }}
                style={{ height: '100%', padding: '0 1rem', background: 'var(--primary)', color: '#000', border: 'none', fontSize: '0.8rem', fontWeight: '700', outline: 'none', cursor: 'pointer', margin: 0 }}
              >
                <option value="ALL" style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>All Roles</option>
                <option value="SYSTEM" style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>System</option>
                <option value="CUSTOM" style={{ background: '#000', color: '#fff', fontWeight: 'bold' }}>Custom</option>
              </select>

              <input
                type="text" placeholder="Search roles..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
                  <th>Role Scope</th>
                  <th>Role Name & Desc</th>
                  <th>Department</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = roles.filter(r => {
                    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesType = filterType === 'ALL' || (filterType === 'SYSTEM' ? r.isSystem : !r.isSystem);
                    return matchesSearch && matchesType;
                  });
                  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                  return paginated.map(role => (
                    <tr key={role.id}>
                      <td>
                        <span className={`badge ${role.isSystem ? 'badge-approved' : 'badge-pending'}`}>
                          {role.isSystem ? 'SYSTEM' : 'CUSTOM'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{role.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role.description}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{role.departmentScope}</td>
                      <td>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                          {role.permissions.length} Assigned
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${role.status === 'ACTIVE' ? 'badge-approved' : role.status === 'INACTIVE' ? 'badge-pending' : 'badge-rejected'}`}>
                          {role.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} onClick={() => handleOpenManage(role)}>
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
              totalItems={roles.filter(r => {
                const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesType = filterType === 'ALL' || (filterType === 'SYSTEM' ? r.isSystem : !r.isSystem);
                return matchesSearch && matchesType;
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
                  <ShieldAlert size={22} style={{ color: 'var(--primary)' }} /> {selectedId === null ? 'Create New Security Role' : `Manage Role: ${formData.name}`}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedId || 'NEW_ROLE'}</span>
                  {!isEditMode && <span style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(255,184,0,0.2)' }}>VIEW ONLY</span>}
                  {formData.isSystem && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(16,185,129,0.2)' }}>SYSTEM LOCKED</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {selectedId !== null && !formData.isSystem && formData.status !== 'DEPRECATED' && (
                <button 
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }} 
                  onClick={() => setShowDeprecateConfirm(true)}
                >
                  <PowerOff size={14} /> Deprecate Role
                </button>
              )}
              {selectedId !== null && (
                isEditMode ? (
                  <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => { setIsEditMode(false); setFormData(roles.find(r=>r.id===selectedId)||{}) }}>
                    <X size={14} /> Cancel Edit
                  </button>
                ) : (
                  <button 
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} 
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit2 size={14} /> Edit Identity
                  </button>
                )
              )}
            </div>
          </div>

          {!isEditMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Sec title="Role Identity" />
              <G4>
                <F label="Role Name"><Val val={formData.name} /></F>
                <F label="Department Scope"><Val val={formData.departmentScope} /></F>
                <F label="Created At"><Val val={new Date(formData.createdAt || '').toLocaleDateString()} /></F>
                <F label="Status">
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: formData.status === 'ACTIVE' ? '#10b981' : formData.status === 'INACTIVE' ? 'var(--primary)' : '#ef4444', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', minHeight: '36px', display: 'flex', alignItems: 'center' }}>
                    {formData.status}
                  </div>
                </F>
              </G4>
              <G2>
                <F label="Description"><Val val={formData.description} /></F>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <F label="Max Users Limit"><Val val={formData.maxUsersAllowed === 0 ? 'Unlimited' : formData.maxUsersAllowed} /></F>
                  <F label="Requires Approval"><Val val={formData.approvalRequired ? 'Yes' : 'No'} /></F>
                </div>
              </G2>
              
              <Sec title="Granted Access Permissions" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {formData.permissions?.length === 0 ? <div style={{ color: 'var(--foreground-muted)', fontSize: '0.8rem' }}>No permissions assigned</div> : 
                  formData.permissions?.map(p => (
                    <span key={p} style={{ background: 'rgba(255,184,0,0.08)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontFamily: 'monospace', border: '1px solid rgba(255,184,0,0.2)' }}>
                      {permissionById.get(p)?.slug || p}
                    </span>
                  ))
                }
              </div>
            </div>
          ) : (
            <form onSubmit={handleRequestSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Sec title="Role Identity" />
                <G4>
                  <F label="Role Name"><input type="text" style={iSt} value={formData.name||''} onChange={e=>setFormData({...formData, name: e.target.value})} disabled={formData.isSystem} required /></F>
                  <F label="Department Scope"><input type="text" style={iSt} value={formData.departmentScope||''} onChange={e=>setFormData({...formData, departmentScope: e.target.value})} /></F>
                  <F label="Status">
                    <select style={iSt} value={formData.status||''} onChange={e=>setFormData({...formData, status: e.target.value as any})} disabled={formData.isSystem}>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="DEPRECATED">Deprecated</option>
                    </select>
                  </F>
                  <F label="Approval Required">
                    <select style={iSt} value={formData.approvalRequired ? 'true' : 'false'} onChange={e=>setFormData({...formData, approvalRequired: e.target.value === 'true'})}>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </F>
                </G4>
                <G2>
                  <F label="Description"><input type="text" style={iSt} value={formData.description||''} onChange={e=>setFormData({...formData, description: e.target.value})} /></F>
                  <F label="Max Users Limit (0 = Unlimited)"><input type="number" style={iSt} value={formData.maxUsersAllowed||0} onChange={e=>setFormData({...formData, maxUsersAllowed: Number(e.target.value)})} /></F>
                </G2>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.07em', textTransform: 'uppercase', margin: 0 }}>Granted Access Permissions</p>
                  <button 
                    type="button" 
                    onClick={() => setShowPermissionDrawer(true)}
                    style={{ background: 'var(--primary)', color: '#000', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                  >
                    <Plus size={14} /> Add Permission
                  </button>
                </div>
                
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  style={{ 
                    minHeight: '120px', 
                    background: draggedPerm ? 'rgba(255,184,0,0.05)' : 'rgba(255,255,255,0.02)', 
                    border: draggedPerm ? '2px dashed var(--primary)' : '1px dashed rgba(255,255,255,0.1)', 
                    borderRadius: '0.5rem', 
                    padding: '1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    alignContent: 'flex-start',
                    transition: 'all 0.2s'
                  }}
                >
                  {!formData.permissions || formData.permissions.length === 0 ? (
                    <div style={{ width: '100%', textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                      Drag and drop permissions here, or click "Add Permission" to open the drawer.
                    </div>
                  ) : (
                    formData.permissions.map(perm => (
                      <div key={perm} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.4rem 0.75rem', borderRadius: '0.5rem' }}>
                        <CheckCircle size={14} style={{ color: '#10b981' }} />
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#10b981', fontWeight: 'bold' }}>{permissionById.get(perm)?.slug || perm}</span>
                        <button type="button" onClick={() => removePermission(perm)} style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: 0, display: 'flex' }}>
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }} onClick={() => selectedId === null ? (setView('list'), onViewChange?.('list')) : (setIsEditMode(false), setFormData(roles.find(r=>r.id===selectedId)||{}))}>
                  Discard
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}>
                  <Save size={14} /> {selectedId === null ? 'Create Role' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── CONFIRMATIONS & SUCCESS MODALS ── */}
      {showSaveConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Confirm Role Policy Update?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to update parameters for role "{formData.name}"? Sessions assigned to this role will inherit these permissions.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowSaveConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '700' }} onClick={handleConfirmSave}>Commit Role</button>
            </div>
          </div>
        </div>
      )}

      {showSaveSuccess && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Role Configuration Saved</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              The modified permissions are now active across all backoffice nodes.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowSaveSuccess(false); setIsEditMode(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}

      {showDeprecateConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Deprecate Security Role?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to deprecate custom role "{formData.name}"? Users with this role assignment will lose access.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDeprecateConfirm(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={handleConfirmDeprecate}>Deprecate</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PERMISSION DRAWER ── */}
      {showPermissionDrawer && (() => {
        const filteredPerms = (permissionsQuery.data?.data ?? []).filter(p =>
          p.slug.toLowerCase().includes(permSearch.toLowerCase()) ||
          p.name.toLowerCase().includes(permSearch.toLowerCase())
        );
        const totalPages = Math.ceil(filteredPerms.length / permsPerPage) || 1;
        const currentValidPage = Math.min(Math.max(1, permPage), totalPages);
        const paginatedPerms = filteredPerms.slice((currentValidPage - 1) * permsPerPage, currentValidPage * permsPerPage);

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', justifyContent: 'flex-end', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', pointerEvents: draggedPerm ? 'none' : 'auto' }} onClick={() => setShowPermissionDrawer(false)}></div>
            
            <div className="glass-card" style={{ position: 'relative', width: '550px', background: 'rgba(15,15,15,0.95)', borderLeft: '1px solid rgba(255,255,255,0.08)', padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', borderRadius: '0', pointerEvents: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Available Permissions</h3>
                <button onClick={() => setShowPermissionDrawer(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
              </div>
              
              <input 
                type="text" 
                placeholder="Search permissions..." 
                value={permSearch}
                onChange={(e) => { setPermSearch(e.target.value); setPermPage(1); }}
                style={{ ...iSt, marginBottom: '1.5rem' }}
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', margin: 0, lineHeight: '1.4' }}>
                  Click or drag a card onto the role form dropzone to add it.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', overflowY: 'auto', paddingBottom: '1rem', alignContent: 'start', flex: 1 }}>
                {paginatedPerms.map(perm => {
                  const isSelected = formData.permissions?.includes(perm.id);
                  return (
                    <div 
                      key={perm.id}
                      draggable={!isSelected}
                      onDragStart={() => setDraggedPerm(perm.id)}
                      onDragEnd={() => setDraggedPerm(null)}
                      onClick={() => { if (!isSelected) handleAddPermissionClick(perm.id); }}
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.02)' : 'rgba(255,184,0,0.05)',
                        border: isSelected ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,184,0,0.3)',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        color: isSelected ? 'var(--foreground-muted)' : 'var(--primary)',
                        cursor: isSelected ? 'default' : 'pointer',
                        opacity: isSelected ? 0.5 : 1,
                        userSelect: 'none',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 'fit-content'
                      }}
                    >
                      {perm.slug}
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button onClick={() => setPermPage(1)} disabled={currentValidPage === 1} style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)', color: currentValidPage === 1 ? 'rgba(255,184,0,0.3)' : 'var(--primary)', borderRadius: '4px', cursor: currentValidPage === 1 ? 'default' : 'pointer', padding: '0.2rem', display: 'flex' }}>
                    <ChevronsLeft size={16} />
                  </button>
                  <button onClick={() => setPermPage(p => Math.max(1, p - 1))} disabled={currentValidPage === 1} style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)', color: currentValidPage === 1 ? 'rgba(255,184,0,0.3)' : 'var(--primary)', borderRadius: '4px', cursor: currentValidPage === 1 ? 'default' : 'pointer', padding: '0.2rem', display: 'flex' }}>
                    <ChevronLeft size={16} />
                  </button>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', margin: '0 0.5rem' }}>
                    <input 
                      type="number" 
                      value={permPage} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) setPermPage(val);
                      }}
                      onBlur={() => setPermPage(currentValidPage)}
                      style={{ width: '40px', padding: '0.2rem', background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.3)', color: 'var(--primary)', fontSize: '0.85rem', textAlign: 'center', borderRadius: '4px', outline: 'none', fontWeight: 'bold' }} 
                      min={1} 
                      max={totalPages} 
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>/ {totalPages}</span>
                  </div>

                  <button onClick={() => setPermPage(p => Math.min(totalPages, p + 1))} disabled={currentValidPage === totalPages} style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)', color: currentValidPage === totalPages ? 'rgba(255,184,0,0.3)' : 'var(--primary)', borderRadius: '4px', cursor: currentValidPage === totalPages ? 'default' : 'pointer', padding: '0.2rem', display: 'flex' }}>
                    <ChevronRight size={16} />
                  </button>
                  <button onClick={() => setPermPage(totalPages)} disabled={currentValidPage === totalPages} style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)', color: currentValidPage === totalPages ? 'rgba(255,184,0,0.3)' : 'var(--primary)', borderRadius: '4px', cursor: currentValidPage === totalPages ? 'default' : 'pointer', padding: '0.2rem', display: 'flex' }}>
                    <ChevronsRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
