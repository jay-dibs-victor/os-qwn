import mongoose from 'mongoose';
import UserModel from '../models/User.model';
import PartnerModel from '../models/Partners.model';
import DriversModel from '../models/Driver.model';
import SOSModel from '../models/SOS.model';
import FeedbackModel from '../models/Feedback.model';
import CarModel from '../models/Cars.model';
import PlanModel from '../models/Plan.model';
import IndividualPlanModel from '../models/IndividualPlan.model';
import CoperatePlanModel from '../models/CoperatePlan.model';
import UsersPlanModel from '../models/UserPlan.model';
import ItineraryModel from '../models/Itinerary.model';
import FAQModel from '../models/FAQ.model';
import NotificationModel from '../models/Notification.model';
import MechModel from '../models/Repairs.model';
import PayStackSettingsModel from '../models/PaystackSettings.model';
import FacebookSettingsModel from '../models/FacebookSettings.model';
import GoogleSettingsModel from '../models/GmailSettings.model';
import InstagramSettingsModel from '../models/InstagramSettings.model';
import AWSSettingsModel from '../models/AWS3BucketSettings.model';
import SendgridSettingsModel from '../models/SendgridEmailSettings.model';
import WalletModel from '../models/Wallet.model';
import PaymentsModel from '../models/Payments.model';
import QuotationsModel from '../models/Quotation.model';
import QuoteModel from '../models/Quote.model';
import EarningsModel from '../models/EarningsModel';
import InspectionModel from '../models/Inspection.model';
import DriveTestModel from '../models/DriveTest.model';
import RolesAndPreviledgesModel from '../models/RolesAndPreviledges.model';
import RideModel from '../models/Ride.model';
import VoucherModel from '../models/Voucher.model';

class Seeders {
  async tearDown() {
    console.log('Cleaning up database...');
    const models = [
      UserModel, PartnerModel, DriversModel, SOSModel, FeedbackModel,
      CarModel, PlanModel, IndividualPlanModel, CoperatePlanModel,
      UsersPlanModel, ItineraryModel, FAQModel, NotificationModel,
      MechModel, PayStackSettingsModel, FacebookSettingsModel,
      GoogleSettingsModel, InstagramSettingsModel, AWSSettingsModel,
      SendgridSettingsModel, WalletModel, PaymentsModel, QuotationsModel,
      QuoteModel, EarningsModel, InspectionModel, DriveTestModel,
      RolesAndPreviledgesModel, RideModel
    ];

    for (const model of models) {
      try {
        await (model as any).deleteMany({});
        // console.log(`Deleted all records for ${model.modelName}`);
      } catch (e) {
        console.error(`Error deleting ${model.modelName}:`, e);
      }
    }
  }

  async seedRole(role: any) {
    return (RolesAndPreviledgesModel as any).create(role);
  }

  async seed3rdPartySettings(paystack: any, google: any, facebook: any, instagram: any, sendgrid: any, aws: any) {
    await (PayStackSettingsModel as any).create(paystack);
    await (FacebookSettingsModel as any).create(facebook);
    await (GoogleSettingsModel as any).create(google);
    await (InstagramSettingsModel as any).create(instagram);
    await (AWSSettingsModel as any).create(aws);
    await (SendgridSettingsModel as any).create(sendgrid);
  }

  async seedUsers(dataUsers: any) {
    return (UserModel as any).create(dataUsers);
  }

  async seedDrivers(dataUsers: any) {
    return (DriversModel as any).create(dataUsers);
  }

  async seedPartners(dataUsers: any) {
    return (PartnerModel as any).create(dataUsers);
  }

  async seedCars(cars: any) {
    return (CarModel as any).create(cars);
  }

  async seedPlanCategory(Plan: any) {
    return (PlanModel as any).create(Plan);
  }

  async seedIndividualPlans(indivPlan: any) {
    return (IndividualPlanModel as any).create(indivPlan);
  }

  async seedCoperatePlans(copPlan: any) {
    return (CoperatePlanModel as any).create(copPlan);
  }

  async seedUsersPlan(copPlan: any) {
    return (UsersPlanModel as any).create(copPlan);
  }

  async seedItinerary(itinerary: any) {
    return (ItineraryModel as any).create(itinerary);
  }

  async seedFaqs(dataFaqs: any) {
    return (FAQModel as any).create(dataFaqs);
  }

  async seedNotification(data: any) {
    return (NotificationModel as any).create(data);
  }

  async seedMechanicRequest(data: any) {
    return (MechModel as any).create(data);
  }

