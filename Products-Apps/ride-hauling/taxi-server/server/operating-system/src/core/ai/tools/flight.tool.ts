/**
 * Flight Tool — allows the AI agent to search for available flights.
 * Calls the Flight Inventory Service REST API.
 */
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';

const FLIGHT_INVENTORY = process.env.FLIGHT_INVENTORY_URL || 'http://localhost:12003';

const FlightSearchSchema = z.object({
  origin: z.string().describe('IATA code or city name for departure (e.g. LOS, LAG, Lagos)'),
  destination: z.string().describe('IATA code or city name for arrival (e.g. ABV, LHR, London)'),
  date: z.string().describe('Departure date in YYYY-MM-DD format'),
  passengers: z.number().default(1).describe('Number of passengers'),
});

export class BookFlightTool extends StructuredTool {
  name = 'search_flights';
  description = `
    Use this tool when the user wants to book, find, or search for a flight.
    Returns available flight options for the given route and date.
  `.trim();

  schema = FlightSearchSchema as any;

  async _call(input: z.infer<typeof FlightSearchSchema>): Promise<string> {
    try {
      const response = await axios.get(`${FLIGHT_INVENTORY}/api/v1/flights/search`, {
        params: {
          origin:      input.origin,
          destination: input.destination,
          date:        input.date,
          passengers:  input.passengers,
        },
        timeout: 8000,
      });

      const flights = response.data.data || [];
      if (!flights.length) {
        return JSON.stringify({
          success: false,
          message: `No flights found from ${input.origin} to ${input.destination} on ${input.date}.`,
        });
      }

      return JSON.stringify({
        success: true,
        count: flights.length,
        flights: flights.slice(0, 5).map((f: any) => ({
          flightNumber: f.flightNumber,
          airline:      f.airline,
          departure:    f.departureTime,
          arrival:      f.arrivalTime,
          price:        f.price,
          class:        f.class,
        })),
      });
    } catch (err: any) {
      return JSON.stringify({
        success: false,
        message: `Flight search failed: ${err.message}`,
      });
    }
  }
}
