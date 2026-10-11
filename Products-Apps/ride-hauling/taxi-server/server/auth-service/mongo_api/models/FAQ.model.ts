import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFAQ extends Document {
  id: number;
  question: string;
  answer: string;
  status: 'Active' | 'Disabled';
  created_at: Date;
  updated_at: Date;
}

interface IFAQModel extends Model<IFAQ> {
  addFaq(faq: any, callback: any): Promise<IFAQ>;
  get(id: any): Promise<IFAQ>;
  listPlan(params?: { skip?: number; limit?: number }): Promise<IFAQ[]>;
}

const FAQSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      default: 0,
    },
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Disabled'],
      default: 'Active',
    },
  },
  {
    collection: 'faq_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

FAQSchema.set('toJSON', { getters: true, virtuals: true });

FAQSchema.statics = {
  addFaq(faq: any, callback: any) {
    return this.create(faq, callback);
  },

  get(id: any) {
    return this.findOne(id)
      .exec()
      .then((plan: any) => {
        if (plan) {
          return plan;
        }
        const err = new Error('No such itinerary exists!');
        return Promise.reject(err);
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

export default (mongoose.models.FAQModel || mongoose.model<IFAQ, IFAQModel>('FAQModel', FAQSchema)) as import("mongoose").Model<any>;