  async seedWalletHistory(data: any) {
    return (WalletModel as any).create(data);
  }

  async seedRide(data: any) {
    return (RideModel as any).create(data);
  }

  async seedFeedbackByUser(dataFeedback: any, username: string) {
    const user = await (UserModel as any).findOne({ username });
    if (user) {
      const feedback = new FeedbackModel({ ...dataFeedback, _user: user._id });
      return feedback.save();
    }
  }

  async seedSOSRequestByUser(dataSOS: any, username: string) {
    const user = await (UserModel as any).findOne({ username });
    if (user) {
      const sos = new SOSModel({ ...dataSOS, _user: user._id });
      return sos.save();
    }
  }

  async seedVouchers() {
    console.log('Seeding vouchers...');
    const vouchers = [
      { code: 'GOOM2026', amount: 5000, type: 'flat', description: 'Welcome 2026 Discount', expiryDate: new Date('2026-12-31') },
      { code: 'PREMIUM50', amount: 0.5, type: 'percentage', description: '50% Off Premium Rides', expiryDate: new Date('2026-06-30') },
      { code: 'WALLETTOP', amount: 1000, type: 'flat', description: 'Wallet Bonus', expiryDate: new Date('2026-12-31') },
    ];
    for (const v of vouchers) {
      await (VoucherModel as any).updateOne({ code: v.code }, { $set: v }, { upsert: true });
    }
  }

  async seedBulkUserActivity() {
    console.log('Generating bulk activity for all users...');
    const users = await (UserModel as any).find({});

    for (const user of users) {
      const userId = user._id;

      // 1. Seed Wallet Transactions (3-5 per user)
      const walletCount = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < walletCount; i++) {
        await (WalletModel as any).create({
          userId: userId,
          amount: Math.floor(Math.random() * 5000) + 1000,
          type: i % 2 === 0 ? 'credit' : 'debit',
          status: 'success',
          reference: `REF-${Math.random().toString(36).substring(7).toUpperCase()}`,
          description: i % 2 === 0 ? 'Top up' : 'Ride Payment',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
        });
      }

      // 2. Seed Payments & Invoices (2-3 per user)
      const paymentCount = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < paymentCount; i++) {
        const amount = Math.floor(Math.random() * 3000) + 500;
        await (PaymentsModel as any).create({
          userId: userId,
          amount,
          gateway: ['stripe', 'paystack', 'paypal', 'flutterwave'][Math.floor(Math.random() * 4)],
          status: 'success',
          reference: `TRX-${Math.random().toString(36).substring(7).toUpperCase()}`,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 15 * 24 * 60 * 60 * 1000))
        });

        await (QuotationsModel as any).create({
          userId: userId,
          total_fare: amount,
          status: 'paid',
          reference: `INV-${Math.random().toString(36).substring(7).toUpperCase()}`,
        });
      }

      // 3. Seed SOS Logs (1-2 per user)
      const sosCount = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < sosCount; i++) {
        await (SOSModel as any).create({
          _user: userId,
          location: { type: 'Point', coordinates: [3.3792, 6.5244] },
          status: 'resolved',
          reason: 'Emergency Alert Test',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000))
        });
      }

      // 4. Seed Support Tickets (FeedbackModel) (2-3 per user)
      const ticketCount = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < ticketCount; i++) {
        await (FeedbackModel as any).create({
          _user: userId,
          category: ['General', 'Payment', 'Driver', 'App Bug'][Math.floor(Math.random() * 4)],
          subject: 'Support Request',
          response: 'Testing support flow',
          status: 'closed',
          username: user.username,
          phoneNumber: user.phone_number,
          email: user.email,
        });
      }

      // 5. Seed Plan History (1-2 per user)
      await (UsersPlanModel as any).create({
        user_id: user.username, // Some models use username as link
        plan_name: ['Economy Monthly', 'Business Weekly', 'Premium Daily'][Math.floor(Math.random() * 3)],
        price: 25000,
        status: 'active'
      });

      // 6. Seed Mech Requests (Only for Drivers/Dispatchers)
      if (user.roles === 'Individual Driver' || user.roles === 'Dispatch Rider') {
        const mechCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < mechCount; i++) {
          await (MechModel as any).create({
            _user: userId,
            requestType: ['Oil Change', 'Tire Replacement', 'Brake Check'][Math.floor(Math.random() * 3)],
            status: 'completed',
            description: 'Regular maintenance request',
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
          });
        }
      }
    }
  }
}

export default Seeders;
