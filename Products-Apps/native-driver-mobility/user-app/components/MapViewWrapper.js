import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

const FALLBACK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#070B1A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9CA3AF' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#070B1A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#141828' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#E5E7EB' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0D1236' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#141828' }] },
];

export default function MapViewWrapper(props) {
  const { style, ...otherProps } = props;

  return (
    <MapView
      mapType="none"
      customMapStyle={isAndroid ? FALLBACK_STYLE : []}
      style={[styles.map, style]}
      {...otherProps}
    >
      <UrlTile
        urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        maximumZ={20}
        flipY={false}
        tileSize={256}
        zIndex={1}
        tileCachePath={isIOS ? 'osm-tile-cache' : undefined}
        tileCacheMaxAge={isIOS ? 7 * 24 * 60 * 60 * 1000 : undefined}
      />
      {props.children}
    </MapView>
  );
}

export { Marker, Polyline };

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%' },
});
