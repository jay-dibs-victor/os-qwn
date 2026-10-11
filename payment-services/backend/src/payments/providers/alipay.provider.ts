import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentProvider, InitializeResponse, VerifyResponse } from './provider.interface';

/**
 * AlipayProvider
 *
 * Uses Alipay+ (Antom) Global Cashier API — the modern cross-border payment API.
 * Official docs: https://docs.alipayplus.com/
 *
 * Cashier Pay (redirect user to hosted Alipay+ payment page):
 *   POST https://open-na.alipayplus.com/aps/api/v1/payments/pay
 *   Headers:
 *     Content-Type: application/json
 *     Client-Id: {ALIPAY_CLIENT_ID}
 *     Request-Time: ISO-8601 timestamp (e.g. 2024-01-15T10:00:00+00:00)
 *     Signature: algorithm=RSA256,keyVersion=1,signature={base64(RSA-SHA256(signatureContent))}
 *   Where signatureContent = "POST {path}\n{Request-Time}\n{Client-Id}\n{sha256hex(requestBody)}"
 *   Body (JSON): { productCode, paymentRequestId, paymentAmount, order, paymentRedirectUrl, paymentNotifyUrl }
 *   → returns { normalUrl } — redirect user to this URL
 *
 * Query Payment:
 *   POST /aps/api/v1/payments/inquiryPayment
 *   Body: { paymentRequestId }
 *   → returns { paymentStatus: 'SUCCESS' | 'PROCESSING' | 'FAIL' | 'CANCELLED' }
 *
 * Region base URLs:
 *   North America: https://open-na.alipayplus.com
 *   Southeast Asia: https://open-sea.alipayplus.com
 *
 * Sandbox: https://open-na-sandbox.alipayplus.com
 */
