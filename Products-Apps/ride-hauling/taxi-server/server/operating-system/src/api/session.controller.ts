import { Request, Response } from 'express';
import { SessionService } from '../services/session.service';
import { ParticipantRole } from '../core/realtime/room.manager';

export class SessionController {

  /**
   * POST /os/session/start
   * Body: { userId?: string, role?: string }
   */
  static async start(req: Request, res: Response): Promise<Response> {
    const userId = req.body.userId || (req as any).user?.id || 'anonymous';
    const role   = req.body.role   || 'user';

    try {
      const session = await SessionService.createSession(userId, role);
      return res.status(201).json({ success: true, ...session });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /os/session/:roomId/token
   * Query: { userId, role }
   */
  static async getToken(req: Request, res: Response): Promise<Response> {
    const { roomId } = req.params;
    const userId = (req.query.userId as string) || (req as any).user?.id || 'anonymous';
    const role   = (req.query.role   as string) || 'user';

    try {
      const session = await SessionService.joinSession(roomId, userId, role as ParticipantRole);
      return res.status(200).json({ success: true, ...session });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /os/session/:roomId/participants
   */
  static async participants(req: Request, res: Response): Promise<Response> {
    const { roomId } = req.params;
    try {
      const participants = await SessionService.getParticipants(roomId);
      return res.status(200).json({ success: true, data: participants });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
  /**
   * GET /os/session/token
   * Query: { userId, role }
   */
  static async getOrCreateToken(req: Request, res: Response): Promise<Response> {
    const userId = (req.query.userId as string) || (req as any).user?.id || 'anonymous';
    const role   = (req.query.role   as string) || 'user';

    try {
      // Check if user already has a session
      let session = SessionService.findSessionByUserId(userId);
      
      if (!session) {
        // Create new session if none exists
        session = await SessionService.createSession(userId, role as ParticipantRole);
      } else {
        // Join existing session (generates fresh token for the existing room)
        session = await SessionService.joinSession(session.roomId, userId, role as ParticipantRole);
      }

      return res.status(200).json({ success: true, ...session });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
