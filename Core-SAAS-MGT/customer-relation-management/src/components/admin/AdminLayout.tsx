import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, LayoutDashboard, UserCheck, 
  Settings, Home, LogOut, Activity, Bell, ChevronDown, X,
  DollarSign, ShieldAlert, FileText, CreditCard, Banknote, Shield, Users, Plus, Percent, Briefcase, Key, UserCog, ShieldCheck, Handshake, Send, FileBarChart, FileCheck2, FileSliders, Clock, Award
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTenantValidation } from '../../hooks/useTenantValidation';
import { listDrivers, updateCustomer, driverVettingStatus, customerFullName } from '../../api/customers';
const AdminDashboard = lazy(() => import('./dashboard/AdminDashboard'));
const AdminVettingHub = lazy(() => import('./driverVetting/AdminVettingHub'));
const AdminSettings = lazy(() => import('./settings/AdminSettings'));
const AdminManageDriver = lazy(() => import('./driverVetting/manage/AdminManageDriver'));
const FeesManagementHub = lazy(() => import('./feesManagement/FeesManagementHub'));
const FraudManagementHub = lazy(() => import('./fraudManagement/FraudManagementHub'));
const GeneralLedgerHub = lazy(() => import('./generalLedger/GeneralLedgerHub'));
const OverdraftManagementHub = lazy(() => import('./overdraftManagement/OverdraftManagementHub'));
const LoanManagementHub = lazy(() => import('./loanManagement/LoanManagementHub'));
const RolesManagementHub = lazy(() => import('./rolesManagement/RolesManagementHub'));
const CustomerManagementHub = lazy(() => import('./customerManagement/CustomerManagementHub'));
const InterestManagementHub = lazy(() => import('./interestManagement/InterestManagementHub'));
const ChargesManagementHub = lazy(() => import('./chargesManagement/ChargesManagementHub'));
const AccountOfficerManagementHub = lazy(() => import('./officerManagement/AccountOfficerManagementHub'));
const EntryCodesManagementHub = lazy(() => import('./entryCodesManagement/EntryCodesManagementHub'));
const UserManagementHub = lazy(() => import('./userManagement/UserManagementHub'));
const PermissionsManagementHub = lazy(() => import('./permissionsManagement/PermissionsManagementHub'));
const PartnersManagementHub = lazy(() => import('./partnersManagement/PartnersManagementHub'));
const PostingsHub = lazy(() => import('./postings/PostingsHub'));
const ReportingHub = lazy(() => import('./reporting/ReportingHub'));
const ApprovalManagementHub = lazy(() => import('./approvalManagement/ApprovalManagementHub'));
const ApprovalConfigsHub = lazy(() => import('./approvalManagement/ApprovalConfigsHub'));
const FinancialTestGroundHub = lazy(() => import('./financialTestGround/FinancialTestGroundHub'));
const PostingsReportHub = lazy(() => import('./postingsReport/PostingsReportHub'));
const DriverTripDashboard = lazy(() => import('./driverTripDashboard/DriverTripDashboard'));
const TenantRemittanceConfigHub = lazy(() => import('./tenantRemittanceConfig/TenantRemittanceConfigHub'));
const SiteWideFareConfigHub = lazy(() => import('./fareConfig/SiteWideFareConfigHub'));
const SchedulerDashboard = lazy(() => import('./scheduler/SchedulerDashboard'));
const CoinRewardHub = lazy(() => import('./coinReward/CoinRewardHub'));
import './AdminLayout.css';




interface Vehicle {
  make: string;
  model: string;
  year: string;
  plateNumber: string;
  color: string;
  tier: string;
}

