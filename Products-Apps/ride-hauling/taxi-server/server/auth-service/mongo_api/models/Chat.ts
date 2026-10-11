import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChat extends Document {
  message: string;
  sender: string;
  receiver?: string;
  ride_id: string;
  sender_role: 'PASSENGER' | 'DRIVER';
  status: 'SENT' | 'DELIVERED' | 'READ';
}

const chatSchema: Schema = new Schema(
  {
    message: { type: String, required: true },
    sender: { type: String, required: true },
    receiver: { type: String },
    ride_id: { type: String, required: true },
    sender_role: { type: String, enum: ['PASSENGER', 'DRIVER'], required: true },
    status: { type: String, enum: ['SENT', 'DELIVERED', 'READ'], default: 'SENT' },
  },
  {
    collection: 'chat_collections',
    timestamps: true,
  },
);

// Indexes for fast retrieval during a ride
chatSchema.index({ ride_id: 1, createdAt: 1 });

const Chat: Model<IChat> = (mongoose.models['theChat'] as Model<IChat>) || mongoose.model<IChat>('theChat', chatSchema);

export default Chat;
