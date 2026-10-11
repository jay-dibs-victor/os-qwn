import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISOS extends Document {
  id: number;
  user_id: string;
  username: string;
  email: string;
  phone_number: string;
  plate_number: string;
  location: string;
  address: string;
  media: any[];
  status: string;
  _user?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const SOSSchema = new Schema<ISOS>(
  {
    id: { type: Number },
    user_id: { type: String },
    username: { type: String },
    email: { type: String },
    phone_number: { type: String },
    plate_number: { type: String },
    location: { type: String },
    _user: { type: Schema.Types.ObjectId, ref: 'UserModel' },
    address: { type: String },
    media: [],
    status: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'soss_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

SOSSchema.statics = {
  get(id: any) {
    return this.findOne(id)
      .exec()
      .then((user: any) => {
        if (user) return user;
        return Promise.reject(new Error('No such user exists!'));
      });
  },
  getAllRedflags(callback: Function, limit: number) {
    return this.find(callback).limit(limit);
  },
  getRedflagById(id: any, callback: Function) {
    return this.findOne(id, callback);
  },
  addRedflag(intervention: any, callback: Function) {
    return this.create(intervention, callback);
  },
  updateRedflagLocation(id: any, intervention: any, options: any, callback: Function) {
    return this.findOneAndUpdate({ _id: id }, { location: intervention.location }, options, callback as any);
  },
  updateRedflagComment(id: any, intervention: any, options: any, callback: Function) {
    return this.findOneAndUpdate({ _id: id }, { comment: intervention.comment }, options, callback as any);
  },
  updateRedflagStatus(id: any, intervention: any, options: any, callback: Function) {
    return this.findOneAndUpdate({ _id: id }, { status: intervention.status }, options, callback as any);
  },
  removeRedflag(id: any, callback: Function) {
    return this.deleteOne({ _id: id }, callback as any);
  },
};

export default (mongoose.models.SOSModel || mongoose.model<ISOS>('SOSModel', SOSSchema)) as import("mongoose").Model<any>;
