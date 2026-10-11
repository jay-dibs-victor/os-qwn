import mongoose from 'mongoose';
import PromiseLib from 'bluebird';
import util from 'util';
import debugLib from 'debug';
// @ts-ignore
import config from '../config/mongo_config';

const debug = debugLib('ireport:server');

// make bluebird default Promise
(mongoose as any).Promise = PromiseLib;

let instance: DbQuery | null = null;

class DbQuery {
  public dbLink: string | undefined;
  public pool: Promise<typeof mongoose>;

  constructor() {
    this.dbLink = this.connect();
    
    // Fallback if dbLink is undefined but usually it should be set or use default
    console.log('[Ride Service] DbQuery Singleton connect() called');
    const connectionString = this.dbLink || process.env.DATABASE_URL || 'mongodb://localhost:27017/taxi_service';
    console.log('[Ride Service] Mongoose connecting to:', connectionString);

    if (mongoose.connection.readyState !== 0) {
      console.log('[Ride Service] DbQuery: Reusing existing Mongoose connection (readyState:', mongoose.connection.readyState, ')');
      this.pool = Promise.resolve(mongoose);
    } else {
      this.pool = mongoose.connect(connectionString, {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as any) as any;
    }

    // print mongoose logs in dev env
    if (config && config.debugger) {
      mongoose.set('debug', (collectionName: string, method: string, query: any, doc: any) => {
        debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
      });
    }
  }

  public getEstablishedConnection() {
    return mongoose.connection;
  }

  public connect(): string {
    const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'development';
    let link: string;

    // Default to local connection if env vars are missing
    const defaultUri = 'mongodb://localhost:27017/taxi_service';

    // MONGO_URI is the name used in docker-compose; also support legacy names
    console.log('[Ride Service] DBConnect Booting...');
    console.log('[Ride Service] Environment Check:');
    console.log('  MONGO_URI:', process.env.MONGO_URI);
    console.log('  MONGODB_URI:', process.env.MONGODB_URI);
    console.log('  MONGO_URL:', process.env.MONGO_URL);
    console.log('  MONGO_DATABASE_URL:', process.env.MONGO_DATABASE_URL);
    console.log('  DATABASE_URL:', process.env.DATABASE_URL);
    
    // Hard fallback to local development if everything else fails
    const localFallback = 'mongodb://localhost:27017/taxi_service';
    const dockerFallback = 'mongodb://mongodb:27017/taxi_service';
    
    // Check if we are likely in a docker container (simple check)
    const isDocker = process.env.KUBERNETES_SERVICE_HOST || process.env.DOCKER_CONTAINER || process.env.IS_DOCKER === 'true';
    const fallback = isDocker ? dockerFallback : localFallback;

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_DATABASE_URL || process.env.DATABASE_URL || fallback;
    
    console.log('[Ride Service] Selected URI:', mongoUri);

    // Suppress Mongoose 7 deprecation warning
    mongoose.set('strictQuery', false);

    if (NODE_ENV === 'development') {
      link = mongoUri;
    } else if (NODE_ENV === 'test') {
      link = process.env.DATABASE_TEST_URL || mongoUri;
    } else {
      link = mongoUri;
    }

    return link;
  }

  public static getInstance(): DbQuery {
    if (!instance) {
      instance = new DbQuery();
    }
    return instance;
  }
}

export default DbQuery;
