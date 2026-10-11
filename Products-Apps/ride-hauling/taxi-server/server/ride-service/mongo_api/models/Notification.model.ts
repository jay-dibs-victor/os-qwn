import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  id: number;
  user_id: string;
  status: string;
  for_users: boolean;
  isViewed: boolean;
  type: 'success' | 'failure' | 'pending' | 'error' | 'information' | 'payment' | 'ticket' | 'quotation';
  description: string;
  created_at: Date;
  updated_at: Date;
}

interface INotificationModel extends Model<INotification> {
  addNotification(user: any, callback: any): Promise<INotification>;
  get(id: any): Promise<INotification>;
  listCars(params?: { skip?: number; limit?: number }): Promise<INotification[]>;
}

const NotificationSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      default: 0,
    },
    user_id: {
      type: String,
    },
    status: {
      type: String,
      default: 'new',
    },
    for_users: {
      type: Boolean,
      default: true,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: [
        'success',
        'failure',
        'pending',
        'error',
        'information',
        'payment',
        'ticket',
        'quotation',
      ],
      default: 'information',
    },
    description: {
      type: String,
    },
  },
  {
    collection: 'notifcation_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

NotificationSchema.set('toJSON', { getters: true, virtuals: true });

/**
 * Statics
 */
NotificationSchema.statics = {
  // Add Intervention
  addNotification(user: any, callback: any) {
    return this.create(user, callback);
  },

  get(id: any) {
    return this.findOne(id)
      .exec()
      .then((user: any) => {
        if (user) {
          return user;
        }
        const err = new Error('No such user exists!');
        return Promise.reject(err);
      });
  },

  listCars({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ created_at: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
};

export default (mongoose.models.NotificationModel || mongoose.model<INotification, INotificationModel>('NotificationModel', NotificationSchema)) as import("mongoose").Model<any>;
