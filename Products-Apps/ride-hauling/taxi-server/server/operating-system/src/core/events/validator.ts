/**
 * Event Validator — validates OS event payloads at runtime using Zod schemas.
 * Prevents malformed events from entering the system and triggering workflows.
 */
import { z } from 'zod';
import { OSEvent } from './event.schemas';

// ─── Zod Schemas per Event ────────────────────────────────────────────────────

const RideRequestedSchema = z.object({
  requestId:   z.string().min(1),
  userId:      z.string().min(1),
  origin: z.object({
    address: z.string().min(1),
    lat:     z.number(),
    lng:     z.number(),
  }),
  destination: z.object({
    address: z.string().min(1),
    lat:     z.number(),
    lng:     z.number(),
  }),
  rideType:  z.string().default('Economy'),
  timestamp: z.coerce.date(),
});

const LogisticsRequestedSchema = z.object({
  requestId:   z.string().min(1),
  userId:      z.string().min(1),
  origin:      z.object({ address: z.string().min(1) }),
  destination: z.object({ address: z.string().min(1) }),
  carrier:     z.string().default('INTERNAL'),
  packages:    z.array(z.object({
    description: z.string(),
    weight:      z.number().positive(),
    quantity:    z.number().int().positive(),
  })).min(1),
  customerDetails: z.object({
    name:  z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
  }),
  timestamp: z.coerce.date(),
});

const PaymentInitiatedSchema = z.object({
  paymentId: z.string().min(1),
  userId:    z.string().min(1),
  amount:    z.number().positive(),
  currency:  z.string().length(3).default('NGN'),
  reference: z.string().min(1),
  status:    z.enum(['INITIATED', 'PROCESSED', 'FAILED']),
  timestamp: z.coerce.date(),
});

const AICommandSchema = z.object({
  sessionId: z.string().min(1),
  userId:    z.string().min(1),
  message:   z.string().min(1).max(5000),
  timestamp: z.coerce.date(),
});

const SessionSchema = z.object({
  roomId:    z.string().min(1),
  userId:    z.string().min(1),
  role:      z.enum(['user', 'driver', 'ai-agent', 'admin']),
  timestamp: z.coerce.date(),
});

// ─── Schema Registry ──────────────────────────────────────────────────────────

const EVENT_SCHEMAS: Partial<Record<OSEvent, z.ZodSchema>> = {
  [OSEvent.RIDE_REQUESTED]:       RideRequestedSchema,
  [OSEvent.LOGISTICS_REQUESTED]:  LogisticsRequestedSchema,
  [OSEvent.PAYMENT_INITIATED]:    PaymentInitiatedSchema,
  [OSEvent.AI_COMMAND_RECEIVED]:  AICommandSchema,
  [OSEvent.SESSION_STARTED]:      SessionSchema,
};

// ─── Validator ────────────────────────────────────────────────────────────────

export interface ValidationResult<T = any> {
  valid: boolean;
  data?: T;
  errors?: string[];
}

export function validateEvent<T = any>(
  event: OSEvent,
  payload: unknown
): ValidationResult<T> {
  const schema = EVENT_SCHEMAS[event];

  // No schema registered = pass-through (not all events need strict validation)
  if (!schema) {
    return { valid: true, data: payload as T };
  }

  const result = schema.safeParse(payload);

  if (result.success) {
    return { valid: true, data: result.data as T };
  }

  const errors = result.error.errors.map(
    (e) => `${e.path.join('.')}: ${e.message}`
  );

  console.warn(`[EventValidator] Invalid payload for ${event}:`, errors);
  return { valid: false, errors };
}

export function assertValidEvent<T = any>(event: OSEvent, payload: unknown): T {
  const result = validateEvent<T>(event, payload);
  if (!result.valid) {
    throw new Error(
      `[EventValidator] Invalid event payload for "${event}": ${result.errors?.join('; ')}`
    );
  }
  return result.data!;
}
