import mongoose, { Document, Schema } from 'mongoose';

export interface IAwsS3 extends Document {
  id: number;
  api_mode: string;
  test_secret_key: string;
  test_public_key: string;
  live_secret_key: string;
  live_public_key: string;
  settings_type: string;
}

const AwsS3Schema = new Schema<IAwsS3>(
  {
    id: { type: Number, default: 0 },
    api_mode: { type: String, default: 'test' },
    test_secret_key: { type: String },
    test_public_key: { type: String, default: 'NO KEY SET YET' },
    live_secret_key: { type: String, default: 'NO KEY SET YET' },
    live_public_key: { type: String, default: 'NO KEY SET YET' },
    settings_type: { type: String, default: 'aws' },
  },
  {
    collection: 'aws_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

AwsS3Schema.set('toJSON', { getters: true, virtuals: true });
AwsS3Schema.statics = {
  addSettings(user: any, callback: Function) {
    return this.create(user, callback);
  },
};

export default (mongoose.models.AwsS3Model || mongoose.model<IAwsS3>('AwsS3Model', AwsS3Schema)) as import("mongoose").Model<any>;
