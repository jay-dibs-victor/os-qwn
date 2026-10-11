import mongoose, { Document, Schema } from 'mongoose';

export interface IQuote extends Document {
  id: string;
  full_name: string;
  status: string;
  plan_id: string;
  quotation_id: string;
  email: string;
  amount: number;
  has_updated: string;
  reference: string;
  createdDateOfQuotation: Date;
  createdDate: Date;
  userId: string;
}

const QuoteSchema = new Schema<IQuote>(
  {
    id: { type: String, default: '0' },
    full_name: { type: String },
    status: {
      type: String,
      enum: ['Successful', 'Failed', 'Unpaid', 'Paid'],
      default: 'Unpaid',
    },
    plan_id: { type: String, default: 'No plan assigned yet' },
    quotation_id: { type: String, default: 'No quotation assigned yet' },
    email: { type: String },
    amount: { type: Number },
    has_updated: { type: String, default: 'No' },
    reference: { type: String },
    createdDateOfQuotation: { type: Date },
    createdDate: { type: Date, default: new Date() },
    userId: { type: String },
  },
  {
    collection: 'pay_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

QuoteSchema.set('toJSON', { getters: true, virtuals: true });
QuoteSchema.statics = {
  addToWallet(data: any, callback: Function) {
    return this.create(data, callback);
  },
};

export default (mongoose.models.QuoteModel || mongoose.model<IQuote>('QuoteModel', QuoteSchema)) as import("mongoose").Model<any>;
