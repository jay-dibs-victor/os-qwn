const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';

let lastRequest = 0;

export async function searchLocations(query) {
  if (!query || query.length < 2) return [];

  const now = Date.now();
  const waitTime = Math.max(0, 1100 - (now - lastRequest));
  if (waitTime > 0) {
    await new Promise((r) => setTimeout(r, waitTime));
  }
  lastRequest = Date.now();

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: 6,
    countrycodes: 'NG',
    addressdetails: '1',
  });

  try {
    const res = await fetch(`${NOMINATIM_BASE}?${params}`, {
      headers: { 'User-Agent': 'QueensOS/1.0 (ride-booking)' },
    });
    if (!res.ok) throw new Error('Geocode request failed');
    const data = await res.json();
    return data.map((item) => ({
      name: item.display_name.split(',')[0].trim(),
      fullAddress: item.display_name,
      coords: [parseFloat(item.lat), parseFloat(item.lon)],
      type: item.type,
    }));
  } catch {
    return [];
  }
}

let lastReverseRequest = 0;

export async function reverseGeocode(lat, lng) {
  const now = Date.now();
  const waitTime = Math.max(0, 1100 - (now - lastReverseRequest));
  if (waitTime > 0) {
    await new Promise((r) => setTimeout(r, waitTime));
  }
  lastReverseRequest = Date.now();

  const params = new URLSearchParams({
    lat,
    lon: lng,
    format: 'json',
    addressdetails: '1',
  });

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: { 'User-Agent': 'QueensOS/1.0 (ride-booking)' },
    });
    if (!res.ok) throw new Error('Reverse geocode failed');
    const data = await res.json();
    if (!data || !data.display_name) {
      return { name: `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`, fullAddress: '', coords: [lat, lng] };
    }
    return {
      name: data.display_name.split(',')[0].trim(),
      fullAddress: data.display_name,
      coords: [lat, lng],
    };
  } catch {
    return { name: `Location near ${lat.toFixed(4)}, ${lng.toFixed(4)}`, fullAddress: '', coords: [lat, lng] };
  }
}
