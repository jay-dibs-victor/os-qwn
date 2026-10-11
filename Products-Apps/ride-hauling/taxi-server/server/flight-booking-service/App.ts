import express, { Application } from 'express';
import cors from 'cors';
import logger from 'morgan';
import bodyParser from 'body-parser';
import { connectPostgres, sequelize } from '@shared/postgres_config';
import BookingRoutes from './api/routes';
import { MQService } from '@shared/rabbitmq';
import { LotteryCron } from './services/LotteryCron';


class BookingApp {
  public express: Application;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.initializeDb();
    this.connectRabbitMQ();
    LotteryCron.init();
  }

  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(cors());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  private routes(): void {
    const router = express.Router();
    this.express.use('/api/v1/bookings/flights', new BookingRoutes(router).attachRoutes());
    
    this.express.get('/health', (req, res) => {
      res.status(200).json({ status: 'UP', service: 'Flight Booking Service' });
    });
  }

   private async initializeDb() {
     await connectPostgres();
     if (process.env.NODE_ENV === 'DEVELOPMENT') {
        try {
          await sequelize.sync();
          console.log('Flight Booking Database synced.');
        } catch (err) {
          console.warn('Flight Booking sync warning (non-fatal):', err.message);
        }
     }
   }

  private async connectRabbitMQ() {
    try {
      await MQService.connect();
      console.log('Booking Service connected to RabbitMQ');
    } catch (err) {
      console.error('Booking Service failed to connect to RabbitMQ:', err);
    }
  }
}

export default new BookingApp().express;
