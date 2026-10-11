import mongoose, { Schema, Document, Model } from 'mongoose';

export enum ShipmentStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED_AT_TERMINAL = 'ARRIVED_AT_TERMINAL',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  EXCEPTION = 'EXCEPTION',
  CANCELLED = 'CANCELLED'
}

export enum CarrierType {
  INTERNAL = 'INTERNAL',
  FEDEX = 'FEDEX',
  DHL = 'DHL'
}

export interface IAuditLog {
  status: ShipmentStatus;
  description: string;
  timestamp: Date;
  updatedBy: string;
}

export interface IPackage {
  description: string;
  weight: number; // in kg
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  quantity: number;
}

export interface IShipment extends Document {
  trackingNumber: string;
  externalTrackingNumber?: string;
  ownerId: string; // User who created the shipment
  assignedDriverId?: string; // Reference to DriverModel
  carrier: CarrierType;
  origin: {
    address: string;
    coordinates: [number, number]; // [long, lat]
  };
  destination: {
    address: string;
    coordinates: [number, number]; // [long, lat]
  };
  currentLocation: {
    address: string;
    coordinates: [number, number];
  };
  status: ShipmentStatus;
  estimatedDelivery: Date;
  packages: IPackage[];
  auditLog: IAuditLog[];
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  carrierResponse?: any; // To store raw response from FedEx/DHL
  created_at: Date;
  updated_at: Date;
}

const ShipmentSchema: Schema = new Schema(
  {
    trackingNumber: { type: String, required: true, unique: true, index: true },
    externalTrackingNumber: { type: String, index: true },
    ownerId: { type: String, required: true, index: true },
    assignedDriverId: { type: Schema.Types.ObjectId, ref: 'DriverModel', index: true },
    carrier: { 
      type: String, 
      enum: Object.values(CarrierType), 
      default: CarrierType.INTERNAL 
    },
    origin: {
      address: { type: String, required: true },
      coordinates: { type: [Number], required: true }
    },
    destination: {
      address: { type: String, required: true },
      coordinates: { type: [Number], required: true }
    },
    currentLocation: {
      address: { type: String },
      coordinates: { type: [Number] }
    },
    status: { 
      type: String, 
      enum: Object.values(ShipmentStatus), 
      default: ShipmentStatus.PENDING 
    },
    estimatedDelivery: { type: Date },
    packages: [{
      description: String,
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: { type: String, enum: ['cm', 'in'], default: 'cm' }
      },
      quantity: { type: Number, default: 1 }
    }],
    auditLog: [{
      status: { type: String, enum: Object.values(ShipmentStatus) },
      description: String,
      timestamp: { type: Date, default: Date.now },
      updatedBy: String
    }],
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String }
    },
    carrierResponse: { type: Schema.Types.Mixed }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'shipping_collections'
  }
);

ShipmentSchema.index({ 'origin.coordinates': '2dsphere' });
ShipmentSchema.index({ 'destination.coordinates': '2dsphere' });
ShipmentSchema.index({ 'currentLocation.coordinates': '2dsphere' });

const Shipment: Model<IShipment> =
  (mongoose.models.Shipment as Model<IShipment>) || mongoose.model<IShipment>('Shipment', ShipmentSchema);

export default Shipment;
