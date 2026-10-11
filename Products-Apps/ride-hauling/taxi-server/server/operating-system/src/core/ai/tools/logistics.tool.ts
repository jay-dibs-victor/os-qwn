/**
 * Logistics Tool — allows the AI agent to track a shipment.
 * Calls the Shipping Service REST API directly.
 */
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';

const SHIPPING_SERVICE = process.env.SHIPPING_SERVICE_URL || 'http://taxi-shipping:12006';

const TrackInputSchema = z.object({
  trackingNumber: z.string().describe('The shipment tracking number to look up'),
});

const RequestInputSchema = z.object({
  userId: z.string().describe('The user ID requesting the shipment'),
  origin: z.string().describe('Pickup address'),
  destination: z.string().describe('Delivery address'),
  carrier: z.string().describe('Requested carrier (e.g., GIG Logistics, DHL)'),
  description: z.string().describe('Description of the package contents'),
  weight: z.number().describe('Estimated weight in kg'),
});

export class RequestLogisticsTool extends StructuredTool {
  name = 'request_logistics';
  description = 'Book a new shipment or package delivery. Requires origin, destination, and package details.';
  schema = RequestInputSchema as any;

  async _call(input: z.infer<typeof RequestInputSchema>): Promise<string> {
    try {
      const response = await axios.post(
        'http://operating-system:12007/api/v1/os/workflow/logistics/start',
        {
          userId: input.userId,
          origin: { address: input.origin },
          destination: { address: input.destination },
          carrier: input.carrier,
          packages: [{ description: input.description, weight: input.weight, quantity: 1 }],
          customerDetails: { name: 'AI OS User', phone: '08000000000', email: 'user@example.com' }
        }
      );
      return JSON.stringify({ success: true, trackingNumber: response.data.requestId, message: 'Logistics orchestration started.' });
    } catch (err: any) {
      return JSON.stringify({ success: false, error: err.message });
    }
  }
}

export class TrackShipmentTool extends StructuredTool {
  name = 'track_shipment';
  description = `
    Use this tool when the user asks about a shipment, package, or delivery status.
    Requires a tracking number. Returns the current status and location of the shipment.
  `.trim();

  schema = TrackInputSchema as any;

  async _call(input: z.infer<typeof TrackInputSchema>): Promise<string> {
    try {
      const response = await axios.get(
        `${SHIPPING_SERVICE}/api/v1/shipping/${input.trackingNumber}`,
        { timeout: 8000 }
      );

      const shipment = response.data.data;
      if (!shipment) {
        return JSON.stringify({ success: false, message: 'Shipment not found.' });
      }

      return JSON.stringify({
        success: true,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        carrier: shipment.carrier,
        origin: shipment.origin?.address,
        destination: shipment.destination?.address,
        lastUpdate: shipment.auditLog?.[shipment.auditLog.length - 1],
      });
    } catch (err: any) {
      return JSON.stringify({
        success: false,
        message: `Unable to retrieve shipment: ${err.message}`,
      });
    }
  }
}
