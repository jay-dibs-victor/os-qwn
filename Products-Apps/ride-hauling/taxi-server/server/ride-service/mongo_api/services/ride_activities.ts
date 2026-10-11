/**
 * Ride Activities for Temporal Orchestration
 */
import RideModel from '../models/Ride.model';
import UserModel from '../models/User.model';
import { RedisService } from './redis_service';
import { MQService } from '../../../shared/rabbitmq';

export interface CreateRideInput {
  passenger_id: string;
  pickup_lat: number;
  pickup_lng: number;
  dest_lat: number;
  dest_lng: number;
  distance: number;
  duration: number;
  ride_category?: string;
  ride_type?: string;
  payment_method?: string;
}

export const createRideActivity = async (input: CreateRideInput): Promise<any> => {
  console.log('[RideActivities] Creating ride for user:', input.passenger_id);
  
  const verification_code = Math.floor(1000 + Math.random() * 9000).toString();
  
  const newRide = new RideModel({
    passenger_id: input.passenger_id,
    passengers: [input.passenger_id],
    pickup_location: { type: 'Point', coordinates: [input.pickup_lng, input.pickup_lat] },
    destination_location: { type: 'Point', coordinates: [input.dest_lng, input.dest_lat] },
    status: 'SEARCHING',
    ride_category: input.ride_category || 'taxi',
    ride_type: input.ride_type || 'Fair',
    payment_method: input.payment_method || 'BANK',
    distance: input.distance,
    duration: input.duration,
    verification_code,
    created_at: new Date()
  });

  await newRide.save();

  // Queue in Redis for Dispatch Engine
  await RedisService.addActiveSearch(newRide._id.toString(), {
    pickup_lat: input.pickup_lat,
    pickup_lng: input.pickup_lng,
    ride_category: input.ride_category || 'taxi'
  });

  // Publish internal event for other services
  await MQService.publish('ride.events', 'ride.requested', newRide);

  return JSON.parse(JSON.stringify(newRide));
};

export const assignDriverActivity = async (rideId: string, driverId: string): Promise<any> => {
  console.log(`[RideActivities] Assigning driver ${driverId} to ride ${rideId}`);
  
  const ride = await RideModel.findOneAndUpdate(
    { _id: rideId, status: 'SEARCHING' },
    { status: 'ACCEPTED', driver_id: driverId },
    { new: true }
  );

  if (!ride) {
    throw new Error('Ride no longer available or already accepted');
  }

  const driver = await UserModel.findOneAndUpdate(
    { id: driverId },
    { is_available: false, current_activity: 'EN_ROUTE' },
    { new: true }
  );

  return {
    rideId: ride._id,
    driverId,
    driverName: driver?.firstname || 'Driver',
    status: 'ACCEPTED'
  };
};

export const updateRideStatusActivity = async (rideId: string, status: string): Promise<any> => {
  console.log(`[RideActivities] Updating ride ${rideId} to status ${status}`);
  
  const ride = await RideModel.findByIdAndUpdate(
    rideId,
    { status },
    { new: true }
  );

  if (!ride) throw new Error('Ride not found');

  if (status === 'COMPLETED') {
    await UserModel.updateOne({ id: ride.passenger_id }, { $inc: { completed_trips: 1 } });
    await UserModel.updateOne({ id: ride.driver_id }, { $inc: { completed_trips: 1 }, is_available: true, current_activity: 'IDLE' });
  }

  return JSON.parse(JSON.stringify(ride));
};

export const cancelRideActivity = async (rideId: string, reason: string): Promise<any> => {
  console.log(`[RideActivities] Cancelling ride ${rideId}. Reason: ${reason}`);
  
  const ride = await RideModel.findById(rideId);
  if (!ride) throw new Error('Ride not found');

  ride.status = 'CANCELLED';
  ride.cancel_reason = reason;
  await ride.save();

  if (ride.driver_id) {
    await UserModel.updateOne({ id: ride.driver_id }, { is_available: true, current_activity: 'IDLE' });
  }

  return { rideId, status: 'CANCELLED' };
};
