import { useState } from 'react';
import { FaRoute, FaArrowLeft, FaStar, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaRoad, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const MOCK_TRIPS = [
  { id: 1, date: 'Today, 2:30 PM', pickup: 'Ikeja City Mall', dropoff: 'Victoria Island', fare: 2400, duration: '45 min', distance: '18 km', rating: 5, status: 'Completed' },
  { id: 2, date: 'Today, 1:15 PM', pickup: 'Surulere', dropoff: 'Lekki Phase 1', fare: 3100, duration: '55 min', distance: '22 km', rating: 4, status: 'Completed' },
  { id: 3, date: 'Today, 11:30 AM', pickup: 'Oshodi', dropoff: 'Ajah', fare: 4100, duration: '65 min', distance: '24 km', rating: 5, status: 'Completed' },
  { id: 4, date: 'Yesterday, 8:45 PM', pickup: 'Maryland', dropoff: 'Victoria Island', fare: 3800, duration: '50 min', distance: '20 km', rating: 5, status: 'Completed' },
  { id: 5, date: 'Yesterday, 6:00 PM', pickup: 'Ikeja GRA', dropoff: 'VI Bar Beach', fare: 3500, duration: '48 min', distance: '19 km', rating: 4, status: 'Completed' },
  { id: 6, date: 'Jun 3, 2026', pickup: 'Yaba', dropoff: 'Lekki', fare: 2800, duration: '52 min', distance: '21 km', rating: 3, status: 'Completed' },
];

export default function DriverActivity({ onBack }) {
  const [filter, setFilter] = useState('today');
  const [expandedId, setExpandedId] = useState(null);

  const totalEarnings = MOCK_TRIPS.reduce((s, t) => s + t.fare, 0);
  const totalDistance = MOCK_TRIPS.reduce((s, t) => s + parseInt(t.distance), 0);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="dms-page">
      <div className="dms-header">
        <button className="dms-back-btn" onClick={onBack}><FaArrowLeft /></button>
        <h2 className="dms-title"><FaRoute /> Activity</h2>
      </div>

      <div className="dms-period-tabs">
        {['today', 'week', 'month', 'all'].map(t => (
          <button key={t} className={`dms-period-tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="dms-stats-row">
        <div className="dms-stat-card glass-card">
          <div className="dms-stat-label">Trips</div>
          <div className="dms-stat-value">{MOCK_TRIPS.length}</div>
        </div>
        <div className="dms-stat-card glass-card">
          <div className="dms-stat-label">Earnings</div>
          <div className="dms-stat-value gold">₦{totalEarnings.toLocaleString()}</div>
        </div>
        <div className="dms-stat-card glass-card">
          <div className="dms-stat-label">Distance</div>
          <div className="dms-stat-value">{totalDistance} km</div>
        </div>
      </div>

      <div className="dms-section-title">Trip History</div>
      <div className="dms-trip-list">
        {MOCK_TRIPS.map(trip => (
          <div key={trip.id} className="dms-trip-card glass-card">
            <div className="dms-trip-main" onClick={() => toggleExpand(trip.id)}>
              <div className="dms-trip-top">
                <div className="dms-trip-date">{trip.date}</div>
                <div className={`dms-trip-status ${trip.status.toLowerCase()}`}>{trip.status}</div>
              </div>
              <div className="dms-trip-route">
                <div className="dms-trip-loc">
                  <div className="dms-loc-dot pickup" />
                  <span>{trip.pickup}</span>
                </div>
                <div className="dms-trip-loc">
                  <div className="dms-loc-dot dropoff" />
                  <span>{trip.dropoff}</span>
                </div>
              </div>
              <div className="dms-trip-meta">
                <span><FaMoneyBillWave /> ₦{trip.fare.toLocaleString()}</span>
                <span><FaClock /> {trip.duration}</span>
                <span><FaRoad /> {trip.distance}</span>
                <span><FaStar className="star" /> {trip.rating}</span>
              </div>
              <div className="dms-trip-expand">{expandedId === trip.id ? <FaChevronUp /> : <FaChevronDown />}</div>
            </div>
            {expandedId === trip.id && (
              <div className="dms-trip-detail">
                <div className="dms-detail-row"><span>Base fare</span><span>₦{Math.round(trip.fare * 0.7)}</span></div>
                <div className="dms-detail-row"><span>Distance fee</span><span>₦{Math.round(trip.fare * 0.2)}</span></div>
                <div className="dms-detail-row"><span>Time fee</span><span>₦{Math.round(trip.fare * 0.05)}</span></div>
                <div className="dms-detail-row"><span>Tip</span><span>₦{Math.round(trip.fare * 0.05)}</span></div>
                <div className="dms-detail-row total"><span>Total</span><span>₦{trip.fare.toLocaleString()}</span></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
