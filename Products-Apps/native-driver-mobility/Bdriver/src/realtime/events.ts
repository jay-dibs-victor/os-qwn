/**
 * Typed WebSocket event registry for the driver app ↔ dispatch gateway.
 *
 * Each event has:
 *   - `name`: the wire string (must match backend exactly).
 *   - `direction`: 'emitter' (client → server) or 'receiver' (server → client).
 *   - `payload`: runtime-validated shape (via `is<Name>` guard).
 *
 * Adding a new event:
 *   1. Add a `ServerEventName` / `ClientEventName` entry below.
 *   2. Declare its payload interface.
 *   3. Export an `is<Name>` guard that returns `payload is <Name>Payload`.
 *   4. Use `emit<Name>(socket, payload)` and `on<Name>(socket, handler)` helpers.
 */

import type { Socket } from 'socket.io-client';
import type { RideRequestDTO, FareDTO, LatLngDTO } from '../api/dto';

// ── Coordinate / heading helpers ────────────────────────────────────────────

export interface LocationPayload {
  lat: number;
  lng: number;
  heading?: number | null;
  speed?: number | null;
  ts: number;
}

export function isLocationPayload(value: unknown): value is LocationPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.lat === 'number' &&
    typeof v.lng === 'number' &&
    typeof v.ts === 'number' &&
    (v.heading === undefined || v.heading === null || typeof v.heading === 'number') &&
    (v.speed === undefined || v.speed === null || typeof v.speed === 'number')
  );
}

// ── Client → Server ─────────────────────────────────────────────────────────

export const ClientEvents = {
  DriverOnline: 'driver.online',
  DriverOffline: 'driver.offline',
  DriverLocation: 'driver.location',
  RideAccept: 'ride.accept',
  RideDecline: 'ride.decline',
  RideArrive: 'ride.arrive',
  RideStart: 'ride.start',
  RideComplete: 'ride.complete',
  RideCancel: 'ride.cancel',
  ChatSend: 'chat.send',
  ChatTyping: 'chat.typing',
} as const;

export type ClientEventName = (typeof ClientEvents)[keyof typeof ClientEvents];

export interface DriverOnlinePayload {
  lat: number;
  lng: number;
  heading?: number | null;
  serviceTypes: ReadonlyArray<'economy' | 'business' | 'premium'>;
}

export function isDriverOnlinePayload(value: unknown): value is DriverOnlinePayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.lat === 'number' &&
    typeof v.lng === 'number' &&
    Array.isArray(v.serviceTypes) &&
    v.serviceTypes.every(s => s === 'economy' || s === 'business' || s === 'premium')
  );
}

export interface RideIdPayload {
  rideId: string;
}

export function isRideIdPayload(value: unknown): value is RideIdPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.rideId === 'string' && v.rideId.length > 0;
}

export interface RideDeclinePayload extends RideIdPayload {
  reason?: string;
}

export function isRideDeclinePayload(value: unknown): value is RideDeclinePayload {
  return isRideIdPayload(value);
}

export interface RideCompletePayload extends RideIdPayload {
  distanceMeters: number;
  durationSec: number;
}

export function isRideCompletePayload(value: unknown): value is RideCompletePayload {
  if (!isRideIdPayload(value)) return false;
  const v = value as unknown as Record<string, unknown>;
  return typeof v.distanceMeters === 'number' && typeof v.durationSec === 'number';
}

export interface RideCancelPayload extends RideIdPayload {
  reason: string;
}

export function isRideCancelPayload(value: unknown): value is RideCancelPayload {
  if (!isRideIdPayload(value)) return false;
  const v = value as unknown as Record<string, unknown>;
  return typeof v.reason === 'string';
}

export interface ChatSendPayload extends RideIdPayload {
  body: string;
}

export function isChatSendPayload(value: unknown): value is ChatSendPayload {
  if (!isRideIdPayload(value)) return false;
  const v = value as unknown as Record<string, unknown>;
  return typeof v.body === 'string' && v.body.length > 0 && v.body.length <= 2000;
}

export interface ChatTypingPayload extends RideIdPayload {
  typing: boolean;
}

