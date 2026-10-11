import { RedisService } from "./redis_service";
import RideModel from "../models/Ride.model";
import UserModel from "../models/User.model";

export class DispatchEngine {
  private io: any;
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(io: any) {
    this.io = io;
  }

  start() {
    console.log("Starting DispatchEngine...");
    this.intervalId = setInterval(async () => {
      if (this.isProcessing) return;
      this.isProcessing = true;
      try {
        await this.processQueue();
      } catch (err) {
        console.error("DispatchEngine Error:", err);
      } finally {
        this.isProcessing = false;
      }
    }, 5000); // 5 sec interval
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async processQueue() {
    const searches = await RedisService.getActiveSearches();

    for (const search of searches) {
      const { rideId, start_time, level, pickup_lat, pickup_lng, dest_lat, dest_lng, is_shared, booking_type, payment_method, is_expanded_search, ride_category } = search;
      
      const elapsedMs = Date.now() - parseInt(start_time as string, 10);
      const currentLevel = parseInt(level as string, 10);
      
      // If elapsed > 5 minutes, timeout the current search queue.
      if (elapsedMs >= 300_000) {
        console.log(`[DispatchEngine] Search ${rideId} timed out. Removing from queue.`);
        await RedisService.removeActiveSearch(rideId);
        
        // Let the frontend handle the next step (it has a timeout modal)
        continue;
      }

      // Check if ride was already accepted or abandoned
      const ride = await RideModel.findById(rideId);
      if (!ride || ride.status !== "SEARCHING") {
        await RedisService.removeActiveSearch(rideId);
        continue;
      }

      // Determine Target Level based on elapsed time OR is_expanded_search
      let targetLevel = 0;
      
      // Override if explicitly requested expanded search initially
      if (is_expanded_search === 'true') {
        targetLevel = 3; // Start from highest
      } else {
        if (elapsedMs < 60000) {
          targetLevel = 0; // 0 - 60s
        } else if (elapsedMs < 120000) {
          targetLevel = 1; // 1 - 2 mins
        } else if (elapsedMs < 180000) {
          targetLevel = 2; // 2 - 3 mins
        } else {
          targetLevel = 3; // > 3 mins
        }
      }

      // Dispatch continuously so that any newly online drivers receive the broadcast.
      // The frontend driver app (SocketContext) handles deduplication.
      await this.dispatchToLevel(search, targetLevel, ride);
      
      // Update level in Redis just for tracking
      await RedisService.updateSearchLevel(rideId, targetLevel === 0 ? 0.5 : targetLevel);
    }
  }

  private async dispatchToLevel(search: any, level: number, ride: any) {
    const { rideId, pickup_lat, pickup_lng, dest_lat, dest_lng, is_shared, booking_type, payment_method, ride_category } = search;

    // Define Radius/Limit mapping
    // Level 0.0 or 0.5: 2km, 10 drivers
    // Level 0.0 or 0.5: 5km, 10 drivers
    // Level 1: 5km, 15 drivers
    // Level 2: 15km, 25 drivers
    // Level 3: 40km, 40 drivers
    const limits = ride_category === 'courier' ? [
      { maxDistance: 2000, limit: 15 },
      { maxDistance: 8000, limit: 25 },
      { maxDistance: 20000, limit: 40 },
      { maxDistance: 50000, limit: 60 },
    ] : [
      { maxDistance: 5000, limit: 10 },
      { maxDistance: 5000, limit: 15 },
      { maxDistance: 15000, limit: 25 },
      { maxDistance: 40000, limit: 40 },
    ];

    const config = limits[Math.floor(level)] || limits[3];

    const targetRole = ride_category === 'courier' ? 'Courier Driver' : 'Individual Driver';

    let driversToNotify = [];
    
    try {
      driversToNotify = await UserModel.find({
        roles: targetRole,
        is_available: true,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(pickup_lng), parseFloat(pickup_lat)] },
            $maxDistance: config.maxDistance,
          },
        },
      }).limit(config.limit);
    } catch (dbErr) {
      console.error(`[DispatchEngine] Geo-query failed for ride ${rideId}:`, dbErr.message);
      // Fallback below will handle empty driversToNotify
    }

    if (driversToNotify.length === 0) {
      const allOnlineCount = await UserModel.countDocuments({ is_available: true });
      const roleMatchCount = await UserModel.countDocuments({ roles: targetRole, is_available: true });
      console.log(`[DispatchEngine] No drivers found within ${config.maxDistance}m. Total online: ${allOnlineCount}, Matching Role (${targetRole}): ${roleMatchCount}. Falling back.`);
      
      // Fallback: Just find available drivers matching the role
      driversToNotify = await UserModel.find({
        roles: targetRole,
        is_available: true,
      }).limit(config.limit);

      // If STILL empty, maybe targetRole is mismatched. Just get any available driver in dev.
      if (driversToNotify.length === 0 && allOnlineCount > 0) {
        console.warn(`[DispatchEngine] Target role ${targetRole} yielded 0 drivers. Falling back to ALL online drivers.`);
        driversToNotify = await UserModel.find({ is_available: true }).limit(config.limit);
      }
    }

    let passengerName = 'Valued Passenger';
    try {
      const passengerIdStr = String(ride.passenger_id);
      let passenger;
      if (require('mongoose').isValidObjectId(passengerIdStr)) {
        passenger = await UserModel.findOne({ $or: [{ id: ride.passenger_id }, { _id: ride.passenger_id }] });
      } else {
        passenger = await UserModel.findOne({ id: ride.passenger_id });
      }
      if (passenger) {
        passengerName = `${passenger.firstname} ${passenger.lastname}`;
      }
    } catch (err) {
      console.error('[DispatchEngine] Failed to fetch passenger details for name:', err);
    }

    console.log(`[DispatchEngine] Dispatched ${rideId} at Level ${level} (${config.maxDistance / 1000}km) to ${driversToNotify.length} drivers.`);

    driversToNotify.forEach((driver: any) => {
      const targetId1 = String(driver._id);
      const targetId2 = String(driver.id);
      console.log(`[DispatchEngine] Emitting newRideRequest for ride ${rideId} to rooms: user-${targetId1} and user-${targetId2}`);
      this.io.to(`user-${targetId1}`).to(`user-${targetId2}`).emit('newRideRequest', {
        ride_id: rideId,
        pickup: ride.pickup_location.address || 'Pickup Point',
        pickup_address: ride.pickup_location.address || 'Pickup Point',
        destination: ride.destination_location.address || 'Destination Point',
        destination_address: ride.destination_location.address || 'Destination Point',
        fare: ride.local_fare || ride.fare,
        currency_symbol: ride.currency_symbol || '₦',
        distance: ride.estimated_distance,
        passenger_name: passengerName,
        is_shared: is_shared === 'true',
        is_backup: false,
        booking_type,
        payment_method
      });
    });
  }
}
