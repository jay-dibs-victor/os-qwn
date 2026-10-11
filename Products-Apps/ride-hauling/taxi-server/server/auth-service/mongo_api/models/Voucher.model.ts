import mongoose, { Schema, Document } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  amount: number;
  isUsed: boolean;
  expiryDate: Date;
  hash: string; // Used for "encrypted" link redemption
  createdAt: Date;
}

const VoucherSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  isUsed: { type: Boolean, default: false },
  expiryDate: { type: Date, required: true },
  hash: { type: String, unique: true },
}, {
  timestamps: true
});

export default (mongoose.models.VoucherModel || mongoose.model<IVoucher>('VoucherModel', VoucherSchema)) as import("mongoose").Model<any>;
