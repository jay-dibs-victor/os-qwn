/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentRailProvider } from './payment-rail.interface';
import { PaymentInstruction } from '../entities/payment-instruction.entity';

@Injectable()
export class RtgsProvider implements PaymentRailProvider {
  private readonly logger = new Logger(RtgsProvider.name);

  constructor(private readonly configService: ConfigService) {}

  private signPayload(payload: string, privateKey: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(payload);
    sign.end();
    return sign.sign(privateKey, 'base64');
  }

  async dispatch(instruction: PaymentInstruction) {
    this.logger.log(`Dispatching to RTGS: ${instruction.idempotencyKey}`);

    const rtgsUrl = this.configService.get<string>('RTGS_API_URL');
    const privateKey = this.configService.get<string>(
      'RTGS_PRIVATE_KEY',
      'test-key',
    );

    if (!rtgsUrl) {
      this.logger.warn(
        'RTGS_API_URL not configured. Simulating success for local testing.',
      );
      return {
        success: true,
        reference: `RTGS-${Date.now()}-${instruction.id.substring(0, 5)}`,
        rawResponse: { statusCode: '000', message: 'Simulated RTGS success' },
      };
    }

    // RTGS typically uses an XML payload or heavily structured JSON, depending on CBN standards
    const payload = JSON.stringify({
      messageId: `RTGS${Date.now()}`,
      endToEndId: instruction.idempotencyKey,
      settlementAmount: instruction.amount,
      settlementCurrency: instruction.currency,
      creditorAgent: instruction.targetBankCode,
      creditorAccount: instruction.targetAccountId,
      debtorAccount: instruction.sourceAccountId,
      purpose: 'High Value Transfer',
    });

    const signature = this.signPayload(payload, privateKey);

    try {
      const response = await axios.post(`${rtgsUrl}/v1/transfer`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
        },
        timeout: 15000,
      });

      const data = response.data;
      const success = data.statusCode === '000'; // Assume '000' is success for RTGS

      return {
        success,
        reference: data.transactionId || JSON.parse(payload).messageId,
        rawResponse: data,
      };
    } catch (error: any) {
      this.logger.error(`RTGS Dispatch failed: ${error.message}`);
      throw new InternalServerErrorException('RTGS connection failed');
    }
  }

  async checkStatus(reference: string) {
    const rtgsUrl = this.configService.get<string>('RTGS_API_URL');
    if (!rtgsUrl) {
      return {
        status: 'COMPLETED' as const,
        rawResponse: { statusCode: '000' },
      };
    }

    try {
      const response = await axios.get(`${rtgsUrl}/v1/status/${reference}`);
      const data = response.data;

      let status: 'COMPLETED' | 'FAILED' | 'PENDING' = 'PENDING';
      if (data.statusCode === '000') status = 'COMPLETED';
      else if (data.statusCode === '009') status = 'PENDING';
      else status = 'FAILED';

      return {
        status,
        rawResponse: data,
      };
    } catch (error: any) {
      this.logger.error(`RTGS Status Check failed: ${error.message}`);
      throw new InternalServerErrorException('RTGS status check failed');
    }
  }
}
