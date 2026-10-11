import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  id: number;
  ssl_mode: boolean;
  general_email: string;
  smtp_username: string;
  smtp_password: string;
  offline_message: number;
  status: string;
  logo: string;
  slogan: string;
  footer_content: string;
  created_at: Date;
  updated_at: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    id: { type: Number, default: 0 },
    ssl_mode: { type: Boolean, required: true },
    general_email: { type: String, required: true },
    smtp_username: { type: String, required: true },
    smtp_password: { type: String, required: true },
    offline_message: { type: Number },
    status: { type: String, enum: ['offline', 'online'] },
    logo: { type: String },
    slogan: { type: String },
    footer_content: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'setting_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

SettingSchema.set('toJSON', { getters: true, virtuals: true });

export default (mongoose.models.SettingModel || mongoose.model<ISetting>('SettingModel', SettingSchema)) as import("mongoose").Model<any>;
