import { AmadeusProvider } from './AmadeusProvider';
import { AviationStackProvider } from './AviationStackProvider';
import { BaseFlightProvider, FlightSearchParams, StandardFlight } from './BaseFlightProvider';

export class FlightOrchestrator {
  private providers: BaseFlightProvider[];

  constructor() {
    this.providers = [
      new AviationStackProvider(),
      new AmadeusProvider()
    ];
  }

  async searchAll(params: FlightSearchParams): Promise<StandardFlight[]> {
    console.log(`[Orchestrator] Searching across ${this.providers.length} providers...`);
    
    const results = await Promise.allSettled(
      this.providers.map(p => p.searchFlights(params))
    );

    const allFlights: StandardFlight[] = [];
    
    results.forEach((res) => {
      if (res.status === 'fulfilled') {
        allFlights.push(...res.value);
      }
    });

    return this.correlateAndDeduplicate(allFlights);
  }

  /**
   * Correlates flights from different providers by flight number.
   * If Amadeus has the price and AviationStack has the gate info, it merges them.
   */
  private correlateAndDeduplicate(flights: StandardFlight[]): StandardFlight[] {
    const flightMap = new Map<string, StandardFlight>();

    flights.forEach(f => {
      const key = `${f.flight_number}-${f.departure_time.split('T')[0]}`;
      if (flightMap.has(key)) {
        const existing = flightMap.get(key)!;
        // Merge strategy: Keep price from Amadeus, status/gate from AviationStack
        flightMap.set(key, {
          ...existing,
          price: existing.price || f.price,
          status: existing.status || f.status,
          gate: existing.gate || f.gate,
          terminal: existing.terminal || f.terminal,
          raw_data: { ...existing.raw_data, ...f.raw_data }
        });
      } else {
        flightMap.set(key, f);
      }
    });

    return Array.from(flightMap.values());
  }
}

export default new FlightOrchestrator();
