import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const handleOAuthCallback = useAuthStore((s) => s.handleOAuthCallback);

  useEffect(() => {
    const processCallback = async () => {
      // Check for Google OAuth callback errors
      const error = searchParams.get('error');
      if (error) {
        setStatus('error');
        setErrorMessage(error);
        setTimeout(() => {
          navigate('/login?error=' + encodeURIComponent(error));
        }, 1500);
        return;
      }

      // Handle OAuth callback (with code and state from Google OAuth)
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      // Validate required parameters
      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Missing authorization code or state parameter');
        return;
      }

      try {
        // Exchange code for tokens using the auth store's handleOAuthCallback method
        await handleOAuthCallback(code, state);
        setStatus('success');

        // Redirect to user portal after successful authentication
        setTimeout(() => {
          navigate('/user');
        }, 1500);
      } catch (err) {
        setStatus('error');
        setErrorMessage((err as Error).message || 'OAuth authentication failed');
      }
    };

    processCallback();
  }, [searchParams, handleOAuthCallback, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {status === 'processing' && (
          <>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                background: 'rgba(255,184,0,0.1)',
                border: '2px solid rgba(255,184,0,0.25)',
                borderRadius: '50%',
                marginBottom: '1.5rem',
              }}
            >
              <RefreshCw
                size={36}
                style={{ color: 'var(--primary)' }}
                className="spin"
              />
            </div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-outfit)',
                fontWeight: '900',
                color: '#fff',
                marginBottom: '0.75rem',
              }}
            >
              Completing Sign In
            </h2>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--foreground-muted)',
                lineHeight: '1.6',
              }}
            >
              Please wait while we securely authenticate your account...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                background: 'rgba(16,185,129,0.1)',
                border: '2px solid rgba(16,185,129,0.25)',
                borderRadius: '50%',
                marginBottom: '1.5rem',
              }}
            >
              <CheckCircle size={36} style={{ color: 'var(--success)' }} />
            </div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-outfit)',
                fontWeight: '900',
                color: '#fff',
                marginBottom: '0.75rem',
              }}
            >
              Authentication Successful!
            </h2>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--foreground-muted)',
                lineHeight: '1.6',
              }}
            >
              Redirecting you to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                background: 'rgba(239,68,68,0.1)',
                border: '2px solid rgba(239,68,68,0.25)',
                borderRadius: '50%',
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={36} style={{ color: '#EF4444' }} />
            </div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontFamily: 'var(--font-outfit)',
                fontWeight: '900',
                color: '#fff',
                marginBottom: '0.75rem',
              }}
            >
              Authentication Failed
            </h2>
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--foreground-muted)',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
              }}
            >
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{
                padding: '0.85rem 1.75rem',
                fontSize: '0.95rem',
                fontWeight: 'bold',
              }}
            >
              Return to Login
            </button>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}} />
    </div>
  );
}
