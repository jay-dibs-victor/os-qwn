import axios from 'axios';

const FLIGHT_INVENTORY_URL = process.env.FLIGHT_INVENTORY_URL || 'http://flight-inventory-service:12003';
const FLIGHT_BOOKING_URL = process.env.FLIGHT_BOOKING_URL || 'http://flight-booking-service:12004';

export async function checkFlightStatus(passengerId: string): Promise<any> {
  try {
    // 1. Fetch active bookings for this user
    const bookingsResp = await axios.get(`${FLIGHT_BOOKING_URL}/api/v1/bookings/user/${passengerId}`);
    const bookings = bookingsResp.data.data;

    if (!bookings || bookings.length === 0) return null;

    // 2. Get the latest booking
    const latestBooking = bookings[0];
    
    // 3. Check status of the flight
    const flightResp = await axios.get(`${FLIGHT_INVENTORY_URL}/api/v1/flights/${latestBooking.flight_id}`);
    const flight = flightResp.data.data;

    return {
      bookingId: latestBooking.id,
      flightNumber: flight.flight_number,
      departureTime: flight.departure_time,
      status: flight.status || 'ON_TIME', // Mocking status if not in DB
      source: flight.source_airport_id,
      destination: flight.arrival_airport_id
    };
  } catch (err) {
    console.error('[FlightActivities] Error checking flight status:', err);
    return null;
  }
}

/**
 * Phase 2: Predictive Terminal Mapping (The "Perfect Timing" Engine)
 * Learns the infrastructure of the destination airport to calculate exact baggage claim wait times.
 * Dispatches the driver so they pull up the exact moment the user exits the terminal.
 */
export async function calculateTerminalBuffer(airportCode: string, isInternational: boolean): Promise<number> {
  console.log(`✈️ [Oracle] Calculating Predictive Terminal Buffer for airport: ${airportCode}`);
  
  // Simulated ML model based on historical airport infrastructure data
  const baseDisembarkTime = 15; // minutes to leave the plane
  let baggageClaimTime = 0;
  let customsTime = 0;

  switch (airportCode.toUpperCase()) {
    case 'LOS': // Lagos Murtala Muhammed
      baggageClaimTime = 34;
      customsTime = isInternational ? 45 : 0;
      break;
    case 'LHR': // London Heathrow
      baggageClaimTime = 25;
      customsTime = isInternational ? 30 : 0;
      break;
    case 'JFK': // New York JFK
      baggageClaimTime = 40;
      customsTime = isInternational ? 60 : 0;
      break;
    default:
      baggageClaimTime = 20;
      customsTime = isInternational ? 30 : 0;
  }

  const totalBufferMinutes = baseDisembarkTime + baggageClaimTime + customsTime;
  console.log(`⏱️ [Oracle] Terminal Buffer calculated: ${totalBufferMinutes} minutes until user exits terminal.`);
  
  return totalBufferMinutes;
}

/**
 * Phase 2: The ADS-B Flight Sentinel
 * Simulates subscribing to live public aviation radar data (e.g., OpenSky Network).
 * Detects flight anomalies (like holding patterns) before the airline officially updates the API.
 */
export async function monitorADSBTelemetry(flightNumber: string): Promise<any> {
  console.log(`🛰️ [Sentinel] Subscribing to live ADS-B radar telemetry for flight: ${flightNumber}`);
  
  // Simulated Open-Source Radar Data
  const altitude = Math.floor(Math.random() * (35000 - 10000 + 1) + 10000); // 10k to 35k feet
  const groundSpeed = Math.floor(Math.random() * (500 - 300 + 1) + 300); // 300 to 500 knots
  
  // Simulate detecting a holding pattern (e.g., flying in circles at 10k feet)
  const isHoldingPattern = altitude < 15000 && Math.random() > 0.8; 

  if (isHoldingPattern) {
    console.warn(`⚠️ [Sentinel] ANOMALY DETECTED: Flight ${flightNumber} has entered a holding pattern.`);
    return {
      anomaly: true,
      reason: 'HOLDING_PATTERN_DETECTED',
      estimatedDelayAdded: 30, // Adds 30 minutes to pickup time automatically
      altitude,
      groundSpeed
    };
  }

  return { anomaly: false, altitude, groundSpeed };
}
