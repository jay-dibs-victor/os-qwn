import dotenv from 'dotenv';

dotenv.config();

interface ConfigEnv {
  appMode: string;
  user?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: string | number;
  database_type: string;
  max: number;
  idleTimeoutInMillisec: number;
  connectionTimeoutInMillisec: number;
}

const config: Record<string, ConfigEnv> = {
  demo: {
    appMode: 'dummy_api',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database_type: 'dummy_array',
    max: 20,
    idleTimeoutInMillisec: 30000,
    connectionTimeoutInMillisec: 2000,
  },

  development: {
    appMode: 'development',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database_type: 'postgres',
    max: 20,
    idleTimeoutInMillisec: 30000,
    connectionTimeoutInMillisec: 2000,
  },
  test: {
    appMode: 'test',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE_TEST_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database_type: 'dummy_array',
    max: 20,
    idleTimeoutInMillisec: 30000,
    connectionTimeoutInMillisec: 2000,
  },
  production: {
    appMode: 'deploy',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database_type: 'dummy_array',
    max: 20,
    idleTimeoutInMillisec: 30000,
    connectionTimeoutInMillisec: 2000,
  },
};

export default config;
