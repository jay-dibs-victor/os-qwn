import mongoose, { Document, Schema } from 'mongoose';

export interface IGatewayTransaction extends Document {
  transactionId: string;
  status: string;
  paymentDate: Date;
  amount: number;
  authorizationCode: number;
}

const gatewayTransactionSchema = new Schema<IGatewayTransaction>(
  {
    transactionId: { type: String, required: true },
    status: { type: String, required: true },
    paymentDate: { type: Date, required: true },
    amount: { type: Number, default: 0, required: true },
    authorizationCode: { type: Number, required: true },
  },
  { timestamps: true },
);

gatewayTransactionSchema.methods.transform = function () {
  const transformed: Record<string, any> = {};
  const fields = ['transactionId', 'status', 'paymentDate', 'amount', 'authorizationCode'];
  fields.forEach(field => {
    transformed[field] = this[field];
  });
  return transformed;
};

export default (mongoose.models.GatewayTransaction || mongoose.model<IGatewayTransaction>('GatewayTransaction', gatewayTransactionSchema)) as import("mongoose").Model<any>;
