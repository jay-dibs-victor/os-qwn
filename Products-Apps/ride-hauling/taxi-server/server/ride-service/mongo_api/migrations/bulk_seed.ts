import mongoose from 'mongoose';
import Seeder from './seeders';
import db from '../models/db';

const MongooseDatabase = db.getInstance() || new (db as any)();

async function runBulkSeed() {
  try {
    console.log('Starting Bulk User Activity Seeding...');
    const seeder = new Seeder();
    
    // We do NOT call tearDown() here because we want to seed existing users
    
    await seeder.seedVouchers();
    console.log('Vouchers seeded.');
    
    await seeder.seedBulkUserActivity();
    console.log('Bulk user activity seeded successfully!');
    
  } catch (error) {
    console.error('Bulk seeding failed:', error);
  } finally {
    setTimeout(() => {
      mongoose.connection.close();
      process.exit(0);
    }, 1000);
  }
}

runBulkSeed();
