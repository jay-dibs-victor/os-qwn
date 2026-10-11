import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  id: number;
  firstname: string;
  fb_id: string;
  google_id: string;
  ratings_average: string;
  status: 'Active' | 'Dormant' | 'Disabled' | 'Suspended';
  user_type: string;
  plan_name: string;
  lastname: string;
  roles: string;
  for_users: boolean;
  usergroup_set: string[];
  test_certificate: string;
  test_center: string;
  test_center_address: string;
  isVerified: boolean;
  is_active: string | boolean;
  is_available: boolean;
  current_activity: 'IDLE' | 'EN_ROUTE' | 'ON_RIDE';
  avatar: string;
  notification_count: number;
  balance: string;
  old_balance: string;
  view_payments: string;
  view_transactions: string;
  view_quotations: string;
  view_cars: string;
  view_drivers: string;
  view_partners: string;
  view_sos: string;
  view_package: string;
  view_bookings: string;
  view_tickets: string;
  view_faqs: string;
  view_settings: string;
  view_users: string;
  view_admins: string;
  view_car_inspection: string;
  view_drive_test: string;
  manage_payments: string;
  manage_transactions: string;
  manage_quotations: string;
  manage_cars: string;
  manage_drivers: string;
  manage_partners: string;
  manage_sos: string;
  manage_package: string;
  manage_bookings: string;
  manage_tickets: string;
  manage_faqs: string;
  manage_settings: string;
  manage_users: string;
  manage_admins: string;
  manage_car_inspection: string;
  manage_drive_test: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  username: string;
  email: string;
  password?: string;
  phone_number: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
  facebook?: {
    id: string;
    token: string;
    email: string;
    name: string;
  };
  google?: {
    id: string;
    token: string;
    email: string;
    name: string;
  };
  amount?: number;
  reference?: string;
  identity_card?: string;
  car_assigned_name?: string[];
  assigned_car_plate_number?: string;
  assigned_driver_location?: string;
  saved_places?: {
    label: string,
    address: string,
    lat: number,
    lng: number
  }[];
  referral_code?: string;
  referred_by?: string;
  emergency_contacts?: {
    name: string,
    phone: string,
    email: string
  }[];
  geometry?: {
    coordinates: number[];
  };
  location?: {
    type: string;
    coordinates: number[];
  };
  voucher_balance?: string;
  socket_id?: string;
  preferences?: {
    rideType: string;
    musicPreference: string;
    accessibilityNeeds: string;
    travelFrequency: string;
    preferredPayment: string;
  };
  hasCompletedOnboarding?: boolean;
  taxi_coins: number;
  streak_count: number;
  last_trip_date?: Date;
  completed_trips: number;
  referred_users_count: number;
  referred_drivers_count: number;
  use_coins_augmentation: boolean;
  use_coins_for_commissions: boolean;
  local_wallet?: {
    country: string;
    currency: string;
    symbol: string;
    gateway: string;
    last_sync: Date;
  };
  transform(): any;
}

interface IUserModel extends Model<IUser> {
  transformBalance(user: IUser): string;
  addUser(user: any, callback: any): Promise<IUser>;
  get(id: any): Promise<IUser>;
  listUsers(params?: { skip?: number; limit?: number }): Promise<IUser[]>;
  upsertFbUser(accessToken: string, refreshToken: string, profile: any, cb: any): void;
  getId(id: string): Promise<IUser>;
  getMasterAccount(): Promise<IUser>;
  findAndGenerateToken(options: any): Promise<any>;
  list(params: any): Promise<IUser[]>;
  checkDuplicateEmail(error: any): any;
  upsertGoogleUser(accessToken: string, refreshToken: string, profile: any, cb: any): void;
}

const UserSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      default: 0,
    },
    firstname: {
      type: String,
    },
    fb_id: {
      type: String,
    },
    google_id: {
      type: String,
    },
    ratings_average: {
      type: String,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Dormant', 'Disabled', 'Suspended'],
      default: 'Active',
    },
    user_type: {
      type: String,
      default: 'Individual',
    },
    plan_name: {
      type: String,
      default: 'Queens saver',
    },
    lastname: {
      type: String,
    },
    roles: {
      type: String,
      default: 'user',
    },
    for_users: {
      type: Boolean,
      default: true,
    },
    usergroup_set: {
      type: Array,
      default: [
        'Simple Admin',
        'Moderator Admin',
        'Super Admin',
        'Inspection Manager',
        'Partners Manager',
        'Hr',
        'Accountant',
      ],
    },
    test_certificate: {
      type: String,
      default: 'NO-CERTIFICATE-ISSUED',
    },
    test_center: {
      type: String,
      default: 'NO-CERTER-YET',
    },
    test_center_address: {
      type: String,
      default: 'NO-TESTCENTER-ADDRESS-YET',
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
      default: '',
    },
    notification_count: {
      type: Number,
      default: 0,
    },
    balance: {
      type: String,
      default: '0.00',
    },
    old_balance: {
      type: String,
      default: '0.00',
    },
    view_payments: {
      type: String,
      default: 'yes',
    },
    view_transactions: {
      type: String,
    },
    view_quotations: {
      type: String,
    },
    view_cars: {
      type: String,
    },
    view_drivers: {
      type: String,
    },
    view_partners: {
      type: String,
    },
    view_sos: {
      type: String,
    },
    view_package: {
      type: String,
    },
    view_bookings: {
      type: String,
    },
    view_tickets: {
      type: String,
    },
    view_faqs: {
      type: String,
    },
    view_settings: {
      type: String,
    },
    view_users: {
      type: String,
    },
    view_admins: {
      type: String,
    },
    view_car_inspection: {
      type: String,
    },
    view_drive_test: {
      type: String,
    },
    manage_payments: {
      type: String,
      default: 'yes',
    },
    manage_transactions: {
      type: String,
    },
    manage_quotations: {
      type: String,
    },
    manage_cars: {
      type: String,
    },
    manage_drivers: {
      type: String,
    },
    manage_partners: {
      type: String,
    },
    manage_sos: {
      type: String,
    },
    manage_package: {
      type: String,
    },
    manage_bookings: {
      type: String,
    },
    manage_tickets: {
      type: String,
    },
    manage_faqs: {
      type: String,
    },
    manage_settings: {
      type: String,
    },
    manage_users: {
      type: String,
    },
    manage_admins: {
      type: String,
    },
    manage_car_inspection: {
      type: String,
    },
    manage_drive_test: {
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
    is_admin: {
      type: Boolean,
      default: false,
    },
    facebook: {
      id: String,
      token: String,
      email: String,
      name: String,
    },
    google: {
      id: String,
      token: String,
      email: String,
      name: String,
    },
    amount: {
      type: Number,
    },
    reference: {
      type: String,
    },
    identity_card: {
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
    saved_places: [
      {
        label: { type: String },
        address: { type: String },
        lat: { type: Number },
        lng: { type: Number },
      },
    ],
    referral_code: {
      type: String,
      unique: true,
      sparse: true,
    },
    referred_by: {
      type: String,
    },
    emergency_contacts: [
      {
        name: { type: String },
        phone: { type: String },
        email: { type: String },
      },
    ],
    geometry: {
      coordinates: { type: [Number], index: '2dsphere' },
    },
    location: {
      type: { type: String },
      coordinates: [],
    },
    voucher_balance: {
      type: String,
      default: '0.00',
    },
    socket_id: {
      type: String,
    },
    preferences: {
      rideType: { type: String, default: 'Economy' },
      musicPreference: { type: String, default: 'Radio' },
      accessibilityNeeds: { type: String, default: 'None' },
      travelFrequency: { type: String, default: 'Occasionally' },
      preferredPayment: { type: String, default: 'Card' },
    },
    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
    },
    taxi_coins: {
      type: Number,
      default: 0,
    },
    streak_count: {
      type: Number,
      default: 0,
    },
    last_trip_date: {
      type: Date,
    },
    completed_trips: {
      type: Number,
      default: 0,
    },
    referred_users_count: {
      type: Number,
      default: 0,
    },
    referred_drivers_count: {
      type: Number,
      default: 0,
    },
    use_coins_augmentation: {
      type: Boolean,
      default: false,
    },
    use_coins_for_commissions: {
      type: Boolean,
      default: false,
    },
    local_wallet: {
      country: { type: String },
      currency: { type: String },
      symbol: { type: String },
      gateway: { type: String },
      last_sync: { type: Date }
    }
  },
  {
    collection: 'users_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

UserSchema.index({ location: '2dsphere' });
UserSchema.index({ 'geometry.coordinates': '2dsphere' });

UserSchema.set('toJSON', { getters: true, virtuals: true });

UserSchema.methods = {
  transform() {
    const transformed: any = {};
    const fields = ['id', 'accountNumber', 'name', 'email', 'role', 'created_at'];

    fields.forEach(field => {
      transformed[field] = (this as any)[field];
    });

    return transformed;
  },
};

UserSchema.statics = {
  transformBalance(user: IUser) {
    return user.balance;
  },

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

  async getId(id: string) {
    try {
      let customer;
      if (mongoose.isValidObjectId(id)) {
        customer = await this.findById(id).exec();
      }
      if (customer) {
        return customer;
      }
      throw new Error('Customer does not exist');
    } catch (error) {
      throw error;
    }
  },

  async getMasterAccount() {
    const masterAccountData = {
      accountNumber: 'master',
      role: 'admin',
      name: 'Master Account',
      email: 'master_account@bank.com',
      password: 'password',
    };
    try {
      let customer = await this.findOne({ accountNumber: masterAccountData.accountNumber }).exec();
      if (customer) {
        return customer;
      } else {
        return await this.create(masterAccountData);
      }
    } catch (error) {
      throw error;
    }
  },

  async findAndGenerateToken(options: any) {
    const { email, password, refreshObject } = options;
    const customer = await this.findOne({ email }).exec() as any;
    if (password) {
      if (customer && (await customer.passwordMatches(password))) {
        return { customer, accessToken: customer.token() };
      }
    }
    throw new Error('Incorrect email or password');
  },

  list({ page = 1, perPage = 30, name, email, role }: any) {
    const options: any = {};
    if (name) options.name = name;
    if (email) options.email = email;
    if (role) options.role = role;

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  checkDuplicateEmail(error: any) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new Error('Validation Error: email already exists');
    }
    return error;
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

const UserModel = (mongoose.models.UserModel as IUserModel) || mongoose.model<IUser, IUserModel>('UserModel', UserSchema);
export default UserModel;
