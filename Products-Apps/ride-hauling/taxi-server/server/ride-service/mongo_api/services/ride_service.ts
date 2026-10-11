import { Request, Response } from 'express';
import axios from 'axios';
import RideModel from '../models/Ride.model';
import UserModel from '../models/User.model';
import DriverModel from '../models/Driver.model';
import WalletModel from '../models/Wallet.model';
import AdminLedger from '../models/AdminLedger.model';
import MailMan from './MailMan';
import { ErrorHandler } from '../helpers/error_handler';
import { GamificationService } from './gamification_service';
import { CurrencyService } from './currency_service';
import { RedisService } from './redis_service';
import { MQService } from '../../../shared/rabbitmq';
import { SmsService } from './sms_service';

const OS_SERVICE_URL = process.env.OS_SERVICE_URL || 'http://localhost:12010';

export class RideService {
  /**
   * Send a signal to the AI OS Temporal Workflow
   */
  static async sendOSSignal(rideId: string, signal: string, payload: any = {}) {
    try {
      await axios.post(`${OS_SERVICE_URL}/os/workflow/ride/${rideId}/signal`, {
        signal,
        payload
      });
      console.log(`[RideService] Dispatched OS Signal: ${signal} for ride ${rideId}`);
    } catch (e: any) {
      console.warn(`[RideService] Failed to dispatch OS Signal ${signal}: ${e.message}`);
    }
  }

  /**
   * Find an active ride for session recovery
   */
  static async findActiveRideForUser(userId: string) {
    return await (RideModel as any).findOne({
      passenger_id: userId,
      status: { $in: ['SEARCHING', 'ACCEPTED', 'ARRIVED', 'STARTED'] }
    });
  }

