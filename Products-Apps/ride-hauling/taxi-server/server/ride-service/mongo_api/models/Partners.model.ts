import mongoose, { Document, Schema } from 'mongoose';

export interface IPartner extends Document {
  businessName: string;
  firstName: string;
  lastName: string;
  address: string;
  bankAccount: string;
  bankAccountName: string;
  bankAccountNumber: string;
  status: string;
  email: string;
  password: string;
  phoneNumber: string;
  phone: string;
  passwordResetToken: string;
  passwordResetExpires: Date;
  avatar: string;
  totalCars: number;
  userName: string;
  roles: string;
  isVerified: boolean;
}

const PartnerSchema = new Schema<IPartner>(
  {
    businessName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    bankAccount: { type: String },
    bankAccountName: { type: String },
    bankAccountNumber: { type: String },
    status: {
      type: String,
      enum: ['Active', 'Dormant', 'Disabled', 'Suspended'],
      default: 'Active',
    },
    email: { type: String },
    password: { type: String },
    phoneNumber: { type: String },
    phone: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    avatar: { type: String },
    totalCars: { type: Number, default: 0 },
    userName: { type: String },
    roles: {
      type: String,
      enum: ['Individual Partner', 'Organizational Partner'],
      default: 'Individual Partner',
    },
    isVerified: { type: Boolean, default: false },
  },
  {
    collection: 'partner_collections',
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

PartnerSchema.set('toJSON', { getters: true, virtuals: true });

PartnerSchema.statics = {
  addUser(user: any, callback: Function) {
    return this.create(user, callback);
  },
  get(id: any) {
    return this.findOne(id)
      .exec()
      .then((user: any) => {
        if (user) return user;
        return Promise.reject(new Error('No such user exists!'));
      });
  },
  listUsers({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ created_at: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },
  upsertFbUser(accessToken: string, refreshToken: string, profile: any, cb: Function) {
    const that = this;
    return this.findOne({ 'facebookProvider.id': profile.id }, function(err: any, user: any) {
      if (!user) {
        const newUser = new that({
          fullName: profile.displayName,
          email: profile.emails[0].value,
          facebookProvider: { id: profile.id, token: accessToken },
        });
        newUser.save(function(error: any, savedUser: any) {
          if (error) console.log(error);
          return cb(error, savedUser);
        });
      } else {
        return cb(err, user);
      }
    });
  },
  upsertGoogleUser(accessToken: string, refreshToken: string, profile: any, cb: Function) {
    const that = this;
    return this.findOne({ 'googleProvider.id': profile.id }, function(err: any, user: any) {
      if (!user) {
        const newUser = new that({
          fullName: profile.displayName,
          email: profile.emails[0].value,
          googleProvider: { id: profile.id, token: accessToken },
        });
        newUser.save(function(error: any, savedUser: any) {
          if (error) console.log(error);
          return cb(error, savedUser);
        });
      } else {
        return cb(err, user);
      }
    });
  },
};

export default (mongoose.models.PartnerModel || mongoose.model<IPartner>('PartnerModel', PartnerSchema)) as import("mongoose").Model<any>;
