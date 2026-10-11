/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentRail } from './entities/payment-instruction.entity';

@Injectable()
export class LiquidityService {
  private readonly logger = new Logger(LiquidityService.name);

  // Map rails to their settlement GL Account IDs
  private readonly SETTLEMENT_ACCOUNTS: Record<string, string> = {
    INTERNAL: 'GL-INTERNAL-001',
    NIBSS: 'GL-NIBSS-SETTLEMENT-001',
    RTGS: 'GL-RTGS-SETTLEMENT-001',
    SWIFT: 'GL-SWIFT-SETTLEMENT-001',
  };

  constructor(private readonly configService: ConfigService) { }

  async verifyLiquidity(rail: PaymentRail, amount: number): Promise<boolean> {
    const glAccountId = this.SETTLEMENT_ACCOUNTS[rail];
    if (!glAccountId) {
      throw new BadRequestException(
        `No settlement account configured for rail ${rail}`,
      );
    }

    const ledgerHost = this.configService.get<string>(
      'LEDGER_SERVICE_HOST',
      'localhost',
    );
    const ledgerPort = this.configService.get<number>(
      'LEDGER_SERVICE_PORT',
      3003,
    );
    const ledgerUrl = `http://${ledgerHost}:${ledgerPort}/ledger/accounts/${glAccountId}`;

    try {
      this.logger.log(
        `Verifying liquidity for ${rail} against GL ${glAccountId}`,
      );
      const response = await axios.get(ledgerUrl);

      const glAccount = response.data;
      const currentBalance = Number(glAccount.balance);

      // We assume balance is positive (assets) or credit normal (liability)
      // depending on setup. Let's assume positive means we have funds.
      if (currentBalance < amount) {
        this.logger.warn(
          `Insufficient liquidity in ${rail} pool. Required: ${amount}, Available: ${currentBalance}`,
        );
        return false;
      }

      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to verify liquidity for ${rail}: ${error.message}`,
      );
      // In production, failing to check liquidity might mean blocking the payment
      // or falling back to a cached value. We will fail hard here to prevent overdrafts.
      throw new BadRequestException('Failed to verify settlement liquidity');
    }
  }
}
