import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapInput from './MapInput';
import { useUIStore } from '../../../../core/store/useUIStore';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import DispatchMap from '../../../../core/components/DispatchMap';

// Fix for default marker icons in Leaflet with Vite/Webpack
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * MapRecenter — Helper component to pan map to new coordinates
 */
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(center);
  }, [center, map]);
  return null;
};

/**
 * DriverMapViewer — queens-driverapp
 * Modernized map view using React-Leaflet.
 * Replaces the legacy Google Maps implementation.
 * Features: Trip tracking, marker management, and route visualization.
 */
const DriverMapViewer = () => {
  const addToast = useUIStore((state) => state.addToast);
  const isCourier = useAuthStore((state) => state.isCourier());
  const [center, setCenter] = useState([6.5244, 3.3792]); // Default: Lagos, Nigeria
  const [markers, setMarkers] = useState([]);
  const [route, setRoute] = useState([]);

  const handleRouteSubmit = (values) => {
    // In a production environment, you would call a geocoding API here.
    // For the migration, we simulate a successful route fetch.
    addToast('Calculating route from ' + values.origin + ' to ' + values.destination, 'info');
    
    // Simulate coordinates (Lagos area)
    const newOrigin = [6.5244 + (Math.random() - 0.5) * 0.1, 3.3792 + (Math.random() - 0.5) * 0.1];
    const newDest = [6.5244 + (Math.random() - 0.5) * 0.1, 3.3792 + (Math.random() - 0.5) * 0.1];

    setCenter(newOrigin);
    setMarkers([
      { pos: newOrigin, label: 'Origin: ' + values.origin },
      { pos: newDest, label: 'Destination: ' + values.destination }
    ]);
    setRoute([newOrigin, newDest]);
  };

  return (
    <div className="container-fluid p-t-40">
      <div className="row">
        <div className="col-sm-12 m-b-30">
          <h1 className="font-32 font-bold text-dark tracking-tight">
            {isCourier ? 'Logistics Dispatch Center' : 'Live Trip Monitor'}
          </h1>
          <p className="text-muted font-16">
            {isCourier 
              ? 'Manage and track your multi-stop delivery itineraries in real-time.' 
              : 'Monitor active vehicle movements and route progressions.'}
          </p>
        </div>
      </div>

      <div className="row">
        {/* Map Control Panel */}
        <div className="col-md-4">
          <MapInput onRouteSubmit={handleRouteSubmit} />
          
          <div className="card-box m-t-25 shadow-md" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '30px' }}>
            <h4 className="font-bold text-dark m-b-20 font-16">Journey Status</h4>
            <div className="inbox-widget">
              <div className="inbox-item flex-row items-center p-y-10">
                <div className="inbox-item-img m-r-15 flex-row items-center justify-center font-bold" style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,184,0,0.1)', color: '#FFB800' }}>
                  <i className="md md-directions-car font-28"></i>
                </div>
                <div className="flex-1">
                    <p className="inbox-item-author m-0 font-bold text-dark">Current Vehicle</p>
                    <p className="inbox-item-text m-0 text-muted font-13">ID: TX-10293 (Active)</p>
                </div>
                <div className="text-right">
                    <span className="badge bg-success-subtle text-success p-x-12 p-y-6" style={{ borderRadius: '50px' }}>ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Display */}
        <div className="col-md-8">
          <div className="card-box shadow-md" style={{ padding: '0', height: '600px', overflow: 'hidden', borderRadius: '24px', border: '1px solid var(--color-border)' }}>
            {isCourier ? (
              <DispatchMap
                center={center}
                zoom={14}
                stops={markers.map(m => ({ lat: m.pos[0], lng: m.pos[1], status: 'PENDING' }))}
                riderPosition={{ lat: center[0], lng: center[1] }}
                handshakeActive={true}
              />
            ) : (
              <MapContainer 
                center={center} 
                zoom={13} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapRecenter center={center} />

                {markers.map((marker, idx) => (
                  <Marker key={idx} position={marker.pos}>
                    <Popup>{marker.label}</Popup>
                  </Marker>
                ))}

                {route.length > 0 && (
                  <Polyline positions={route} color="#FFB800" weight={5} opacity={0.7} />
                )}
              </MapContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverMapViewer;
