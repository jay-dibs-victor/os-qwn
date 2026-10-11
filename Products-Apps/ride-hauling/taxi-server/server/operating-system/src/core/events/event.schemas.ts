/**
 * OS-level event schema definitions.
 * All events published/consumed by the AI Operating System use the `os.*` routing key namespace
 * on the shared RabbitMQ exchange, keeping them isolated from lower-level service events.
 */

export const OS_EXCHANGE = 'os_exchange';

// ─── Event Routing Keys ─────────────────────────────────────────────────────

export enum OSEvent {
  // AI Commands
  AI_COMMAND_RECEIVED  = 'os.ai.command.received',
  AI_COMMAND_PROCESSED = 'os.ai.command.processed',

  // Ride Lifecycle
  RIDE_REQUESTED      = 'os.ride.requested',
  RIDE_ASSIGNED       = 'os.ride.assigned',
  RIDE_DRIVER_ARRIVED = 'os.ride.driver_arrived',
  RIDE_OTP_VERIFIED   = 'os.ride.otp_verified',
  RIDE_STARTED        = 'os.ride.started',
  RIDE_COMPLETED      = 'os.ride.completed',
  RIDE_CANCELLED      = 'os.ride.cancelled',
  RIDE_TIER_ESCALATED = 'os.ride.tier_escalated',


  // Logistics Lifecycle
  LOGISTICS_REQUESTED  = 'os.logistics.requested',
  LOGISTICS_ASSIGNED   = 'os.logistics.assigned',
  LOGISTICS_DELIVERED  = 'os.logistics.delivered',

  // Payment
  PAYMENT_INITIATED = 'os.payment.initiated',
  PAYMENT_PROCESSED = 'os.payment.processed',
  PAYMENT_FAILED    = 'os.payment.failed',

  // Workflow
  WORKFLOW_STARTED   = 'os.workflow.started',
  WORKFLOW_COMPLETED = 'os.workflow.completed',
  WORKFLOW_FAILED    = 'os.workflow.failed',

  // Safety & Location
  LOCATION_UPDATED      = 'os.ride.location_updated',
  INTERVENTION_REQUIRED = 'os.safety.intervention_required',

  // Session / Realtime
  SESSION_STARTED = 'os.session.started',
  SESSION_ENDED   = 'os.session.ended',
}

// ─── Payload Types ───────────────────────────────────────────────────────────

export interface AICommandPayload {
  sessionId: string;
  userId: string;
  message: string;
  timestamp: Date;
}

export interface AICommandResult {
  sessionId: string;
  userId: string;
  intent: string;
  action: string;
  result: Record<string, any>;
  timestamp: Date;
}

export interface RideRequestedPayload {
  requestId: string;
  passenger_id: string; // Harmonized with Ride Service
  origin: { address: string; lat: number; lng: number };
  destination: { address: string; lat: number; lng: number };
  distance: number;
  duration: number;
  rideType: string;
  timestamp: Date;
}

export interface RideAssignedPayload {
  requestId: string;
  driverId: string;
  estimatedArrival: number; // minutes
  timestamp: Date;
}

export interface LogisticsRequestedPayload {
  requestId: string;
  userId: string;
  origin: { address: string };
  destination: { address: string };
  carrier: string;
  packages: Array<{ description: string; weight: number }>;
  timestamp: Date;
}

export interface PaymentPayload {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  reference: string;
  status: 'INITIATED' | 'PROCESSED' | 'FAILED';
  timestamp: Date;
}

export interface WorkflowEventPayload {
  workflowId: string;
  workflowType: string;
  status: 'STARTED' | 'COMPLETED' | 'FAILED';
  result?: Record<string, any>;
  error?: string;
  timestamp: Date;
}

export interface SessionPayload {
  roomId: string;
  userId: string;
  role: 'user' | 'driver' | 'ai-agent' | 'admin';
  timestamp: Date;
}
