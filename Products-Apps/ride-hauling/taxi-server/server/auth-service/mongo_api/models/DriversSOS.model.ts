import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriversSOS extends Document {
  id: number;
  user_id: string;
  username: string;
  email: string;
  phone_number: string;
  plate_number: string;
  location: string;
  _user: mongoose.Types.ObjectId;
  address: string;
  media: string[];
  status: string;
  created_at: Date;
  updated_at: Date;
}

interface IDriversSOSModel extends Model<IDriversSOS> {
  get(id: any): Promise<IDriversSOS>;
  getAllRedflags(callback: any, limit: number): any;
  getRedflagById(id: any, callback: any): any;
  addRedflag(intervention: any, callback: any): any;
  updateRedflagLocation(id: any, intervention: any, options: any, callback: any): any;
  updateRedflagComment(id: any, intervention: any, options: any, callback: any): any;
  updateRedflagStatus(id: any, intervention: any, options: any, callback: any): any;
  removeRedflag(id: any, callback: any): any;
}

const DriversSOSSchema: Schema = new Schema(
  {
    id: {
      type: Number,
    },
    user_id: {
      type: String,
    },

    username: {
      type: String,
    },
    email: {
      type: String,
    },
    phone_number: {
      type: String,
    },

    plate_number: {
      type: String,
    },

    location: {
      type: String,
    },
    _user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserModel',
    },
    address: {
      type: String,
    },
    media: {
      type: Array,
    },
    status: String,
  },
  {
    collection: 'DRVSOSs_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

DriversSOSSchema.statics = {
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

  getAllRedflags(callback: any, limit: number) {
    return this.find(callback).limit(limit);
  },

  getRedflagById(id: any, callback: any) {
    return this.findOne(id, callback);
  },

  addRedflag(intervention: any, callback: any) {
    return this.create(intervention, callback);
  },

  updateRedflagLocation(id: any, intervention: any, options: any, callback: any) {
    var query = { _id: id };
    var update = {
      location: intervention.location,
    };
    return this.findOneAndUpdate(query, update, options, callback);
  },

  updateRedflagComment(id: any, intervention: any, options: any, callback: any) {
    var query = { _id: id };
    var update = {
      comment: intervention.comment,
    };
    return this.findOneAndUpdate(query, update, options, callback);
  },

  updateRedflagStatus(id: any, intervention: any, options: any, callback: any) {
    var query = { _id: id };
    var update = {
      status: intervention.status,
    };
    return this.findOneAndUpdate(query, update, options, callback);
  },

  removeRedflag(id: any, callback: any) {
    var query = { _id: id };
    return this.remove(query, callback);
  },
};

export default (mongoose.models.DriversSOSModel || mongoose.model<IDriversSOS, IDriversSOSModel>('DriversSOSModel', DriversSOSSchema)) as import("mongoose").Model<any>;
