import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  amount: number;
  operation: string;
  accountNumber: string;
  reference: string;
  transform(): any;
}

const transactionSchema = new Schema<ITransaction>(
  {
    amount: { type: Number, required: true },
    operation: { type: String, required: true },
    accountNumber: { type: String, required: true },
    reference: { type: String, required: true },
  },
  { timestamps: true },
);

transactionSchema.methods.transform = function () {
  const transformed: Record<string, any> = {};
  const fields = ['amount', 'operation', 'accountNumber', 'reference'];
  fields.forEach(field => {
    transformed[field] = this[field];
  });
  return transformed;
};

export default (mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema)) as import("mongoose").Model<any>;
