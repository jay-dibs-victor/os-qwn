import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw, ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email');
  
  const tenantId = useAuthStore((s) => s.tenantId);
  const isBusy = useAuthStore((s) => s.isBusy);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const sendVerificationOtp = useAuthStore((s) => s.sendVerificationOtp);
  const verifyEmailOtp = useAuthStore((s) => s.verifyEmailOtp);
  const login = useAuthStore((s) => s.login);
  
  const [email, setEmail] = useState(emailParam || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (storeError) setError(storeError);
  }, [storeError]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    clearError();
    setError(null);
    await sendVerificationOtp(email);
    setResendCooldown(60);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setError(null);

    if (!email || !otp) {
      setError('Please enter your email and OTP code');
      return;
    }

    try {
      await verifyEmailOtp(email, otp);
      setSuccess(true);
      
      // Auto-redirect after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      // Error is already set by the store
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        padding: '1.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.3)', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <ShieldCheck size={40} style={{ color: 'var(--success)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: '900', color: '#fff', marginBottom: '0.5rem' }}>
            Email Verified!
          </h2>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
            Your account has been successfully verified. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

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

      {/* Ambient Background */}
      <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,184,0,0.07) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'linear-gradient(135deg, rgba(255,184,0,0.15) 0%, rgba(255,184,0,0.05) 100%)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 8px 32px rgba(255,184,0,0.15)' }}>
            <Mail size={28} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-outfit)', fontWeight: '900', color: '#fff', marginBottom: '0.35rem' }}>
            Verify Your Email
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Enter the OTP sent to your email
          </p>
        </div>

        {/* Verification Card */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.5rem', color: '#EF4444', fontSize: '0.85rem' }}>
              <ShieldCheck size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
                placeholder="you@queensos.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Verification Code</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="form-input"
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                style={{ fontSize: '1.2rem', letterSpacing: '0.5rem', textAlign: 'center' }}
                required
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--foreground-dim)', marginTop: '0.5rem' }}>
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isBusy}
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {isBusy ? (
                <><RefreshCw size={16} className="spin" /> Verifying...</>
              ) : (
                <>Verify Email <ArrowRight size={16} /></>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isBusy || resendCooldown > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 ? 'var(--foreground-dim)' : 'var(--primary)',
                  fontSize: '0.85rem',
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>

            {tenantId && (
              <div style={{ marginTop: '0.25rem', color: 'var(--foreground-dim)', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>
                Tenant: {tenantId}
              </div>
            )}

          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginTop: '1.5rem' }}>
          Already verified? <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Sign in</a>
        </p>

      </div>
    </div>
  );
}
