import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import moment from 'moment-timezone';
import GatewayTransaction from '../models/gatewayTransaction.model';
import APIError from '../utils/APIError';
import httpStatus from 'http-status';
import Customer from '../models/User.model';
import Transaction from '../models/transaction.model';

async function simulateGatewayCall(card: string, amount: number) {
  let status = 'success';
  if (card === '4242424242424242') {
    status = 'failure';
  }

  const hex = crypto
    .randomBytes(Math.ceil(6 / 2))
    .toString('hex')
    .slice(0, 6);
  const auth_code = parseInt(hex, 16);

  return {
    transactionId: uuidv4(),
    status: status,
    paymentDate: moment(),
    amount: amount,
    authorizationCode: auth_code,
  };
}

export const withdrawal = async (accountNumber: string, card: string, amount: number) => {
  const gatewayResponse = await simulateGatewayCall(card, amount);
  const gatewayTransaction = new (GatewayTransaction as any)(gatewayResponse);
  const savedGatewayTransaction = await gatewayTransaction.save();
  if (savedGatewayTransaction.status === 'failure') {
    throw new APIError({
      message: 'Withdrawal Rejected',
      status: httpStatus.BAD_GATEWAY as number,
    });
  }

  const transaction = new (Transaction as any)();
  transaction.amount = -amount;
  transaction.operation = 'withdrawal';
  transaction.accountNumber = accountNumber;
  transaction.reference = 'withdrawal_gateway_transaction:' + savedGatewayTransaction.transactionId;
  await transaction.save();
  const savedCustomer = await (Customer as any).findOne({ accountNumber: accountNumber });
  const response = {
    transaction: transaction.transform(),
    customer: savedCustomer.transformBalance(),
  };
  return response;
};
