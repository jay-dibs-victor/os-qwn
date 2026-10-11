import React from 'react';
import { Car, Zap, Crown, Sparkles } from 'lucide-react';
import { formatPrice } from '../constants/rideTypes';

const iconMap = {
  Car,
  Zap,
  Crown,
  Sparkles
};

export default function RideOptions({ selectedId, onSelect, rideTypes = [], baseFare = 0 }) {
  if (!rideTypes || rideTypes.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading ride options...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="ride-options-list">
        {rideTypes.map((rt) => {
          const IconComponent = iconMap[rt.icon] || Car;
          const totalPrice = Math.round(baseFare * rt.multiplier);
          const isSelected = selectedId === rt.id;

          return (
            <div
              key={rt.id}
              className={`ride-option-card${isSelected ? ' selected' : ''}`}
              onClick={() => onSelect(rt.id)}
            >
              <div className="ride-option-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComponent size={24} />
              </div>
              <div className="ride-option-info">
                <div className="ride-option-name">{rt.title || rt.name}</div>
                <div className="ride-option-desc">{rt.description}</div>
              </div>
              <div className="ride-option-meta">
                <div className="ride-option-price">{formatPrice(totalPrice)}</div>
                <div className="ride-option-eta">{rt.eta || '5 min'}</div>
                <div className="ride-option-capacity">{rt.capacity || 4} seats</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}