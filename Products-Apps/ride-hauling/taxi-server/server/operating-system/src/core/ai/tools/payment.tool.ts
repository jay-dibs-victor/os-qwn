/**
 * Payment Tool — allows the AI agent to initiate a payment for a service.
 * Triggers the Temporal payment workflow via the OS workflow endpoint.
 */
import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { OSPublisher } from '../../events/publisher';
import { OSEvent } from '../../events/event.schemas';

const PaymentInputSchema = z.object({
  userId:    z.string().describe('The ID of the user making the payment'),
  amount:    z.number().positive().describe('Payment amount in kobo/cents (smallest currency unit)'),
  currency:  z.string().length(3).default('NGN').describe('ISO 4217 currency code, e.g. NGN, USD'),
  reference: z.string().optional().describe('Optional custom payment reference'),
  rideId:    z.string().optional().describe('Ride ID if this is a ride payment'),
  reason:    z.string().describe('Human readable reason for the payment'),
});

export class InitiatePaymentTool extends StructuredTool {
  name = 'initiate_payment';
  description = `
    Use this tool when the user wants to pay for a service, complete a ride payment,
    top up their wallet, or when a payment needs to be processed.
    Returns a payment ID and status.
  `.trim();

  schema = PaymentInputSchema as any;

  async _call(input: z.infer<typeof PaymentInputSchema>): Promise<string> {
    const paymentId = `PAY-${uuidv4().split('-')[0].toUpperCase()}`;
    const reference = input.reference || paymentId;

    await OSPublisher.publish(OSEvent.PAYMENT_INITIATED, {
      paymentId,
      userId:    input.userId,
      amount:    input.amount,
      currency:  input.currency,
      reference,
      status:    'INITIATED',
      timestamp: new Date(),
    });

    return JSON.stringify({
      success:   true,
      paymentId,
      reference,
      amount:    input.amount,
      currency:  input.currency,
      status:    'INITIATED',
      message:   `Payment of ${input.currency} ${(input.amount / 100).toFixed(2)} initiated. Reference: ${reference}`,
    });
  }
}
