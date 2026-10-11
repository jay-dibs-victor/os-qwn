/**
 * Intent Service — Provides intent-to-event mapping and routing.
 * While LangChain tools can publish events directly, this service acts as a 
 * central registry for complex intent parsing and multi-step action planning
 * that goes beyond what a single tool invocation handles.
 */
import { OSPublisher } from '../core/events/publisher';
import { OSEvent } from '../core/events/event.schemas';

export interface ParsedIntent {
  primaryIntent: string;
  confidence:    number;
  entities:      Record<string, any>;
  secondaryIntents?: string[];
}

export class IntentService {
  /**
   * Routes a structured intent from the AI Intelligence layer to the
   * appropriate OS event topic or orchestrates a sequence.
   */
  static async routeIntent(userId: string, parsed: ParsedIntent): Promise<void> {
    console.log(`[IntentService] Routing intent: ${parsed.primaryIntent} (confidence: ${parsed.confidence})`);

    switch (parsed.primaryIntent) {
      case 'request_ride':
        await this.handleRideIntent(userId, parsed.entities);
        break;
      
      case 'request_delivery':
        await this.handleLogisticsIntent(userId, parsed.entities);
        break;
        
      case 'initiate_payment':
        await this.handlePaymentIntent(userId, parsed.entities);
        break;

      case 'multi_service_booking':
        // Example: If an AI parses a combo (e.g. Ride + Flight)
        // Publish a custom compound event or directly trigger the multiServiceWorkflow
        console.log('[IntentService] Multi-service intent detected. Routing to complex orchestrator.');
        // This is a placeholder for more complex intent handling logic
        break;

      default:
        console.warn(`[IntentService] Unrecognized or unsupported intent: ${parsed.primaryIntent}`);
    }
  }

  private static async handleRideIntent(userId: string, entities: Record<string, any>) {
    await OSPublisher.publish(OSEvent.RIDE_REQUESTED, {
      requestId: `RIDE-${Date.now()}`,
      userId,
      origin: {
        address: entities.originAddress || 'Unknown Origin',
        lat: entities.originLat || 0,
        lng: entities.originLng || 0,
      },
      destination: {
        address: entities.destinationAddress || 'Unknown Destination',
        lat: entities.destinationLat || 0,
        lng: entities.destinationLng || 0,
      },
      rideType: entities.rideType || 'Economy',
      timestamp: new Date(),
    });
  }

  private static async handleLogisticsIntent(userId: string, entities: Record<string, any>) {
    await OSPublisher.publish(OSEvent.LOGISTICS_REQUESTED, {
      requestId: `LOG-${Date.now()}`,
      userId,
      origin: { address: entities.originAddress || 'Unknown Origin' },
      destination: { address: entities.destinationAddress || 'Unknown Destination' },
      carrier: entities.carrier || 'INTERNAL',
      packages: entities.packages || [{ description: 'Standard Package', weight: 1, quantity: 1 }],
      customerDetails: entities.customerDetails || { name: 'User', phone: '000', email: 'user@example.com' },
      timestamp: new Date(),
    });
  }

  private static async handlePaymentIntent(userId: string, entities: Record<string, any>) {
    await OSPublisher.publish(OSEvent.PAYMENT_INITIATED, {
      paymentId: `PAY-${Date.now()}`,
      userId,
      amount: entities.amount || 0,
      currency: entities.currency || 'NGN',
      reference: entities.reference || `REF-${Date.now()}`,
      status: 'INITIATED',
      timestamp: new Date(),
    });
  }
}
