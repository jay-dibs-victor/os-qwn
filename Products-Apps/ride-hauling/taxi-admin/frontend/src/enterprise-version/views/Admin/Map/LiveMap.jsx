import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import './LiveMap.css';

// Premium high-fidelity car asset
const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204121.png',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  className: 'car-marker-premium car-marker-glow',
});

const scooterIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204128.png', // Scooter icon
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  className: 'scooter-marker-premium',
});

const riderIcon = new L.DivIcon({
  className: 'custom-rider-marker',
  html: '<div class="marker-pulse-blue"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/* ─────────────────────────────────────────────────────────────────
   Side Panel Component
───────────────────────────────────────────────────────────────── */
const SideDetailPanel = ({ activeItem, onClose }) => {
  if (!activeItem) return null;
  const isDriver = activeItem.type === 'DRIVER';

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="admin-map-side-panel glass-morphism p-4 shadow-lg"
    >
        <button className="btn-close-panel" onClick={onClose}><i className="bi bi-x-lg" /></button>
        <div className="text-center mb-4 pt-3">
           <div className="avatar-xl mx-auto mb-3 rounded-circle border border-4 border-white shadow-sm flex-center bg-light">
              <img src={activeItem.avatar || '/assets/images/avatar.png'} alt="user" className="img-fluid rounded-circle" />
           </div>
           <h4 className="fw-900 text-dark m-0">{activeItem.firstname} {activeItem.lastname}</h4>
           <span className={`badge rounded-pill mt-2 ${isDriver ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary'}`}>
              {activeItem.roles?.includes('Courier Driver') ? 'COURIER RIDER' : isDriver ? 'ACTIVE DRIVER' : 'WAITING PASSENGER'}
           </span>
        </div>

        <div className="stats-row grid-2 gap-2 mb-4">
           <div className="stat-box p-3 rounded-4 bg-white-20 border border-white-50">
              <p className="m-0 font-10 fw-800 text-muted">RATING</p>
              <h5 className="m-0 fw-900 text-dark pt-1"><i className="bi bi-star-fill text-warning me-1"></i> {activeItem.ratings_average || 5.0}</h5>
           </div>
           <div className="stat-box p-3 rounded-4 bg-white-20 border border-white-50">
              <p className="m-0 font-10 fw-800 text-muted">TRIPS</p>
              <h5 className="m-0 fw-900 text-dark pt-1">{activeItem.completed_trips || '142'}</h5>
           </div>
        </div>

        <div className="info-list mb-4">
            <div className="d-flex align-items-center gap-3 mb-3">
                <div className="icon-circle-md bg-white shadow-sm"><i className="bi bi-geo-alt-fill text-dark" /></div>
                <div>
                   <p className="m-0 font-10 fw-800 text-muted uppercase">COORDINATES</p>
                   <p className="m-0 font-14 fw-700 text-dark">{activeItem.lat.toFixed(4)}, {activeItem.lng.toFixed(4)}</p>
                </div>
            </div>
            {isDriver && (
               <div className="d-flex align-items-center gap-3">
                  <div className="icon-circle-md bg-white shadow-sm"><i className="bi bi-truck text-dark" /></div>
                  <div>
                     <p className="m-0 font-10 fw-800 text-muted uppercase">VEHICLE CLASS</p>
                     <p className="m-0 font-14 fw-700 text-dark">
                       {activeItem.roles?.includes('Courier Driver') ? 'Scooter / Dispatch' : 'Economy / Standard'}
                     </p>
                  </div>
              </div>
            )}

            {activeItem.delivery_meta && (
              <div className="delivery-info-section mt-4 p-3 rounded-4 bg-warning-soft border border-warning-subtle">
                <p className="m-0 font-10 fw-800 text-warning uppercase mb-2">Active Logistics Meta</p>
                <div className="grid-2 gap-2">
                   <div>
                      <p className="m-0 font-9 text-muted uppercase">Package</p>
                      <p className="m-0 font-12 fw-700">{activeItem.delivery_meta.package_type}</p>
                   </div>
                   <div>
                      <p className="m-0 font-9 text-muted uppercase">Weight</p>
                      <p className="m-0 font-12 fw-700">{activeItem.delivery_meta.weight_kg} kg</p>
                   </div>
                </div>
                {activeItem.delivery_meta.is_fragile && (
                  <span className="badge bg-danger-soft text-danger mt-2 font-10">💎 FRAGILE HANDLING</span>
                )}
              </div>
            )}
        </div>

        <div className="d-flex gap-2 mt-auto">
            <button className="btn btn-dark w-100 py-3 rounded-4 fw-900 font-14">MESSAGE</button>
            {isDriver ? (
              <button className="btn btn-warning w-100 py-3 rounded-4 fw-900 font-14 text-dark" onClick={() => alert(`Force Assign triggered for Driver ${activeItem.id}`)}>
                FORCE ASSIGN
              </button>
            ) : (
              <button className="btn btn-outline-dark w-100 py-3 rounded-4 fw-900 font-14">TRACK</button>
            )}
        </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
const LiveMap = () => {
  const [participants, setParticipants] = useState({ drivers: {}, riders: {} });
  const [events, setEvents] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:12000';
    socketRef.current = io(SERVER_URL);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-observatory');
      socketRef.current.emit('get-observatory-snapshot');
    });

    socketRef.current.on('observatory-snapshot', (data) => {
      const { drivers, rides } = data;
      const initialDrivers = {};
      const initialRiders = {};

      drivers.forEach((d) => {
        if (d.location?.coordinates) {
          initialDrivers[d.id] = { ...d, type: 'DRIVER', lat: d.location.coordinates[1], lng: d.location.coordinates[0] };
        }
      });

      rides.forEach((r) => {
        if (r.pickup_location?.coordinates) {
          initialRiders[r.passenger_id] = { id: r.passenger_id, type: 'RIDER', lat: r.pickup_location.coordinates[1], lng: r.pickup_location.coordinates[0], status: r.status, firstname: 'Rider', lastname: `#${r._id.slice(-4)}` };
        }
      });
      setParticipants({ drivers: initialDrivers, riders: initialRiders });
    });

    socketRef.current.on('observatory-update', (update) => {
      const { type, id, lat, lng, rideId } = update;
      setParticipants((prev) => {
        const key = type === 'DRIVER' ? 'drivers' : 'riders';
        if (!prev[key][id]) return prev;
        return {
          ...prev,
          [key]: {
            ...prev[key],
            [id]: { ...prev[key][id], lat, lng, rideId },
          },
        };
      });
    });

    socketRef.current.on('live-operation-event', (event) => {
      setEvents((prev) => [event, ...prev].slice(0, 5));
    });

    return () => { if (socketRef.current) socketRef.current.disconnect(); };
  }, []);

  return (
    <div className="live-map-wrapper position-relative overflow-hidden" style={{ height: '80vh', borderRadius: '32px' }}>
      
      <MapContainer center={[6.5244, 3.3792]} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />

         {Object.values(participants.drivers).map((driver) => (
          <Marker
            key={driver.id}
            position={[driver.lat, driver.lng]}
            icon={driver.roles?.includes('Courier Driver') ? scooterIcon : driverIcon}
            eventHandlers={{ click: () => setSelectedItem(driver) }}
          />
        ))}

        {Object.values(participants.riders).map((rider) => (
          <Marker
            key={rider.id}
            position={[rider.lat, rider.lng]}
            icon={riderIcon}
            eventHandlers={{ click: () => setSelectedItem(rider) }}
          />
        ))}
      </MapContainer>

      {/* Floating UI: Event Toasts */}
      <div className="map-toasts-container p-3">
         <AnimatePresence>
            {events.map((ev, idx) => (
              <motion.div 
                key={idx} 
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="premium-event-toast mb-2 p-2 px-3 glass-morphism shadow-sm"
              >
                  <div className="d-flex align-items-center gap-3">
                      <div className={`icon-sm rounded-circle ${ev.type === 'CALL' ? 'bg-danger' : 'bg-primary'}`}>
                          <i className={`bi bi-${ev.type === 'CALL' ? 'telephone-fill' : 'chat-fill'} text-white font-10`} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <p className="m-0 font-10 fw-800 text-dark uppercase">{ev.type}</p>
                         <p className="m-0 font-11 text-muted text-truncate">{ev.message || ev.caller}</p>
                      </div>
                  </div>
              </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {/* Side Profile Detail Panel */}
      <AnimatePresence>
         {selectedItem && (
           <SideDetailPanel 
             activeItem={selectedItem} 
             onClose={() => setSelectedItem(null)} 
           />
         )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-map-side-panel { position: absolute; top: 12px; right: 12px; bottom: 12px; width: 340px; z-index: 1000; border-radius: 24px; display: flex; flex-direction: column; }
        .btn-close-panel { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 18px; color: #aaa; }
        .avatar-xl { width: 100px; height: 100px; overflow: hidden; }
        .bg-white-20 { background: rgba(255,255,255,0.4); }
        .icon-circle-md { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .map-toasts-container { position: absolute; top: 0; left: 0; z-index: 1000; width: 280px; }
        .premium-event-toast { border-radius: 16px; border: 1px solid rgba(0,0,0,0.05); }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
        .bg-success-soft { background: rgba(40, 167, 69, 0.1); }
        .bg-primary-soft { background: rgba(0, 123, 255, 0.1); }
        .bg-warning-soft { background: rgba(255, 184, 0, 0.05); }
        .icon-sm { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
        .marker-pulse-blue { width: 18px; height: 18px; background: #007bff; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,123,255,0.5); }
      `}} />

    </div>
  );
};

export default LiveMap;
