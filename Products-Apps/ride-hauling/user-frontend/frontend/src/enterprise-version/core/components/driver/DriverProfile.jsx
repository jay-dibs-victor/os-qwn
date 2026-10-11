import { useState } from 'react';
import { FaUserCircle, FaArrowLeft, FaCar, FaIdCard, FaCheckCircle, FaClock } from 'react-icons/fa';

export default function DriverProfile({ onBack }) {
  const [profile] = useState({
    name: 'Brian Oshinbolu',
    phone: '+234 703 123 4567',
    email: 'brian@example.com',
    memberSince: 'March 2026',
    vehicle: { make: 'Toyota', model: 'Camry', year: '2020', color: 'White', plate: 'ABC 123 XY' },
    totalTrips: 342,
    totalEarnings: 45230,
  });

  const documents = [
    { label: "Driver's License", status: 'verified', expiry: 'Dec 2027' },
    { label: 'Vehicle Registration', status: 'verified', expiry: 'Jun 2027' },
    { label: 'Insurance Certificate', status: 'verified', expiry: 'Mar 2027' },
    { label: 'NIN / Social Security', status: 'verified', expiry: '—' },
  ];

  return (
    <div className="dms-page">
      <div className="dms-header">
        <button className="dms-back-btn" onClick={onBack}><FaArrowLeft /></button>
        <h2 className="dms-title"><FaUserCircle /> Profile</h2>
      </div>

      <div className="dms-profile-card glass-card">
        <div className="dms-profile-avatar"><FaUserCircle size={56} /></div>
        <div className="dms-profile-name">{profile.name}</div>
        <div className="dms-profile-contact">{profile.phone}</div>
        <div className="dms-profile-contact">{profile.email}</div>
        <div className="dms-profile-member"><FaClock /> Member since {profile.memberSince}</div>
      </div>

      <div className="dms-stats-row">
        <div className="dms-stat-card glass-card">
          <div className="dms-stat-label">Trips</div>
          <div className="dms-stat-value">{profile.totalTrips}</div>
        </div>
        <div className="dms-stat-card glass-card">
          <div className="dms-stat-label">Earnings</div>
          <div className="dms-stat-value gold">₦{profile.totalEarnings.toLocaleString()}</div>
        </div>
      </div>

      <div className="dms-section-title">Vehicle</div>
      <div className="dms-detail-list glass-card">
        <div className="dms-detail-row"><span>Make</span><span>{profile.vehicle.make}</span></div>
        <div className="dms-detail-row"><span>Model</span><span>{profile.vehicle.model}</span></div>
        <div className="dms-detail-row"><span>Year</span><span>{profile.vehicle.year}</span></div>
        <div className="dms-detail-row"><span>Colour</span><span>{profile.vehicle.color}</span></div>
        <div className="dms-detail-row"><span>Plate</span><span>{profile.vehicle.plate}</span></div>
      </div>

      <div className="dms-section-title">Documents</div>
      {documents.map((doc, i) => (
        <div key={i} className="dms-doc-row glass-card">
          <div className="dms-doc-icon verified"><FaCheckCircle /></div>
          <div>
            <div className="dms-doc-label">{doc.label}</div>
            <div className="dms-doc-expiry">{doc.status === 'verified' ? 'Verified' : 'Pending'} · Expires {doc.expiry}</div>
          </div>
          <div className="dms-doc-badge verified">Verified</div>
        </div>
      ))}
    </div>
  );
}
