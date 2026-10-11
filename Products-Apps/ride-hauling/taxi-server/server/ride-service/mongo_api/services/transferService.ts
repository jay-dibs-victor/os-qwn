import { v4 as uuidv4 } from 'uuid';
import Customer from '../models/User.model';
import Transaction from '../models/transaction.model';

export const transfer = async (accountNumber: string, amount: number, destinationAccountNumber: string) => {
  const reference = uuidv4();

  const transaction = new (Transaction as any)();
  transaction.amount = -amount;
  transaction.operation = 'transfer';
  transaction.accountNumber = accountNumber;
  transaction.destinationAccountNumber = destinationAccountNumber;
  transaction.reference = 'transfer_to_account:' + destinationAccountNumber;
  await transaction.save();
  const savedCustomer = await (Customer as any).findOne({ accountNumber: accountNumber });

  const transactionBeneficiary = new (Transaction as any)();
  transactionBeneficiary.amount = amount;
  transactionBeneficiary.operation = 'transfer';
  transactionBeneficiary.accountNumber = destinationAccountNumber;
  transactionBeneficiary.reference = 'transfer_from_account:' + accountNumber;
  await transactionBeneficiary.save();

  const response = {
    transaction: transaction.transform(),
    customer: savedCustomer.transformBalance(),
  };

  return response;
};
