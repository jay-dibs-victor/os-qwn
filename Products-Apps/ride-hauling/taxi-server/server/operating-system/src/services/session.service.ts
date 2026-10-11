/**
 * Session Service — manages AI OS session lifecycle.
 *
 * Centralises the logic for creating, retrieving, and terminating OS sessions.
 * Controllers delegate to this service rather than calling RoomManager directly,
 * keeping the controller layer thin and the session logic testable.
 */
import { v4 as uuidv4 } from 'uuid';
import { startSession, joinSession, getSessionParticipants, ParticipantRole, SessionInfo } from '../core/realtime/room.manager';
import { DelegationService } from '../core/auth/delegation.service';

export interface OSSession {
  sessionId: string;
  userId:    string;
  roomId:    string;
  role:      string;
  token:     string;
  delegationToken: string;
  createdAt: Date;
}

const activeSessions = new Map<string, OSSession>();

export class SessionService {
  /**
   * Create a new OS session for a user.
   * Spins up a LiveKit room, generates access tokens, and issues a
   * scoped delegation token allowing the AI to act on the user's behalf.
   */
  static async createSession(userId: string, role: ParticipantRole = 'user'): Promise<OSSession> {
    const session: SessionInfo = await startSession(userId, role);

    const delegationToken = DelegationService.issueToken(userId, [
      { action: 'ride.request' },
      { action: 'payment.authorize', limit: 10000 },
    ]);

    const record: OSSession = {
      sessionId: uuidv4(),
      userId,
      roomId:    session.roomId,
      role,
      token:     session.token,
      delegationToken,
      createdAt: new Date(),
    };

    activeSessions.set(record.sessionId, record);
    return record;
  }

  /**
   * Join an existing session (generate a new access token for the room).
   */
  static async joinSession(roomId: string, userId: string, role: ParticipantRole = 'user'): Promise<OSSession> {
    const session: SessionInfo = await joinSession(roomId, userId, role);

    const delegationToken = DelegationService.issueToken(userId, [
      { action: 'ride.request' },
      { action: 'payment.authorize', limit: 10000 },
    ]);

    return {
      sessionId: uuidv4(),
      userId,
      roomId,
      role,
      token:     session.token,
      delegationToken,
      createdAt: new Date(),
    };
  }

  /**
   * Get all participants currently in a room.
   */
  static async getParticipants(roomId: string) {
    return getSessionParticipants(roomId);
  }

  /**
   * Retrieve an in-memory session record by its ID.
   */
  static getSession(sessionId: string): OSSession | undefined {
    return activeSessions.get(sessionId);
  }

  /**
   * Terminate a session and clean up resources.
   */
  static terminateSession(sessionId: string): boolean {
    return activeSessions.delete(sessionId);
  }

  /**
   * List all active sessions (useful for admin/monitoring endpoints).
   */
  static listActiveSessions(): OSSession[] {
    return Array.from(activeSessions.values());
  }

  /**
   * Find an active session for a specific user.
   */
  static findSessionByUserId(userId: string): OSSession | undefined {
    return Array.from(activeSessions.values()).find(s => String(s.userId) === String(userId));
  }
}
