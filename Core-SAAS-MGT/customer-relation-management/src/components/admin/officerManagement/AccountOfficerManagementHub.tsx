import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Eye, Trash2, X, Sliders, ArrowLeft, Edit2, Save, AlertTriangle, CheckCircle, UserPlus, Briefcase
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/authStore';
import * as usersApi from '../../../api/users';
import Pagination from '../../Pagination';

interface AccountOfficer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  roleLevel: 'JUNIOR' | 'SENIOR' | 'LEAD' | 'DIRECTOR';
  assignedAccounts: number;
  maxAccountsLimit: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'INACTIVE';
  region: string;
  performanceScore: number;
  kpiRating: string;
  dateJoined: string;
}

interface UserDbRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AccountOfficerManagementHubProps {
  triggerToast: (msg: string) => void;
  addNewTrigger?: number;
  onViewChange?: (view: 'list' | 'manage') => void;
}

const iSt: React.CSSProperties = { width:'100%', padding:'0.6rem 0.9rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,184,0,0.2)', borderRadius:'0.5rem', color:'#fff', fontSize:'0.83rem', outline:'none', boxSizing:'border-box' };
const lSt: React.CSSProperties = { display:'block', fontSize:'0.65rem', color:'var(--foreground-muted)', fontWeight:'800', letterSpacing:'0.06em', marginBottom:'0.35rem', textTransform:'uppercase' };
const Sec = ({ title }: { title: string }) => <p style={{ fontSize:'0.65rem', color:'var(--foreground-muted)', fontWeight:'800', letterSpacing:'0.07em', margin:'2rem 0 1rem', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'0.5rem', textTransform: 'uppercase' }}>{title}</p>;
const G4 = ({ children }: { children: React.ReactNode }) => <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.5rem' }}>{children}</div>;
const G3 = ({ children }: { children: React.ReactNode }) => <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem' }}>{children}</div>;
const G2 = ({ children }: { children: React.ReactNode }) => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>{children}</div>;
const F = ({ label, children }: { label: string; children: React.ReactNode }) => <div><label style={lSt}>{label}</label>{children}</div>;
const Val = ({ val }: { val: React.ReactNode }) => <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', minHeight: '36px', display: 'flex', alignItems: 'center' }}>{val || <span style={{opacity: 0.3}}>-</span>}</div>;

