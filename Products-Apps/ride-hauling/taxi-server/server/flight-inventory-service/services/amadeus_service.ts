const Amadeus = require('amadeus');

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

const amadeus = (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET || AMADEUS_CLIENT_ID === 'PUT_YOURS')
  ? null
  : new Amadeus({
      clientId: AMADEUS_CLIENT_ID,
      clientSecret: AMADEUS_CLIENT_SECRET
    });

export default class AmadeusService {
  /**
   * Search for flight offers based on criteria
   */
  static async searchFlightOffers(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    adults: number;
    travelClass?: string;
  }) {
    if (!amadeus) {
      console.warn('[AmadeusService] Credentials not configured. Skipping searchFlightOffers.');
      return [];
    }
    try {
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        adults: params.adults,
        travelClass: params.travelClass || 'ECONOMY',
        max: 20 // limit results for speed
      });

      return response.data;
    } catch (error) {
      console.error('Amadeus searchFlightOffers Error:', error);
      return [];
    }
  }

  /**
   * Search for airports/cities by keyword
   */
  static async searchLocations(keyword: string) {
    if (!amadeus) {
      console.warn('[AmadeusService] Credentials not configured. Skipping searchLocations.');
      return [];
    }
    try {
      const response = await amadeus.referenceData.locations.get({
        keyword,
        subType: Amadeus.location.any
      });
      return response.data;
    } catch (error) {
      console.error('Amadeus searchLocations Error:', error);
      return [];
    }
  }

  /**
   * Get specific flight price confirmation
   */
  static async confirmPrice(flightOffer: any) {
    if (!amadeus) {
      console.warn('[AmadeusService] Credentials not configured. Skipping confirmPrice.');
      return { status: 'mocked', price: flightOffer.price };
    }
    try {
      const response = await amadeus.shopping.flightOffers.pricing.post(
        JSON.stringify({
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [flightOffer]
          }
        })
      );
      return response.data;
    } catch (error) {
      console.error('Amadeus confirmPrice Error:', error);
      throw error;
    }
  }
}
