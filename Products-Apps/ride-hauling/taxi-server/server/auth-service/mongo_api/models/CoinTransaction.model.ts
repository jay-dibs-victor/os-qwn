import mongoose, { Schema, Document } from 'mongoose';

export interface ICoinTransaction extends Document {
  userId: string;
  amount: number;
  type: 'EARN' | 'SPEND' | 'EXCHANGE' | 'REWARD';
  reason: string;
  metadata?: any;
  created_at: Date;
}

const CoinTransactionSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['EARN', 'SPEND', 'EXCHANGE', 'REWARD'], required: true },
  reason: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default (mongoose.models.CoinTransaction || mongoose.model<ICoinTransaction>('CoinTransaction', CoinTransactionSchema)) as import("mongoose").Model<any>;
