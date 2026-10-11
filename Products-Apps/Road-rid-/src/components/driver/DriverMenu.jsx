import { Link, useLocation } from 'react-router-dom';
import { FaWallet, FaRoute, FaStar, FaUserCircle, FaMoneyBillWave, FaHeadset, FaCog, FaUserEdit, FaLock, FaShieldAlt } from 'react-icons/fa';

const DRIVER_MENU_ITEMS = [
  { icon: FaWallet, label: 'Wallet', path: '/drive/wallet' },
  { icon: FaRoute, label: 'Activity', path: '/drive/activity' },
  { icon: FaStar, label: 'Ratings', path: '/drive/ratings' },
  { icon: FaUserCircle, label: 'Profile', path: '/drive/profile' },
  { icon: FaMoneyBillWave, label: 'Earnings', path: '/drive/earnings' },
  { icon: FaHeadset, label: 'Help', path: '/drive/help' },
  { icon: FaCog, label: 'Settings', path: '/drive/settings' },
];

const ACCOUNT_ITEMS = [
  { icon: FaUserEdit, label: 'Personal info', path: '/account/personal-info' },
  { icon: FaLock, label: 'Security', path: '/account/security' },
  { icon: FaShieldAlt, label: 'Privacy & Data', path: '/account/privacy' },
];

export default function DriverMenu({ onNavigate }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="driver-menu-dropdown">
      <div className="driver-menu-header">
        <FaUserCircle size={22} />
        <span>Driver dashboard</span>
      </div>
      <div className="driver-menu-grid">
        {DRIVER_MENU_ITEMS.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`driver-menu-item ${isActive(path) ? 'active' : ''}`}
            onClick={onNavigate}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </div>
      <div className="driver-menu-divider" />
      <div className="driver-menu-section-label">Account</div>
      <div className="driver-menu-grid">
        {ACCOUNT_ITEMS.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className="driver-menu-item"
            onClick={onNavigate}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
