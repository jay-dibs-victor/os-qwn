import mongoose, { Document, Schema } from 'mongoose';

export interface ISendgridEmailSetting extends Document {
  id: number;
  api_mode: string;
  test_secret_key: string;
  test_public_key: string;
  live_secret_key: string;
  live_public_key: string;
  settings_type: string;
}

const SendgridEmailSettingSchema = new Schema<ISendgridEmailSetting>(
  {
    id: { type: Number, default: 0 },
    api_mode: { type: String, default: 'test' },
    test_secret_key: { type: String },
    test_public_key: { type: String, default: 'NO KEY SET YET' },
    live_secret_key: { type: String, default: 'NO KEY SET YET' },
    live_public_key: { type: String, default: 'NO KEY SET YET' },
    settings_type: { type: String, default: 'sendgrid' },
  },
  {
    collection: 'sendgrid_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

SendgridEmailSettingSchema.set('toJSON', { getters: true, virtuals: true });
SendgridEmailSettingSchema.statics = {
  addSettings(user: any, callback: Function) {
    return this.create(user, callback);
  },
};

export default (mongoose.models.SendgridEmailSettingModel || mongoose.model<ISendgridEmailSetting>('SendgridEmailSettingModel', SendgridEmailSettingSchema)) as import("mongoose").Model<any>;
