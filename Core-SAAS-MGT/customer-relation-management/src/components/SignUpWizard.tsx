import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ArrowLeft, RefreshCw, Mail, Lock, User } from 'lucide-react';
import PhoneInput from './PhoneInput';

interface SignUpWizardProps {
  onSubmit: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => Promise<void>;
  onGoogleSignUp: () => void;
  isBusy: boolean;
  error: string | null;
}

export default function SignUpWizard({ onSubmit, onGoogleSignUp, isBusy, error }: SignUpWizardProps) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const isStep1Valid = formData.email && formData.password && formData.password.length >= 8;
  const isStep2Valid = formData.firstName && formData.lastName;
  const isStep3Valid = formData.phone;

  return (
    <div style={{ width: '100%' }}>
      {/* Error Message */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.5rem', color: '#EF4444', fontSize: '0.85rem' }}>
          <span>⚠️</span>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Step 1: Email & Password + Google Sign Up Option */}
        {step === 1 && (
          <>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={13} style={{ color: 'var(--foreground-muted)' }} /> Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                placeholder="you@queensos.com"
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={{ paddingRight: '3rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--foreground-muted)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--foreground-dim)', marginTop: '0.5rem' }}>
                ✓ At least 8 characters
              </p>
            </div>

            {/* Google Sign Up Option */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0 1rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--foreground-dim)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Or sign up with
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <button
              type="button"
              onClick={onGoogleSignUp}
              disabled={isBusy}
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
                transition: 'all 0.25s ease',
                marginBottom: '0rem',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          </>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={13} style={{ color: 'var(--foreground-muted)' }} /> First Name
              </label>
              <input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="form-input"
                placeholder="John"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={13} style={{ color: 'var(--foreground-muted)' }} /> Last Name
              </label>
              <input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="form-input"
                placeholder="Doe"
                required
              />
            </div>
          </>
        )}

        {/* Step 3: Phone + Create Account */}
        {step === 3 && (
          <>
            <div className="form-group" style={{ margin: 0 }}>
              <PhoneInput
                value={formData.phone}
                onChange={(phone) => setFormData({ ...formData, phone })}
                placeholder="+2348012345678"
              />
            </div>

            {/* Create Account Button - Only on Step 3 */}
            <button
              type="button"
              onClick={handleCreateAccount}
              disabled={!isStep3Valid || isBusy}
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,184,0,0.1)',
                border: '1px solid rgba(255,184,0,0.35)',
                borderRadius: '0.85rem',
                color: '#fff',
                cursor: !isStep3Valid || isBusy ? 'not-allowed' : 'pointer',
                opacity: !isStep3Valid || isBusy ? 0.5 : 1,
                transition: 'all 0.25s ease',
                boxShadow: '0 8px 24px rgba(255,184,0,0.25)',
                marginTop: '1.5rem',
              }}
            >
              {isBusy ? (
                <>
                  <RefreshCw size={16} className="spin" /> Creating...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: step === 3 ? '0' : '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isBusy}
              style={{
                padding: '0.9rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.85rem',
                color: '#fff',
                cursor: isBusy ? 'not-allowed' : 'pointer',
                opacity: isBusy ? 0.5 : 1,
                transition: 'all 0.25s ease',
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {step < 3 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                isBusy
              }
              style={{
                marginLeft: 'auto',
                padding: '0.9rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,184,0,0.1)',
                border: '1px solid rgba(255,184,0,0.35)',
                borderRadius: '0.85rem',
                color: '#fff',
                cursor:
                  (step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid) ||
                  isBusy
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  (step === 1 && !isStep1Valid) ||
                  (step === 2 && !isStep2Valid) ||
                  isBusy
                    ? 0.5
                    : 1,
                transition: 'all 0.25s ease',
              }}
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>


      </div>
    </div>
  );
}
