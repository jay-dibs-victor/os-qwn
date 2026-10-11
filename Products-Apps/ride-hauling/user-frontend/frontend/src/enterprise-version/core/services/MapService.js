import axios from 'axios';

const PROVIDER = import.meta.env.VITE_MAP_PROVIDER || 'OSM';
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const MapService = {
  searchAddress: async (query) => {
    if (PROVIDER === 'GOOGLE' && GOOGLE_KEY) {
      // For Google, we usually use the Autocomplete widget, 
      // but if we need a manual API call:
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_KEY}`;
      const resp = await axios.get(url);
      return resp.data.results.map(item => ({
        address: item.formatted_address,
        lat: item.geometry.location.lat,
        lng: item.geometry.location.lng
      }));
    } else {
      // Default OSM (Nominatim)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
      const resp = await axios.get(url, { 
        headers: { 
          'Accept-Language': 'en'
        } 
      });
      return resp.data.map(item => ({
        address: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));
    }
  },

  reverseGeocode: async (lat, lng) => {
    if (PROVIDER === 'GOOGLE' && GOOGLE_KEY) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`;
      const resp = await axios.get(url);
      return resp.data.results[0]?.formatted_address;
    } else {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const resp = await axios.get(url, { 
        headers: { 
          'Accept-Language': 'en'
        } 
      });
      return resp.data.display_name;
    }
  },

  getDirections: async (start, end) => {
    if (PROVIDER === 'GOOGLE' && GOOGLE_KEY) {
      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&key=${GOOGLE_KEY}`;
        const resp = await axios.get(url);
        if (resp.data.status !== 'OK') throw new Error(resp.data.error_message || 'Directions failed');
        
        const route = resp.data.routes[0];
        return {
          path: decodePolyline(route.overview_polyline.points),
          distance: route.legs[0].distance.value / 1000,
          duration: route.legs[0].duration.text,
          steps: route.legs[0].steps.map(s => ({
            instruction: s.html_instructions.replace(/<[^>]*>/g, ''),
            distance: s.distance.value,
            maneuver: s.maneuver,
            end_location: {
              lat: typeof s.end_location.lat === 'function' ? s.end_location.lat() : s.end_location.lat,
              lng: typeof s.end_location.lng === 'function' ? s.end_location.lng() : s.end_location.lng
            }
          }))
        };
      } catch (err) {
        console.error('Google Directions Error, falling back to OSRM:', err);
        return MapService.getOSRMDirections(start, end);
      }
    } else {
      return MapService.getOSRMDirections(start, end);
    }
  },

  getOSRMDirections: async (start, end) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
    const resp = await axios.get(url);
    if (!resp.data.routes || resp.data.routes.length === 0) throw new Error('No route found');
    
    const route = resp.data.routes[0];
    return {
      path: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
      distance: route.distance / 1000,
      duration: Math.round(route.duration / 60) + ' mins',
      steps: route.legs[0].steps.map(s => ({
        instruction: s.maneuver.type + ' ' + (s.name || ''),
        distance: s.distance,
        maneuver: s.maneuver.type,
        end_location: {
          lat: s.maneuver.location[1],
          lng: s.maneuver.location[0]
        }
      }))
    };
  },

  calculateDistance: (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  }
};

// Polyline decoder for Google format if needed
function decodePolyline(t, e) {
  for (var n, o, r = 0, l = 0, i = 0, a = [], c = 0, u = 0, s = null, d = Math.pow(10, e || 5); r < t.length; ) {
    s = null, c = 0, u = 0;
    do s = t.charCodeAt(r++) - 63, u |= (31 & s) << c, c += 5; while (s >= 32);
    n = 1 & u ? ~(u >> 1) : u >> 1, c = u = 0;
    do s = t.charCodeAt(r++) - 63, u |= (31 & s) << c, c += 5; while (s >= 32);
    o = 1 & u ? ~(u >> 1) : u >> 1, l += n, i += o, a.push([l / d, i / d]);
  }
  return a;
}
