const Agenda = require('agenda');
const RideModel = require('../models/Ride.model').default;
const UserModel = require('../models/User.model').default;

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://mongodb:27017/taxi_service';


const agenda = new Agenda({
  db: { address: mongoUri, collection: 'agendaJobs' },
});

// Define Jobs
agenda.define('expire_stale_rides', async (job) => {
  console.log('Running background job: expire_stale_rides');
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  // Update rides that were SEARCHING and created more than 5 minutes ago
  const result = await RideModel.updateMany(
    { 
      status: 'SEARCHING', 
      created_at: { $lt: fiveMinutesAgo } 
    },
    { $set: { status: 'CANCELLED' } }
  );
  
  if (result.modifiedCount > 0) {
    console.log(`Expired ${result.modifiedCount} stale rides.`);
  }
});

agenda.define('driver_health_check', async (job) => {
  console.log('Running background job: driver_health_check');
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  
  // Mark drivers as offline if they haven't been seen recently and are NOT on a ride
  const result = await UserModel.updateMany(
    {
      roles: 'Individual Driver',
      is_available: true,
      current_activity: 'IDLE',
      updated_at: { $lt: tenMinutesAgo }
    },
    { $set: { is_available: false } }
  );
  
  if (result.modifiedCount > 0) {
    console.log(`Marked ${result.modifiedCount} inactive drivers as offline.`);
  }
});

agenda.define('match_ride_retry', async (job) => {
  const { ride_id } = (job as any).attrs.data;
  console.log(`Running background job: match_ride_retry for ride ${ride_id}`);
  
  const ride = await RideModel.findById(ride_id);
  if (!ride || ride.status !== 'SEARCHING') {
    return;
  }

  // Expand search to 10km
  const drivers = await UserModel.find({
    roles: 'Individual Driver',
    is_available: true,
    location: {
      $near: {
        $geometry: ride.pickup_location,
        $maxDistance: 10000, // 10km now
      },
    },
  }).limit(10); // Notify up to 10 drivers now

  if (drivers.length > 0) {
    const { getIO } = require('../App');
    const io = getIO();
    // We notify drivers again. Note: in a real system we'd use a dedicated socket helper.
    // For now, this is a placeholder for expanded search logic.
    console.log(`Re-dispatching ride ${ride_id} to ${drivers.length} drivers.`);
  }
});

agenda.define('sync_flight_data', async (job) => {
  console.log('Running background job: sync_flight_data');
  const FLIGHT_SERVICE_URL = process.env.FLIGHT_INVENTORY_URL || 'http://flight-inventory-service:12003';
  try {
    const axios = require('axios');
    await axios.post(`${FLIGHT_SERVICE_URL}/api/v1/flights/sync`);
    console.log('Flight metadata sync triggered successfully.');
  } catch (error) {
    console.error('Failed to trigger flight metadata sync:', error.message);
  }
});

export const startAgenda = async () => {
  await agenda.start();
  await agenda.every('5 minutes', 'expire_stale_rides');
  await agenda.every('10 minutes', 'driver_health_check');
  await agenda.every('24 hours', 'sync_flight_data');
  console.log('Agenda Background processing started.');
};

export default agenda;
