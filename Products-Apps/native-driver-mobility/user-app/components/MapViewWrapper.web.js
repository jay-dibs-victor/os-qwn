import React, { useEffect, useRef, Children } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const TILE_CACHE_DB = 'queens-map-cache';
const TILE_STORE = 'tiles';
const MAX_TILES = 1000;

let dbPromise = null;
function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(TILE_CACHE_DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(TILE_STORE)) {
          const store = db.createObjectStore(TILE_STORE, { keyPath: 'key' });
          store.createIndex('time', 'time');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => { dbPromise = null; reject(req.error); };
    });
  }
  return dbPromise;
}

async function tileCacheGet(key) {
  try {
    const db = await getDB();
    return new Promise(resolve => {
      const tx = db.transaction(TILE_STORE, 'readonly');
      const req = tx.objectStore(TILE_STORE).get(key);
      req.onsuccess = () => resolve(req.result?.blob || null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

async function tileCacheSet(key, blob) {
  try {
    const db = await getDB();
    const tx = db.transaction(TILE_STORE, 'readwrite');
    const store = tx.objectStore(TILE_STORE);
    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result >= MAX_TILES) {
        const cursorReq = store.index('time').openCursor(IDBKeyRange.lowerBound(0));
        let deleted = 0;
        cursorReq.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor && deleted < 100) {
            store.delete(cursor.primaryKey);
            deleted++;
            cursor.continue();
          }
        };
      }
    };
    store.put({ key, blob, time: Date.now() });
  } catch {}
}

const CachedTileLayer = L.TileLayer.extend({
  createTile(coords, done) {
    const key = `${coords.z}_${coords.x}_${coords.y}`;
    const tile = L.DomUtil.create('img', 'leaflet-tile');

    L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
    L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile));

    tileCacheGet(key).then(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        tile.src = url;
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        tile.src = this.getTileUrl(coords);
      }
    });

    const onLoad = () => {
      tile.removeEventListener('load', onLoad);
      tile.removeEventListener('error', onError);
      tileCacheGet(key).then(blob => {
        if (!blob) {
          fetch(this.getTileUrl(coords))
            .then(r => r.blob())
            .then(blob => tileCacheSet(key, blob))
            .catch(() => {});
        }
      });
    };
    const onError = () => {
      tile.removeEventListener('load', onLoad);
      tile.removeEventListener('error', onError);
    };
    tile.addEventListener('load', onLoad);
    tile.addEventListener('error', onError);

    return tile;
  }
});

function extractText(element) {
  if (typeof element === 'string') return element;
  if (typeof element === 'number') return String(element);
  if (element?.props?.children) {
    return Children.map(element.props.children, extractText)?.join('') || '';
  }
  return '';
}

function resolveStyle(style) {
  if (Array.isArray(style)) return Object.assign({}, ...style);
  return style || {};
}

function pinIcon(color) {
  const c = color || '#FFC107';
  return L.divIcon({
    className: '',
    html: `<div style="width:36px;height:44px;position:relative;">
      <div style="position:absolute;top:0;left:2px;width:32px;height:32px;border-radius:50% 50% 50% 0;background:${c};border:2.5px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
        <div style="width:12px;height:12px;background:#fff;border-radius:50%;transform:rotate(45deg);"></div>
      </div>
    </div>`,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -28],
  });
}

