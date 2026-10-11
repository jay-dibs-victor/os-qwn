import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminNotification extends Document {
  id: number;
  user_id: string;
  status: string;
  for_users: boolean;
  isViewed: boolean;
  type: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

const AdminNotificationSchema = new Schema<IAdminNotification>(
  {
    id: { type: Number, default: 0 },
    user_id: { type: String },
    status: { type: String, default: 'new' },
    for_users: { type: Boolean, default: true },
    isViewed: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['success', 'failure', 'pending', 'error', 'information', 'payment', 'ticket', 'quotation'],
      default: 'information',
    },
    description: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'notifcation_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

AdminNotificationSchema.set('toJSON', { getters: true, virtuals: true });
AdminNotificationSchema.statics = {
  addNotification(user: any, callback: Function) {
    return this.create(user, callback);
  },
  get(id: any) {
    return this.findOne(id)
      .exec()
      .then((user: any) => {
        if (user) return user;
        return Promise.reject(new Error('No such notification exists!'));
      });
  },
  listCars({ skip = 0, limit = 50 } = {}) {
    return this.find().sort({ created_at: -1 }).skip(+skip).limit(+limit).exec();
  },
};

export default (mongoose.models.AdminNotificationModel || mongoose.model<IAdminNotification>('AdminNotificationModel', AdminNotificationSchema)) as import("mongoose").Model<any>;
