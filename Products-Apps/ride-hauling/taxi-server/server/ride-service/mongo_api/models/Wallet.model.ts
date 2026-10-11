import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  id: string;
  full_name: string;
  status: string;
  email: string;
  amount: number;
  phone_number: string;
  reference: string;
  old_balance: string;
  createdDate: Date;
  userId: string;
  plan_id: string;
  quotation_id: string;
}

const WalletSchema = new Schema<IWallet>(
  {
    id: { type: String, default: '0' },
    full_name: { type: String },
    status: { type: String, enum: ['Successful', 'Failed'], default: 'Successful' },
    email: { type: String },
    amount: { type: Number },
    phone_number: { type: String },
    reference: { type: String },
    old_balance: { type: String },
    createdDate: { type: Date, default: new Date() },
    userId: { type: String },
    plan_id: { type: String, default: 'Not Set' },
    quotation_id: { type: String, default: 'Not Set' },
  },
  {
    collection: 'wallet_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

WalletSchema.set('toJSON', { getters: true, virtuals: true });

WalletSchema.statics = {
  addToWallet(data: any, callback: Function) {
    return this.create(data, callback);
  },
};

export default (mongoose.models.Donor || mongoose.model<IWallet>('Donor', WalletSchema)) as import("mongoose").Model<any>;
