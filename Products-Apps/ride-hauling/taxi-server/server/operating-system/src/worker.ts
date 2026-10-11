/**
 * Temporal Activity Worker
 *
 * Runs as a SEPARATE process from the HTTP server.
 * Registers all activities and polls Temporal for work.
 *
 * Start with: npm run dev:worker
 */
import { Worker, NativeConnection } from '@temporalio/worker';
import dotenv from 'dotenv';

import * as rideActivities      from './core/orchestration/activities/ride.activities';
import * as logisticsActivities from './core/orchestration/activities/logistics.activities';
import * as flightActivities    from './core/orchestration/activities/flight.activities';

dotenv.config();

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
const TASK_QUEUE       = 'os-task-queue';

async function runWorker() {
  console.log(`[Temporal Worker] Connecting to Temporal at: ${TEMPORAL_ADDRESS}`);

  // Must use NativeConnection.connect() — a plain {address} object causes a native bridge downcast error
  const connection = await NativeConnection.connect({ address: TEMPORAL_ADDRESS });

  const worker = await Worker.create({
    connection,
    workflowsPath:  require.resolve('./core/orchestration/workflows/ride.workflow'),
    activities: {
      ...rideActivities,
      ...logisticsActivities,
      ...flightActivities,
    },
    taskQueue: TASK_QUEUE,
  });

  console.log(`[Temporal Worker] Starting on task queue: ${TASK_QUEUE}`);
  console.log(`[Temporal Worker] Temporal address: ${TEMPORAL_ADDRESS}`);

  await worker.run();
}

runWorker().catch((err) => {
  console.error('[Temporal Worker] Fatal error:', err);
  process.exit(1);
});
