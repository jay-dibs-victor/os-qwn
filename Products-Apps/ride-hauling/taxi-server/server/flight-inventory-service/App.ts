import express, { Application } from 'express';
import cors from 'cors';
import logger from 'morgan';
import bodyParser from 'body-parser';
import { connectPostgres, sequelize } from '@shared/postgres_config';
import InventoryRoutes from './api/routes';

class InventoryApp {
  public express: Application;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.initializeDb();
  }

  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(cors());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  private routes(): void {
    const router = express.Router();
    this.express.use('/api/v1/flights', new InventoryRoutes(router).attachRoutes());
    
    this.express.get('/health', (req, res) => {
      res.status(200).json({ status: 'UP', service: 'Flight Inventory Service' });
    });
  }

   private async initializeDb() {
     await connectPostgres();
     // In development, we sync models. In production, use migrations.
     if (process.env.NODE_ENV === 'DEVELOPMENT') {
        try {
          await sequelize.sync();
          console.log('Flight Inventory Database synced.');
        } catch (err) {
          console.warn('Flight Inventory sync warning (non-fatal):', err.message);
        }
     }
   }
}

export default new InventoryApp().express;
