import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  id: number;
  user_id: string;
  username: string;
  email: string;
  phone_number: string;
  category: string;
  location: string;
  comment: string;
  images: any[];
  ticket_id: string;
  subject: string;
  createdDate: string;
  response: string;
  assigned_to: string;
  status: string;
  _user?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    id: { type: Number },
    user_id: { type: String },
    username: { type: String },
    email: { type: String },
    phone_number: { type: String },
    category: {
      type: String,
      enum: ['General Enquiries', 'Technical Support', 'Feedback'],
      default: 'General Enquiries',
    },
    location: { type: String },
    _user: { type: Schema.Types.ObjectId, ref: 'UserModel' },
    comment: { type: String },
    images: [],
    ticket_id: { type: String },
    subject: { type: String },
    createdDate: { type: String },
    response: { type: String },
    assigned_to: { type: String },
    status: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    collection: 'intervention_collections',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

FeedbackSchema.statics = {
  get(id: any) {
    return this.findOne(id)
      .exec()
      .then((user: any) => {
        if (user) return user;
        return Promise.reject(new Error('No such user exists!'));
      });
  },
  getAllInterventions(callback: Function, limit: number) {
    return this.find(callback).limit(limit);
  },
  getInterventionById(id: any, callback: Function) {
    return this.findOne(id, callback);
  },
  addIntervention(intervention: any, callback: Function) {
    return this.create(intervention, callback);
  },
  updateInterventionLocation(id: any, intervention: any, options: any, callback: Function) {
    return this.findOneAndUpdate({ _id: id }, { location: intervention.location }, options, callback as any);
  },
  updateInterventionComment(id: any, intervention: any, options: any, callback: Function) {
    return this.findOneAndUpdate({ _id: id }, { comment: intervention.comment }, options, callback as any);
  },
  updateInterventionStatus(id: any, intervention: any, options: any, callback: Function) {
    return this.findOneAndUpdate({ _id: id }, { status: intervention.status }, options, callback as any);
  },
  removeIntervention(id: any, callback: Function) {
    return this.deleteOne({ _id: id }, callback as any);
  },
};

export default (mongoose.models.FeedbackModel || mongoose.model<IFeedback>('FeedbackModel', FeedbackSchema)) as import("mongoose").Model<any>;
