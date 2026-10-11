import mongoose, { Document, Schema } from 'mongoose';

export interface IForgotPasswordToken extends Document {
  _userId: number;
  email_confirm_token: string;
  email_to_reset: string;
  createdAt: Date;
}

const PasswordForgotTokenSchema = new Schema<IForgotPasswordToken>({
  _userId: { type: Number },
  email_confirm_token: { type: String, required: true },
  email_to_reset: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: 43200 },
});

export default (mongoose.models.PasswordForgotTokenModel || mongoose.model<IForgotPasswordToken>('PasswordForgotTokenModel', PasswordForgotTokenSchema)) as import("mongoose").Model<any>;
