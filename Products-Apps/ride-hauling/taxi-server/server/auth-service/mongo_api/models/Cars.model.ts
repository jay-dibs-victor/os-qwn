import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICar extends Document {
  id: number;
  hasBeenRevoked: boolean;
  car: any;
  manufacturer: string;
  carModel: string;
  carYear: string;
  vehicleColor: string;
  plateNo: string;
  inspectionDate: string;
  inspectionTime: string;
  confirmedInspectionDate: string;
  confirmedInspectionTime: string;
  creator: mongoose.Types.ObjectId;
  carDescription: string;
  imagePath: string;
  date_created: Date;
  car_type: string;
  car_year: string;
  color: string;
  model: string;
  model_make_id: string;
  license: string;
  partner_id: string;
  partnerEmail: string;
  vehicleIdentificationNumber: string;
  car_status: 'Active' | 'Disabled' | 'Suspended';
  health_status: 'Completed' | 'Pending';
  status: 'Booked' | 'Available' | 'Pending';
  images: string;
  description: string;
  inspection_detail: string;
  assigned_driver_name: string;
  assigned_driver_email: string;
  assigned_driver_location: string;
  socket_id: string;
  assigned_driver_phone: string;
  assigned_driver_id: string;
  plate_number: string;
  isOwnedByCompany: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ICarModel extends Model<ICar> {
  addCars(user: any, callback: any): Promise<ICar>;
  get(id: any): Promise<ICar>;
  listCars(params?: { skip?: number; limit?: number }): Promise<ICar[]>;
}

const CarsSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      default: 0,
    },
    hasBeenRevoked: {
      type: Boolean,
      default: false,
    },
    car: {
      type: Object,
    },
    manufacturer: {
      type: String,
    },
    carModel: {
      type: String,
    },
    carYear: {
      type: String,
    },
    vehicleColor: {
      type: String,
    },
    plateNo: {
      type: String,
    },
    inspectionDate: {
      type: String,
      default: () => new Date().toISOString(),
    },
    inspectionTime: {
      type: String,
      default: '10.00 AM',
    },
    confirmedInspectionDate: {
      type: String,
      default: () => new Date().toISOString(),
    },
    confirmedInspectionTime: {
      type: String,
      default: '10.00 AM',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    carDescription: {
      type: String,
    },
    imagePath: {
      type: String,
    },
    date_created: {
      type: Date,
      default: Date.now,
    },
    car_type: {
      type: String,
    },
    car_year: {
      type: String,
    },
    color: {
      type: String,
    },
    model: {
      type: String,
    },
    model_make_id: {
      type: String,
    },
    license: {
      type: String,
    },
    partner_id: {
      type: String,
    },
    partnerEmail: {
      type: String,
    },
    vehicleIdentificationNumber: {
      type: String,
    },
    car_status: {
      type: String,
      enum: ['Active', 'Disabled', 'Suspended'],
      default: 'Active',
    },
    health_status: {
      type: String,
      enum: ['Completed', 'Pending'],
      default: 'Pending',
    },
    status: {
      type: String,
      enum: ['Booked', 'Available', 'Pending'],
      default: 'Pending',
    },
    images: {
      type: String,
    },
    description: {
      type: String,
      default: 'No description',
    },
    inspection_detail: {
      type: String,
    },
    assigned_driver_name: {
      type: String,
    },
    assigned_driver_email: {
      type: String,
    },
    assigned_driver_location: {
      type: String,
    },
    socket_id: {
      type: String,
    },
    assigned_driver_phone: {
      type: String,
    },
    assigned_driver_id: {
      type: String,
    },
    plate_number: {
      type: String,
    },
    isOwnedByCompany: { type: Boolean, default: false },
  },
  {
    collection: 'cars_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

CarsSchema.set('toJSON', { getters: true, virtuals: true });

CarsSchema.statics = {
  addCars(user: any, callback: any) {
    return this.create(user, callback);
  },

  get(id: any) {
    return this.findOne(id)
      .exec()
      .then((user: any) => {
        if (user) {
          return user;
        }
        const err = new Error('No such user exists!');
        return Promise.reject(err);
      });
  },

  listCars({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ created_at: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
};

export default (mongoose.models.CarsModel || mongoose.model<ICar, ICarModel>('CarsModel', CarsSchema)) as import("mongoose").Model<any>;
