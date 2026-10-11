import axios from 'axios';
const { getAllInfoByISO, getParamByISO } = require('iso-country-currency');

export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
}

export class CurrencyService {
  private static rateCache: Record<string, { rate: number; expiry: number }> = {};
  private static CACHE_TTL = 3600000; // 1 hour

  /**
   * Reverse geocode using BigDataCloud (Free / No Key for simple client usage)
   */
  static async getCountryCode(lat: number, lng: number): Promise<string> {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
      const response = await axios.get(url);
      return response.data.countryCode || 'NG'; // Fallback to Nigeria
    } catch (e) {
      console.error('[CurrencyService] Geocoding error:', e);
      return 'NG';
    }
  }

  /**
   * Fetch exchange rate from NGN to target using fawazahmed0/exchange-api
   */
  static async getRate(targetCurrency: string): Promise<number> {
    const target = targetCurrency.toLowerCase();

    // Check cache
    const cached = this.rateCache[target];
    if (cached && cached.expiry > Date.now()) {
      return cached.rate;
    }

    try {
      // Base is assumed to be USD for this platform
      const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`;
      console.log(`[CurrencyService] Fetching rate for ${target} from ${url}`);
      const response = await axios.get(url);
      const rate = response.data.usd[target];
      
      console.log(`[CurrencyService] Rate for ${target}: ${rate}`);

      if (rate) {
        this.rateCache[target] = { rate, expiry: Date.now() + this.CACHE_TTL };
        return rate;
      }
      console.warn(`[CurrencyService] Rate for ${target} not found in API response. Using fallback.`);
      return 1500; // Realistic fallback for NGN if rate missing
    } catch (e: any) {
      console.error('[CurrencyService] Exchange rate error:', e.message);
      return 1500; // Realistic fallback
    }
  }

  static async getLocalCurrencyInfo(lat?: number, lng?: number, countryCode?: string): Promise<CurrencyInfo> {
    let iso = countryCode;
    if (!iso && lat && lng) {
      iso = await this.getCountryCode(lat, lng);
    }
    
    // Default to NG if still unknown
    iso = iso || 'NG';

    try {
      const info = getAllInfoByISO(iso);
      if (info) {
        const rate = await this.getRate(info.currency);
        return {
          code: info.currency,
          symbol: info.symbol,
          rate: rate
        };
      }
    } catch (e) {
      console.warn(`[CurrencyService] Library info for ${iso} failed, using fallback.`);
    }

    // Fallback to NGN
    return {
      code: 'NGN',
      symbol: '₦',
      rate: 1500
    };
  }
}
