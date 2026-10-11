import mongoose, { Document, Schema } from 'mongoose';

export interface IIndividualPlan extends Document {
  id: number;
  car_max: number;
  status: string;
  plan_name: string;
  plan_categories: string;
  description: string;
  price: string;
  created_at: Date;
  updated_at: Date;
}

const IndividualPlanSchema = new Schema<IIndividualPlan>(
  {
    id: { type: Number, default: 0 },
    car_max: { type: Number, default: 3 },
    status: {
      type: String,
      enum: ['Active', 'Dormant', 'Disabled', 'Suspended'],
      default: 'Active',
    },
    plan_name: { type: String, default: 'Individual' },
    plan_categories: { type: String, default: 'Saver' },
    description: { type: String, required: true },
    price: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'individualplan_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

IndividualPlanSchema.set('toJSON', { getters: true, virtuals: true });
IndividualPlanSchema.statics = {
  addIndividualPlan(user: any, callback: Function) {
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

export default (mongoose.models.IndividualPlanModel || mongoose.model<IIndividualPlan>('IndividualPlanModel', IndividualPlanSchema)) as import("mongoose").Model<any>;
