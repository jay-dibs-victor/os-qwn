import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentProvider, InitializeResponse, VerifyResponse } from './provider.interface';

@Injectable()
export class PayPalProvider implements PaymentProvider {
  private readonly logger = new Logger(PayPalProvider.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET') || '';
    this.apiUrl = this.configService.get<string>('PAYPAL_API_URL') || 'https://api-m.sandbox.paypal.com';
  }

  private isPlaceholder(): boolean {
    return !this.clientId || this.clientId.includes('placeholder') || this.clientId.startsWith('AXX');
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await axios.post(
      `${this.apiUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return response.data.access_token;
  }

  async initialize(params: {
    reference: string;
    amount: number;
    email: string;
    planId: string;
    callbackUrl: string;
  }): Promise<InitializeResponse> {
    if (this.isPlaceholder()) {
      this.logger.warn('PayPal: Using simulation mode due to placeholder key.');
      return {
        reference: params.reference,
        checkoutUrl: `https://www.paypal.com/simulate-checkout-${params.reference}`,
        extraData: { simulation: true, gateway: 'paypal', orderId: `PAYPAL-MOCK-ORDER-${params.reference}` },
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.post(
        `${this.apiUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: params.reference,
              amount: {
                currency_code: 'USD', // PayPal doesn't natively support NGN in standard checkouts easily, default to USD
                value: params.amount.toString(),
              },
              description: `Taxi Booking Subscription Plan: ${params.planId}`,
            },
          ],
          application_context: {
            brand_name: 'Taxi Booking Inc',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: params.callbackUrl,
            cancel_url: params.callbackUrl,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const links = response.data.links || [];
      const approveLink = links.find((link: any) => link.rel === 'approve');

      return {
        reference: params.reference,
        checkoutUrl: approveLink ? approveLink.href : undefined,
        extraData: { orderId: response.data.id },
      };
    } catch (error: any) {
      this.logger.error(`PayPal initialization failed: ${error.message}`);
      throw new Error(`PayPal error: ${error.response?.data?.message || error.message}`);
    }
  }

  async verify(reference: string): Promise<VerifyResponse> {
    // PayPal verification requires capturing the order ID first.
    // In this implementation, the reference maps to orderId or transaction reference.
    if (this.isPlaceholder()) {
      return {
        reference,
        status: 'SUCCESS',
        rawResponse: { status: 'COMPLETED', reference },
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      // Since verify might receive either orderId or merchant reference, we'll try to capture if it's orderId
      const orderId = reference.startsWith('PAYPAL-MOCK-ORDER') ? reference : reference;

      const response = await axios.post(
        `${this.apiUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const status = response.data.status; // COMPLETED, APPROVED, etc.
      let finalStatus: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (status === 'COMPLETED') finalStatus = 'SUCCESS';
      else if (status === 'VOIDED') finalStatus = 'FAILED';

      return {
        reference,
        status: finalStatus,
        rawResponse: response.data,
      };
    } catch (error: any) {
      this.logger.error(`PayPal capture/verification failed: ${error.message}`);
      return {
        reference,
        status: 'FAILED',
        rawResponse: error.response?.data || { error: error.message },
      };
    }
  }
}
