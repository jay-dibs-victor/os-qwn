import mongoose, { Document, Schema } from 'mongoose';

export interface IToken extends Document {
  _userId: string;
  email_confirm_token: string;
  createdAt: Date;
}

const SignUpTokenSchema = new Schema<IToken>({
  _userId: { type: String },
  email_confirm_token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: 300 }, // 5 minutes
});

export default (mongoose.models.TokenModel || mongoose.model<IToken>('TokenModel', SignUpTokenSchema)) as import("mongoose").Model<any>;
