/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentRailProvider } from './payment-rail.interface';
import { PaymentInstruction } from '../entities/payment-instruction.entity';

@Injectable()
export class SwiftProvider implements PaymentRailProvider {
  private readonly logger = new Logger(SwiftProvider.name);

  constructor(private readonly configService: ConfigService) {}

  private generateMT103Payload(instruction: PaymentInstruction): string {
    // Generate a basic MT103 message
    // In reality this is a highly structured ISO 15022 / ISO 20022 message
    const date = new Date().toISOString().slice(2, 8).replace(/-/g, ''); // YYMMDD
    return `
{1:F01TESTBANKAXXX0000000000}
{2:I103${instruction.targetBankCode}XXXXN}
{4:
:20:${instruction.idempotencyKey}
:23B:CRED
:32A:${date}${instruction.currency}${instruction.amount.toString().replace('.', ',')}
:50K:/${instruction.sourceAccountId}
BANKING SERVICE SENDER
:59:/${instruction.targetAccountId}
UNKNOWN BENEFICIARY
:71A:OUR
-}
    `.trim();
  }

  async dispatch(instruction: PaymentInstruction) {
    this.logger.log(`Dispatching to SWIFT: ${instruction.idempotencyKey}`);

    const swiftUrl = this.configService.get<string>('SWIFT_API_URL');
    const swiftApiKey = this.configService.get<string>(
      'SWIFT_API_KEY',
      'test-api-key',
    );

    if (!swiftUrl) {
      this.logger.warn(
        'SWIFT_API_URL not configured. Simulating success for local testing.',
      );
      return {
        success: true,
        reference: `SWIFT-${Date.now()}-${instruction.id.substring(0, 5)}`,
        rawResponse: { status: 'ACK', message: 'Simulated SWIFT ACK' },
      };
    }

    const payload = this.generateMT103Payload(instruction);

    try {
      const response = await axios.post(`${swiftUrl}/v1/messages`, payload, {
        headers: {
          'Content-Type': 'text/plain',
          Authorization: `Bearer ${swiftApiKey}`,
        },
        timeout: 20000,
      });

      const data = response.data;
      // SWIFT usually returns ACK or NAK
      const success = data.status === 'ACK';

      return {
        success,
        reference: data.messageId || instruction.idempotencyKey,
        rawResponse: data,
      };
    } catch (error: any) {
      this.logger.error(`SWIFT Dispatch failed: ${error.message}`);
      throw new InternalServerErrorException('SWIFT connection failed');
    }
  }

  async checkStatus(reference: string) {
    const swiftUrl = this.configService.get<string>('SWIFT_API_URL');
    if (!swiftUrl) {
      return { status: 'COMPLETED' as const, rawResponse: { status: 'ACK' } };
    }

    try {
      const response = await axios.get(
        `${swiftUrl}/v1/messages/${reference}/status`,
      );
      const data = response.data;

      let status: 'COMPLETED' | 'FAILED' | 'PENDING' = 'PENDING';
      if (data.status === 'ACK') status = 'COMPLETED';
      else if (data.status === 'NAK') status = 'FAILED';
      else status = 'PENDING';

      return {
        status,
        rawResponse: data,
      };
    } catch (error: any) {
      this.logger.error(`SWIFT Status Check failed: ${error.message}`);
      throw new InternalServerErrorException('SWIFT status check failed');
    }
  }
}
