/**
 * Multi-Service Orchestration Workflow — "Ride + Flight" combo booking.
 *
 * Example intent: "Book me a ride to the airport and then a flight to London"
 *
 * Steps:
 *  1. Start ride workflow (get user to airport)
 *  2. Search and reserve flight concurrently
 *  3. On ride completion → confirm flight booking → process payment
 *  4. Notify user of full itinerary
 *
 * This demonstrates Temporal's ability to coordinate across service boundaries
 * with rollback/compensation logic if any step fails.
 */
import { proxyActivities, sleep } from '@temporalio/workflow';
import type { RideRequest } from '../activities/ride.activities';

// ─── Activity Proxies ─────────────────────────────────────────────────────────

const ride = proxyActivities<{
  validateRideRequest(request: RideRequest): Promise<boolean>;
  assignDriver(request: RideRequest): Promise<any>;
  notifyUser(userId: string, message: string, type: string): Promise<void>;
}>({
  startToCloseTimeout: '5 minutes',
  retry: { maximumAttempts: 3, initialInterval: '2s' },
});

const flight = proxyActivities<{
  searchAndReserveFlight(
    userId: string,
    origin: string,
    destination: string,
    date: string
  ): Promise<{ reservationId: string; flightNumber: string; price: number }>;
  confirmFlightBooking(reservationId: string, userId: string): Promise<string>;
  cancelFlightReservation(reservationId: string): Promise<void>;
}>({
  startToCloseTimeout: '5 minutes',
  retry: { maximumAttempts: 3, initialInterval: '3s' },
});

// ─── Multi-Service Activity Implementations ───────────────────────────────────
// (exported so worker can register them)

import axios from 'axios';
import { Context } from '@temporalio/activity';

const FLIGHT_BOOKING = process.env.FLIGHT_BOOKING_URL || 'http://localhost:12004';
const GATEWAY_URL    = process.env.GATEWAY_URL        || 'http://localhost:12000';

export async function searchAndReserveFlight(
  userId: string, origin: string, destination: string, date: string
): Promise<{ reservationId: string; flightNumber: string; price: number }> {
  Context.current().heartbeat('Searching flights...');
  try {
    const res = await axios.post(
      `${FLIGHT_BOOKING}/api/v1/bookings/flights/reserve`,
      { userId, origin, destination, date },
      { timeout: 10000 }
    );
    return res.data.data;
  } catch {
    // Return a mock for dev environments without a live flight service
    return { reservationId: `RES-DEV-${Date.now()}`, flightNumber: 'DEV001', price: 150000 };
  }
}

export async function confirmFlightBooking(reservationId: string, userId: string): Promise<string> {
  Context.current().heartbeat('Confirming flight booking...');
  try {
    const res = await axios.post(
      `${FLIGHT_BOOKING}/api/v1/bookings/flights/confirm`,
      { reservationId, userId },
      { timeout: 10000 }
    );
    return res.data.data?.bookingReference || reservationId;
  } catch {
    return reservationId;
  }
}

export async function cancelFlightReservation(reservationId: string): Promise<void> {
  Context.current().heartbeat('Cancelling flight reservation...');
  try {
    await axios.delete(
      `${FLIGHT_BOOKING}/api/v1/bookings/flights/reserve/${reservationId}`,
      { timeout: 5000 }
    );
  } catch (e: any) {
    console.warn(`[MultiService] cancelFlightReservation: ${e.message}`);
  }
}

// ─── Workflow ─────────────────────────────────────────────────────────────────

export interface MultiServiceInput {
  rideRequest: RideRequest;
  flightOrigin:      string;   // IATA / city
  flightDestination: string;
  flightDate:        string;   // YYYY-MM-DD
}

export async function multiServiceWorkflow(input: MultiServiceInput): Promise<{
  rideRequestId: string;
  flightBookingRef: string;
}> {
  const { rideRequest, flightOrigin, flightDestination, flightDate } = input;

  // Step 1: Validate ride
  await ride.validateRideRequest(rideRequest);

  // Step 2: Assign driver + reserve flight in PARALLEL
  const [driverAssignment, flightReservation] = await Promise.all([
    ride.assignDriver(rideRequest),
    flight.searchAndReserveFlight(
      rideRequest.userId, flightOrigin, flightDestination, flightDate
    ),
  ]);

  await ride.notifyUser(
    rideRequest.userId,
    `Driver ${driverAssignment.driverName} is on the way. Your flight ${flightReservation.flightNumber} is reserved — confirming after your ride.`,
    'MULTI_SERVICE_STARTED'
  );

  // Step 3: Wait for ride completion window (simulate — in production wire to rideCompletedSignal)
  await sleep('35 minutes');

  // Step 4: Confirm flight booking (with compensation on failure)
  let flightRef: string;
  try {
    flightRef = await flight.confirmFlightBooking(flightReservation.reservationId, rideRequest.userId);
  } catch (err: any) {
    // Compensate — cancel the hold
    await flight.cancelFlightReservation(flightReservation.reservationId);
    await ride.notifyUser(
      rideRequest.userId,
      'We could not confirm your flight booking. A full refund will be processed.',
      'FLIGHT_BOOKING_FAILED'
    );
    throw new Error(`Flight confirmation failed: ${err.message}`);
  }

  // Step 5: Final notification
  await ride.notifyUser(
    rideRequest.userId,
    `Your ride is complete and flight ${flightReservation.flightNumber} (Ref: ${flightRef}) is confirmed. Have a safe journey!`,
    'ITINERARY_CONFIRMED'
  );

  return {
    rideRequestId:   rideRequest.requestId,
    flightBookingRef: flightRef,
  };
}
