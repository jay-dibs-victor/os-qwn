import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriver extends Document {
  id: number;
  firstname: string;
  lastname: string;
  identity_card: string;
  test_certificate: string;
  status: 'Active' | 'Dormant' | 'Disabled' | 'Suspended';
  roles: string;
  isVerified: boolean;
  is_active: string | boolean;
  is_available: boolean;
  current_activity: 'IDLE' | 'EN_ROUTE' | 'ON_RIDE';
  avatar: string;
  car_assigned_name: string[];
  assigned_car_plate_number: string;
  assigned_driver_location: string;
  geometry: {
    coordinates: number[];
  };
  location: {
    type: string;
    coordinates: number[];
  };
  socket_id: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  username: string;
  email: string;
  password?: string;
  phone_number: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
  googleProvider?: {
    id: string;
    token: string;
  };
  facebookProvider?: {
    id: string;
    token: string;
  };
  onboardingDetails?: {
    ssn: string;
    licenseNumber: string;
    licenseExpiry: Date;
    address: string;
    isPartner: boolean;
    partnerDetails?: {
      companyName: string;
      registrationNumber: string;
      fleetSize: number;
    };
    documents: {
      licenseFront: string;
      idProof: string;
      utilityBill: string;
      insurance: string;
      carInteriorVideo?: string;
      carExteriorVideo?: string;
    };
  };
  vettingStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface IDriverModel extends Model<IDriver> {
  addUser(user: any, callback: any): Promise<IDriver>;
  get(id: any): Promise<IDriver>;
  listUsers(params?: { skip?: number; limit?: number }): Promise<IDriver[]>;
  upsertFbUser(accessToken: string, refreshToken: string, profile: any, cb: any): void;
  upsertGoogleUser(accessToken: string, refreshToken: string, profile: any, cb: any): void;
}

const DriverSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      default: 0,
    },
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    identity_card: {
      type: String,
    },
    test_certificate: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Dormant', 'Disabled', 'Suspended'],
      default: 'Active',
    },
    roles: {
      type: String,
      default: 'Individual Driver',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Schema.Types.Mixed,
      default: true,
    },
    is_available: {
      type: Boolean,
      default: false,
    },
    current_activity: {
      type: String,
      enum: ['IDLE', 'EN_ROUTE', 'ON_RIDE'],
      default: 'IDLE',
    },
    avatar: {
      type: String,
    },
    car_assigned_name: {
      type: Array,
    },
    assigned_car_plate_number: {
      type: String,
    },
    assigned_driver_location: {
      type: String,
    },
    geometry: {
      coordinates: { type: [Number], index: '2dsphere' },
    },
    location: {
      type: { type: String },
      coordinates: [],
    },
    socket_id: {
      type: String,
    },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    is_admin: Boolean,
    googleProvider: {
      type: {
        id: String,
        token: String,
      },
      select: false,
    },
    facebookProvider: {
      type: {
        id: String,
        token: String,
      },
      select: false,
    },
    onboardingDetails: {
      ssn: { type: String },
      licenseNumber: { type: String },
      licenseExpiry: { type: Date },
      address: { type: String },
      isPartner: { type: Boolean, default: false },
      partnerDetails: {
        companyName: { type: String },
        registrationNumber: { type: String },
        fleetSize: { type: Number },
      },
      documents: {
        licenseFront: { type: String },
        idProof: { type: String },
        utilityBill: { type: String },
        insurance: { type: String },
        carInteriorVideo: { type: String },
        carExteriorVideo: { type: String },
      },
    },
    vettingStatus: {
      type: String,
      enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NOT_SUBMITTED',
    },
  },
  {
    collection: 'driver_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

DriverSchema.set('toJSON', { getters: true, virtuals: true });
DriverSchema.index({ location: '2dsphere' });

DriverSchema.statics = {
  addUser(user: any, callback: any) {
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

  listUsers({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ created_at: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  upsertFbUser(accessToken: string, refreshToken: string, profile: any, cb: any) {
    const that = this as any;
    return this.findOne(
      {
        'facebookProvider.id': profile.id,
      },
      function(err: any, user: any) {
        if (!user) {
          const newUser = new that({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            facebookProvider: {
              id: profile.id,
              token: accessToken,
            },
          });

          newUser.save(function(error: any, savedUser: any) {
            if (error) {
              console.log(error);
            }
            return cb(error, savedUser);
          });
        } else {
          return cb(err, user);
        }
      },
    );
  },

  upsertGoogleUser(accessToken: string, refreshToken: string, profile: any, cb: any) {
    const that = this as any;
    return this.findOne(
      {
        'googleProvider.id': profile.id,
      },
      function(err: any, user: any) {
        if (!user) {
          const newUser = new that({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            googleProvider: {
              id: profile.id,
              token: accessToken,
            },
          });

          newUser.save(function(error: any, savedUser: any) {
            if (error) {
              console.log(error);
            }
            return cb(error, savedUser);
          });
        } else {
          return cb(err, user);
        }
      },
    );
  },
};

export default (mongoose.models.DriverModel || mongoose.model<IDriver, IDriverModel>('DriverModel', DriverSchema)) as import("mongoose").Model<any>;
