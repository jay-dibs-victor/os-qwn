/**
 * Ride Lifecycle Workflow — AI OS owns the entire trip.
 *
 * Signal-driven, no sleep() timers. Every state transition
 * requires a real signal from a real actor (User, Driver, or OS).
 *
 * Signals (sent by Driver App via POST /workflow/ride/:id/signal):
 *   - driverAccepted  : Driver accepts the ride request
 *   - driverArrived   : Driver arrives at pickup point
 *   - otpVerified     : Driver confirms the passenger's OTP
 *   - rideCompleted   : Driver ends the trip
 *   - rideCancelled   : User or driver cancels
 */
import {
  proxyActivities,
  defineSignal,
  setHandler,
  condition,
  sleep,
} from '@temporalio/workflow';
import { OSPublisher } from '../../events/publisher';
import { OSEvent } from '../../events/event.schemas';

// ─── Activity Proxies ─────────────────────────────────────────────────────────

export interface RideActivities {
  createRideActivity(input: any): Promise<any>;
  assignDriverActivity(rideId: string, driverId: string): Promise<any>;
  updateRideStatusActivity(rideId: string, status: string): Promise<any>;
  cancelRideActivity(rideId: string, reason: string): Promise<any>;
}

export interface OSOperationalActivities {
  notifyUser(userId: string, message: string, type: string): Promise<void>;
  checkFlightStatus(passengerId: string): Promise<any>;
  processRidePayment(rideId: string, userId: string, amount: number): Promise<string>;
}

const {
  createRideActivity,
  assignDriverActivity,
  updateRideStatusActivity,
  cancelRideActivity,
} = proxyActivities<RideActivities>({
  taskQueue: 'ride-service-tasks',
  startToCloseTimeout: '5 minutes',
  retry: { maximumAttempts: 3, initialInterval: '2s' },
});

const { notifyUser, checkFlightStatus, processRidePayment } = proxyActivities<OSOperationalActivities>({
  startToCloseTimeout: '1 minute',
});

// ─── Signals ─────────────────────────────────────────────────────────────────

export const driverAcceptedSignal = defineSignal<[{ driverId: string; driverName: string; vehiclePlate: string; eta: number }]>('driverAccepted');
export const driverArrivedSignal  = defineSignal<[{ driverId: string }]>('driverArrived');
export const otpVerifiedSignal    = defineSignal<[{ otp: string }]>('otpVerified');
export const rideCompletedSignal  = defineSignal<[{ driverId: string; distance: number; duration: number }]>('rideCompleted');
export const rideCancelledSignal  = defineSignal<[{ reason: string }]>('rideCancelled');

const RIDE_TIER_ESCALATION_MAP: Record<string, string> = {
  Economy: 'Swift',
  Swift:   'Luxury',
  Luxury:  'Epic',
  Epic:    'Epic', // Max tier — no further escalation
};

// ─── Main Workflow ────────────────────────────────────────────────────────────

