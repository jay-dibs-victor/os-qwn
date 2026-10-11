import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const isBusy = useAuthStore((s) => s.isBusy);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (storeError) setError(storeError);
  }, [storeError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setError(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    await forgotPassword(email);
    setSuccess(true);
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
            <Mail size={40} style={{ color: 'var(--success)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-outfit)', fontWeight: '900', color: '#fff', marginBottom: '0.5rem' }}>
            Check Your Email
          </h2>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
            If an account exists with <strong>{email}</strong>, you'll receive a password reset code shortly.
          </p>
          <button
            onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Continue to Reset Password
          </button>
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
      <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 8px 32px rgba(239,68,68,0.15)' }}>
            <Lock size={28} style={{ color: '#EF4444' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-outfit)', fontWeight: '900', color: '#fff', marginBottom: '0.35rem' }}>
            Forgot Password?
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            We'll send you a reset code
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
            Enter your email address and we'll send you a code to reset your password.
          </p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.5rem', color: '#EF4444', fontSize: '0.85rem' }}>
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isBusy}
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {isBusy ? (
                <><RefreshCw size={16} className="spin" /> Sending...</>
              ) : (
                <>Send Reset Code <ArrowRight size={16} /></>
              )}
            </button>

          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginTop: '1.5rem' }}>
          Remember your password? <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Sign in</a>
        </p>

      </div>
    </div>
  );
}
