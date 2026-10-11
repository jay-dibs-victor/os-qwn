import geoip from 'geoip-lite';
import axios from 'axios';

export interface LocationData {
  countryCode: string; // ISO 3166-1 alpha-2
  region?: string;
  city?: string;
  ip?: string;
  method: 'GPS' | 'IP' | 'DEFAULT';
}

export class LocationService {
  /**
   * Detect country from IP address
   */
  static async detectFromIP(ip: string): Promise<LocationData | null> {
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      // Localhost handling - try external API for real IP
      try {
        const response = await axios.get('https://ip-api.com/json/');
        if (response.data && response.data.countryCode) {
          return {
            countryCode: response.data.countryCode,
            region: response.data.regionName,
            city: response.data.city,
            ip: response.data.query,
            method: 'IP'
          };
        }
      } catch (e) {
        return null;
      }
    }

    const geo = geoip.lookup(ip);
    if (geo) {
      return {
        countryCode: geo.country,
        region: geo.region,
        city: geo.city,
        ip: ip,
        method: 'IP'
      };
    }

    return null;
  }

  /**
   * Reverse geocode GPS to country (Fallback to IP if coords missing)
   */
  static async detectFromCoords(lat?: number, lng?: number, ip?: string): Promise<LocationData> {
    if (lat && lng) {
      try {
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
        const response = await axios.get(url);
        if (response.data && response.data.countryCode) {
          return {
            countryCode: response.data.countryCode,
            method: 'GPS'
          };
        }
      } catch (e) {
        console.error('[LocationService] GPS Geocoding failed:', e);
      }
    }

    // Fallback to IP
    if (ip) {
      const ipResult = await this.detectFromIP(ip);
      if (ipResult) return ipResult;
    }

    // Ultimate Fallback
    return {
      countryCode: 'NG',
      method: 'DEFAULT'
    };
  }
}
