import { LatLng } from 'react-native-maps';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving/';

export async function getRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<{ points: LatLng[]; distanceKm: number; durationMin: number }> {
  try {
    const url = `${OSRM_URL}${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const coords = data.routes[0].geometry.coordinates
      .filter((c: unknown) => Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number')
      .map(([lng, lat]: [number, number]) => ({ latitude: lat, longitude: lng }));

    if (coords.length < 2) throw new Error('Route has too few valid points');

    return {
      points: coords,
      distanceKm: data.routes[0].distance / 1000,
      durationMin: data.routes[0].duration / 60,
    };
  } catch (error) {
    console.error('Routing error:', error);
    // Fallback to straight line
    return {
      points: [
        { latitude: origin.latitude, longitude: origin.longitude },
        { latitude: destination.latitude, longitude: destination.longitude }
      ],
      distanceKm: 0,
      durationMin: 0
    };
  }
}
