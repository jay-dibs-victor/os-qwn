/**
 * AI Agent Listener — LiveKit participant that listens in sessions
 * and responds to user voice/data messages via the AI agent.
 *
 * The listener joins a room as an AI participant and:
 * 1. Receives text data messages from users in the room
 * 2. Routes them through the AI agent
 * 3. Publishes the response back into the room as a data message
 * 4. Provides Speech-to-Text and Text-to-Speech hooks for voice integration
 */
import { Room, RoomEvent, RemoteParticipant, DataPacket_Kind, Participant } from 'livekit-client';
import { runAgent } from '../ai/agent';

// LiveKit server-side SDK for joining as a participant
// Note: In production, use a LiveKit Agents SDK when it supports Node.js fully.
// For now we use the client SDK in Node.js mode as a data-channel agent.

export interface AIListenerConfig {
  roomId:  string;
  userId:  string;   // The user session this listener is serving
}

/**
 * Start an AI listener in a LiveKit room.
 * The agent will remain in the room until explicitly stopped or room closes.
 *
 * Returns a stop() function to cleanly disconnect the agent.
 */
export async function startAIListener(config: AIListenerConfig): Promise<() => void> {
  const { generateToken } = await import('./livekit.client');

  const LIVEKIT_WS_URL = process.env.LIVEKIT_WS_URL || 'ws://localhost:7880';

  // Generate a token for the AI agent participant
  const agentToken = await generateToken(config.roomId, `ai-agent-${config.userId}`, 'AI Assistant', {
    canPublish:     true,
    canSubscribe:   true,
    canPublishData: true,
  });

  const room = new Room();

  room.on(RoomEvent.DataReceived, async (
    payload: Uint8Array,
    participant?: RemoteParticipant,
    _kind?: DataPacket_Kind
  ) => {
    if (!participant) return;

    // Skip messages from other AI agents (prevent loops)
    if (participant.identity.startsWith('ai-agent-')) return;

    let message: string;
    try {
      const decoded = new TextDecoder().decode(payload);
      const parsed  = JSON.parse(decoded);
      message = parsed.text || decoded;
    } catch {
      message = new TextDecoder().decode(payload);
    }

    if (!message.trim()) return;

    console.log(`[AIListener] Room=${config.roomId} | From=${participant.identity} | Message="${message}"`);

    try {
      const result = await runAgent({
        sessionId: config.roomId,
        userId:    participant.identity,
        message,
      });

      // Publish response back into the room
      const responsePayload = new TextEncoder().encode(
        JSON.stringify({
          type:     'ai_response',
          text:     result.response,
          intent:   result.intent,
          agentId:  `ai-agent-${config.userId}`,
        })
      );

      await room.localParticipant.publishData(responsePayload, { reliable: true });

    } catch (err: any) {
      console.error(`[AIListener] Agent error: ${err.message}`);

      // Send error message back to room
      const errPayload = new TextEncoder().encode(
        JSON.stringify({
          type:    'ai_error',
          text:    'I encountered an issue. Please try again.',
          agentId: `ai-agent-${config.userId}`,
        })
      );
      await room.localParticipant.publishData(errPayload, { reliable: true });
    }
  });

  room.on(RoomEvent.Disconnected, () => {
    console.log(`[AIListener] Disconnected from room ${config.roomId}`);
  });

  // Connect to the room
  await room.connect(LIVEKIT_WS_URL, agentToken);
  console.log(`[AIListener] AI agent joined room: ${config.roomId}`);

  // ─── STT/TTS Hooks ────────────────────────────────────────────────────────
  // Placeholder hooks for voice integration.
  // In production: subscribe to audio tracks from participants,
  // pipe through Whisper (STT) → AI agent → TTS → publish audio track back.

  // STT hook: room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
  //   if (track.kind === Track.Kind.Audio) {
  //     const whisperStream = new WhisperSTTStream();
  //     track.attach(whisperStream);
  //     whisperStream.on('transcript', (text) => handleMessage(text, participant));
  //   }
  // });

  // TTS hook: after getting AI response → generate audio → publish audio track

  // Return stop function
  return async () => {
    await room.disconnect();
    console.log(`[AIListener] AI agent left room: ${config.roomId}`);
  };
}
