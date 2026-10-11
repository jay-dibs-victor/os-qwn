import express, { Application, Router } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import debug from 'debug';
import bodyParser from 'body-parser';
import logger from 'morgan';
import BridgeRouter from './api/routes';
import config from './config/mongo_config';
import DbMongoose from './models/db';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import session from 'express-session';
import compression from 'compression';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import * as swaggerUi from 'swagger-ui-express';
import { DispatchEngine } from './services/dispatch_engine';
import { MQService } from '../../shared/rabbitmq';
import { CORS_ALLOWED_ORIGINS } from '../../shared/constants';
// Load swagger.json safely — if it's invalid or missing, fall back to an empty document
let swaggerDocument: any = {};
try {
  // @ts-ignore
  // require may throw if JSON is malformed; catching prevents app crash
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  swaggerDocument = require('../../../swagger.json');
} catch (e) {
  console.error('Failed to load swagger.json, continuing without API docs:', e && e.message ? e.message : e);
  swaggerDocument = {};
}

const log = debug('Queens-dev-Proj-repo:server/server');

// passport config
require('./config/passport');

// These will need types later if converted or used as is
import Chat from './models/Chat';
import UserModel from './models/User.model';
import chatRouter from './route/chatroute';



export let ioInstance: any = null;
export const getIO = () => {
  if (!ioInstance) throw new Error('Socket.io not initialized');
  return ioInstance;
};

class MongoAppDemo {
  public express: Application;
  public port: number | string;

  constructor() {
    console.log("App constructor starts!");
    this.express = express();
    this.express.use(logger('dev'));

    const allowedOrigins = CORS_ALLOWED_ORIGINS;
    const allowedPorts = ['12000', '12001', '12002', '4002', '4004', '4000', '4001', '4003', '5173', '5174', '8081', '8082'];

    const corsOption = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          const originPort = origin.match(/:(\d+)$/)?.[1];
          if (originPort && allowedPorts.includes(originPort)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      exposedHeaders: ['x-auth-token'],
    };
    this.express.use(cors(corsOption));
    this.express.use(compression());

    this.express.use(
      session({
        secret: process.env.SECRET || 'secret',
        resave: true,
        saveUninitialized: true,
      }),
    );
    this.express.use(passport.initialize());

    this.express.use(bodyParser.json());
    this.express.disable('x-powered-by');
    this.express.use(
      bodyParser.urlencoded({
        extended: false,
      }),
    );
    this.express.use(cookieParser());

    // Swagger Documentation
    this.express.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    passport.serializeUser(function (user, done) {
      done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
      done(null, obj);
    });

    console.log("Attaching routes...");
    const router = Router();
    new BridgeRouter(router).attachRoutes();
    this.port = process.env.PORT || 12002;

    this.express.use('/api/v1', router);
    this.express.use('/api/v1/chats', chatRouter);

    // ── OS Session Token Stub (port 12000 proxy) ──────────────────
    // The full OS service lives on port 12010, but frontends call port 12000.
    // This lightweight handler returns a stable session token so the Dashboard
    // doesn't error. It does NOT require LiveKit or Temporal to be running.
    this.express.get('/api/v1/os/session/token', (req: any, res: any) => {
      const userId = req.query.userId || 'anonymous';
      const role   = req.query.role   || 'user';
      // Return a deterministic token (UUID-style) — sufficient for the
      // Dashboard's visual AI overlay which only needs a non-null value.
      const token = Buffer.from(`${userId}:${role}:${Date.now()}`).toString('base64');
      return res.status(200).json({
        success: true,
        token,
        roomId: `room-${userId}`,
        userId,
        role
      });
    });

    console.log("Routes attached.");
    this.express.set('view engine', 'pug');

    // Health Check Endpoint
    this.express.get('/health', async (req, res) => {
      const redisStatus = await require('./services/redis_service').RedisService.isAlive();
      const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      res.status(200).json({
        status: 'UP',
        timestamp: new Date(),
        services: {
          redis: redisStatus ? 'UP' : 'DOWN',
          mongodb: mongoStatus,
          socket: !!ioInstance ? 'UP' : 'DOWN'
        }
      });
    });
  }

