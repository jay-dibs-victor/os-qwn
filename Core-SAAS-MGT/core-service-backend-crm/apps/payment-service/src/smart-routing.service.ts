/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PaymentInstruction } from './entities/payment-instruction.entity';
import { PaymentRail } from './constants/enums';
import { NibssProvider } from './rails/nibss.provider';
import { RtgsProvider } from './rails/rtgs.provider';
import { SwiftProvider } from './rails/swift.provider';
import { PaystackProvider } from './rails/paystack.provider';
import { LiquidityService } from './liquidity.service';

@Injectable()
export class SmartRoutingService {
  private readonly logger = new Logger(SmartRoutingService.name);

  constructor(
    private readonly nibssProvider: NibssProvider,
    private readonly rtgsProvider: RtgsProvider,
    private readonly swiftProvider: SwiftProvider,
    private readonly paystackProvider: PaystackProvider,
    private readonly liquidityService: LiquidityService,
  ) {}

  /**
   * Determines the optimal rail based on:
   * - Currency (non-NGN → SWIFT)
   * - Amount threshold (≥ 50M NGN → RTGS)
   * - Bank code prefix (CBN clearing code 999XXX or no bank code → internal)
   * - Default → NIBSS (NIP)
   */
  determineRail(
    amount: number,
    currency: string,
    targetBankCode?: string,
  ): PaymentRail {
    if (currency !== 'NGN') {
      return PaymentRail.SWIFT;
    }

    // RTGS threshold: 50,000,000 NGN (CBN threshold for large value transfers)
    if (amount >= 50_000_000) {
      return PaymentRail.RTGS;
    }

    // No bank code means same-bank (internal)
    if (!targetBankCode) {
      return PaymentRail.INTERNAL;
    }

    return PaymentRail.NIBSS;
  }

  /**
   * Executes the external transfer using the selected rail.
   * Includes:
   *  1. Liquidity verification against settlement GL pool
   *  2. Rail dispatch
   *  3. Failover: NIBSS → RTGS (same-currency, below RTGS threshold)
   */
  async executeExternalTransfer(instruction: PaymentInstruction) {
    this.logger.log(
      `Executing external transfer ${instruction.id} via ${instruction.rail}`,
    );

    // 1. Liquidity check against settlement pool before dispatch
    const hasLiquidity = await this.liquidityService.verifyLiquidity(
      instruction.rail,
      instruction.amount,
    );
    if (!hasLiquidity) {
      throw new BadRequestException(
        `Insufficient settlement liquidity for rail ${instruction.rail}`,
      );
    }

    // 2. Dispatch to the determined rail
    try {
      return await this.dispatchToRail(instruction);
    } catch (primaryError: any) {
      this.logger.error(
        `Primary rail ${instruction.rail} failed: ${primaryError.message}`,
      );

      // 3. Failover logic:
      //    NIBSS → RTGS (domestic NGN)
      //    RTGS → no further fallback (highest tier, manual intervention)
      //    SWIFT → no further fallback (cross-border)
      if (instruction.rail === PaymentRail.NIBSS) {
        this.logger.warn(
          `Failing over from NIBSS to RTGS for instruction ${instruction.id}`,
        );

        // Verify RTGS liquidity before failover
        const rtgsLiquidity = await this.liquidityService.verifyLiquidity(
          PaymentRail.RTGS,
          instruction.amount,
        );
        if (!rtgsLiquidity) {
          throw new BadRequestException(
            'NIBSS failed and RTGS settlement pool also has insufficient liquidity',
          );
        }

        instruction.rail = PaymentRail.RTGS;
        return await this.rtgsProvider.dispatch(instruction);
      }

      throw primaryError;
    }
  }

  private async dispatchToRail(instruction: PaymentInstruction) {
    switch (instruction.rail) {
      case PaymentRail.NIBSS:
        return this.nibssProvider.dispatch(instruction);
      case PaymentRail.RTGS:
        return this.rtgsProvider.dispatch(instruction);
      case PaymentRail.SWIFT:
        return this.swiftProvider.dispatch(instruction);
      case PaymentRail.PAYSTACK:
        return this.paystackProvider.dispatch(instruction);
      default:
        throw new BadRequestException(
          `Unsupported external rail: ${instruction.rail}`,
        );
    }
  }

  async checkStatus(reference: string, rail: PaymentRail) {
    switch (rail) {
      case PaymentRail.NIBSS:
        return this.nibssProvider.checkStatus(reference);
      case PaymentRail.RTGS:
        return this.rtgsProvider.checkStatus(reference);
      case PaymentRail.SWIFT:
        return this.swiftProvider.checkStatus(reference);
      default:
        throw new BadRequestException(`Cannot check status for rail: ${rail}`);
    }
  }
}