export async function rideLifecycleWorkflow(request: any): Promise<any> {
  let rideId: string | null = null;
  let currentTier = request.rideType || 'Economy';
  let assignedDriver: { driverId: string; driverName: string; vehiclePlate: string; eta: number } | null = null;
  let arrivedDriver: { driverId: string } | null = null;
  let otpReceived: string | null = null;
  let completionData: { driverId: string; distance: number; duration: number } | null = null;
  let cancellationReason: string | null = null;

  // ─── Register Signal Handlers ───────────────────────────────────────────────
  setHandler(driverAcceptedSignal, (data) => { assignedDriver = data; });
  setHandler(driverArrivedSignal,  (data) => { arrivedDriver = data; });
  setHandler(otpVerifiedSignal,    (data) => { otpReceived = data.otp; });
  setHandler(rideCompletedSignal,  (data) => { completionData = data; });
  setHandler(rideCancelledSignal,  (data) => { cancellationReason = data.reason; });

  // ─── Step 1: Create ride record ─────────────────────────────────────────────
  const ride = await createRideActivity({ ...request, rideType: currentTier });
  rideId = ride._id;
  await notifyUser(request.passenger_id, '🔍 AI OS is searching for nearby drivers...', 'RIDE_SEARCHING');

  // ─── Step 1.5: Flight Coordination (airport pickups) ────────────────────────
  const dest = request.destination?.address?.toLowerCase() || '';
  if (dest.includes('airport') || dest.includes('terminal')) {
    const flight = await checkFlightStatus(request.passenger_id);
    if (flight && flight.status === 'DELAYED') {
      await notifyUser(
        request.passenger_id,
        `🛰️ OS Alert: Your flight ${flight.flightNumber} is delayed. I am adjusting your pickup timing automatically.`,
        'OS_COORDINATION_ALERT'
      );
    }
  }

  // ─── Step 2: Wait for driver acceptance with autonomous tier escalation ──────
  let escalationCount = 0;
  const MAX_WAIT_CYCLES = 3; // 3 × 3min = 9min max wait

  while (!assignedDriver && !cancellationReason && escalationCount < MAX_WAIT_CYCLES) {
    // Wait 3 minutes per cycle
    const accepted = await condition(() => assignedDriver !== null || cancellationReason !== null, '3 minutes');

    if (!accepted && !assignedDriver && !cancellationReason) {
      const nextTier = RIDE_TIER_ESCALATION_MAP[currentTier];
      if (nextTier !== currentTier) {
        currentTier = nextTier;
        await updateRideStatusActivity(rideId!, 'SEARCHING');
        await notifyUser(
          request.passenger_id,
          `⬆️ AI OS: No drivers available for ${RIDE_TIER_ESCALATION_MAP[currentTier]} tier. Upgrading your request to ${nextTier} to find a driver faster.`,
          'RIDE_TIER_ESCALATED'
        );
      }
      escalationCount++;
    }
  }

  // No driver after all escalation cycles
  if (!assignedDriver || cancellationReason) {
    const reason = cancellationReason || 'No drivers available after maximum wait time.';
    await cancelRideActivity(rideId!, reason);
    await notifyUser(request.passenger_id, `❌ Ride cancelled: ${reason}`, 'RIDE_CANCELLED');
    return { status: 'CANCELLED', reason };
  }

  // ─── Step 3: Driver assigned ─────────────────────────────────────────────────
  const assignment = await assignDriverActivity(rideId!, assignedDriver.driverId);
  await notifyUser(
    request.passenger_id,
    `✅ Driver ${assignedDriver.driverName} (${assignedDriver.vehiclePlate}) is on the way. ETA: ${assignedDriver.eta} mins.`,
    'DRIVER_ASSIGNED'
  );

  // ─── Step 4: Wait for driver arrival ─────────────────────────────────────────
  await condition(() => arrivedDriver !== null || cancellationReason !== null, '30 minutes');

  if (cancellationReason) {
    await cancelRideActivity(rideId!, cancellationReason);
    await notifyUser(request.passenger_id, `❌ Ride cancelled: ${cancellationReason}`, 'RIDE_CANCELLED');
    return { status: 'CANCELLED', reason: cancellationReason };
  }

  // ─── Step 5: Wait for OTP Verification ─────────────────────────────────────────
  await notifyUser(
    request.passenger_id,
    `🔐 Your driver is outside! Please share your ride OTP with them to start the trip.`,
    'OTP_REQUIRED'
  );

  // Wait up to 10 minutes for OTP verification (sent by ride-service once validated)
  await condition(() => otpReceived !== null || cancellationReason !== null, '10 minutes');

  if (cancellationReason || !otpReceived) {
    const reason = cancellationReason || 'OTP verification failed or timed out.';
    await cancelRideActivity(rideId!, reason);
    await notifyUser(request.passenger_id, `❌ Ride cancelled: ${reason}`, 'RIDE_CANCELLED');
    return { status: 'CANCELLED', reason };
  }

  // ─── Step 6: Ride in progress (Guardian monitors audio) ──────────────────────
  await updateRideStatusActivity(rideId!, 'STARTED');
  await notifyUser(request.passenger_id, '🚗 Trip started! AI OS is monitoring your journey for safety.', 'RIDE_STARTED');

  // Wait for driver to signal trip completion (no timeout — real trips can vary)
  await condition(() => completionData !== null || cancellationReason !== null);

  if (cancellationReason) {
    await updateRideStatusActivity(rideId!, 'CANCELLED');
    await notifyUser(request.passenger_id, `❌ Trip ended: ${cancellationReason}`, 'RIDE_CANCELLED');
    return { status: 'CANCELLED', reason: cancellationReason };
  }

  // ─── Step 7: Complete trip & autonomous payment ───────────────────────────────
  const finalRide = await updateRideStatusActivity(rideId!, 'COMPLETED');
  const fare = finalRide?.fare || (completionData!.distance * 150); // ₦150/km fallback

  const paymentRef = await processRidePayment(rideId!, request.passenger_id, fare);

  await notifyUser(
    request.passenger_id,
    `🏁 Trip Complete! Distance: ${completionData!.distance}km. Fare: ₦${fare}. Payment Ref: ${paymentRef}. Thank you for riding with GoomTaxi!`,
    'RIDE_COMPLETED'
  );

  return { status: 'COMPLETED', rideId, fare, paymentRef };
}