@Injectable()
export class AlipayProvider implements PaymentProvider {
  private readonly logger = new Logger(AlipayProvider.name);
  private readonly clientId: string;
  private readonly privateKey: string; // RSA private key PEM string (merchant private key)
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('ALIPAY_CLIENT_ID') || '';
    this.privateKey = this.configService.get<string>('ALIPAY_PRIVATE_KEY') || '';
    // Sandbox: https://open-na-sandbox.alipayplus.com
    // Production North America: https://open-na.alipayplus.com
    this.baseUrl = this.configService.get<string>('ALIPAY_API_URL') || 'https://open-na-sandbox.alipayplus.com';
  }

  private isPlaceholder(): boolean {
    return !this.clientId || this.clientId.includes('placeholder') || this.clientId.startsWith('alipay');
  }

  /**
   * Build Alipay+ RSA256 signature header.
   * signatureContent = "POST {path}\n{Request-Time}\n{Client-Id}\n{sha256hex(body)}"
   */
  private buildSignatureHeader(
    method: string,
    path: string,
    requestTime: string,
    body: string,
  ): string {
    const sha256Body = crypto.createHash('sha256').update(body).digest('hex');
    const signatureContent = `${method} ${path}\n${requestTime}\n${this.clientId}\n${sha256Body}`;

    let signature = '';
    try {
      // privateKey should be a valid RSA PEM private key
      const signer = crypto.createSign('RSA-SHA256');
      signer.update(signatureContent);
      signature = signer.sign(this.privateKey, 'base64');
    } catch (e: any) {
      this.logger.error('Alipay RSA signing failed: ' + e.message);
      throw new Error('Alipay: RSA signing error. Check ALIPAY_PRIVATE_KEY format (must be PEM).');
    }

    return `algorithm=RSA256,keyVersion=1,signature=${signature}`;
  }

  private buildRequestHeaders(path: string, body: string): Record<string, string> {
    const requestTime = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
    return {
      'Content-Type': 'application/json',
      'Client-Id': this.clientId,
      'Request-Time': requestTime,
      Signature: this.buildSignatureHeader('POST', path, requestTime, body),
    };
  }

  async initialize(params: {
    reference: string;
    amount: number;
    email: string;
    planId: string;
    callbackUrl: string;
  }): Promise<InitializeResponse> {
    if (this.isPlaceholder()) {
      this.logger.warn('Alipay+: Using simulation mode due to placeholder credentials.');
      return {
        reference: params.reference,
        checkoutUrl: `https://open-na-sandbox.alipayplus.com/pay/simulate/${params.reference}`,
        extraData: {
          simulation: true,
          gateway: 'alipay',
          // In production the QR code content is a URL pointing to the Alipay+ hosted page
          qrCodeContent: `https://alipay-mock-qr/${params.reference}`,
        },
      };
    }

    const path = '/aps/api/v1/payments/pay';
    const requestBody = {
      productCode: 'CASHIER_PAYMENT',
      paymentRequestId: params.reference,
      paymentAmount: {
        currency: 'USD',
        value: String(Math.round(params.amount * 100)), // Minor unit (cents)
      },
      order: {
        referenceOrderId: params.reference,
        orderDescription: `Taxi Booking Subscription: ${params.planId}`,
        orderAmount: {
          currency: 'USD',
          value: String(Math.round(params.amount * 100)),
        },
        merchant: {
          referenceMerchantId: this.clientId,
        },
        goods: [
          {
            referenceGoodsId: params.planId,
            goodsName: `${params.planId} Subscription Plan`,
            goodsCategory: 'SERVICES',
            goodsUnitAmount: {
              currency: 'USD',
              value: String(Math.round(params.amount * 100)),
            },
            goodsQuantity: '1',
          },
        ],
        buyer: {
          referenceBuyerId: params.email,
        },
      },
      paymentRedirectUrl: params.callbackUrl,
      paymentNotifyUrl: params.callbackUrl,
    };

    const bodyString = JSON.stringify(requestBody);
    const headers = this.buildRequestHeaders(path, bodyString);

    try {
      const response = await axios.post(`${this.baseUrl}${path}`, requestBody, { headers });

      const result = response.data?.result;
      if (result?.resultCode !== 'SUCCESS') {
        throw new Error(`Alipay+ error: ${result?.resultMessage}`);
      }

      return {
        reference: params.reference,
        checkoutUrl: response.data.normalUrl || response.data.schemeUrl,
        extraData: {
          paymentId: response.data.paymentId,
          qrCodeContent: response.data.qrCode?.codeContent,
        },
      };
    } catch (error: any) {
      this.logger.error(`Alipay+ initialization failed: ${error.message}`);
      throw new Error(`Alipay+ error: ${error.response?.data?.result?.resultMessage || error.message}`);
    }
  }

  async verify(reference: string): Promise<VerifyResponse> {
    if (this.isPlaceholder()) {
      return {
        reference,
        status: 'SUCCESS',
        rawResponse: { result: { resultCode: 'SUCCESS' }, paymentStatus: 'SUCCESS', paymentRequestId: reference },
      };
    }

    const path = '/aps/api/v1/payments/inquiryPayment';
    const requestBody = { paymentRequestId: reference };
    const bodyString = JSON.stringify(requestBody);
    const headers = this.buildRequestHeaders(path, bodyString);

    try {
      const response = await axios.post(`${this.baseUrl}${path}`, requestBody, { headers });

      const paymentStatus = response.data?.paymentStatus; // SUCCESS, PROCESSING, FAIL, CANCELLED
      let finalStatus: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (paymentStatus === 'SUCCESS') finalStatus = 'SUCCESS';
      else if (paymentStatus === 'FAIL' || paymentStatus === 'CANCELLED') finalStatus = 'FAILED';

      return {
        reference,
        status: finalStatus,
        rawResponse: response.data,
      };
    } catch (error: any) {
      this.logger.error(`Alipay+ verification failed: ${error.message}`);
      return {
        reference,
        status: 'FAILED',
        rawResponse: error.response?.data || { error: error.message },
      };
    }
  }

  /**
   * Verify Alipay+ webhook signature.
   * Alipay+ uses RSA256: verify signature header using Alipay's public key.
   * Header format: "algorithm=RSA256,keyVersion=1,signature={base64sig}"
   */
  verifyWebhookSignature(body: string, signatureHeader: string): boolean {
    if (!signatureHeader) return false;

    const alipayPublicKey = this.configService.get<string>('ALIPAY_PUBLIC_KEY') || '';
    if (!alipayPublicKey || alipayPublicKey.includes('placeholder')) {
      try {
        const signatureMatch = signatureHeader.match(/signature=([^,]+)$/);
        if (!signatureMatch) return false;
        const signature = signatureMatch[1];
        const expected = crypto
          .createHmac('sha256', 'alipay_test_key')
          .update(body)
          .digest('base64');
        return expected === signature;
      } catch {
        return false;
      }
    }

    try {
      const signatureMatch = signatureHeader.match(/signature=([^,]+)$/);
      if (!signatureMatch) return false;
      const signature = signatureMatch[1];

      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(body);
      return verifier.verify(alipayPublicKey, signature, 'base64');
    } catch {
      return false;
    }
  }
}
