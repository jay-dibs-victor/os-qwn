import mongoose, { Document, Schema } from 'mongoose';

export interface IItinerary extends Document {
  id: number;
  plan_id: string;
  plan_category: string;
  status: string;
  certificate_id: string;
  certificate_date: Date;
  user_id: string;
  assigned_driver_id: string;
  assigned_driver_name: string;
  assigned_driver_email: string;
  assigned_driver_phone: string;
  user_plan_id: string;
  start_location: string;
  destination: string;
  start_time: Date;
  pickup_time: string;
  end_time: string;
  drive_option: string;
  travel_option: string;
  no_hours: string;
  drivingschool: string;
  username: string;
  email: string;
  phone_number: string;
  has_received_quote: string;
  has_received_payments: string;
  _user?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const ItinerarySchema = new Schema<IItinerary>(
  {
    id: { type: Number, default: 0 },
    plan_id: { type: String },
    plan_category: { type: String },
    status: { type: String, default: 'Pending' },
    certificate_id: { type: String, default: 'No date' },
    certificate_date: { type: Date },
    user_id: { type: String },
    assigned_driver_id: { type: String },
    assigned_driver_name: { type: String },
    assigned_driver_email: { type: String },
    assigned_driver_phone: { type: String },
    user_plan_id: { type: String },
    start_location: { type: String },
    destination: { type: String },
    start_time: { type: Date },
    pickup_time: { type: String },
    end_time: { type: String },
    drive_option: { type: String, default: 'Driver Required' },
    travel_option: { type: String, default: 'intracity' },
    no_hours: { type: String },
    drivingschool: { type: String },
    _user: { type: Schema.Types.ObjectId, ref: 'UserModel' },
    username: { type: String },
    email: { type: String },
    phone_number: { type: String },
    has_received_quote: { type: String, default: 'No' },
    has_received_payments: { type: String, default: 'No' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'useritinerary_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

ItinerarySchema.set('toJSON', { getters: true, virtuals: true });

ItinerarySchema.statics = {
  addItinerary(user: any, callback: Function) {
    return this.create(user, callback);
  },
  get(id: any) {
    return this.findOne(id)
      .exec()
      .then((plan: any) => {
        if (plan) return plan;
        return Promise.reject(new Error('No such itinerary exists!'));
      });
  },
  listPlan({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ created_at: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
};

export default (mongoose.models.ItineraryModel || mongoose.model<IItinerary>('ItineraryModel', ItinerarySchema)) as import("mongoose").Model<any>;
