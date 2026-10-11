import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  UserCheck, Search, Eye, Trash2, X, Sliders, ArrowLeft, Edit2, Save, AlertTriangle, CheckCircle, Lock, ShieldOff 
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import * as rbacApi from '../../../api/rbac';
import * as usersApi from '../../../api/users';
import { isApprovalInterceptedResponse } from '../../../api/client';
import Pagination from '../../Pagination';

interface UserRecord {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  lastLogin: string;
  createdAt: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
  is_locked: boolean;
  mfaEnabled: boolean;
  failedLoginAttempts: number;
  lastPasswordChange: string;
  roleIds?: string[];
  password?: string;
}

interface UserManagementHubProps {
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

export default function UserManagementHub({ triggerToast, addNewTrigger, onViewChange }: UserManagementHubProps) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'manage'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals state
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<UserRecord>>({});
  const tenantId = useAuthStore((s) => s.tenantId);
  const authStatus = useAuthStore((s) => s.status);

  const rolesQuery = useQuery({
    queryKey: ['rbac', 'roles', tenantId],
    queryFn: () => rbacApi.listRoles(tenantId as string),
    enabled: authStatus === 'authenticated' && !!tenantId,
  });

  const roleById = new Map((rolesQuery.data?.data ?? []).map((r) => [r.id, r]));

  const usersQuery = useQuery({
    queryKey: ['auth', 'users', tenantId],
    queryFn: () => usersApi.listUsers(tenantId as string),
    enabled: authStatus === 'authenticated' && !!tenantId,
  });

  const userRolesQuery = useQuery({
    queryKey: ['rbac', 'userRoles', selectedId, tenantId],
    queryFn: () => rbacApi.getUserRoles(selectedId as string, tenantId as string),
    enabled: authStatus === 'authenticated' && !!tenantId && !!selectedId,
  });

  const uiStatusFromApi = (status: usersApi.UserStatus): UserRecord['status'] => {
    if (status === 'active') return 'ACTIVE'
    if (status === 'suspended' || status === 'pending') return 'SUSPENDED'
    return 'DISABLED'
  }

  const apiStatusFromUi = (status: UserRecord['status']): usersApi.UserStatus => {
    if (status === 'ACTIVE') return 'active'
    if (status === 'SUSPENDED') return 'suspended'
    return 'inactive'
  }

  const users: UserRecord[] = (usersQuery.data?.data ?? []).map((u) => {
    const username = u.email.includes('@') ? u.email.split('@')[0] : u.email
    const status = uiStatusFromApi(u.status)
    return {
      id: u.id,
      username,
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      email: u.email,
      phone: u.phone,
      role: 'Unassigned',
      department: 'General',
      lastLogin: 'Never',
      createdAt: u.createdAt,
      status,
      is_locked: status !== 'ACTIVE',
      mfaEnabled: u.mfaEnabled,
      failedLoginAttempts: 0,
      lastPasswordChange: u.updatedAt,
      roleIds: [],
    }
  })

  const userById = new Map(users.map((u) => [u.id, u]))

