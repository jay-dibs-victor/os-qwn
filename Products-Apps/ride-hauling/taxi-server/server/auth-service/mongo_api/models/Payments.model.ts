import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  id: string;
  full_name: string;
  status: string;
  plan_id: string;
  quotation_id: string;
  email: string;
  amount: number;
  reference: string;
  phone_number: string;
  createdDate: Date;
  userId: string;
}

const PaymentsSchema = new Schema<IPayment>(
  {
    id: { type: String, default: '0' },
    full_name: { type: String },
    status: { type: String, enum: ['Successful', 'Failed', 'Unpaid'], default: 'Successful' },
    plan_id: { type: String, default: 'No plan assigned yet' },
    quotation_id: { type: String, default: 'No quotation assigned yet' },
    email: { type: String },
    amount: { type: Number },
    reference: { type: String },
    phone_number: { type: String },
    createdDate: { type: Date, default: new Date() },
    userId: { type: String },
  },
  { collection: 'pay_collections' },
);

PaymentsSchema.set('toJSON', { getters: true, virtuals: true });

PaymentsSchema.statics = {
  addToWallet(data: any, callback: Function) {
    return this.create(data, callback);
  },
};

export default (mongoose.models.PaymentModel || mongoose.model<IPayment>('PaymentModel', PaymentsSchema)) as import("mongoose").Model<any>;
