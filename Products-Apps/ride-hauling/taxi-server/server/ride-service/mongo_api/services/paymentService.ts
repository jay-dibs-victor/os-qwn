import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import moment from 'moment-timezone';
import GatewayTransaction from '../models/gatewayTransaction.model';
import APIError from '../utils/APIError';
import httpStatus from 'http-status';
import Customer from '../models/User.model';
import Transaction from '../models/transaction.model';
import { MultiPaymentService } from './multi_payment_service';

async function simulateGatewayCall(card: string, amount: number, metadata: any) {
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

export const debitCard = async (accountNumber: string, card: string, amount: number, metadata: any = {}) => {
  // If card is a special 'gateway' keyword or we want to use the new multi-payment engine
  const gateway = metadata.gateway || 'paystack';
  const email = metadata.email;

  let gatewayResponse;
  
  if (card && card.length > 15) {
     // Legacy simulation or Stripe-like card handling
     gatewayResponse = await simulateGatewayCall(card, amount, metadata);
  } else {
     // Use the new MultiPaymentService
     const initResult = await MultiPaymentService.initiatePayment(gateway, amount, email, metadata);
     gatewayResponse = {
        transactionId: initResult.data?.id || `gtw-${Date.now()}`,
        status: 'success',
        paymentDate: moment(),
        amount: amount,
        authorizationCode: 0,
        gateway_raw: initResult.data
     };
  }

  const gatewayTransaction = new (GatewayTransaction as any)(gatewayResponse);
  const savedGatewayTransaction = await gatewayTransaction.save();
  if (savedGatewayTransaction.status === 'failure') {
    throw new APIError({
      message: 'Payment Rejected',
      status: httpStatus.PAYMENT_REQUIRED as number,
    });
  }

  const transaction = new (Transaction as any)();
  transaction.amount = amount;
  transaction.operation = 'deposit';
  transaction.accountNumber = accountNumber;
  transaction.reference = 'payment_gateway_transaction:' + savedGatewayTransaction.transactionId;
  await transaction.save();
  const savedCustomer = await (Customer as any).findOne({ accountNumber: accountNumber });
  const response = {
    transaction: transaction.transform(),
    customer: savedCustomer.transformBalance(),
  };
  return response;
};
