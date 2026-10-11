import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng } from 'react-native-maps';

// Fix Leaflet's default icon paths — Metro can't bundle CSS url() references
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Tooltip style injected once into the page
if (typeof document !== 'undefined') {
  const styleId = 'map-tooltip-style';
  if (!document.getElementById(styleId)) {
    const s = document.createElement('style');
    s.id = styleId;
    s.textContent = `
      .map-tooltip {
        background: #0F1A2B !important;
        border: 1px solid rgba(255,255,255,0.15) !important;
        border-radius: 8px !important;
        color: #FFFFFF !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        padding: 4px 8px !important;
        max-width: 180px;
        white-space: normal;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
      }
      .map-tooltip::before { display: none !important; }
    `;
    document.head.appendChild(s);
  }
}

function makePinIcon(color: string): L.DivIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 24 14 24S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="6" fill="#FFFFFF"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    tooltipAnchor: [0, -40],
  });
}

export type MapPoint = {
  id: string;
  title?: string;
  coordinate: LatLng;
  pinColor?: string;
};

type Props = {
  points?: MapPoint[];
  path?: LatLng[];
  height?: number | string;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  userLocation?: { latitude: number; longitude: number; accuracy?: number; heading?: number | null } | null;
  interactive?: boolean;
};

const DEFAULT_REGION = {
  latitude: 51.5178,
  longitude: -0.0985,
  latitudeDelta: 0.08,
  longitudeDelta: 0.1,
};

function computeZoom(latDelta: number): number {
  if (latDelta >= 0.5) return 9;
  if (latDelta >= 0.2) return 10;
  if (latDelta >= 0.1) return 11;
  if (latDelta >= 0.05) return 12;
  if (latDelta >= 0.025) return 13;
  if (latDelta >= 0.012) return 14;
  if (latDelta >= 0.006) return 15;
  return 16;
}

export function PlatformMap(props: Props) {
  const {
    points = [],
    path,
    height = '100%',
    initialRegion,
    userLocation,
    interactive = true,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  const region = initialRegion ?? DEFAULT_REGION;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [region.latitude, region.longitude],
      zoom: computeZoom(region.latitudeDelta),
      zoomControl: false,
      attributionControl: false,
      dragging: !!interactive,
      scrollWheelZoom: !!interactive,
      doubleClickZoom: !!interactive,
      boxZoom: !!interactive,
      touchZoom: !!interactive,
      keyboard: !!interactive,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([region.latitude, region.longitude], computeZoom(region.latitudeDelta), { animate: true });
  }, [region.latitude, region.longitude, region.latitudeDelta]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = points.map(p => {
      const isPickup = p.id === 'pickup';
      const isDrop   = p.id === 'drop';
      let marker: L.Marker | L.CircleMarker;

      if (isPickup || isDrop) {
        const color = isPickup ? '#1F4BFF' : '#FF3B47';
        marker = L.marker(
          [p.coordinate.latitude, p.coordinate.longitude],
          { icon: makePinIcon(color) },
        );
      } else {
        marker = L.circleMarker([p.coordinate.latitude, p.coordinate.longitude], {
          radius: 6,
          color: p.pinColor ?? '#1F4BFF',
          fillColor: p.pinColor ?? '#1F4BFF',
          fillOpacity: 1,
          weight: 2,
        });
      }

      if (p.title) {
        marker.bindTooltip(p.title, {
          permanent: isPickup || isDrop,
          direction: 'top',
          className: 'map-tooltip',
          offset: isPickup || isDrop ? [0, -38] : [0, -8],
        });
      }
      marker.addTo(map);
      return marker as L.CircleMarker; // cast — both types share .remove()
    });
  }, [points]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
      if (path && path.length >= 2) {
        polylineRef.current = L.polyline(
          path.map(p => [p.latitude, p.longitude] as [number, number]),
          { color: '#FFB800', weight: 6, opacity: 0.85 },
        ).addTo(map);
      }
  }, [path]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (userLocation) {
      userMarkerRef.current = L.circleMarker([userLocation.latitude, userLocation.longitude], {
        radius: 7,
        color: '#FFFFFF',
        fillColor: '#1F4BFF',
        fillOpacity: 1,
        weight: 3,
      }).addTo(map);
    }
  }, [userLocation]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: typeof height === 'number' ? height : undefined,
        minHeight: typeof height === 'string' ? height : undefined,
      }}
    />
  );
}
