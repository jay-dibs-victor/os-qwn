import React, { useState } from 'react';
import { Search, Edit2, Ban, CheckCircle, Save, X, ArrowLeft, Plus, User } from 'lucide-react';

interface SysUser { id: string; name: string; email: string; role: string; department: string; phone: string; status: string; lastLogin: string; createdAt: string; }

const MOCK: SysUser[] = [
  { id: 'usr_001', name: 'Kwame Asante', email: 'k.asante@queensos.com', role: 'Super Admin', department: 'Operations', phone: '+233 24 111 0001', status: 'Active', lastLogin: '2h ago', createdAt: '2024-01-15' },
  { id: 'usr_002', name: 'Aisha Kamara', email: 'a.kamara@queensos.com', role: 'Vetting Officer', department: 'Compliance', phone: '+44 7700 900001', status: 'Active', lastLogin: '1d ago', createdAt: '2024-02-20' },
  { id: 'usr_003', name: 'Liam Osei', email: 'l.osei@queensos.com', role: 'Finance Manager', department: 'Finance', phone: '+254 700 000001', status: 'Active', lastLogin: '3d ago', createdAt: '2024-03-10' },
  { id: 'usr_004', name: 'Fatima Diallo', email: 'f.diallo@queensos.com', role: 'Fraud Analyst', department: 'Risk', phone: '+221 77 000 0001', status: 'Suspended', lastLogin: '2w ago', createdAt: '2024-04-05' },
  { id: 'usr_005', name: 'Marcus Chen', email: 'm.chen@queensos.com', role: 'Loan Officer', department: 'Finance', phone: '+65 9000 0001', status: 'Active', lastLogin: '5h ago', createdAt: '2024-05-01' },
];

function ManageUser({ user, onBack }: { user: SysUser; onBack: () => void }) {
  const [isEdit, setIsEdit] = useState(false);
  const [showDisC, setShowDisC] = useState(false);
  const [showDisS, setShowDisS] = useState(false);
  const [showSavC, setShowSavC] = useState(false);
  const [showSavS, setShowSavS] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [role, setRole] = useState(user.role);
  const [dept, setDept] = useState(user.department);
  const [status, setStatus] = useState(user.status);

  const IS: React.CSSProperties = { width: '100%', padding: '0.65rem 1rem', background: isEdit ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isEdit ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '0.5rem', color: isEdit ? '#fff' : 'var(--foreground-muted)', fontSize: '0.85rem', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' as const };
  const SS: React.CSSProperties = { ...IS, background: isEdit ? '#1a1a1a' : '#0a0a0a', cursor: isEdit ? 'pointer' : 'default' };
  const lbl = (t: string) => <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--foreground-muted)' }}>{t}</label>;

  const fields = [['Full Name', name], ['Email', email], ['Phone', phone], ['Role', role], ['Department', dept], ['Status', status]];

  return (
    <div className="glass-card" style={{ padding: '2.5rem', width: '100%', boxSizing: 'border-box', marginTop: '0.5rem' }}>
      {showDisC && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}><Ban size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} /><h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Suspend Account?</h3><p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>This will suspend <strong style={{ color: '#fff' }}>{user.name}</strong>'s admin platform access.</p><div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}><button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDisC(false)}>Cancel</button><button style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }} onClick={() => { setShowDisC(false); setShowDisS(true); }}>Yes, Suspend</button></div></div></div>}
      {showDisS && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}><CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} /><h3 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>User Suspended</h3><p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>{user.name} has been suspended.</p><button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700', cursor: 'pointer' }} onClick={() => { setShowDisS(false); onBack(); }}>Okay</button></div></div>}
      {showSavC && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}><div className="glass-card" style={{ maxWidth: '580px', width: '100%', padding: '2rem' }}><h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Save size={18} style={{ color: 'var(--primary)' }} /> Confirm Update</h3><p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.25rem' }}>Review changes before saving.</p><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1.5rem' }}>{fields.map(([l, v]) => <div key={l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}><span style={{ fontSize: '0.65rem', color: 'var(--foreground-dim)', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>{l}</span><span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: '600' }}>{v}</span></div>)}</div><div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}><button className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem' }} onClick={() => setShowSavC(false)}>Cancel</button><button style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => { setShowSavC(false); setIsEdit(false); setShowSavS(true); }}><Save size={14} /> Confirm & Save</button></div></div></div>}
      {showSavS && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}><CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} /><h3 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>User Updated</h3><p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>Profile for <strong style={{ color: '#fff' }}>{name}</strong> saved successfully.</p><button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700', cursor: 'pointer' }} onClick={() => setShowSavS(false)}>Okay</button></div></div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}><ArrowLeft size={16} /></button>
          <div><h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={20} style={{ color: 'var(--primary)' }} /> Manage User: {name}</h2><p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>System User Registry • ID: <span style={{ color: 'var(--primary)' }}>{user.id}</span>{!isEdit && <span style={{ marginLeft: '0.75rem', background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(255,184,0,0.2)' }}>VIEW ONLY</span>}</p></div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }} onClick={() => setShowDisC(true)}><Ban size={14} /> Suspend User</button>
          {isEdit ? <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setIsEdit(false)}><X size={14} /> Cancel Edit</button> : <button style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} onClick={() => setIsEdit(true)}><Edit2 size={14} /> Edit Profile</button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div>{lbl('Full Name')}<input disabled={!isEdit} value={name} onChange={e => setName(e.target.value)} style={IS} /></div>
        <div>{lbl('Email Address')}<input type="email" disabled={!isEdit} value={email} onChange={e => setEmail(e.target.value)} style={IS} /></div>
        <div>{lbl('Phone Number')}<input disabled={!isEdit} value={phone} onChange={e => setPhone(e.target.value)} style={IS} /></div>
        <div>{lbl('Department')}<input disabled={!isEdit} value={dept} onChange={e => setDept(e.target.value)} style={IS} /></div>
        <div>{lbl('Assigned Role')}<select disabled={!isEdit} value={role} onChange={e => setRole(e.target.value)} style={SS}><option>Super Admin</option><option>Vetting Officer</option><option>Finance Manager</option><option>Fraud Analyst</option><option>Loan Officer</option><option>Customer Support</option></select></div>
        <div>{lbl('Account Status')}<select disabled={!isEdit} value={status} onChange={e => setStatus(e.target.value)} style={SS}><option>Active</option><option>Suspended</option><option>Inactive</option></select></div>
      </div>

      {isEdit && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setIsEdit(false)}><X size={14} /> Discard</button>
        <button style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} onClick={() => setShowSavC(true)}><Save size={14} /> Save Changes</button>
      </div>}
    </div>
  );
}

