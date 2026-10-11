import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentProvider, InitializeResponse, VerifyResponse } from './provider.interface';

@Injectable()
export class PaystackProvider implements PaymentProvider {
  private readonly logger = new Logger(PaystackProvider.name);
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || 'sk_test_placeholder';
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
    const amountInKobo = Math.round(params.amount * 100);

    if (this.isPlaceholder()) {
      this.logger.warn('Paystack: Using simulation mode due to placeholder key.');
      return {
        reference: params.reference,
        checkoutUrl: `https://checkout.paystack.com/simulate-checkout-${params.reference}`,
        extraData: { simulation: true, gateway: 'paystack' },
      };
    }

    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: params.email,
          amount: amountInKobo,
          reference: params.reference,
          callback_url: params.callbackUrl,
          metadata: { planId: params.planId },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data?.status) {
        return {
          reference: params.reference,
          checkoutUrl: response.data.data.authorization_url,
          extraData: { accessCode: response.data.data.access_code },
        };
      }
      throw new Error(response.data?.message || 'Initialization failed');
    } catch (error: any) {
      this.logger.error(`Paystack initialization failed: ${error.message}`, error.stack);
      throw new Error(`Paystack error: ${error.response?.data?.message || error.message}`);
    }
  }

  async verify(reference: string): Promise<VerifyResponse> {
    if (this.isPlaceholder()) {
      this.logger.warn('Paystack: Using simulation mode verification.');
      return {
        reference,
        status: 'SUCCESS',
        rawResponse: { status: true, message: 'Simulation successful', data: { status: 'success', reference } },
      };
    }

    try {
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      if (response.data?.status) {
        const paystackStatus = response.data.data.status;
        let finalStatus: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
        if (paystackStatus === 'success') finalStatus = 'SUCCESS';
        else if (paystackStatus === 'failed') finalStatus = 'FAILED';

        return {
          reference,
          status: finalStatus,
          rawResponse: response.data,
        };
      }
      return {
        reference,
        status: 'FAILED',
        rawResponse: response.data,
      };
    } catch (error: any) {
      this.logger.error(`Paystack verification failed: ${error.message}`);
      return {
        reference,
        status: 'FAILED',
        rawResponse: error.response?.data || { error: error.message },
      };
    }
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(body)
      .digest('hex');
    return hash === signature;
  }
}
