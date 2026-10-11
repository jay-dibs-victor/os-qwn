import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import shipmentRoutes from './routes/shipment.routes';
import { MQService } from '@shared/rabbitmq';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 12006;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taxi_service';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/shipping', shipmentRoutes);

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log(`[Shipping Service] Connected to MongoDB at ${MONGO_URI}`))
  .catch((err: any) => console.error('[Shipping Service] MongoDB Connection Error:', err));

// RabbitMQ Connection
MQService.connect()
  .then(() => console.log('[Shipping Service] Connected to RabbitMQ'))
  .catch((err: any) => console.error('[Shipping Service] RabbitMQ Connection Error:', err));

app.listen(PORT, () => {
  console.log(`[Shipping Service] Running on port ${PORT}`);
});
