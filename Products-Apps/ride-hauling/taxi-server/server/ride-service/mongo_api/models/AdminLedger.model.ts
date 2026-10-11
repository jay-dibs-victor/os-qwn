import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminLedger extends Document {
  ride_id: string;
  driver_id: string;
  passenger_id: string;
  fare: number;
  commission_rate: number;
  commission_amount: number;
  driver_credit: number;
  payment_method: string;
  currency: string;
  currency_symbol: string;
  status: 'PENDING' | 'SETTLED';
  created_at: Date;
}

const AdminLedgerSchema = new Schema<IAdminLedger>(
  {
    ride_id: { type: String, required: true, index: true },
    driver_id: { type: String, required: true, index: true },
    passenger_id: { type: String, required: true },
    fare: { type: Number, required: true },
    commission_rate: { type: Number, default: 15 },
    commission_amount: { type: Number, required: true },
    driver_credit: { type: Number, required: true },
    payment_method: { type: String },
    currency: { type: String, default: 'NGN' },
    currency_symbol: { type: String, default: '₦' },
    status: { type: String, enum: ['PENDING', 'SETTLED'], default: 'SETTLED' },
  },
  {
    collection: 'admin_ledger_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

AdminLedgerSchema.set('toJSON', { getters: true, virtuals: true });

export default (mongoose.models['AdminLedger'] as mongoose.Model<IAdminLedger>) ||
  mongoose.model<IAdminLedger>('AdminLedger', AdminLedgerSchema);
