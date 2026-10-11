import { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaCrosshairs, FaClock, FaExclamationTriangle, FaSpinner, FaSearch, FaBuilding, FaHome, FaRoad, FaCheckCircle } from 'react-icons/fa';
import { searchLocations } from '../services/geocode.js';

const SAVED_PLACES = [
  { name: 'Home', address: '742 Evergreen Terrace', coords: [37.7749, -122.4194] },
  { name: 'Work', address: '100 Pine Street', coords: [37.7891, -122.4014] },
  { name: 'Airport', address: 'International Airport Terminal 2', coords: [37.6213, -122.3790] },
];

function getTypeIcon(type) {
  switch (type) {
    case 'building': case 'amenity': return <FaBuilding />;
    case 'highway': case 'road': return <FaRoad />;
    case 'house': case 'residential': return <FaHome />;
    default: return <FaMapMarkerAlt />;
  }
}

export default function BookingForm({
  pickup, setPickup,
  dropoff, setDropoff,
  pickupCoords, setPickupCoords,
  dropoffCoords, setDropoffCoords,
  focusedInput, setFocusedInput,
  geoLoading,
  handleCurrentLocation,
  handleSearch,
  handleSavedPlace,
  locPermission,
  locBannerDismissed,
  requestLocation,
  setLocBannerDismissed,
}) {
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef(null);
  const resultsRef = useRef(null);

  const isPickupFocused = focusedInput === 'pickup';
  const activeValue = isPickupFocused ? pickup : dropoff;
  const activeCoords = isPickupFocused ? pickupCoords : dropoffCoords;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!activeValue || activeValue.length < 2 || activeCoords) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchLocations(activeValue);
      setSearchResults(results);
      setShowResults(results.length > 0);
      setSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activeValue, activeCoords]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (resultsRef.current && !resultsRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (result) => {
    const field = focusedInput;
    if (field === 'pickup') {
      setPickup(result.name);
      setPickupCoords(result.coords);
    } else {
      setDropoff(result.name);
      setDropoffCoords(result.coords);
    }
    setSearchResults([]);
    setShowResults(false);
  };

  const handleInputChange = (field, value) => {
    if (field === 'pickup') {
      setPickup(value);
      if (pickupCoords) setPickupCoords(null);
    } else {
      setDropoff(value);
      if (dropoffCoords) setDropoffCoords(null);
    }
    setSearchResults([]);
    if (value.length < 2) setShowResults(false);
  };

  const handleFocus = (field) => {
    setFocusedInput(field);
    if (searchResults.length > 0) setShowResults(true);
  };

  const handleClear = (field) => {
    if (field === 'pickup') {
      setPickup('');
      setPickupCoords(null);
    } else {
      setDropoff('');
      setDropoffCoords(null);
    }
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <>
      <div className="sidebar-header">
        <h2>Get a ride</h2>
      </div>
      <div className="booking-card" ref={resultsRef}>
        <div className="booking-inputs-container">
          <div className="booking-input-icon">
            <div className="booking-icon-circle"></div>
            <div className="booking-connector-line"></div>
            <div className="booking-icon-square"></div>
          </div>
          <div className="booking-input-row" style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Pickup location"
              value={pickup}
              onChange={(e) => handleInputChange('pickup', e.target.value)}
              onFocus={() => handleFocus('pickup')}
              autoFocus
            />
            {pickup && (
              <button
                onClick={() => handleClear('pickup')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '14px', padding: '4px', background: 'var(--color-surface-card)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            )}
          </div>
          <div className="booking-input-row" style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Where to?"
              value={dropoff}
              onChange={(e) => handleInputChange('dropoff', e.target.value)}
              onFocus={() => handleFocus('dropoff')}
            />
            {dropoff && (
              <button
                onClick={() => handleClear('dropoff')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '14px', padding: '4px', background: 'var(--color-surface-card)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            )}
          </div>
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="geocode-results-dropdown">
            {searchResults.map((result, i) => (
              <div
                key={i}
                className="geocode-result-item"
                onClick={() => handleSelectResult(result)}
              >
                <div className="geocode-result-icon">
                  {getTypeIcon(result.type)}
                </div>
                <div className="geocode-result-text">
                  <div className="geocode-result-name">{result.name}</div>
                  <div className="geocode-result-address">{result.fullAddress.split(', ').slice(1, 3).join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searching && (
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
            Searching locations...
          </div>
        )}

        {pickupCoords && (
          <div style={{ fontSize: '12px', color: 'var(--color-gold)', padding: '2px 0', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--color-border-gold)', marginTop: '4px', paddingTop: '12px' }}>
            <FaMapMarkerAlt style={{ fontSize: '12px', flexShrink: 0 }} />
            <span style={{ color: 'var(--color-text-muted)' }}>Drag the pin on the map to adjust pickup location</span>
          </div>
        )}

        <div className="current-location-btn" onClick={handleCurrentLocation}>
          {geoLoading ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaCrosshairs />}
          {geoLoading ? 'Getting location...' : 'Use current location'}
        </div>

        <div className="leave-now-btn">
          <div className="leave-now-icon">
            <FaClock />
          </div>
          <span>Leave now</span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginLeft: 'auto' }}>
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </div>

        <button className="primary-button booking-search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      {locPermission === 'denied' && !locBannerDismissed && (
        <div style={{
          margin: '0 24px 16px',
          padding: '12px 16px',
          backgroundColor: 'rgba(231,76,60,0.1)',
          border: '1px solid rgba(231,76,60,0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          fontSize: '13px',
          color: '#e74c3c',
        }}>
          <FaExclamationTriangle style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <strong>Location access denied</strong>
            <p style={{ marginTop: 4, color: 'var(--color-text-muted)', fontSize: '12px' }}>
              Enable location services in your browser settings for accurate pickup. You can still type a location.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => requestLocation(true)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Try again
              </button>
              <button
                onClick={() => setLocBannerDismissed(true)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {locPermission === 'granted' && (
        <div style={{
          margin: '0 24px 16px',
          padding: '12px 16px',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          border: '1px solid rgba(46, 204, 113, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          fontSize: '13px',
          color: '#2ecc71',
        }}>
          <FaCheckCircle style={{ flexShrink: 0, marginTop: '2px', fontSize: '16px' }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#2ecc71' }}>Location access active</strong>
            <p style={{ marginTop: 4, color: 'var(--color-text-muted)', fontSize: '12px' }}>
              Your browser location access is enabled for accurate pickup address detection.
            </p>
          </div>
        </div>
      )}

      <div style={{ padding: '0 24px 8px', fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.5px', borderTop: '1px solid var(--color-border-gold)', paddingTop: '16px', marginTop: '0' }}>
        {isPickupFocused ? 'SET PICKUP LOCATION' : 'SET DESTINATION'}
      </div>

      <div className="suggestions-list">
        {SAVED_PLACES.map((place, i) => (
          <div key={i} className="suggestion-item" onClick={() => handleSavedPlace(place)}>
            <div className="suggestion-icon-circle" style={!isPickupFocused ? { backgroundColor: 'rgba(255,184,0,0.15)', color: 'var(--color-gold)' } : {}}>
              <FaMapMarkerAlt />
            </div>
            <div className="suggestion-text">
              <h4>{place.name}</h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '2px' }}>{place.address}</p>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', flexShrink: 0 }}>{isPickupFocused ? 'Set pickup' : 'Set destination'}</span>
          </div>
        ))}
      </div>
    </>
  );
}