function rideHailingIcon(color) {
  const c = color || '#FFC107';
  return L.divIcon({
    className: '',
    html: `<div style="width:44px;height:44px;background:${c};border-radius:10px;border:2.5px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
      <div style="width:26px;height:18px;background:#fff;border-radius:5px 5px 3px 3px;position:relative;box-shadow:inset 0 1px 2px rgba(0,0,0,0.1);">
        <div style="position:absolute;top:3px;left:4px;right:4px;height:3px;background:${c};border-radius:1px;"></div>
        <div style="position:absolute;bottom:3px;left:4px;right:4px;height:3px;background:${c};border-radius:1px;"></div>
        <div style="position:absolute;top:5px;left:11px;width:4px;height:8px;background:${c};border-radius:1px;"></div>
      </div>
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

function getIcon(borderColor, emoji, bgColor) {
  if (emoji === '🚗' || emoji === '🚙') {
    return rideHailingIcon('#FFC107');
  }
  if (emoji === '📍') {
    return pinIcon('#FFC107');
  }
  const bg = bgColor || '#000';
  const border = borderColor || (bgColor && '#fff') || '#FFC107';
  return L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;border-radius:18px;background:${bg};display:flex;align-items:center;justify-content:center;border:2px solid ${border};font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.4);">${emoji || '📍'}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

const userDotIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#007AFF;border:3px solid #fff;box-shadow:0 0 0 4px rgba(0,122,255,0.3);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

let mapCount = 0;

export function Marker() {
  return null;
}

export function Polyline() {
  return null;
}

export default function MapView({ region, initialRegion, style, children, showsUserLocation }) {
  const idRef = useRef(`map-${++mapCount}`);
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef({ markers: [], polyline: null, userLoc: null });

  const currentRegion = region || initialRegion || {
    latitude: 6.4281,
    longitude: 3.4215,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [currentRegion.latitude, currentRegion.longitude],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = new CachedTileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
        minZoom: 3,
      });
      map.addLayer(tileLayer);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([currentRegion.latitude, currentRegion.longitude], Math.max(13, map.getZoom()), { animate: false });
  }, [currentRegion.latitude, currentRegion.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layersRef.current.markers.forEach(m => map.removeLayer(m));
    layersRef.current.markers = [];
    if (layersRef.current.polyline) {
      map.removeLayer(layersRef.current.polyline);
      layersRef.current.polyline = null;
    }

    Children.forEach(children, child => {
      if (!child) return;

      if (child.type === Marker) {
        const { coordinate, title, description, draggable, onDragEnd, children: markerChildren } = child.props;
        if (!coordinate) return;

        const hasCustomView = markerChildren && typeof markerChildren !== 'string' && typeof markerChildren !== 'number';
        let icon;
        if (hasCustomView) {
          const emoji = extractText(markerChildren);
          const viewStyle = resolveStyle(markerChildren?.props?.style);
          const textChild = markerChildren?.props?.children;
          const textStyle = resolveStyle(textChild?.props?.style);
          icon = getIcon(textStyle?.color, emoji, viewStyle?.backgroundColor);
        }

        const marker = L.marker([coordinate.latitude, coordinate.longitude], {
          draggable: !!draggable,
          icon: icon || undefined,
        });

        if (title || description) {
          marker.bindPopup(`<b>${title || ''}</b>${description ? '<br/>' + description : ''}`);
        }

        if (onDragEnd) {
          marker.on('dragend', (e) => {
            const latlng = e.target.getLatLng();
            onDragEnd({ nativeEvent: { coordinate: { latitude: latlng.lat, longitude: latlng.lng } } });
          });
        }

        marker.addTo(map);
        layersRef.current.markers.push(marker);
      }

      if (child.type === Polyline) {
        const { coordinates, strokeColor, strokeWidth } = child.props;
        if (!coordinates || coordinates.length === 0) return;
        const polyline = L.polyline(
          coordinates.map(c => [c.latitude, c.longitude]),
          { color: strokeColor || '#FFC107', weight: strokeWidth || 5, opacity: 0.8 }
        ).addTo(map);
        layersRef.current.polyline = polyline;
      }
    });
  }, [children]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (showsUserLocation) {
      map.locate({ setView: false, watch: true, enableHighAccuracy: true });

      const onLocationFound = (e) => {
        if (layersRef.current.userLoc) {
          map.removeLayer(layersRef.current.userLoc);
        }
        layersRef.current.userLoc = L.marker([e.latitude, e.longitude], { icon: userDotIcon }).addTo(map);
      };

      const onLocationError = () => {};

      map.on('locationfound', onLocationFound);
      map.on('locationerror', onLocationError);

      return () => {
        map.stopLocate();
        map.off('locationfound', onLocationFound);
        map.off('locationerror', onLocationError);
        if (layersRef.current.userLoc) {
          map.removeLayer(layersRef.current.userLoc);
          layersRef.current.userLoc = null;
        }
      };
    }
  }, [showsUserLocation]);

  return <div id={idRef.current} ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
