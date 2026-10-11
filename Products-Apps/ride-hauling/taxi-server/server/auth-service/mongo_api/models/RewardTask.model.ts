import mongoose, { Schema, Document } from 'mongoose';

export interface IRewardTask extends Document {
  title: string;
  description: string;
  coin_reward: number;
  task_type: 'FUND_WALLET' | 'TRIP_COUNT' | 'DAILY_LOGIN' | 'SOCIAL_LINK';
  requirement_value: number; // e.g., 2000 for FUND_WALLET
  is_active: boolean;
  expires_at?: Date;
}

const RewardTaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  coin_reward: { type: Number, required: true },
  task_type: { 
    type: String, 
    enum: ['FUND_WALLET', 'TRIP_COUNT', 'DAILY_LOGIN', 'SOCIAL_LINK'], 
    required: true 
  },
  requirement_value: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  expires_at: { type: Date }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default (mongoose.models.RewardTask || mongoose.model<IRewardTask>('RewardTask', RewardTaskSchema)) as import("mongoose").Model<any>;
