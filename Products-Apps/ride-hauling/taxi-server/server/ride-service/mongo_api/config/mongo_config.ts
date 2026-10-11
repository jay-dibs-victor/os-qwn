import dotenv from 'dotenv';

dotenv.config();

const config: any = {
  debugger: true,
  apiKey: 'YOUR OWN Google API key FOR MAP',

  facebook: {
    clientID: process.env.FACEBOOK_APP_ID || 'dummy',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'dummy',
    callbackURL: process.env.FACEBOOK_CALLBACK || 'dummy',
  },
  twitter: {
    consumerKey: 'get_your_own',
    consumerSecret: 'get_your_own',
    callbackURL: process.env.TWITTER_CALLBACK || 'http://localhost:12000/api/v1/auth/twitter/callback',
  },

  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy',
    clientSecret: process.env.GOOGLLE_SECRETE_ID || 'dummy',
    callbackURL: process.env.GOOGLE_CALL_BACK || 'dummy',
  },
  instagram: {
    clientID: 'get_your_own',
    clientSecret: 'get_your_own',
    callbackURL: process.env.INSTAGRAM_CALLBACK || 'http://localhost:12000/api/v1/auth/instagram/callback',
  },

  imagesPath: '/UI/images/',
  adminEmail: 'juwavictor@gmail.com',
  mail: {
    service: 'Gmail',
    auth: {
      user: 'juwavictor@gmail.com',
      pass: 'changeThis',
    },
  },
  demo: {
    appMode: 'dummy_api',
    user: process.env.MONGO_DB_USER,
    password: process.env.MONGO_DB_PASSWORD,
    database: process.env.MONGO_DATABASE_URL,
    host: process.env.MONGO_DB_HOST,
    port: process.env.MONGO_DB_PORT,
    database_type: 'mongodb',
    max: 20,
    idleTimeoutInMillisec: 30000,
    connectionTimeoutInMillisec: 2000,
  },
  development: {
    appMode: 'development',
    user: process.env.MONGO_DB_USER,
    password: process.env.MONGO_DB_PASSWORD,
    database: process.env.MONGO_DATABASE_URL,
    host: process.env.MONGO_DB_HOST,
    port: process.env.MONGO_DB_PORT,
    database_type: 'mongodb',
    max: 20,
    idleTimeoutInMillisec: 30000,
    connectionTimeoutInMillisec: 2000,
  },
  test: {
    appMode: 'test',
    user: process.env.MONGO_DB_USER,
    password: process.env.MONGO_DB_PASSWORD,
    database: process.env.MONGO_DATABASE_URL,
    host: process.env.MONGO_DB_HOST,
    port: process.env.MONGO_DB_PORT,
    database_type: 'mongodb',
    max: 20,
    idleTimeoutInMillisec: 30000,
    connectionTimeoutInMillisec: 2000,
  },
  production: {
    appMode: 'deploy',
    user: process.env.MONGO_DB_USER,
    password: process.env.MONGO_DB_PASSWORD,
    database: process.env.MONGO_DATABASE_URL,
    host: process.env.MONGO_DB_HOST,
    port: process.env.MONGO_DB_PORT,
    database_type: 'mongodb',

    max: 20,
    idleTimeoutInMillisec: 30000,
    connectionTimeoutInMillisec: 2000,
  },
};

export default config;
