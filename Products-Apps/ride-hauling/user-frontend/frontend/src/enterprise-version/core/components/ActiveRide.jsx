import { useState } from 'react';
import { FaUser, FaStar, FaCheckCircle, FaCircle } from 'react-icons/fa';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function ActiveRide({
  status,
  eta,
  onCancel,
  driver,
}) {
  const [showCancel, setShowCancel] = useState(false);

  const timelineSteps = [
    { key: 'assigned', label: 'Driver assigned', desc: `${driver?.name || 'Chidi'} is on their way` },
    { key: 'arriving', label: 'Driver arriving', desc: 'Your driver is almost at the pickup location' },
    { key: 'en_route', label: 'On the way', desc: 'Heading to your destination' },
  ];

  const currentIdx = timelineSteps.findIndex((s) => s.key === status);

  return (
    <div className="active-ride-panel">
      <div className="active-ride-header">
        <div className="active-ride-status">
          <FaCircle style={{ color: '#22c55e', fontSize: '10px' }} />
          {status === 'assigned' ? 'Driver assigned' : status === 'arriving' ? 'Driver arriving' : 'En route'}
        </div>
        <div className="active-ride-eta">{formatTime(eta)}</div>
        <div className="active-ride-eta-label">until {status === 'en_route' ? 'destination' : 'pickup'}</div>
      </div>

      <div className="driver-card">
        <div className="driver-photo">
          <FaUser />
        </div>
        <div className="driver-info">
          <div className="driver-name">{driver?.name || 'Chidi Okonkwo'}</div>
          <div className="driver-rating">
            <FaStar style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {driver?.rating || '4.92'}
          </div>
          <div className="driver-vehicle">{driver?.vehicle || 'Toyota Camry · ABC 123 XY'}</div>
        </div>
      </div>

      <div className="ride-timeline">
        {timelineSteps.map((step, i) => {
          const isComplete = i < currentIdx;
          const isActive = i === currentIdx;

          return (
            <div key={step.key} className="ride-timeline-item">
              <div className={`ride-timeline-dot${isComplete ? ' completed' : isActive ? ' active' : ' pending'}`}>
                {isComplete && <FaCheckCircle style={{ color: '#22c55e', fontSize: 12, position: 'absolute', top: -2, left: -2 }} />}
              </div>
              <div className="ride-timeline-text">
                <div className="ride-timeline-label">{step.label}</div>
                <div className="ride-timeline-desc">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="cancel-ride-btn" onClick={() => setShowCancel(true)}>
        Cancel ride
      </button>

      {showCancel && (
        <div className="cancel-confirm-overlay">
          <div className="cancel-confirm-card">
            <h3>Cancel ride?</h3>
            <p>You may be charged a cancellation fee. The driver has already been assigned.</p>
            <div className="cancel-confirm-actions">
              <button className="cancel-confirm-yes" onClick={() => { setShowCancel(false); onCancel(); }}>
                Yes, cancel
              </button>
              <button className="cancel-confirm-no" onClick={() => setShowCancel(false)}>
                Keep ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}