import { useState } from 'react';
import { FaTimes, FaChevronRight, FaChevronDown, FaShieldAlt, FaTrashAlt, FaClock, FaLaptop, FaMobileAlt, FaGlobeAfrica, FaEnvelope, FaPhone, FaKey, FaQrcode, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/* ---------- Reusable Sub-components ---------- */

function SecurityRow({ label, status, statusType, onClick, icon }) {
  const statusColors = {
    success: 'var(--color-gold)',
    warning: '#f0ad4e',
    muted: 'var(--color-text-muted)',
    danger: '#e74c3c',
  };
  return (
    <div
      onClick={onClick}
      style={{
        padding: '20px 0',
        borderBottom: '1px solid var(--color-border-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
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
      <FaChevronRight style={{ color: 'var(--color-text-muted)', fontSize: '12px' }} />
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

function SecurityModal({ title, children, onClose }) {
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

function Input({ label, type = 'text', value, onChange, placeholder, hint }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '14px 16px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--color-border-gold)',
          borderRadius: '8px',
          color: 'var(--color-white)',
          fontSize: '15px',
          outline: 'none',
        }}
      />
      {hint && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>{hint}</div>}
    </div>
  );
}

function toast() {
  // placeholder — inline toast rendered inside page
}

/* ---------- Main Component ---------- */

export default function AccountSecurity() {
  const [activeModal, setActiveModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const navigate = useNavigate();

  // --- State ---
  const [passkeysStatus, setPasskeysStatus] = useState('Not set up');
  const [passwordLastUpdated] = useState('3 months ago');
  const [authAppStatus, setAuthAppStatus] = useState('Not configured');
  const [twoStepEnabled, setTwoStepEnabled] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('Not set');
  const [recoveryPhone, setRecoveryPhone] = useState('Not set');

  // Delete account flow
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Recovery Email form
  const [recoveryEmailInput, setRecoveryEmailInput] = useState('');

  // Recovery Phone form
  const [recoveryPhoneInput, setRecoveryPhoneInput] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const closeModal = () => {
    setActiveModal(null);
    setDeleteStep(0);
    setDeleteConfirmText('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setRecoveryEmailInput('');
    setRecoveryPhoneInput('');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <button onClick={() => navigate('/account')} style={{ background: 'transparent', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>
          <FaArrowLeft />
        </button>
        <h2 style={{ fontSize: '28px', fontWeight: '700' }}>Security</h2>
      </div>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '32px' }}>Manage your account security settings</p>

      {/* ===== LOGGING IN ===== */}
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Logging in</h3>
      <SecurityRow
        label="Passkeys"
        status={<StatusBadge text={passkeysStatus} type="muted" />}
        icon={<FaKey />}
        onClick={() => setActiveModal('passkeys')}
      />
      <SecurityRow
        label="Password"
        status={`Last updated ${passwordLastUpdated}`}
        statusType="muted"
        icon={<FaShieldAlt />}
        onClick={() => setActiveModal('password')}
      />
      <SecurityRow
        label="Authenticator app"
        status={<StatusBadge text={authAppStatus} type="muted" />}
        icon={<FaQrcode />}
        onClick={() => setActiveModal('authApp')}
      />
      <div style={{ padding: '20px 0', borderBottom: '1px solid var(--color-border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'var(--color-gold)', fontSize: '18px', width: '24px', textAlign: 'center' }}><FaShieldAlt /></span>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '500' }}>2-step verification</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              <span style={{ color: twoStepEnabled ? 'var(--color-gold)' : 'var(--color-text-muted)' }}>
                {twoStepEnabled ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        </div>
        <ToggleSwitch checked={twoStepEnabled} onChange={() => {
          if (!twoStepEnabled) {
            setActiveModal('twoStepConfirm');
          } else {
            setTwoStepEnabled(false);
            showToast('2-step verification turned off');
          }
        }} />
      </div>

      {/* ===== ACCOUNT ACTIVITY ===== */}
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', marginTop: '40px' }}>Account Activity</h3>
      <SecurityRow
        label="Where you're logged in"
        status="3 active sessions"
        statusType="muted"
        icon={<FaLaptop />}
        onClick={() => setActiveModal('sessions')}
      />
      <SecurityRow
        label="Recent activity"
        status="View last 30 days"
        statusType="muted"
        icon={<FaClock />}
        onClick={() => setActiveModal('activity')}
      />

      {/* ===== ACCOUNT RECOVERY ===== */}
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px', marginTop: '40px' }}>Account Recovery</h3>
      <SecurityRow
        label="Recovery email"
        status={recoveryEmail}
        statusType={recoveryEmail === 'Not set' ? 'muted' : 'success'}
        icon={<FaEnvelope />}
        onClick={() => { setRecoveryEmailInput(recoveryEmail === 'Not set' ? '' : recoveryEmail); setActiveModal('recoveryEmail'); }}
      />
      <SecurityRow
        label="Recovery phone"
        status={recoveryPhone}
        statusType={recoveryPhone === 'Not set' ? 'muted' : 'success'}
        icon={<FaPhone />}
        onClick={() => { setRecoveryPhoneInput(recoveryPhone === 'Not set' ? '' : recoveryPhone); setActiveModal('recoveryPhone'); }}
      />

      {/* ===== DELETE ACCOUNT ===== */}
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--color-border-gold)' }}>
        <button
          onClick={() => setActiveModal('deleteAccount')}
          style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}
        >
          <FaTrashAlt /> Delete Account
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
          animation: 'toastSlideUp 300ms ease-out',
        }}>
          {toastMsg}
        </div>
      )}

      {/* ===== MODALS ===== */}

      {/* Passkeys Modal */}
      {activeModal === 'passkeys' && (
        <SecurityModal title="Passkeys" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Passkeys are a simple and secure way to sign in using your device's biometrics (fingerprint or face recognition) or PIN. No more passwords to remember.
          </p>
          <div style={{ textAlign: 'center', padding: '32px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '24px', border: '1px dashed var(--color-border-gold)' }}>
            <FaKey style={{ fontSize: '48px', color: 'var(--color-gold)', marginBottom: '16px' }} />
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>Create a passkey</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Use your device's biometrics for quick sign-in</div>
          </div>
          <button
            onClick={() => { setPasskeysStatus('Set up'); closeModal(); showToast('Passkey created successfully'); }}
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}
          >
            Set up passkey
          </button>
        </SecurityModal>
      )}

      {/* Password Modal */}
      {activeModal === 'password' && (
        <SecurityModal title="Change password" onClose={closeModal}>
          <Input label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
          <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" hint="Must be at least 8 characters" />
          <Input label="Confirm new password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border-gold)', background: 'transparent', color: 'var(--color-white)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
            <button onClick={() => {
              if (!currentPassword || !newPassword || newPassword !== confirmPassword) return;
              closeModal(); showToast('Password updated successfully');
            }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', cursor: 'pointer', fontWeight: '600' }}>Save</button>
          </div>
        </SecurityModal>
      )}

      {/* Authenticator App Modal */}
      {activeModal === 'authApp' && (
        <SecurityModal title="Set up authenticator app" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Use an authenticator app like Google Authenticator or Authy to generate one-time codes for sign-in.
          </p>
          <div style={{ textAlign: 'center', padding: '32px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '24px', border: '1px dashed var(--color-border-gold)' }}>
            <div style={{ width: '120px', height: '120px', margin: '0 auto 16px', backgroundColor: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaQrcode style={{ fontSize: '64px', color: '#000' }} />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', wordBreak: 'break-all', fontFamily: 'monospace', padding: '8px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
              QW45-KL89-MN23-AB67
            </div>
          </div>
          <Input label="Enter code from app" placeholder="000 000" />
          <button
            onClick={() => { setAuthAppStatus('Configured'); closeModal(); showToast('Authenticator app connected'); }}
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}
          >
            Verify & connect
          </button>
        </SecurityModal>
      )}

      {/* 2-step verification confirmation */}
      {activeModal === 'twoStepConfirm' && (
        <SecurityModal title="Enable 2-step verification?" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Two-step verification adds an extra layer of security to your account. You'll need a verification code in addition to your password.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border-gold)', background: 'transparent', color: 'var(--color-white)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
            <button onClick={() => { setTwoStepEnabled(true); closeModal(); showToast('2-step verification enabled'); }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', cursor: 'pointer', fontWeight: '600' }}>Enable</button>
          </div>
        </SecurityModal>
      )}

      {/* Sessions Modal */}
      {activeModal === 'sessions' && (
        <SecurityModal title="Where you're logged in" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '20px' }}>These are the devices currently signed in to your account.</p>
          {[
            { device: 'iPhone 15 Pro', location: 'Lagos, Nigeria', time: 'Active now', icon: <FaMobileAlt />, current: true },
            { device: 'Windows PC — Chrome', location: 'Lagos, Nigeria', time: '2 hours ago', icon: <FaLaptop /> },
            { device: 'Samsung Galaxy S24', location: 'Abuja, Nigeria', time: '3 days ago', icon: <FaMobileAlt /> },
          ].map((s, i) => (
            <div key={i} style={{ padding: '16px', marginBottom: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: s.current ? '1px solid var(--color-gold)' : '1px solid var(--color-border-gold)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px', color: 'var(--color-gold)' }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{s.device} {s.current && <StatusBadge text="Current" type="success" />}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{s.location} · {s.time}</div>
                </div>
                {!s.current && (
                  <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e74c3c', background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </SecurityModal>
      )}

      {/* Recent Activity Modal */}
      {activeModal === 'activity' && (
        <SecurityModal title="Recent activity" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '20px' }}>Security events from the last 30 days.</p>
          {[
            { event: 'Login', detail: 'iPhone 15 Pro · Lagos, Nigeria', time: 'Just now', icon: <FaMobileAlt />, success: true },
            { event: 'Login', detail: 'Windows PC · Lagos, Nigeria', time: '2 hours ago', icon: <FaLaptop />, success: true },
            { event: 'Password changed', detail: 'From Windows PC · Lagos, Nigeria', time: '3 months ago', icon: <FaKey />, success: true },
          ].map((a, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: i < 2 ? '1px solid var(--color-border-gold)' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: a.success ? 'rgba(255,184,0,0.1)' : 'rgba(231,76,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.success ? 'var(--color-gold)' : '#e74c3c', fontSize: '16px' }}>
                {a.success ? <FaCheckCircle /> : <FaExclamationTriangle />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{a.event}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{a.detail}</div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{a.time}</div>
            </div>
          ))}
        </SecurityModal>
      )}

      {/* Recovery Email Modal */}
      {activeModal === 'recoveryEmail' && (
        <SecurityModal title="Recovery email" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            A recovery email helps you regain access if you're locked out of your account.
          </p>
          <Input label="Recovery email address" type="email" value={recoveryEmailInput} onChange={(e) => setRecoveryEmailInput(e.target.value)} placeholder="your.email@example.com" />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border-gold)', background: 'transparent', color: 'var(--color-white)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
            <button onClick={() => {
              if (!recoveryEmailInput) return;
              setRecoveryEmail(recoveryEmailInput); closeModal(); showToast('Recovery email updated');
            }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', cursor: 'pointer', fontWeight: '600' }}>Save</button>
          </div>
        </SecurityModal>
      )}

      {/* Recovery Phone Modal */}
      {activeModal === 'recoveryPhone' && (
        <SecurityModal title="Recovery phone" onClose={closeModal}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            Add a recovery phone number to receive codes via SMS if you lose access to your account.
          </p>
          <Input label="Recovery phone number" type="tel" value={recoveryPhoneInput} onChange={(e) => setRecoveryPhoneInput(e.target.value)} placeholder="+234 800 000 0000" />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border-gold)', background: 'transparent', color: 'var(--color-white)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
            <button onClick={() => {
              if (!recoveryPhoneInput) return;
              setRecoveryPhone(recoveryPhoneInput); closeModal(); showToast('Recovery phone updated');
            }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', cursor: 'pointer', fontWeight: '600' }}>Save</button>
          </div>
        </SecurityModal>
      )}

      {/* Delete Account Multi-step Modal */}
      {activeModal === 'deleteAccount' && (
        <SecurityModal title={deleteStep === 0 ? 'Delete Account' : deleteStep === 1 ? 'Confirm Deletion' : 'Final Step'} onClose={closeModal}>
          {deleteStep === 0 && (
            <>
              <div style={{ textAlign: 'center', padding: '16px', marginBottom: '24px' }}>
                <FaExclamationTriangle style={{ fontSize: '48px', color: '#e74c3c', marginBottom: '16px' }} />
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                  This action is irreversible. Deleting your account will permanently remove your profile, trip history, payment methods, and all associated data.
                </p>
              </div>
              <button onClick={() => setDeleteStep(1)} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#e74c3c', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}>
                Continue with deletion
              </button>
            </>
          )}
          {deleteStep === 1 && (
            <>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                Type <strong style={{ color: '#e74c3c' }}>DELETE</strong> below to confirm you want to permanently remove your account.
              </p>
              <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE to confirm" />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border-gold)', background: 'transparent', color: 'var(--color-white)', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                <button onClick={() => {
                  if (deleteConfirmText !== 'DELETE') return;
                  setDeleteStep(2);
                }} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: deleteConfirmText === 'DELETE' ? '#e74c3c' : 'rgba(231,76,60,0.3)', color: deleteConfirmText === 'DELETE' ? '#fff' : 'rgba(255,255,255,0.4)', cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed', fontWeight: '600' }}>
                  Confirm delete
                </button>
              </div>
            </>
          )}
          {deleteStep === 2 && (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <FaCheckCircle style={{ fontSize: '48px', color: '#e74c3c', marginBottom: '16px' }} />
              <p style={{ color: 'var(--color-white)', fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>Account deletion requested</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                Your account will be permanently deleted within 30 days. You will receive a confirmation email.
              </p>
              <button onClick={closeModal} style={{ padding: '12px 32px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', fontWeight: '600', cursor: 'pointer' }}>
                Done
              </button>
            </div>
          )}
        </SecurityModal>
      )}

      <style>{`
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
