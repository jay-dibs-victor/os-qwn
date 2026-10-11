import mongoose, { Document, Schema } from 'mongoose';

export interface ICoperatePlan extends Document {
  id: number;
  plan_name: string;
  car_max: string;
  status: string;
  plan_categories: string;
  description: string;
  price: string;
}

const CoperatePlanSchema = new Schema<ICoperatePlan>(
  {
    id: { type: Number, default: 0 },
    plan_name: { type: String, default: 'Coperate' },
    car_max: { type: String, default: 'unlimited' },
    status: {
      type: String,
      enum: ['Active', 'Dormant', 'Disabled', 'Suspended'],
      default: 'Active',
    },
    plan_categories: { type: String, default: 'Corporate Lite' },
    description: { type: String, required: true },
    price: { type: String, required: true },
  },
  {
    collection: 'coperateplan_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

CoperatePlanSchema.set('toJSON', { getters: true, virtuals: true });
CoperatePlanSchema.statics = {
  addCoperatePlan(user: any, callback: Function) {
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
    return this.find().sort({ created_at: -1 }).skip(+skip).limit(+limit).exec();
  },
};

export default (mongoose.models.CoperatePlanModel || mongoose.model<ICoperatePlan>('CoperatePlanModel', CoperatePlanSchema)) as import("mongoose").Model<any>;
