import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentProvider, InitializeResponse, VerifyResponse } from './provider.interface';

@Injectable()
export class GooglePayProvider implements PaymentProvider {
  private readonly logger = new Logger(GooglePayProvider.name);
  private readonly merchantId: string;
  private readonly paystackSecretKey: string;

  constructor(private configService: ConfigService) {
    this.merchantId = this.configService.get<string>('GOOGLE_PAY_MERCHANT_ID') || '';
    this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
  }

  private isPlaceholder(): boolean {
    return !this.merchantId || this.merchantId.includes('placeholder') || this.merchantId.startsWith('123456');
  }

  async initialize(params: {
    reference: string;
    amount: number;
    email: string;
    planId: string;
    callbackUrl: string;
  }): Promise<InitializeResponse> {
    // Google Pay is initialized client-side.
    // The backend initialize endpoint returns a session configuration to the frontend.
    return {
      reference: params.reference,
      extraData: {
        merchantId: this.merchantId,
        merchantName: this.configService.get<string>('GOOGLE_PAY_MERCHANT_NAME') || 'Taxi Booking Inc',
        gateway: 'paystack',
        gatewayMerchantId: this.merchantId,
      },
    };
  }

  async processToken(params: {
    reference: string;
    amount: number;
    email: string;
    planId: string;
    paymentToken: string; // Base64 encoded Google Pay token containing encrypted card details
  }): Promise<VerifyResponse> {
    if (this.isPlaceholder()) {
      this.logger.warn('Google Pay: Simulating Google Pay payment token charge.');
      return {
        reference: params.reference,
        status: 'SUCCESS',
        rawResponse: {
          status: 'success',
          message: 'Simulated charge for Google Pay token successful',
          data: { reference: params.reference },
        },
      };
    }

    try {
      // In a real-world integration, instead of manual decryption (which is cryptographically heavy),
      // we submit the encrypted Google Pay token to a payment gateway (e.g. Paystack) to charge the card:
      // Paystack Google Pay integration: POST https://api.paystack.co/payment/charge
      const response = await axios.post(
        'https://api.paystack.co/charge',
        {
          email: params.email,
          amount: Math.round(params.amount * 100),
          reference: params.reference,
          google_pay: {
            token: params.paymentToken,
          },
          metadata: { planId: params.planId },
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const status = response.data?.data?.status; // success, failed, pending
      let finalStatus: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (status === 'success') finalStatus = 'SUCCESS';
      else if (status === 'failed') finalStatus = 'FAILED';

      return {
        reference: params.reference,
        status: finalStatus,
        rawResponse: response.data,
      };
    } catch (error: any) {
      this.logger.error(`Google Pay token charge failed via Gateway: ${error.message}`);
      return {
        reference: params.reference,
        status: 'FAILED',
        rawResponse: error.response?.data || { error: error.message },
      };
    }
  }

  async verify(reference: string): Promise<VerifyResponse> {
    // Typically verified through the gateway transaction verify API.
    if (this.isPlaceholder()) {
      return {
        reference,
        status: 'SUCCESS',
        rawResponse: { status: 'success', reference },
      };
    }

    try {
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      });

      const status = response.data?.data?.status;
      let finalStatus: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (status === 'success') finalStatus = 'SUCCESS';
      else if (status === 'failed') finalStatus = 'FAILED';

      return {
        reference,
        status: finalStatus,
        rawResponse: response.data,
      };
    } catch (error: any) {
      this.logger.error(`Google Pay verification failed: ${error.message}`);
      return {
        reference,
        status: 'FAILED',
        rawResponse: error.response?.data || { error: error.message },
      };
    }
  }
}
