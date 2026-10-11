/**
 * Context Service — maintains per-session conversation context.
 *
 * Acts as a higher-level wrapper over the memory layer, adding structured
 * user context (preferences, active ride/booking state, platform state) that
 * persists across multiple turns of a conversation within a session.
 *
 * This supplements `core/ai/memory.ts` (which handles raw chat history) with
 * structured domain context that the agent and intent service can query.
 */
import { getMemory, clearMemory } from '../core/ai/memory';

export interface UserContext {
  userId:        string;
  sessionId:     string;
  preferences:   Record<string, any>;
  activeRideId?: string;
  activeBookingId?: string;
  lastIntent?:   string;
  metadata:      Record<string, any>;
  updatedAt:     Date;
}

const contextStore = new Map<string, UserContext>();

export class ContextService {
  /**
   * Initialise or retrieve the structured context for a session.
   */
  static getContext(sessionId: string, userId: string): UserContext {
    if (!contextStore.has(sessionId)) {
      contextStore.set(sessionId, {
        userId,
        sessionId,
        preferences: {},
        metadata:    {},
        updatedAt:   new Date(),
      });
    }
    return contextStore.get(sessionId)!;
  }

  /**
   * Patch fields on the context (partial update).
   */
  static updateContext(sessionId: string, patch: Partial<UserContext>): void {
    const ctx = contextStore.get(sessionId);
    if (!ctx) return;
    Object.assign(ctx, patch, { updatedAt: new Date() });
  }

  /**
   * Record the most recent intent for chaining / follow-up reasoning.
   */
  static setLastIntent(sessionId: string, intent: string): void {
    const ctx = contextStore.get(sessionId);
    if (ctx) {
      ctx.lastIntent = intent;
      ctx.updatedAt  = new Date();
    }
  }

  /**
   * Attach an active ride ID so the AI knows which ride is in progress.
   */
  static setActiveRide(sessionId: string, rideId: string): void {
    const ctx = contextStore.get(sessionId);
    if (ctx) {
      ctx.activeRideId = rideId;
      ctx.updatedAt    = new Date();
    }
  }

  /**
   * Attach an active booking (flight/shipping) to the session context.
   */
  static setActiveBooking(sessionId: string, bookingId: string): void {
    const ctx = contextStore.get(sessionId);
    if (ctx) {
      ctx.activeBookingId = bookingId;
      ctx.updatedAt       = new Date();
    }
  }

  /**
   * Build a human-readable context summary string for injection into
   * the agent system prompt, helping it make context-aware decisions.
   */
  static buildContextSummary(sessionId: string): string {
    const ctx = contextStore.get(sessionId);
    if (!ctx) return '';

    const parts: string[] = [];
    if (ctx.activeRideId)    parts.push(`Active ride: ${ctx.activeRideId}`);
    if (ctx.activeBookingId) parts.push(`Active booking: ${ctx.activeBookingId}`);
    if (ctx.lastIntent)      parts.push(`Previous intent: ${ctx.lastIntent}`);

    const prefs = Object.entries(ctx.preferences);
    if (prefs.length > 0) {
      parts.push(`User preferences: ${prefs.map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }

    return parts.length > 0 ? `[Context: ${parts.join(' | ')}]` : '';
  }

  /**
   * Destroy the context and the underlying memory buffer for a session.
   */
  static clearContext(sessionId: string): void {
    contextStore.delete(sessionId);
    clearMemory(sessionId); // also wipe the LangChain chat history
  }

  /**
   * Return the LangChain BufferMemory for use directly in the agent.
   */
  static getMemory(sessionId: string) {
    return getMemory(sessionId);
  }
}
