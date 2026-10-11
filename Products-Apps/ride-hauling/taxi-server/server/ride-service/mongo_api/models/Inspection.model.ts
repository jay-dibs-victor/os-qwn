import mongoose, { Document, Schema } from 'mongoose';

export interface IInspection extends Document {
  id: number;
  car_id: string;
  status: string;
  description: string;
  username: string;
  email: string;
  time: string;
  createdDate: string;
  phone_number: string;
  created_at: Date;
  updated_at: Date;
}

const InspectionSchema = new Schema<IInspection>(
  {
    id: { type: Number, default: 0 },
    car_id: { type: String },
    status: { type: String, enum: ['Pending', 'Completed'] },
    description: { type: String, required: true },
    username: { type: String },
    email: { type: String },
    time: { type: String },
    createdDate: { type: String },
    phone_number: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'inspection_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

InspectionSchema.set('toJSON', { getters: true, virtuals: true });
InspectionSchema.statics = {
  addInspection(user: any, callback: Function) {
    return this.create(user, callback);
  },
};

export default (mongoose.models.InspectionModel || mongoose.model<IInspection>('InspectionModel', InspectionSchema)) as import("mongoose").Model<any>;