  static async getRideDetails(request: Request, response: Response) {
    const { id } = request.params;
    try {
      const ride = await (RideModel as any).findById(id);
      if (!ride) {
        return response.status(404).json({ status: 404, error: 'Ride not found' });
      }

      let enrichedRide = ride.toObject();

      // Fetch passenger details
      const passengerIdStr = String(ride.passenger_id);
      let passenger;
      if (require('mongoose').isValidObjectId(passengerIdStr)) {
        passenger = await UserModel.findOne({ $or: [{ id: ride.passenger_id }, { _id: ride.passenger_id }] });
      } else {
        passenger = await UserModel.findOne({ id: ride.passenger_id });
      }
      if (passenger) {
        enrichedRide.passenger_name = `${passenger.firstname} ${passenger.lastname}`;
        enrichedRide.passenger_phone = passenger.phone_number;
      }

      // Fetch driver/vehicle details if driver is assigned
      if (ride.driver_id) {
        const query = /^[0-9a-fA-F]{24}$/.test(ride.driver_id) 
          ? { _id: ride.driver_id } 
          : { id: Number(ride.driver_id) };
        const driver = await UserModel.findOne(query);
        if (driver) {
          const driverRecord = await (DriverModel as any).findOne({ email: driver.email });
          const vehicleInfo = driverRecord?.vehicle || { type: 'Premium Sedan', plate: 'KJA-552', color: 'Black', year: '2020' };

          enrichedRide.driver_name = `${driver.firstname} ${driver.lastname}`;
          enrichedRide.driver_phone = driver.phone_number || driverRecord?.phone_number || '+234 810 000 0000';
          enrichedRide.driver_rating = Number(driver.ratings_average) || driverRecord?.rating || 4.8;
          enrichedRide.vehicle_info = vehicleInfo.type;
          enrichedRide.vehicle_model = vehicleInfo.type;
          enrichedRide.vehicle_plate = vehicleInfo.plate;
          enrichedRide.driver_location = driver.location;
        }
      }

      return response.status(200).json({ status: 200, data: enrichedRide });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Create a ride request and notify nearby drivers
   */
  static async createRideRequest(request: Request, response: Response) {
    const {
      passenger_id,
      pickup_lat,
      pickup_lng,
      pickup_address,
      dest_lat,
      dest_lng,
      dest_address,
      distance,
      duration,
      is_shared = false,
      max_passengers = 1,
      booking_type = 'QUICK',
      scheduled_time,
      preferred_drivers = [],
      payment_method = 'BANK',
      voucher_code,
      ride_category = 'taxi',
      ride_type = 'Fair',
      is_expanded_search = false,
      itineraries = [], // Array of { address, lat, lng }
      delivery_meta // { package_type, weight_kg, receiver_phone, is_fragile, delivery_type }
    } = request.body;
    const io = (request as any).app.io;

    try {
      let passenger;
      const passengerIdStr = String(passenger_id);
      
      if (require('mongoose').isValidObjectId(passengerIdStr)) {
        passenger = await (UserModel as any).findOne({ $or: [{ id: passenger_id }, { _id: passenger_id }] });
      } else {
        passenger = await (UserModel as any).findOne({ id: passenger_id });
      }
      if (payment_method === 'COIN') {
        const threshold = Number(process.env.COIN_TRIP_LOCK_THRESHOLD_USER) || 3;
        if (!passenger || (passenger.completed_trips || 0) < threshold) {
          return response.status(403).json({
            status: 403,
            error: `TaxiCoins are locked. Complete at least ${threshold} successful trips to unlock coin payments. Current: ${passenger?.completed_trips || 0}/${threshold}`
          });
        }
      }

      const surgeMultiplier = await this.calculateSurge(pickup_lat, pickup_lng);
      const fare = this.calculateFare(
        distance || 0,
        duration || 0,
        surgeMultiplier,
        delivery_meta?.weight_kg,
        delivery_meta?.is_fragile
      );

      // Multi-currency logic: Detect location and convert fare
      const currencyInfo = await CurrencyService.getLocalCurrencyInfo(pickup_lat, pickup_lng);
      const localFare = Number((fare * currencyInfo.rate).toFixed(2));

      const verification_code = Math.floor(1000 + Math.random() * 9000).toString();

      const newRide = new RideModel({
        passenger_id,
        passengers: [passenger_id],
        pickup_location: { type: 'Point', coordinates: [pickup_lng, pickup_lat], address: pickup_address },
        destination_location: { type: 'Point', coordinates: [dest_lng, dest_lat], address: dest_address },
        status: 'SEARCHING',
        booking_type,
        ride_category,
        ride_type,

        backup_drivers: preferred_drivers.slice(1, 4), // 2nd, 3rd drivers are backups
        payment_method,
        voucher_code,
        fare,
        local_fare: localFare,
        currency: currencyInfo.code,
        currency_symbol: currencyInfo.symbol,
        exchange_rate: currencyInfo.rate,
        verification_code,
        distance: distance || 1000,
        duration: duration || 600, // Pre-calculated estimate in seconds
        estimated_duration: Math.ceil((duration || 600) / 60), // Estimate in minutes
        is_shared,
        max_passengers,
        available_seats: max_passengers - 1,
        stop_points: itineraries.length > 0
          ? itineraries.map((iti: any) => ({
            location: { type: 'Point', coordinates: [iti.lng, iti.lat] },
            address: iti.address,
            type: 'DELIVERY',
            status: 'PENDING'
          }))
          : [
            { location: { type: 'Point', coordinates: [pickup_lng, pickup_lat] }, passenger_id, type: 'PICKUP' },
            { location: { type: 'Point', coordinates: [dest_lng, dest_lat] }, passenger_id, type: 'DROPOFF' }
          ],
        delivery_meta,
        scheduled_time: delivery_meta?.scheduled_at ? new Date(delivery_meta.scheduled_at) : scheduled_time
      });

      await newRide.save();

      // Queue the ride in Redis for Progressive Batch Dispatch
      await RedisService.addActiveSearch(newRide._id.toString(), {
        pickup_lat,
        pickup_lng,
        dest_lat,
        dest_lng,
        is_shared,
        booking_type,
        payment_method,
        ride_category,
        is_expanded_search: is_expanded_search ? 'true' : 'false',
        delivery_meta: JSON.stringify(delivery_meta)
      });

      // Drivers will be notified asynchronously via DispatchEngine

      // Publish to RabbitMQ
      try {
        await MQService.publish('ride.events', 'ride.requested', newRide);
      } catch (e) {
        console.error('[RideService] Failed to publish ride.requested:', e);
      }

      // SMS Fallback for Courier OTP
      if (ride_category === 'courier' && passenger?.phone_number) {
        await SmsService.sendOtp(passenger.phone_number, verification_code);
      }

      return response.status(201).json({
        status: 201,
        message: 'Processing ride request...',
        data: { ride: newRide, queued: true },
      });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Helper to calculate ride fare
   */
  static async calculateSurge(lat: number, lng: number): Promise<number> {
    const activeRequests = await (RideModel as any).countDocuments({
      status: 'SEARCHING',
      pickup_location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], 2 / 6378.1] // 2km in radians
        },
      },
    });

    const availableDrivers = await (UserModel as any).countDocuments({
      roles: 'Individual Driver',
      is_available: true,
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], 2 / 6378.1]
        },
      },
    });

    if (availableDrivers === 0) return 2.0;
    const ratio = activeRequests / availableDrivers;

    if (ratio > 2) return 2.5;
    if (ratio > 1.5) return 1.8;
    if (ratio > 1) return 1.3;

    return 1.0;
  }

  /**
   * Helper to get distance and duration from external Map APIs
   */
  static async getRouteMetrics(origin: { lat: number, lng: number }, dest: { lat: number, lng: number }) {
    const provider = process.env.MAP_PROVIDER || 'OSM';
    const googleKey = process.env.GOOGLE_MAPS_API_KEY;

    try {
      if (provider === 'GOOGLE' && googleKey) {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${dest.lat},${dest.lng}&key=${googleKey}`;
        const resp = await axios.get(url, { timeout: 5000 });
        const element = resp.data.rows[0].elements[0];
        if (element.status === 'OK') {
          return {
            distance: element.distance.value, // meters
            duration: element.duration.value  // seconds
          };
        }
      } else {
        // Fallback to OSM (OSRM)
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=false`;
        console.log(`[RideService] Fetching OSRM route: ${url}`);
        const resp = await axios.get(url, { timeout: 5000 });
        if (resp.data.code === 'Ok') {
          console.log(`[RideService] OSRM distance: ${resp.data.routes[0].distance}m, duration: ${resp.data.routes[0].duration}s`);
          return {
            distance: resp.data.routes[0].distance,
            duration: resp.data.routes[0].duration
          };
        }
      }
    } catch (e: any) {
      console.error("Map API Error:", e.message);
    }

    // Final Haversine fallback if API fails
    const R = 6371e3; // meters
    const φ1 = origin.lat * Math.PI / 180;
    const φ2 = dest.lat * Math.PI / 180;
    const Δφ = (dest.lat - origin.lat) * Math.PI / 180;
    const Δλ = (dest.lng - origin.lng) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return { distance, duration: (distance / 40000) * 3600 }; // Roughly 40km/h
  }

  /**
   * Calculate fare for multiple stops (Planned Itineraries)
   */
  static async calculateMultiStopQuote(request: Request, response: Response) {
    const { itineraries } = request.body;
    console.log(`[RideService] Received quote request with ${itineraries?.length} stops`);
    if (itineraries?.[0]) {
      console.log(`[RideService] Stop 0: From(${itineraries[0].pickupCoords?.lat}, ${itineraries[0].pickupCoords?.lng}) To(${itineraries[0].destinationCoords?.lat}, ${itineraries[0].destinationCoords?.lng})`);
    }
    if (!itineraries || !Array.isArray(itineraries)) {
      return response.status(400).json({ status: 400, error: 'Itineraries array is required' });
    }

    try {
      let totalFare = 0;
      const results = await Promise.all(itineraries.map(async (iti: any) => {
        let dist = iti.distance;
        let dur = iti.duration;

        if (iti.pickupCoords && iti.destinationCoords) {
          const metrics = await this.getRouteMetrics(
            iti.pickupCoords,
            iti.destinationCoords
          );
          dist = metrics.distance;
          dur = metrics.duration;
        }

        const individualFare = this.calculateFare(
          dist || 10000,
          dur || 1200,
          1.0,
          iti.package_meta?.weight_kg,
          iti.package_meta?.is_fragile
        );
        totalFare += individualFare;

        return {
          ...iti,
          estimated_fare: individualFare,
          estimated_distance: dist || 10000,
          estimated_duration: Math.round((dur || 1200) / 60)
        };
      }));

      // Convert total USD fare to local currency
      const firstIti = itineraries[0];
      const currencyInfo = await CurrencyService.getLocalCurrencyInfo(
        firstIti.pickupCoords?.lat,
        firstIti.pickupCoords?.lng
      );
      const localTotalFare = Math.round(totalFare * currencyInfo.rate);
      console.log(`[RideService] Quote Calculation: USD=${totalFare}, Rate=${currencyInfo.rate}, Final=${localTotalFare} ${currencyInfo.code}`);

      return response.status(200).json({
        status: 200,
        data: {
          itineraries: results,
          total_fare: localTotalFare,
          currency: currencyInfo.code,
          currency_symbol: currencyInfo.symbol,
          usd_fare: totalFare,
          exchange_rate: currencyInfo.rate
        }
      });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Helper to calculate ride fare
   */
  static calculateFare(distance: number, duration: number, surgeMultiplier: number = 1.0, weight: number = 0, isFragile: boolean = false) {
    // Constants in USD (Fetched from Env or defaults)
    const baseFare = Number(process.env.RIDE_BASE_FARE_USD) || 0.50;
    const perKmRate = Number(process.env.RIDE_PER_KM_USD) || 0.12;
    const perMinRate = Number(process.env.RIDE_PER_MIN_USD) || 0.02;
    const minFare = Number(process.env.RIDE_MIN_FARE_USD) || 1.00;

    let subtotal = baseFare + (distance / 1000) * perKmRate + (duration / 60) * perMinRate;
    
    // Apply minimum fare
    if (subtotal < minFare) subtotal = minFare;

    // Courier Surcharges (Lagos Scooter MVP)
    if (weight > 5) {
      const extraWeight = weight - 5;
      subtotal += extraWeight * 0.10; // ~$0.10 per extra kg (~₦150)
    }

    if (isFragile) {
      subtotal += 0.50; // ~$0.50 flat for fragile handling (~₦750)
    }

    return subtotal * surgeMultiplier;
  }

  static calculateCoinFare(nairaFare: number) {
    return nairaFare * 2; // 1000 Coins = 500 Naira
  }

  /**
   * Driver accepts a ride (Competitive 'Battle' mode)
   */
  static async acceptRide(request: Request, response: Response) {
    const { ride_id, driver_id } = request.body;
    const io = (request as any).app.io;

    try {
      // Use findOneAndUpdate with selection filter to prevent double-acceptance
      const ride = await (RideModel as any).findOneAndUpdate(
        { _id: ride_id, status: 'SEARCHING' },
        { status: 'ACCEPTED', driver_id: driver_id },
        { new: true }
      );

      if (!ride) {
        return response.status(400).json({ status: 400, error: 'Ride is no longer available. Another driver was faster!' });
      }

      const query = /^[0-9a-fA-F]{24}$/.test(driver_id) 
        ? { _id: driver_id } 
        : { id: Number(driver_id) };
      const driver = await (UserModel as any).findOne(query);
      if (!driver) {
        // Rollback ride status if driver not found (safety)
        ride.status = 'SEARCHING';
        ride.driver_id = undefined;
        await ride.save();
        return response.status(400).json({ status: 400, error: 'Driver profile error' });
      }

      // Update driver state
      driver.is_available = false;
      driver.current_activity = 'EN_ROUTE';
      await driver.save();

      // Query vehicle and ratings from DriverModel
      const driverRecord = await (DriverModel as any).findOne({ email: driver.email });
      const vehicleInfo = driverRecord?.vehicle || { type: 'Premium Sedan', plate: 'KJA-552', color: 'Black', year: '2020' };

      // Notify passenger — ride_id MUST be the first field so Plan.jsx can join the ride room
      io.to(`user-${ride.passenger_id}`).emit('rideAccepted', {
        ride_id: ride._id.toString(),           // ← Explicit string ID for room join
        id: ride._id.toString(),                // ← Legacy alias used by assignedDriver.id
        driver_id: driver.id || driver._id,
        driver_name: `${driver.firstname} ${driver.lastname}`,
        driver_phone: driver.phone_number || driverRecord?.phone_number || '+234 810 000 0000',
        driver_location: driver.location,
        driver_rating: driver.rating || driverRecord?.rating || 4.8,
        vehicle_info: vehicleInfo.type,
        vehicle_model: vehicleInfo.type,
        vehicle_plate: vehicleInfo.plate,
        verification_code: ride.verification_code,
        estimated_fare: ride.local_fare || ride.fare
      });

      // Notify other notified drivers that the ride is gone
      io.to('drivers').emit('rideTaken', { ride_id: ride._id });

      // Publish to RabbitMQ
      try {
        await MQService.publish('ride.events', 'ride.accepted', { ride_id: ride._id, driver_id, driver_name: driver.firstname });

        // If scheduled courier, notify messaging layer for reminders
        if (ride.ride_category === 'courier' && ride.scheduled_time) {
          await MQService.publish('ride.events', 'ride.scheduled.reminder', {
            ride_id: ride._id,
            passenger_id: ride.passenger_id,
            driver_id: ride.driver_id,
            scheduled_at: ride.scheduled_time,
            type: 'COURIER_PICKUP'
          });
        }
      } catch (e) {
        console.error('[RideService] Failed to publish ride.accepted/reminder:', e);
      }

      // Signal AI OS Workflow
      await this.sendOSSignal(ride._id.toString(), 'driverAccepted', {
        driverId: driver.id,
        driverName: driver.firstname,
        vehiclePlate: vehicleInfo.plate || 'N/A',
        eta: 5 // Simulated ETA
      });

      return response.status(200).json({ status: 200, message: 'Congratulations! You won the ride.', data: ride });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Update ride status with Real-time Fare Recalculation
   */
  static async updateRideStatus(request: Request, response: Response) {
    const { ride_id, status } = request.body;
    const io = (request as any).app.io;

    try {
      const ride = await (RideModel as any).findById(ride_id);
      if (!ride) return response.status(404).json({ status: 404, error: 'Ride not found' });

      if (status === 'STARTED') {
        const { start_code } = request.body;
        if (start_code && ride.verification_code && start_code !== ride.verification_code) {
          return response.status(403).json({ status: 403, error: 'Invalid verification code' });
        }
        ride.started_at_time = new Date();
      }

      if (status === 'COMPLETED') {
        const endTime = new Date();
        const actualDurationMs = endTime.getTime() - ride.started_at_time!.getTime();
        const actualMinutes = actualDurationMs / (1000 * 60);

        // Dynamic Fare Recalculation due to traffic/delays
        if (ride.estimated_duration && actualMinutes > ride.estimated_duration + 5) {
          const delayMinutes = actualMinutes - ride.estimated_duration;
          const trafficSurcharge = Math.round(delayMinutes * 40); // 40 per extra minute
          ride.recalculated_fare = ride.fare + trafficSurcharge;
          ride.fare = ride.recalculated_fare;
          // Sync local fare
          ride.local_fare = Number((ride.fare * ride.exchange_rate).toFixed(2));
        }

        // If Courier, check if all stops are vetted
        if (ride.ride_category === 'courier') {
          const allVetted = ride.stop_points.every(sp => sp.user_vetted);
          if (!allVetted) {
            return response.status(400).json({ status: 400, error: 'Cannot complete courier dispatch until all itinerary stops are vetted by the user.' });
          }
        }

        // If Cash or Bank, we need a settlement step
        if (ride.payment_method === 'CASH' || ride.payment_method === 'BANK') {
          ride.status = 'PENDING_SETTLEMENT';
        } else {
          ride.status = 'COMPLETED';
        }
      } else {
        ride.status = status;
        if (status === 'ARRIVED') {
          ride.arrived_at_pickup_time = new Date();
          // Signal OS Workflow
          await this.sendOSSignal(ride._id.toString(), 'driverArrived', { driverId: ride.driver_id });
        } else if (status === 'STARTED') {
          ride.started_at_time = new Date();
          // Signal OS Workflow (OTP Verified)
          await this.sendOSSignal(ride._id.toString(), 'otpVerified', { otp: ride.verification_code });
        }
      }

      await ride.save();

      if (ride.status === 'COMPLETED') {
        // Increment trip counts
        await (UserModel as any).updateOne({ id: ride.passenger_id }, { $inc: { completed_trips: 1 } });
        await (UserModel as any).updateOne({ id: ride.driver_id }, { $inc: { completed_trips: 1 }, is_available: true, current_activity: 'IDLE' });

        // ── REFERRAL REWARD ENGINE ──────────────────────────────
        const passenger = await (UserModel as any).findOne({ id: ride.passenger_id });
        if (passenger && passenger.referred_by) {
          const tripCount = await (RideModel as any).countDocuments({ passenger_id: ride.passenger_id, status: 'COMPLETED' });
          if (tripCount === 0) { // First ride ever
            const REFERRER_REWARD = 500;
            const PASSENGER_BONUS = 200;

            // Credit Referrer
            await WalletModel.updateOne(
              { userId: passenger.referred_by },
              { $inc: { balance: REFERRER_REWARD } }
            );
            // Credit Passenger
            await WalletModel.updateOne(
              { userId: passenger.id },
              { $inc: { balance: PASSENGER_BONUS } }
            );

            console.log(`[Referral] Referral reward applied for user ${passenger.id} and referrer ${passenger.referred_by}`);
          }
        }

        // ── GAMIFICATION: COIN DEDUCTION AND TRIP REWARDS ─────────────
        const driver = await (UserModel as any).findOne({ id: ride.driver_id });

        if (ride.payment_method === 'COIN') {
          const finalFareInCoins = ride.recalculated_fare ? RideService.calculateCoinFare(ride.recalculated_fare) : RideService.calculateCoinFare(ride.fare);
          if (passenger && (passenger.taxi_coins || 0) >= finalFareInCoins) {
            passenger.taxi_coins -= finalFareInCoins;
            await passenger.save();
          } else {
            console.warn(`[Gamification] User ${passenger?.id} doesn't have enough coins, but ride is completed. Warning.`);
          }
        } else if (passenger && passenger.use_coins_augmentation && (passenger.taxi_coins || 0) > 0) {
          // AUGMENTATION LOGIC: Use coins to reduce primary payment amount
          const fareValue = ride.recalculated_fare || ride.fare;
          const coinsAvailable = passenger.taxi_coins || 0;
          const coinsNeededForFull = fareValue * 2; // 1 Naira = 2 Coins

          const appliedCoins = Math.min(coinsAvailable, coinsNeededForFull);
          const fiatReduction = appliedCoins / 2;
          const remainingBalance = fareValue - fiatReduction;

          passenger.taxi_coins -= appliedCoins;
          await passenger.save();

          // Record transaction
          await GamificationService.addCoins(passenger.id.toString(), -appliedCoins, 'SPENT', `Augmented ${ride.payment_method} trip #${ride._id}`);

          console.log(`[Gamification] Split Payment: ${appliedCoins} TXC (₦${fiatReduction}) applied to trip. User needs to pay ₦${remainingBalance} extra.`);

          // Notify driver of remaining balance in local currency if Cash
          if (ride.payment_method === 'CASH') {
            const localRemaining = Number((remainingBalance * ride.exchange_rate).toFixed(2));
            (ride as any).balance_to_collect = localRemaining;
          }
        } else {
          // Provide completion coins based on distance (configurable)
          const km = (ride.distance || 0) / 1000;
          const rewardRate = Number(process.env.COIN_COMPLETION_REWARD_PER_KM) || 5;
          const rewardCoins = Math.round(km * rewardRate);
          if (rewardCoins > 0 && passenger) {
            try {
              await GamificationService.addCoins(passenger.id.toString(), rewardCoins, 'REWARD', `Trip Completion Reward: ${km.toFixed(1)} km`);
            } catch (e) {
              console.error("[Gamification] Failed to award completion coins:", e);
            }
          }
        }

        // ── DRIVER COMMISSION SPLIT ──────────────────────────────
        const commissionAmount = Number(process.env.COIN_COMMISSION_PER_TRIP) || 50;
        if (driver && driver.use_coins_for_commissions && (driver.taxi_coins || 0) >= commissionAmount) {
          driver.taxi_coins -= commissionAmount;
          await driver.save();
          await GamificationService.addCoins(driver.id.toString(), -commissionAmount, 'SPENT', `Remittance Surcharge for trip #${ride._id}`);
          console.log(`[Gamification] Driver ${driver.id} paid ${commissionAmount} TXC toward remittance.`);
        }

        // ── AUTOMATED E-RECEIPT ──────────────────────────────────
        try {
          await RideService.sendRideReceiptEmail(ride);
        } catch (e) {
          console.error("Failed to send e-receipt:", e);
        }
      }

      await ride.save();

      // Signal OS Workflow if COMPLETED
      if (status === 'COMPLETED' || status === 'PENDING_SETTLEMENT') {
        await this.sendOSSignal(ride._id.toString(), 'rideCompleted', {
          driverId: ride.driver_id,
          distance: (ride.distance || 0) / 1000,
          duration: ride.duration
        });
      }

      // Notify passengers with specific events for better frontend handling
      for (const pId of ride.passengers) {
        const payload = {
          ride_id: ride._id,
          status,
          fare: ride.fare,
          local_fare: ride.local_fare,
          currency: ride.currency,
          currency_symbol: ride.currency_symbol,
          is_recalculated: !!ride.recalculated_fare,
          driver_id: ride.driver_id,
          balance_to_collect: (ride as any).balance_to_collect,
          deducted_coins: (ride as any).deducted_coins || 0
        };

        io.to(`user-${pId}`).emit('rideStatusUpdated', payload);

        if (status === 'STARTED') {
          io.to(`user-${pId}`).emit('rideStarted', payload);
        } else if (status === 'COMPLETED') {
          io.to(`user-${pId}`).emit('rideCompleted', payload);
          // SMS Update on completion
          const passenger = await (UserModel as any).findOne({ id: pId });
          if (passenger?.phone_number) {
            await SmsService.sendUpdate(passenger.phone_number, `Your Queens delivery is complete. Thank you for choosing us!`);
          }
        }
      }

      return response.status(200).json({ status: 200, message: `Status: ${status}`, data: ride });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Verify trip completion code (sent to user 1 min before arrival)
   */
  static async verifyCompletionCode(request: Request, response: Response) {
    const { ride_id, code } = request.body;
    try {
      const ride = await (RideModel as any).findById(ride_id);
      if (!ride) return response.status(404).json({ status: 404, error: 'Ride not found' });

      if (ride.verification_code !== code) {
        return response.status(403).json({ status: 403, error: 'Invalid completion code' });
      }

      return response.status(200).json({ status: 200, message: 'Code verified successfully' });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Finalize Cash/Bank Transfer payment and acknowledge remittance
   */
  static async settlePayment(request: Request, response: Response) {
    const { ride_id, payment_type, driver_acknowledged = false } = request.body;
    try {
      const ride = await (RideModel as any).findById(ride_id);
      if (!ride) return response.status(404).json({ status: 404, error: 'Ride not found' });

      // For CASH/BANK trips, require driver to acknowledge before finalizing
      if ((payment_type === 'BANK_TRANSFER' || payment_type === 'CASH') && !driver_acknowledged) {
        return response.status(200).json({
          status: 200,
          message: 'Waiting for driver to acknowledge payment receipt.',
          data: { awaiting_acknowledgment: true }
        });
      }

      const fare = Number(ride.local_fare || ride.fare || 0);
      const commissionRate = Number(process.env.PLATFORM_COMMISSION_PERCENT || 15) / 100;
      const commissionAmount = Number((fare * commissionRate).toFixed(2));
      const driverCredit = Number((fare - commissionAmount).toFixed(2));

      // ── 1. DEDUCT FROM USER WALLET (if WALLET payment) ────────────────
      if ((payment_type || ride.payment_method) === 'WALLET') {
        const passenger = await (UserModel as any).findOne({ id: ride.passenger_id });
        if (passenger) {
          const currentBalance = parseFloat(passenger.balance || '0');
          if (currentBalance < fare) {
            return response.status(400).json({ status: 400, error: 'Insufficient wallet balance' });
          }
          passenger.balance = (currentBalance - fare).toFixed(2);
          await passenger.save();
        }
      }

      // ── 2. CREDIT DRIVER WALLET ────────────────────────────────────────
      const driver = await (UserModel as any).findOne({ id: ride.driver_id });
      if (driver) {
        driver.driver_wallet_balance = Number(((driver.driver_wallet_balance || 0) + driverCredit).toFixed(2));
        await driver.save();
      }

      // ── 3. LOG COMMISSION TO ADMIN LEDGER ─────────────────────────────
      await AdminLedger.create({
        ride_id: ride._id.toString(),
        driver_id: ride.driver_id,
        passenger_id: ride.passenger_id,
        fare,
        commission_rate: Number(process.env.PLATFORM_COMMISSION_PERCENT || 15),
        commission_amount: commissionAmount,
        driver_credit: driverCredit,
        payment_method: payment_type || ride.payment_method,
        currency: ride.currency || 'NGN',
        currency_symbol: ride.currency_symbol || '₦',
        status: 'SETTLED'
      });

      // ── 4. FINALIZE RIDE ──────────────────────────────────────────────
      ride.status = 'COMPLETED';
      ride.payment_status = 'PAID';
      await ride.save();

      const io = (request as any).app.io;

      // Notify driver — payment received, wallet credited
      io.to(`ride-${ride_id}`).emit('paymentSettled', {
        ride_id: ride._id,
        driver_credit: driverCredit,
        commission: commissionAmount,
        commission_rate: Number(process.env.PLATFORM_COMMISSION_PERCENT || 15),
        new_wallet_balance: driver?.driver_wallet_balance || driverCredit,
        currency_symbol: ride.currency_symbol || '₦'
      });

      // Notify passenger — payment confirmed, ride done
      io.to(`user-${ride.passenger_id}`).emit('rideCompleted', {
        ride_id: ride._id,
        fare,
        local_fare: fare,
        currency_symbol: ride.currency_symbol || '₦',
        payment_method: payment_type || ride.payment_method
      });

      io.to(`ride-${ride_id}`).emit('tripFinalized', { ride_id: ride._id });

      return response.status(200).json({
        status: 200,
        message: 'Payment settled and trip finalized.',
        data: {
          fare,
          commission: commissionAmount,
          driver_credit: driverCredit
        }
      });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Get logistics stats for dashboard
   */
  static async getLogisticsStats(request: Request, response: Response) {
    try {
      const activeRides = await (RideModel as any).countDocuments({ status: { $in: ['ACCEPTED', 'ARRIVED', 'STARTED'] } });
      const completedToday = await (RideModel as any).countDocuments({
        status: 'COMPLETED',
        created_at: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      });
      return response.status(200).json({ status: 200, data: { activeRides, completedToday } });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Submit Premium Post-Trip Feedback
   */
  static async submitRideFeedback(request: Request, response: Response) {
    const { ride_id, rating, feedback_tags, feedback_comment } = request.body;
    try {
      if (rating < 1 || rating > 5) return response.status(400).json({ status: 400, error: 'Rating must be between 1 and 5' });

      const ride = await (RideModel as any).findByIdAndUpdate(
        ride_id,
        { $set: { rating, feedback_tags, feedback_comment } },
        { new: true }
      );

      if (!ride) return response.status(404).json({ status: 404, message: 'Ride not found' });

      // ── QUALITY CONTROL: AGGREGATE DRIVER RATING ───────────
      const driverRides = await (RideModel as any).find({
        driver_id: ride.driver_id,
        rating: { $exists: true }
      });
      const avgRating = driverRides.reduce((acc: any, r: any) => acc + (r.rating || 0), 0) / driverRides.length;

      await (UserModel as any).updateOne(
        { id: ride.driver_id },
        { $set: { ratings_average: avgRating.toFixed(1) } }
      );

      return response.status(200).json({ status: 200, message: 'Thank you for your feedback!', data: ride });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Send Automated HTML E-Receipt
   */
  static async sendRideReceiptEmail(ride: any) {
    const user = await (UserModel as any).findOne({ id: ride.passenger_id });
    if (!user || !user.email) return;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #FFB800;">Queens Trip Receipt</h2>
        <p>Hi ${user.firstname}, thanks for riding with us!</p>
        <hr/>
        <div style="padding: 10px 0;">
          <p><strong>Total Fare:</strong> ₦${ride.fare.toLocaleString()}</p>
          <p><strong>Distance:</strong> ${(ride.distance / 1000).toFixed(2)} km</p>
          <p><strong>Actual Duration:</strong> ${ride.duration} mins</p>
        </div>
        <hr/>
        <p style="font-size: 12px; color: #888;">This is an automated receipt for your trip on ${new Date(ride.created_at).toLocaleDateString()}.</p>
        <p style="font-size: 12px; color: #888;">Queens Enterprise - Premium Logistics.</p>
      </div>
    `;

    // Using existing MailMan service
    await MailMan.send(
      'receipts@queens.com',
      user.email,
      `Your Queens Receipt - ₦${ride.fare}`,
      `Trip Receipt for ${ride.fare}`,
      htmlContent
    );
  }

  /**
   * Courier: Initiate handshake between user and rider after pickup
   */
  static async initiateHandshake(request: Request, response: Response) {
    const { ride_id } = request.body;
    const io = (request as any).app.io;
    try {
      const ride = await (RideModel as any).findById(ride_id);
      if (!ride) return response.status(404).json({ status: 404, error: 'Ride not found' });

      ride.handshake_status = 'ACTIVE';
      await ride.save();

      io.to(`user-${ride.passenger_id}`).emit('courierHandshakeInitiated', { ride_id: ride._id });

      return response.status(200).json({ status: 200, message: 'Handshake initiated successfully' });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Courier: Update specific stop status (Double Vetting)
   */
  static async updateStopStatus(request: Request, response: Response) {
    const { ride_id, stop_id, action } = request.body; // action: 'RIDER_DONE' | 'USER_VET'
    const io = (request as any).app.io;

    try {
      const ride = await (RideModel as any).findById(ride_id);
      if (!ride) return response.status(404).json({ status: 404, error: 'Ride not found' });

      const stop = (ride.stop_points as any).id(stop_id);
      if (!stop) return response.status(404).json({ status: 404, error: 'Stop point not found' });

      if (action === 'RIDER_DONE') {
        stop.rider_completed = true;
        io.to(`user-${ride.passenger_id}`).emit('courierStopCompletedByRider', { ride_id, stop_id });
      } else if (action === 'USER_VET') {
        if (!stop.rider_completed) {
          return response.status(400).json({ status: 400, error: 'Cannot vet a stop before the rider completes it.' });
        }
        stop.user_vetted = true;
        stop.status = 'COMPLETED';
        io.to(`user-${ride.driver_id}`).emit('courierStopVettedByUser', { ride_id, stop_id });
      }

      await ride.save();
      return response.status(200).json({ status: 200, message: 'Stop status updated', data: ride });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }
  static async getRideHistory(req: any, res: any) {
    try {
      const passenger_id = req.user.id || req.user._id;
      const rides = await (RideModel as any).find({ passenger_id }).sort({ createdAt: -1 });
      return res.status(200).json({ status: 200, data: rides });
    } catch (e: any) {
      return res.status(500).json({ status: 500, error: e.message });
    }
  }

  static async getCurrencyInfo(request: Request, response: Response) {
    const { lat, lng } = request.query;
    try {
      const currencyInfo = await CurrencyService.getLocalCurrencyInfo(
        lat ? Number(lat) : undefined,
        lng ? Number(lng) : undefined
      );
      return response.status(200).json({ 
        status: 200, 
        data: {
          ...currencyInfo,
          pricing: {
            baseFare: Number(process.env.RIDE_BASE_FARE_USD) || 0.50,
            perKm: Number(process.env.RIDE_PER_KM_USD) || 0.12,
            perMin: Number(process.env.RIDE_PER_MIN_USD) || 0.03,
            minFare: Number(process.env.RIDE_MIN_FARE_USD) || 1.00
          }
        } 
      });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }
}
