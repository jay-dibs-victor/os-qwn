import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, unique: true })
  reference: string;

  @Prop({ required: true })
  userId: string; // Simplifies reference to username/id

  @Prop({ required: true })
  planId: string; // 'STARTER', 'PRO', 'ENTERPRISE'

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  provider: string; // 'paystack', 'moniepoint', 'opay', 'paypal', 'applepay', 'googlepay'

  @Prop({ required: true, default: 'PENDING' })
  status: string; // 'PENDING', 'SUCCESS', 'FAILED'

  @Prop({ type: Object, default: {} })
  paymentDetails: Record<string, any>;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
