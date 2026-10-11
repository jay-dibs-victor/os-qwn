/**
 * PlatformMap.native.tsx
 *
 * Leaflet map rendered inside a WebView — works in Expo Go with no native
 * build required. Uses the same CartoDB dark_all OSM tiles as the web version.
 */
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
// Use require to let Metro register the native component once and avoid HMR re-registration crashes
const WebView = require('react-native-webview').WebView;
import type { LatLng } from 'react-native-maps';

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
  heatPoints?: any[];
  surgeZones?: any[];
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;
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

/** Build the full HTML document that Leaflet runs inside the WebView */
function buildMapHtml(props: Props): string {
  const {
    points = [],
    path,
    initialRegion,
    userLocation,
    interactive = false,
    heatPoints = [],
    surgeZones = [],
  } = props;

  const region = initialRegion ?? DEFAULT_REGION;
  const zoom = computeZoom(region.latitudeDelta);
  const dragging = interactive;

  const pointsJson = JSON.stringify(points);
  const pathJson = JSON.stringify(path ?? []);
  const userJson = JSON.stringify(userLocation ?? null);
  const heatJson = JSON.stringify(heatPoints ?? []);
  const surgeJson = JSON.stringify(surgeZones ?? []);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #0E1726; }
    .map-tooltip {
      background: #0F1A2B;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      white-space: nowrap;
      max-width: 180px;
      white-space: normal;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }
    .map-tooltip::before { display: none; }
    .leaflet-tooltip-top.map-tooltip::before { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [${region.latitude}, ${region.longitude}],
      zoom: ${zoom},
      zoomControl: false,
      attributionControl: false,
      dragging: ${dragging},
      scrollWheelZoom: ${dragging},
      doubleClickZoom: ${dragging},
      touchZoom: ${dragging},
      keyboard: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    var markersLayer = L.layerGroup().addTo(map);
    var polylineLayer = L.layerGroup().addTo(map);
    var userMarkerLayer = L.layerGroup().addTo(map);
    var heatLayer = L.layerGroup().addTo(map);
    var surgeLayer = L.layerGroup().addTo(map);

    // SVG pin icon factory — colour is the fill of the pin body
    function makePinIcon(color) {
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">'
        + '<path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 24 14 24S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="' + color + '"/>'
        + '<circle cx="14" cy="14" r="6" fill="#FFFFFF"/>'
        + '</svg>';
      return L.divIcon({
        html: svg,
        className: '',
        iconSize: [28, 38],
        iconAnchor: [14, 38],
        tooltipAnchor: [0, -40],
      });
    }

    function renderPoints(points) {
      markersLayer.clearLayers();
      points.forEach(function(p) {
        // Pickup and drop-off get a pin icon; generic points get a circle
        var isPickup = p.id === 'pickup';
        var isDrop   = p.id === 'drop';
        var marker;
        if (isPickup || isDrop) {
          var color = isPickup ? '#1F4BFF' : '#FF3B47';
          marker = L.marker(
            [p.coordinate.latitude, p.coordinate.longitude],
            { icon: makePinIcon(color) }
          );
        } else {
          marker = L.circleMarker([p.coordinate.latitude, p.coordinate.longitude], {
            radius: 8,
            color: p.pinColor || '#1F4BFF',
            fillColor: p.pinColor || '#1F4BFF',
            fillOpacity: 1,
            weight: 2,
          });
        }
        if (p.title) {
          marker.bindTooltip(p.title, {
            permanent: (isPickup || isDrop),
            direction: 'top',
            className: 'map-tooltip',
            offset: [0, isPickup || isDrop ? -38 : -8],
          });
        }
        marker.addTo(markersLayer);
      });
    }

    function renderPath(path) {
      polylineLayer.clearLayers();
      if (path && path.length >= 2) {
        L.polyline(
          path.map(function(p) { return [p.latitude, p.longitude]; }),
          { color: '#FFB800', weight: 6, opacity: 0.85 }
        ).addTo(polylineLayer);
      }
    }

    function renderUser(user) {
      userMarkerLayer.clearLayers();
      if (user) {
        L.circleMarker([user.latitude, user.longitude], {
          radius: 9,
          color: '#FFFFFF',
          fillColor: '#FFB800',
          fillOpacity: 1,
          weight: 3,
        }).addTo(userMarkerLayer);
      }
    }

    function renderHeat(heatPoints) {
      heatLayer.clearLayers();
      heatPoints.forEach(function(hp) {
        if (hp && hp.latitude != null) {
          L.circleMarker([hp.latitude, hp.longitude], {
            radius: 5,
            color: 'rgba(255,80,0,0.6)',
            fillColor: 'rgba(255,80,0,0.4)',
            fillOpacity: 1,
            weight: 1,
          }).addTo(heatLayer);
        }
      });
    }

    function renderSurge(surgeZones) {
      surgeLayer.clearLayers();
      surgeZones.forEach(function(zone) {
        if (zone && zone.coordinates && zone.coordinates.length) {
          L.polyline(
            zone.coordinates.map(function(c) { return [c.latitude, c.longitude]; }),
            { color: 'rgba(255,80,0,0.6)', weight: 2 }
          ).addTo(surgeLayer);
        }
      });
    }

    // Initial render
    renderPoints(${pointsJson});
    renderPath(${pathJson});
    renderUser(${userJson});
    renderHeat(${heatJson});
    renderSurge(${surgeJson});

    // Listen for update messages from React Native
    document.addEventListener('message', function(e) {
      try {
        var msg = JSON.parse(e.data);
        if (msg.type === 'updateRegion') {
          map.setView([msg.latitude, msg.longitude], msg.zoom, { animate: true });
        }
        if (msg.type === 'updatePoints')  renderPoints(msg.points);
        if (msg.type === 'updatePath')    renderPath(msg.path);
        if (msg.type === 'updateUser')    renderUser(msg.user);
        if (msg.type === 'updateHeat')    renderHeat(msg.heatPoints);
        if (msg.type === 'updateSurge')   renderSurge(msg.surgeZones);
      } catch(err) {}
    });
  </script>
</body>
</html>`;
}

export function PlatformMap(props: Props) {
  const {
    height = '100%',
    initialRegion,
    points = [],
    path,
    userLocation,
    heatPoints = [],
    surgeZones = [],
  } = props;

  const webViewRef = useRef<any>(null);
  const mountedRef = useRef(false);

  const region = initialRegion ?? DEFAULT_REGION;

  /** Send a message to the Leaflet map inside the WebView */
  function postMessage(msg: object) {
    webViewRef.current?.postMessage(JSON.stringify(msg));
  }

  // After first mount, push incremental updates instead of rebuilding the HTML
  useEffect(() => {
    if (!mountedRef.current) return;
    postMessage({ type: 'updateRegion', latitude: region.latitude, longitude: region.longitude, zoom: computeZoom(region.latitudeDelta) });
  }, [region.latitude, region.longitude, region.latitudeDelta]);

  useEffect(() => {
    if (!mountedRef.current) return;
    postMessage({ type: 'updatePoints', points });
  }, [JSON.stringify(points)]);

  useEffect(() => {
    if (!mountedRef.current) return;
    postMessage({ type: 'updatePath', path: path ?? [] });
  }, [JSON.stringify(path)]);

  useEffect(() => {
    if (!mountedRef.current) return;
    postMessage({ type: 'updateUser', user: userLocation ?? null });
  }, [JSON.stringify(userLocation)]);

  useEffect(() => {
    if (!mountedRef.current) return;
    postMessage({ type: 'updateHeat', heatPoints });
  }, [JSON.stringify(heatPoints)]);

  useEffect(() => {
    if (!mountedRef.current) return;
    postMessage({ type: 'updateSurge', surgeZones });
  }, [JSON.stringify(surgeZones)]);

  return (
    <View style={[styles.wrap, { height: height as number | undefined }]} pointerEvents="auto">
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: buildMapHtml(props) }}
        style={StyleSheet.absoluteFill}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        onLoadEnd={() => { mountedRef.current = true; }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: '#0E1726',
  },
});
