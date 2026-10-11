/**
 * Event Bridge — The critical glue connecting NATS/RabbitMQ events to Temporal workflows.
 * Subscribes to OS events and automatically triggers the corresponding orchestration workflows.
 */
import { OSPublisher } from '../core/events/publisher';
import { OSEvent } from '../core/events/event.schemas';
import { assertValidEvent } from '../core/events/validator';
import { startWorkflow } from '../core/orchestration/temporal.client';
import type { RideRequestedPayload, LogisticsRequestedPayload, PaymentPayload } from '../core/events/event.schemas';

export class EventBridge {
  static async initialize() {
    console.log('[EventBridge] Initializing event-to-workflow bindings...');

    // 1. Ride Requested -> Ride Lifecycle Workflow
    await OSPublisher.subscribe(
      OSEvent.RIDE_REQUESTED,
      'os_ride_workflow_trigger',
      async (rawPayload) => {
        try {
          const payload = assertValidEvent<RideRequestedPayload>(OSEvent.RIDE_REQUESTED, rawPayload);
          console.log(`[EventBridge] Triggering Ride Workflow for ${payload.requestId}`);
          
          await startWorkflow(
            'rideLifecycleWorkflow',
            [{
              requestId:    payload.requestId,
              passenger_id: payload.passenger_id,
              pickup_lat:   payload.origin.lat,
              pickup_lng:   payload.origin.lng,
              dest_lat:     payload.destination.lat,
              dest_lng:     payload.destination.lng,
              distance:     payload.distance,
              duration:     payload.duration,
              ride_type:    payload.rideType,
            }],
            `ride-workflow-${payload.requestId}`
          );
        } catch (error: any) {
          console.error(`[EventBridge] Failed to trigger ride workflow: ${error.message}`);
        }
      }
    );

    // 2. Logistics Requested -> Logistics Delivery Workflow
    await OSPublisher.subscribe(
      OSEvent.LOGISTICS_REQUESTED,
      'os_logistics_workflow_trigger',
      async (rawPayload) => {
        try {
          const payload = assertValidEvent<LogisticsRequestedPayload>(OSEvent.LOGISTICS_REQUESTED, rawPayload);
          console.log(`[EventBridge] Triggering Logistics Workflow for ${payload.requestId}`);
          
          await startWorkflow(
            'logisticsDeliveryWorkflow',
            [{
              requestId:       payload.requestId,
              userId:          payload.userId,
              origin:          payload.origin,
              destination:     payload.destination,
              carrier:         payload.carrier,
              packages:        payload.packages,
              // Fallback customer details since it's required by the workflow
              customerDetails: (payload as any).customerDetails || { name: 'User', phone: 'Unknown', email: 'unknown@example.com' }
            }],
            `logistics-workflow-${payload.requestId}`
          );
        } catch (error: any) {
          console.error(`[EventBridge] Failed to trigger logistics workflow: ${error.message}`);
        }
      }
    );

    // 3. Payment Initiated -> Payment Workflow
    await OSPublisher.subscribe(
      OSEvent.PAYMENT_INITIATED,
      'os_payment_workflow_trigger',
      async (rawPayload) => {
        try {
          const payload = assertValidEvent<PaymentPayload>(OSEvent.PAYMENT_INITIATED, rawPayload);
          console.log(`[EventBridge] Triggering Payment Workflow for ${payload.paymentId}`);
          
          await startWorkflow(
            'paymentWorkflow',
            [{
              paymentId: payload.paymentId,
              userId:    payload.userId,
              amount:    payload.amount,
              currency:  payload.currency,
              reference: payload.reference,
            }],
            `payment-workflow-${payload.paymentId}`
          );
        } catch (error: any) {
          console.error(`[EventBridge] Failed to trigger payment workflow: ${error.message}`);
        }
      }
    );
    
    console.log('[EventBridge] Event-to-workflow bindings established.');
  }
}
