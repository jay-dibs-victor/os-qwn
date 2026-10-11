/**
 * Ride Service Temporal Worker
 */
import * as dotenv from 'dotenv';
import { Worker, NativeConnection } from '@temporalio/worker';
import DbQuery from './mongo_api/models/db';
import * as activities from './mongo_api/services/ride_activities';

dotenv.config();

const TEMPORAL_ADDRESS = process.env.TEMPORAL_ADDRESS || 'localhost:7233';

async function run() {
  console.log('[RideWorker] Starting Ride Service Temporal Worker...');
  console.log(`[RideWorker] Temporal address: ${TEMPORAL_ADDRESS}`);

  // 1. Initialize DB Connection
  try {
    const db = DbQuery.getInstance();
    await db.pool;
    console.log('[RideWorker] Connected to MongoDB');
  } catch (err) {
    console.error('[RideWorker] Failed to connect to MongoDB:', err);
    process.exit(1);
  }

  // 2. Establish Temporal connection explicitly (prevents ::1 IPv6 default resolution)
  const connection = await NativeConnection.connect({ address: TEMPORAL_ADDRESS });

  // 3. Create and run the Worker
  const worker = await Worker.create({
    connection,
    workflowsPath: require.resolve('../operating-system/src/core/orchestration/workflows/ride.workflow'), // Shared workflows path if needed
    activities,
    taskQueue: 'ride-service-tasks',
  });

  console.log('[RideWorker] Worker is running and listening on task queue: ride-service-tasks');
  await worker.run();
}

run().catch((err) => {
  console.error('[RideWorker] Fatal error:', err);
  process.exit(1);
});