  const createUserMutation = useMutation({
    mutationFn: (payload: usersApi.CreateUserRequest) => usersApi.createUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'users', tenantId] })
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: usersApi.UpdateUserRequest }) =>
      usersApi.updateUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'users', tenantId] })
    },
  })

  const disableUserMutation = useMutation({
    mutationFn: (id: string) => usersApi.disableUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'users', tenantId] })
    },
  })

  const assignRolesMutation = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      rbacApi.assignUserRoles(userId, roleIds, tenantId as string),
    onSuccess: async (_res, vars) => {
      await queryClient.invalidateQueries({
        queryKey: ['rbac', 'userRoles', vars.userId, tenantId],
      })
    },
  })

  useEffect(() => {
    if (addNewTrigger && addNewTrigger > 0) {
      handleOpenCreate();
    }
  }, [addNewTrigger]);

  useEffect(() => {
    const roleIds = userRolesQuery.data?.roleIds
    if (!selectedId || !roleIds) return
    const roleLabel = roleIds
      .map((id) => roleById.get(id)?.name ?? id)
      .join(', ')
    setFormData((prev) => ({
      ...prev,
      roleIds,
      role: roleLabel || 'Unassigned',
    }))
  }, [selectedId, userRolesQuery.data, rolesQuery.data]);

  const handleOpenCreate = () => {
    setSelectedId(null);
    setFormData({
      role: 'Unassigned',
      department: 'General',
      status: 'ACTIVE',
      is_locked: false,
      mfaEnabled: false,
      failedLoginAttempts: 0,
      roleIds: [],
      password: '',
      createdAt: new Date().toISOString(),
      platformRole: 'staff',
    } as any);
    setIsEditMode(true);
    setView('manage');
    onViewChange?.('manage');
  };

  const handleOpenManage = (user: UserRecord) => {
    setSelectedId(user.id);
    setFormData(user);
    setIsEditMode(false);
    setView('manage');
    onViewChange?.('manage');
  };

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return triggerToast('Tenant is not resolved for this domain.');
    if (!formData.email?.trim()) return triggerToast('Please provide a valid email address.');
    if (!formData.firstName?.trim()) return triggerToast('Please provide a valid first name.');
    if (!formData.lastName?.trim()) return triggerToast('Please provide a valid last name.');
    if (!formData.phone?.trim()) return triggerToast('Please provide a valid phone number.');
    if (selectedId === null && !formData.password?.trim()) {
      return triggerToast('Please provide an initial password for this user.');
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!tenantId) return
    const isNew = selectedId === null

    try {
      let userId = selectedId as string

      if (isNew) {
        const created = await createUserMutation.mutateAsync({
          email: formData.email as string,
          phone: formData.phone as string,
          password: formData.password as string,
          tenantId,
          firstName: formData.firstName as string,
          lastName: formData.lastName as string,
          role: (formData.platformRole as usersApi.UserRole) ?? 'staff',
        } as any)
        if (isApprovalInterceptedResponse(created)) {
          triggerToast('Submitted for approval.')
          setShowSaveConfirm(false)
          setShowSaveSuccess(true)
          return
        }
        userId = (created as any).id
      } else {
        const res = await updateUserMutation.mutateAsync({
          id: selectedId as string,
          payload: {
            email: formData.email,
            phone: formData.phone,
            firstName: formData.firstName,
            lastName: formData.lastName,
            password: formData.password?.trim() ? formData.password : undefined,
            status: apiStatusFromUi((formData.status ?? 'ACTIVE') as UserRecord['status']),
          },
        } as any)
        if (isApprovalInterceptedResponse(res)) {
          triggerToast('Submitted for approval.')
          setShowSaveConfirm(false)
          setShowSaveSuccess(true)
          return
        }
      }

      const roleIds = (formData.roleIds ?? []).filter(Boolean) as string[]
      if (roleIds.length > 0) {
        const res = await assignRolesMutation.mutateAsync({ userId, roleIds } as any)
        if (isApprovalInterceptedResponse(res)) {
          triggerToast('Submitted for approval.')
          setShowSaveConfirm(false)
          setShowSaveSuccess(true)
          return
        }
      }

      triggerToast(isNew ? 'User created successfully.' : 'User updated successfully.')
      setShowSaveConfirm(false)
      setShowSaveSuccess(true)
    } catch (e) {
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to save user.')
      setShowSaveConfirm(false)
    }
  };

  const handleConfirmDisable = async () => {
    if (!tenantId || selectedId === null) return
    try {
      const res = await disableUserMutation.mutateAsync(selectedId as any)
      setShowDisableConfirm(false)
      triggerToast(isApprovalInterceptedResponse(res) ? 'Submitted for approval.' : `User ${selectedId} has been disabled.`)
      setFormData((prev) => ({ ...prev, status: 'DISABLED', is_locked: true }))
    } catch (e) {
      setShowDisableConfirm(false)
      triggerToast((e as { message?: string } | undefined)?.message ?? 'Failed to disable user.')
    }
  };

  const displayUsername =
    (formData.username && formData.username.trim()) ||
    (formData.email && formData.email.includes('@') ? formData.email.split('@')[0] : '') ||
    ''

  return (
    <div style={{ width: '100%' }}>
      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>System Users</h3>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', overflow: 'hidden', height: '38px', boxSizing: 'border-box'
            }}>
              <input
                type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{ height: '100%', padding: '0 1rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', outline: 'none', width: '220px' }}
              />
              <button
                onClick={() => triggerToast(`Searching for "${searchQuery}"...`)}
                style={{
                  height: '100%', padding: '0 1.25rem', background: 'rgba(15,15,15,0.95)', border: 'none',
                  borderLeft: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', outline: 'none'
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
                  <th>User Identity</th>
                  <th>Role & Dept</th>
                  <th>Security Status</th>
                  <th>Account Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = users.filter(u =>
                    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
                  return (
                    <>
                      {paginated.map(user => (
                        <tr key={user.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{user.id}</td>
                          <td>
                            <div style={{ fontWeight: 'bold', color: '#fff' }}>{user.firstName} {user.lastName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>@{user.username}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>{user.email}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{user.role}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{user.department}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: user.is_locked ? '#ef4444' : '#10b981' }}>
                                {user.is_locked ? <><Lock size={10} /> Locked</> : <><CheckCircle size={10} /> Unlocked</>}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: user.mfaEnabled ? '#10b981' : 'var(--foreground-muted)' }}>
                                <ShieldOff size={10} /> MFA {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${user.status === 'ACTIVE' ? 'badge-approved' : user.status === 'SUSPENDED' ? 'badge-pending' : 'badge-rejected'}`}>
                              {user.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} onClick={() => handleOpenManage(user)}>
                              <Sliders size={12} /> Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                      {paginated.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>No users found.</td>
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
            totalItems={users.filter(u =>
              u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
            ).length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        </div>
      )}

      {/* ── MANAGE VIEW ── */}
      {view === 'manage' && (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setView('list'); onViewChange?.('list'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={22} style={{ color: 'var(--primary)' }} /> 
                  {selectedId === null ? 'Provision New User' : `Manage User: @${displayUsername}`}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedId || 'NEW_USER'}</span>
                  {!isEditMode && <span style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(255,184,0,0.2)' }}>VIEW ONLY</span>}
                  {formData.is_locked && <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(239,68,68,0.2)' }}>ACCOUNT LOCKED</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {selectedId !== null && formData.status !== 'DISABLED' && (
                <button 
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }} 
                  onClick={() => setShowDisableConfirm(true)}
                >
                  <Lock size={14} /> Disable User
                </button>
              )}
              {selectedId !== null && (
                isEditMode ? (
                  <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => { setIsEditMode(false); const u = userById.get(selectedId); setFormData((prev) => u ? { ...u, roleIds: prev.roleIds ?? u.roleIds, role: prev.role ?? u.role } : {}); }}>
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
              <Sec title="Identity Information" />
              <G4>
                <F label="First Name"><Val val={formData.firstName} /></F>
                <F label="Last Name"><Val val={formData.lastName} /></F>
                <F label="Username"><Val val={`@${displayUsername}`} /></F>
                <F label="Email Address"><Val val={formData.email} /></F>
              </G4>
              <G4>
                <F label="Phone Number"><Val val={formData.phone} /></F>
                <F label="Date Created"><Val val={new Date(formData.createdAt || '').toLocaleDateString()} /></F>
              </G4>

              <Sec title="Organization & Role" />
              <G4>
                <F label="Role"><Val val={formData.role} /></F>
                <F label="Department"><Val val={formData.department} /></F>
              </G4>

              <Sec title="Security & Status" />
              <G4>
                <F label="Status">
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: formData.status === 'ACTIVE' ? '#10b981' : formData.status === 'SUSPENDED' ? 'var(--primary)' : '#ef4444', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', minHeight: '36px', display: 'flex', alignItems: 'center' }}>
                    {formData.status}
                  </div>
                </F>
                <F label="Account Locked"><Val val={formData.is_locked ? 'Yes (Locked)' : 'No (Unlocked)'} /></F>
                <F label="MFA Enabled"><Val val={formData.mfaEnabled ? 'Yes' : 'No'} /></F>
                <F label="Failed Logins"><Val val={formData.failedLoginAttempts} /></F>
              </G4>
              <G4>
                <F label="Last Login"><Val val={formData.lastLogin !== 'Never' ? new Date(formData.lastLogin!).toLocaleString() : 'Never'} /></F>
                <F label="Last Password Change"><Val val={new Date(formData.lastPasswordChange || '').toLocaleDateString()} /></F>
              </G4>
            </div>
          ) : (
            <form onSubmit={handleRequestSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Sec title="Identity Information" />
                <G4>
                  <F label="First Name"><input type="text" style={iSt} value={formData.firstName||''} onChange={e=>setFormData({...formData, firstName: e.target.value})} required /></F>
                  <F label="Last Name"><input type="text" style={iSt} value={formData.lastName||''} onChange={e=>setFormData({...formData, lastName: e.target.value})} required /></F>
                  <F label="Username"><input type="text" style={{...iSt, opacity: 0.6}} value={displayUsername} disabled /></F>
                  <F label="Email Address"><input type="email" style={iSt} value={formData.email||''} onChange={e=>setFormData({...formData, email: e.target.value})} required /></F>
                </G4>
                <G4>
                  <F label="Phone Number"><input type="text" style={iSt} value={formData.phone||''} onChange={e=>setFormData({...formData, phone: e.target.value})} /></F>
                  <F label={selectedId === null ? 'Initial Password' : 'New Password (optional)'}>
                    <input type="password" style={iSt} value={formData.password||''} onChange={e=>setFormData({...formData, password: e.target.value})} />
                  </F>
                  {selectedId === null && (
                    <F label="Platform Role">
                      <select style={iSt} value={(formData as any).platformRole || 'staff'} onChange={e => setFormData({...formData, platformRole: e.target.value} as any)}>
                        <option value="staff">Staff</option>
                        <option value="account_officer">Account Officer</option>
                        <option value="tenant_admin">Tenant Admin</option>
                      </select>
                    </F>
                  )}
                </G4>

                <Sec title="Organization & Role" />
                <G4>
                  <F label="Roles">
                    <select
                      multiple
                      style={{ ...iSt, height: '140px' }}
                      value={(formData.roleIds ?? []) as string[]}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
                        const label = selected
                          .map((id) => roleById.get(id)?.name ?? id)
                          .join(', ')
                        setFormData({ ...formData, roleIds: selected, role: label || 'Unassigned' })
                      }}
                    >
                      {(rolesQuery.data?.data ?? []).map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </F>
                  <F label="Department"><input type="text" style={iSt} value={formData.department||''} onChange={e=>setFormData({...formData, department: e.target.value})} /></F>
                </G4>

                <Sec title="Security & Status" />
                <G4>
                  <F label="Status">
                    <select style={iSt} value={formData.status||''} onChange={e=>setFormData({...formData, status: e.target.value as any})}>
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="DISABLED">Disabled</option>
                    </select>
                  </F>
                  <F label="Account Locked">
                    <select style={{...iSt, opacity: 0.6}} value={(formData.status ?? 'ACTIVE') === 'ACTIVE' ? 'false' : 'true'} disabled>
                      <option value="false">No (Unlocked)</option>
                      <option value="true">Yes (Locked)</option>
                    </select>
                  </F>
                  <F label="MFA Enabled">
                    <select style={{...iSt, opacity: 0.6}} value={formData.mfaEnabled ? 'true' : 'false'} disabled>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </F>
                  <F label="Failed Logins"><input type="number" style={{...iSt, opacity: 0.6}} value={formData.failedLoginAttempts||0} disabled /></F>
                </G4>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }} onClick={() => selectedId === null ? (setView('list'), onViewChange?.('list')) : (setIsEditMode(false), setFormData(users.find(u=>u.id===selectedId)||{}))}>
                  Discard
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}>
                  <Save size={14} /> {selectedId === null ? 'Provision User' : 'Save Details'}
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
              Are you sure you want to save changes to this user profile?
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
              System user details have been synchronized with IAM.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowSaveSuccess(false); setIsEditMode(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}

      {showDisableConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Disable User Access?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to disable and lock this user's account? They will be instantly logged out and prevented from signing back in.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDisableConfirm(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={handleConfirmDisable}>Disable User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
