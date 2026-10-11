/**
 * LiveKit Client — manages room creation and access token generation.
 * Uses the self-hosted LiveKit server (no cloud account required).
 */
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

const LIVEKIT_HOST       = process.env.LIVEKIT_HOST       || 'http://localhost:7880';
const LIVEKIT_API_KEY    = process.env.LIVEKIT_API_KEY    || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';

export const livekitRoomService = new RoomServiceClient(
  LIVEKIT_HOST,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET
);

/**
 * Generate a LiveKit access token for a participant joining a room.
 */
export async function generateToken(
  roomName: string,
  participantIdentity: string,
  participantName: string,
  grants: { canPublish?: boolean; canSubscribe?: boolean; canPublishData?: boolean } = {}
): Promise<string> {
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name:     participantName,
    ttl:      '2h',
  });

  at.addGrant({
    room:             roomName,
    roomJoin:         true,
    canPublish:       grants.canPublish       ?? true,
    canSubscribe:     grants.canSubscribe     ?? true,
    canPublishData:   grants.canPublishData   ?? true,
  });

  return await at.toJwt();
}

/**
 * Create a LiveKit room (idempotent — safe to call if room already exists).
 */
export async function createRoom(roomName: string): Promise<void> {
  try {
    await livekitRoomService.createRoom({
      name:            roomName,
      emptyTimeout:    300,  // seconds before auto-deletion
      maxParticipants: 20,
    });
    console.log(`[LiveKit] Room created: ${roomName}`);
  } catch (err: any) {
    // Room may already exist — that's fine
    console.warn(`[LiveKit] Room creation: ${err.message}`);
  }
}

/**
 * List all active participants in a room.
 */
export async function listParticipants(roomName: string) {
  return livekitRoomService.listParticipants(roomName);
}

/**
 * Remove a participant from a room.
 */
export async function removeParticipant(roomName: string, identity: string) {
  return livekitRoomService.removeParticipant(roomName, identity);
}
