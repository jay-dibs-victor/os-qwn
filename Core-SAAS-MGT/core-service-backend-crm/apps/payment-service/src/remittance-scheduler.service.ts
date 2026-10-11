import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { MarketplaceLedgerService } from './marketplace-ledger.service';
import { FleetContractService } from './fleet-contract.service';
import { PaymentAccountService } from './payment-account.service';
import { PaymentGatewayRegistry } from './payment-gateway-registry.service';
import { PaymentAccountEntityType } from './entities/payment-account.entity';
import { RemittanceSchedule } from './entities/fleet-contract.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RemittanceScheduler {
  private readonly logger = new Logger(RemittanceScheduler.name);

  constructor(
    private readonly marketplaceLedger: MarketplaceLedgerService,
    private readonly fleetContractService: FleetContractService,
    private readonly paymentAccountService: PaymentAccountService,
    private readonly gatewayRegistry: PaymentGatewayRegistry,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processDailyRemittances() {
    await this.processRemittances(RemittanceSchedule.DAILY);
  }

  @Cron(CronExpression.EVERY_WEEK)
  async processWeeklyRemittances() {
    await this.processRemittances(RemittanceSchedule.WEEKLY);
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async processMonthlyRemittances() {
    await this.processRemittances(RemittanceSchedule.MONTHLY);
  }

  private async processRemittances(schedule: RemittanceSchedule) {
    this.logger.log(`=== Processing ${schedule} remittances ===`);
    const tenants = ['root-admin', 'tenant-001', 'acme-corp'];

    for (const tenantId of tenants) {
      try {
        await this.processTenantRemittances(tenantId, schedule);
      } catch (err: any) {
        this.logger.error(`Remittance failed for tenant ${tenantId}: ${err.message}`);
      }
    }
  }

  private async processTenantRemittances(tenantId: string, schedule: RemittanceSchedule) {
    const contracts = await this.fleetContractService.findPartnersBySchedule(tenantId, schedule);
    if (contracts.length === 0) {
      this.logger.log(`No ${schedule} contracts for ${tenantId}`);
      return;
    }

    const partnerIds = [...new Set(contracts.map(c => c.partnerId))];

    try {
      const realBalance = await this.gatewayRegistry.getActiveProvider().getBalance();
      const platformBalance = realBalance?.balance || 0;
      this.logger.log(`Paystack balance for ${tenantId}: ${platformBalance}`);

      if (platformBalance <= 0) {
        this.logger.warn(`Insufficient Paystack balance (${platformBalance}) for ${tenantId}, skipping payouts`);
        return;
      }
    } catch {
      this.logger.warn('Paystack balance check failed, proceeding with mock balance');
    }

    for (const partnerId of partnerIds) {
      try {
        const balance = await this.marketplaceLedger.getBalance(
          tenantId,
          'partner' as any,
          partnerId,
        );

        if (balance <= 0) {
          this.logger.log(`Partner ${partnerId} has zero/negative balance (${balance}), skipping`);
          continue;
        }

        const partnerAccount = await this.paymentAccountService.findByEntity(
          tenantId,
          PaymentAccountEntityType.PARTNER,
          partnerId,
        );

        if (!partnerAccount?.recipientCode) {
          this.logger.warn(`Partner ${partnerId} has no recipient code, skipping payout`);
          continue;
        }

        const payoutRef = `REM-${schedule.toUpperCase()}-${uuidv4().slice(0, 8)}`;

        await this.marketplaceLedger.markPayoutPending(tenantId, partnerId, balance, payoutRef);

        try {
          const transfer = await this.gatewayRegistry.getActiveProvider().initiateTransfer({
            amount: Math.round(balance * 100),
            recipient: partnerAccount.recipientCode,
            reference: payoutRef,
            reason: `${schedule} fleet remittance for partner ${partnerId}`,
          });

          await this.marketplaceLedger.markPayoutSuccess(
            tenantId,
            partnerId,
            balance,
            payoutRef,
            transfer.transferCode,
          );

          this.logger.log(`Paid partner ${partnerId} ${balance} (ref: ${transfer.reference})`);
        } catch (transferErr: any) {
          this.logger.error(`Transfer failed for partner ${partnerId}: ${transferErr.message}`);
        }
      } catch (err: any) {
        this.logger.error(`Partner ${partnerId} payout error: ${err.message}`);
      }
    }
  }
}
