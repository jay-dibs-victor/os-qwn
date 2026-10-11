import mongoose, { Document, Schema } from 'mongoose';

export interface IQuotation extends Document {
  id: string;
  full_name: string;
  status: string;
  plan_id: string;
  quotation_id: string;
  email: string;
  amount: number;
  reference: string;
  createdDate: Date;
  phone_number: string;
  userId: string;
}

const QuotationsSchema = new Schema<IQuotation>(
  {
    id: { type: String, default: '0' },
    full_name: { type: String },
    status: {
      type: String,
      enum: ['Successful', 'Failed', 'Unpaid', 'Paid'],
      default: 'Successful',
    },
    plan_id: { type: String, default: 'No plan assigned yet' },
    quotation_id: { type: String, default: 'No quotation assigned yet' },
    email: { type: String },
    amount: { type: Number },
    reference: { type: String },
    createdDate: { type: Date, default: new Date() },
    phone_number: { type: String },
    userId: { type: String },
  },
  {
    collection: 'abiquotes_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

QuotationsSchema.set('toJSON', { getters: true, virtuals: true });

QuotationsSchema.statics = {
  addToWallet(data: any, callback: Function) {
    return this.create(data, callback);
  },
};

export default (mongoose.models.QuotationsModel || mongoose.model<IQuotation>('QuotationsModel', QuotationsSchema)) as import("mongoose").Model<any>;
