import { RIDE_TYPES, formatPrice } from '../constants/rideTypes';

export default function RideOptions({ selectedId, onSelect, estimatedKm }) {
  const distance = estimatedKm || 6;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="ride-options-list">
        {RIDE_TYPES.map((rt) => {
          const Icon = rt.icon;
          const totalPrice = rt.basePrice + Math.round(rt.perKm * distance);
          const isSelected = selectedId === rt.id;

          return (
            <div
              key={rt.id}
              className={`ride-option-card${isSelected ? ' selected' : ''}`}
              onClick={() => onSelect(rt.id)}
            >
              <div className="ride-option-icon">
                <Icon />
              </div>
              <div className="ride-option-info">
                <div className="ride-option-name">{rt.name}</div>
                <div className="ride-option-desc">{rt.description}</div>
              </div>
              <div className="ride-option-meta">
                <div className="ride-option-price">{formatPrice(totalPrice)}</div>
                <div className="ride-option-eta">{rt.eta}</div>
                <div className="ride-option-capacity">{rt.capacity} seats</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
