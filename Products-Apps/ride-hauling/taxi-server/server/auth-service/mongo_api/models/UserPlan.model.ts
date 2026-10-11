import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPlan extends Document {
  id: number;
  plan_id: string;
  status: string;
  payment_status: string;
  user_id: string;
  plan_name: string;
  price: string;
  plan_category_name: string;
  duration: string;
  individual_id: number;
  coperate_id: number;
  itineries: any[];
  cars_on_plan: any[];
  username: string;
  email: string;
  phone_number: string;
  has_updated: string;
  createdDateOfQuotation: Date;
  no_hours: string;
  created_at: Date;
  updated_at: Date;
}

const UserPlanSchema = new Schema<IUserPlan>(
  {
    id: { type: Number, default: 0 },
    plan_id: { type: String },
    status: {
      type: String,
      enum: ['Unpaid', 'Paid', 'Failed', 'Ongoing', 'Pending', 'Completed'],
      default: 'Unpaid',
    },
    payment_status: { type: String, default: 'Unpaid' },
    user_id: { type: String },
    plan_name: { type: String },
    price: { type: String, default: 'Awaiting  cost estimate' },
    plan_category_name: { type: String },
    duration: { type: String },
    individual_id: { type: Number },
    coperate_id: { type: Number },
    itineries: { type: Array as any, default: [] },
    cars_on_plan: { type: Array as any },
    username: { type: String },
    email: { type: String },
    phone_number: { type: String },
    has_updated: { type: String, enum: ['Yes', 'No'], default: 'No' },
    createdDateOfQuotation: { type: Date },
    no_hours: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'userplans_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

UserPlanSchema.set('toJSON', { getters: true, virtuals: true });

UserPlanSchema.statics = {
  addPlanToUser(user: any, callback: Function) {
    return this.create(user, callback);
  },
  get(id: any) {
    return this.findOne(id)
      .exec()
      .then((plan: any) => {
        if (plan) return plan;
        return Promise.reject(new Error('No such plan exists!'));
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

export default (mongoose.models.UserPlanModel || mongoose.model<IUserPlan>('UserPlanModel', UserPlanSchema)) as import("mongoose").Model<any>;
