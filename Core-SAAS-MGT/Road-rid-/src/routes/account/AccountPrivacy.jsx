import { useState } from 'react';
import { FaTimes, FaChevronRight, FaMapMarkerAlt, FaUserFriends, FaDownload, FaDatabase, FaClock, FaEnvelope, FaSms, FaBell, FaLink, FaShareAlt, FaFileAlt, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaGlobe, FaBullseye, FaFlask, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/* ---------- Reusable Sub-components ---------- */

function PrivacyRow({ label, status, statusType, onClick, icon, toggle, checked, onToggle }) {
  const statusColors = {
    success: 'var(--color-gold)',
    warning: '#f0ad4e',
    muted: 'var(--color-text-muted)',
    danger: '#e74c3c',
  };
  return (
    <div
      onClick={!toggle ? onClick : undefined}
      style={{
        padding: '20px 0',
        borderBottom: '1px solid var(--color-border-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: toggle ? 'default' : 'pointer',
        transition: 'background-color 150ms',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {icon && <span style={{ color: 'var(--color-gold)', fontSize: '18px', width: '24px', textAlign: 'center' }}>{icon}</span>}
        <div>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>{label}</div>
          {status && (
            <div style={{ fontSize: '13px', color: statusColors[statusType] || 'var(--color-text-muted)', marginTop: '4px' }}>{status}</div>
          )}
        </div>
      </div>
      {toggle ? (
        <ToggleSwitch checked={checked} onChange={onToggle} />
      ) : (
        <FaChevronRight style={{ color: 'var(--color-text-muted)', fontSize: '12px' }} />
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: '48px', height: '26px',
        borderRadius: '13px',
        backgroundColor: checked ? 'var(--color-gold)' : 'rgba(255,255,255,0.15)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 200ms',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '22px', height: '22px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          position: 'absolute',
          top: '2px',
          left: checked ? '24px' : '2px',
          transition: 'left 200ms',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

function StatusBadge({ text, type }) {
  const colors = {
    success: { bg: 'rgba(255,184,0,0.12)', text: 'var(--color-gold)' },
    warning: { bg: 'rgba(240,173,78,0.12)', text: '#f0ad4e' },
    muted: { bg: 'rgba(255,255,255,0.06)', text: 'var(--color-text-muted)' },
    danger: { bg: 'rgba(231,76,60,0.12)', text: '#e74c3c' },
  };
  const c = colors[type] || colors.muted;
  return (
    <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '999px', backgroundColor: c.bg, color: c.text }}>
      {text}
    </span>
  );
}

function PrivacyModal({ title, children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border-gold)',
          borderRadius: '12px',
          padding: '32px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '20px', padding: '4px' }}>
            <FaTimes />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 16px',
            backgroundColor: value === opt.value ? 'rgba(255,184,0,0.08)' : 'rgba(255,255,255,0.03)',
            border: value === opt.value ? '1px solid var(--color-gold)' : '1px solid var(--color-border-gold)',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 150ms',
          }}
        >
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            border: value === opt.value ? '6px solid var(--color-gold)' : '2px solid var(--color-text-muted)',
            transition: 'all 150ms',
            flexShrink: 0,
          }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-white)' }}>{opt.label}</div>
            {opt.desc && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{opt.desc}</div>}
          </div>
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ progress }) {
  return (
    <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
      <div style={{
        width: `${progress}%`, height: '100%',
        backgroundColor: 'var(--color-gold)',
        borderRadius: '4px',
        transition: 'width 500ms ease-out',
      }} />
    </div>
  );
}

/* ---------- Main Component ---------- */

