import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentProvider, InitializeResponse, VerifyResponse } from './provider.interface';

/**
 * KudaProvider
 *
 * Official docs: https://docs.kuda.com
 *
 * Kuda uses a SINGLE POST endpoint for all operations.
 * The action is determined by the `serviceType` field in the request body.
 *
 * Auth (get access token):
 *   POST https://kuda-openapi.kuda.com/v2.1  (same single endpoint)
 *   Body: { serviceType: "ADMIN_CREATE_VIRTUAL_ACCOUNT", requestRef: "...", data: { email, apiKey } }
 *   → Actually token is obtained via:
 *   POST /Account/GetToken
 *   Body: { email, apiKey }
 *   → returns { data: { token } }
 *
 * Initiate Pay With Transfer (generate a virtual account for payment):
 *   POST same endpoint
 *   serviceType: "PAY_WITH_TRANSFER"
 *   data: { trackingReference, amount }
 *   → returns { data: { accountNumber, accountName, bankName, expiryDate } }
 *
 * Retrieve Single Transaction:
 *   serviceType: "RETRIEVE_SINGLE_TRANSACTION"
 *   data: { requestRef (=trackingReference used at creation) }
 *   → returns { data: { status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' } }
 *
 * Staging: https://kuda-openapi-uat.kudabank.com/v2.1
 * Production: https://kuda-openapi.kuda.com/v2.1
 */
@Injectable()
export class KudaProvider implements PaymentProvider {
  private readonly logger = new Logger(KudaProvider.name);
  private readonly apiKey: string;
  private readonly email: string;
  private readonly baseUrl: string;
  private readonly tokenUrl: string;

  constructor(private configService: ConfigService) {
    this.email = this.configService.get<string>('KUDA_EMAIL') || '';
    this.apiKey = this.configService.get<string>('KUDA_API_KEY') || 'kuda_test_key';
    // UAT: https://kuda-openapi-uat.kudabank.com | Production: https://kuda-openapi.kuda.com
    this.baseUrl = this.configService.get<string>('KUDA_API_URL') || 'https://kuda-openapi-uat.kudabank.com/v2.1';
    this.tokenUrl = this.baseUrl.replace('/v2.1', '') + '/Account/GetToken';
  }

  private isPlaceholder(): boolean {
    return !this.apiKey || this.apiKey.includes('placeholder') || this.apiKey.startsWith('mk_test');
  }

  private async getAccessToken(): Promise<string> {
    const response = await axios.post(
      this.tokenUrl,
      {
        email: this.email,
        apiKey: this.apiKey,
      },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const token = response.data?.data?.token;
    if (!token) {
      throw new Error('Kuda: Failed to obtain access token');
    }
    return token;
  }

  async initialize(params: {
    reference: string;
    amount: number;
    email: string;
    planId: string;
    callbackUrl: string;
  }): Promise<InitializeResponse> {
    if (this.isPlaceholder()) {
      this.logger.warn('Kuda: Using simulation mode due to placeholder credentials.');
      return {
        reference: params.reference,
        extraData: {
          simulation: true,
          gateway: 'kuda',
          kudaAccountNumber: '2019847589',
          kudaAccountName: 'Taxi Booking Subscriptions',
          kudaBankName: 'Kuda Microfinance Bank',
          expiryDate: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
      };
    }

    try {
      const token = await this.getAccessToken();
      // Amount must be in kobo (smallest NGN unit), multiply by 100
      const amountInKobo = Math.round(params.amount * 100);

      const response = await axios.post(
        this.baseUrl,
        {
          serviceType: 'PAY_WITH_TRANSFER',
          requestRef: params.reference,
          data: {
            trackingReference: params.reference,
            amount: amountInKobo,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const responseData = response.data?.data;
      if (!responseData) {
        throw new Error('Kuda: Empty PAY_WITH_TRANSFER response');
      }

      return {
        reference: params.reference,
        extraData: {
          kudaAccountNumber: responseData.accountNumber,
          kudaAccountName: responseData.accountName,
          kudaBankName: responseData.bankName,
          expiryDate: responseData.expiryDate,
        },
      };
    } catch (error: any) {
      this.logger.error(`Kuda initialization failed: ${error.message}`);
      throw new Error(`Kuda error: ${error.response?.data?.message || error.message}`);
    }
  }

  async verify(reference: string): Promise<VerifyResponse> {
    if (this.isPlaceholder()) {
      return {
        reference,
        status: 'SUCCESS',
        rawResponse: { status: 'SUCCESSFUL', trackingReference: reference },
      };
    }

    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        this.baseUrl,
        {
          serviceType: 'RETRIEVE_SINGLE_TRANSACTION',
          requestRef: reference,
          data: {
            requestRef: reference,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const txStatus = response.data?.data?.status; // SUCCESSFUL, PENDING, FAILED
      let finalStatus: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (txStatus === 'SUCCESSFUL') finalStatus = 'SUCCESS';
      else if (txStatus === 'FAILED') finalStatus = 'FAILED';

      return {
        reference,
        status: finalStatus,
        rawResponse: response.data?.data || {},
      };
    } catch (error: any) {
      this.logger.error(`Kuda verification failed: ${error.message}`);
      return {
        reference,
        status: 'FAILED',
        rawResponse: error.response?.data || { error: error.message },
      };
    }
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha256', this.apiKey)
      .update(body)
      .digest('hex');
    return hash === signature;
  }
}