  initialize() { }

  run(port: number | string = 12002) {
    if (port) {
      this.port = port;
    }

    const httpServer = http.createServer(this.express);

    httpServer.listen(this.port as number, '0.0.0.0', () => {
      console.log(`HTTP Server running on 0.0.0.0:${this.port}`);
      const { startAgenda } = require('./services/agenda_service');
      startAgenda().catch(err => console.error('Error starting agenda:', err));
    });

    // ✅ Socket.IO v4 requires `new Server(...)` — calling it as a function
    // returns undefined in v4, which silently breaks ALL real-time features.
    const io = new SocketServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      // Allow both EIO3 (v2/v3 clients) and EIO4 (v4 clients) for max compatibility
      allowEIO3: true,
      // Prefer WebSocket but allow polling as fallback so mobile/proxied clients work
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    (this.express as any).io = io; // Attach to express app context
    ioInstance = io; // Assign singleton for cross-file imports

    const dispatchEngine = new DispatchEngine(io);
    dispatchEngine.start();

    // Setup RabbitMQ Consumer for Side-effects
    MQService.subscribe('auth.events', 'ride-service-auth-queue', 'user.created', (msg) => {
        console.log('[Ride-Service] RabbitMQ Event Received - New user registered:', msg.email);
        // Emit to admins if needed
        io.to('admin-observatory').emit('live-operation-event', {
            type: 'USER_SIGNUP',
            email: msg.email,
            timestamp: new Date()
        });
    });

    MQService.subscribe('ride.events', 'ride-service-request-queue', 'ride.requested', (msg) => {
        console.log('[Ride-Service] RabbitMQ Event - Ride Requested:', msg._id);
        // This can be used for logging or notifying other services.
        // The actual driver notification is currently handled by DispatchEngine's periodic check,
        // but we could also trigger an immediate dispatch pass here.
    });

    MQService.subscribe('ride.events', 'ride-service-accept-queue', 'ride.accepted', (msg) => {
        console.log('[Ride-Service] RabbitMQ Event - Ride Accepted:', msg.ride_id);
        // If this was accepted on another instance, we ensure local socket clients are informed
        io.to(`ride-${msg.ride_id}`).emit('rideAccepted', msg);
    });

    let interval: any
    const locationMap = new Map();
    const immobilityTimers = new Map();

    io.on('connection', (socket: any) => {
      console.log('New client connected: ' + socket.id);

      socket.on('join', async (data: any) => {
        const { role, userId } = data;
        if (role === 'driver') {
          socket.join('drivers');
        } else if (role === 'passenger') {
          socket.join('passengers');
        }
        if (userId) {
          socket.join(`user-${userId}`);
          
          // SESSION RECOVERY: Check if there's an active ride for this user
          const { RideService } = require('./services/ride_service');
          const activeRide = await RideService.findActiveRideForUser(userId);
          if (activeRide) {
             socket.join(`ride-${activeRide._id}`);
             
             let enrichedRide = activeRide.toObject();

             // Fetch passenger details
             const passengerIdStr = String(activeRide.passenger_id);
             let passenger;
             const UserModel = require('./models/User.model').default;
             if (require('mongoose').isValidObjectId(passengerIdStr)) {
               passenger = await UserModel.findOne({ $or: [{ id: activeRide.passenger_id }, { _id: activeRide.passenger_id }] });
             } else {
               passenger = await UserModel.findOne({ id: activeRide.passenger_id });
             }
             if (passenger) {
               enrichedRide.passenger_name = `${passenger.firstname} ${passenger.lastname}`;
               enrichedRide.passenger_phone = passenger.phone_number;
             }

             // Fetch driver/vehicle details if driver is assigned
             if (activeRide.driver_id) {
               const query = /^[0-9a-fA-F]{24}$/.test(activeRide.driver_id) 
                 ? { _id: activeRide.driver_id } 
                 : { id: Number(activeRide.driver_id) };
               const driver = await UserModel.findOne(query);
               if (driver) {
                 const DriverModel = require('./models/Driver.model').default;
                 const driverRecord = await DriverModel.findOne({ email: driver.email });
                 const vehicleInfo = driverRecord?.vehicle || { type: 'Premium Sedan', plate: 'KJA-552', color: 'Black', year: '2020' };

                 enrichedRide.driver_name = `${driver.firstname} ${driver.lastname}`;
                 enrichedRide.driver_phone = driver.phone_number || driverRecord?.phone_number || '+234 810 000 0000';
                 enrichedRide.driver_rating = driver.rating || driverRecord?.rating || 4.8;
                 enrichedRide.vehicle_info = vehicleInfo.type;
                 enrichedRide.vehicle_model = vehicleInfo.type;
                 enrichedRide.vehicle_plate = vehicleInfo.plate;
                 enrichedRide.driver_location = driver.location;
               }
             }

             socket.emit('sessionRecovered', { ride: enrichedRide });
             console.log(`Recovered session for user ${userId} on ride ${activeRide._id}`);
          }
        }
        console.log(`User ${userId} joined as ${role}`);
      });

      socket.on('join-ride', (data: any) => {
         const rideId = data.rideId || data.ride_id;
         if (rideId) {
           socket.join(`ride-${rideId}`);
           console.log(`Socket ${socket.id} joined ride room: ride-${rideId}`);
         }
      });

      // ─────────────────────────────────────────────────────────────────
      // ADMIN OBSERVATORY (Live Map Management)
      // ─────────────────────────────────────────────────────────────────
      socket.on('join-observatory', () => {
        socket.join('admin-observatory');
        console.log(`Admin ${socket.id} joined Live Map Observatory`);
      });

      socket.on('get-observatory-snapshot', async () => {
        try {
          const RideModel = require('./models/Ride.model').default;
          // Fetch active drivers
          const activeDrivers = await UserModel.find({
            roles: { $in: ['Individual Driver', 'Courier Driver'] },
            is_available: true,
            location: { $exists: true }
          }).select('id firstname lastname location current_activity ratings_average avatar vehicle_info');

          // Fetch active rides
          const activeRides = await RideModel.find({
            status: { $in: ['SEARCHING', 'ACCEPTED', 'ARRIVED', 'STARTED'] }
          });

          socket.emit('observatory-snapshot', {
            drivers: activeDrivers,
            rides: activeRides
          });
        } catch (err) {
          console.error('Observatory snapshot error:', err);
        }
      });

      // ─────────────────────────────────────────────────────────────────
      // CHAT PERSISTENCE
      // ─────────────────────────────────────────────────────────────────
      socket.on('chat-message', async (data: any) => {
        const { ride_id, sender, receiver, message, sender_role } = data;
        // Normalise sender_role so it is always present
        const resolvedRole = sender_role || (data.from === 'user' ? 'passenger' : 'driver');
        try {
          const newChat = new Chat({
            ride_id,
            sender,
            receiver,
            message,
            sender_role: resolvedRole,
            createdAt: new Date()
          });
          await newChat.save();

          // Broadcast to every socket in the ride room (covers both user & driver)
          const chatPayload = {
            ...newChat.toObject(),
            sender_role: resolvedRole,
            createdAt: newChat.createdAt || new Date()
          };
          io.to(`ride-${ride_id}`).emit('new-chat-message', chatPayload);

          // Notify observatory
          io.to('admin-observatory').emit('live-operation-event', {
            type: 'CHAT',
            rideId: ride_id,
            message,
            sender: resolvedRole
          });
        } catch (err) {
          console.error('Chat error:', err);
        }
      });


      // Alias for frontend parity
      socket.on('sendRideMessage', async (data: any) => {
        const { rideId, message, from = 'user' } = data;
        try {
          const newChat = new Chat({
            ride_id: rideId,
            sender: from,
            message,
            sender_role: from === 'user' ? 'passenger' : 'driver'
          });
          await newChat.save();
          io.to(`ride-${rideId}`).emit('new-chat-message', newChat);
        } catch (err) {
          console.error('Chat error (sendRideMessage):', err);
        }
      });

      // ─────────────────────────────────────────────────────────────────
      // VOICE CALL SIGNALING (WebRTC)
      // ─────────────────────────────────────────────────────────────────
      socket.on('initiate-call', (data: any) => {
         const { rideId, callerName, offer } = data;
         // Send 'incoming-call' to others in the ride room
         socket.to(`ride-${rideId}`).emit('incoming-call', { callerName, rideId, offer });
         // Emit 'call-ringing' back to caller to trigger beep
         socket.emit('call-ringing', { rideId });

         // Notify observatory
         io.to('admin-observatory').emit('live-operation-event', {
            type: 'CALL',
            rideId: rideId,
            status: 'STARTING',
            caller: callerName
         });
      });

      socket.on('accept-call', (data: any) => {
         const { rideId, answer } = data;
         socket.to(`ride-${rideId}`).emit('call-accepted', { rideId, answer });
      });

      socket.on('ice-candidate', (data: any) => {
         const { rideId, candidate } = data;
         socket.to(`ride-${rideId}`).emit('ice-candidate', { candidate });
      });

      socket.on('end-call', (data: any) => {
         const { rideId } = data;
         socket.to(`ride-${rideId}`).emit('call-ended', { rideId });
      });

      // ─────────────────────────────────────────────────────────────────
      // REAL-TIME LOCATION & SAFETY WATCHDOG
      // ─────────────────────────────────────────────────────────────────
      socket.on('updateLocation', async (pos: any) => {
        const { driverId, lat, lng, rideId } = pos;
        if (driverId) {
          // Broadcast to specific ride room (so passenger can see) and legacy driver room
          io.to(`track-driver-${driverId}`).emit('driverLocationUpdate', pos);
          if (rideId) {
            io.to(`ride-${rideId}`).emit('driverLocationUpdate', pos);
          }
          
          // Broadcast to admin observatory for live map
          io.to('admin-observatory').emit('observatory-update', {
            type: 'DRIVER',
            id: driverId,
            lat,
            lng,
            rideId
          });

          // 🛰️ AI OS INTEGRATION: Inform the Sentinel Agent for Safety Monitoring
          MQService.publish('ride.events', 'os.ride.location_updated', {
            rideId,
            driverId,
            lat,
            lng,
            timestamp: new Date()
          });

          // Heartbeat and Location Sync
          const query = require('mongoose').isValidObjectId(driverId) 
              ? { _id: driverId } 
              : { id: Number(driverId) };
              
          UserModel.updateOne(
            query, 
            { 
              updated_at: new Date(),
              location: {
                type: 'Point',
                coordinates: [lng, lat] // GeoJSON requires [longitude, latitude]
              }
            }
          ).catch(err => console.error('Failed to update driver location:', err));

          // Immobility Watchdog (3-minute threshold)
          if (rideId) {
             const prevPos = locationMap.get(driverId);
             if (prevPos && prevPos.lat === lat && prevPos.lng === lng) {
                // Potential immobility
                const startTime = immobilityTimers.get(driverId) || Date.now();
                immobilityTimers.set(driverId, startTime);

                const timeImmobile = (Date.now() - startTime) / (1000 * 60);
                if (timeImmobile >= 3) {
                   // Trigger Emerald Alert (Immobility Alert)
                   io.to(`ride-${rideId}`).emit('emergency-alert', {
                      type: 'IMMOBILITY',
                      message: 'Driver hasn\'t moved for 3 minutes. Please check your safety.',
                      timestamp: new Date()
                   });
                   // Reset timer to avoid spam
                   immobilityTimers.set(driverId, Date.now()); 
                }
             } else {
                // Moving - Clear timer
                immobilityTimers.delete(driverId);
             }
          }
        }
        locationMap.set(socket.id, pos);
      });

      socket.on('updatePassengerLocation', async (pos: any) => {
        const { userId, rideId, lat, lng } = pos;
        if (rideId) {
          // Stream directly to the ride room so the driver sees the passenger moving
          io.to(`ride-${rideId}`).emit('passengerLocationUpdate', pos);
        }

        // Broadcast to admin observatory
        io.to('admin-observatory').emit('observatory-update', {
          type: 'PASSENGER',
          id: userId,
          lat,
          lng,
          rideId
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected: ' + socket.id);
        locationMap.delete(socket.id);
      });
    });
  }
}

export { passport, MongoAppDemo };
export default MongoAppDemo;
