export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  adults: number;
  travelClass?: string;
}

export interface StandardFlight {
  id: string;
  flight_number: string;
  airline?: string;
  departure_airport_id: string;
  arrival_airport_id: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  currency: string;
  source: string;
  status?: string;
  gate?: string;
  terminal?: string;
  raw_data?: any;
}

export abstract class BaseFlightProvider {
  abstract name: string;
  abstract searchFlights(params: FlightSearchParams): Promise<StandardFlight[]>;
}
