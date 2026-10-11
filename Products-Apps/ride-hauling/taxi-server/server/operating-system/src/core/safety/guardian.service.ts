import { broadcastToRoom } from '../realtime/room.manager';
import { OSPublisher } from '../events/publisher';
import { OSEvent } from '../events/event.schemas';
import { LLMFactory } from '../ai/llm.factory';

export enum DistressLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface DistressContext {
  userId: string;
  userName: string;
  rideId: string;
  reason: string;
  location: { lat: number, lng: number };
}

export class GuardianService {
  /**
   * Real-time audio sentiment analysis powered by the AI OS LLM Engine.
   */
  static async analyzeSentiment(audioTranscript: string): Promise<DistressLevel> {
    try {
      const llm = await LLMFactory.create({ temperature: 0 });
      const prompt = `
        You are a safety analysis engine for a taxi mobility platform.
        Analyze the following audio transcript from a vehicle in transit. 
        Determine the level of distress, panic, or aggression.
        Reply with ONLY ONE of the following exact words: LOW, MEDIUM, HIGH, CRITICAL.
        Do not explain. Just reply with the word.
        
        Transcript: "${audioTranscript}"
      `.trim();

      const response = await llm.invoke(prompt);
      const content = (response.content as string).toUpperCase().trim();

      if (content.includes('CRITICAL')) return DistressLevel.CRITICAL;
      if (content.includes('HIGH')) return DistressLevel.HIGH;
      if (content.includes('MEDIUM')) return DistressLevel.MEDIUM;
      return DistressLevel.LOW;
    } catch (err) {
      console.error('🛡️ [Guardian] Error in LLM sentiment analysis, falling back to basic check:', err);
      // Fallback
      const text = audioTranscript.toLowerCase();
      if (text.includes('help') || text.includes('stop') || text.includes('police') || text.includes('panic')) {
        return DistressLevel.CRITICAL;
      }
      return DistressLevel.LOW;
    }
  }

  /**
   * Proactive intervention based on distress detection.
   */
  static async triggerIntervention(context: DistressContext, level: DistressLevel) {
    console.log(`🛡️ [Guardian] Intervention triggered for ${context.userName} (Level: ${level})`);

    const roomName = `ride-${context.rideId}`;
    let message = "";

    switch (level) {
      case DistressLevel.CRITICAL:
        message = `Hello ${context.userName.split(' ')[0]}, I detect significant distress. I am ready to alert emergency services. Do you want me to call the police?`;
        await this.relayToPolice(context);
        break;
      case DistressLevel.MEDIUM:
      case DistressLevel.HIGH:
        message = `Hello ${context.userName.split(' ')[0]}, I noticed the conversation is getting heated. Please remember to maintain a professional and safe environment.`;
        break;
      default:
        return;
    }

    // 🔊 Send Voice + Data Alert via LiveKit
    await broadcastToRoom(roomName, {
      type: 'SAFETY_ALERT',
      sender: 'GUARDIAN_OS',
      message,
      level,
      timestamp: new Date()
    });
  }

  /**
   * Real Emergency Relay
   * Pushes the distress event to the live RabbitMQ cluster for external dispatch.
   */
  private static async relayToPolice(context: DistressContext) {
    console.log(`🚔 [EMERGENCY RELAY] Alerting Law Enforcement via Event Bus...`);
    
    // In a real system, an external service (like a police dispatch webhook) 
    // would subscribe to this specific event type.
    await OSPublisher.publish(OSEvent.INTERVENTION_REQUIRED, {
      rideId: context.rideId,
      userId: context.userId,
      reason: 'CRITICAL_AUDIO_DISTRESS',
      location: context.location,
      timestamp: new Date(),
      metadata: {
        policeRelay: true,
        userName: context.userName
      }
    });
  }
}
