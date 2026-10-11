import { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Car, ShieldAlert, Sparkles, Home, LogOut, Coins } from 'lucide-react';
import { useAuthStore } from './stores/authStore';

const CrmLandingPage = lazy(() => import('./components/CrmLandingPage'));
const DriverPortal = lazy(() => import('./components/DriverPortal'));
const DriverPerks = lazy(() => import('./components/DriverPerks'));
const UserPortal = lazy(() => import('./components/UserPortal'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const TenantDashboard = lazy(() => import('./components/TenantDashboard'));
const CustomersManagement = lazy(() => import('./components/CustomersManagement'));
const CoinsExplore = lazy(() => import('./components/CoinsExplore'));
const CoinGenerationSystem = lazy(() => import('./components/CoinGenerationSystem'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const MfaSetupPage = lazy(() => import('./components/MfaSetupPage'));
const VerifyEmailPage = lazy(() => import('./components/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./components/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));
const OAuthCallbackPage = lazy(() => import('./components/OAuthCallbackPage'));

// ─── Tab → Path map (used by child components via onNavigate) ───────────────
const tabToPath: Record<string, string> = {
  home: '/',
  driver: '/driver',
  'driver-perks': '/driver/perks',
  user: '/user',
  admin: '/admin',
  coins: '/coins',
  'coin-gen': '/coins/generate',
};

// ─── Protected Route Guard ───────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  if (status !== 'authenticated') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─── App Shell: header + footer wrapping protected pages ────────────────────
function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { to: '/', icon: <Home size={18} />, label: 'Home', exact: true },
    { to: '/driver', icon: <Car size={18} />, label: 'Driver Sign Up', exact: false },
    { to: '/user', icon: <User size={18} />, label: 'User Portal', exact: false },
    { to: '/driver/perks', icon: <Sparkles size={18} />, label: 'Driver Perks', exact: false },

    // { to: '/admin', icon: <ShieldAlert size={18} />, label: 'Admin Vetting', exact: false },
    { to: '/coins', icon: <Coins size={18} />, label: 'Queens Coins', exact: false },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Hamburger Drawer Styles (inline for self-containment) ── */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hamburger-btn {
          display: none;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.6rem;
          padding: 0.55rem;
          cursor: pointer;
          color: #fff;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .hamburger-btn:hover { background: rgba(255,255,255,0.08); }

        @media (max-width: 768px) {
          .hamburger-btn { display: flex; }
          .desktop-nav   { display: none !important; }
          .signout-desktop { display: none !important; }
        }

        /* Backdrop */
        .drawer-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          z-index: 998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .drawer-backdrop.open { opacity: 1; pointer-events: all; }

        /* Drawer panel */
        .mobile-drawer {
          position: fixed;
          top: 0; right: 0;
          width: min(300px, 85vw);
          height: 100vh;
          background: linear-gradient(180deg, #0e0e0e 0%, #111 100%);
          border-left: 1px solid rgba(255,255,255,0.08);
          z-index: 999;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          gap: 0.5rem;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: -20px 0 60px rgba(0,0,0,0.6);
        }
        .mobile-drawer.open { transform: translateX(0); }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .drawer-nav-link {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          text-decoration: none;
          color: var(--foreground-muted);
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .drawer-nav-link:hover {
          background: rgba(255,255,255,0.04);
          color: #fff;
          border-color: rgba(255,255,255,0.06);
        }
        .drawer-nav-link.active {
          background: rgba(255,184,0,0.08);
          color: var(--primary);
          border-color: rgba(255,184,0,0.2);
        }
        .drawer-signout {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          background: rgba(239,68,68,0.05);
          border: 1px solid rgba(239,68,68,0.15);
          color: #ef4444;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .drawer-signout:hover { background: rgba(239,68,68,0.1); }
      `}} />

      {/* ── Mobile Backdrop ── */}
      <div
        className={`drawer-backdrop ${menuOpen ? 'open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* ── Mobile Drawer ── */}
      <nav className={`mobile-drawer ${menuOpen ? 'open' : ''}`} aria-label="Mobile navigation">
        <div className="drawer-header">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: '900', fontSize: '1.1rem', color: '#fff' }}>Queens OS</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>CRM Hub</span>
          </div>
          <button
            onClick={closeMenu}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', color: '#fff', display: 'flex' }}
            aria-label="Close menu"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            onClick={closeMenu}
            className={`drawer-nav-link ${link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to) ? 'active' : ''}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}

        <button className="drawer-signout" onClick={() => { closeMenu(); void logout().then(() => navigate('/login')); }}>
          <LogOut size={16} /> Sign Out
        </button>
      </nav>

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-container">

          <Link to="/" className="logo-block" style={{ textDecoration: 'none' }}>
            <img src="/logo.svg" alt="Queens OS Logo" className="logo-img" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="logo-text">Queens OS</span>
              <span style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.15em', color: 'var(--foreground-muted)' }}>
                CUSTOMER RELATION HUB
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="role-switcher desktop-nav">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`switcher-btn ${link.exact ? location.pathname === link.to : location.pathname.startsWith(link.to) ? 'active' : ''}`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Sign Out */}
          <button
            onClick={() => { void logout().then(() => navigate('/login')); }}
            className="signout-desktop"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.6rem', padding: '0.5rem 1rem',
              color: 'var(--foreground-muted)', fontSize: '0.8rem',
              cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.color = '#fff'; b.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.color = 'var(--foreground-muted)'; b.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <LogOut size={14} /> Sign Out
          </button>

          {/* Mobile Hamburger */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

        </div>
      </header>

      {/* ── Page Content ── */}
      <main className={`main-content fade-in ${location.pathname === '/driver' ? 'driver-portal-layout' : ''}`}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="footer-wrap">
        <div className="footer-grid">

          <div className="footer-col">
            <div className="logo-block" style={{ marginBottom: '0.5rem' }}>
              <img src="/logo.svg" alt="Queens OS Logo" className="logo-img" />
              <span className="logo-text" style={{ fontSize: '1.4rem' }}>Queens OS</span>
            </div>
            <p className="footer-text">
              The unified transport operating system for emerging markets. Coordinating urban rides, scheduled courier logistics, intercity coaches, and flight aggregation under a secure AI Agent orchestration layer.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Platform Hubs</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><Link to="/" style={{ textDecoration: 'none' }}>Ecosystem Home</Link></li>
              <li className="footer-link-item"><Link to="/driver" style={{ textDecoration: 'none' }}>Driver Sign Up</Link></li>
              <li className="footer-link-item"><Link to="/user" style={{ textDecoration: 'none' }}>Passenger Dashboard</Link></li>
              <li className="footer-link-item"><Link to="/admin" style={{ textDecoration: 'none' }}>Operator Vetting</Link></li>
              <li className="footer-link-item"><Link to="/coins" style={{ textDecoration: 'none' }}>Queens Coins</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Infrastructure</h4>
            <ul className="footer-links">
              <li className="footer-link-item"><a href="#">Temporal Orchestrator</a></li>
              <li className="footer-link-item"><a href="#">NATS Event Streaming</a></li>
              <li className="footer-link-item"><a href="#">LiveKit Audio Rooms</a></li>
              <li className="footer-link-item"><a href="#">Cloudinary Verifications</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Ecosystem Roadmap</h4>
            <ul className="footer-links">
              <li className="footer-link-item" style={{ color: 'var(--success)', fontWeight: 'bold' }}>Phase 1: Active</li>
              <li className="footer-link-item" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Phase 2: Expanding</li>
              <li className="footer-link-item" style={{ color: 'var(--foreground-dim)' }}>Phase 3: Scheduled</li>
              <li className="footer-link-item" style={{ color: 'var(--foreground-dim)' }}>Phase 4: Unified Flight</li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom-bar">
          <p style={{ fontSize: '0.75rem', color: 'var(--foreground-dim)' }}>
            © 2026 Queens OS Inc. All rights reserved. Built in strict compliance with the QueensInc Blueprint Roadmap.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Sparkles size={12} /> Live Interactive Sandbox
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ─── Root App ────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();

  // Map tab names (used by child components) → router paths
  const toPath = (tab: string) => {
    navigate(tabToPath[tab] ?? '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDriverOnboardingComplete = () => {
    setTimeout(() => navigate('/admin'), 1500);
  };

  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: 'var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold' }}>
          <div className="pulse-dot" style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }}></div>
          Loading Queens OS...
        </div>
      </div>
    }>
      <Routes>

      {/* ── Public: Login ── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />

      <Route
        path="/mfa"
        element={
          <ProtectedRoute>
            <AppShell>
              <MfaSetupPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* ── Public: Landing Page (no auth required) ── */}
      <Route
        path="/"
        element={
          <AppShell>
            <CrmLandingPage onNavigate={toPath} />
          </AppShell>
        }
      />

      <Route
        path="/driver"
        element={

          <AppShell>
            <DriverPortal onOnboardingComplete={handleDriverOnboardingComplete} />
          </AppShell>

        }
      />

      <Route
        path="/driver/perks"
        element={
          <AppShell>
            <DriverPerks onNavigate={toPath} />
          </AppShell>
        }
      />

      {/* Root Admin Routes - Uses AdminLayout with sidebar */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* Tenant-Specific Routes */}
      <Route
        path="/tenant/:tenantId/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <TenantDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tenant/:tenantId/users"
        element={
          <ProtectedRoute>
            <AppShell>
              <UserPortal onNavigate={toPath} />
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tenant/:tenantId/customers"
        element={
          <ProtectedRoute>
            <AppShell>
              <CustomersManagement />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Legacy Routes (redirect to tenant-specific) */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <AppShell>
              <UserPortal onNavigate={toPath} />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* ── Public: Coins Explorer ── */}
      <Route
        path="/coins"
        element={
          <AppShell>
            <CoinsExplore onNavigate={toPath} />
          </AppShell>
        }
      />

      {/* ── Public: Coin Generator Hub (info/purchase page) ── */}
      <Route
        path="/coins/generate"
        element={
          <AppShell>
            <CoinGenerationSystem onNavigate={toPath} />
          </AppShell>
        }
      />

      {/* ── Fallback: unknown paths → landing page ── */}
      <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Suspense>
  );
}
