import { LatLngDTO } from '../api/dto';

export type SimulationPoint = {
  latitude: number;
  longitude: number;
};

const isValid = (p: any): p is LatLngDTO => {
  return p && typeof p === 'object' && typeof p.latitude === 'number' && typeof p.longitude === 'number';
};

export const lerp = (start: LatLngDTO, end: LatLngDTO, t: number): LatLngDTO => ({
  latitude: start.latitude + (end.latitude - start.latitude) * t,
  longitude: start.longitude + (end.longitude - start.longitude) * t,
});

export const getDistance = (a: LatLngDTO, b: LatLngDTO): number => {
  const dlat = a.latitude - b.latitude;
  const dlng = a.longitude - b.longitude;
  return Math.sqrt(dlat * dlat + dlng * dlng);
};

// Simplified path interpolation for navigation
export function interpolatePath(path: LatLngDTO[], t: number): LatLngDTO {
  if (!path || path.length === 0) return { latitude: 0, longitude: 0 };

  // Filter out any invalid entries that snuck into the path
  const clean = path.filter(isValid);
  if (clean.length < 2) return clean[0] || { latitude: 0, longitude: 0 };

  const totalSegments = clean.length - 1;
  const exactSegment = t * totalSegments;
  const segmentIndex = Math.floor(exactSegment);
  const segmentT = exactSegment - segmentIndex;

  const start = clean[Math.min(segmentIndex, clean.length - 2)];
  const end = clean[Math.min(segmentIndex + 1, clean.length - 1)];

  return lerp(start, end, segmentT);
}