interface OnboardingDetails {
  ssn: string;
  licenseNumber: string;
  licenseExpiry: string;
  address: string;
  isPartner: boolean;
  documents: {
    licenseFront: string;
    idProof: string;
    utilityBill: string;
    insurance: string;
  };
}

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  licenseClass: string;
  vehicle: Vehicle;
  onboardingDetails: OnboardingDetails;
  signature: string;
  biometricSelfie?: string;
  vettingStatus: string;
  isVerified: boolean;
  status: string;
  submittedAt: string;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  // Note: AdminLayout doesn't use URL params, so isValid will always be true
  // But we keep the hook for consistency
  useTenantValidation();

  // Global layout states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const tabFromPath = pathSegments[2] || 'dashboard';
  const activeTab = tabFromPath as 'dashboard' | 'vetting' | 'settings' | 'manage-driver' | 'fees' | 'fraud' | 'ledger' | 'overdraft' | 'loans' | 'roles' | 'customers' | 'interest' | 'charges' | 'officers' | 'entry-codes' | 'users' | 'permissions' | 'partners' | 'postings' | 'reporting' | 'approvals' | 'approval-policies' | 'financial-test-ground' | 'postings-report' | 'driver-trip-dashboard' | 'tenant-remittance-config' | 'fare-config' | 'scheduler' | 'coin-reward';

  const setActiveTab = (tab: string) => {
    navigate(`/admin/${tab}`);
  };
  const [currentChildView, setCurrentChildView] = useState<'main_menu' | 'list' | 'manage'>('list');
  const [selectedManageDriver, setSelectedManageDriver] = useState<Driver | null>(null);
  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [tripDashboardDriver, setTripDashboardDriver] = useState<{ id: string; name: string } | null>(null);
  const [manageCustomerId, setManageCustomerId] = useState<string | null>(null);
  const [manageCustomerTrigger, setManageCustomerTrigger] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [addNewTriggerMap, setAddNewTriggerMap] = useState<Record<string, number>>({});
  const [pndTriggerMap, setPndTriggerMap] = useState<Record<string, number>>({});
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    financial: true,
    ecosystem: true,
    system: true
  });

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleAddNew = () => {
    setAddNewTriggerMap(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || 0) + 1
    }));
  };

  // Reset child view when tab changes
  useEffect(() => {
    setCurrentChildView('list');
  }, [activeTab]);


  //  states
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [settings, setSettings] = useState({
    currency: 'NGN',
    commissionRate: 10.0,
    solarDiscount: 20.0,
    chamaGroupSize: 5,
    maxDailyFuelLimit: 60,
    snackVendingEnabled: true,
    greenEnergyGeoLock: true
  });

  // Navbar notifications states
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const [notifications, setNotifications] = useState([
    { id: 'n_1', title: 'Carbon Compliance Cleared', desc: 'Accra solar swap hub 100% green efficiency.', time: '10m ago', unread: true },
    { id: 'n_2', title: 'Chama Pool Payout Complete', desc: 'Group 4 rotated $1,250 to Marcus Vance.', time: '1h ago', unread: true },
    { id: 'n_3', title: 'Vetting Queue: 2 entries', desc: 'Driver compliance checks pending review.', time: '2h ago', unread: true }
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [isSyncingDrivers, setIsSyncingDrivers] = useState(false);

  // Driver list pagination / search state (for API-backed search)
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [driverPage, setDriverPage] = useState(1);
  const [driverPageSize, setDriverPageSize] = useState(10);
  const [driverTotal, setDriverTotal] = useState(0);

  // Load and sync drivers (API first, local fallback)
  const loadDrivers = (search?: string, page?: number, take?: number) => {
    const query = search ?? driverSearchQuery;
    const pg = page ?? driverPage;
    const sz = take ?? driverPageSize;
    const filters = query.trim() ? { search: query.trim() } : undefined;
    setIsSyncingDrivers(true);
    listDrivers((pg - 1) * sz, sz, filters)
      .then((res) => {
        // Map Customer records to the Driver interface expected by AdminVettingHub
        const mapped = (res.data ?? []).map((c: any) => ({
          id: c.id,
          name: customerFullName(c),
          email: c.email,
          phone: c.phone,
          city: c.city ?? 'Unknown',
          licenseClass: (c.metadata as any)?.licenseClass ?? 'Class B',
          vehicle: {
            make: c.vehicleModel?.split(' ')[0] ?? 'Toyota',
            model: c.vehicleModel?.split(' ').slice(1).join(' ') ?? 'Camry',
            year: (c.metadata as any)?.vehicleYear ?? '2023',
            plateNumber: c.vehicleRegistration ?? 'N/A',
            color: (c.metadata as any)?.vehicleColor ?? 'Black',
            tier: (c.metadata as any)?.tier ?? 'Swift',
          },
          onboardingDetails: {
            ssn: (c.metadata as any)?.ssn ?? '',
            licenseNumber: c.licenseNumber ?? '',
            licenseExpiry: c.licenseExpiry ?? '',
            address: c.address ?? '',
            isPartner: (c.metadata as any)?.source === 'partner',
            documents: {
              licenseFront: (c.metadata as any)?.docs?.licenseFront ?? 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600',
              idProof: (c.metadata as any)?.docs?.idProof ?? 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600',
              utilityBill: (c.metadata as any)?.docs?.utilityBill ?? 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600',
              insurance: (c.metadata as any)?.docs?.insurance ?? 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600',
            },
          },
          signature: (c.metadata as any)?.signature ?? '',
          biometricSelfie: (c.metadata as any)?.biometricSelfie,
          vettingStatus: driverVettingStatus(c),
          isVerified: c.isVerified,
          status: c.status === 'active' ? 'Active' : 'Inactive',
          submittedAt: c.createdAt,
        }));
        setDrivers(mapped);
        setDriverTotal(res.total);
      })
      .catch(() => {
        const stored = localStorage.getItem('pendingDrivers');
        if (stored && JSON.parse(stored).length > 0) {
          setDrivers(JSON.parse(stored));
          return;
        }

        const seedDrivers: Driver[] = [
        {
          id: 'drv_9821_demo',
          name: 'Marcus Vance',
          email: 'marcus.vance@gmail.com',
          phone: '+44 7722 998811',
          city: 'London',
          licenseClass: 'Class A',
          vehicle: {
            make: 'Tesla',
            model: 'Model Y',
            year: '2024',
            plateNumber: 'LN73 EXG',
            color: 'Midnight Cherry Red',
            tier: 'Luxury'
          },
          onboardingDetails: {
            ssn: 'XXX-XX-8721',
            licenseNumber: 'DL-87391-Q',
            licenseExpiry: '2029-10-14',
            address: '142 Queens Road, London',
            isPartner: true,
            documents: {
              licenseFront: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600',
              idProof: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600',
              utilityBill: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600',
              insurance: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600'
            }
          },
          signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 20 Q 30 5, 50 20 T 90 20" fill="none" stroke="gold" stroke-width="2"/></svg>',
          biometricSelfie: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
          vettingStatus: 'PENDING',

          isVerified: false,
          status: 'Inactive',
          submittedAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'drv_4512_demo',
          name: 'Amara Diop',
          email: 'amara.diop@queensos.com',
          phone: '+233 24 555 1234',
          city: 'Accra',
          licenseClass: 'Class C',
          vehicle: {
            make: 'Toyota',
            model: 'Camry Hybrid',
            year: '2023',
            plateNumber: 'GE-4821-23',
            color: 'Obsidian Black',
            tier: 'Swift'
          },
          onboardingDetails: {
            ssn: 'XXX-XX-3301',
            licenseNumber: 'DL-99014-G',
            licenseExpiry: '2028-04-20',
            address: 'Block B, Independence Ave, Accra',
            isPartner: true,
            documents: {
              licenseFront: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600',
              idProof: 'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600',
              utilityBill: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600',
              insurance: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600'
            }
          },
          signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40"><path d="M10 30 C 20 10, 40 10, 50 30 S 80 10, 90 20" fill="none" stroke="gold" stroke-width="2"/></svg>',
          biometricSelfie: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
          vettingStatus: 'APPROVED',

          isVerified: true,
          status: 'Active',
          submittedAt: new Date(Date.now() - 86400000 * 3).toISOString()
        }
      ];
        localStorage.setItem('pendingDrivers', JSON.stringify(seedDrivers));
        setDrivers(seedDrivers);
      })
      .finally(() => {
        setIsSyncingDrivers(false);
      });
  };

  useEffect(() => {
    loadDrivers(driverSearchQuery, driverPage, driverPageSize);
    const interval = setInterval(() => loadDrivers(driverSearchQuery, driverPage, driverPageSize), 10000);
    return () => clearInterval(interval);
  }, [driverSearchQuery, driverPage, driverPageSize]);

  const handleUpdateDrivers = (updatedList: Driver[]) => {
    setDrivers(updatedList);
  };

  return (
    <div className="admin-backoffice-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)', color: '#fff', position: 'relative' }}>

      
      {/* Toast Notification Banner */}
      {showToast && (
        <div className="toast-banner">
          <Activity size={18} style={{ color: 'var(--primary)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Collapsible Sidebar Panel ── */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} aria-label="Admin Sidebar">
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="sidebar-logo">
          <img src="/logo.svg" alt="Queens Logo" />
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '900', fontSize: '1rem', color: '#fff', letterSpacing: '0.05em' }}>Queens OS</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }}>CRM BACKOFFICE</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav" style={{ overflowY: 'auto', paddingBottom: '2rem', flexGrow: 1 }}>
          <button 
            className={`sidebar-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Financial Dashboard</span>
          </button>
          
          {/* Ecosystem & CRM */}
          <div className="sidebar-group">
            {!sidebarCollapsed && (
              <div className="sidebar-group-header" onClick={() => toggleGroup('ecosystem')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', fontSize: '0.65rem', fontWeight: '800', color: 'var(--foreground-muted)', letterSpacing: '0.05em', cursor: 'pointer', marginTop: '0.5rem', textTransform: 'uppercase' }}>
                <span>Ecosystem & CRM</span>
                {expandedGroups.ecosystem ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </div>
            )}
            {(sidebarCollapsed || expandedGroups.ecosystem) && (
              <div className="sidebar-group-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <button 
                  className={`sidebar-nav-btn ${(activeTab === 'vetting' || activeTab === 'manage-driver') ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('vetting');
                    setSelectedManageDriver(null);
                  }}
                >
                  <UserCheck size={18} />
                  <span>Driver Vetting Hub</span>
                </button>
                <button className={`sidebar-nav-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}><Users size={18} /><span>Customer Relations</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => setActiveTab('partners')}><Handshake size={18} /><span>Partners & Affiliates</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'officers' ? 'active' : ''}`} onClick={() => setActiveTab('officers')}><Briefcase size={18} /><span>Account Officers</span></button>
              </div>
            )}
          </div>

          {/* Financial Services */}
          <div className="sidebar-group">
            {!sidebarCollapsed && (
              <div className="sidebar-group-header" onClick={() => toggleGroup('financial')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', fontSize: '0.65rem', fontWeight: '800', color: 'var(--foreground-muted)', letterSpacing: '0.05em', cursor: 'pointer', marginTop: '0.5rem', textTransform: 'uppercase' }}>
                <span>Financial Operations</span>
                {expandedGroups.financial ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </div>
            )}
            {(sidebarCollapsed || expandedGroups.financial) && (
              <div className="sidebar-group-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <button className={`sidebar-nav-btn ${activeTab === 'postings' ? 'active' : ''}`} onClick={() => setActiveTab('postings')}><Send size={18} /><span>Accounting & Postings</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'reporting' ? 'active' : ''}`} onClick={() => setActiveTab('reporting')}><FileBarChart size={18} /><span>Financial Reports</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'financial-test-ground' ? 'active' : ''}`} onClick={() => setActiveTab('financial-test-ground')}><Activity size={18} /><span>Financial Test Ground</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'postings-report' ? 'active' : ''}`} onClick={() => setActiveTab('postings-report')}><FileBarChart size={18} /><span>Postings & Reports</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'tenant-remittance-config' ? 'active' : ''}`} onClick={() => setActiveTab('tenant-remittance-config')}><Settings size={18} /><span>Tenant Remittance</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'fare-config' ? 'active' : ''}`} onClick={() => setActiveTab('fare-config')}><DollarSign size={18} /><span>Fare Config</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'scheduler' ? 'active' : ''}`} onClick={() => setActiveTab('scheduler')}><Clock size={18} /><span>Scheduler</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'coin-reward' ? 'active' : ''}`} onClick={() => setActiveTab('coin-reward')}><Award size={18} /><span>Coin Rewards</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')}><FileText size={18} /><span>General Ledger</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'fees' ? 'active' : ''}`} onClick={() => setActiveTab('fees')}><DollarSign size={18} /><span>Fees & Commissions</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'overdraft' ? 'active' : ''}`} onClick={() => setActiveTab('overdraft')}><CreditCard size={18} /><span>Overdraft Control</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'loans' ? 'active' : ''}`} onClick={() => setActiveTab('loans')}><Banknote size={18} /><span>Loan Portfolio</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'interest' ? 'active' : ''}`} onClick={() => setActiveTab('interest')}><Percent size={18} /><span>Interest Policies</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'charges' ? 'active' : ''}`} onClick={() => setActiveTab('charges')}><Banknote size={18} /><span>System Charges</span></button>
              </div>
            )}
          </div>

          {/* System Admin */}
          <div className="sidebar-group">
            {!sidebarCollapsed && (
              <div className="sidebar-group-header" onClick={() => toggleGroup('system')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', fontSize: '0.65rem', fontWeight: '800', color: 'var(--foreground-muted)', letterSpacing: '0.05em', cursor: 'pointer', marginTop: '0.5rem', textTransform: 'uppercase' }}>
                <span>System Config</span>
                {expandedGroups.system ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </div>
            )}
            {(sidebarCollapsed || expandedGroups.system) && (
              <div className="sidebar-group-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <button className={`sidebar-nav-btn ${activeTab === 'fraud' ? 'active' : ''}`} onClick={() => setActiveTab('fraud')}><ShieldAlert size={18} /><span>Fraud Detection</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}><FileCheck2 size={18} /><span>Approvals Inbox</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'approval-policies' ? 'active' : ''}`} onClick={() => setActiveTab('approval-policies')}><FileSliders size={18} /><span>Approval Policies</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}><Shield size={18} /><span>Roles & Access</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'permissions' ? 'active' : ''}`} onClick={() => setActiveTab('permissions')}><ShieldCheck size={18} /><span>Global Permissions</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><UserCog size={18} /><span>User Management</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'entry-codes' ? 'active' : ''}`} onClick={() => setActiveTab('entry-codes')}><FileText size={18} /><span>Entry Codes</span></button>
                <button className={`sidebar-nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={18} /><span>Platform Config</span></button>
              </div>
            )}
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.5rem 0' }}></div>

          <button 
            className="sidebar-nav-btn"
            onClick={() => navigate('/')}
          >
            <Home size={18} />
            <span>Ecosystem Portal</span>
          </button>

          <button 
            className="sidebar-nav-btn"
            onClick={() => {
              void logout().then(() => navigate('/login'));
            }}
            style={{ color: '#ef4444' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </nav>

        {!sidebarCollapsed && (
          <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: '0.75rem', fontSize: '0.7rem' }}>
            <span style={{ color: 'var(--foreground-muted)', fontWeight: 'bold' }}>TELEMETRY STATUS</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', color: '#10b981', fontWeight: 'bold' }}>
              <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
              NATS EVENT STREAM LIVE
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Dynamic View Panel ── */}
      <main className="admin-main-panel">

        {/* ──  Navigation Bar ── */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 2.5rem',
          background: 'rgba(15,15,15,0.7)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          margin: '0 -2.5rem 1rem -2.5rem',
          width: 'calc(100% + 5rem)',
          boxSizing: 'border-box',
          position: 'sticky',
          top: 0,
          zIndex: 999
        }}>
          {/* Left: Breadcrumbs active indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 8px var(--primary-glow)' }}></div>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em', color: 'var(--foreground-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-outfit)' }}>
              Queens OS  CRM / {activeTab === 'dashboard' ? 'Financial Dashboard' : activeTab === 'vetting' ? 'Driver Vetting' : activeTab === 'manage-driver' ? 'Manage Onboarding Form' : 'Platform Settings'}
            </span>

          </div>

          {/* Right: User Avatar & notification actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', position: 'relative' }}>
            
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowProfileDropdown(false);
                }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              >
                <Bell size={18} style={{ color: notifCount > 0 ? 'var(--primary)' : '#fff' }} />
                {notifCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: '0.6rem',
                    fontWeight: 'bold',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 6px #ef4444'
                  }}>
                    {notifCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '320px',
                  background: 'rgba(15,15,15,0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                  padding: '1rem',
                  zIndex: 1000
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>SYSTEM ALERTS</span>
                    <button 
                      onClick={() => {
                        setNotifCount(0);
                        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                        triggerToast('All notifications marked as read');
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Clear All
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{
                        padding: '0.65rem',
                        borderRadius: '0.5rem',
                        background: n.unread ? 'rgba(255,184,0,0.03)' : 'transparent',
                        borderLeft: n.unread ? '3px solid var(--primary)' : '3px solid transparent',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#fff' }}>
                          <span>{n.title}</span>
                          <span style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)' }}>{n.time}</span>
                        </div>
                        <p style={{ color: 'var(--foreground-dim)', marginTop: '0.2rem', fontSize: '0.7rem' }}>{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Settings Gear */}
            <button 
              onClick={() => {
                setActiveTab('settings');
                setShowNotifDropdown(false);
                setShowProfileDropdown(false);
                triggerToast('Navigated to configuration parameters');
              }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Settings size={18} />
            </button>

            {/* Profile Avatar Trigger */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifDropdown(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '2rem',
                  padding: '0.35rem 0.85rem 0.35rem 0.35rem',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #d4af37 100%)',
                  color: '#000',
                  fontWeight: '900',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px var(--primary-glow)'
                }}>
                  SA
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}> Admin</span>
                <ChevronDown size={12} />
              </button>

              {showProfileDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '200px',
                  background: 'rgba(15,15,15,0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                  padding: '0.5rem',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem'
                }}>
                  <div style={{ padding: '0.65rem 0.85rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.75rem', color: '#fff' }}> Admin</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--primary)' }}>admin@queensos.com</div>
                  </div>
                  <button 
                    onClick={() => {
                      triggerToast('Redirecting to secure admin profile details');
                      setShowProfileDropdown(false);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--foreground-light)',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <UserCheck size={14} /> My Profile
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('settings');
                      setShowProfileDropdown(false);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--foreground-light)',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Settings size={14} /> Settings
                  </button>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.25rem 0' }}></div>
                  <button 
                    onClick={() => {
                      void logout().then(() => navigate('/login'));
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ── Dynamic Page Header & Breadcrumb Trail ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '0.5rem 0',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          paddingBottom: '1rem',
          marginTop: '0.5rem',
          width: '100%'
        }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--foreground-muted)', fontWeight: '600' }}>
            <span 
              onClick={() => navigate('/')} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'color 0.2s' }}
              className="breadcrumb-item"
            >
              <Home size={11} />
              Queens OS
            </span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span 
              onClick={() => setActiveTab('dashboard')} 
              style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              className="breadcrumb-item"
            >
              CRM Backoffice
            </span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: 'var(--primary)', fontWeight: '800' }}>
              {activeTab === 'dashboard' ? 'Financial Analytics' : 
               activeTab === 'vetting' ? 'Driver Vetting Hub' : 
               activeTab === 'manage-driver' ? 'Manage Onboarding Form' : 
               activeTab === 'financial-test-ground' ? 'Financial Test Ground' : 
               activeTab === 'postings-report' ? 'Postings & Reports' : 
               activeTab === 'driver-trip-dashboard' ? 'Driver Trip Dashboard' : 
               activeTab === 'tenant-remittance-config' ? 'Tenant Remittance Config' : 
               activeTab === 'fare-config' ? 'Site-Wide Fare Config' : 
               activeTab === 'scheduler' ? 'Scheduler Dashboard' : 
               activeTab === 'coin-reward' ? 'Coin Rewards' : 
               'Platform Configurations'}
            </span>

          </div>

          {/* Page/Module Title with animated metrics */}
          {activeTab !== 'dashboard' && activeTab !== 'manage-driver' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>

              <div>
                <h1 style={{
                  fontSize: '1.85rem',
                  fontWeight: '900',
                  fontFamily: 'var(--font-outfit)',
                  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.65) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                  margin: 0
                }}>
                  {(() => {
                    switch (activeTab) {
                      case 'vetting': return ' Vetting & Compliance';
                      case 'settings': return 'Platform Settings';
                      case 'fees': return 'Fees & Commissions';
                      case 'fraud': return 'Fraud Management';
                      case 'ledger': return 'General Ledger';
                      case 'overdraft': return 'Overdraft Control';
                      case 'loans': return 'Loan Portfolio';
                      case 'roles': return 'System Roles';
                      case 'customers': return 'Customer Management';
                      case 'interest': return 'Interest Policies';
                      case 'charges': return 'System Charges';
                      case 'officers': return 'Account Officers';
                      case 'entry-codes': return 'Ledger Entry Codes';
                      case 'users': return 'User Directory';
                      case 'permissions': return 'Global Permissions';
                      case 'partners': return 'Ecosystem Partners';
                      case 'postings': return 'Accounting & Postings';
                      case 'reporting': return 'Financial Reporting';
                      case 'financial-test-ground': return 'Financial Test Ground';
                      case 'postings-report': return 'Postings & Reports';
                      case 'driver-trip-dashboard': return 'Driver Trip Dashboard';
                      case 'tenant-remittance-config': return 'Tenant Remittance Config';
                      case 'fare-config': return 'Site-Wide Fare Config';
                      case 'scheduler': return 'Scheduler Dashboard';
                      case 'coin-reward': return 'Coin Rewards';
                      case 'approvals': return 'Approvals Inbox';
                      case 'approval-policies': return 'Approval Policies';
                      default: return 'System Administration';
                    }
                  })()}
                </h1>
                <p style={{ fontSize: '0.8rem', color: 'var(--foreground-dim)', marginTop: '0.25rem' }}>
                  {(() => {
                    switch (activeTab) {
                      case 'vetting': return 'High fidelity document validation, cryptographically signed driver certification.';
                      case 'settings': return 'Global configuration and environment parameters.';
                      case 'fees': return 'Manage system-wide deduction and payout structures.';
                      case 'fraud': return 'Real-time anomaly detection and account restrictions.';
                      case 'ledger': return 'Master accounting records and transactional truth.';
                      case 'overdraft': return 'Monitor and configure margin liquidity facilities.';
                      case 'loans': return 'Asset financing and micro-lending management.';
                      case 'roles': return 'Identity access control and system privileges.';
                      case 'customers': return 'Ecosystem user directory and engagement metrics.';
                      case 'interest': return 'Dynamic APY and yield generation curves.';
                      case 'charges': return 'Penalty and administrative fee schedules.';
                      case 'officers': return 'Internal personnel and portfolio assignment.';
                      case 'entry-codes': return 'Ledger routing and transactional classification.';
                      case 'users': return 'Global identity directory and credentials.';
                      case 'permissions': return 'Granular access control policies.';
                      case 'partners': return 'B2B integration and affiliate management.';
                      case 'postings': return 'Financial transaction execution and bulk processing.';
                      case 'reporting': return 'Compliance, intelligence, and system analytics.';
                      case 'financial-test-ground': return 'Interactive sandbox to test trip payments, commissions, escrow, savings, remittances, audit, and GL transactions.';
                      case 'postings-report': return 'View all transaction flows: trip revenue, driver earnings, partner settlements, remittances, wallet txns, payment history, and audit reports.';
                      case 'driver-trip-dashboard': return 'Driver-specific transactional dashboard showing earnings, trip records, and financial summaries.';
                      case 'tenant-remittance-config': return 'Configure how tenant drivers remit: cycle (daily/weekly/monthly/commission), type, and rates per driver or globally.';
                      case 'fare-config': return 'System-wide fare and commission configuration keys for stand-alone individual drivers.';
                      case 'scheduler': return 'Execute and monitor automated jobs: overdue remittance processing and savings disbursements.';
                      case 'coin-reward': return 'Queens coin reward system: award trip coins to riders, drivers, and tenants. View wallet balances and transaction history.';
                      case 'approvals': return 'Review and process approval-gated actions across the platform.';
                      case 'approval-policies': return 'Define which endpoints require approval and who can approve them.';
                      default: return 'High-level platform telemetry and metrics.';
                    }
                  })()}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                {/* Add New Button (Only for relevant tabs in list view) */}
                {['fees', 'fraud', 'ledger', 'overdraft', 'loans', 'roles', 'customers', 'interest', 'charges', 'officers', 'entry-codes', 'users', 'permissions', 'partners'].includes(activeTab) && currentChildView === 'list' && (
                  <button 
                    onClick={handleAddNew}
                    className="btn btn-primary"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem', 
                      background: 'linear-gradient(135deg, var(--primary) 0%, #d4af37 100%)', 
                      color: '#000', 
                      fontWeight: 'bold', 
                      border: 'none', 
                      padding: '0.4rem 0.85rem', 
                      fontSize: '0.75rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} /> Add New
                  </button>
                )}

                {activeTab === 'vetting' && currentChildView === 'list' ? (
                  <button 
                    onClick={() => {
                      setIsAddingDriver(true);
                      setActiveTab('manage-driver');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'linear-gradient(135deg, var(--primary) 0%, #d4af37 100%)',
                      border: 'none',
                      borderRadius: '2rem',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      color: '#000',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Plus size={14} /> Add Driver
                  </button>
                ) : activeTab === 'customers' && currentChildView === 'manage' ? (
                  <button 
                    onClick={() => setPndTriggerMap(prev => ({ ...prev, customers: (prev.customers || 0) + 1 }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '2rem',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#ef4444',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                    }}
                  >
                    <ShieldAlert size={14} /> Post No Debit (PND)
                  </button>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255,184,0,0.04)',
                    border: '1px solid rgba(255,184,0,0.12)',
                    borderRadius: '2rem',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: 'var(--primary)'
                  }}>
                    <span className="pulse-dot" style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }}></span>
                    <span>SUITE v1.0.4 ACTIVE</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Active Tab Component Render via React Router DOM ── */}
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>
          <Suspense fallback={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
              <div className="pulse-dot" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }}></div>
              Loading module...
            </div>
          }>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard settings={settings} triggerToast={triggerToast} />} />
              
              <Route path="vetting" element={
                <AdminVettingHub 
                  drivers={drivers} 
                  onUpdateDrivers={handleUpdateDrivers} 
                  onManageDriver={(driver) => {
                    setSelectedManageDriver(driver);
                    setActiveTab('manage-driver');
                  }}
                  onViewTransactions={(driver) => {
                    setTripDashboardDriver({ id: driver.id, name: driver.name });
                    setActiveTab('driver-trip-dashboard');
                    triggerToast(`Loading transaction dashboard for ${driver.name}`);
                  }}
                  triggerToast={triggerToast}
                  searchQuery={driverSearchQuery}
                  onSearchChange={(q) => { setDriverSearchQuery(q); setDriverPage(1); }}
                  page={driverPage}
                  pageSize={driverPageSize}
                  totalItems={driverTotal}
                  onPageChange={(p) => setDriverPage(p)}
                  onPageSizeChange={(sz) => { setDriverPageSize(sz); setDriverPage(1); }}
                />
              } />
              
              <Route path="manage-driver" element={
                (selectedManageDriver || isAddingDriver) ? (
                  <AdminManageDriver 
                    key={isAddingDriver ? 'new-driver' : selectedManageDriver?.id}
                    driver={isAddingDriver ? {
                      id: '',
                      name: '',
                      email: '',
                      phone: '',
                      city: '',
                      licenseClass: 'Standard',
                      vehicle: { make: '', model: '', year: '', plateNumber: '', color: '', tier: 'Swift' },
                      onboardingDetails: { ssn: '', licenseNumber: '', licenseExpiry: '', address: '', isPartner: false, documents: { licenseFront: '', idProof: '', utilityBill: '', insurance: '' } },
                      signature: '',
                      vettingStatus: 'PENDING',
                      isVerified: false,
                      status: 'Active',
                      submittedAt: new Date().toISOString(),
                    } : selectedManageDriver!}
                    isNewDriver={isAddingDriver}
                    onSave={(updatedDriver) => {
                      if (isAddingDriver) {
                        handleUpdateDrivers([updatedDriver, ...drivers]);
                        setIsAddingDriver(false);
                        setSelectedManageDriver(updatedDriver);
                        triggerToast(`Driver ${updatedDriver.name} added to the vetting queue.`);
                      } else {
                        const updatedList = drivers.map(drv => drv.id === updatedDriver.id ? updatedDriver : drv);
                        handleUpdateDrivers(updatedList);
                        setActiveTab('vetting');
                        setSelectedManageDriver(null);
                      }
                    }}
                    onCancel={() => {
                      setActiveTab('vetting');
                      setSelectedManageDriver(null);
                      setIsAddingDriver(false);
                    }}
                    triggerToast={triggerToast}
                  />
                ) : <Navigate to="../vetting" replace />
              } />

              <Route path="fees" element={<FeesManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['fees']} onViewChange={setCurrentChildView} />} />
              <Route path="fraud" element={<FraudManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['fraud']} onViewChange={setCurrentChildView} />} />
              <Route path="ledger" element={<GeneralLedgerHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['ledger']} onViewChange={setCurrentChildView} />} />
              <Route path="overdraft" element={<OverdraftManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['overdraft']} onViewChange={setCurrentChildView} />} />
              <Route path="loans" element={<LoanManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['loans']} onViewChange={setCurrentChildView} />} />
              <Route path="roles" element={<RolesManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['roles']} onViewChange={setCurrentChildView} />} />
              <Route path="customers" element={<CustomerManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['customers']} pndTrigger={pndTriggerMap['customers']} onViewChange={setCurrentChildView} selectCustomerId={manageCustomerId ?? undefined} selectCustomerTrigger={manageCustomerTrigger} />} />
              <Route path="partners" element={<PartnersManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['partners']} onViewChange={setCurrentChildView} />} />
              <Route path="interest" element={<InterestManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['interest']} onViewChange={setCurrentChildView} />} />
              <Route path="charges" element={<ChargesManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['charges']} onViewChange={setCurrentChildView} />} />
              <Route path="officers" element={<AccountOfficerManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['officers']} onViewChange={setCurrentChildView} />} />
              <Route path="entry-codes" element={<EntryCodesManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['entry-codes']} onViewChange={setCurrentChildView} />} />
              <Route path="users" element={<UserManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['users']} onViewChange={setCurrentChildView} />} />
              <Route path="permissions" element={<PermissionsManagementHub triggerToast={triggerToast} addNewTrigger={addNewTriggerMap['permissions']} onViewChange={setCurrentChildView} />} />
              <Route path="approvals" element={<ApprovalManagementHub triggerToast={triggerToast} />} />
              <Route path="approval-policies" element={<ApprovalConfigsHub triggerToast={triggerToast} />} />
              <Route path="postings" element={<PostingsHub triggerToast={triggerToast} />} />
              <Route path="reporting" element={<ReportingHub triggerToast={triggerToast} />} />
              <Route path="financial-test-ground" element={<FinancialTestGroundHub triggerToast={triggerToast} />} />
              <Route path="postings-report" element={<PostingsReportHub triggerToast={triggerToast} />} />
              <Route path="driver-trip-dashboard" element={
                tripDashboardDriver ? (
                  <DriverTripDashboard
                    driverId={tripDashboardDriver.id}
                    driverName={tripDashboardDriver.name}
                    triggerToast={triggerToast}
                    onBack={() => { setTripDashboardDriver(null); setActiveTab('vetting'); }}
                    onViewCustomerInfo={(driverId) => {
                      setManageCustomerId(driverId);
                      setManageCustomerTrigger(prev => prev + 1);
                      setActiveTab('customers');
                    }}
                  />
                ) : <Navigate to="../vetting" replace />
              } />
              <Route path="tenant-remittance-config" element={<TenantRemittanceConfigHub triggerToast={triggerToast} />} />
              <Route path="fare-config" element={<SiteWideFareConfigHub triggerToast={triggerToast} />} />
              <Route path="scheduler" element={<SchedulerDashboard triggerToast={triggerToast} />} />
              <Route path="coin-reward" element={<CoinRewardHub triggerToast={triggerToast} />} />
              <Route path="settings" element={<AdminSettings settings={settings} setSettings={setSettings} triggerToast={triggerToast} />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Suspense>
        </div>


      </main>
    </div>
  );
}
