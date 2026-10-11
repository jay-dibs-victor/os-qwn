/**
 * Room Manager — high-level session lifecycle management.
 * Creates rooms, generates tokens for users/drivers/AI agents,
 * and publishes session events to the OS event bus.
 */
import { v4 as uuidv4 } from 'uuid';
import { createRoom, generateToken, listParticipants } from './livekit.client';
import { OSPublisher } from '../events/publisher';
import { OSEvent } from '../events/event.schemas';

export type ParticipantRole = 'user' | 'driver' | 'ai-agent' | 'admin';

export interface SessionInfo {
  roomId: string;
  token: string;
  livekitUrl: string;
}

const LIVEKIT_WS_URL = process.env.LIVEKIT_WS_URL || 'ws://localhost:7880';

/**
 * Start a new realtime session (room) for a user.
 * Returns room name and a signed token to join the LiveKit room.
 */
export async function startSession(
  userId: string,
  role: ParticipantRole = 'user'
): Promise<SessionInfo> {
  const roomId = `session-${uuidv4()}`;

  await createRoom(roomId);

  const token = await generateToken(roomId, userId, `${role}:${userId}`, {
    canPublish:     role !== 'ai-agent',
    canSubscribe:   true,
    canPublishData: true,
  });

  await OSPublisher.publish(OSEvent.SESSION_STARTED, {
    roomId,
    userId,
    role,
    timestamp: new Date(),
  });

  console.log(`[RoomManager] Session started: ${roomId} for user ${userId} (${role})`);

  return { roomId, token, livekitUrl: LIVEKIT_WS_URL };
}

/**
 * Generate a join token for an existing room (e.g., driver joining a user's session).
 */
export async function joinSession(
  roomId: string,
  participantId: string,
  role: ParticipantRole = 'user'
): Promise<SessionInfo> {
  const token = await generateToken(roomId, participantId, `${role}:${participantId}`);

  await OSPublisher.publish(OSEvent.SESSION_STARTED, {
    roomId,
    userId: participantId,
    role,
    timestamp: new Date(),
  });

  return { roomId, token, livekitUrl: LIVEKIT_WS_URL };
}

/**
 * Broadcast a data message to all participants in a room.
 */
export async function broadcastToRoom(roomId: string, data: any): Promise<void> {
  const { RoomServiceClient, DataPacket_Kind } = require('livekit-server-sdk');
  
  const svc = new RoomServiceClient(
    process.env.LIVEKIT_HOST || 'http://localhost:7880',
    process.env.LIVEKIT_API_KEY || 'devkey',
    process.env.LIVEKIT_API_SECRET || 'secret'
  );

  const payload = Buffer.from(JSON.stringify(data));
  await svc.sendData(roomId, payload, DataPacket_Kind.RELIABLE);
}

/**
 * Get all participants currently in a session.
 */
export async function getSessionParticipants(roomId: string) {
  return listParticipants(roomId);
}
