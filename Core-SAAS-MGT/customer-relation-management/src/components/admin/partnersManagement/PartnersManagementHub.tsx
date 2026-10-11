import React, { useState, useEffect } from 'react';
import {
  Handshake, Search, Sliders, ArrowLeft, Save, AlertTriangle,
  CheckCircle, X, Building, ShieldAlert, Globe, Users,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/authStore';
import Pagination from '../../Pagination';
import { listTenants, createTenant, suspendTenant, activateTenant, type Tenant } from '../../../api/tenants';
import {
  listEcosystemPartners, createCustomer, updateCustomer,
  verifyCustomer, suspendCustomer, deleteCustomer,
  type Customer,
} from '../../../api/customers';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const iSt: React.CSSProperties = { width: '100%', padding: '0.6rem 0.9rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.83rem', outline: 'none', boxSizing: 'border-box' };
const lSt: React.CSSProperties = { display: 'block', fontSize: '0.65rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.06em', marginBottom: '0.35rem', textTransform: 'uppercase' };
const Sec = ({ t }: { t: string }) => <p style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', fontWeight: '800', letterSpacing: '0.07em', margin: '1.5rem 0 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', textTransform: 'uppercase' }}>{t}</p>;
const G4 = ({ children }: { children: React.ReactNode }) => <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem' }}>{children}</div>;
const G2 = ({ children }: { children: React.ReactNode }) => <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>{children}</div>;
const F = ({ label, children }: { label: string; children: React.ReactNode }) => <div><label style={lSt}>{label}</label>{children}</div>;
const Val = ({ v }: { v: React.ReactNode }) => <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.9rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', minHeight: '36px', display: 'flex', alignItems: 'center' }}>{v || <span style={{ opacity: 0.3 }}>—</span>}</div>;

const PLAN_COLORS: Record<string, string> = { unlimited: '#fbbf24', enterprise: '#a855f7', premium: '#3b82f6', trial: '#10b981', free: 'rgba(255,255,255,0.4)' };
const PLAN_LABELS: Record<string, string> = { unlimited: 'Unlimited', enterprise: 'Enterprise', premium: 'Premium', trial: 'Trial', free: 'Free' };
const CAT_ICONS: Record<string, string> = { FLEET_OPERATOR: '🚗', BANK: '🏦', TELECOM: '📡', FINTECH: '💳', INDIVIDUAL: '👤', CORPORATE: '🏢' };
const CAT_LABELS: Record<string, string> = { FLEET_OPERATOR: 'Fleet Operator', BANK: 'Bank / Finance', TELECOM: 'Telecom', FINTECH: 'Fintech', INDIVIDUAL: 'Individual', CORPORATE: 'Corporate' };

interface PartnersManagementHubProps {
  triggerToast: (msg: string) => void;
  addNewTrigger?: number;
  onViewChange?: (view: 'list' | 'manage') => void;
}

export default function PartnersManagementHub({ triggerToast, addNewTrigger, onViewChange }: PartnersManagementHubProps) {
  const qc = useQueryClient();
  const authTenantId = useAuthStore(s => s.tenantId);
  const isRoot = authTenantId === 'root-admin';

  // ── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'tenants' | 'ecosystem'>('tenants');

  // ── Tenant Partners state ──────────────────────────────────────────────────
  const [tView, setTView] = useState<'list' | 'manage'>('list');
  const [selTenantId, setSelTenantId] = useState<string | null>(null);
  const [tEditMode, setTEditMode] = useState(false);
  const [tSearch, setTSearch] = useState('');
  const [tFilter, setTFilter] = useState('ALL');
  const [tPage, setTPage] = useState(1);
  const [tPageSize, setTPageSize] = useState(20);
  const [ePage, setEPage] = useState(1);
  const [ePageSize, setEPageSize] = useState(20);
  const [tForm, setTForm] = useState({ tenantId: '', name: '', domain: '', subscriptionPlan: 'premium' });
  const [showTSave, setShowTSave] = useState(false);
  const [showTSuccess, setShowTSuccess] = useState(false);
  const [showTSuspend, setShowTSuspend] = useState(false);

  // ── Ecosystem Partners state ───────────────────────────────────────────────
  const [eView, setEView] = useState<'list' | 'manage'>('list');
  const [selEcoId, setSelEcoId] = useState<string | null>(null);
  const [eEditMode, setEEditMode] = useState(false);
  const [eSearch, setESearch] = useState('');
  const [eCatFilter, setECatFilter] = useState('ALL');
  const [eForm, setEForm] = useState<Partial<Customer>>({
    customerType: 'partner', firstName: '', lastName: '', email: '', phone: '',
    companyName: '', taxId: '', businessDescription: '',
    metadata: { partnerCategory: 'CORPORATE', revenueShare: 0, bankName: '', accountNumber: '', swiftCode: '', integrationStatus: 'PENDING' },
  });
  const [showESave, setShowESave] = useState(false);
  const [showESuccess, setShowESuccess] = useState(false);
  const [showEDelete, setShowEDelete] = useState(false);

  // ── Queries ────────────────────────────────────────────────────────────────
  const tenantsQ = useQuery({ queryKey: ['tenants'], queryFn: listTenants });
  const ecoQ = useQuery({ queryKey: ['eco-partners'], queryFn: () => listEcosystemPartners(0, 200) });

  const tenants: Tenant[] = (tenantsQ.data?.data ?? []).filter(t => !t.isRoot);
  const ecoPartners: Customer[] = ecoQ.data?.data ?? [];

  // ── Tenant mutations ───────────────────────────────────────────────────────
  const createTenantM = useMutation({ mutationFn: createTenant, onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }) });
  const suspendTenantM = useMutation({ mutationFn: suspendTenant, onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }) });
  const activateTenantM = useMutation({ mutationFn: activateTenant, onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }) });

  // ── Ecosystem mutations ────────────────────────────────────────────────────
  const createEcoM = useMutation({ mutationFn: createCustomer, onSuccess: () => qc.invalidateQueries({ queryKey: ['eco-partners'] }) });
  const updateEcoM = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) => updateCustomer(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['eco-partners'] }) });
  const verifyEcoM = useMutation({ mutationFn: verifyCustomer, onSuccess: () => qc.invalidateQueries({ queryKey: ['eco-partners'] }) });
  const suspendEcoM = useMutation({ mutationFn: suspendCustomer, onSuccess: () => qc.invalidateQueries({ queryKey: ['eco-partners'] }) });
  const deleteEcoM = useMutation({ mutationFn: deleteCustomer, onSuccess: () => qc.invalidateQueries({ queryKey: ['eco-partners'] }) });

  useEffect(() => {
    if (addNewTrigger && addNewTrigger > 0) {
      if (activeTab === 'tenants' && isRoot) {
        setSelTenantId(null);
        setTForm({ tenantId: '', name: '', domain: '', subscriptionPlan: 'premium' });
        setTEditMode(true);
        setTView('manage');
        onViewChange?.('manage');
      } else {
        setSelEcoId(null);
        setEForm({ customerType: 'partner', firstName: '', lastName: '', email: '', phone: '', companyName: '', taxId: '', businessDescription: '', metadata: { partnerCategory: 'CORPORATE', revenueShare: 0, bankName: '', accountNumber: '', swiftCode: '', integrationStatus: 'PENDING' } });
        setEEditMode(true);
        setEView('manage');
        onViewChange?.('manage');
      }
    }
  }, [addNewTrigger]);

  // ── Tenant handlers ────────────────────────────────────────────────────────
  const selTenant = tenants.find(t => t.tenantId === selTenantId);
  const filteredTenants = tenants.filter(t => {
    const ms = t.name.toLowerCase().includes(tSearch.toLowerCase()) || t.tenantId.toLowerCase().includes(tSearch.toLowerCase());
    const mf = tFilter === 'ALL' || t.status === tFilter;
    return ms && mf;
  });

  const handleTenantSave = async () => {
    try {
      await createTenantM.mutateAsync({ tenantId: tForm.tenantId, name: tForm.name, domain: tForm.domain || undefined, subscriptionPlan: tForm.subscriptionPlan });
      triggerToast(`Tenant ${tForm.tenantId} registered.`);
      setShowTSave(false); setShowTSuccess(true);
    } catch (e) { setShowTSave(false); triggerToast((e as { message?: string })?.message ?? 'Failed.'); }
  };

  const handleTenantToggle = async () => {
    if (!selTenantId) return;
    try {
      if (selTenant?.status === 'ACTIVE' || selTenant?.status === 'TRIAL') {
        await suspendTenantM.mutateAsync(selTenantId);
        triggerToast(`${selTenantId} suspended.`);
      } else {
        await activateTenantM.mutateAsync(selTenantId);
        triggerToast(`${selTenantId} activated.`);
      }
      setShowTSuspend(false);
    } catch (e) { triggerToast((e as { message?: string })?.message ?? 'Failed.'); }
  };

  // ── Ecosystem handlers ─────────────────────────────────────────────────────
  const selEco = ecoPartners.find(p => p.id === selEcoId);
  const filteredEco = ecoPartners.filter(p => {
    const cat = (p.metadata as Record<string, unknown>)?.partnerCategory as string ?? '';
    const ms = (p.companyName ?? `${p.firstName} ${p.lastName}`).toLowerCase().includes(eSearch.toLowerCase()) || p.email.toLowerCase().includes(eSearch.toLowerCase());
    const mf = eCatFilter === 'ALL' || cat === eCatFilter;
    return ms && mf;
  });

  const handleEcoSave = async () => {
    try {
      if (selEcoId === null) {
        await createEcoM.mutateAsync({ ...eForm, customerType: 'partner' } as any);
        triggerToast('Ecosystem partner created.');
      } else {
        await updateEcoM.mutateAsync({ id: selEcoId, data: eForm });
        triggerToast('Ecosystem partner updated.');
      }
      setShowESave(false); setShowESuccess(true);
    } catch (e) { setShowESave(false); triggerToast((e as { message?: string })?.message ?? 'Failed.'); }
  };

  const handleEcoDelete = async () => {
    if (!selEcoId) return;
    try {
      await deleteEcoM.mutateAsync(selEcoId);
      triggerToast('Partner removed.');
      setShowEDelete(false); setEView('list'); onViewChange?.('list');
    } catch (e) { triggerToast((e as { message?: string })?.message ?? 'Failed.'); }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Tab switcher ── */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '0.5rem' }}>
        {([['tenants', <Building size={15} />, 'Tenant Partners', tenants.length], ['ecosystem', <Globe size={15} />, 'Ecosystem Partners', ecoPartners.length]] as const).map(([id, icon, label, count]) => (
          <button key={id} onClick={() => { setActiveTab(id as any); onViewChange?.('list'); setTPage(1); setEPage(1); }}
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', fontWeight: '700', border: 'none', borderRadius: '0.5rem 0.5rem 0 0', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem', background: activeTab === id ? 'var(--primary)' : 'rgba(255,255,255,0.04)', color: activeTab === id ? '#000' : 'rgba(255,255,255,0.5)' }}>
            {icon}{label}
            <span style={{ fontSize: '0.65rem', background: activeTab === id ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)', borderRadius: '99px', padding: '0.1rem 0.4rem' }}>{count}</span>
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TENANT PARTNERS TAB                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'tenants' && (
        <>
          {tView === 'list' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Handshake style={{ color: 'var(--primary)' }} size={18} />
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Tenant Partners</h3>
                  <span style={{ fontSize: '0.62rem', background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', padding: '0.1rem 0.45rem', borderRadius: '99px', border: '1px solid rgba(255,184,0,0.2)', fontWeight: '800' }}>{tenants.length}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select value={tFilter} onChange={e => { setTFilter(e.target.value); setTPage(1); }} style={{ padding: '0.4rem 0.7rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', outline: 'none' }}>
                    {['ALL','ACTIVE','TRIAL','SUSPENDED','INACTIVE'].map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>)}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.4rem', overflow: 'hidden', height: '34px' }}>
                    <Search size={12} style={{ color: 'var(--foreground-muted)', marginLeft: '0.6rem' }} />
                    <input value={tSearch} onChange={e => { setTSearch(e.target.value); setTPage(1); }} placeholder="Search tenants…" style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.78rem', outline: 'none', padding: '0 0.6rem', width: '160px' }} />
                  </div>
                </div>
              </div>
              {tenantsQ.isLoading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.8rem' }}>Loading…</div> : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead><tr><th>Tenant ID</th><th>Name</th><th>Plan</th><th>Domain</th><th>Status</th><th>Created</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                    <tbody>
                      {(() => {
                        const paginated = filteredTenants.slice((tPage - 1) * tPageSize, tPage * tPageSize);
                        return paginated.map(t => (
                          <tr key={t.tenantId}>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--primary)' }}>{t.tenantId}</td>
                            <td><div style={{ fontWeight: '700' }}>{t.name}</div></td>
                            <td><span style={{ fontSize: '0.7rem', fontWeight: '800', color: PLAN_COLORS[t.subscriptionPlan ?? 'free'] }}>{PLAN_LABELS[t.subscriptionPlan ?? 'free'] ?? t.subscriptionPlan}</span></td>
                            <td style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{t.domain ?? '—'}</td>
                            <td><span className={`badge ${t.status === 'ACTIVE' || t.status === 'TRIAL' ? 'badge-approved' : t.status === 'SUSPENDED' ? 'badge-rejected' : 'badge-pending'}`}>{t.status}</span></td>
                            <td style={{ fontSize: '0.72rem', color: 'var(--foreground-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: 'auto' }} onClick={() => { setSelTenantId(t.tenantId); setTForm({ tenantId: t.tenantId, name: t.name, domain: t.domain ?? '', subscriptionPlan: t.subscriptionPlan ?? 'free' }); setTEditMode(false); setTView('manage'); onViewChange?.('manage'); }}>
                                <Sliders size={11} /> Manage
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                      {filteredTenants.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)', fontSize: '0.8rem' }}>No tenants found</td></tr>}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={tPage}
                    pageSize={tPageSize}
                    totalItems={filteredTenants.length}
                    onPageChange={setTPage}
                    onPageSizeChange={(size) => { setTPageSize(size); setTPage(1); }}
                  />
                </div>
              )}
            </div>
          )}

          {tView === 'manage' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button onClick={() => { setTView('list'); onViewChange?.('list'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={15} /></button>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800' }}>{selTenantId === null ? 'Register New Tenant' : selTenant?.name}</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', alignItems: 'center' }}>
                      <span style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.75rem' }}>{selTenantId ?? 'NEW'}</span>
                      {selTenant && <span className={`badge ${selTenant.status === 'ACTIVE' || selTenant.status === 'TRIAL' ? 'badge-approved' : 'badge-rejected'}`}>{selTenant.status}</span>}
                    </div>
                  </div>
                </div>
                {isRoot && selTenantId && (
                  <button onClick={() => setShowTSuspend(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', background: selTenant?.status === 'SUSPENDED' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${selTenant?.status === 'SUSPENDED' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, color: selTenant?.status === 'SUSPENDED' ? '#10b981' : '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }}>
                    <ShieldAlert size={13} /> {selTenant?.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                  </button>
                )}
              </div>

              {selTenantId !== null ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Sec t="Tenant Identity" />
                  <G4><F label="Tenant ID"><Val v={selTenant?.tenantId} /></F><F label="Name"><Val v={selTenant?.name} /></F><F label="Domain"><Val v={selTenant?.domain} /></F><F label="Plan"><Val v={<span style={{ color: PLAN_COLORS[selTenant?.subscriptionPlan ?? 'free'] }}>{PLAN_LABELS[selTenant?.subscriptionPlan ?? 'free']}</span>} /></F></G4>
                  <Sec t="Status" />
                  <G4><F label="Status"><Val v={selTenant?.status} /></F><F label="Root"><Val v={selTenant?.isRoot ? 'Yes' : 'No'} /></F><F label="Created"><Val v={selTenant?.createdAt ? new Date(selTenant.createdAt).toLocaleString() : '—'} /></F><F label="Expires"><Val v={selTenant?.subscriptionExpiresAt ? new Date(selTenant.subscriptionExpiresAt).toLocaleDateString() : 'Never'} /></F></G4>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setShowTSave(true); }}>
                  <Sec t="New Tenant" />
                  <G4>
                    <F label="Tenant ID (slug)"><input style={iSt} value={tForm.tenantId} onChange={e => setTForm(f => ({ ...f, tenantId: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} required placeholder="acme-corp" /></F>
                    <F label="Display Name"><input style={iSt} value={tForm.name} onChange={e => setTForm(f => ({ ...f, name: e.target.value }))} required placeholder="ACME Corporation" /></F>
                    <F label="Domain"><input style={iSt} value={tForm.domain} onChange={e => setTForm(f => ({ ...f, domain: e.target.value }))} placeholder="acme.queensos.com" /></F>
                    <F label="Plan"><select style={iSt} value={tForm.subscriptionPlan} onChange={e => setTForm(f => ({ ...f, subscriptionPlan: e.target.value }))}><option value="free">Free</option><option value="trial">Trial</option><option value="premium">Premium</option><option value="enterprise">Enterprise</option><option value="unlimited">Unlimited</option></select></F>
                  </G4>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.82rem' }} onClick={() => { setTView('list'); onViewChange?.('list'); }}>Discard</button>
                    <button type="submit" style={{ padding: '0.55rem 1.4rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}><Save size={13} /> Register Tenant</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ECOSYSTEM PARTNERS TAB                                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ecosystem' && (
        <>
          {eView === 'list' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users style={{ color: '#3b82f6' }} size={18} />
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Ecosystem Partners</h3>
                  <span style={{ fontSize: '0.62rem', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '0.1rem 0.45rem', borderRadius: '99px', border: '1px solid rgba(59,130,246,0.2)', fontWeight: '800' }}>{ecoPartners.length}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select value={eCatFilter} onChange={e => { setECatFilter(e.target.value); setEPage(1); }} style={{ padding: '0.4rem 0.7rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', outline: 'none' }}>
                    <option value="ALL">All Categories</option>
                    {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{CAT_ICONS[k]} {v}</option>)}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.4rem', overflow: 'hidden', height: '34px' }}>
                    <Search size={12} style={{ color: 'var(--foreground-muted)', marginLeft: '0.6rem' }} />
                    <input value={eSearch} onChange={e => { setESearch(e.target.value); setEPage(1); }} placeholder="Search partners…" style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.78rem', outline: 'none', padding: '0 0.6rem', width: '160px' }} />
                  </div>
                </div>
              </div>
              {ecoQ.isLoading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--foreground-muted)', fontSize: '0.8rem' }}>Loading…</div> : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead><tr><th>Category</th><th>Company / Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Verified</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                    <tbody>
                      {(() => {
                        const paginated = filteredEco.slice((ePage - 1) * ePageSize, ePage * ePageSize);
                        return paginated.map(p => {
                          const cat = (p.metadata as Record<string, unknown>)?.partnerCategory as string ?? 'CORPORATE';
                          return (
                            <tr key={p.id}>
                              <td><span style={{ fontSize: '0.72rem', fontWeight: '800' }}>{CAT_ICONS[cat]} {CAT_LABELS[cat] ?? cat}</span></td>
                              <td><div style={{ fontWeight: '700' }}>{p.companyName || `${p.firstName} ${p.lastName}`}</div><div style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>{p.taxId}</div></td>
                              <td style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{p.email}</td>
                              <td style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{p.phone}</td>
                              <td><span className={`badge ${p.status === 'active' ? 'badge-approved' : p.status === 'suspended' ? 'badge-rejected' : 'badge-pending'}`}>{p.status}</span></td>
                              <td><span style={{ fontSize: '0.7rem', color: p.isVerified ? '#10b981' : 'var(--foreground-muted)' }}>{p.isVerified ? '✓ Verified' : 'Pending'}</span></td>
                              <td style={{ textAlign: 'right' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} onClick={() => { setSelEcoId(p.id); setEForm({ ...p }); setEEditMode(false); setEView('manage'); onViewChange?.('manage'); }}>
                                  <Sliders size={11} /> Manage
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                      {filteredEco.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)', fontSize: '0.8rem' }}>No ecosystem partners found</td></tr>}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={ePage}
                    pageSize={ePageSize}
                    totalItems={filteredEco.length}
                    onPageChange={setEPage}
                    onPageSizeChange={(size) => { setEPageSize(size); setEPage(1); }}
                  />
                </div>
              )}
            </div>
          )}

          {eView === 'manage' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button onClick={() => { setEView('list'); onViewChange?.('list'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={15} /></button>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800' }}>{selEcoId === null ? 'Register Ecosystem Partner' : (selEco?.companyName || `${selEco?.firstName} ${selEco?.lastName}`)}</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', alignItems: 'center' }}>
                      {selEcoId && <span style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.72rem' }}>{selEcoId.slice(0, 8)}…</span>}
                      {selEco && <span className={`badge ${selEco.status === 'active' ? 'badge-approved' : 'badge-rejected'}`}>{selEco.status}</span>}
                      {!eEditMode && selEcoId && <span style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.62rem', fontWeight: '800', padding: '0.1rem 0.45rem', borderRadius: '99px', border: '1px solid rgba(255,184,0,0.2)' }}>VIEW ONLY</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {selEcoId && !eEditMode && (
                    <>
                      {!selEco?.isVerified && <button onClick={async () => { await verifyEcoM.mutateAsync(selEcoId); triggerToast('Partner verified.'); }} style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }}>✓ Verify</button>}
                      <button onClick={async () => { await suspendEcoM.mutateAsync(selEcoId); triggerToast('Partner suspended.'); }} style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }}>Suspend</button>
                      <button onClick={() => setShowEDelete(true)} style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }}>Delete</button>
                      <button onClick={() => setEEditMode(true)} style={{ padding: '0.45rem 1rem', fontSize: '0.75rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}>Edit</button>
                    </>
                  )}
                  {eEditMode && selEcoId && <button className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={() => setEEditMode(false)}><X size={13} /> Cancel</button>}
                </div>
              </div>

              {!eEditMode && selEcoId ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Sec t="Partner Details" />
                  <G4>
                    <F label="Company Name"><Val v={selEco?.companyName} /></F>
                    <F label="Contact Name"><Val v={`${selEco?.firstName} ${selEco?.lastName}`} /></F>
                    <F label="Email"><Val v={selEco?.email} /></F>
                    <F label="Phone"><Val v={selEco?.phone} /></F>
                    <F label="Tax ID"><Val v={selEco?.taxId} /></F>
                    <F label="Category"><Val v={`${CAT_ICONS[(selEco?.metadata as Record<string,unknown>)?.partnerCategory as string ?? '']} ${CAT_LABELS[(selEco?.metadata as Record<string,unknown>)?.partnerCategory as string ?? ''] ?? ''}`} /></F>
                    <F label="Revenue Share"><Val v={`${(selEco?.metadata as Record<string,unknown>)?.revenueShare ?? 0}%`} /></F>
                    <F label="Integration"><Val v={(selEco?.metadata as Record<string,unknown>)?.integrationStatus as string} /></F>
                  </G4>
                  <Sec t="Banking Details" />
                  <G4>
                    <F label="Bank Name"><Val v={(selEco?.metadata as Record<string,unknown>)?.bankName as string} /></F>
                    <F label="Account Number"><Val v={(selEco?.metadata as Record<string,unknown>)?.accountNumber as string} /></F>
                    <F label="SWIFT Code"><Val v={(selEco?.metadata as Record<string,unknown>)?.swiftCode as string} /></F>
                  </G4>
                  {selEco?.businessDescription && <><Sec t="Description" /><div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>{selEco.businessDescription}</div></>}
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setShowESave(true); }}>
                  <Sec t="Partner Identity" />
                  <G4>
                    <F label="Company Name"><input style={iSt} value={eForm.companyName ?? ''} onChange={e => setEForm(f => ({ ...f, companyName: e.target.value }))} placeholder="GTBank Nigeria" /></F>
                    <F label="Contact First Name"><input style={iSt} value={eForm.firstName ?? ''} onChange={e => setEForm(f => ({ ...f, firstName: e.target.value }))} required /></F>
                    <F label="Contact Last Name"><input style={iSt} value={eForm.lastName ?? ''} onChange={e => setEForm(f => ({ ...f, lastName: e.target.value }))} required /></F>
                    <F label="Email"><input type="email" style={iSt} value={eForm.email ?? ''} onChange={e => setEForm(f => ({ ...f, email: e.target.value }))} required /></F>
                    <F label="Phone"><input style={iSt} value={eForm.phone ?? ''} onChange={e => setEForm(f => ({ ...f, phone: e.target.value }))} /></F>
                    <F label="Tax ID"><input style={iSt} value={eForm.taxId ?? ''} onChange={e => setEForm(f => ({ ...f, taxId: e.target.value }))} /></F>
                    <F label="Category">
                      <select style={iSt} value={(eForm.metadata as Record<string,unknown>)?.partnerCategory as string ?? 'CORPORATE'} onChange={e => setEForm(f => ({ ...f, metadata: { ...(f.metadata as object), partnerCategory: e.target.value } }))}>
                        {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{CAT_ICONS[k]} {v}</option>)}
                      </select>
                    </F>
                    <F label="Revenue Share (%)"><input type="number" step="0.1" style={iSt} value={(eForm.metadata as Record<string,unknown>)?.revenueShare as number ?? 0} onChange={e => setEForm(f => ({ ...f, metadata: { ...(f.metadata as object), revenueShare: parseFloat(e.target.value) } }))} /></F>
                  </G4>
                  <Sec t="Banking & Integration" />
                  <G4>
                    <F label="Bank Name"><input style={iSt} value={(eForm.metadata as Record<string,unknown>)?.bankName as string ?? ''} onChange={e => setEForm(f => ({ ...f, metadata: { ...(f.metadata as object), bankName: e.target.value } }))} /></F>
                    <F label="Account Number"><input style={iSt} value={(eForm.metadata as Record<string,unknown>)?.accountNumber as string ?? ''} onChange={e => setEForm(f => ({ ...f, metadata: { ...(f.metadata as object), accountNumber: e.target.value } }))} /></F>
                    <F label="SWIFT Code"><input style={iSt} value={(eForm.metadata as Record<string,unknown>)?.swiftCode as string ?? ''} onChange={e => setEForm(f => ({ ...f, metadata: { ...(f.metadata as object), swiftCode: e.target.value } }))} /></F>
                    <F label="Integration Status">
                      <select style={iSt} value={(eForm.metadata as Record<string,unknown>)?.integrationStatus as string ?? 'PENDING'} onChange={e => setEForm(f => ({ ...f, metadata: { ...(f.metadata as object), integrationStatus: e.target.value } }))}>
                        {['PENDING','SANDBOX','LIVE','FAILED'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </F>
                  </G4>
                  <Sec t="Description" />
                  <textarea style={{ ...iSt, height: '80px', resize: 'vertical' }} value={eForm.businessDescription ?? ''} onChange={e => setEForm(f => ({ ...f, businessDescription: e.target.value }))} placeholder="Brief description of this partner's role…" />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.82rem' }} onClick={() => { if (selEcoId) setEEditMode(false); else { setEView('list'); onViewChange?.('list'); } }}>Discard</button>
                    <button type="submit" style={{ padding: '0.55rem 1.4rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}><Save size={13} /> {selEcoId ? 'Save Changes' : 'Register Partner'}</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Tenant modals ── */}
      {showTSave && <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="glass-card" style={{ maxWidth: '380px', width: '90%', padding: '2rem', textAlign: 'center' }}><AlertTriangle size={36} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} /><h3 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>Confirm Registration</h3><p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>Create tenant <strong style={{ color: '#fff' }}>{tForm.tenantId}</strong>?</p><div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}><button className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }} onClick={() => setShowTSave(false)}>Cancel</button><button style={{ padding: '0.5rem 1.25rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }} onClick={handleTenantSave}>Confirm</button></div></div></div>}
      {showTSuccess && <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="glass-card" style={{ maxWidth: '380px', width: '90%', padding: '2rem', textAlign: 'center' }}><CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} /><h3 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>Tenant Registered</h3><p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>Tenant <strong style={{ color: '#fff' }}>{tForm.tenantId}</strong> is now active.</p><button style={{ padding: '0.5rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }} onClick={() => { setShowTSuccess(false); setTView('list'); onViewChange?.('list'); }}>Okay</button></div></div>}
      {showTSuspend && selTenant && <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}><ShieldAlert size={36} style={{ color: selTenant.status === 'SUSPENDED' ? '#10b981' : '#ef4444', margin: '0 auto 1rem' }} /><h3 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>{selTenant.status === 'SUSPENDED' ? 'Activate Tenant?' : 'Suspend Tenant?'}</h3><p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>{selTenant.status === 'SUSPENDED' ? `Restore ${selTenant.name}?` : `Suspend ${selTenant.name}? All users lose access.`}</p><div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}><button className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }} onClick={() => setShowTSuspend(false)}>Cancel</button><button style={{ padding: '0.5rem 1.25rem', background: selTenant.status === 'SUSPENDED' ? '#10b981' : '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }} onClick={handleTenantToggle}>{selTenant.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}</button></div></div></div>}

      {/* ── Ecosystem modals ── */}
      {showESave && <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="glass-card" style={{ maxWidth: '380px', width: '90%', padding: '2rem', textAlign: 'center' }}><AlertTriangle size={36} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} /><h3 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>Confirm Save</h3><p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>Save changes to this ecosystem partner?</p><div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}><button className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }} onClick={() => setShowESave(false)}>Cancel</button><button style={{ padding: '0.5rem 1.25rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }} onClick={handleEcoSave}>Confirm</button></div></div></div>}
      {showESuccess && <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="glass-card" style={{ maxWidth: '380px', width: '90%', padding: '2rem', textAlign: 'center' }}><CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} /><h3 style={{ fontWeight: '800', marginBottom: '0.5rem' }}>Partner Saved</h3><p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>Ecosystem partner record updated successfully.</p><button style={{ padding: '0.5rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }} onClick={() => { setShowESuccess(false); setEEditMode(false); setEView('list'); onViewChange?.('list'); }}>Okay</button></div></div>}
      {showEDelete && <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}><AlertTriangle size={36} style={{ color: '#ef4444', margin: '0 auto 1rem' }} /><h3 style={{ fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Remove Partner?</h3><p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>Permanently remove this ecosystem partner? This cannot be undone.</p><div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}><button className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }} onClick={() => setShowEDelete(false)}>Cancel</button><button style={{ padding: '0.5rem 1.25rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700', cursor: 'pointer' }} onClick={handleEcoDelete}>Remove</button></div></div></div>}

    </div>
  );
}
