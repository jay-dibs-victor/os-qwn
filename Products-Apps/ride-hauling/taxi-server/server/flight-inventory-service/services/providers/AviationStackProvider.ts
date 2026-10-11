import { BaseFlightProvider, FlightSearchParams, StandardFlight } from './BaseFlightProvider';
import axios from 'axios';

export class AviationStackProvider extends BaseFlightProvider {
  public name = 'aviationstack';
  private apiKey = (process.env.AVIATION_STACK_API_KEY && process.env.AVIATION_STACK_API_KEY !== 'PUT_YOURS')
    || (process.env.AVIATIONSTACK_API_KEY && process.env.AVIATIONSTACK_API_KEY !== 'PUT_YOURS')
    ? (process.env.AVIATION_STACK_API_KEY || process.env.AVIATIONSTACK_API_KEY)
    : null;

  async searchFlights(params: FlightSearchParams): Promise<StandardFlight[]> {
    if (!this.apiKey) {
      console.warn('[AviationStackProvider] Missing API key, skipping search.');
      return [];
    }
    try {
      const response = await axios.get('http://api.aviationstack.com/v1/flights', {
        params: {
          access_key: this.apiKey,
          dep_iata: params.originLocationCode,
          arr_iata: params.destinationLocationCode,
          limit: 10
        }
      });

      const flights = response.data.data || [];
      return flights.map((f: any) => this.normalize(f));
    } catch (error) {
      console.error('[AviationStackProvider] Error:', error.message);
      return [];
    }
  }

  private normalize(flight: any): StandardFlight {
    return {
      id: `ext-avstack-${flight.flight.iata}`,
      flight_number: flight.flight.iata,
      airline: flight.airline.name,
      departure_airport_id: flight.departure.iata,
      arrival_airport_id: flight.arrival.iata,
      departure_time: flight.departure.scheduled,
      arrival_time: flight.arrival.scheduled,
      price: 0, // AviationStack doesn't usually provide real-time consumer prices in the free tier
      currency: 'USD',
      source: this.name,
      status: flight.flight_status,
      gate: flight.departure.gate,
      terminal: flight.departure.terminal,
      raw_data: flight
    };
  }
}
