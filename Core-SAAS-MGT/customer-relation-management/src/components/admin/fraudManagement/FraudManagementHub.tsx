import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Search, Eye, Trash2, X, Sliders, ArrowLeft, Edit2, Save, AlertTriangle, CheckCircle, UserX, Activity, ArrowUpRight, ArrowDownRight, DollarSign, Loader2, ArrowRight
} from 'lucide-react';
import Pagination from '../../Pagination';

// --- Types ---
interface FraudRule {
  id: string;
  name: string;
  triggerType: 'VELOCITY' | 'GEO_FENCE' | 'AMOUNT_THRESHOLD';
  thresholdValue: number;
  timeWindowMinutes?: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'ENABLED' | 'DISABLED';
  description: string;
}

interface InternalBlacklistEntry {
  id: string;
  customerId: string;
  name: string;
  accountNumber: string;
  reason: string;
  comments: string;
  blacklistType: 'HARD' | 'SOFT';
  status: 'BLACKLISTED';
  dateAdded: string;
}

interface ExternalBlacklistEntry {
  id: string;
  name: string;
  bank: string;
  accountNumber: string;
  reason: string;
  comments: string;
  blacklistType: 'HARD' | 'SOFT';
  status: 'BLACKLISTED';
  dateAdded: string;
}

interface InternalWhitelistEntry {
  id: string;
  customerId: string;
  name: string;
  accountNumber: string;
  reason: string;
  comments: string;
  whitelistType: 'FULL' | 'PARTIAL';
  status: 'WHITELISTED';
  dateAdded: string;
}

interface ExternalWhitelistEntry {
  id: string;
  name: string;
  bank: string;
  accountNumber: string;
  reason: string;
  comments: string;
  whitelistType: 'FULL' | 'PARTIAL';
  status: 'WHITELISTED';
  dateAdded: string;
}

interface FraudManagementHubProps {
  triggerToast: (msg: string) => void;
  addNewTrigger?: number;
  onViewChange?: (view: 'main_menu' | 'list' | 'manage') => void;
}

// --- Reusable Styles ---
const iSt: React.CSSProperties = { width:'100%', padding:'0.65rem 1rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'0.5rem', color:'#fff', fontSize:'0.85rem', outline:'none', boxSizing:'border-box' };
const iStFocus: React.CSSProperties = { ...iSt, border: '1px solid rgba(255,184,0,0.25)' };
const lSt: React.CSSProperties = { display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', marginBottom: '0.4rem', textTransform: 'uppercase' };
const Card = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
      <div style={{ color }}>{icon}</div>
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-outfit)', color: '#fff' }}>{value}</div>
  </div>
);

const BlacklistTypeSelector = ({ value, onChange, disabled }: { value: 'HARD' | 'SOFT', onChange: (val: 'HARD' | 'SOFT') => void, disabled?: boolean }) => (
  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: disabled ? 'default' : 'pointer', opacity: value === 'HARD' ? 1 : 0.6 }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${value === 'HARD' ? '#10b981' : 'rgba(255,255,255,0.2)'}`, background: value === 'HARD' ? 'rgba(16,185,129,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
        {value === 'HARD' && <CheckCircle size={14} color="#10b981" />}
      </div>
      <input type="radio" value="HARD" checked={value === 'HARD'} onChange={() => !disabled && onChange('HARD')} disabled={disabled} style={{ display: 'none' }} />
      <div style={{ color: disabled ? 'var(--foreground-muted)' : '#fff' }}><strong>HARD BLACKLIST</strong> <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>(Complete ban, no exceptions)</span></div>
    </label>
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: disabled ? 'default' : 'pointer', opacity: value === 'SOFT' ? 1 : 0.6 }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${value === 'SOFT' ? '#10b981' : 'rgba(255,255,255,0.2)'}`, background: value === 'SOFT' ? 'rgba(16,185,129,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
        {value === 'SOFT' && <CheckCircle size={14} color="#10b981" />}
      </div>
      <input type="radio" value="SOFT" checked={value === 'SOFT'} onChange={() => !disabled && onChange('SOFT')} disabled={disabled} style={{ display: 'none' }} />
      <div style={{ color: disabled ? 'var(--foreground-muted)' : '#fff' }}><strong>SOFT BLACKLIST</strong> <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>(Requires manual approval for txns)</span></div>
    </label>
  </div>
);

const WhitelistTypeSelector = ({ value, onChange, disabled }: { value: 'FULL' | 'PARTIAL', onChange: (val: 'FULL' | 'PARTIAL') => void, disabled?: boolean }) => (
  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: disabled ? 'default' : 'pointer', opacity: value === 'FULL' ? 1 : 0.6 }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${value === 'FULL' ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`, background: value === 'FULL' ? 'rgba(59,130,246,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
        {value === 'FULL' && <CheckCircle size={14} color="#3b82f6" />}
      </div>
      <input type="radio" value="FULL" checked={value === 'FULL'} onChange={() => !disabled && onChange('FULL')} disabled={disabled} style={{ display: 'none' }} />
      <div style={{ color: disabled ? 'var(--foreground-muted)' : '#fff' }}><strong>FULL WHITELIST</strong> <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>(No fraud checks applied)</span></div>
    </label>
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: disabled ? 'default' : 'pointer', opacity: value === 'PARTIAL' ? 1 : 0.6 }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${value === 'PARTIAL' ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`, background: value === 'PARTIAL' ? 'rgba(59,130,246,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
        {value === 'PARTIAL' && <CheckCircle size={14} color="#3b82f6" />}
      </div>
      <input type="radio" value="PARTIAL" checked={value === 'PARTIAL'} onChange={() => !disabled && onChange('PARTIAL')} disabled={disabled} style={{ display: 'none' }} />
      <div style={{ color: disabled ? 'var(--foreground-muted)' : '#fff' }}><strong>PARTIAL WHITELIST</strong> <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>(Standard limits still apply)</span></div>
    </label>
  </div>
);

