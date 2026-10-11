import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { RefreshCw } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const handleOAuthCallback = useAuthStore((s) => s.handleOAuthCallback);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          navigate('/login?error=' + encodeURIComponent(error));
          return;
        }

        if (!code || !state) {
          console.error('Missing OAuth parameters');
          navigate('/login?error=Missing+authentication+parameters');
          return;
        }

        // Handle OAuth callback
        await handleOAuthCallback(code, state);
        
        // Check if authenticated
        const authState = useAuthStore.getState();
        if (authState.status === 'authenticated') {
          navigate('/user');
        } else {
          navigate('/login?error=Authentication+failed');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/login?error=Authentication+failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, handleOAuthCallback]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <RefreshCw size={32} className="spin" style={{ color: 'var(--primary)' }} />
      <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem' }}>
        Completing authentication...
      </p>
    </div>
  );
}
