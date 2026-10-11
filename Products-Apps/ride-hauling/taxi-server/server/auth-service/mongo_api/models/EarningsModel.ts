import mongoose, { Document, Schema } from 'mongoose';

export interface IEarnings extends Document {
  id: number;
  paymentDate: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentReference: string;
  partnerId: string;
  partnerEmail: string;
  partnerBankAccount: object;
  vehicleId: string;
  vehicleName: string;
  vehiclePlateNo: string;
  partner?: mongoose.Types.ObjectId;
  vehicle?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const EarningsSchema = new Schema<IEarnings>(
  {
    id: { type: Number, default: 0 },
    paymentDate: { type: String },
    paymentStatus: { type: String },
    paymentAmount: { type: Number },
    paymentReference: { type: String },
    partnerId: { type: String },
    partnerEmail: { type: String },
    partnerBankAccount: { type: Object },
    vehicleId: { type: String },
    vehicleName: { type: String },
    vehiclePlateNo: { type: String },
    partner: { type: Schema.Types.ObjectId, ref: 'partner_collections' },
    vehicle: { type: Schema.Types.ObjectId, ref: 'cars_collections' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'earnings_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

EarningsSchema.set('toJSON', { getters: true, virtuals: true });
EarningsSchema.statics = {
  addEarnings(faq: any, callback: Function) {
    return this.create(faq, callback);
  },
  get(id: any) {
    return this.findOne(id)
      .exec()
      .then((plan: any) => {
        if (plan) return plan;
        return Promise.reject(new Error('No such earnings record exists!'));
      });
  },
  listPlan({ skip = 0, limit = 50 } = {}) {
    return this.find().sort({ created_at: -1 }).skip(+skip).limit(+limit).exec();
  },
};

export default (mongoose.models['EarningsModel'] as mongoose.Model<IEarnings>) ||
  mongoose.model<IEarnings>('EarningsModel', EarningsSchema);
