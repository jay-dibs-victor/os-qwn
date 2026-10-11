import mongoose, { Schema, Document } from 'mongoose';

export interface IRide extends Document {
  passenger_id: string; // Lead passenger ID (for now)
  passengers: string[]; // List of passenger IDs for shared rides
  driver_id?: string;   // UserModel id (once accepted)
  pickup_location: {
    type: string;
    coordinates: number[];
  };
  destination_location: {
    type: string;
    coordinates: number[];
  };
  status: 'SEARCHING' | 'ACCEPTED' | 'ARRIVED' | 'STARTED' | 'COMPLETED' | 'CANCELLED' | 'PENDING_SETTLEMENT';
  payment_status: 'UNPAID' | 'PAID' | 'PENDING';
  booking_type: 'QUICK' | 'PLANNED';
  ride_category: 'taxi' | 'courier';
  scheduled_time?: Date;
  backup_drivers: string[];
  payment_method: 'WALLET' | 'VOUCHER' | 'BANK' | 'CASH' | 'COIN';
  voucher_code?: string;
  fare: number;
  recalculated_fare?: number;
  distance: number;
  duration: number;
  estimated_duration?: number;
  is_shared: boolean;
  max_passengers: number;
  available_seats: number;
  stop_points: {
    location: {
      type: string;
      coordinates: number[];
    };
    passenger_id: string;
    type: 'PICKUP' | 'DROPOFF';
  }[];
  arrived_at_pickup_time?: Date;
  started_at_time?: Date;
  waiting_fee: number;
  rating?: number;
  feedback_tags?: string[];
  feedback_comment?: string;
  verification_code?: string;
  currency: string;
  currency_symbol: string;
  exchange_rate: number;
  local_fare: number;
  created_at: Date;
  updated_at: Date;
}

const RideSchema: Schema = new Schema({
  passenger_id: { type: String, required: true },
  passengers: { type: [String], default: [] },
  driver_id: { type: String },
  pickup_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  destination_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  },
  status: {
    type: String,
    enum: ['SEARCHING', 'ACCEPTED', 'ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED', 'PENDING_SETTLEMENT'],
    default: 'SEARCHING'
  },
  payment_status: {
    type: String,
    enum: ['UNPAID', 'PAID', 'PENDING'],
    default: 'UNPAID'
  },
  booking_type: {
    type: String,
    enum: ['QUICK', 'PLANNED'],
    default: 'QUICK'
  },
  ride_category: {
    type: String,
    enum: ['taxi', 'courier'],
    default: 'taxi'
  },
  scheduled_time: { type: Date },
  backup_drivers: { type: [String], default: [] },
  payment_method: {
    type: String,
    enum: ['WALLET', 'VOUCHER', 'BANK', 'CASH', 'COIN'],
    default: 'CASH'
  },
  voucher_code: { type: String },
  fare: { type: Number, default: 0 },
  recalculated_fare: { type: Number },
  distance: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  estimated_duration: { type: Number },
  is_shared: { type: Boolean, default: false },
  max_passengers: { type: Number, default: 1 },
  available_seats: { type: Number, default: 1 },
  stop_points: [{
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] }
    },
    passenger_id: { type: String },
    type: { type: String, enum: ['PICKUP', 'DROPOFF'] }
  }],
  arrived_at_pickup_time: { type: Date },
  started_at_time: { type: Date },
  waiting_fee: { type: Number, default: 0 },
  rating: { type: Number, min: 1, max: 5 },
  feedback_tags: { type: [String], default: [] },
  feedback_comment: { type: String },
  verification_code: { type: String },
  currency: { type: String, default: 'NGN' },
  currency_symbol: { type: String, default: '₦' },
  exchange_rate: { type: Number, default: 1 },
  local_fare: { type: Number, default: 0 }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

RideSchema.index({ pickup_location: '2dsphere' });
RideSchema.index({ destination_location: '2dsphere' });

export default (mongoose.models.RideModel || mongoose.model<IRide>('RideModel', RideSchema)) as import("mongoose").Model<any>;
