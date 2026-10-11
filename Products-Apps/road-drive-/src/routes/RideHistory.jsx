import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaCar, FaClock } from 'react-icons/fa';
import { useRideHistory } from '../hooks/useRideHistory';
import { PRICE_MAP, formatPrice } from '../constants/rideTypes';

export default function RideHistory() {
  const { history, clearHistory } = useRideHistory();
  const [expandedId, setExpandedId] = useState(null);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (min) => {
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)}h ${min % 60}m`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-black)', color: 'var(--color-white)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <Link to="/ride" style={{ color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <FaArrowLeft /> Back
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Ride History</h1>
          {history.length > 0 && (
            <button onClick={clearHistory} style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: '12px', padding: '6px 12px', backgroundColor: 'transparent', border: '1px solid var(--color-border-gold)', borderRadius: '6px', cursor: 'pointer' }}>
              <FaTrash style={{ marginRight: '4px' }} /> Clear all
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--color-text-muted)' }}>
            <FaCar style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>No trips yet</p>
            <p style={{ fontSize: '14px' }}>Complete a ride and it will appear here</p>
            <Link to="/ride" style={{ display: 'inline-block', marginTop: '24px', padding: '12px 24px', backgroundColor: 'var(--color-gold)', color: 'var(--color-black)', borderRadius: '8px', fontWeight: 600 }}>
              Book a ride
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map((ride) => {
              const isExpanded = expandedId === ride.id;
              const p = PRICE_MAP[ride.rideType] || PRICE_MAP.economy;

              return (
                <div key={ride.id} style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border-gold)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}>
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : ride.id)}
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      backgroundColor: 'rgba(255,184,0,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-gold)', flexShrink: 0,
                    }}>
                      <FaCar />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ride.pickup} → {ride.dropoff}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        <FaClock style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {formatDate(ride.completedAt)} · {formatDuration(ride.duration)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>{formatPrice(p.total)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{ride.rideType}</div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{
                      borderTop: '1px solid var(--color-border-gold)',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      fontSize: '13px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>From</span>
                        <span>{ride.pickup}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>To</span>
                        <span>{ride.dropoff}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Distance</span>
                        <span>{Math.round(ride.distance * 10) / 10} km</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Duration</span>
                        <span>{formatDuration(ride.duration)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Ride type</span>
                        <span style={{ textTransform: 'capitalize' }}>{ride.rideType}</span>
                      </div>
                      {ride.rating > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>Your rating</span>
                          <span style={{ color: 'var(--color-gold)' }}>{'★'.repeat(ride.rating)}{'☆'.repeat(5 - ride.rating)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-gold)', paddingTop: '12px', fontWeight: 700 }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--color-gold)' }}>{formatPrice(p.total)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
