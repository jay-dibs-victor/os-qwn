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

  // Sync stops and rider
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    layersRef.current.markers.forEach(m => map.removeLayer(m));
    layersRef.current.markers = [];
    if (layersRef.current.riderMarker) map.removeLayer(layersRef.current.riderMarker);
    if (layersRef.current.polyline) map.removeLayer(layersRef.current.polyline);

    // 1. Draw Polyline between stops
    const pathCoords = stops.map(s => [s.lat, s.lng]);
    if (pathCoords.length > 1) {
      layersRef.current.polyline = L.polyline(pathCoords, {
        color: '#2ed573',
        weight: 4,
        opacity: 0.6,
        dashArray: '10, 10'
      }).addTo(map);
    }

    // 2. Add Stop Markers
    const group = L.featureGroup();
    stops.forEach((s, i) => {
      const marker = L.marker([s.lat, s.lng], { icon: stopIcon(s.status) })
        .bindTooltip(`Stop ${i + 1}`, { permanent: false, direction: 'top' })
        .addTo(map);
      layersRef.current.markers.push(marker);
      group.addLayer(marker);
    });

    // 3. Add Rider Marker
    if (riderPosition) {
      layersRef.current.riderMarker = L.marker([riderPosition.lat, riderPosition.lng], { 
        icon: riderIcon,
        zIndexOffset: 1000 
      }).addTo(map);
      
      if (handshakeActive) {
        layersRef.current.riderMarker.bindPopup('<div class="fw-bold">Rider Handshake Active</div><p class="m-0 small">Real-time sync enabled</p>').openPopup();
      }
      group.addLayer(layersRef.current.riderMarker);
    }

    // 4. Fit bounds
    if (stops.length > 0) {
      map.fitBounds(group.getBounds(), { padding: [50, 50], animate: true });
    }

  }, [stops, riderPosition, handshakeActive]);

  return (
    <div 
      ref={containerRef} 
      style={{ ...style, borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--color-border)' }} 
      className="dispatch-leaflet-map" 
    />
  );
};

export default DispatchMap;
