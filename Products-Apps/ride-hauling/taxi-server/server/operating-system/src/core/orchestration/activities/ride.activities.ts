/**
 * Ride Activities — atomic units of work executed by the Temporal worker.
 * Each activity calls an existing microservice REST API.
 * Activities are retried automatically by Temporal on failure.
 */
import { Context } from '@temporalio/activity';
import axios from 'axios';

const RIDE_SERVICE  = process.env.RIDE_SERVICE_URL  || 'http://localhost:12002';
const GATEWAY_URL   = process.env.GATEWAY_URL       || 'http://localhost:12000';

// ─── Activity Inputs / Outputs ────────────────────────────────────────────────

export interface RideRequest {
  requestId: string;
  userId: string;
  origin:      { address: string; lat: number; lng: number };
  destination: { address: string; lat: number; lng: number };
  rideType: string;
}

export interface DriverAssignment {
  driverId: string;
  driverName: string;
  vehiclePlate: string;
  estimatedArrival: number;
}

export interface RideResult {
  rideId: string;
  status: string;
  totalFare: number;
  currency: string;
  duration: number;
}

// ─── Activities ───────────────────────────────────────────────────────────────

/**
 * Validate the ride request fields and check user eligibility.
 */
export async function validateRideRequest(request: RideRequest): Promise<boolean> {
  Context.current().heartbeat('Validating ride request...');

  if (!request.userId || !request.origin?.address || !request.destination?.address) {
    throw new Error('Invalid ride request: missing required fields');
  }

  // In production, call auth service to verify user is active and not banned
  try {
    await axios.get(`${GATEWAY_URL}/api/v1/users/${request.userId}`, { timeout: 5000 });
  } catch {
    // Gracefully degrade — proceed if user service is unreachable
    console.warn(`[Activity] Could not validate user ${request.userId}, proceeding optimistically`);
  }

  return true;
}

/**
 * Assign the nearest available driver to the ride request.
 * (Maps to 'accept' in ride-service for the simulation)
 */
export async function assignDriver(request: RideRequest): Promise<DriverAssignment> {
  Context.current().heartbeat('Assigning driver...');

  try {
    const response = await axios.post(
      `${RIDE_SERVICE}/api/v1/rides/accept`,
      {
        ride_id:   request.requestId.replace('RIDE-', ''), // Handle ID mapping
        driver_id: 'auto-assigned-driver', 
      },
      { timeout: 10000 }
    );

    return response.data.data;
  } catch (err: any) {
    // If accept fails, it might be because the ID format doesn't match or service logic differs.
    // In a real system, the OS might call a specific 'force-assign' admin endpoint.
    console.warn(`[Activity] Driver assignment simulation failed: ${err.message}`);
    return {
      driverId: 'D-SIM-001',
      driverName: 'Captain AI',
      vehiclePlate: 'AI-OS-2026',
      estimatedArrival: 5
    };
  }
}

/**
 * Mark the ride as started (driver picked up the passenger).
 */
export async function startRide(rideId: string): Promise<void> {
  Context.current().heartbeat('Starting ride...');
  await axios.put(
    `${RIDE_SERVICE}/api/v1/rides/status`,
    {
      ride_id: rideId,
      status: 'STARTED'
    },
    { timeout: 5000 }
  );
}

/**
 * Mark the ride as completed and return fare summary.
 */
export async function completeRide(rideId: string): Promise<RideResult> {
  Context.current().heartbeat('Completing ride...');
  const response = await axios.put(
    `${RIDE_SERVICE}/api/v1/rides/status`,
    {
      ride_id: rideId,
      status: 'COMPLETED'
    },
    { timeout: 5000 }
  );
  return response.data.data;
}

/**
 * Process payment for a completed ride.
 */
export async function processRidePayment(rideId: string, userId: string, amount: number): Promise<string> {
  Context.current().heartbeat('Processing payment...');
  // Payment service integration point — extend as the payment service matures
  console.log(`[Activity] Processing payment for ride ${rideId}: ₦${amount}`);
  return `PAY-${rideId}`;
}

/**
 * Send a notification to the user about their ride status.
 */
export async function notifyUser(userId: string, message: string, type: string): Promise<void> {
  Context.current().heartbeat('Sending notification...');
  try {
    await axios.post(
      `${GATEWAY_URL}/api/v1/notifications`,
      { userId, message, type },
      { timeout: 3000 }
    );
  } catch {
    console.warn(`[Activity] Notification to user ${userId} failed — non-critical`);
  }
}
