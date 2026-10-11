import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriversNotifications extends Document {
  id: number;
  user_id: string;
  type: 'success' | 'failure' | 'pending' | 'error' | 'information' | 'payment';
  description: string;
  created_at: Date;
  updated_at: Date;
}

interface IDriversNotificationsModel extends Model<IDriversNotifications> {
  addDriversNotifications(user: any, callback: any): Promise<IDriversNotifications>;
  get(id: any): Promise<IDriversNotifications>;
  listCars(params?: { skip?: number; limit?: number }): Promise<IDriversNotifications[]>;
}

const DriversNotificationsSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      default: 0,
    },
    user_id: {
      type: String,
    },
    type: {
      type: String,
      enum: ['success', 'failure', 'pending', 'error', 'information', 'payment'],
      default: 'information',
    },
    description: {
      type: String,
    },
  },
  {
    collection: 'drvnotifcation_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

DriversNotificationsSchema.set('toJSON', { getters: true, virtuals: true });

DriversNotificationsSchema.statics = {
  addDriversNotifications(user: any, callback: any) {
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

export default (mongoose.models.DriversNotificationsModel || mongoose.model<IDriversNotifications, IDriversNotificationsModel>('DriversNotificationsModel', DriversNotificationsSchema)) as import("mongoose").Model<any>;
