import React, { useState, useEffect, useRef } from 'react';
import { MapService } from '../services/MapService';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';

const PROVIDER = import.meta.env.VITE_MAP_PROVIDER || 'OSM';
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const LocationSearch = ({ 
  placeholder, 
  value, 
  onChange = () => {}, 
  onLocationSelect = () => {}, 
  className,
  icon,
  style
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debounced search for OSM
  const fetchSuggestions = useRef(
    debounce(async (query) => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const results = await MapService.searchAddress(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 500)
  ).current;

  const skipFetchRef = useRef(false);

  useEffect(() => {
    if (isFocused && !skipFetchRef.current) {
      fetchSuggestions(value);
    }
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
    }
  }, [value, isFocused]);

  const handleSelect = (item) => {
    skipFetchRef.current = true;
    onChange(item.address);
    onLocationSelect({
      address: item.address,
      lat: item.lat,
      lng: item.lng
    });
    setSuggestions([]);
    setIsFocused(false);
  };

  // OSM Search with custom suggestions
  return (
    <div className="location-search-container" style={{ position: 'relative', width: '100%', flex: 1, height: '100%' }}>
      <div className="input-field-containerx" style={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
        {icon}
        <input
          type="text"
          className={className}
          placeholder={placeholder}
          autoComplete="off"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          style={style || {}}
        />
      </div>

      <AnimatePresence>
        {isFocused && (value.length >= 3) && (loading || suggestions.length > 0) && (
          <motion.ul
            className="suggestions-list"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 100000, 
              background: '#fafafa',
              opacity: 1,
              backdropFilter: 'none',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
              listStyle: 'none',
              padding: '8px 0',
              marginTop: '5px',
              maxHeight: '300px',
              overflowY: 'auto',
              color:"#000"
            }}
          >
            {loading ? (
              <li style={{ padding: '15px', color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center' }}>
                <div className="spinner-border spinner-border-sm text-warning me-2" role="status"></div>
                Searching locations...
              </li>
            ) : suggestions.length > 0 ? (
              suggestions.map((item, index) => (
                <li
                  key={index}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  className="suggestion-item"
                >
                  <span>📍</span>
                  <span style={{ fontSize: '13px', color: '#000', lineHeight: '1.4' }}>
                    {item.address}
                  </span>
                </li>
              ))
            ) : null}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSearch;
