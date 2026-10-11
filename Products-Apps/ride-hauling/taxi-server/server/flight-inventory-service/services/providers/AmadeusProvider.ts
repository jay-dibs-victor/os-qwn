import { BaseFlightProvider, FlightSearchParams, StandardFlight } from './BaseFlightProvider';
const Amadeus = require('amadeus');

const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

const amadeus = (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET || AMADEUS_CLIENT_ID === 'PUT_YOURS') 
  ? null 
  : new Amadeus({
      clientId: AMADEUS_CLIENT_ID,
      clientSecret: AMADEUS_CLIENT_SECRET
    });

export class AmadeusProvider extends BaseFlightProvider {
  public name = 'amadeus';

  async searchFlights(params: FlightSearchParams): Promise<StandardFlight[]> {
    if (!amadeus) {
      console.warn('[AmadeusProvider] Missing credentials, skipping search.');
      return [];
    }
    try {
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        adults: params.adults,
        travelClass: params.travelClass || 'ECONOMY',
        max: 20
      });

      return response.data.map((offer: any) => this.normalize(offer));
    } catch (error) {
      console.error('[AmadeusProvider] Error:', error.message);
      return [];
    }
  }

  private normalize(offer: any): StandardFlight {
    const segment = offer.itineraries[0].segments[0];
    return {
      id: `ext-amadeus-${offer.id}`,
      flight_number: `${segment.carrierCode}${segment.number}`,
      airline: segment.carrierCode,
      departure_airport_id: segment.departure.iataCode,
      arrival_airport_id: segment.arrival.iataCode,
      departure_time: segment.departure.at,
      arrival_time: segment.arrival.at,
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      source: this.name,
      raw_data: offer
    };
  }
}