export function isChatTypingPayload(value: unknown): value is ChatTypingPayload {
  if (!isRideIdPayload(value)) return false;
  const v = value as unknown as Record<string, unknown>;
  return typeof v.typing === 'boolean';
}

// ── Server → Client ─────────────────────────────────────────────────────────

export const ServerEvents = {
  RideOffer: 'ride.offer',
  RideCancelled: 'ride.cancelled',
  RideAssigned: 'ride.assigned',
  RiderLocation: 'rider.location',
  RiderMessage: 'rider.message',
  RiderTyping: 'rider.typing',
  TripStarted: 'trip.started',
  TripCompleted: 'trip.completed',
  PaymentReceived: 'payment.received',
  DisconnectWarn: 'disconnect.warn',
} as const;

export type ServerEventName = (typeof ServerEvents)[keyof typeof ServerEvents];

export interface RideOfferPayload {
  ride: RideRequestDTO;
  expiresInSec: number;
}

export function isRideOfferPayload(value: unknown): value is RideOfferPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.ride === 'object' &&
    v.ride !== null &&
    typeof v.expiresInSec === 'number'
  );
}

export interface RideCancelledPayload {
  rideId: string;
  reason: string;
  by: 'rider' | 'system' | 'driver';
}

export function isRideCancelledPayload(value: unknown): value is RideCancelledPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.rideId === 'string' &&
    typeof v.reason === 'string' &&
    (v.by === 'rider' || v.by === 'system' || v.by === 'driver')
  );
}

export interface RiderLocationPayload extends LatLngDTO {
  ts: number;
}

export function isRiderLocationPayload(value: unknown): value is RiderLocationPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.latitude === 'number' &&
    typeof v.longitude === 'number' &&
    typeof v.ts === 'number'
  );
}

export interface RiderMessagePayload {
  rideId: string;
  body: string;
  ts: number;
  fromDriver: boolean;
}

export function isRiderMessagePayload(value: unknown): value is RiderMessagePayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.rideId === 'string' &&
    typeof v.body === 'string' &&
    typeof v.ts === 'number' &&
    typeof v.fromDriver === 'boolean'
  );
}

export interface RiderTypingPayload extends RideIdPayload {
  typing: boolean;
}

export function isRiderTypingPayload(value: unknown): value is RiderTypingPayload {
  if (!isRideIdPayload(value)) return false;
  const v = value as unknown as Record<string, unknown>;
  return typeof v.typing === 'boolean';
}

export interface TripStartedPayload extends RideIdPayload {
  startedAt: number;
}

export function isTripStartedPayload(value: unknown): value is TripStartedPayload {
  if (!isRideIdPayload(value)) return false;
  const v = value as unknown as Record<string, unknown>;
  return typeof v.startedAt === 'number';
}

export interface TripCompletedPayload extends RideIdPayload {
  fare: FareDTO;
}

export function isTripCompletedPayload(value: unknown): value is TripCompletedPayload {
  if (!isRideIdPayload(value)) return false;
  const v = value as unknown as Record<string, unknown>;
  return typeof v.fare === 'object' && v.fare !== null;
}

export interface PaymentReceivedPayload extends RideIdPayload {
  amount: number;
  currency: string;
}

export function isPaymentReceivedPayload(value: unknown): value is PaymentReceivedPayload {
  if (!isRideIdPayload(value)) return false;
  const v = value as unknown as Record<string, unknown>;
  return typeof v.amount === 'number' && typeof v.currency === 'string';
}

export interface DisconnectWarnPayload {
  reason: string;
}

export function isDisconnectWarnPayload(value: unknown): value is DisconnectWarnPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.reason === 'string';
}

// ── Emitter / subscriber helpers ────────────────────────────────────────────

type AnyPayload = unknown;

export function emit(socket: Socket | null, event: ClientEventName, payload: AnyPayload): void {
  if (!socket || !socket.connected) return;
  socket.emit(event, payload);
}

export function on<T>(
  socket: Socket | null,
  event: ServerEventName,
  handler: (payload: T) => void,
): () => void {
  if (!socket) return () => undefined;
  const wrapped = (raw: AnyPayload) => handler(raw as T);
  socket.on(event, wrapped);
  return () => {
    socket.off(event, wrapped);
  };
}
