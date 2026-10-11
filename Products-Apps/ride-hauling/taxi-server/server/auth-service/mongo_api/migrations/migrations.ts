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

  async runSeeder() {
    try {
      console.log('Starting migrations...');
      
      // Clear existing data
      await this.seeders.tearDown();
      console.log('Tear-down completed.');

      // Roles
      console.log('Seeding roles...');
      for (const role of this.dummyData.previledgesA) {
        await this.seeders.seedRole(role);
      }

      // Settings
      console.log('Seeding settings...');
      await this.seeders.seed3rdPartySettings(
        this.dummyData.paystackSettings[0] || {},
        this.dummyData.googleSettings[0] || {},
        this.dummyData.facebookSettings[0] || {},
        this.dummyData.instagramSettings[0] || {},
        this.dummyData.sendgridSettings[0] || {},
        this.dummyData.awsSettings[0] || {},
      );

      // Users
      console.log('Seeding users...');
      for (const user of this.dummyData.users) {
        await this.seeders.seedUsers(user);
      }

      // Driver accounts in UserModel (needed for SSO auth + 5km radius query)
      console.log('Seeding driver users into UserModel...');
      for (const driverUser of this.dummyData.driver_users) {
        await this.seeders.seedUsers(driverUser);
      }

      // Drivers (DriversModel — for driver records/dispatch)
      console.log('Seeding driver records...');
      for (const driver of this.dummyData.drivers) {
        await this.seeders.seedDrivers(driver);
      }

      // Plans
      console.log('Seeding plans...');
      for (const p of this.dummyData.plan) {
        await this.seeders.seedPlanCategory(p);
      }
      for (const ip of this.dummyData.individualPlan) {
        await this.seeders.seedIndividualPlans(ip);
      }
      for (const cp of this.dummyData.coperatePlan) {
        await this.seeders.seedCoperatePlans(cp);
      }

      // Cars
      console.log('Seeding cars...');
      for (const car of this.dummyData.cars) {
        await this.seeders.seedCars(car);
      }

      // Rides (optional, based on dummy data)
      if (this.dummyData.rides) {
        console.log('Seeding rides...');
        for (const ride of this.dummyData.rides) {
          await this.seeders.seedRide(ride);
        }
      }

      // FAQ
      if (this.dummyData.faqs) {
        console.log('Seeding FAQs...');
        for (const faq of this.dummyData.faqs) {
          await this.seeders.seedFaqs(faq);
        }
      }

      console.log('Migrations completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setTimeout(() => {
        mongoose.connection.close();
        process.exit(0);
      }, 1000);
    }
  }
}

const Migrate = new SeedFactory();
Migrate.runSeeder();

export default SeedFactory;
