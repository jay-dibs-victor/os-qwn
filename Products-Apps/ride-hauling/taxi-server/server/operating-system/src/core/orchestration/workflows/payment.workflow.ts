/**
 * Payment Processing Workflow
 *
 *   initiatePayment → verifyPayment → confirmPayment / refundPayment → logTransaction
 *
 * Handles retries with exponential backoff. On repeated verify failure, triggers refund.
 */
import { proxyActivities, sleep } from '@temporalio/workflow';
import type { PaymentRequest, PaymentResult, RefundRequest } from '../activities/payment.activities';

const {
  initiatePayment,
  verifyPayment,
  confirmPayment,
  refundPayment,
  logTransaction,
} = proxyActivities<{
  initiatePayment(request: PaymentRequest): Promise<string>;
  verifyPayment(reference: string): Promise<boolean>;
  confirmPayment(request: PaymentRequest): Promise<PaymentResult>;
  refundPayment(request: RefundRequest): Promise<PaymentResult>;
  logTransaction(userId: string, paymentId: string, status: string, amount: number, currency: string): Promise<void>;
}>({
  startToCloseTimeout: '5 minutes',
  retry: {
    maximumAttempts: 4,
    initialInterval: '3s',
    backoffCoefficient: 2,
    maximumInterval: '60s',
  },
});

export async function paymentWorkflow(request: PaymentRequest): Promise<PaymentResult> {
  // Step 1: Initiate
  const transactionRef = await initiatePayment(request);

  // Step 2: Verify with up to 3 polls (payment providers can be async)
  let verified = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    verified = await verifyPayment(transactionRef);
    if (verified) break;
    await sleep('10 seconds');
  }

  // Step 3a: Confirmed
  if (verified) {
    const result = await confirmPayment(request);
    await logTransaction(request.userId, request.paymentId, 'SUCCESS', request.amount, request.currency);
    return result;
  }

  // Step 3b: Could not verify — issue refund if funds were captured
  const refundResult = await refundPayment({
    paymentId: request.paymentId,
    userId:    request.userId,
    amount:    request.amount,
    reason:    'Payment verification failed after 3 attempts',
  });

  await logTransaction(request.userId, request.paymentId, 'REFUNDED', request.amount, request.currency);
  return refundResult;
}
