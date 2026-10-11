import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { useUIStore } from '../../../core/store/useUIStore';
import Confetti from '../../../core/components/Confetti/Confetti';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../../core/api/apiClient';
import { useUserProfile, useActivityMatrix } from '../../../core/hooks/useProfileHooks';
import { ProfileSkeleton } from '../../../core/components/Skeleton';
import { useTheme } from '../../../core/context/ThemeContext';
import moment from 'moment';
import './Profile.css';

const Profile = () => {
    const { user: authUser } = useAuthStore();
    const { data: userProfile, isLoading: profileLoading } = useUserProfile();
    const { data: activityLogs = [], isLoading: activityLoading } = useActivityMatrix();
    const addToast = useUIStore((state) => state.addToast);
    const { theme, toggleTheme } = useTheme();

    const [formData, setFormData] = useState({
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        phoneNumber: '',
        user_type: 'Individual',
        use_coins_augmentation: false,
    });

    const [avatar, setAvatar] = useState('/assets/images/avatar.png');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [isPasswordSuccess, setIsPasswordSuccess] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    useEffect(() => {
        const u = userProfile || authUser;
        if (u) {
            setFormData({
                username: u.username || '',
                firstname: u.firstname || '',
                lastname: u.lastname || '',
                email: u.email || '',
                phoneNumber: u.phoneNumber || '',
                user_type: u.user_type || 'Individual',
                use_coins_augmentation: u.use_coins_augmentation || false,
            });
            if (u.avatar) setAvatar(u.avatar);
        }
    }, [userProfile, authUser]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id || e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatar(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsPasswordLoading(true);
        try {
            await apiClient.post(`/profile/update/${authUser?.id || authUser?._id}`, formData);
            addToast('Profile updated successfully!', 'success');
        } catch (error) {
            addToast('Failed to update profile preferences', 'danger');
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword.length < 6) {
            addToast('Password must be at least 6 characters', 'warning');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addToast('Passwords do not match', 'danger');
            return;
        }
        setIsPasswordLoading(true);
        try {
            const response = await apiClient.post('/auth/resetpassword/mobile', {
                email: authUser.email,
                password: passwordData.newPassword,
            });
            if (response.data?.status === 'ok' || response.status === 200) {
                setIsPasswordSuccess(true);
                addToast('Password changed successfully!', 'success');
                setTimeout(() => {
                    setIsPasswordSuccess(false);
                    setIsPasswordModalOpen(false);
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                }, 3000);
            }
        } catch (error) {
            addToast(error.response?.data?.msg || error.response?.data?.error || 'Failed to change password', 'danger');
        } finally {
            setIsPasswordLoading(false);
        }
    };

    if ((activityLoading && activityLogs.length === 0) || (profileLoading && !userProfile)) return <ProfileSkeleton />;

    const typeIcon = (type) => {
        if (type === 'ride') return { cls: 'type-ride', icon: 'bi-car-front' };
        if (type === 'payment') return { cls: 'type-payment', icon: 'bi-wallet2' };
        return { cls: 'type-alert', icon: 'bi-shield-exclamation' };
    };

    return (
        <main id="profile" className="profile-page">
            <div className="profile-container">

                {/* ── Page header ─────────────────────────── */}
                <div className="profile-page-header">
                    <ol className="profile-breadcrumb">
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li className="profile-breadcrumb-sep">›</li>
                        <li>Profile Settings</li>
                    </ol>
                    <h1 className="profile-page-title">Profile Details</h1>
                    <p className="profile-page-sub">Manage your account and security settings.</p>
                </div>

                {/* ── Top row: Form + Identity card ─────── */}
                <div className="profile-top-grid">

                    {/* Edit form */}
                    <div className="profile-card">
                        <div className="profile-card-body">
                            <div className="profile-card-header">
                                <h2 className="profile-card-title">Account Information</h2>
                                <span className="profile-verified-badge">
                                    <i className="bi bi-patch-check-fill" /> Verified Profile
                                </span>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Avatar upload */}
                                <div className="profile-avatar-row">
                                    <div className="profile-avatar-wrap">
                                        <motion.img
                                            whileHover={{ scale: 1.04 }}
                                            src={avatar}
                                            alt="Avatar"
                                            className="profile-avatar"
                                        />
                                        <label htmlFor="profile-file-input" className="profile-avatar-edit-btn" title="Change photo">
                                            <i className="bi bi-camera-fill" style={{ fontSize: '13px', color: 'var(--color-text)' }} />
                                            <input
                                                type="file"
                                                id="profile-file-input"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </div>
                                    <div>
                                        <p className="profile-avatar-info-title">Profile Photo</p>
                                        <p className="profile-avatar-info-text">
                                            Your profile is visible to drivers and administrators. Use a clear photo for better trust.
                                        </p>
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="profile-form-grid">
                                    <div className="profile-form-field">
                                        <label className="profile-field-label">Username</label>
                                        <div className="profile-input-wrap">
                                            <span className="profile-input-icon"><i className="bi bi-at" /></span>
                                            <input
                                                type="text"
                                                id="username"
                                                className="profile-input"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-form-field">
                                        <label className="profile-field-label">Account Tier</label>
                                        <div className="profile-input-wrap">
                                            <span className="profile-input-icon"><i className="bi bi-award" /></span>
                                            <select className="profile-select" disabled value={formData.user_type} onChange={() => {}}>
                                                <option value="Individual">Premium Individual</option>
                                                <option value="Corporate">Business Partner</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="profile-form-field">
                                        <label className="profile-field-label">First Name</label>
                                        <div className="profile-input-wrap">
                                            <span className="profile-input-icon"><i className="bi bi-person" /></span>
                                            <input type="text" id="firstname" className="profile-input" value={formData.firstname} onChange={handleChange} required />
                                        </div>
                                    </div>

                                    <div className="profile-form-field">
                                        <label className="profile-field-label">Last Name</label>
                                        <div className="profile-input-wrap">
                                            <span className="profile-input-icon"><i className="bi bi-person" /></span>
                                            <input type="text" id="lastname" className="profile-input" value={formData.lastname} onChange={handleChange} required />
                                        </div>
                                    </div>

                                    <div className="profile-form-field">
                                        <label className="profile-field-label">Email Address</label>
                                        <div className="profile-input-wrap">
                                            <span className="profile-input-icon"><i className="bi bi-envelope" /></span>
                                            <input type="email" id="email" className="profile-input" value={formData.email} onChange={handleChange} required />
                                        </div>
                                    </div>

                                    <div className="profile-form-field">
                                        <label className="profile-field-label">Phone Number</label>
                                        <div className="profile-input-wrap">
                                            <span className="profile-input-icon"><i className="bi bi-phone" /></span>
                                            <input type="tel" id="phoneNumber" className="profile-input" value={formData.phoneNumber} onChange={handleChange} required />
                                        </div>
                                    </div>
                                </div>

                                {/* Security row */}
                                <div className="profile-security-row">
                                    <div>
                                        <p className="profile-security-title">Security Settings</p>
                                        <p className="profile-security-sub">Manage your password and access</p>
                                    </div>
                                    <button
                                        type="button"
                                        id="profile-change-password-btn"
                                        className="profile-btn-outline"
                                        onClick={() => setIsPasswordModalOpen(true)}
                                    >
                                        <i className="bi bi-shield-lock" />
                                        Change Password
                                    </button>
                                </div>

                                {/* Submit */}
                                <div className="profile-form-actions">
                                    <motion.button
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        id="profile-save-btn"
                                        className="profile-btn-primary"
                                    >
                                        <i className="bi bi-cloud-upload" />
                                        Save Changes
                                    </motion.button>
                                    <button type="reset" className="profile-btn-ghost">Discard Changes</button>
                                </div>

                                {/* App Preferences */}
                                <div className="profile-section-divider" style={{ margin: '40px 0 25px', height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                                <div className="profile-preference-section">
                                    <h3 className="profile-card-title m-b-20" style={{ fontSize: '1.1rem' }}>App Preferences</h3>
                                    <div className="profile-toggle-card glass">
                                        <div className="profile-toggle-info">
                                            <div className="profile-toggle-icon-wrap">
                                                <i className="bi bi-moon-stars" style={{ color: '#FFB800' }} />
                                            </div>
                                            <div>
                                                <p className="profile-toggle-title">Dark Mode Theme</p>
                                                <p className="profile-toggle-sub">Switch to the premium dark aesthetic for better visibility at night.</p>
                                            </div>
                                        </div>
                                        <label className="profile-switch">
                                            <input 
                                                type="checkbox" 
                                                checked={theme === 'dark'}
                                                onChange={toggleTheme} 
                                            />
                                            <span className="profile-slider" />
                                        </label>
                                    </div>
                                </div>

                                {/* Payment Preferences */}
                                <div className="profile-section-divider" style={{ margin: '40px 0 25px', height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                                <div className="profile-preference-section">
                                    <h3 className="profile-card-title m-b-20" style={{ fontSize: '1.1rem' }}>Payment Preferences</h3>
                                    <div className="profile-toggle-card glass">
                                        <div className="profile-toggle-info">
                                            <div className="profile-toggle-icon-wrap">
                                                <i className="bi bi-coin" style={{ color: '#FFB800' }} />
                                            </div>
                                            <div>
                                                <p className="profile-toggle-title">Augment with TaxiCoins</p>
                                                <p className="profile-toggle-sub">Use available coins to reduce cash or wallet payments for your trips.</p>
                                            </div>
                                        </div>
                                        <label className="profile-switch">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.use_coins_augmentation}
                                                onChange={(e) => setFormData({ ...formData, use_coins_augmentation: e.target.checked })} 
                                            />
                                            <span className="profile-slider" />
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Identity card */}
                    <div className="profile-identity-card">
                        <div className="profile-identity-glow" />
                        <div className="profile-identity-watermark">USER</div>

                        <div className="profile-identity-topbar">
                            <div className="profile-identity-status">
                                <div className="profile-identity-status-dot" />
                                <span className="profile-identity-status-text">Network Verified</span>
                            </div>
                            <i className="bi bi-fingerprint profile-identity-fingerprint" />
                        </div>

                        <div className="profile-identity-content">
                            <div className="profile-identity-brand">
                                GOTRIP
                                <span className="profile-identity-brand-sub">/ Identity Hub</span>
                            </div>

                            <div className="profile-identity-panel">
                                {/* User row */}
                                <div className="profile-identity-user-row">
                                    <img src={avatar} alt="mini avatar" className="profile-identity-mini-avatar" />
                                    <div>
                                        <span className="profile-identity-user-tag">Primary ID Holder</span>
                                        <div className="profile-identity-user-name">{formData.firstname} {formData.lastname}</div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="profile-identity-stats-grid">
                                    <div>
                                        <span className="profile-identity-stat-label">Global Token</span>
                                        <p className="profile-identity-stat-value">₦52,400</p>
                                    </div>
                                    <div>
                                        <span className="profile-identity-stat-label">Identity Status</span>
                                        <p className="profile-identity-stat-value profile-identity-stat-value--gold">
                                            <i className="bi bi-star-fill me-1" style={{ fontSize: '0.7rem' }} />PRESTIGE
                                        </p>
                                    </div>
                                </div>

                                {/* Referral */}
                                <div className="profile-identity-referral" style={{ marginTop: '14px' }}>
                                    <div>
                                        <span className="profile-identity-referral-label">Referral Code</span>
                                        <p className="profile-identity-referral-code">{authUser?.referral_code || '— — —'}</p>
                                    </div>
                                    <div className="profile-identity-qr">
                                        <i className="bi bi-qr-code" style={{ fontSize: '32px', color: 'var(--color-text)', display: 'block' }} />
                                    </div>
                                </div>
                            </div>

                            <button className="profile-identity-export-btn">
                                <i className="bi bi-cloud-download" />
                                Export Identity Asset
                            </button>
                        </div>
                    </div>

                </div>

                {/* ── Bottom row: Saved Places + Safety ─── */}
                <div className="profile-bottom-grid">

                    {/* Saved Places */}
                    <div className="profile-card">
                        <div className="profile-card-body">
                            <div className="profile-places-header">
                                <h2 className="profile-card-title">Saved Places</h2>
                                <button className="profile-btn-outline" style={{ padding: '7px 14px', fontSize: '0.78rem' }}>Add New</button>
                            </div>
                            <div className="profile-places-list">
                                {[
                                    { icon: 'bi-house-door-fill', bg: 'rgba(33,150,243,0.1)', color: '#1565c0', label: 'Home Address', sub: 'Set your primary residence' },
                                    { icon: 'bi-briefcase-fill', bg: 'rgba(100,100,100,0.08)', color: '#555', label: 'Work Address', sub: 'Set your office location' },
                                    { icon: 'bi-heart-fill', bg: 'rgba(255,59,92,0.1)', color: '#e02020', label: 'Favourite', sub: 'Add a frequently visited place' },
                                ].map((place) => (
                                    <div key={place.label} className="profile-place-row">
                                        <div className="profile-place-left">
                                            <div className="profile-place-icon" style={{ background: place.bg }}>
                                                <i className={`bi ${place.icon}`} style={{ color: place.color }} />
                                            </div>
                                            <div>
                                                <p className="profile-place-title">{place.label}</p>
                                                <p className="profile-place-sub">{place.sub}</p>
                                            </div>
                                        </div>
                                        <button className="profile-place-set-btn">Set</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Safety circle */}
                    <div className="profile-card profile-safety-card">
                        <div className="profile-card-body">
                            <div className="profile-safety-header">
                                <h2 className="profile-safety-title">Safety Circle</h2>
                                <i className="bi bi-shield-check" style={{ color: '#22c55e', fontSize: '1.3rem' }} />
                            </div>
                            <div className="profile-safety-notice">
                                We'll automatically notify these contacts via SMS/Email if you trigger an SOS or experience an unexpected vehicle stop.
                            </div>
                            <button className="profile-safety-add-btn">
                                <i className="bi bi-person-plus-fill" /> Add Trusted Contact
                            </button>
                            <p className="profile-safety-count">0 of 3 trusted contacts added</p>
                        </div>
                    </div>

                </div>

                {/* ── Activity Matrix ──────────────────────── */}
                <div className="profile-card profile-activity-card">
                    <div className="profile-card-body">
                        <div className="profile-activity-header">
                            <div>
                                <h2 className="profile-activity-title">Activity Matrix</h2>
                                <p className="profile-activity-sub">Transparent ledger of your recent interactions.</p>
                            </div>
                            <div className="profile-activity-toolbar">
                                <div className="profile-search-wrap">
                                    <i className="bi bi-search" />
                                    <input type="text" className="profile-search-input" placeholder="Filter activity..." />
                                </div>
                                <button className="profile-icon-btn" title="Filter">
                                    <i className="bi bi-funnel" />
                                </button>
                                <button className="profile-export-btn">
                                    <i className="bi bi-download" /> Export
                                </button>
                            </div>
                        </div>

                        <div className="profile-table-wrap">
                            <table className="profile-table">
                                <thead>
                                    <tr>
                                        <th>Log Reference</th>
                                        <th style={{ textAlign: 'center' }}>Identity</th>
                                        <th>Timestamp</th>
                                        <th>Transaction</th>
                                        <th style={{ textAlign: 'right' }}>State</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activityLoading ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
                                            <div className="spinner-border spinner-border-sm" /> Loading...
                                        </td></tr>
                                    ) : activityLogs.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#bbb' }}>
                                            No activity recorded yet.
                                        </td></tr>
                                    ) : (
                                        activityLogs.map((row, idx) => {
                                            const ti = typeIcon(row.type);
                                            const isSuccess = row.status === 'completed' || row.status === 'success';
                                            return (
                                                <tr key={idx}>
                                                    <td>
                                                        <div className="profile-table-icon-cell">
                                                            <div className={`profile-table-type-icon ${ti.cls}`}>
                                                                <i className={`bi ${ti.icon}`} />
                                                            </div>
                                                            <span className="profile-table-ref">{row.id || `#${idx + 1000}`}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <img src={avatar} className="profile-table-mini-avatar" alt="mini" />
                                                    </td>
                                                    <td style={{ color: '#aaa', fontSize: '0.82rem' }}>{moment(row.createdAt).fromNow()}</td>
                                                    <td>
                                                        <div className="profile-table-action-title">{row.action || (row.type || 'activity').toUpperCase()}</div>
                                                        <div className="profile-table-action-amount">{row.amount ? `₦${parseFloat(row.amount).toLocaleString()}` : '—'}</div>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <span className={`profile-status-pill ${isSuccess ? 'pill-success' : 'pill-warning'}`}>
                                                            {(row.status || 'PROCESSED').toUpperCase()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="profile-pagination">
                            <span className="profile-pagination-info">Showing {Math.min(activityLogs.length, 10)} of {activityLogs.length} records</span>
                            <div className="profile-pagination-btns">
                                <button className="profile-page-btn profile-page-btn--text" disabled>PREV</button>
                                <button className="profile-page-btn profile-page-btn--active">1</button>
                                <button className="profile-page-btn">2</button>
                                <button className="profile-page-btn">3</button>
                                <button className="profile-page-btn profile-page-btn--text">NEXT</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* ── Change Password Modal ─────────────────── */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <motion.div
                        className="profile-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => e.target === e.currentTarget && setIsPasswordModalOpen(false)}
                    >
                        <Confetti isAnimating={isPasswordSuccess} />
                        <motion.div
                            className="profile-modal-card"
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                        >
                            <button className="profile-modal-close" onClick={() => setIsPasswordModalOpen(false)}>
                                <i className="bi bi-x-lg" />
                            </button>

                            <div className="profile-modal-icon-wrap">
                                <i className="bi bi-shield-lock-fill" />
                            </div>
                            <h3 className="profile-modal-title">Change Password</h3>
                            <p className="profile-modal-sub">Enter your current and new password below.</p>

                            <form onSubmit={handlePasswordSubmit}>
                                <div className="profile-float-field">
                                    <input
                                        type="password"
                                        id="oldPassword"
                                        required
                                        className="profile-float-input"
                                        placeholder=" "
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                    />
                                    <label className="profile-float-label" htmlFor="oldPassword">Current Password</label>
                                </div>
                                <div className="profile-float-field">
                                    <input
                                        type="password"
                                        id="newPassword"
                                        required
                                        className="profile-float-input"
                                        placeholder=" "
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                    <label className="profile-float-label" htmlFor="newPassword">New Password</label>
                                </div>
                                <div className="profile-float-field">
                                    <input
                                        type="password"
                                        id="confirmPasswordModal"
                                        required
                                        className="profile-float-input"
                                        placeholder=" "
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                    <label className="profile-float-label" htmlFor="confirmPasswordModal">Confirm New Password</label>
                                </div>

                                <button
                                    type="submit"
                                    id="profile-password-submit"
                                    className="profile-modal-submit"
                                    disabled={isPasswordLoading}
                                >
                                    {isPasswordLoading ? 'Updating…' : isPasswordSuccess ? '✓ Password Updated!' : 'Update Password'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
};

export default Profile;
