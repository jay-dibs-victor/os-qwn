import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, Polyline as GooglePolyline, Marker as GoogleMarker, useJsApiLoader } from '@react-google-maps/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PROVIDER = import.meta.env.VITE_MAP_PROVIDER || 'OSM';
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Internal component to wrap Google-specific hooks
const GoogleMapProvider = ({ center, zoom, style, routePath, markers, children }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_KEY || '',
  });

  if (!isLoaded) return <div style={{ ...style, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Google Maps...</div>;

  const googleCenter = center ? { lat: center[0], lng: center[1] } : { lat: 0, lng: 0 };
  const googlePath = routePath ? routePath.map(p => ({ lat: p[0], lng: p[1] })) : [];

  return (
    <GoogleMap
      mapContainerStyle={style}
      center={googleCenter}
      zoom={zoom}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      {googlePath.length > 0 && (
        <GooglePolyline
          path={googlePath}
          options={{
            strokeColor: '#FFB800',
            strokeOpacity: 0.8,
            strokeWeight: 4,
          }}
        />
      )}
      {markers.map((m, i) => (
        <GoogleMarker
          key={i}
          position={{ lat: m.position[0], lng: m.position[1] }}
        />
      ))}
      {children}
    </GoogleMap>
  );
};

/**
 * UniversalMap — Native Leaflet Implementation
 * We avoid react-leaflet abstractions to prevent the persistent '_leaflet_events' unmount crash.
 * This implementation manually manages the map instance and its layers.
 */
const UniversalMap = ({ 
  center, 
  zoom = 13, 
  routePath, 
  markers = [], 
  style = { height: '100%', width: '100%' },
  isScanning = false,
  searchNodes = null,
  driverTrail = [],
  theme = 'PREMIUM' // 'PREMIUM', 'DARK', 'STANDARD'
}) => {
  if (PROVIDER === 'GOOGLE') {
    return <GoogleMapProvider center={center} zoom={zoom} style={style} routePath={routePath} markers={markers} />;
  }

  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const layersRef = useRef({ tile: null, polyline: null, markers: [], glowPath: null, trailLine: null });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize Map
    const mapCenter = (center && center[0] !== undefined) ? center : [6.5244, 3.3792];
    const map = L.map(containerRef.current, {
      center: mapCenter,
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: true
    });

    // Apply Premium Filters via CSS
    if (theme === 'PREMIUM') {
      containerRef.current.style.filter = 'saturate(1.2) contrast(1.05) brightness(0.98)';
      containerRef.current.style.background = '#eef2f5';
    }

    // Crisp, road-focused tile — similar to Google Maps aesthetic
    const tileUrl = PROVIDER === 'MAPBOX' 
      ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}@2x?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    
    layersRef.current.tile = L.tileLayer(tileUrl, {
      attribution: '© CartoDB',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        try {
          // Manually clean tracked layers first for extra safety
          if (layersRef.current.polyline && layersRef.current.polyline._map) {
            mapRef.current.removeLayer(layersRef.current.polyline);
          }
          layersRef.current.markers.forEach(m => {
            if (m && m._map) mapRef.current.removeLayer(m);
          });
          
          mapRef.current.remove();
        } catch (e) {
          console.warn("Map destruction cleanup:", e);
        }
        mapRef.current = null;
      }
    };
  }, []); // Only init once

  const centerLat = center && center[0];
  const centerLng = center && center[1];

  // Sync View with Animated Effect
  useEffect(() => {
    if (mapRef.current && centerLat !== undefined && centerLng !== undefined) {
      const map = mapRef.current;
      const actualCenter = [centerLat, centerLng];
      
      // Perform cinematic zoom-in then zoom-out on first load
      const tour = async () => {
        if (mapRef.current === map && map._container && map._container.parentNode) {
          map.setView(actualCenter, 18, { animate: true, duration: 2 });
        }
        setTimeout(() => {
          if (mapRef.current === map && map._container && map._container.parentNode) {
            try { 
              map.setView(actualCenter, zoom, { animate: true, duration: 1.5 }); 
            } catch (e) {
              console.warn("Leaflet cinematic pan gracefully aborted:", e);
            }
          }
        }, 2200);
      };

      if (!map._hasToured && !isScanning) {
        tour();
        map._hasToured = true;
      } else if (!isScanning) {
        map.setView(actualCenter, zoom, { animate: true });
      }
    }
  }, [centerLat, centerLng, zoom, isScanning]);

  const pickupLat = searchNodes?.pickup?.lat;
  const pickupLng = searchNodes?.pickup?.lng;
  const destinationLat = searchNodes?.destination?.lat;
  const destinationLng = searchNodes?.destination?.lng;

  // ── Cinematic Scanning (Ping-Pong Camera) ──
  useEffect(() => {
    if (!mapRef.current || !isScanning || !pickupLat || !destinationLat) return;

    const map = mapRef.current;
    let active = true;
    let targetIsDest = true;

    const pingPongCamera = () => {
      if (!active) return;
      const target = targetIsDest 
        ? [destinationLat, destinationLng] 
        : [pickupLat, pickupLng];
      
      try {
        // Swift, dynamic flyTo motion for both panning and zooming (duration: 3s)
        map.flyTo(target, 16, { animate: true, duration: 3, easeLinearity: 0.25 });
        targetIsDest = !targetIsDest;
      } catch (e) {}

      // Repeat exactly when the flight ends
      setTimeout(() => { if (active) pingPongCamera(); }, 3500);
    };

    // Kickoff the sweep
    pingPongCamera();

    return () => {
      active = false;
      // Stop the flight physics gracefully on abort
      try { if (mapRef.current) mapRef.current.stop(); } catch(e){}
    };
  }, [isScanning, pickupLat, pickupLng, destinationLat, destinationLng]);

  const routePathStr = routePath ? JSON.stringify(routePath) : '';
  const driverTrailStr = driverTrail ? JSON.stringify(driverTrail) : '';
  const markersStr = markers ? JSON.stringify(markers.map(m => ({
    lat: m.position?.[0],
    lng: m.position?.[1],
    iconUrl: m.icon?.options?.iconUrl || m.icon?.options?.className || m.icon?.options?.html || '',
    popup: m.popup || ''
  }))) : '';

  // 1. Sync Route Path
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersRef.current.polyline) {
      try { if (layersRef.current.polyline._map) map.removeLayer(layersRef.current.polyline); } catch (e) {}
      layersRef.current.polyline = null;
    }
    if (layersRef.current.glowPath) {
      try { if (layersRef.current.glowPath._map) map.removeLayer(layersRef.current.glowPath); } catch (e) {}
      layersRef.current.glowPath = null;
    }

    if (routePath && routePath.length > 0) {
      try {
        // White thick base (outline effect, like Google Maps)
        const outline = L.polyline(routePath, {
          color: '#ffffff',
          weight: 9,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
          smoothFactor: 1.2
        }).addTo(map);
        layersRef.current.glowPath = outline;

        // Premium Royal Blue primary route
        layersRef.current.polyline = L.polyline(routePath, {
          color: '#2962FF',
          weight: 5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
          smoothFactor: 1.2
        }).addTo(map);
        
        // Tighter bounds: show both endpoints clearly
        map.fitBounds(layersRef.current.polyline.getBounds(), { padding: [60, 60], animate: true, maxZoom: 16 });
      } catch (e) { console.error(e); }
    }
  }, [routePathStr]);

  // 2. Sync Driver Trail
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersRef.current.trailLine) {
      try { if (layersRef.current.trailLine._map) map.removeLayer(layersRef.current.trailLine); } catch (e) {}
      layersRef.current.trailLine = null;
    }

    if (driverTrail && driverTrail.length > 0) {
      try {
        layersRef.current.trailLine = L.polyline(driverTrail, {
          color: '#4CAF50',
          weight: 5,
          opacity: 0.7,
          lineCap: 'round',
          dashArray: '5, 10'
        }).addTo(map);
      } catch (e) { console.error(e); }
    }
  }, [driverTrailStr]);

  // 3. Sync Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layersRef.current.markers.forEach(m => {
      try { if (m && m._map) map.removeLayer(m); } catch (e) {}
    });
    layersRef.current.markers = [];

    if (markers && markers.length > 0) {
      const group = L.featureGroup();
      markers.forEach((m, i) => {
        if (m.position && m.position[0] !== undefined) {
          try {
            const isUser = m.icon?.options?.iconUrl?.includes('png');
            const markerOptions = { 
               zIndexOffset: isUser ? 1000 : 0 
            };
            if (m.icon) markerOptions.icon = m.icon;

            const marker = L.marker(m.position, markerOptions).addTo(map);
            
            if (m.popup) {
               marker.bindPopup(m.popup, { className: 'enterprise-popup', maxWidth: 260, minWidth: 200 });
               // Only auto-open the destination marker popup
               if (i === markers.length - 1 && markers.length >= 2) marker.openPopup();
            }
            
            layersRef.current.markers.push(marker);
            group.addLayer(marker);
          } catch (e) { console.error(e); }
        }
      });

      // If no route, fit bounds to the markers
      const routeExists = routePathStr && routePathStr !== '[]' && routePathStr !== 'null';
      if (!routeExists && markers.length > 1) {
        map.fitBounds(group.getBounds(), { padding: [40, 40], animate: true });
      }
    }
  }, [markersStr, routePathStr]);

  return (
    <div 
      ref={containerRef} 
      style={{ ...style }} 
      className="native-leaflet-map" 
    />
  );
};

export default UniversalMap;
