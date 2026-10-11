import { useState } from 'react';
import { FaCog, FaArrowLeft, FaToggleOn, FaToggleOff, FaTrashAlt, FaSignOutAlt, FaInfoCircle, FaUserEdit, FaLock, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function DriverSettings({ onBack }) {
  const [notifications, setNotifications] = useState({ rides: true, earnings: true, promos: false });

  return (
    <div className="dms-page">
      <div className="dms-header">
        <button className="dms-back-btn" onClick={onBack}><FaArrowLeft /></button>
        <h2 className="dms-title"><FaCog /> Settings</h2>
      </div>

      <div className="dms-section-title">Notifications</div>
      <div className="dms-settings-list glass-card">
        {[
          { key: 'rides', label: 'New ride requests' },
          { key: 'earnings', label: 'Earnings updates' },
          { key: 'promos', label: 'Promotions & offers' },
        ].map(item => (
          <div key={item.key} className="dms-setting-row" onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}>
            <span>{item.label}</span>
            <span className="dms-toggle">{notifications[item.key] ? <FaToggleOn className="on" /> : <FaToggleOff />}</span>
          </div>
        ))}
      </div>

      <div className="dms-section-title">Account</div>
      <div className="dms-settings-list glass-card">
        <Link to="/account/personal-info" className="dms-setting-row link">
          <span><FaUserEdit /> Personal info</span>
        </Link>
        <Link to="/account/security" className="dms-setting-row link">
          <span><FaLock /> Security</span>
        </Link>
        <Link to="/account/privacy" className="dms-setting-row link">
          <span><FaShieldAlt /> Privacy & Data</span>
        </Link>
        <button className="dms-setting-row danger">
          <span><FaTrashAlt /> Delete account</span>
        </button>
        <button className="dms-setting-row danger">
          <span><FaSignOutAlt /> Sign out</span>
        </button>
      </div>

      <div className="dms-section-title">About</div>
      <div className="dms-settings-list glass-card">
        <div className="dms-setting-row"><span>App version</span><span className="muted">1.0.0</span></div>
        <div className="dms-setting-row"><span><FaInfoCircle /> Licenses</span></div>
      </div>
    </div>
  );
}
