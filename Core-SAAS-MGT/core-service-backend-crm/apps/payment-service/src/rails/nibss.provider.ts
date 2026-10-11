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
export class NibssProvider implements PaymentRailProvider {
  private readonly logger = new Logger(NibssProvider.name);

  constructor(private readonly configService: ConfigService) {}

  private generateMac(payload: any, secret: string): string {
    const data = JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  async dispatch(instruction: PaymentInstruction) {
    this.logger.log(
      `Dispatching to NIBSS (NIP): ${instruction.idempotencyKey}`,
    );

    const nibssUrl = this.configService.get<string>('NIBSS_API_URL');
    const nibssSecret = this.configService.get<string>(
      'NIBSS_CLIENT_SECRET',
      'test-secret',
    );
    const clientId = this.configService.get<string>(
      'NIBSS_CLIENT_ID',
      'test-client',
    );

    if (!nibssUrl) {
      this.logger.warn(
        'NIBSS_API_URL not configured. Simulating success for local testing.',
      );
      return {
        success: true,
        reference: `NIP-${Date.now()}-${instruction.id.substring(0, 5)}`,
        rawResponse: { responseCode: '00', message: 'Simulated NIBSS success' },
      };
    }

    const payload = {
      SessionID: `999999${Date.now()}`,
      NameEnquiryRef: instruction.reference || `NE${Date.now()}`,
      DestinationInstitutionCode: instruction.targetBankCode,
      ChannelCode: '1',
      BeneficiaryAccountName: 'Unknown Beneficiary',
      BeneficiaryAccountNumber: instruction.targetAccountId,
      BeneficiaryKYCLevel: '1',
      OriginatorAccountName: 'Banking Service Cust',
      OriginatorAccountNumber: instruction.sourceAccountId,
      OriginatorBankVerificationNumber: '',
      OriginatorKYCLevel: '1',
      TransactionLocation: '1.234,5.678',
      Narration: 'Fund Transfer',
      PaymentReference: instruction.idempotencyKey,
      Amount: instruction.amount,
    };

    const mac = this.generateMac(payload, nibssSecret);

    try {
      const response = await axios.post(
        `${nibssUrl}/nip/fundtransfer`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${clientId}`,
            Mac: mac,
          },
          timeout: 10000, // 10 seconds strict timeout for NIP
        },
      );

      const data = response.data;
      const success = data.ResponseCode === '00';

      return {
        success,
        reference: data.SessionID || payload.SessionID,
        rawResponse: data,
      };
    } catch (error: any) {
      this.logger.error(`NIBSS Dispatch failed: ${error.message}`);
      throw new InternalServerErrorException('NIBSS connection failed');
    }
  }

  async checkStatus(reference: string) {
    const nibssUrl = this.configService.get<string>('NIBSS_API_URL');
    if (!nibssUrl) {
      return {
        status: 'COMPLETED' as const,
        rawResponse: { responseCode: '00' },
      };
    }

    try {
      const response = await axios.post(`${nibssUrl}/nip/transactionstatus`, {
        SessionID: reference,
      });
      const data = response.data;

      let status: 'COMPLETED' | 'FAILED' | 'PENDING' = 'PENDING';
      if (data.ResponseCode === '00') status = 'COMPLETED';
      else if (data.ResponseCode === '09') status = 'PENDING';
      else status = 'FAILED';

      return {
        status,
        rawResponse: data,
      };
    } catch (error: any) {
      this.logger.error(`NIBSS Status Check failed: ${error.message}`);
      throw new InternalServerErrorException('NIBSS status check failed');
    }
  }
}
