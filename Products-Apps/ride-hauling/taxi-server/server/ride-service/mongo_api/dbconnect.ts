import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import PromiseLib from 'bluebird';

(mongoose as any).Promise = PromiseLib;

console.log('[Ride Service] dbconnect.ts execution started');
console.log('[Ride Service] Process.env.MONGO_URI:', process.env.MONGO_URI);
const url = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_DATABASE_URL || 'mongodb://localhost:27017/taxi_service_final';

console.log('[Ride Service] Final URL for dbconnect:', url);

async function connectWithRetry(maxAttempts = 10, delayMs = 2000) {
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  // Reuse the connection already established by db.ts (DbQuery singleton) to avoid
  // Mongoose 6 error: "Can't call openUri() on an active connection"
  if (mongoose.connection.readyState !== 0) {
    console.log('[Ride Service] dbconnect: Reusing existing Mongoose connection (readyState:', mongoose.connection.readyState, ')');
    return mongoose.connection;
  }

  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      await (mongoose as any).connect(url, {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as any);
      console.log('Successfully connected to MongoDB on attempt', attempt);
      return mongoose.connection;
    } catch (err) {
      console.warn(`MongoDB connection attempt ${attempt} failed:`, err && err.message ? err.message : err);
      if (attempt >= maxAttempts) {
        console.error('Exceeded max MongoDB connection attempts.');
        throw err;
      }
      // wait before retrying
      await new Promise((res) => setTimeout(res, delayMs));
      // increase delay mildly
      delayMs = Math.min(10000, Math.round(delayMs * 1.5));
    }
  }
}

const connect = connectWithRetry();

export default connect;