export default function FraudManagementHub({ triggerToast, addNewTrigger, onViewChange }: FraudManagementHubProps) {
  const [activeTab, setActiveTab] = useState<'RULES' | 'INTERNAL' | 'EXTERNAL'>('RULES');
  const [view, setView] = useState<'main_menu' | 'list' | 'manage_rule' | 'create_internal' | 'internal_dashboard' | 'manage_external' | 'manage_internal' | 'whitelist_list' | 'whitelist_manage_internal' | 'whitelist_manage_external' | 'create_wl_internal' | 'wl_internal_dashboard'>('main_menu');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state — one per tab
  const [rulesPage, setRulesPage] = useState(1);
  const [internalPage, setInternalPage] = useState(1);
  const [externalPage, setExternalPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --- Rule Modals ---
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // --- Rule Form State ---
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formName, setFormName] = useState('');
  const [formTriggerType, setFormTriggerType] = useState<'VELOCITY' | 'GEO_FENCE' | 'AMOUNT_THRESHOLD'>('AMOUNT_THRESHOLD');
  const [formThresholdValue, setFormThresholdValue] = useState<number>(0);
  const [formWindow, setFormWindow] = useState<number>(60);
  const [formSeverity, setFormSeverity] = useState<'CRITICAL' | 'WARNING' | 'INFO'>('CRITICAL');
  const [formStatus, setFormStatus] = useState<'ENABLED' | 'DISABLED'>('ENABLED');
  const [formDesc, setFormDesc] = useState('');

  // --- Revert (Unblacklist/Unwhitelist) Modal States ---
  const [showRevertModal, setShowRevertModal] = useState<'blacklist_internal' | 'blacklist_external' | 'whitelist_internal' | 'whitelist_external' | null>(null);
  const [revertReason, setRevertReason] = useState('False Positive');
  const [revertComment, setRevertComment] = useState('');
  const [revertSelectedRules, setRevertSelectedRules] = useState<string[]>([]);

  // --- Internal Blacklist Form State ---
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [isSearchingInternal, setIsSearchingInternal] = useState(false);
  const [internalSearchResult, setInternalSearchResult] = useState<any | null>(null);
  const [showInternalBlacklistModal, setShowInternalBlacklistModal] = useState(false);
  const [showInternalSuccessModal, setShowInternalSuccessModal] = useState(false);
  const [internalReason, setInternalReason] = useState('');
  const [internalComments, setInternalComments] = useState('');
  const [internalBlacklistType, setInternalBlacklistType] = useState<'HARD' | 'SOFT'>('HARD');
  const [selectedInternalId, setSelectedInternalId] = useState<string | null>(null);

  // --- External Blacklist Form State ---
  const [selectedExternalId, setSelectedExternalId] = useState<string | null>(null);
  const [extName, setExtName] = useState('');
  const [extBank, setExtBank] = useState('');
  const [extAccount, setExtAccount] = useState('');
  const [extReason, setExtReason] = useState('');
  const [extComments, setExtComments] = useState('');
  const [extBlacklistType, setExtBlacklistType] = useState<'HARD' | 'SOFT'>('HARD');
  const [showExtSuccessModal, setShowExtSuccessModal] = useState(false);

  // --- Whitelist State ---
  const [activeWhitelistTab, setActiveWhitelistTab] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  
  const [wlInternalSearchQuery, setWlInternalSearchQuery] = useState('');
  const [isWlSearchingInternal, setIsWlSearchingInternal] = useState(false);
  const [wlInternalSearchResult, setWlInternalSearchResult] = useState<any | null>(null);
  const [showWlInternalModal, setShowWlInternalModal] = useState(false);
  const [showWlInternalSuccessModal, setShowWlInternalSuccessModal] = useState(false);
  const [wlInternalReason, setWlInternalReason] = useState('');
  const [wlInternalComments, setWlInternalComments] = useState('');
  const [wlInternalType, setWlInternalType] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [selectedWlInternalId, setSelectedWlInternalId] = useState<string | null>(null);

  const [selectedWlExternalId, setSelectedWlExternalId] = useState<string | null>(null);
  const [wlExtName, setWlExtName] = useState('');
  const [wlExtBank, setWlExtBank] = useState('');
  const [wlExtAccount, setWlExtAccount] = useState('');
  const [wlExtReason, setWlExtReason] = useState('');
  const [wlExtComments, setWlExtComments] = useState('');
  const [wlExtType, setWlExtType] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [showWlExtSuccessModal, setShowWlExtSuccessModal] = useState(false);

  // --- Mock Data ---
  const [fraudRules, setFraudRules] = useState<FraudRule[]>([
    {
      id: 'frd_rule_101', name: 'High Frequency Reversal Request', triggerType: 'VELOCITY', thresholdValue: 5, timeWindowMinutes: 10, severity: 'CRITICAL', status: 'ENABLED', description: 'Flags driver accounts requesting more than 5 payout reversals within 10 minutes.'
    },
    {
      id: 'frd_rule_102', name: 'Cross-Border Location Outlier', triggerType: 'GEO_FENCE', thresholdValue: 1, severity: 'WARNING', status: 'ENABLED', description: 'Flags transactions originating outside predefined operating city polygons.'
    }
  ]);

  const [internalBlacklist, setInternalBlacklist] = useState<InternalBlacklistEntry[]>([
    {
      id: 'ib_1001', customerId: 'cust_001', name: 'John Doe', accountNumber: '0123456789', reason: 'Repeated chargebacks', comments: 'System matched velocity flags 5 times.', blacklistType: 'HARD', status: 'BLACKLISTED', dateAdded: '2025-05-18T10:00:00Z'
    }
  ]);

  const [externalBlacklist, setExternalBlacklist] = useState<ExternalBlacklistEntry[]>([
    {
      id: 'eb_2001', name: 'Scam Syndicate Alpha', bank: 'Global Trust Bank', accountNumber: '9876543210', reason: 'Confirmed identity fraud ring', comments: 'Reported by central bank DB.', blacklistType: 'HARD', status: 'BLACKLISTED', dateAdded: '2025-04-10T14:20:00Z'
    }
  ]);

  const [internalWhitelist, setInternalWhitelist] = useState<InternalWhitelistEntry[]>([
    {
      id: 'iwl_1001', customerId: 'cust_002', name: 'Jane Smith', accountNumber: '9876543211', reason: 'VIP Corporate Account', comments: 'Executive clearance from Board.', whitelistType: 'FULL', status: 'WHITELISTED', dateAdded: '2025-05-18T10:00:00Z'
    }
  ]);

  const [externalWhitelist, setExternalWhitelist] = useState<ExternalWhitelistEntry[]>([
    {
      id: 'ewl_2001', name: 'Partner Org Beta', bank: 'Global Trust Bank', accountNumber: '0123456789', reason: 'Trusted Partner API', comments: 'SLA agreement signed.', whitelistType: 'FULL', status: 'WHITELISTED', dateAdded: '2025-04-10T14:20:00Z'
    }
  ]);

  // Listen to Add New trigger from header
  useEffect(() => {
    if (addNewTrigger && addNewTrigger > 0) {
      if (activeTab === 'RULES') {
        handleOpenCreateRule();
      } else if (activeTab === 'INTERNAL') {
        setView('create_internal');
        onViewChange?.('manage');
        setInternalSearchQuery('');
        setInternalSearchResult(null);
      } else if (activeTab === 'EXTERNAL') {
        setSelectedExternalId(null);
        setExtName(''); setExtBank(''); setExtAccount(''); setExtReason(''); setExtComments(''); setExtBlacklistType('HARD');
        setIsEditMode(true);
        setView('manage_external');
        onViewChange?.('manage');
      }
      
      // Whitelist Triggers
      if (view === 'whitelist_list') {
        if (activeWhitelistTab === 'INTERNAL') {
          setView('create_wl_internal');
          onViewChange?.('manage');
          setWlInternalSearchQuery('');
          setWlInternalSearchResult(null);
        } else if (activeWhitelistTab === 'EXTERNAL') {
          setSelectedWlExternalId(null);
          setWlExtName(''); setWlExtBank(''); setWlExtAccount(''); setWlExtReason(''); setWlExtComments(''); setWlExtType('FULL');
          setIsEditMode(true);
          setView('whitelist_manage_external');
          onViewChange?.('manage');
        }
      }
    }
  }, [addNewTrigger]);

  // --- Rules Handlers ---
  const handleOpenCreateRule = () => {
    setSelectedId(null); setFormName(''); setFormTriggerType('AMOUNT_THRESHOLD'); setFormThresholdValue(0);
    setFormWindow(60); setFormSeverity('WARNING'); setFormStatus('ENABLED'); setFormDesc('');
    setIsEditMode(true);
    setView('manage_rule');
    onViewChange?.('manage');
  };

  const handleOpenManageRule = (rule: FraudRule) => {
    setSelectedId(rule.id); setFormName(rule.name); setFormTriggerType(rule.triggerType);
    setFormThresholdValue(rule.thresholdValue); setFormWindow(rule.timeWindowMinutes || 60);
    setFormSeverity(rule.severity); setFormStatus(rule.status); setFormDesc(rule.description);
    setIsEditMode(false);
    setView('manage_rule');
    onViewChange?.('manage');
  };

  const handleConfirmSaveRule = () => {
    const isNew = selectedId === null;
    const finalId = isNew ? 'frd_rule_' + Math.floor(Math.random() * 10000) : selectedId!;
    const updatedRule: FraudRule = {
      id: finalId, name: formName, triggerType: formTriggerType, thresholdValue: formThresholdValue,
      timeWindowMinutes: formTriggerType === 'VELOCITY' ? formWindow : undefined, severity: formSeverity,
      status: formStatus, description: formDesc
    };

    if (isNew) setFraudRules(prev => [...prev, updatedRule]);
    else setFraudRules(prev => prev.map(r => r.id === selectedId ? updatedRule : r));

    setShowSaveConfirm(false); setShowSaveSuccess(true);
  };

  const handleConfirmDeleteRule = () => {
    if (selectedId === null) return;
    setFraudRules(prev => prev.filter(r => r.id !== selectedId));
    setShowDeleteConfirm(false);
    triggerToast(`Security rule ${selectedId} decommissioned.`);
    setView('list'); onViewChange?.('list');
  };

  // --- Internal Blacklist Handlers ---
  const handleSearchInternal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalSearchQuery.trim()) return;
    setIsSearchingInternal(true);
    setInternalSearchResult(null);
    setTimeout(() => {
      if (internalSearchQuery.length > 3) {
        setInternalSearchResult({
          id: 'cust_' + Math.floor(Math.random() * 1000),
          name: 'Jane Smith',
          account: '0981123344',
          email: 'jane.smith@example.com',
          phone: '+1 555 0192',
          status: 'ACTIVE'
        });
      } else {
        setInternalSearchResult('NOT_FOUND');
      }
      setIsSearchingInternal(false);
    }, 1500);
  };

  const handleConfirmInternalBlacklist = () => {
    if (!internalReason.trim()) {
      triggerToast('Reason is required to blacklist.');
      return;
    }
    const newEntry: InternalBlacklistEntry = {
      id: 'ib_' + Math.floor(Math.random() * 10000),
      customerId: internalSearchResult.id,
      name: internalSearchResult.name,
      accountNumber: internalSearchResult.account,
      reason: internalReason,
      comments: internalComments,
      blacklistType: internalBlacklistType,
      status: 'BLACKLISTED',
      dateAdded: new Date().toISOString()
    };
    setInternalBlacklist(prev => [newEntry, ...prev]);
    setShowInternalBlacklistModal(false);
    setShowInternalSuccessModal(true);
  };

  const handleOpenManageInternal = (entry: InternalBlacklistEntry) => {
    setSelectedInternalId(entry.id);
    setInternalReason(entry.reason);
    setInternalComments(entry.comments);
    setInternalBlacklistType(entry.blacklistType);
    setIsEditMode(false);
    setView('manage_internal');
    onViewChange?.('manage');
  };

  const handleSaveInternalBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalReason.trim()) {
      triggerToast('Reason is required.');
      return;
    }
    setInternalBlacklist(prev => prev.map(entry => entry.id === selectedInternalId ? { ...entry, reason: internalReason, comments: internalComments, blacklistType: internalBlacklistType } : entry));
    triggerToast('Internal blacklist details updated successfully.');
    setIsEditMode(false);
  };

  const handleRemoveInternalBlacklist = () => {
    if (!selectedInternalId) return;
    setRevertReason('False Positive');
    setRevertComment('');
    setRevertSelectedRules(fraudRules.map(r => r.id));
    setShowRevertModal('blacklist_internal');
  };

  // --- External Blacklist Handlers ---
  const handleOpenManageExternal = (entry: ExternalBlacklistEntry) => {
    setSelectedExternalId(entry.id);
    setExtName(entry.name);
    setExtBank(entry.bank);
    setExtAccount(entry.accountNumber);
    setExtReason(entry.reason);
    setExtComments(entry.comments);
    setExtBlacklistType(entry.blacklistType);
    setIsEditMode(false);
    setView('manage_external');
    onViewChange?.('manage');
  };

  const handleSaveExternalBlacklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extName.trim() || !extBank.trim() || !extAccount.trim() || !extReason.trim()) {
      triggerToast('Please fill all required external blacklist fields.');
      return;
    }
    const isNew = selectedExternalId === null;
    const updatedEntry: ExternalBlacklistEntry = {
      id: isNew ? 'eb_' + Math.floor(Math.random() * 10000) : selectedExternalId!,
      name: extName, bank: extBank, accountNumber: extAccount, reason: extReason,
      comments: extComments, blacklistType: extBlacklistType, status: 'BLACKLISTED', dateAdded: isNew ? new Date().toISOString() : externalBlacklist.find(e => e.id === selectedExternalId)?.dateAdded || new Date().toISOString()
    };
    
    if (isNew) {
      setExternalBlacklist(prev => [updatedEntry, ...prev]);
      setShowExtSuccessModal(true);
    } else {
      setExternalBlacklist(prev => prev.map(e => e.id === selectedExternalId ? updatedEntry : e));
      triggerToast('External blacklist details updated successfully.');
      setIsEditMode(false);
    }
  };

  const handleRemoveExternalBlacklist = () => {
    if (!selectedExternalId) return;
    setRevertReason('False Positive');
    setRevertComment('');
    setRevertSelectedRules(fraudRules.map(r => r.id));
    setShowRevertModal('blacklist_external');
  };

  const handleConfirmRevert = () => {
    if (!revertComment.trim()) {
      triggerToast('Audit comments are required.');
      return;
    }
    
    if (showRevertModal === 'blacklist_internal') {
      const entry = internalBlacklist.find(e => e.id === selectedInternalId);
      if (entry) {
        setInternalBlacklist(prev => prev.filter(e => e.id !== selectedInternalId));
        triggerToast(`Unblacklisted internal customer ${entry.name} successfully. Reason: ${revertReason}. Reverted rules logic exclusions: ${fraudRules.filter(r => !revertSelectedRules.includes(r.id)).map(r => r.name).join(', ') || 'None'}`);
        setView('list');
        onViewChange?.('list');
      }
    } else if (showRevertModal === 'blacklist_external') {
      const entry = externalBlacklist.find(e => e.id === selectedExternalId);
      if (entry) {
        setExternalBlacklist(prev => prev.filter(e => e.id !== selectedExternalId));
        triggerToast(`Unblacklisted external target ${entry.name} successfully. Reason: ${revertReason}. Reverted rules logic exclusions: ${fraudRules.filter(r => !revertSelectedRules.includes(r.id)).map(r => r.name).join(', ') || 'None'}`);
        setView('list');
        onViewChange?.('list');
      }
    } else if (showRevertModal === 'whitelist_internal') {
      const entry = internalWhitelist.find(e => e.id === selectedWlInternalId);
      if (entry) {
        setInternalWhitelist(prev => prev.filter(e => e.id !== selectedWlInternalId));
        triggerToast(`Unwhitelisted internal customer ${entry.name} successfully. Reason: ${revertReason}. Reverted rules logic exclusions: ${fraudRules.filter(r => !revertSelectedRules.includes(r.id)).map(r => r.name).join(', ') || 'None'}`);
        setView('whitelist_list');
        onViewChange?.('list');
      }
    } else if (showRevertModal === 'whitelist_external') {
      const entry = externalWhitelist.find(e => e.id === selectedWlExternalId);
      if (entry) {
        setExternalWhitelist(prev => prev.filter(e => e.id !== selectedWlExternalId));
        triggerToast(`Unwhitelisted external target ${entry.name} successfully. Reason: ${revertReason}. Reverted rules logic exclusions: ${fraudRules.filter(r => !revertSelectedRules.includes(r.id)).map(r => r.name).join(', ') || 'None'}`);
        setView('whitelist_list');
        onViewChange?.('list');
      }
    }
    setShowRevertModal(null);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* ── MAIN MENU ── */}
      {view === 'main_menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div 
              onClick={() => { setView('list'); onViewChange?.('list'); }}
              className="glass-card" 
              style={{ padding: '2rem', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
            >
              <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.75rem' }}>
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontFamily: 'var(--font-outfit)', fontWeight: '800', color: '#fff' }}>Blacklist Operations</h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>Manage fraud rules, internal customer blacklists, and register malicious external actors.</p>
              </div>
            </div>

            <div 
              onClick={() => { setView('whitelist_list'); onViewChange?.('list'); }}
              className="glass-card" 
              style={{ padding: '2rem', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
              onMouseEnter={(e) => e.currentTarget.style.border = '1px solid var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)'}
            >
              <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1rem', borderRadius: '0.75rem' }}>
                <CheckCircle size={28} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontFamily: 'var(--font-outfit)', fontWeight: '800', color: '#fff' }}>Whitelist Operations</h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>Manage trusted entities and approve safe customer accounts.</p>
              </div>
            </div>

            <div 
              onClick={() => triggerToast('Bulk Blacklist coming soon.')}
              className="glass-card" 
              style={{ padding: '2rem', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
            >
              <div style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '1rem', borderRadius: '0.75rem' }}>
                <Activity size={28} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontFamily: 'var(--font-outfit)', fontWeight: '800', color: '#fff' }}>Bulk Blacklist</h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>Upload CSV to blacklist multiple actors across the network simultaneously.</p>
              </div>
            </div>

            <div 
              onClick={() => triggerToast('Bulk Whitelist coming soon.')}
              className="glass-card" 
              style={{ padding: '2rem', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
            >
              <div style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '1rem', borderRadius: '0.75rem' }}>
                <Activity size={28} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontFamily: 'var(--font-outfit)', fontWeight: '800', color: '#fff' }}>Bulk Whitelist</h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>Upload CSV to whitelist and pre-approve multiple entities at scale.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <div className="glass-card">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => { setView('main_menu'); onViewChange?.('main_menu'); }} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', padding: 0 }}>
              <ArrowLeft size={16} /> Back to Hub Menu
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ShieldAlert style={{ color: 'var(--primary)' }} size={20} />
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0 }}>Fraud & Security Control</h3>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {(['RULES', 'INTERNAL', 'EXTERNAL'] as const).map(tab => (
                  <button 
                    key={tab}
                    onClick={() => { setActiveTab(tab); setSearchQuery(''); setRulesPage(1); setInternalPage(1); setExternalPage(1); }}
                    style={{ background: 'none', border: 'none', color: activeTab === tab ? 'var(--primary)' : 'var(--foreground-muted)', fontWeight: activeTab === tab ? '800' : '500', fontSize: '0.85rem', cursor: 'pointer', padding: '0 0 0.5rem 0', position: 'relative', transition: 'all 0.2s' }}
                  >
                    {tab === 'RULES' ? 'Fraud Rules' : tab === 'INTERNAL' ? 'Internal Blacklist' : 'External Blacklist'}
                    {activeTab === tab && <div style={{ position: 'absolute', bottom: '-0.75rem', left: 0, right: 0, height: '2px', background: 'var(--primary)' }} />}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', overflow: 'hidden', height: '38px', boxSizing: 'border-box' }}>
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setRulesPage(1); setInternalPage(1); setExternalPage(1); }} style={{ height: '100%', padding: '0 1rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', outline: 'none', width: '220px' }} />
              <button style={{ height: '100%', padding: '0 1.25rem', background: 'rgba(15,15,15,0.95)', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={15} />
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            {activeTab === 'RULES' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Rule ID</th>
                    <th>Security Rule Title</th>
                    <th>Trigger Mode</th>
                    <th>Limit Threshold</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = fraudRules.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.triggerType.toLowerCase().includes(searchQuery.toLowerCase()));
                    const paginated = filtered.slice((rulesPage - 1) * pageSize, rulesPage * pageSize);
                    return paginated.map(rule => (
                      <tr key={rule.id}>
                        <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{rule.id}</td>
                        <td>
                          <div style={{ fontWeight: 'bold', color: '#fff' }}>{rule.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>{rule.description}</div>
                        </td>
                        <td>{rule.triggerType}</td>
                        <td style={{ fontWeight: 'bold' }}>
                          {rule.thresholdValue} {rule.triggerType === 'VELOCITY' ? 'Attempts' : rule.triggerType === 'GEO_FENCE' ? 'Bypasses' : 'USD'}
                        </td>
                        <td>
                          <span className={`badge ${rule.severity === 'CRITICAL' ? 'badge-rejected' : rule.severity === 'WARNING' ? 'badge-pending' : 'badge-approved'}`}>{rule.severity}</span>
                        </td>
                        <td>
                          <span className={`badge ${rule.status === 'ENABLED' ? 'badge-approved' : 'badge-rejected'}`}>{rule.status}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} onClick={() => handleOpenManageRule(rule)}>
                            <Sliders size={12} /> Manage
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            )}

            {activeTab === 'INTERNAL' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date Added</th>
                    <th>Customer Name</th>
                    <th>Account Number</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = internalBlacklist.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.accountNumber.includes(searchQuery));
                    const paginated = filtered.slice((internalPage - 1) * pageSize, internalPage * pageSize);
                    return (
                      <>
                        {paginated.map(entry => (
                          <tr key={entry.id}>
                            <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{new Date(entry.dateAdded).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 'bold', color: '#fff' }}>{entry.name}</td>
                            <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{entry.accountNumber}</td>
                            <td>
                              <div style={{ fontWeight: 'bold' }}>{entry.reason}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{entry.comments}</div>
                            </td>
                            <td><span className="badge badge-rejected">{entry.status}</span></td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} onClick={() => handleOpenManageInternal(entry)}>
                                <Sliders size={12} /> Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                        {paginated.length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)' }}>No internal blacklisted accounts found.</td></tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            )}

            {activeTab === 'EXTERNAL' && (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date Added</th>
                    <th>Target Name</th>
                    <th>Institution &amp; Account</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = externalBlacklist.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.bank.toLowerCase().includes(searchQuery.toLowerCase()));
                    const paginated = filtered.slice((externalPage - 1) * pageSize, externalPage * pageSize);
                    return (
                      <>
                        {paginated.map(entry => (
                          <tr key={entry.id}>
                            <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{new Date(entry.dateAdded).toLocaleDateString()}</td>
                            <td style={{ fontWeight: 'bold', color: '#fff' }}>{entry.name}</td>
                            <td>
                              <div style={{ color: '#fff' }}>{entry.bank}</div>
                              <div style={{ fontFamily: 'monospace', color: 'var(--primary)', fontSize: '0.75rem' }}>{entry.accountNumber}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 'bold' }}>{entry.reason}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{entry.comments}</div>
                            </td>
                            <td><span className="badge badge-rejected">{entry.status}</span></td>
                            <td style={{ textAlign: 'right' }}>
                              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} onClick={() => handleOpenManageExternal(entry)}>
                                <Sliders size={12} /> Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                        {paginated.length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)' }}>No external blacklisted accounts found.</td></tr>
                        )}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            )}
          </div>
          <Pagination
            currentPage={activeTab === 'RULES' ? rulesPage : activeTab === 'INTERNAL' ? internalPage : externalPage}
            pageSize={pageSize}
            totalItems={activeTab === 'RULES'
              ? fraudRules.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.triggerType.toLowerCase().includes(searchQuery.toLowerCase())).length
              : activeTab === 'INTERNAL'
                ? internalBlacklist.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.accountNumber.includes(searchQuery)).length
                : externalBlacklist.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.bank.toLowerCase().includes(searchQuery.toLowerCase())).length
            }
            onPageChange={(p) => activeTab === 'RULES' ? setRulesPage(p) : activeTab === 'INTERNAL' ? setInternalPage(p) : setExternalPage(p)}
            onPageSizeChange={(size) => { setPageSize(size); setRulesPage(1); setInternalPage(1); setExternalPage(1); }}
          />
        </div>
      )}

      {/* ── RULE MANAGE VIEW ── */}
      {view === 'manage_rule' && (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => { setView('list'); onViewChange?.('list'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }} title="Back to List">
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={22} style={{ color: 'var(--primary)' }} /> {selectedId === null ? 'Deploy New Security Rule' : `Manage Security Rule: ${formName}`}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedId || 'NEW_SECURITY_RULE'}</span>
                  {!isEditMode && <span style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(255,184,0,0.2)' }}>VIEW ONLY</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {selectedId !== null && (
                <button 
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }} 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={14} /> Decommission Rule
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

          <form onSubmit={(e) => { e.preventDefault(); setShowSaveConfirm(true); }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '280px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div><label style={lSt}>RULE TITLE / NAME</label><input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt} required /></div>
                <div>
                  <label style={lSt}>TRIGGER METHOD</label>
                  <select value={formTriggerType} onChange={(e) => setFormTriggerType(e.target.value as any)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt}>
                    <option value="VELOCITY">VELOCITY (Rate of attempts)</option>
                    <option value="GEO_FENCE">GEO FENCE (Location boundary mismatch)</option>
                    <option value="AMOUNT_THRESHOLD">AMOUNT THRESHOLD (Value limits)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div><label style={lSt}>LIMIT THRESHOLD VALUE</label><input type="number" value={formThresholdValue} onChange={(e) => setFormThresholdValue(parseInt(e.target.value) || 0)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt} required /></div>
                <div><label style={lSt}>TIME WINDOW (MINUTES)</label><input type="number" value={formWindow} onChange={(e) => setFormWindow(parseInt(e.target.value) || 60)} disabled={!isEditMode || formTriggerType !== 'VELOCITY'} style={isEditMode && formTriggerType === 'VELOCITY' ? iStFocus : iSt} /></div>
                <div>
                  <label style={lSt}>SEVERITY LEVEL</label>
                  <select value={formSeverity} onChange={(e) => setFormSeverity(e.target.value as any)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt}>
                    <option value="CRITICAL">CRITICAL (System Halt / Review Required)</option>
                    <option value="WARNING">WARNING (Log Flag / Event Streamed)</option>
                    <option value="INFO">INFO (Trace Registry Entry)</option>
                  </select>
                </div>
              </div>

              <div><label style={lSt}>RULE APPLICATION EXPLANATION</label><textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} disabled={!isEditMode} rows={3} style={{...(isEditMode ? iStFocus : iSt), resize: 'none'}} /></div>
              
              <div>
                <label style={lSt}>RULE ROUTING STATE</label>
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt}>
                  <option value="ENABLED">ENABLED (Instantly Live)</option>
                  <option value="DISABLED">DISABLED (Suspended / Dry Run)</option>
                </select>
              </div>
            </div>

            {isEditMode && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }} onClick={() => selectedId === null ? (setView('list'), onViewChange?.('list')) : setIsEditMode(false)}>Discard</button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}>
                  <Save size={14} /> {selectedId === null ? 'Create Rule' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── INTERNAL BLACKLIST - SEARCH / CREATE ── */}
      {view === 'create_internal' && (
        <div className="glass-card" style={{ padding: '3rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ alignSelf: 'flex-start', marginBottom: '2rem' }}>
            <button onClick={() => { setView('list'); onViewChange?.('list'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
              <ArrowLeft size={16} />
            </button>
          </div>
          
          <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center', marginTop: '2rem' }}>
            <UserX size={48} style={{ color: 'var(--primary)', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-outfit)', margin: '0 0 1rem', fontWeight: '800' }}>Initiate Internal Blacklist</h2>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '2.5rem', lineHeight: '1.5' }}>
              Search for an internal customer by Account Number, Email Address, or Phone Number to view their profile and initiate the blacklist protocol.
            </p>

            <form onSubmit={handleSearchInternal} style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem' }}>
              <input 
                type="text" 
                placeholder="Enter account, email, or phone..." 
                value={internalSearchQuery}
                onChange={(e) => setInternalSearchQuery(e.target.value)}
                style={{ ...iSt, padding: '1rem', fontSize: '1rem', flex: 1 }}
                required
              />
              <button type="submit" disabled={isSearchingInternal} style={{ padding: '0 2rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '0.5rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isSearchingInternal ? <Loader2 size={18} className="spin" /> : <Search size={18} />} 
                {isSearchingInternal ? 'Searching...' : 'Search'}
              </button>
            </form>

            {internalSearchResult === 'NOT_FOUND' && (
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', padding: '1.5rem', borderRadius: '0.5rem', color: '#ef4444' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>No customer found matching the criteria.</p>
              </div>
            )}

            {internalSearchResult && internalSearchResult !== 'NOT_FOUND' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', overflow: 'hidden', textAlign: 'left' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#fff' }}>Customer Matched</span>
                  <span className="badge badge-approved">{internalSearchResult.status}</span>
                </div>
                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div><span style={{ fontSize:'0.7rem', color:'var(--foreground-muted)' }}>NAME</span><div style={{ fontWeight:'bold', color:'#fff' }}>{internalSearchResult.name}</div></div>
                  <div><span style={{ fontSize:'0.7rem', color:'var(--foreground-muted)' }}>ACCOUNT</span><div style={{ fontFamily:'monospace', color:'var(--primary)' }}>{internalSearchResult.account}</div></div>
                  <div><span style={{ fontSize:'0.7rem', color:'var(--foreground-muted)' }}>EMAIL</span><div style={{ color:'#fff' }}>{internalSearchResult.email}</div></div>
                  <div><span style={{ fontSize:'0.7rem', color:'var(--foreground-muted)' }}>PHONE</span><div style={{ color:'#fff' }}>{internalSearchResult.phone}</div></div>
                </div>
                <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setView('internal_dashboard')}
                    style={{ padding: '0.5rem 1.5rem', background: '#fff', color: '#000', border: 'none', borderRadius: '0.5rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Proceed to Profile <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── INTERNAL DASHBOARD (FRAUD VIEW) ── */}
      {view === 'internal_dashboard' && internalSearchResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={() => setView('create_internal')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800' }}>{internalSearchResult.name}</h2>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
                  <span>Acc: <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{internalSearchResult.account}</span></span>
                  <span>|</span>
                  <span>{internalSearchResult.email}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => { setInternalReason(''); setInternalComments(''); setShowInternalBlacklistModal(true); }}
              style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <UserX size={16} /> Blacklist Customer
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <Card title="Total Cash Inflow" value="$45,230.00" icon={<ArrowDownRight size={20} />} color="#10b981" />
            <Card title="Current Cash Balance" value="$2,150.50" icon={<DollarSign size={20} />} color="var(--primary)" />
            <Card title="Total Cash Outflow" value="$43,079.50" icon={<ArrowUpRight size={20} />} color="#ef4444" />
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)' }}>Recent Transaction History</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: 'Today, 10:45 AM', ref: 'TRX_88921', type: 'DEPOSIT', amount: '+$500.00', status: 'COMPLETED' },
                  { date: 'Yesterday, 04:20 PM', ref: 'TRX_88844', type: 'WITHDRAWAL', amount: '-$1,200.00', status: 'COMPLETED' },
                  { date: 'May 16, 09:15 AM', ref: 'TRX_88102', type: 'TRANSFER', amount: '-$450.00', status: 'FLAGGED' },
                ].map((tx, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>{tx.date}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{tx.ref}</td>
                    <td>{tx.type}</td>
                    <td style={{ fontWeight: 'bold', color: tx.amount.startsWith('+') ? '#10b981' : '#fff' }}>{tx.amount}</td>
                    <td><span className={`badge ${tx.status === 'COMPLETED' ? 'badge-approved' : 'badge-rejected'}`}>{tx.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── WHITELIST LIST VIEW ── */}
      {view === 'whitelist_list' && (
        <div className="glass-card">
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => { setView('main_menu'); onViewChange?.('main_menu'); }} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold', padding: 0 }}>
              <ArrowLeft size={16} /> Back to Hub Menu
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle style={{ color: '#10b981' }} size={20} />
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-outfit)', margin: 0, color: '#fff' }}>Whitelist Control</h3>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {(['INTERNAL', 'EXTERNAL'] as const).map(tab => (
                  <button 
                    key={tab}
                    onClick={() => { setActiveWhitelistTab(tab); setSearchQuery(''); }}
                    style={{ background: 'none', border: 'none', color: activeWhitelistTab === tab ? '#10b981' : 'var(--foreground-muted)', fontWeight: activeWhitelistTab === tab ? '800' : '500', fontSize: '0.85rem', cursor: 'pointer', padding: '0 0 0.5rem 0', position: 'relative', transition: 'all 0.2s' }}
                  >
                    {tab === 'INTERNAL' ? 'Internal Whitelist' : 'External Whitelist'}
                    {activeWhitelistTab === tab && <div style={{ position: 'absolute', bottom: '-0.75rem', left: 0, right: 0, height: '2px', background: '#10b981' }} />}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', overflow: 'hidden', height: '38px', boxSizing: 'border-box' }}>
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ height: '100%', padding: '0 1rem', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.8rem', outline: 'none', width: '220px' }} />
              <button style={{ height: '100%', padding: '0 1.25rem', background: 'rgba(15,15,15,0.95)', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={15} />
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            {activeWhitelistTab === 'INTERNAL' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Date Added</th>
                    <th>Customer Name</th>
                    <th>Account Number</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {internalWhitelist
                    .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.accountNumber.includes(searchQuery))
                    .map(entry => (
                      <tr key={entry.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{new Date(entry.dateAdded).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 'bold', color: '#fff' }}>{entry.name}</td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{entry.accountNumber}</td>
                        <td>
                          <div style={{ fontWeight: 'bold' }}>{entry.reason}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{entry.comments}</div>
                        </td>
                        <td>
                          <span className={`badge ${entry.whitelistType === 'FULL' ? 'badge-active' : 'badge-pending'}`} style={{ marginBottom: '0.2rem' }}>{entry.whitelistType}</span><br/>
                          <span className="badge badge-active">{entry.status}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} onClick={() => {
                            setSelectedWlInternalId(entry.id);
                            setWlInternalReason(entry.reason);
                            setWlInternalComments(entry.comments);
                            setWlInternalType(entry.whitelistType);
                            setIsEditMode(false);
                            setView('whitelist_manage_internal');
                            onViewChange?.('manage');
                          }}>
                            <Sliders size={12} /> Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  {internalWhitelist.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)' }}>No internal whitelisted accounts found.</td></tr>
                  )}
                </tbody>
              </table>
            )}

            {activeWhitelistTab === 'EXTERNAL' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Date Added</th>
                    <th>Target Name</th>
                    <th>Institution & Account</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {externalWhitelist
                    .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.bank.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(entry => (
                      <tr key={entry.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>{new Date(entry.dateAdded).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 'bold', color: '#fff' }}>{entry.name}</td>
                        <td>
                          <div style={{ color: '#fff' }}>{entry.bank}</div>
                          <div style={{ fontFamily: 'monospace', color: 'var(--primary)', fontSize: '0.75rem' }}>{entry.accountNumber}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 'bold' }}>{entry.reason}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{entry.comments}</div>
                        </td>
                        <td>
                          <span className={`badge ${entry.whitelistType === 'FULL' ? 'badge-active' : 'badge-pending'}`} style={{ marginBottom: '0.2rem' }}>{entry.whitelistType}</span><br/>
                          <span className="badge badge-active">{entry.status}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }} onClick={() => {
                            setSelectedWlExternalId(entry.id);
                            setWlExtName(entry.name);
                            setWlExtBank(entry.bank);
                            setWlExtAccount(entry.accountNumber);
                            setWlExtReason(entry.reason);
                            setWlExtComments(entry.comments);
                            setWlExtType(entry.whitelistType);
                            setIsEditMode(false);
                            setView('whitelist_manage_external');
                            onViewChange?.('manage');
                          }}>
                            <Sliders size={12} /> Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  {externalWhitelist.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)' }}>No external whitelisted accounts found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── EXTERNAL BLACKLIST - CREATE/MANAGE ── */}
      {view === 'manage_external' && (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => { setView('list'); onViewChange?.('list'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }} title="Back to List">
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserX size={22} style={{ color: '#ef4444' }} /> {selectedExternalId ? 'Manage External Blacklist' : 'Register External Blacklist'}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                  {selectedExternalId ? `Managing external entity blacklist profile: ${selectedExternalId}` : 'Manually register a malicious external actor to block future transactions across the network.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {selectedExternalId !== null && (
                <button style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }} onClick={handleRemoveExternalBlacklist}>
                  <CheckCircle size={14} /> Unblacklist
                </button>
              )}
              {selectedExternalId !== null && (
                isEditMode ? (
                  <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setIsEditMode(false)}><X size={14} /> Cancel Edit</button>
                ) : (
                  <button style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} onClick={() => setIsEditMode(true)}>
                    <Edit2 size={14} /> Edit Details
                  </button>
                )
              )}
            </div>
          </div>

          <form onSubmit={handleSaveExternalBlacklist}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '280px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div><label style={lSt}>TARGET NAME</label><input type="text" value={extName} onChange={(e) => setExtName(e.target.value)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt} required /></div>
                <div><label style={lSt}>INSTITUTION / BANK</label><input type="text" value={extBank} onChange={(e) => setExtBank(e.target.value)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt} required /></div>
                <div><label style={lSt}>ACCOUNT NUMBER</label><input type="text" value={extAccount} onChange={(e) => setExtAccount(e.target.value)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt} required /></div>
              </div>

              <div>
                <label style={lSt}>PRIMARY REASON FOR BLACKLIST</label>
                <input type="text" value={extReason} onChange={(e) => setExtReason(e.target.value)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt} placeholder="e.g., Confirmed identity fraud ring" required />
              </div>

              <div>
                <label style={lSt}>ADDITIONAL COMMENTS & SOURCES</label>
                <textarea value={extComments} onChange={(e) => setExtComments(e.target.value)} disabled={!isEditMode} rows={4} style={{...(isEditMode ? iStFocus : iSt), resize: 'none'}} />
              </div>

              <div>
                <label style={lSt}>BLACKLIST SEVERITY TYPE</label>
                <BlacklistTypeSelector value={extBlacklistType} onChange={setExtBlacklistType} disabled={!isEditMode} />
              </div>
            </div>

            {isEditMode && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }} onClick={() => { selectedExternalId ? setIsEditMode(false) : (setView('list'), onViewChange?.('list')); }}>Discard</button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#ef4444', border: 'none', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}>
                  <Save size={14} /> {selectedExternalId ? 'Save Changes' : 'Blacklist Target'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── INTERNAL BLACKLIST - MANAGE ── */}
      {view === 'manage_internal' && selectedInternalId && (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => { setView('list'); onViewChange?.('list'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }} title="Back to List">
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserX size={22} style={{ color: '#ef4444' }} /> Manage Internal Blacklisted Profile
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedInternalId}</span>
                  {!isEditMode && <span style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(255,184,0,0.2)' }}>VIEW ONLY</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }} onClick={handleRemoveInternalBlacklist}>
                <CheckCircle size={14} /> Unblacklist
              </button>
              {isEditMode ? (
                <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setIsEditMode(false)}>
                  <X size={14} /> Cancel Edit
                </button>
              ) : (
                <button style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} onClick={() => setIsEditMode(true)}>
                  <Edit2 size={14} /> Edit Details
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveInternalBlacklist}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '280px' }}>
              
              <div style={{ padding: '1rem 1.5rem', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '0.5rem' }}>
                 <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#ef4444', fontWeight: 'bold' }}>Associated Customer Record Details</p>
                 <div style={{ display: 'flex', gap: '2rem' }}>
                   <div><span style={lSt}>Customer Name</span><div style={{ fontWeight: 'bold' }}>{internalBlacklist.find(e => e.id === selectedInternalId)?.name}</div></div>
                   <div><span style={lSt}>Account Number</span><div style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{internalBlacklist.find(e => e.id === selectedInternalId)?.accountNumber}</div></div>
                   <div><span style={lSt}>Added On</span><div>{new Date(internalBlacklist.find(e => e.id === selectedInternalId)?.dateAdded || '').toLocaleDateString()}</div></div>
                 </div>
              </div>

              <div>
                <label style={lSt}>PRIMARY REASON FOR BLACKLIST</label>
                <input type="text" value={internalReason} onChange={(e) => setInternalReason(e.target.value)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt} required />
              </div>

              <div>
                <label style={lSt}>ADDITIONAL COMMENTS</label>
                <textarea value={internalComments} onChange={(e) => setInternalComments(e.target.value)} disabled={!isEditMode} rows={4} style={{...(isEditMode ? iStFocus : iSt), resize: 'none'}} />
              </div>

              <div>
                <label style={lSt}>BLACKLIST SEVERITY TYPE</label>
                <BlacklistTypeSelector value={internalBlacklistType} onChange={setInternalBlacklistType} disabled={!isEditMode} />
              </div>
            </div>

            {isEditMode && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }} onClick={() => setIsEditMode(false)}>Discard</button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}>
                  <Save size={14} /> Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── EXTERNAL WHITELIST - CREATE/MANAGE ── */}
      {view === 'whitelist_manage_external' && (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => { setView('whitelist_list'); onViewChange?.('list'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }} title="Back to List">
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                  <CheckCircle size={22} style={{ color: '#3b82f6' }} /> {selectedWlExternalId ? 'Manage External Whitelist' : 'Register External Whitelist'}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.2rem' }}>
                  {selectedWlExternalId ? `Managing external entity whitelist profile: ${selectedWlExternalId}` : 'Register an external actor to exempt them from standard transaction friction.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {selectedWlExternalId !== null && (
                <button style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }} onClick={() => {
                  setRevertReason('False Positive');
                  setRevertComment('');
                  setRevertSelectedRules(fraudRules.map(r => r.id));
                  setShowRevertModal('whitelist_external');
                }}>
                  <X size={14} /> Unwhitelist
                </button>
              )}
              {selectedWlExternalId !== null && (
                isEditMode ? (
                  <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setIsEditMode(false)}><X size={14} /> Cancel Edit</button>
                ) : (
                  <button style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} onClick={() => setIsEditMode(true)}>
                    <Edit2 size={14} /> Edit Details
                  </button>
                )
              )}
            </div>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (selectedWlExternalId) {
              setExternalWhitelist(prev => prev.map(e => e.id === selectedWlExternalId ? { ...e, name: wlExtName, bank: wlExtBank, accountNumber: wlExtAccount, reason: wlExtReason, comments: wlExtComments, whitelistType: wlExtType } : e));
              triggerToast('Whitelist updated');
            } else {
              setExternalWhitelist(prev => [{ id: 'ewl_' + Math.floor(Math.random() * 10000), name: wlExtName, bank: wlExtBank, accountNumber: wlExtAccount, reason: wlExtReason, comments: wlExtComments, whitelistType: wlExtType, status: 'WHITELISTED', dateAdded: new Date().toISOString() }, ...prev]);
              triggerToast('Registered successfully');
              setView('whitelist_list');
            }
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '280px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div><label style={lSt}>TARGET NAME</label><input type="text" value={wlExtName} onChange={(e) => setWlExtName(e.target.value)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt} required /></div>
                <div><label style={lSt}>INSTITUTION / BANK</label><input type="text" value={wlExtBank} onChange={(e) => setWlExtBank(e.target.value)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt} required /></div>
                <div><label style={lSt}>ACCOUNT NUMBER</label><input type="text" value={wlExtAccount} onChange={(e) => setWlExtAccount(e.target.value)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt} required /></div>
              </div>

              <div>
                <label style={lSt}>PRIMARY REASON FOR WHITELIST</label>
                <input type="text" value={wlExtReason} onChange={(e) => setWlExtReason(e.target.value)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt} required />
              </div>

              <div>
                <label style={lSt}>ADDITIONAL COMMENTS</label>
                <textarea value={wlExtComments} onChange={(e) => setWlExtComments(e.target.value)} disabled={!isEditMode} rows={4} style={{...(isEditMode ? iStFocus : iSt), resize: 'none'}} />
              </div>

              <div>
                <label style={lSt}>WHITELIST SEVERITY TYPE</label>
                <WhitelistTypeSelector value={wlExtType} onChange={setWlExtType} disabled={!isEditMode} />
              </div>
            </div>

            {isEditMode && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }} onClick={() => { selectedWlExternalId ? setIsEditMode(false) : setView('whitelist_list'); }}>Discard</button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}>
                  <Save size={14} /> {selectedWlExternalId ? 'Save Changes' : 'Whitelist Target'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── INTERNAL WHITELIST - MANAGE ── */}
      {view === 'whitelist_manage_internal' && selectedWlInternalId && (
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => { setView('whitelist_list'); onViewChange?.('list'); }} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }} title="Back to List">
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-outfit)', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                  <CheckCircle size={22} style={{ color: '#3b82f6' }} /> Manage Internal Whitelisted Profile
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                  <span style={{ color: '#3b82f6', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedWlInternalId}</span>
                  {!isEditMode && <span style={{ background: 'rgba(255,184,0,0.1)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '99px', border: '1px solid rgba(255,184,0,0.2)' }}>VIEW ONLY</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '700' }} onClick={() => {
                setRevertReason('False Positive');
                setRevertComment('');
                setRevertSelectedRules(fraudRules.map(r => r.id));
                setShowRevertModal('whitelist_internal');
              }}>
                <X size={14} /> Unwhitelist
              </button>
              {isEditMode ? (
                <button className="btn btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setIsEditMode(false)}>
                  <X size={14} /> Cancel Edit
                </button>
              ) : (
                <button style={{ padding: '0.55rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} onClick={() => setIsEditMode(true)}>
                  <Edit2 size={14} /> Edit Details
                </button>
              )}
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setInternalWhitelist(prev => prev.map(e => e.id === selectedWlInternalId ? { ...e, reason: wlInternalReason, comments: wlInternalComments, whitelistType: wlInternalType } : e)); triggerToast('Whitelist updated'); setIsEditMode(false); }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '280px' }}>
              <div style={{ padding: '1rem 1.5rem', background: 'rgba(59,130,246,0.03)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: '0.5rem' }}>
                 <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold' }}>Associated Customer Record Details</p>
                 <div style={{ display: 'flex', gap: '2rem' }}>
                   <div><span style={lSt}>Customer Name</span><div style={{ fontWeight: 'bold' }}>{internalWhitelist.find(e => e.id === selectedWlInternalId)?.name}</div></div>
                   <div><span style={lSt}>Account Number</span><div style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{internalWhitelist.find(e => e.id === selectedWlInternalId)?.accountNumber}</div></div>
                   <div><span style={lSt}>Added On</span><div>{new Date(internalWhitelist.find(e => e.id === selectedWlInternalId)?.dateAdded || '').toLocaleDateString()}</div></div>
                 </div>
              </div>

              <div>
                <label style={lSt}>PRIMARY REASON FOR WHITELIST</label>
                <input type="text" value={wlInternalReason} onChange={(e) => setWlInternalReason(e.target.value)} disabled={!isEditMode} style={isEditMode ? iStFocus : iSt} required />
              </div>

              <div>
                <label style={lSt}>ADDITIONAL COMMENTS</label>
                <textarea value={wlInternalComments} onChange={(e) => setWlInternalComments(e.target.value)} disabled={!isEditMode} rows={4} style={{...(isEditMode ? iStFocus : iSt), resize: 'none'}} />
              </div>

              <div>
                <label style={lSt}>WHITELIST SEVERITY TYPE</label>
                <WhitelistTypeSelector value={wlInternalType} onChange={setWlInternalType} disabled={!isEditMode} />
              </div>
            </div>

            {isEditMode && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem' }} onClick={() => setIsEditMode(false)}>Discard</button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }}>
                  <Save size={14} /> Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── INTERNAL WHITELIST - CREATE SEARCH ── */}
      {view === 'create_wl_internal' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '600px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-outfit)', margin: '0 0 0.5rem 0', color: '#fff' }}>Initiate Internal Whitelist</h2>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Search for a customer by Account, Email, or Phone to exempt them from fraud rule checks.</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
              <input type="text" placeholder="Enter account, email, or phone number" value={wlInternalSearchQuery} onChange={(e) => setWlInternalSearchQuery(e.target.value)} style={{ flex: 1, padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: '#fff', fontSize: '1rem' }} />
              <button style={{ padding: '0 1.5rem', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
                if(!wlInternalSearchQuery) return;
                setIsWlSearchingInternal(true);
                setTimeout(() => {
                  setWlInternalSearchResult({ id: 'c_991', name: 'Alice Walker', account: wlInternalSearchQuery, email: 'alice@example.com', phone: '+1234567890', risk: 'Low' });
                  setIsWlSearchingInternal(false);
                }, 1200);
              }}>
                {isWlSearchingInternal ? <Loader2 className="spin" size={18} /> : <Search size={18} />} Search
              </button>
            </div>
            {wlInternalSearchResult && (
              <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', padding: '1.5rem', borderRadius: '0.75rem', textAlign: 'left', animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>{wlInternalSearchResult.name}</div>
                    <div style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.9rem' }}>{wlInternalSearchResult.account}</div>
                  </div>
                  <span style={{ padding: '0.3rem 0.6rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>Risk: {wlInternalSearchResult.risk}</span>
                </div>
                <button style={{ width: '100%', padding: '0.75rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => setView('wl_internal_dashboard')}>
                  Proceed to Profile <ArrowRight size={16} />
                </button>
              </div>
            )}
            <button className="btn btn-secondary" style={{ marginTop: '1.5rem', padding: '0.6rem 2rem' }} onClick={() => setView('whitelist_list')}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── INTERNAL WHITELIST - DASHBOARD ── */}
      {view === 'wl_internal_dashboard' && wlInternalSearchResult && (
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={() => setView('create_wl_internal')} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}><ArrowLeft size={16} /></button>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: '800', color: '#fff' }}>{wlInternalSearchResult.name}</h2>
                <div style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.85rem' }}>{wlInternalSearchResult.account}</div>
              </div>
            </div>
            <button style={{ padding: '0.6rem 1.5rem', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setShowWlInternalModal(true)}>
              <CheckCircle size={16} /> Whitelist Customer
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <Card title="Cash Inflow (30d)" value="$42,500.00" icon={<ArrowDownRight size={20} />} color="#10b981" />
            <Card title="Cash Balance" value="$12,340.50" icon={<DollarSign size={20} />} color="var(--primary)" />
            <Card title="Cash Outflow (30d)" value="$30,159.50" icon={<ArrowUpRight size={20} />} color="#ef4444" />
          </div>

          <div className="glass-card">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>Recent Transactions</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                <tr>
                  <td style={{ color: 'var(--foreground-muted)' }}>{new Date().toLocaleDateString()}</td>
                  <td style={{ color: '#fff' }}>Wire Transfer - Inbound</td>
                  <td style={{ color: '#10b981', fontWeight: 'bold' }}>+$5,000.00</td>
                  <td><span className="badge badge-active">COMPLETED</span></td>
                </tr>
                <tr>
                  <td style={{ color: 'var(--foreground-muted)' }}>{new Date(Date.now() - 86400000).toLocaleDateString()}</td>
                  <td style={{ color: '#fff' }}>POS Purchase</td>
                  <td style={{ color: '#ef4444', fontWeight: 'bold' }}>-$120.50</td>
                  <td><span className="badge badge-active">COMPLETED</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {showWlInternalModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', color: '#fff', fontFamily: 'var(--font-outfit)' }}>Confirm Whitelist</h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>You are exempting {wlInternalSearchResult.name} ({wlInternalSearchResult.account}) from standard fraud checks.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={lSt}>REASON FOR WHITELIST</label>
                    <input type="text" value={wlInternalReason} onChange={(e) => setWlInternalReason(e.target.value)} placeholder="Required" style={iStFocus} required />
                  </div>
                  <div>
                    <label style={lSt}>ADDITIONAL COMMENTS</label>
                    <textarea value={wlInternalComments} onChange={(e) => setWlInternalComments(e.target.value)} rows={3} style={{ ...iStFocus, resize: 'none' }} />
                  </div>
                  <div>
                    <label style={lSt}>WHITELIST SEVERITY TYPE</label>
                    <WhitelistTypeSelector value={wlInternalType} onChange={setWlInternalType} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowWlInternalModal(false)}>Cancel</button>
                    <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={() => {
                      if(!wlInternalReason) return triggerToast('Reason required');
                      setInternalWhitelist(prev => [{ id: 'iwl_' + Math.floor(Math.random()*10000), customerId: wlInternalSearchResult.id, name: wlInternalSearchResult.name, accountNumber: wlInternalSearchResult.account, reason: wlInternalReason, comments: wlInternalComments, whitelistType: wlInternalType, status: 'WHITELISTED', dateAdded: new Date().toISOString() }, ...prev]);
                      setShowWlInternalModal(false);
                      setShowWlInternalSuccessModal(true);
                    }}>Proceed</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showWlInternalSuccessModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}><CheckCircle size={32} /></div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', color: '#fff', fontFamily: 'var(--font-outfit)' }}>Whitelisted Successfully</h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>The customer profile has been exempted from security blocks.</p>
                <button style={{ width: '100%', padding: '0.8rem', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '800' }} onClick={() => { setShowWlInternalSuccessModal(false); setView('whitelist_list'); }}>Return to Operations</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ── */}
      
      {showRevertModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontFamily: 'var(--font-outfit)' }}>
                {showRevertModal.startsWith('blacklist') ? (
                  <>
                    <ShieldAlert size={22} style={{ color: 'var(--primary)' }} /> Confirm Unblacklist
                  </>
                ) : (
                  <>
                    <CheckCircle size={22} style={{ color: '#10b981' }} /> Confirm Unwhitelist
                  </>
                )}
              </h3>
              <button 
                onClick={() => setShowRevertModal(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={20} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              Are you sure you want to revert the security state of this entity? Please provide audit trails and uncheck the active security rule exclusions applied to this account.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div>
                <label style={lSt}>REVERT REASON</label>
                <select 
                  value={revertReason} 
                  onChange={(e) => setRevertReason(e.target.value)} 
                  style={{ ...iStFocus, background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                >
                  <option value="False Positive" style={{ background: '#1c1c1e', color: '#fff' }}>False Positive</option>
                  <option value="Dispute Resolved" style={{ background: '#1c1c1e', color: '#fff' }}>Dispute Resolved</option>
                  <option value="Compliance Verification Approved" style={{ background: '#1c1c1e', color: '#fff' }}>Compliance Verification Approved</option>
                  <option value="Other / Manual Override" style={{ background: '#1c1c1e', color: '#fff' }}>Other / Manual Override</option>
                </select>
              </div>
              
              <div>
                <label style={lSt}>AUDIT COMMENTS / EXPLANATION</label>
                <textarea 
                  value={revertComment} 
                  onChange={(e) => setRevertComment(e.target.value)} 
                  placeholder="Explain why you are lifting this security restriction..." 
                  rows={3} 
                  style={{ ...iStFocus, resize: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={lSt}>ACTIVE FRAUD RULES (UNCHECK TO EXCLUDE & REVERT)</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', margin: '0 0 0.75rem 0' }}>
                  Uncheck the rules that should no longer check/block this account.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {fraudRules.map(rule => {
                    const isChecked = revertSelectedRules.includes(rule.id);
                    return (
                      <div 
                        key={rule.id} 
                        onClick={() => {
                          if (isChecked) {
                            setRevertSelectedRules(prev => prev.filter(id => id !== rule.id));
                          } else {
                            setRevertSelectedRules(prev => [...prev, rule.id]);
                          }
                        }}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '0.75rem', 
                          cursor: 'pointer',
                          padding: '0.6rem 0.8rem',
                          background: isChecked ? 'rgba(16,185,129,0.03)' : 'rgba(255,255,255,0.01)',
                          border: `1px solid ${isChecked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'}`,
                          borderRadius: '0.5rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div 
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            border: `2px solid ${isChecked ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                            background: isChecked ? '#10b981' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '2px',
                            flexShrink: 0
                          }}
                        >
                          {isChecked && <CheckCircle size={12} color="#000" style={{ strokeWidth: 3 }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: isChecked ? '#fff' : 'var(--foreground-muted)' }}>{rule.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', marginTop: '0.15rem' }}>{rule.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.25rem' }} onClick={() => setShowRevertModal(null)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.55rem 1.5rem', background: showRevertModal.startsWith('blacklist') ? 'var(--primary)' : '#10b981', color: '#000', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }} 
                onClick={handleConfirmRevert}
              >
                <CheckCircle size={14} /> Commit Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rule Modals */}
      {showSaveConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Confirm Security Parameters Update?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>Are you sure you want to deploy these security rules? System validators will filter driver transaction queues based on these parameters.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowSaveConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', fontWeight: '700' }} onClick={handleConfirmSaveRule}>Commit Rules</button>
            </div>
          </div>
        </div>
      )}

      {showSaveSuccess && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Security Policy Implemented</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>The modified parameters are active. NATS microservices are listening to dynamic validation events.</p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowSaveSuccess(false); setIsEditMode(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#ef4444' }}>Decommission Security Rule?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>This will permanently delete the fraud velocity rule. Transactions will bypass this check completely.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={handleConfirmDeleteRule}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Blacklist Modals */}
      {showInternalBlacklistModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 0.25rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserX size={18} /> Confirm Blacklist Action</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', margin: 0 }}>You are about to freeze and blacklist this account globally.</p>
            </div>

            <div>
              <label style={lSt}>CUSTOMER ACCOUNT</label>
              <input type="text" value={internalSearchResult?.account || ''} disabled style={{ ...iSt, opacity: 0.7 }} />
            </div>
            
            <div>
              <label style={lSt}>REASON FOR BLACKLIST</label>
              <input type="text" value={internalReason} onChange={(e) => setInternalReason(e.target.value)} placeholder="Required" style={iStFocus} required />
            </div>

            <div>
              <label style={lSt}>ADDITIONAL COMMENTS</label>
              <textarea value={internalComments} onChange={(e) => setInternalComments(e.target.value)} rows={3} style={{ ...iStFocus, resize: 'none' }} />
            </div>

            <div>
              <label style={lSt}>BLACKLIST SEVERITY TYPE</label>
              <BlacklistTypeSelector value={internalBlacklistType} onChange={setInternalBlacklistType} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.55rem 1.5rem' }} onClick={() => setShowInternalBlacklistModal(false)}>Cancel</button>
              <button className="btn" style={{ padding: '0.55rem 1.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: '700' }} onClick={handleConfirmInternalBlacklist}>Proceed</button>
            </div>
          </div>
        </div>
      )}

      {showInternalSuccessModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Account is Blacklisted</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>The internal customer has been added to the global block list.</p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowInternalSuccessModal(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}

      {/* External Blacklist Modals */}
      {showExtSuccessModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center' }}>
            <CheckCircle size={44} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem' }}>External Target Blacklisted</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>The external entity has been registered to the firewall.</p>
            <button className="btn btn-primary" style={{ padding: '0.55rem 1.75rem', background: 'var(--primary)', color: '#000', fontWeight: '700' }} onClick={() => { setShowExtSuccessModal(false); setView('list'); onViewChange?.('list'); }}>Okay</button>
          </div>
        </div>
      )}
    </div>
  );
}
