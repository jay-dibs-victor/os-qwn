import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const pickupIcon = L.divIcon({
  className: 'custom-pickup-marker',
  html: '<div style="width:16px;height:16px;background:#ffffff;border:4px solid #000;border-radius:50%;box-shadow:0 0 0 2px #ffffff;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const dropoffIcon = L.divIcon({
  className: 'custom-dropoff-marker',
  html: '<div style="width:16px;height:16px;background:#FFB800;border:4px solid #000;border-radius:2px;box-shadow:0 0 0 2px #FFB800;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const dropoffDraggableIcon = L.divIcon({
  className: 'custom-dropoff-marker',
  html: '<div style="width:28px;height:28px;background:#FFB800;border:7px solid #000;border-radius:4px;box-shadow:0 0 0 4px #FFB800, 0 3px 12px rgba(0,0,0,0.6);cursor:grab;"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function buildDriverIcon(heading) {
  return L.divIcon({
    className: 'custom-driver-marker',
    html: `<div style="width:28px;height:28px;background:#FFB800;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#000;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.4);transform:rotate(${heading}deg);transition:transform 0.3s ease;"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const pickupDraggableIcon = L.divIcon({
  className: 'custom-pickup-marker',
  html: '<div style="width:28px;height:28px;background:#ffffff;border:7px solid #000;border-radius:50%;box-shadow:0 0 0 4px #ffffff, 0 3px 12px rgba(0,0,0,0.6);cursor:grab;"><div style="width:6px;height:6px;background:#000;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const pickupRouteIcon = L.divIcon({
  className: 'custom-pickup-marker',
  html: '<div style="width:20px;height:20px;background:#ffffff;border:5px solid #000;border-radius:50%;box-shadow:0 0 0 3px #ffffff;"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const dropoffRouteIcon = L.divIcon({
  className: 'custom-dropoff-marker',
  html: '<div style="width:20px;height:20px;background:#FFB800;border:5px solid #000;border-radius:3px;box-shadow:0 0 0 3px #FFB800;"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div style="width:18px;height:18px;background:#4285F4;border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(66,133,244,0.6);"><div style="width:6px;height:6px;background:#fff;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function isValidCoords(c) {
  return Array.isArray(c) && c.length === 2 && isFinite(c[0]) && isFinite(c[1]);
}

function FlyToCenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    try {
      if (isValidCoords(coords)) {
        map.setView(coords, 14);
      }
    } catch { }
  }, [coords, map]);
  return null;
}

function MapBounds({ pickupCoords, dropoffCoords }) {
  const map = useMap();
  useEffect(() => {
    try {
      if (pickupCoords && dropoffCoords && isValidCoords(pickupCoords) && isValidCoords(dropoffCoords)) {
        const bounds = L.latLngBounds(pickupCoords, dropoffCoords);
        map.fitBounds(bounds, { padding: [60, 60] });
      }
    } catch { }
  }, [pickupCoords, dropoffCoords, map]);
  return null;
}

export default function MapView({ pickupCoords, dropoffCoords, driverCoords, driverHeading, userCoords, routeCoords, showRoute, showUserLocation, onPickupDrag, onDropoffDrag }) {
  const rawCenter = pickupCoords || userCoords || [6.5244, 3.3792];
  const center = isValidCoords(rawCenter) ? rawCenter : [6.5244, 3.3792];
  const hasBoth = isValidCoords(pickupCoords) && isValidCoords(dropoffCoords);

  return (
    <MapContainer
      center={center}
      zoom={13}
      zoomControl={true}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {userCoords && showUserLocation && isValidCoords(userCoords) && (
        <Marker position={userCoords} icon={userLocationIcon} />
      )}

      {isValidCoords(pickupCoords) && !showRoute && (
        <Marker
          position={pickupCoords}
          icon={pickupDraggableIcon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              if (onPickupDrag) onPickupDrag([lat, lng]);
            },
          }}
        />
      )}

      {isValidCoords(pickupCoords) && showRoute && (
        <Marker position={pickupCoords} icon={pickupRouteIcon} />
      )}

      {isValidCoords(dropoffCoords) && !showRoute && (
        <Marker
          position={dropoffCoords}
          icon={dropoffDraggableIcon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              if (onDropoffDrag) onDropoffDrag([lat, lng]);
            },
          }}
        />
      )}

      {isValidCoords(dropoffCoords) && showRoute && (
        <Marker position={dropoffCoords} icon={dropoffRouteIcon} />
      )}

      {isValidCoords(driverCoords) && (
        <Marker key={`driver-${Math.round(driverHeading / 5)}`} position={driverCoords} icon={buildDriverIcon(driverHeading || 0)} />
      )}

      {hasBoth && showRoute && routeCoords && routeCoords.length > 0 && (
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: '#FFB800',
            weight: 4,
            opacity: 0.9,
          }}
        />
      )}

      {hasBoth && showRoute && (!routeCoords || routeCoords.length === 0) && (
        <Polyline
          positions={[pickupCoords, dropoffCoords]}
          pathOptions={{
            color: '#FFB800',
            weight: 3,
            opacity: 0.6,
            dashArray: '8 8',
          }}
        />
      )}

      {!showRoute && (isValidCoords(pickupCoords) ? pickupCoords : (isValidCoords(userCoords) ? userCoords : null)) && (
        <FlyToCenter coords={isValidCoords(pickupCoords) ? pickupCoords : userCoords} />
      )}
      {hasBoth && showRoute && (
        <MapBounds pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} />
      )}
    </MapContainer>
  );
}
