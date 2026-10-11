import axios from 'axios';
import { OSPublisher } from '../events/publisher';
import { OSEvent } from '../events/event.schemas';
import { GuardianService, DistressLevel } from './guardian.service';
import { OracleService } from './oracle.service';

const RIDE_SERVICE_URL = process.env.RIDE_SERVICE_URL || 'http://ride-service:12002';

export class SentinelWorker {
  static async start() {
    console.log('🛡️ Sentinel Safety Agent: Online and Monitoring...');

    await OSPublisher.subscribe(OSEvent.LOCATION_UPDATED, 'os-sentinel-queue', async (msg: any) => {
      const { rideId, lat, lng, driverId } = msg;

      if (!rideId) return;

      try {
        const rideResp = await axios.get(`${RIDE_SERVICE_URL}/api/v1/rides/${rideId}`);
        const ride = rideResp.data.data;

        if (ride.status !== 'STARTED') return;

        const isDeviating = await this.checkDeviation(ride, lat, lng);

        if (isDeviating) {
          console.warn(`⚠️ SAFETY ALERT: Ride ${rideId} is deviating from planned route!`);
          
          await OSPublisher.publish(OSEvent.INTERVENTION_REQUIRED, {
            rideId,
            driverId,
            passengerId: ride.passenger_id,
            reason: 'ROUTE_DEVIATION',
            location: { lat, lng },
            timestamp: new Date()
          });
        }

        // 👁️ ORACLE: Environmental Awareness
        await OracleService.analyzeEnvironment(lat, lng, ride.destination_address);

        // 🛡️ GUARDIAN: (Simulated) Audio Sentiment Check
        // In reality, this would be fed by a transcript from a LiveKit Agent
        // For PoC, we'll skip if no specific distress flag is passed, 
        // but the module is wired and ready.

      } catch (err) {
        console.error('[Sentinel] Error processing safety check:', err);
      }
    });
  }

  private static async checkDeviation(ride: any, lat: number, lng: number): Promise<boolean> {
    const dest = ride.destination_location.coordinates;
    const distanceToDest = this.getDistance(lat, lng, dest[1], dest[0]);

    if (!ride.route_polyline) {
        return distanceToDest > (ride.distance / 1000) * 1.5;
    }
    return false;
  }

  private static getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