export default function AccountOfficerManagementHub({ triggerToast, addNewTrigger, onViewChange }: AccountOfficerManagementHubProps) {
  const tenantId = useAuthStore(s => s.tenantId);
  const [view, setView] = useState<'list' | 'manage'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Pagination states
  const [officersPage, setOfficersPage] = useState(1);
  const [officersPageSize, setOfficersPageSize] = useState(20);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(20);

  // Modals state
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<AccountOfficer>>({});

  // ── Real user search via API ──────────────────────────────────────────────
  const usersQuery = useQuery({
    queryKey: ['auth', 'users', tenantId],
    queryFn: () => usersApi.listUsers(tenantId as string),
    enabled: !!tenantId && showUserSearch,
  });

  const allUsers: UserDbRecord[] = (usersQuery.data?.data ?? []).map(u => ({
    id: u.id,
    firstName: u.firstName ?? '',
    lastName: u.lastName ?? '',
    email: u.email,
    phone: u.phone,
  }));

  const searchedUsers = userSearchTerm.trim().length === 0
    ? []
    : allUsers.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
      );

  const [officers, setOfficers] = useState<AccountOfficer[]>([
    {
      id: 'off_092',
      userId: 'usr_881',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 's.jenkins@queens.os',
      phone: '+1 555-8822',
      department: 'Driver Relations',
      roleLevel: 'SENIOR',
      assignedAccounts: 145,
      maxAccountsLimit: 200,
      status: 'ACTIVE',
      region: 'North America',
      performanceScore: 94.5,
      kpiRating: 'A+',
      dateJoined: '2024-03-12'
    },
    {
      id: 'off_093',
      userId: 'usr_882',
      firstName: 'Michael',
      lastName: 'Thorne',
      email: 'm.thorne@queens.os',
      phone: '+1 555-8833',
      department: 'Corporate Accounts',
      roleLevel: 'LEAD',
      assignedAccounts: 42,
      maxAccountsLimit: 50,
      status: 'ON_LEAVE',
      region: 'Europe',
      performanceScore: 88.2,
      kpiRating: 'B+',
      dateJoined: '2023-11-05'
    }
  ]);

  // ── Load account officers from API (users with role=account_officer) ────────
  const officersQuery = useQuery({
    queryKey: ['auth', 'users', tenantId, 'account_officer'],
    queryFn: () => usersApi.listUsers(tenantId as string),
    enabled: !!tenantId,
  });

  // Merge API users (role=account_officer) with local state on first load
  useEffect(() => {
    const apiOfficers = (officersQuery.data?.data ?? [])
      .filter(u => u.role === 'account_officer')
      .map(u => ({
        id: u.id,
        userId: u.id,
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        email: u.email,
        phone: u.phone ?? '',
        department: 'General',
        roleLevel: 'JUNIOR' as const,
        assignedAccounts: 0,
        maxAccountsLimit: 100,
        status: u.status === 'active' ? 'ACTIVE' as const : 'SUSPENDED' as const,
        region: 'Global',
        performanceScore: 0,
        kpiRating: 'N/A',
        dateJoined: u.createdAt,
      }));
    if (apiOfficers.length > 0) {
      setOfficers(apiOfficers);
    }
  }, [officersQuery.data]);

  useEffect(() => {
    if (addNewTrigger && addNewTrigger > 0) {
      setUserSearchTerm('');
      setShowUserSearch(true);
    }
  }, [addNewTrigger]);

  const handleCreateAfresh = () => {
    setShowUserSearch(false);
    setSelectedId(null);
    setFormData({
      department: 'General',
      roleLevel: 'JUNIOR',
      assignedAccounts: 0,
      maxAccountsLimit: 100,
      status: 'ACTIVE',
      region: 'Global',
      performanceScore: 0,
      kpiRating: 'N/A',
      dateJoined: new Date().toISOString().split('T')[0]
    });
    setIsEditMode(true);
    setView('manage');
    onViewChange?.('manage');
  };

  const handleSelectUserToMakeOfficer = (user: UserDbRecord) => {
    setShowUserSearch(false);
    setSelectedId(null);
    setFormData({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      department: 'General',
      roleLevel: 'JUNIOR',
      assignedAccounts: 0,
      maxAccountsLimit: 100,
      status: 'ACTIVE',
      region: 'Global',
      performanceScore: 0,
      kpiRating: 'N/A',
      dateJoined: new Date().toISOString().split('T')[0]
    });
    setIsEditMode(true);
    setView('manage');
    onViewChange?.('manage');
  };

  const handleOpenManage = (officer: AccountOfficer) => {
    setSelectedId(officer.id);
    setFormData(officer);
    setIsEditMode(false);
    setView('manage');
    onViewChange?.('manage');
  };

  const handleRequestSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName?.trim() || !formData.email?.trim()) {
      triggerToast('Please provide valid officer details.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    const isNew = selectedId === null;
    const finalId = isNew ? 'off_' + Math.floor(Math.random() * 10000) : selectedId!;

    const updatedOfficer: AccountOfficer = {
      id: finalId,
      userId: formData.userId || '',
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      email: formData.email || '',
      phone: formData.phone || '',
      department: formData.department || '',
      roleLevel: formData.roleLevel || 'JUNIOR',
      assignedAccounts: Number(formData.assignedAccounts) || 0,
      maxAccountsLimit: Number(formData.maxAccountsLimit) || 100,
      status: formData.status || 'ACTIVE',
      region: formData.region || '',
      performanceScore: Number(formData.performanceScore) || 0,
      kpiRating: formData.kpiRating || 'N/A',
      dateJoined: formData.dateJoined || new Date().toISOString().split('T')[0]
    };

    try {
      // If the officer has a linked userId, update their platform role to account_officer
      if (updatedOfficer.userId && isNew) {
        await usersApi.updateUser(updatedOfficer.userId, {
          role: 'account_officer',
        });
      }

      if (isNew) {
        setOfficers(prev => [...prev, updatedOfficer]);
        triggerToast(`Account Officer ${finalId} created successfully.`);
      } else {
        setOfficers(prev => prev.map(o => o.id === selectedId ? updatedOfficer : o));
        triggerToast(`Account Officer ${selectedId} updated successfully.`);
      }

      setShowSaveConfirm(false);
      setShowSaveSuccess(true);
    } catch (e) {
      setShowSaveConfirm(false);
      triggerToast((e as { message?: string })?.message ?? 'Failed to save officer.');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedId === null) return;
    setOfficers(prev => prev.filter(o => o.id !== selectedId));
    setShowDeleteConfirm(false);
    triggerToast(`Account Officer ${selectedId} deleted.`);
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
              <Briefcase style={{ color: 'var(--primary)' }} size={20} />
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Account Officers Directory</h3>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', overflow: 'hidden', height: '38px'
            }}>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setOfficersPage(1); triggerToast(`Officers filtered: ${e.target.value}`); }}
                style={{ height: '100%', padding: '0 1rem', background: 'var(--primary)', color: '#000', border: 'none', fontSize: '0.8rem', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
              >
                <option value="ALL" style={{ background: '#000', color: '#fff' }}>All Statuses</option>
                <option value="ACTIVE" style={{ background: '#000', color: '#fff' }}>Active</option>
                <option value="ON_LEAVE" style={{ background: '#000', color: '#fff' }}>On Leave</option>
                <option value="SUSPENDED" style={{ background: '#000', color: '#fff' }}>Suspended</option>
              </select>
              <input
                type="text" placeholder="Search officers..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setOfficersPage(1); }}
                style={{ height: '100%', padding: '0 1rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', outline: 'none', width: '220px' }}
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Officer Info</th>
                  <th>Department</th>
                  <th>Load / Limit</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filtered = officers.filter(o => {
                    const matchesSearch = `${o.firstName} ${o.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || o.email.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
                    return matchesSearch && matchesStatus;
                  });
                  const paginated = filtered.slice((officersPage - 1) * officersPageSize, officersPage * officersPageSize);
                  return paginated.map(officer => (
                    <tr key={officer.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{officer.id}</td>
                      <td>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{officer.firstName} {officer.lastName} <span style={{ fontSize: '0.7rem', background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', padding: '0.1rem 0.3rem', borderRadius: '4px', marginLeft: '0.4rem' }}>{officer.roleLevel}</span></div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{officer.email}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{officer.department}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{officer.assignedAccounts}</span>
                          <span style={{ color: 'var(--foreground-muted)', fontSize: '0.7rem' }}>/ {officer.maxAccountsLimit}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${officer.status === 'ACTIVE' ? 'badge-approved' : officer.status === 'ON_LEAVE' ? 'badge-pending' : 'badge-rejected'}`}>
                          {officer.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} onClick={() => handleOpenManage(officer)}>
                          <Sliders size={12} /> Manage
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            <Pagination
              currentPage={officersPage}
              pageSize={officersPageSize}
              totalItems={officers.filter(o => {
                const matchesSearch = `${o.firstName} ${o.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || o.email.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
                return matchesSearch && matchesStatus;
              }).length}
              onPageChange={setOfficersPage}
              onPageSizeChange={(size) => { setOfficersPageSize(size); setOfficersPage(1); }}
            />
          </div>
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
                  <Users size={22} style={{ color: 'var(--primary)' }} /> 
                  {selectedId === null ? 'Complete Officer Registration' : `${formData.firstName} ${formData.lastName}'s Profile`}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedId || 'NEW_OFFICER'}</span>
                  {!isEditMode && <span style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(255,184,0,0.2)' }}>VIEW ONLY</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {selectedId !== null && (
                <button style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }} onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 size={14} /> Remove
                </button>
              )}
              {selectedId !== null && (
                isEditMode ? (
                  <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => { setIsEditMode(false); setFormData(officers.find(o=>o.id===selectedId)||{}) }}>
                    <X size={14} /> Cancel Edit
                  </button>
                ) : (
                  <button style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} onClick={() => setIsEditMode(true)}>
                    <Edit2 size={14} /> Edit Profile
                  </button>
                )
              )}
            </div>
          </div>

          {!isEditMode ? (
            // VIEW ONLY GRID
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Sec title="Personnel Details" />
              <G4>
                <F label="First Name"><Val val={formData.firstName} /></F>
                <F label="Last Name"><Val val={formData.lastName} /></F>
                <F label="Email Address"><Val val={formData.email} /></F>
                <F label="Phone Number"><Val val={formData.phone} /></F>
              </G4>
              <G4>
                <F label="User ID Reference"><Val val={formData.userId} /></F>
                <F label="Region"><Val val={formData.region} /></F>
                <F label="Date Joined"><Val val={formData.dateJoined} /></F>
              </G4>

              <Sec title="Assignment & Workload" />
              <G4>
                <F label="Department"><Val val={formData.department} /></F>
                <F label="Role Level"><Val val={formData.roleLevel} /></F>
                <F label="Assigned Accounts"><Val val={formData.assignedAccounts} /></F>
                <F label="Maximum Account Limit"><Val val={formData.maxAccountsLimit} /></F>
              </G4>

              <Sec title="Performance & Status" />
              <G4>
                <F label="Status">
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: formData.status === 'ACTIVE' ? '#10b981' : formData.status === 'ON_LEAVE' ? 'var(--primary)' : '#ef4444', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', minHeight: '36px', display: 'flex', alignItems: 'center' }}>
                    {formData.status?.replace('_', ' ')}
                  </div>
                </F>
                <F label="Performance Score"><Val val={formData.performanceScore + '%'} /></F>
                <F label="KPI Rating"><Val val={formData.kpiRating} /></F>
              </G4>
            </div>
          ) : (
            // EDIT FORM
            <form onSubmit={handleRequestSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Sec title="Personnel Details" />
                <G4>
                  <F label="First Name"><input type="text" style={iSt} value={formData.firstName||''} onChange={e=>setFormData({...formData, firstName: e.target.value})} required /></F>
                  <F label="Last Name"><input type="text" style={iSt} value={formData.lastName||''} onChange={e=>setFormData({...formData, lastName: e.target.value})} required /></F>
                  <F label="Email Address"><input type="email" style={iSt} value={formData.email||''} onChange={e=>setFormData({...formData, email: e.target.value})} required /></F>
                  <F label="Phone Number"><input type="text" style={iSt} value={formData.phone||''} onChange={e=>setFormData({...formData, phone: e.target.value})} /></F>
                </G4>
                <G4>
                  <F label="User ID Reference"><input type="text" style={iSt} value={formData.userId||''} disabled={true} title="Cannot modify linked User ID" /></F>
                  <F label="Region"><input type="text" style={iSt} value={formData.region||''} onChange={e=>setFormData({...formData, region: e.target.value})} /></F>
                  <F label="Date Joined"><input type="date" style={iSt} value={formData.dateJoined||''} onChange={e=>setFormData({...formData, dateJoined: e.target.value})} /></F>
                </G4>

                <Sec title="Assignment & Workload" />
                <G4>
                  <F label="Department"><input type="text" style={iSt} value={formData.department||''} onChange={e=>setFormData({...formData, department: e.target.value})} /></F>
                  <F label="Role Level">
                    <select style={iSt} value={formData.roleLevel||''} onChange={e=>setFormData({...formData, roleLevel: e.target.value as any})}>
                      <option value="JUNIOR">Junior</option>
                      <option value="SENIOR">Senior</option>
                      <option value="LEAD">Lead</option>
                      <option value="DIRECTOR">Director</option>
                    </select>
                  </F>
                  <F label="Assigned Accounts"><input type="number" style={iSt} value={formData.assignedAccounts||0} onChange={e=>setFormData({...formData, assignedAccounts: Number(e.target.value)})} /></F>
                  <F label="Maximum Account Limit"><input type="number" style={iSt} value={formData.maxAccountsLimit||0} onChange={e=>setFormData({...formData, maxAccountsLimit: Number(e.target.value)})} /></F>
                </G4>

                <Sec title="Performance & Status" />
                <G4>
                  <F label="Status">
                    <select style={iSt} value={formData.status||''} onChange={e=>setFormData({...formData, status: e.target.value as any})}>
                      <option value="ACTIVE">Active</option>
                      <option value="ON_LEAVE">On Leave</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </F>
                  <F label="Performance Score"><input type="number" step="0.1" style={iSt} value={formData.performanceScore||0} onChange={e=>setFormData({...formData, performanceScore: Number(e.target.value)})} /></F>
                  <F label="KPI Rating">
                    <select style={iSt} value={formData.kpiRating||''} onChange={e=>setFormData({...formData, kpiRating: e.target.value})}>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </F>
                </G4>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }} onClick={() => selectedId === null ? (setView('list'), onViewChange?.('list')) : (setIsEditMode(false), setFormData(officers.find(o=>o.id===selectedId)||{}))}>
                  Discard
                </button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}>
                  <Save size={14} /> {selectedId === null ? 'Register Officer' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* MODALS */}

      {/* USER SEARCH MODAL */}
      {showUserSearch && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '700px', width: '95%', padding: '2rem', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search style={{ color: 'var(--primary)' }} size={20} /> Search System Users
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', margin: '0.2rem 0 0 0' }}>Locate an existing user to elevate to an Account Officer role.</p>
              </div>
              <button onClick={() => setShowUserSearch(false)} style={{ background: 'transparent', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <Search size={16} style={{ color: 'var(--foreground-muted)', marginRight: '0.75rem' }} />
              <input 
                type="text" 
                autoFocus
                placeholder="Search by First Name, Last Name, or Email..." 
                value={userSearchTerm}
                onChange={e => { setUserSearchTerm(e.target.value); setUsersPage(1); }}
                style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ overflowY: 'auto', flexGrow: 1 }}>
              <table className="admin-table" style={{ width: '100%' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#0e0e0e', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>User Ref</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Full Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Email Address</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {userSearchTerm.trim().length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>
                        <div style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Enter a name or email to search the user directory.</div>
                      </td>
                    </tr>
                  ) : usersQuery.isLoading ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          <div className="pulse-dot" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }}></div>
                          Searching Directory...
                        </div>
                      </td>
                    </tr>
                  ) : searchedUsers.length > 0 ? (
                    (() => {
                      const paginated = searchedUsers.slice((usersPage - 1) * usersPageSize, usersPage * usersPageSize);
                      return paginated.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{u.id}</td>
                          <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#fff' }}>{u.firstName} {u.lastName}</td>
                          <td style={{ padding: '0.75rem', color: 'var(--foreground-muted)', fontSize: '0.8rem' }}>{u.email}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '0.25rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto' }}
                              onClick={() => handleSelectUserToMakeOfficer(u)}
                            >
                              <UserPlus size={14} /> Make Officer
                            </button>
                          </td>
                        </tr>
                      ));
                    })()
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                        <div style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                          No users found matching "{userSearchTerm}".
                        </div>
                        <button 
                          className="btn btn-primary"
                          onClick={handleCreateAfresh}
                          style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '700', borderRadius: '0.5rem', cursor: 'pointer' }}
                        >
                          Create Officer Manually
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={usersPage}
                pageSize={usersPageSize}
                totalItems={searchedUsers.length}
                onPageChange={setUsersPage}
                onPageSizeChange={(size) => { setUsersPageSize(size); setUsersPage(1); }}
              />
            </div>
          </div>
        </div>
      )}

      {showSaveConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Confirm Save</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to save changes to this officer's profile?
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
              Account officer records have been updated in the directory.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowSaveSuccess(false); setIsEditMode(false); }}>Okay</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Remove Officer?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently remove this account officer? Reassignment of accounts will be required.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={handleConfirmDelete}>Remove Officer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
