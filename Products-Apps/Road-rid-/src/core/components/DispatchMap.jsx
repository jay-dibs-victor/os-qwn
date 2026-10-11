import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PROVIDER = import.meta.env.VITE_MAP_PROVIDER || 'OSM';

/**
 * DispatchMap — Specific version for Courier Dispatch tracking.
 * Cloned from UniversalMap but customized for multi-stop logistics and rider interaction.
 */
const DispatchMap = ({ 
  center, 
  zoom = 14, 
  stops = [], // Array of { lat, lng, status: 'PENDING' | 'COMPLETED' }
  riderPosition, // { lat, lng }
  style = { height: '100%', width: '100%' },
  handshakeActive = false,
  theme = 'PREMIUM'
}) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const layersRef = useRef({ tile: null, polyline: null, markers: [], riderMarker: null });

  // Custom Icons
  const riderIcon = L.divIcon({
    html: `<div style="font-size: 30px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🛵</div>`,
    className: 'dispatch-rider-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  const stopIcon = (status) => L.divIcon({
    html: `<div style="
      width: 20px; 
      height: 20px; 
      background: ${status === 'COMPLETED' ? '#2ed573' : '#fff'}; 
      border: 3px solid ${status === 'COMPLETED' ? '#fff' : '#2ed573'}; 
      border-radius: 50%; 
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    "></div>`,
    className: 'dispatch-stop-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const mapCenter = (center && center[0] !== undefined) ? center : [6.5244, 3.3792];
    const map = L.map(containerRef.current, {
      center: mapCenter,
      zoom: zoom,
      zoomControl: false,
      attributionControl: false
    });

    if (theme === 'PREMIUM') {
      containerRef.current.style.filter = 'saturate(1.1) contrast(1.02)';
    }

    const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    layersRef.current.tile = L.tileLayer(tileUrl, {
      attribution: '© CartoDB',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const stopsStr = JSON.stringify(stops?.map(s => ({ lat: s.lat, lng: s.lng, status: s.status })));
  const riderPositionStr = riderPosition ? JSON.stringify({ lat: riderPosition.lat, lng: riderPosition.lng }) : '';

  // 1. Sync stops polyline and markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    layersRef.current.markers.forEach(m => {
      try { if (m && m._map) map.removeLayer(m); } catch (e) {}
    });
    layersRef.current.markers = [];
    
    if (layersRef.current.polyline) {
      try { if (layersRef.current.polyline._map) map.removeLayer(layersRef.current.polyline); } catch (e) {}
      layersRef.current.polyline = null;
    }

    // Draw Polyline between stops
    const pathCoords = stops ? stops.map(s => [s.lat, s.lng]) : [];
    if (pathCoords.length > 1) {
      try {
        layersRef.current.polyline = L.polyline(pathCoords, {
          color: '#2ed573',
          weight: 4,
          opacity: 0.6,
          dashArray: '10, 10'
        }).addTo(map);
      } catch (e) { console.error(e); }
    }

    // Add Stop Markers
    const group = L.featureGroup();
    if (stops) {
      stops.forEach((s, i) => {
        try {
          const marker = L.marker([s.lat, s.lng], { icon: stopIcon(s.status) })
            .bindTooltip(`Stop ${i + 1}`, { permanent: false, direction: 'top' })
            .addTo(map);
          layersRef.current.markers.push(marker);
          group.addLayer(marker);
        } catch (e) { console.error(e); }
      });
    }

    // Fit bounds
    if (stops && stops.length > 0) {
      try {
        map.fitBounds(group.getBounds(), { padding: [50, 50], animate: true });
      } catch (e) { console.error(e); }
    }
  }, [stopsStr]);

  // 2. Sync rider position and handshake status
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersRef.current.riderMarker) {
      try { if (layersRef.current.riderMarker._map) map.removeLayer(layersRef.current.riderMarker); } catch (e) {}
      layersRef.current.riderMarker = null;
    }

    if (riderPosition && riderPosition.lat !== undefined) {
      try {
        layersRef.current.riderMarker = L.marker([riderPosition.lat, riderPosition.lng], { 
          icon: riderIcon,
          zIndexOffset: 1000 
        }).addTo(map);
        
        if (handshakeActive) {
          layersRef.current.riderMarker.bindPopup('<div class="fw-bold">Rider Handshake Active</div><p class="m-0 small">Real-time sync enabled</p>').openPopup();
        }
      } catch (e) { console.error(e); }
    }
  }, [riderPositionStr, handshakeActive]);

  return (
    <div 
      ref={containerRef} 
      style={{ ...style, borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--color-border)' }} 
      className="dispatch-leaflet-map" 
    />
  );
};

export default DispatchMap;
