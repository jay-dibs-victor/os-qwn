import { OSPublisher } from '../events/publisher';
import { OSEvent } from '../events/event.schemas';
import { broadcastToRoom } from '../realtime/room.manager';

export class InterventionHandler {
  static async start() {
    await OSPublisher.subscribe(OSEvent.INTERVENTION_REQUIRED, 'os-intervention-queue', async (msg: any) => {
      const { rideId, passengerId, reason } = msg;

      console.log(`🚨 [Intervention] Safety intervention triggered for ride ${rideId}. Reason: ${reason}`);

      try {
        const roomName = `ride-${rideId}`;
        
        let safetyMessage = "I've noticed a significant deviation from your route. Is everything okay?";
        if (reason === 'LONG_STOP') {
          safetyMessage = "Your vehicle has been stationary for quite a while. Just checking in to see if you're alright.";
        }

        await broadcastToRoom(roomName, {
          type: 'SAFETY_ALERT',
          sender: 'SYSTEM_OS',
          message: safetyMessage,
          timestamp: new Date()
        });
        
      } catch (err) {
        console.error('[InterventionHandler] Error executing safety intervention:', err);
      }
    });
  }
}
