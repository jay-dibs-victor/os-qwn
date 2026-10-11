import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditNotification extends Document {
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

const AuditNotificationSchema = new Schema<IAuditNotification>(
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

AuditNotificationSchema.set('toJSON', { getters: true, virtuals: true });
AuditNotificationSchema.statics = {
  addNotification(user: any, callback: Function) {
    return this.create(user, callback);
  },
};

export default (mongoose.models.AuditNotificationModel || mongoose.model<IAuditNotification>('AuditNotificationModel', AuditNotificationSchema)) as import("mongoose").Model<any>;
