import mongoose, { Document, Schema } from 'mongoose';

export interface IGeoLocation extends Document {
  id: number;
  assigned_car_id: number;
  user_id: number;
  assigned_driver_id: number;
  _drivers?: mongoose.Types.ObjectId;
  _cars?: mongoose.Types.ObjectId;
  _users?: mongoose.Types.ObjectId;
  _mapLocation?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const GeoLocationSchema = new Schema<IGeoLocation>(
  {
    id: { type: Number, default: 0 },
    assigned_car_id: { type: Number, required: true },
    user_id: { type: Number, required: true },
    assigned_driver_id: { type: Number },
    _drivers: { type: Schema.Types.ObjectId, ref: 'DriverModel' },
    _cars: { type: Schema.Types.ObjectId, ref: 'PlanModel' },
    _users: { type: Schema.Types.ObjectId, ref: 'UserModel' },
    _mapLocation: { type: Schema.Types.ObjectId, ref: 'GeoLocationModel' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'geolocation_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

GeoLocationSchema.set('toJSON', { getters: true, virtuals: true });

export default (mongoose.models.GeoLocationModel || mongoose.model<IGeoLocation>('GeoLocationModel', GeoLocationSchema)) as import("mongoose").Model<any>;
