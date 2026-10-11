import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMech extends Document {
  id: number;
  user_id: string;
  location: string;
  address: string;
  status: string;
  email: string;
  firstname: string;
  lastname: string;
  carbrand: string;
  description: string;
  images: string[];
  created_at: Date;
  updated_at: Date;
}

interface IMechModel extends Model<IMech> {
  addMech(user: any, callback: any): Promise<IMech>;
  get(id: any): Promise<IMech>;
  listPlan(params?: { skip?: number; limit?: number }): Promise<IMech[]>;
}

const MechSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      default: 0,
    },
    user_id: {
      type: String,
    },
    location: {
      type: String,
    },
    address: {
      type: String,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    email: {
      type: String,
    },
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    carbrand: {
      type: String,
    },
    description: {
      type: String,
    },
    images: {
      type: Array,
    },
  },
  {
    collection: 'mech_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

MechSchema.set('toJSON', { getters: true, virtuals: true });

/**
 * Statics
 */
MechSchema.statics = {
  // Add Intervention
  addMech(user: any, callback: any) {
    return this.create(user, callback);
  },

  get(id: any) {
    return this.findOne(id)
      .exec()
      .then((user: any) => {
        if (user) {
          return user;
        }
        const err = new Error('No such mech request category exists!');
        return Promise.reject(err);
      });
  },

  listPlan({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ created_at: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
};

export default (mongoose.models.MechModel || mongoose.model<IMech, IMechModel>('MechModel', MechSchema)) as import("mongoose").Model<any>;
