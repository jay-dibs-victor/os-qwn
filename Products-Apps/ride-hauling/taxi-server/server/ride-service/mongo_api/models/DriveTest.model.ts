import mongoose, { Document, Schema } from 'mongoose';

export interface IDriveTest extends Document {
  id: number;
  status: string;
  test_center: string;
  description: string;
  username: string;
  email: string;
  time: string;
  createdDate: string;
  phone_number: string;
  car_id: string;
  created_at: Date;
  updated_at: Date;
}

const DriveTestSchema = new Schema<IDriveTest>(
  {
    id: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Completed'] },
    test_center: { type: String },
    description: { type: String, required: true },
    username: { type: String },
    email: { type: String },
    time: { type: String },
    createdDate: { type: String },
    phone_number: { type: String },
    car_id: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'drivetest_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

DriveTestSchema.set('toJSON', { getters: true, virtuals: true });
DriveTestSchema.statics = {
  addTest(user: any, callback: Function) {
    return this.create(user, callback);
  },
};

export default (mongoose.models.DriveTestModel || mongoose.model<IDriveTest>('DriveTestModel', DriveTestSchema)) as import("mongoose").Model<any>;
