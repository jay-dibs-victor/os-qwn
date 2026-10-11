import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentProvider, InitializeResponse, VerifyResponse } from './provider.interface';

/**
 * OPayProvider
 *
 * Official API docs: https://documentation.opaycheckout.com/
 *
 * Create Cashier order:
 *   POST https://api.opaycheckout.com/api/v1/international/cashier/create
 *   Headers:
 *     Authorization: Bearer {HMAC-SHA512 of sorted JSON body using secretKey}
 *     MerchantId: {merchantId}
 *     Content-Type: application/json
 *   Body: { reference, amount: { total, currency }, product, callbackUrl, returnUrl }
 *   → returns { data: { cashierUrl } }
 *
 * Check order status:
 *   POST https://api.opaycheckout.com/api/v1/international/cashier/status
 *   Same headers but body: { reference, country }
 *   → returns { data: { status: 'SUCCESSFUL' | 'FAILED' | 'PENDING' } }
 *
 * Signature: HMAC-SHA512 of alphabetically sorted JSON string using secretKey.
 * The JSON keys must be sorted alphabetically before hashing.
 *
 * Staging base URL: https://sandboxapi.opaycheckout.com
 */
@Injectable()
export class OPayProvider implements PaymentProvider {
  private readonly logger = new Logger(OPayProvider.name);
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get<string>('OPAY_MERCHANT_ID') || '';
    this.secretKey = this.configService.get<string>('OPAY_SECRET_KEY') || 'opay_test_key';
    // Use sandbox URL for testing, switch to https://api.opaycheckout.com for production
    this.baseUrl = this.configService.get<string>('OPAY_API_URL') || 'https://sandboxapi.opaycheckout.com';
  }

  private isPlaceholder(): boolean {
    return !this.secretKey || this.secretKey.includes('placeholder') || this.secretKey.startsWith('OPAYSEC12345');
  }

  /**
   * OPay requires the request body JSON keys to be sorted alphabetically
   * before computing the HMAC-SHA512 signature.
   */
  private sortObjectKeysAlphabetically(obj: Record<string, any>): Record<string, any> {
    return Object.keys(obj)
      .sort()
      .reduce((sorted: Record<string, any>, key) => {
        sorted[key] = obj[key];
        return sorted;
      }, {});
  }

  private calculateSignature(sortedBody: Record<string, any>): string {
    const sortedJsonString = JSON.stringify(sortedBody);
    return crypto
      .createHmac('sha512', this.secretKey)
      .update(sortedJsonString)
      .digest('hex');
  }

  async initialize(params: {
    reference: string;
    amount: number;
    email: string;
    planId: string;
    callbackUrl: string;
  }): Promise<InitializeResponse> {
    if (this.isPlaceholder()) {
      this.logger.warn('OPay: Using simulation mode due to placeholder credentials.');
      return {
        reference: params.reference,
        checkoutUrl: `https://opayweb.opay-inc.com/cashier/${params.reference}`,
        extraData: { simulation: true, gateway: 'opay' },
      };
    }

    const body = {
      amount: {
        currency: 'NGN',
        total: String(params.amount),
      },
      callbackUrl: params.callbackUrl,
      country: 'NG',
      product: {
        description: `Taxi Booking Subscription: ${params.planId}`,
        name: params.planId,
      },
      reference: params.reference,
      returnUrl: params.callbackUrl,
      userInfo: {
        userEmail: params.email,
      },
    };

    // Sort keys alphabetically before signature computation
    const sortedBody = this.sortObjectKeysAlphabetically(body);
    const signature = this.calculateSignature(sortedBody);

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/international/cashier/create`,
        sortedBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${signature}`,
            MerchantId: this.merchantId,
          },
        },
      );

      if (response.data?.code !== '00000') {
        throw new Error(response.data?.message || 'OPay cashier creation failed');
      }

      return {
        reference: params.reference,
        checkoutUrl: response.data.data?.cashierUrl,
        extraData: { token: response.data.data?.orderNo },
      };
    } catch (error: any) {
      this.logger.error(`OPay initialization failed: ${error.message}`);
      throw new Error(`OPay error: ${error.response?.data?.message || error.message}`);
    }
  }

  async verify(reference: string): Promise<VerifyResponse> {
    if (this.isPlaceholder()) {
      return {
        reference,
        status: 'SUCCESS',
        rawResponse: { code: '00000', data: { status: 'SUCCESSFUL', reference } },
      };
    }

    const body = {
      country: 'NG',
      reference,
    };

    const sortedBody = this.sortObjectKeysAlphabetically(body);
    const signature = this.calculateSignature(sortedBody);

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/international/cashier/status`,
        sortedBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${signature}`,
            MerchantId: this.merchantId,
          },
        },
      );

      const code = response.data?.code;
      const status = response.data?.data?.status; // SUCCESSFUL, FAILED, PENDING
      let finalStatus: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (code === '00000' && status === 'SUCCESSFUL') finalStatus = 'SUCCESS';
      else if (status === 'FAILED') finalStatus = 'FAILED';

      return {
        reference,
        status: finalStatus,
        rawResponse: response.data,
      };
    } catch (error: any) {
      this.logger.error(`OPay verification failed: ${error.message}`);
      return {
        reference,
        status: 'FAILED',
        rawResponse: error.response?.data || { error: error.message },
      };
    }
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    // OPay webhooks: HMAC SHA512 of sorted JSON body
    try {
      const parsedBody = JSON.parse(body);
      const sortedBody = this.sortObjectKeysAlphabetically(parsedBody);
      const computed = this.calculateSignature(sortedBody);
      return computed === signature;
    } catch {
      return false;
    }
  }
}
