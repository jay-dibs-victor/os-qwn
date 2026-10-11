import { Sequelize } from 'sequelize';

const DB_URL = process.env.DB_URL || 'postgres://admin:admin@localhost:5432/flight_service';

export const sequelize = new Sequelize(DB_URL, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the PostgreSQL database:', error);
  }
};