export default function AccountPrivacy() {
  const [activeModal, setActiveModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const navigate = useNavigate();

  // Privacy Controls
  const [locationSharing, setLocationSharing] = useState(true);
  const [rideStatus, setRideStatus] = useState('always');
  const [personalizedRecs, setPersonalizedRecs] = useState(true);
  const [dataResearch, setDataResearch] = useState(false);

  // Communication
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  // Third-party
  const [partnerSharing, setPartnerSharing] = useState(false);
  const [connectedApps] = useState([
    { name: 'Google Maps', icon: <FaGlobe />, connected: '2 months ago' },
    { name: 'Spotify', icon: <FaBullseye />, connected: '5 months ago' },
  ]);

  // Download progress
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const closeModal = () => {
    setActiveModal(null);
    setDownloadProgress(0);
    setDownloading(false);
  };

  const handleDownload = () => {
    setDownloading(true);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloading(false);
          showToast('Data export ready for download');
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 600);
  };

  const rideStatusOptions = [
    { value: 'always', label: 'Always', desc: 'Share your ride status with trusted contacts by default' },
    { value: 'riding', label: 'Only while riding', desc: 'Only share status when you\'re on an active trip' },
    { value: 'never', label: 'Never', desc: 'Don\'t share ride status with anyone' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <button onClick={() => navigate('/account')} style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>
          <FaArrowLeft />
        </button>
        <h2 style={{ fontSize: '28px', fontWeight: '700' }}>Privacy & Data</h2>
      </div>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '32px' }}>Control your privacy settings and manage your data</p>

      {/* ===== PRIVACY CONTROLS ===== */}
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Privacy Controls</h3>
      <PrivacyRow
        label="Location sharing"
        status={locationSharing ? 'Enabled' : 'Disabled'}
        statusType={locationSharing ? 'success' : 'muted'}
        icon={<FaMapMarkerAlt />}
        toggle
        checked={locationSharing}
        onToggle={() => setLocationSharing(!locationSharing)}
      />
      <PrivacyRow
        label="Share ride status"
        status={rideStatus === 'always' ? 'Always' : rideStatus === 'riding' ? 'Only while riding' : 'Never'}
        statusType="muted"
        icon={<FaUserFriends />}
        onClick={() => setActiveModal('rideStatus')}
      />
      <PrivacyRow
        label="Personalized recommendations"
        icon={<FaBullseye />}
        toggle
        checked={personalizedRecs}
        onToggle={() => setPersonalizedRecs(!personalizedRecs)}
      />
      <PrivacyRow
        label="Data sharing for research"
        icon={<FaFlask />}
        toggle
        checked={dataResearch}
        onToggle={() => setDataResearch(!dataResearch)}
      />

      {/* ===== YOUR DATA ===== */}
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', marginTop: '40px' }}>Your Data</h3>
      <PrivacyRow
        label="Download your data"
        status="Request a copy of your data"
        statusType="muted"
        icon={<FaDownload />}
        onClick={() => setActiveModal('download')}
      />
      <PrivacyRow
        label="View your data"
        status="See what data we collect"
        statusType="muted"
        icon={<FaDatabase />}
        onClick={() => setActiveModal('viewData')}
      />
      <PrivacyRow
        label="Data retention"
        status="How long we keep your data"
        statusType="muted"
        icon={<FaClock />}
        onClick={() => setActiveModal('retention')}
      />

      {/* ===== COMMUNICATION PREFERENCES ===== */}
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', marginTop: '40px' }}>Communication Preferences</h3>
      <PrivacyRow label="Email notifications" icon={<FaEnvelope />} toggle checked={emailNotifs} onToggle={() => setEmailNotifs(!emailNotifs)} />
      <PrivacyRow label="SMS notifications" icon={<FaSms />} toggle checked={smsNotifs} onToggle={() => setSmsNotifs(!smsNotifs)} />
      <PrivacyRow label="Push notifications" icon={<FaBell />} toggle checked={pushNotifs} onToggle={() => setPushNotifs(!pushNotifs)} />

      {/* ===== THIRD-PARTY INTEGRATIONS ===== */}
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', marginTop: '40px' }}>Third-Party Integrations</h3>
      <PrivacyRow
        label="Connected apps"
        status={`${connectedApps.length} app${connectedApps.length !== 1 ? 's' : ''} connected`}
        statusType="muted"
        icon={<FaLink />}
        onClick={() => setActiveModal('connectedApps')}
      />
      <PrivacyRow
        label="Share data with partners"
        icon={<FaShareAlt />}
        toggle
        checked={partnerSharing}
        onToggle={() => setPartnerSharing(!partnerSharing)}
      />

      {/* ===== PRIVACY POLICY ===== */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--color-border-gold)' }}>
        <button
          onClick={() => setActiveModal('policy')}
          style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}
        >
          <FaFileAlt /> Privacy Policy & Terms
        </button>
      </div>

      {/* ===== TOAST ===== */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-gold)',
          borderRadius: '8px', padding: '12px 24px',
          color: 'var(--color-gold)', fontWeight: '600', fontSize: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 2000,
          animation: 'privacyToastSlideUp 300ms ease-out',
        }}>
          {toastMsg}
        </div>
      )}

      {/* ===== MODALS ===== */}

      {/* Share Ride Status Modal */}
      {activeModal === 'rideStatus' && (
        <PrivacyModal title="Share ride status" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Choose when your trusted contacts can see your ride status and location.
          </p>
          <RadioGroup options={rideStatusOptions} value={rideStatus} onChange={setRideStatus} />
          <button onClick={() => { closeModal(); showToast('Ride status preference updated'); }} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}>
            Save preference
          </button>
        </PrivacyModal>
      )}

      {/* Download Data Modal */}
      {activeModal === 'download' && (
        <PrivacyModal title="Download your data" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Request a copy of your Queens OS data. This includes your profile, trip history, payments, and communications. We'll prepare a downloadable ZIP file for you.
          </p>
          <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed var(--color-border-gold)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <FaDownload style={{ fontSize: '24px', color: 'var(--color-gold)' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Your data package</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Includes profile, trips, payments, and more</div>
              </div>
            </div>
            {downloading && (
              <>
                <ProgressBar progress={downloadProgress} />
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'right' }}>{downloadProgress}%</div>
              </>
            )}
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
              backgroundColor: downloading ? 'rgba(255,184,0,0.3)' : 'var(--color-gold)',
              color: 'var(--color-black)', fontWeight: '600', cursor: downloading ? 'not-allowed' : 'pointer', fontSize: '16px',
            }}
          >
            {downloading ? 'Preparing data...' : 'Request data export'}
          </button>
        </PrivacyModal>
      )}

      {/* View Data Modal */}
      {activeModal === 'viewData' && (
        <PrivacyModal title="What data we collect" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '20px' }}>
            We collect the following categories of data to provide and improve our services:
          </p>
          {[
            { icon: <FaUserFriends />, title: 'Profile Information', desc: 'Name, email, phone number, profile photo' },
            { icon: <FaMapMarkerAlt />, title: 'Trip Data', desc: 'Pickup/dropoff locations, routes, trip history' },
            { icon: <FaDatabase />, title: 'Payment Information', desc: 'Payment methods, transaction history, receipts' },
            { icon: <FaBell />, title: 'Device & Usage', desc: 'Device model, app version, feature interactions' },
            { icon: <FaMapMarkerAlt />, title: 'Location Data', desc: 'Real-time location while using the app' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: i < 4 ? '1px solid var(--color-border-gold)' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--color-gold)', fontSize: '18px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </PrivacyModal>
      )}

      {/* Data Retention Modal */}
      {activeModal === 'retention' && (
        <PrivacyModal title="Data retention" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            We retain your data for as long as your account is active. Here's our retention timeline:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Active account</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>All data retained while account is active</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f0ad4e', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>After account deletion</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Data retained for 30 days (grace period)</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e74c3c', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Permanent deletion</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>All data permanently removed after 30 days</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--color-border-gold)' }}>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Certain data may be retained longer where required by law (e.g., tax records, regulatory compliance).
            </div>
          </div>
        </PrivacyModal>
      )}

      {/* Connected Apps Modal */}
      {activeModal === 'connectedApps' && (
        <PrivacyModal title="Connected apps" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '20px' }}>
            Apps and services you've connected to your Queens OS account.
          </p>
          {connectedApps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
              <FaLink style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.4 }} />
              <div style={{ fontSize: '14px' }}>No connected apps</div>
            </div>
          ) : (
            connectedApps.map((app, i) => (
              <div key={i} style={{ padding: '16px', marginBottom: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--color-border-gold)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px', color: 'var(--color-gold)', width: '32px', textAlign: 'center' }}>{app.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{app.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Connected {app.connected}</div>
                  </div>
                  <button
                    onClick={() => showToast(`${app.name} disconnected`)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </PrivacyModal>
      )}

      {/* Privacy Policy Modal */}
      {activeModal === 'policy' && (
        <PrivacyModal title="Privacy Policy & Terms" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Read our policies to understand how we handle your data and what terms govern your use of Queens OS.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => showToast('Opening Privacy Policy')}
              style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}
            >
              <FaFileAlt style={{ color: 'var(--color-gold)', fontSize: '18px' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-white)' }}>Privacy Policy</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>How we collect, use, and protect your data</div>
              </div>
            </button>
            <button
              onClick={() => showToast('Opening Terms of Service')}
              style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-gold)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}
            >
              <FaFileAlt style={{ color: 'var(--color-gold)', fontSize: '18px' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-white)' }}>Terms of Service</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Rules and guidelines for using Queens OS</div>
              </div>
            </button>
          </div>
        </PrivacyModal>
      )}

      <style>{`
        @keyframes privacyToastSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
