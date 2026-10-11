import mongoose, { Document, Schema } from 'mongoose';

export interface IGmailSetting extends Document {
  id: number;
  api_mode: string;
  test_secret_key: string;
  test_public_key: string;
  live_secret_key: string;
  live_public_key: string;
  settings_type: string;
}

const GmailSettingSchema = new Schema<IGmailSetting>(
  {
    id: { type: Number, default: 0 },
    api_mode: { type: String, default: 'test' },
    test_secret_key: { type: String },
    test_public_key: { type: String, default: 'NO KEY SET YET' },
    live_secret_key: { type: String, default: 'NO KEY SET YET' },
    live_public_key: { type: String, default: 'NO KEY SET YET' },
    settings_type: { type: String, default: 'google' },
  },
  {
    collection: 'google_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

GmailSettingSchema.set('toJSON', { getters: true, virtuals: true });
GmailSettingSchema.statics = {
  addSettings(user: any, callback: Function) {
    return this.create(user, callback);
  },
};

export default (mongoose.models.GmailSettingModel || mongoose.model<IGmailSetting>('GmailSettingModel', GmailSettingSchema)) as import("mongoose").Model<any>;
