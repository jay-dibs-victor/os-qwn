import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: 'FREE' })
  activePlan: string;

  @Prop({ default: null })
  planExpiry: Date;

  @Prop({ default: 'NONE' })
  subscriptionStatus: string; // 'ACTIVE', 'EXPIRED', 'NONE'
}

export const UserSchema = SchemaFactory.createForClass(User);
