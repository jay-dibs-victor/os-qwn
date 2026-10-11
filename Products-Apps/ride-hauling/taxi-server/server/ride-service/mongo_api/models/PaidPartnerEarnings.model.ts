import mongoose, { Document, Schema } from 'mongoose';

// PaidPartnerEarnings shares same structure as AuditNotification (it was same file in JS)
export interface IPaidPartnerEarnings extends Document {
  id: number;
  date: string;
  admin: string;
  avatar: string;
  user: string;
  module_name: string;
  status: string;
  message_type: string;
  logMessage: string;
}

const PaidPartnerEarningsSchema = new Schema<IPaidPartnerEarnings>(
  {
    id: { type: Number, default: 0 },
    date: { type: String },
    admin: { type: String },
    avatar: { type: String },
    user: { type: String },
    module_name: { type: String },
    status: { type: String },
    message_type: { type: String },
    logMessage: { type: String },
  },
  {
    collection: 'auditnotification_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

PaidPartnerEarningsSchema.set('toJSON', { getters: true, virtuals: true });
PaidPartnerEarningsSchema.statics = {
  addNotification(user: any, callback: Function) {
    return this.create(user, callback);
  },
};

export default (mongoose.models.PaidPartnerEarningsModel || mongoose.model<IPaidPartnerEarnings>('PaidPartnerEarningsModel', PaidPartnerEarningsSchema)) as import("mongoose").Model<any>;
