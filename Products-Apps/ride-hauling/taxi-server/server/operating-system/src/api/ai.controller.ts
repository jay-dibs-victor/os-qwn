/**
 * AI Controller — handles natural language command processing.
 */
import { Request, Response } from 'express';
import { runAgent } from '../core/ai/agent';
import { OSPublisher } from '../core/events/publisher';
import { OSEvent } from '../core/events/event.schemas';
import { v4 as uuidv4 } from 'uuid';
import { VisionService } from '../services/vision.service';
import { ContextService } from '../services/context.service';

export class AIController {

  /**
   * POST /os/ai/command
   * Body: { message: string, sessionId?: string, userId?: string, image?: string }
   */
  static async command(req: Request, res: Response): Promise<Response> {
    let { message, sessionId, userId, image } = req.body;

    if (!message && !image) {
      return res.status(400).json({ success: false, message: 'message or image is required' });
    }

    const resolvedSessionId = sessionId || uuidv4();
    const resolvedUserId    = userId    || (req as any).user?.id || 'anonymous';

    // 👁️ VISION PROCESSING: If an image is provided, enhance the message with its description
    if (image) {
       const description = await VisionService.analyze(image, message || "What is in this image?");
       message = `[VISUAL CONTEXT: ${description}] ${message || ""}`;
    }

    // Publish that we received the command
    await OSPublisher.publish(OSEvent.AI_COMMAND_RECEIVED, {
      sessionId: resolvedSessionId,
      userId:    resolvedUserId,
      message,
      timestamp: new Date(),
    });

    try {
      // Inject structured context into the message for richer agent reasoning
      const contextSummary = ContextService.buildContextSummary(resolvedSessionId);
      const enrichedMessage = contextSummary ? `${contextSummary}\n${message}` : message;

      const result = await runAgent({
        sessionId: resolvedSessionId,
        userId:    resolvedUserId,
        message:   enrichedMessage,
      });

      // Update context with the most recent intent
      if (result.intent) {
        ContextService.setLastIntent(resolvedSessionId, result.intent);
      }

      return res.status(200).json({
        success:   true,
        sessionId: resolvedSessionId,
        response:  result.response,
        intent:    result.intent,
        toolsUsed: result.toolsUsed,
      });
    } catch (err: any) {
      console.error('[AIController] Agent error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'The AI agent encountered an error. Please try again.',
        error:   process.env.NODE_ENV !== 'production' ? err.message : undefined,
      });
    }
  }
}
