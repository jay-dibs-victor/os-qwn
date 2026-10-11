import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const env = process.env.NODE_ENV;
export const port = process.env.PORT;
export const jwtSecret = process.env.JWT_SECRET;
export const jwtExpirationInterval = process.env.JWT_EXPIRATION_MINUTES;
export const masterAccount = process.env.MASTER_ACCOUNT_NUMBER;
export const masterAccountPassword = process.env.MASTER_ACCOUNT_PASSWORD;
export const mongo = {
  uri: process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TESTS : process.env.MONGO_URI,
};
export const logs = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

const vars = {
  env,
  port,
  jwtSecret,
  jwtExpirationInterval,
  masterAccount,
  masterAccountPassword,
  mongo,
  logs,
};

export default vars;
