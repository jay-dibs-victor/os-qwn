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
import * as swaggerUi from 'swagger-ui-express';
import { MQService } from '@shared/rabbitmq';
import { CORS_ALLOWED_ORIGINS } from '@shared/constants';
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
import UserModel from './models/User.model';

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
    this.port = process.env.PORT || 12001;

    this.express.use('/api/v1', router);
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
          mongodb: mongoStatus
        }
      });
    });
  }

  initialize() { }

  run(port: number | string = 12001) {
    if (port) {
      this.port = port;
    }

    const httpServer = http.createServer(this.express);

    httpServer.listen(this.port as number, '0.0.0.0', () => {
      console.log(`HTTP Server running on 0.0.0.0:${this.port}`);
      MQService.connect().catch(err => console.error('RabbitMQ initial connection failed:', err));
    });
  }
}

export let ioInstance: any = null;
export const getIO = () => ioInstance;

export { passport, MongoAppDemo };
export default MongoAppDemo;
