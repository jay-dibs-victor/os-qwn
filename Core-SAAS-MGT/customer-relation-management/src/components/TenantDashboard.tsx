import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut, Users, Settings, BarChart3, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useTenantValidation } from '../hooks/useTenantValidation';
import * as authApi from '../api/auth';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tenantId: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
}

export default function TenantDashboard() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { isValid } = useTenantValidation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verify tenant ID matches JWT
  useEffect(() => {
    if (!isValid) {
      setError('Unauthorized: Tenant ID mismatch');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [isValid, navigate]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authApi.getMe();
        setUserProfile(response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        // Fallback to auth store data
        const state = useAuthStore.getState();
        setUserProfile({
          id: state.userId || '',
          email: state.email || '',
          tenantId: state.tenantId || '',
          status: 'active',
          isVerified: true,
          createdAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-dot" style={{ width: '16px', height: '16px', background: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1rem', display: 'inline-block' }}></div>
          <p style={{ color: 'var(--foreground-muted)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        padding: '1.5rem',
      }}>
        <div style={{
          maxWidth: '400px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
          <h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1.5rem',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const initials = userProfile
    ? `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase() || userProfile.email[0].toUpperCase()
    : '?';

  const memberSince = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      padding: '2rem 1.5rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontFamily: 'var(--font-outfit)',
              fontWeight: '900',
              color: '#fff',
              marginBottom: '0.25rem',
            }}>
              Tenant Dashboard
            </h1>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>
              Manage your organization and data
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1.25rem',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.25rem',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}>
            {/* Avatar */}
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(255,184,0,0.2) 0%, rgba(255,184,0,0.05) 100%)',
              border: '2px solid rgba(255,184,0,0.3)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: 'var(--primary)',
                fontFamily: 'var(--font-outfit)',
              }}>
                {initials}
              </span>
            </div>

            {/* Profile Info */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#fff',
                marginBottom: '0.5rem',
              }}>
                {userProfile?.firstName && userProfile?.lastName
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : userProfile?.email}
              </h2>
              <p style={{ color: 'var(--foreground-muted)', marginBottom: '1.5rem' }}>
                Tenant Admin • {userProfile?.tenantId}
              </p>

              {/* Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
              }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.35rem' }}>
                    Email
                  </p>
                  <p style={{ color: '#fff', fontWeight: '600' }}>{userProfile?.email}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.35rem' }}>
                    Phone
                  </p>
                  <p style={{ color: '#fff', fontWeight: '600' }}>{userProfile?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.35rem' }}>
                    Status
                  </p>
                  <p style={{ color: '#fff', fontWeight: '600', textTransform: 'capitalize' }}>
                    {userProfile?.status || 'Active'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--foreground-dim)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.35rem' }}>
                    Member Since
                  </p>
                  <p style={{ color: '#fff', fontWeight: '600' }}>{memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1rem',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <Users size={24} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
            <h3 style={{ color: '#fff', fontWeight: '600', marginBottom: '0.35rem' }}>Manage Users</h3>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>
              Add, edit, or remove team members
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1rem',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <BarChart3 size={24} style={{ color: '#3b82f6', marginBottom: '0.75rem' }} />
            <h3 style={{ color: '#fff', fontWeight: '600', marginBottom: '0.35rem' }}>Analytics</h3>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>
              View usage and performance metrics
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1rem',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <Settings size={24} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
            <h3 style={{ color: '#fff', fontWeight: '600', marginBottom: '0.35rem' }}>Settings</h3>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>
              Configure organization settings
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          marginTop: '2rem',
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: '1rem',
          padding: '1.5rem',
        }}>
          <p style={{ color: '#3b82f6', fontSize: '0.9rem' }}>
            <strong>Tenant ID:</strong> {tenantId}
          </p>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            This is your unique tenant identifier. Use this when integrating third-party applications.
          </p>
        </div>

      </div>
    </div>
  );
}
