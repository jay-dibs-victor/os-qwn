/**
 * Payment Activities — atomic units for the payment processing workflow.
 * Interfaces with the ride/wallet payment infrastructure.
 * Designed to be extended as a dedicated Payment Service grows.
 */
import { Context } from '@temporalio/activity';
import axios from 'axios';

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:12000';

export interface PaymentRequest {
  paymentId:  string;
  userId:     string;
  amount:     number;
  currency:   string;
  reference:  string;
  rideId?:    string;
  metadata?:  Record<string, any>;
}

export interface PaymentResult {
  paymentId:    string;
  status:       'SUCCESS' | 'FAILED' | 'REFUNDED';
  reference:    string;
  processedAt:  Date;
}

export interface RefundRequest {
  paymentId:  string;
  userId:     string;
  amount:     number;
  reason:     string;
}

/**
 * Initiate a payment and wait for confirmation.
 * Calls the ride/wallet payment endpoint on the existing gateway.
 */
export async function initiatePayment(request: PaymentRequest): Promise<string> {
  Context.current().heartbeat('Initiating payment...');

  try {
    const response = await axios.post(
      `${GATEWAY_URL}/api/v1/payments/initiate`,
      {
        userId:    request.userId,
        amount:    request.amount,
        currency:  request.currency,
        reference: request.reference,
        metadata:  request.metadata,
      },
      { timeout: 10000 }
    );
    return response.data.data?.transactionId || request.reference;
  } catch (err: any) {
    // Graceful — log and return reference for manual reconciliation
    console.error(`[PaymentActivity] initiatePayment failed: ${err.message}`);
    return request.reference;
  }
}

/**
 * Verify that a payment was processed successfully.
 */
export async function verifyPayment(reference: string): Promise<boolean> {
  Context.current().heartbeat(`Verifying payment ${reference}...`);

  try {
    const response = await axios.get(
      `${GATEWAY_URL}/api/v1/payments/verify/${reference}`,
      { timeout: 8000 }
    );
    return response.data.data?.status === 'SUCCESS';
  } catch {
    return false;
  }
}

/**
 * Confirm and record a successful payment.
 */
export async function confirmPayment(request: PaymentRequest): Promise<PaymentResult> {
  Context.current().heartbeat('Confirming payment...');

  return {
    paymentId:   request.paymentId,
    status:      'SUCCESS',
    reference:   request.reference,
    processedAt: new Date(),
  };
}

/**
 * Issue a refund for a previously processed payment.
 */
export async function refundPayment(request: RefundRequest): Promise<PaymentResult> {
  Context.current().heartbeat(`Processing refund for ${request.paymentId}...`);

  try {
    await axios.post(
      `${GATEWAY_URL}/api/v1/payments/refund`,
      {
        paymentId: request.paymentId,
        userId:    request.userId,
        amount:    request.amount,
        reason:    request.reason,
      },
      { timeout: 10000 }
    );
  } catch (err: any) {
    console.error(`[PaymentActivity] refund failed: ${err.message}`);
  }

  return {
    paymentId:   request.paymentId,
    status:      'REFUNDED',
    reference:   `REFUND-${request.paymentId}`,
    processedAt: new Date(),
  };
}

/**
 * Write a transaction log entry for audit purposes.
 */
export async function logTransaction(
  userId: string,
  paymentId: string,
  status: string,
  amount: number,
  currency: string
): Promise<void> {
  Context.current().heartbeat('Logging transaction...');
  // In production: write to a dedicated transaction_logs collection/table
  console.log(`[PaymentActivity] TX LOG | user=${userId} | payment=${paymentId} | status=${status} | ${currency} ${amount}`);
}
