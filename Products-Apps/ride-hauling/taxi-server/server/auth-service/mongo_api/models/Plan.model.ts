import mongoose, { Document, Schema } from 'mongoose';

export interface IPlan extends Document {
  id: number;
  category: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    id: { type: Number, default: 0 },
    category: { type: String },
    description: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'plan_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

PlanSchema.set('toJSON', { getters: true, virtuals: true });

PlanSchema.statics = {
  addPlanCategory(user: any, callback: Function) {
    return this.create(user, callback);
  },
  get(id: any) {
    return this.findOne(id)
      .exec()
      .then((user: any) => {
        if (user) return user;
        return Promise.reject(new Error('No such plan category exists!'));
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

export default (mongoose.models.PlanModel || mongoose.model<IPlan>('PlanModel', PlanSchema)) as import("mongoose").Model<any>;
