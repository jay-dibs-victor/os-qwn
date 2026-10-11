import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentProvider, InitializeResponse, VerifyResponse } from './provider.interface';

/**
 * MoniepointProvider
 *
 * Moniepoint's merchant payment gateway for online checkout is branded as Monnify.
 * Official API docs: https://developers.monnify.com/api/
 *
 * Auth flow:
 *   POST /api/v1/auth/login
 *   Authorization: Basic base64(apiKey:secretKey)
 *   → returns { responseBody: { accessToken } }
 *
 * Initialize transaction:
 *   POST /api/v1/merchant/transactions/init-transaction
 *   Authorization: Bearer {accessToken}
 *   Body: { amount, customerName, customerEmail, paymentReference, paymentDescription, currencyCode, contractCode, redirectUrl, paymentMethods }
 *   → returns { responseBody: { checkoutUrl } }
 *
 * Verify transaction:
 *   GET /api/v2/transactions/{paymentReference}
 *   Authorization: Bearer {accessToken}
 *   → returns { responseBody: { paymentStatus: 'PAID' | 'PENDING' | 'FAILED' } }
 */
@Injectable()
export class MoniepointProvider implements PaymentProvider {
  private readonly logger = new Logger(MoniepointProvider.name);
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly contractCode: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('MONIEPOINT_API_KEY') || '';
    this.secretKey = this.configService.get<string>('MONIEPOINT_SECRET_KEY') || 'moniepoint_test_key';
    this.contractCode = this.configService.get<string>('MONIEPOINT_CONTRACT_CODE') || '';
    // Sandbox: https://sandbox.monnify.com | Production: https://api.monnify.com
    this.baseUrl = this.configService.get<string>('MONIEPOINT_API_URL') || 'https://sandbox.monnify.com';
  }

  private isPlaceholder(): boolean {
    return !this.apiKey || this.apiKey.includes('placeholder') || this.apiKey.startsWith('mk_test_12345');
  }

  private async getAccessToken(): Promise<string> {
    // Basic auth: base64(apiKey:secretKey)
    const credentials = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');
    const response = await axios.post(
      `${this.baseUrl}/api/v1/auth/login`,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (!response.data?.requestSuccessful) {
      throw new Error(`Monnify auth failed: ${response.data?.responseMessage}`);
    }
    return response.data.responseBody.accessToken;
  }

  async initialize(params: {
    reference: string;
    amount: number;
    email: string;
    planId: string;
    callbackUrl: string;
  }): Promise<InitializeResponse> {
    if (this.isPlaceholder()) {
      this.logger.warn('Moniepoint/Monnify: Using simulation mode due to placeholder credentials.');
      return {
        reference: params.reference,
        checkoutUrl: `https://sandbox.monnify.com/checkout/${params.reference}`,
        extraData: {
          simulation: true,
          gateway: 'monnify',
          bankAccount: '9065432109',
          bankName: 'Monnify Test Bank',
          accountName: 'Taxi Booking Test Merchant',
        },
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.post(
        `${this.baseUrl}/api/v1/merchant/transactions/init-transaction`,
        {
          amount: params.amount,
          customerName: params.email.split('@')[0],
          customerEmail: params.email,
          paymentReference: params.reference,
          paymentDescription: `Taxi Booking Subscription: ${params.planId}`,
          currencyCode: 'NGN',
          contractCode: this.contractCode,
          redirectUrl: params.callbackUrl,
          paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data?.requestSuccessful) {
        throw new Error(response.data?.responseMessage || 'Transaction initialization failed');
      }

      return {
        reference: params.reference,
        checkoutUrl: response.data.responseBody.checkoutUrl,
        extraData: {
          transactionReference: response.data.responseBody.transactionReference,
        },
      };
    } catch (error: any) {
      this.logger.error(`Monnify initialization failed: ${error.message}`);
      throw new Error(`Monnify error: ${error.response?.data?.responseMessage || error.message}`);
    }
  }

  async verify(reference: string): Promise<VerifyResponse> {
    if (this.isPlaceholder()) {
      return {
        reference,
        status: 'SUCCESS',
        rawResponse: { paymentStatus: 'PAID', paymentReference: reference },
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      // Encode the reference for the URL as it may contain special characters
      const encodedRef = encodeURIComponent(reference);
      const response = await axios.get(
        `${this.baseUrl}/api/v2/transactions/${encodedRef}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.data?.requestSuccessful) {
        return { reference, status: 'FAILED', rawResponse: response.data };
      }

      const paymentStatus = response.data.responseBody.paymentStatus;
      let finalStatus: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (paymentStatus === 'PAID') finalStatus = 'SUCCESS';
      else if (paymentStatus === 'FAILED' || paymentStatus === 'OVERPAID' === false) finalStatus = 'FAILED';

      return {
        reference,
        status: finalStatus,
        rawResponse: response.data.responseBody,
      };
    } catch (error: any) {
      this.logger.error(`Monnify verification failed: ${error.message}`);
      return {
        reference,
        status: 'FAILED',
        rawResponse: error.response?.data || { error: error.message },
      };
    }
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    // Monnify uses HMAC SHA512 of the raw body with the secretKey
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(body)
      .digest('hex');
    return hash === signature;
  }
}
