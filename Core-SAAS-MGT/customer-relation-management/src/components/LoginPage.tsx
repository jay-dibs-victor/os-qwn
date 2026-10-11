import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, ShieldCheck, RefreshCw, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import SignUpWizard from './SignUpWizard';

export default function LoginPage() {
  const navigate = useNavigate();
  const tenantId = useAuthStore((s) => s.tenantId);
  const status = useAuthStore((s) => s.status);
  const isBusy = useAuthStore((s) => s.isBusy);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const login = useAuthStore((s) => s.login);
  const verifyMfa = useAuthStore((s) => s.verifyMfa);
  const register = useAuthStore((s) => s.register);
  const [email, setEmail] = useState('admin@queensos.com');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register' | 'mfa'>('login');

  useEffect(() => {
    if (storeError) setError(storeError);
  }, [storeError]);

  useEffect(() => {
    if (status === 'mfa_required') setMode('mfa');
  }, [status]);

  const routeAfterAuth = () => {
    const state = useAuthStore.getState();
    // Check if user is admin (root-admin tenant)
    // tenantId comes from JWT, not from .env
    const isAdmin = state.tenantId === 'root-admin';
    console.log('🔐 Routing after auth. JWT TenantId:', state.tenantId, 'IsAdmin:', isAdmin);
    
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      // Route to tenant-specific dashboard
      navigate(`/tenant/${state.tenantId}/dashboard`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setError(null);

    if (!tenantId) {
      setError('Tenant is not resolved for this domain.');
      return;
    }

    if (mode === 'mfa') {
      if (!mfaCode) {
        setError('Enter your MFA code.');
        return;
      }
      await verifyMfa(mfaCode);
      if (useAuthStore.getState().status === 'authenticated') routeAfterAuth();
      return;
    }

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      console.log('🔐 Starting login with:', { email, tenantId });
      await login({ email, password });
      const state = useAuthStore.getState();
      console.log('✅ Login response. Status:', state.status, 'Error:', state.error);
      if (state.status === 'authenticated') {
        console.log('✅ Authenticated, routing to /user');
        routeAfterAuth();
      } else {
        console.log('❌ Login failed. Status:', state.status, 'Error:', state.error);
        setError(state.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      position: 'relative',
      overflow: 'hidden',
      padding: '1.5rem',
    }}>

      {/* Premium Micro-Interactions Styling */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-40px) rotate(180deg); opacity: 0.5; }
        }
        @keyframes shine {
          100% { left: 125%; }
        }
        .quick-access-btn {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .quick-access-btn:hover {
          transform: translateY(-4px) scale(1.02) !important;
          box-shadow: 0 12px 24px rgba(255, 184, 0, 0.12) !important;
          background: rgba(255, 184, 0, 0.06) !important;
          border-color: rgba(255, 184, 0, 0.35) !important;
        }
        .quick-access-btn:active {
          transform: translateY(-1px) scale(0.97) !important;
        }
        .form-input {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .form-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.15) !important;
          background: rgba(0, 0, 0, 0.4) !important;
        }
        .btn-primary-shine {
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .btn-primary-shine::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 20%;
          height: 200%;
          background: rgba(255, 255, 255, 0.25);
          transform: rotate(30deg);
          transition: none;
        }
        .btn-primary-shine:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 30px rgba(255, 184, 0, 0.38) !important;
        }
        .btn-primary-shine:hover::after {
          animation: shine 0.75s ease-in-out;
        }
        .btn-primary-shine:active {
          transform: translateY(0) scale(0.98) !important;
        }
        .floating-orb {
          animation: floatParticle 8s ease-in-out infinite;
        }
      `}} />

      {/* Floating Sparkle Particles underlay */}
      <div className="floating-orb" style={{ position: 'absolute', top: '20%', left: '15%', width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '50%', filter: 'blur(1px)', pointerEvents: 'none' }} />
      <div className="floating-orb" style={{ position: 'absolute', top: '70%', left: '80%', width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%', filter: 'blur(1px)', pointerEvents: 'none', animationDelay: '2s' }} />
      <div className="floating-orb" style={{ position: 'absolute', top: '40%', right: '25%', width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', filter: 'blur(1px)', pointerEvents: 'none', animationDelay: '4s' }} />

      {/* Ambient Background Blobs */}
      <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,184,0,0.07) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Subtle grid overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'linear-gradient(135deg, rgba(255,184,0,0.15) 0%, rgba(255,184,0,0.05) 100%)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 8px 32px rgba(255,184,0,0.15)' }}>
            <img src="/logo.svg" alt="Queens OS" style={{ width: '36px', height: '36px' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <Sparkles size={28} style={{ color: 'var(--primary)', display: 'none' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-outfit)', fontWeight: '900', color: '#fff', marginBottom: '0.35rem' }}>
            Queens OS
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Customer Relation Hub
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          
          <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-outfit)', marginBottom: '0.35rem', color: '#fff' }}>
            {mode === 'register' ? 'Create your account' : mode === 'mfa' ? 'Verify MFA' : 'Sign in to your account'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
            {mode === 'register'
              ? 'Register a new user for this tenant.'
              : mode === 'mfa'
                ? 'Enter the code from your authenticator app.'
                : 'Access your personalized CRM dashboard.'}
          </p>

          {/* Error Message */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.5rem', color: '#EF4444', fontSize: '0.85rem' }}>
              <ShieldCheck size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {mode !== 'mfa' && (
              <>
                {mode === 'login' ? (
                  <>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={13} style={{ color: 'var(--foreground-muted)' }} /> Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="form-input"
                        placeholder="admin@queensos.com"
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Lock size={13} style={{ color: 'var(--foreground-muted)' }} /> Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="form-input"
                          placeholder="••••••••"
                          autoComplete="current-password"
                          style={{ paddingRight: '3rem' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '-0.75rem' }}>
                      <a
                        href="/forgot-password"
                        style={{
                          color: 'var(--primary)',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          fontWeight: '600',
                        }}
                      >
                        Forgot password?
                      </a>
                    </div>
                  </>
                ) : (
                  <SignUpWizard
                    onSubmit={async (data) => {
                      try {
                        await register(data);
                        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
                      } catch (err) {
                        // Error already set by store
                      }
                    }}
                    onGoogleSignUp={() => {
                      window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/auth/google`;
                    }}
                    isBusy={isBusy}
                    error={error}
                  />
                )}
              </>
            )}

            {mode === 'mfa' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>MFA Code</label>
                <input
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="form-input"
                  placeholder="123456"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-primary-shine"
              disabled={isBusy}
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 'bold', marginTop: '0.25rem', display: mode === 'register' ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 24px rgba(255,184,0,0.25)' }}
            >
              {isBusy ? (
                <><RefreshCw size={16} className="spin" /> {mode === 'register' ? 'Creating...' : mode === 'mfa' ? 'Verifying...' : 'Authenticating...'}</>
              ) : (
                <>{mode === 'register' ? 'Create Account' : mode === 'mfa' ? 'Verify' : 'Sign In'} <ArrowRight size={16} /></>
              )}
            </button>

            {mode === 'login' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0 0.75rem' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--foreground-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Or continue with
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/auth/google`;
                  }}
                  disabled={isBusy}
                  className="btn-primary-shine"
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.85rem',
                    color: '#fff',
                    cursor: isBusy ? 'not-allowed' : 'pointer',
                    opacity: isBusy ? 0.6 : 1,
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              </>
            )}



          </form>
        </div>

        {/* Sign Up Link - Below Card */}
        {mode !== 'mfa' && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            {mode === 'login' ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); clearError(); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textDecoration: 'underline',
                    transition: 'all 0.2s ease',
                    padding: '0',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,184,0,0.8)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                >
                  Sign up here
                </button>
              </p>
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); clearError(); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textDecoration: 'underline',
                    transition: 'all 0.2s ease',
                    padding: '0',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,184,0,0.8)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--foreground-dim)', marginTop: '2rem' }}>
          © 2026 Queens OS Ltd. All rights reserved.
        </p>

      </div>
    </div>
  );
}