export default function AdminUserHub() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<SysUser | null>(null);

  if (selected) return <ManageUser user={selected} onBack={() => setSelected(null)} />;

  const rows = MOCK.filter(u => (filter === 'all' || u.status === filter) && (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div><h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>System Users</h2><p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', margin: '0.2rem 0 0' }}>{MOCK.length} registered administrators</p></div>
        <button style={{ padding: '0.5rem 1rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Plus size={14} /> Add User</button>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ flex: 1, position: 'relative' }}><Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--foreground-dim)' }} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} /></div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '0.55rem 0.75rem', background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}><option value="all">All Status</option><option value="Active">Active</option><option value="Suspended">Suspended</option></select>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
          <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{['User', 'Role', 'Department', 'Status', 'Last Login', 'Actions'].map(h => <th key={h} style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--foreground-dim)' }}>{h}</th>)}</tr></thead>
          <tbody>{rows.map(u => <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><td style={{ padding: '0.75rem' }}><div style={{ fontWeight: '700' }}>{u.name}</div><div style={{ fontSize: '0.72rem', color: 'var(--foreground-dim)' }}>{u.email}</div></td><td style={{ padding: '0.75rem', color: 'var(--foreground-muted)' }}>{u.role}</td><td style={{ padding: '0.75rem', color: 'var(--foreground-muted)' }}>{u.department}</td><td style={{ padding: '0.75rem' }}><span style={{ background: u.status === 'Active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)', color: u.status === 'Active' ? '#10b981' : '#ef4444', fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>{u.status}</span></td><td style={{ padding: '0.75rem', color: 'var(--foreground-dim)', fontSize: '0.75rem' }}>{u.lastLogin}</td><td style={{ padding: '0.75rem', textAlign: 'right' }}><button onClick={() => setSelected(u)} style={{ padding: '0.4rem 0.85rem', background: 'linear-gradient(135deg, var(--primary) 0%, #d4af37 100%)', border: 'none', color: '#000', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Edit2 size={11} /> Manage</button></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
