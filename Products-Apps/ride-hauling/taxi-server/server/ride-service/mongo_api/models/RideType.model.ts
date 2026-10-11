import mongoose, { Document, Schema } from 'mongoose';

export interface IRideType extends Document {
  id: string;
  title: string;
  description: string;
  multiplier: number;
  icon: string;
  created_at: Date;
  updated_at: Date;
}

const RideTypeSchema = new Schema<IRideType>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    multiplier: { type: Number, required: true, default: 1.0 },
    icon: { type: String },
  },
  {
    collection: 'ride_types_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

RideTypeSchema.set('toJSON', { getters: true, virtuals: true });

RideTypeSchema.statics = {
  addRideType(rideTypeData: any, callback: any) {
    return this.create(rideTypeData, callback);
  },

  get(id: any) {
    return this.findOne({ id })
      .exec()
      .then((rt: any) => {
        if (rt) {
          return rt;
        }
        const err = new Error('No such ride type exists!');
        return Promise.reject(err);
      });
  },

  listRideTypes({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ created_at: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
};

export default (mongoose.models.RideTypeModel || mongoose.model<IRideType>('RideTypeModel', RideTypeSchema)) as import("mongoose").Model<any>;
