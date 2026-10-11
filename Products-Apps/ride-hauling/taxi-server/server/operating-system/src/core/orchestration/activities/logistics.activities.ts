/**
 * Logistics Activities — atomic work units for the delivery lifecycle.
 */
import { Context } from '@temporalio/activity';
import axios from 'axios';

const SHIPPING_SERVICE = process.env.SHIPPING_SERVICE_URL || 'http://taxi-shipping:12006';

export interface LogisticsRequest {
  requestId: string;
  userId: string;
  origin:      { address: string };
  destination: { address: string };
  carrier: string;
  packages: Array<{ description: string; weight: number; quantity: number }>;
  customerDetails: { name: string; phone: string; email: string };
}

export interface ShipmentCreated {
  trackingNumber: string;
  carrier: string;
  status: string;
}

export async function createShipment(request: LogisticsRequest): Promise<ShipmentCreated> {
  Context.current().heartbeat('Creating shipment...');
  const response = await axios.post(
    `${SHIPPING_SERVICE}/api/v1/shipping`,
    {
      origin:          request.origin,
      destination:     request.destination,
      carrier:         request.carrier,
      packages:        request.packages,
      customerDetails: request.customerDetails,
      ownerId:         request.userId,
    },
    { timeout: 10000 }
  );
  return {
    trackingNumber: response.data.data.trackingNumber,
    carrier:        response.data.data.carrier,
    status:         response.data.data.status,
  };
}

export async function trackShipment(trackingNumber: string): Promise<string> {
  Context.current().heartbeat(`Tracking shipment ${trackingNumber}...`);
  const response = await axios.get(
    `${SHIPPING_SERVICE}/api/v1/shipping/${trackingNumber}`,
    { timeout: 8000 }
  );
  return response.data.data.status;
}

export async function confirmDelivery(trackingNumber: string): Promise<void> {
  Context.current().heartbeat('Confirming delivery...');
  console.log(`[Activity] Delivery confirmed for ${trackingNumber}`);
}
