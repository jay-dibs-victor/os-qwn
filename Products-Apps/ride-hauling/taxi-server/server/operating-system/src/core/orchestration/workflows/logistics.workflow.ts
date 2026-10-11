/**
 * Logistics Delivery Workflow
 *
 *   createShipment → [polling loop] → trackShipment → confirmDelivery
 */
import { proxyActivities, sleep } from '@temporalio/workflow';
import type {
  LogisticsRequest,
  ShipmentCreated,
} from '../activities/logistics.activities';

const {
  createShipment,
  trackShipment,
  confirmDelivery,
} = proxyActivities<{
  createShipment(request: LogisticsRequest): Promise<ShipmentCreated>;
  trackShipment(trackingNumber: string): Promise<string>;
  confirmDelivery(trackingNumber: string): Promise<void>;
}>({
  startToCloseTimeout: '10 minutes',
  heartbeatTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
    initialInterval: '5s',
    backoffCoefficient: 2,
  },
});

export async function logisticsDeliveryWorkflow(request: LogisticsRequest): Promise<ShipmentCreated> {
  // Step 1: Create shipment via Shipping Service
  const shipment = await createShipment(request);

  // Step 2: Poll status every 30 min until delivered or exception (max 7 days)
  let status = shipment.status;
  let attempts = 0;
  const MAX_POLLS = 336; // 7 days × 24h × 2 polls/hr

  while (status !== 'DELIVERED' && status !== 'EXCEPTION' && attempts < MAX_POLLS) {
    await sleep('30 minutes');
    status = await trackShipment(shipment.trackingNumber);
    attempts++;
  }

  // Step 3: Confirm delivery
  if (status === 'DELIVERED') {
    await confirmDelivery(shipment.trackingNumber);
  }

  return { ...shipment, status };
}
