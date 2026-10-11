import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentProvider, InitializeResponse, VerifyResponse } from './provider.interface';

@Injectable()
export class StripeProvider implements PaymentProvider {
  private readonly logger = new Logger(StripeProvider.name);
  private readonly secretKey: string;
  private readonly webhookSecret: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || '';
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || 'whsec_test_secret';
  }

  private isPlaceholder(): boolean {
    return !this.secretKey || this.secretKey.includes('placeholder') || this.secretKey.startsWith('sk_test_12345');
  }

  async initialize(params: {
    reference: string;
    amount: number;
    email: string;
    planId: string;
    callbackUrl: string;
  }): Promise<InitializeResponse> {
    const amountInCents = Math.round(params.amount * 100);

    if (this.isPlaceholder()) {
      this.logger.warn('Stripe: Using simulation mode due to placeholder key.');
      return {
        reference: params.reference,
        checkoutUrl: `https://stripe.com/simulate-checkout-${params.reference}`,
        extraData: {
          simulation: true,
          gateway: 'stripe',
          clientSecret: `pi_mock_intent_${params.reference}_secret_xyz123`,
          publishableKey: 'pk_test_mock_stripe_key_abc555',
        },
      };
    }

    try {
      // Use URL encoded form format for Stripe API
      const response = await axios.post(
        'https://api.stripe.com/v1/payment_intents',
        new URLSearchParams({
          amount: amountInCents.toString(),
          currency: 'usd',
          'payment_method_types[]': 'card',
          'metadata[reference]': params.reference,
          'metadata[planId]': params.planId,
          'metadata[email]': params.email,
        }).toString(),
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return {
        reference: params.reference,
        extraData: {
          paymentIntentId: response.data.id,
          clientSecret: response.data.client_secret,
        },
      };
    } catch (error: any) {
      this.logger.error(`Stripe initialization failed: ${error.message}`);
      throw new Error(`Stripe error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async verify(reference: string): Promise<VerifyResponse> {
    if (this.isPlaceholder()) {
      return {
        reference,
        status: 'SUCCESS',
        rawResponse: { status: 'succeeded', id: `pi_mock_${reference}` },
      };
    }

    try {
      // In Stripe, reference corresponds to the payment_intent ID (e.g. pi_3Mxy...)
      const response = await axios.get(`https://api.stripe.com/v1/payment_intents/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const stripeStatus = response.data.status; // succeeded, requires_action, requires_payment_method, canceled
      let finalStatus: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (stripeStatus === 'succeeded') finalStatus = 'SUCCESS';
      else if (stripeStatus === 'canceled') finalStatus = 'FAILED';

      return {
        reference,
        status: finalStatus,
        rawResponse: response.data,
      };
    } catch (error: any) {
      this.logger.error(`Stripe verification failed: ${error.message}`);
      return {
        reference,
        status: 'FAILED',
        rawResponse: error.response?.data || { error: error.message },
      };
    }
  }

  verifyWebhookSignature(body: string, signatureHeader: string): boolean {

    if (!signatureHeader || !this.webhookSecret) return false;

    try {
      // Stripe header format: t=1672531199,v1=92a3f...,v0=...
      const parts = signatureHeader.split(',');
      const timestampPart = parts.find((p) => p.startsWith('t='));
      const signaturePart = parts.find((p) => p.startsWith('v1='));

      if (!timestampPart || !signaturePart) return false;

      const timestamp = timestampPart.split('=')[1];
      const signature = signaturePart.split('=')[1];

      // Sign the payload: timestamp + '.' + body
      const signedPayload = `${timestamp}.${body}`;
      const computedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(signedPayload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(computedSignature),
        Buffer.from(signature)
      );
    } catch {
      return false;
    }
  }
}
