import mongoose from 'mongoose';
import Seeder from './seeders';
import DummyData from './dummy_data';
import db from '../models/db';

const MongooseDatabase = db.getInstance() || new (db as any)();

class SeedFactory {
  public seeders: Seeder;
  public dummyData: any;

  constructor() {
    this.seeders = new Seeder();
    this.dummyData = DummyData;
  }

  async runSeeder(exitProcess = true) {
    try {
      console.log('[Migrations] Starting migrations...');
      
      // Wait for database connection to be ready
      if (mongoose.connection.readyState !== 1) {
        console.log('[Migrations] Waiting for database connection...');
        await MongooseDatabase.pool;
        console.log('[Migrations] Database connection established.');
      }
      
      // ── TEAR DOWN: Drop all collections ─────────────────────────────────
      console.log('[Migrations] Dropping all collections...');
      await this.seeders.tearDown();
      console.log('[Migrations] Tear-down completed.');

      // ── ROLES ──────────────────────────────────────────────────────────
      console.log('[Migrations] Seeding roles...');
      for (const role of this.dummyData.previledgesA) {
        await this.seeders.seedRole(role);
      }

      // ── THIRD-PARTY SETTINGS ───────────────────────────────────────────
      console.log('[Migrations] Seeding third-party settings...');
      await this.seeders.seed3rdPartySettings(
        this.dummyData.paystackSettings[0] || {},
        this.dummyData.googleSettings[0] || {},
        this.dummyData.facebookSettings[0] || {},
        this.dummyData.instagramSettings[0] || {},
        this.dummyData.sendgridSettings[0] || {},
        this.dummyData.awsSettings[0] || {},
      );

      // ── USERS ──────────────────────────────────────────────────────────
      console.log('[Migrations] Seeding users...');
      for (const user of this.dummyData.users) {
        await this.seeders.seedUsers(user);
      }

      // ── DRIVER USERS (in UserModel for SSO + dispatch queries) ─────────
      console.log('[Migrations] Seeding driver user accounts...');
      for (const driverUser of this.dummyData.driver_users) {
        await this.seeders.seedUsers(driverUser);
      }

      // ── DRIVER RECORDS ─────────────────────────────────────────────────
      console.log('[Migrations] Seeding driver records...');
      for (const driver of this.dummyData.drivers) {
        await this.seeders.seedDrivers(driver);
      }

      // ── PLANS ──────────────────────────────────────────────────────────
      console.log('[Migrations] Seeding plans...');
      for (const p of this.dummyData.plan) {
        await this.seeders.seedPlanCategory(p);
      }
      for (const ip of this.dummyData.individualPlan) {
        await this.seeders.seedIndividualPlans(ip);
      }
      for (const cp of this.dummyData.coperatePlan) {
        await this.seeders.seedCoperatePlans(cp);
      }

      // ── CARS ───────────────────────────────────────────────────────────
      console.log('[Migrations] Seeding cars...');
      for (const car of this.dummyData.cars) {
        await this.seeders.seedCars(car);
      }

      // ── RIDE TYPES ─────────────────────────────────────────────────────
      if (this.dummyData.rideTypes) {
        console.log('[Migrations] Seeding ride types...');
        for (const rt of this.dummyData.rideTypes) {
          await this.seeders.seedRideTypes(rt);
        }
      }

      // ── RIDES (optional) ───────────────────────────────────────────────
      if (this.dummyData.rides) {
        console.log('[Migrations] Seeding rides...');
        for (const ride of this.dummyData.rides) {
          await this.seeders.seedRide(ride);
        }
      }

      // ── FAQs (optional) ────────────────────────────────────────────────
      if (this.dummyData.faqs) {
        console.log('[Migrations] Seeding FAQs...');
        for (const faq of this.dummyData.faqs) {
          await this.seeders.seedFaqs(faq);
        }
      }

      // ── VOUCHERS ───────────────────────────────────────────────────────
      await this.seeders.seedVouchers();

      console.log('[Migrations] ✅ Migrations completed successfully!');
    } catch (error) {
      console.error('[Migrations] ❌ Migration failed:', error);
    } finally {
      if (exitProcess) {
        // When called as a standalone script, close connection and exit
        setTimeout(() => {
          mongoose.connection.close();
          process.exit(0);
        }, 1000);
      }
      // When exitProcess=false (server startup), simply return — don't kill the server
    }
  }
}

// Support direct script execution: `ts-node migrations.ts`
if (require.main === module) {
  const Migrate = new SeedFactory();
  Migrate.runSeeder(true);
}

export default SeedFactory;
