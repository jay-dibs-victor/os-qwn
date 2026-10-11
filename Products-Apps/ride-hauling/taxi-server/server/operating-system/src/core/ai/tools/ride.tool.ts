/**
 * Ride Tool — allows the AI agent to request a ride on behalf of a user.
 * On success it publishes an `os.ride.requested` event to the OS exchange.
 */
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { OSPublisher } from '../../events/publisher';
import { OSEvent } from '../../events/event.schemas';
import axios from 'axios';

const RIDE_SERVICE = process.env.RIDE_SERVICE_URL || 'http://localhost:12002';

const RideInputSchema = z.object({
  userId: z.string().describe('The ID of the user requesting the ride'),
  originAddress: z.string().describe('Full pickup address'),
  originLat: z.number().describe('Pickup latitude'),
  originLng: z.number().describe('Pickup longitude'),
  destinationAddress: z.string().describe('Full drop-off address'),
  destinationLat: z.number().describe('Drop-off latitude'),
  destinationLng: z.number().describe('Drop-off longitude'),
  rideType: z.enum(['Economy', 'Swift', 'Luxury', 'Epic']).default('Economy').describe('Ride tier'),
});

export class RequestRideTool extends StructuredTool {
  name = 'request_ride';
  description = `
    Use this tool when the user wants to book, request, or hail a ride/taxi/cab.
    Extracts origin and destination from the user message and places the ride request.
    Returns a confirmation with a request ID.
  `.trim();

  schema = RideInputSchema as any;

  async _call(input: z.infer<typeof RideInputSchema>): Promise<string> {
    const requestId = `RIDE-${uuidv4().split('-')[0].toUpperCase()}`;

    await OSPublisher.publish(OSEvent.RIDE_REQUESTED, {
      requestId,
      passenger_id: input.userId,
      origin: {
        address: input.originAddress,
        lat: input.originLat,
        lng: input.originLng,
      },
      destination: {
        address: input.destinationAddress,
        lat: input.destinationLat,
        lng: input.destinationLng,
      },
      distance: 5.2, // Default for PoC simulation
      duration: 15,  // Default for PoC simulation
      rideType: input.rideType,
      timestamp: new Date(),
    });

    return JSON.stringify({
      success: true,
      requestId,
      message: `Ride request submitted. Request ID: ${requestId}. A driver will be assigned shortly.`,
      details: {
        from: input.originAddress,
        to:   input.destinationAddress,
        type: input.rideType,
      },
    });
  }
}

/**
 * Get Driver Status Tool — allows AI to check driver coins and preference.
 */
const DriverStatusSchema = z.object({
  driverId: z.string().describe('The unique ID of the driver'),
});

export class GetDriverStatusTool extends StructuredTool {
  name = 'get_driver_status';
  description = 'Checks a driver\'s current coin balance, availability, and commission preferences.';
  schema = DriverStatusSchema as any;

  async _call(input: z.infer<typeof DriverStatusSchema>): Promise<string> {
    try {
      const response = await axios.get(`${RIDE_SERVICE}/api/v1/drivers-profile/update/${input.driverId}`);
      const driver = response.data.data[0].userInfo[0];
      
      return JSON.stringify({
        success: true,
        driverId: input.driverId,
        firstname: driver.firstname,
        taxi_coins: driver.taxi_coins,
        use_coins_for_commissions: driver.use_coins_for_commissions,
        balance: driver.balance,
        status: driver.status,
        is_available: driver.is_available,
        completed_trips: driver.completed_trips
      });
    } catch (err: any) {
      return JSON.stringify({ success: false, message: `Failed to fetch driver status: ${err.message}` });
    }
  }
}

/**
 * Set Driver Coin Preference Tool — allows AI to toggle how commissions are paid.
 */
const CoinPrefSchema = z.object({
  driverId: z.string().describe('The unique ID of the driver'),
  useCoinsForCommissions: z.boolean().describe('Whether to pay remittance via TaxiCoins'),
});

export class SetDriverCoinPreferenceTool extends StructuredTool {
  name = 'set_driver_coin_preference';
  description = 'Updates a driver\'s preference for paying trip commissions via TaxiCoins.';
  schema = CoinPrefSchema as any;

  async _call(input: z.infer<typeof CoinPrefSchema>): Promise<string> {
    try {
      await axios.post(`${RIDE_SERVICE}/api/v1/drivers-profile/update/${input.driverId}`, {
        use_coins_for_commissions: input.useCoinsForCommissions
      });
      
      return JSON.stringify({
        success: true,
        message: `Driver ${input.driverId} coin preference updated to: ${input.useCoinsForCommissions ? 'Coins' : 'Fiat'}`
      });
    } catch (err: any) {
      return JSON.stringify({ success: false, message: `Failed to update preference: ${err.message}` });
    }
  }
}
