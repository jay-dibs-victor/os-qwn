import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRetrieval extends Document {
  id: number;
  status: string;
  date_created: string;
  retrievalComments: string;
  vehiclePlateNo: string;
  vehicleName: string;
  vehicleID: string;
  vehicle: string;
  partner: string;
  partnerID: string;
  partnerName: string;
  partnerEmail: string;
  retrievalDate: string;
  hasBeenRevoked: boolean;
}

const RetrievalSchema: Schema = new Schema({
  id: { type: Number },
  status: { type: String },
  date_created: { type: String },
  retrievalComments: { type: String },
  vehiclePlateNo: { type: String },
  vehicleName: { type: String },
  vehicleID: { type: String },
  vehicle: { type: String },
  partner: { type: String },
  partnerID: { type: String },
  partnerName: { type: String },
  partnerEmail: { type: String },
  retrievalDate: { type: String },
  hasBeenRevoked: { type: Boolean },
});

const RetrievalModel: Model<IRetrieval> = mongoose.models.Retrieval || mongoose.model<IRetrieval>('Retrieval', RetrievalSchema);
export default RetrievalModel;
