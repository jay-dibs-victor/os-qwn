import { useNotifications } from '../../../core/hooks/useSupportHooks';
import moment from 'moment';
import { Link } from 'react-router-dom';
import Skeleton, { NotificationSkeleton } from '../../../core/components/Skeleton';

const NotificationsContent = () => {
  const { data: notifications = [], isLoading } = useNotifications();

  if (isLoading && notifications.length === 0) return <NotificationSkeleton />;

  return (
    <div style={{ background: '#000000', minHeight: '100vh', padding: '100px 0 60px' }}>
      <div className="container">

        <div className="row mb-4 align-items-end">
          <div className="col-md-8">
            <p style={{ color: '#A1A1AA', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Activity
            </p>
            <h2 style={{ fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>Notifications</h2>
            <p style={{ color: '#A1A1AA', margin: 0 }}>Stay updated with your latest alerts and activities.</p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <button style={{
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.15)',
              color: '#FFFFFF',
              borderRadius: '50px',
              padding: '9px 22px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FFB800'; e.currentTarget.style.color = '#FFB800'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#FFFFFF'; }}
            >
              Mark all as read
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div style={{
              background: '#121212',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div className="spinner-border" style={{ color: '#FFB800' }}></div>
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '16px', opacity: 0.3 }}>🔔</div>
                  <p style={{ color: '#A1A1AA', margin: 0, fontWeight: 500 }}>No new notifications.</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif._id || notif.id}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      padding: '18px 20px',
                      borderRadius: '16px',
                      marginBottom: '4px',
                      background: notif.unread ? 'rgba(255,184,0,0.05)' : 'transparent',
                      border: notif.unread ? '1px solid rgba(255,184,0,0.12)' : '1px solid transparent',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = notif.unread ? 'rgba(255,184,0,0.05)' : 'transparent'; }}
                  >
                    {/* Unread dot */}
                    <div style={{ flexShrink: 0, paddingTop: '6px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: notif.unread ? '#FFB800' : 'rgba(255,255,255,0.15)',
                        boxShadow: notif.unread ? '0 0 8px rgba(255,184,0,0.6)' : 'none',
                      }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <h6 style={{
                          margin: 0,
                          fontWeight: 700,
                          color: '#FFFFFF',
                          fontSize: '0.92rem',
                        }}>
                          {notif.heading || notif.title}
                        </h6>
                        <small style={{ color: '#A1A1AA', fontSize: '0.75rem', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                          {moment(notif.createdAt).fromNow()}
                        </small>
                      </div>
                      <p style={{ margin: 0, color: '#A1A1AA', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NotificationsContent;
