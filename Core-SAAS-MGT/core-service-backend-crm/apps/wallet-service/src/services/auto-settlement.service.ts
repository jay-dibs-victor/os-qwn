import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DriverDebt, DriverDebtStatus } from '../entities/driver-debt.entity';
import { DriverLedger, DriverLedgerDirection, DriverLedgerEntryType } from '../entities/driver-ledger.entity';
import { DriverEarning, DriverEarningStatus } from '../entities/driver-earning.entity';
import { DriverDebtService } from './driver-debt.service';
import { DriverLedgerService } from './driver-ledger.service';

@Injectable()
export class AutoSettlementService {
  private readonly logger = new Logger(AutoSettlementService.name);

  constructor(
    @InjectRepository(DriverDebt)
    private readonly driverDebtRepository: Repository<DriverDebt>,
    @InjectRepository(DriverEarning)
    private readonly driverEarningRepository: Repository<DriverEarning>,
    private readonly driverDebtService: DriverDebtService,
    private readonly driverLedgerService: DriverLedgerService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async autoSettleDriverDebts(): Promise<void> {
    this.logger.log('Auto-settlement cron: starting');

    const debts = await this.driverDebtRepository.find({
      where: [
        { status: DriverDebtStatus.ACTIVE },
        { status: DriverDebtStatus.RESTRICTED },
      ],
    });

    for (const debt of debts) {
      try {
        await this.settleDriverDebtFromEarnings(debt);
      } catch (error) {
        this.logger.error(`Auto-settlement failed for driver ${debt.driverCustomerId}: ${error}`);
      }
    }

    this.logger.log(`Auto-settlement cron: processed ${debts.length} drivers`);
  }

  private async settleDriverDebtFromEarnings(debt: DriverDebt): Promise<void> {
    const outstanding = Number(debt.outstandingBalance);
    if (outstanding <= 0) return;

    const pendingEarnings = await this.driverEarningRepository.find({
      where: {
        tenantId: debt.tenantId,
        driverCustomerId: debt.driverCustomerId,
        status: DriverEarningStatus.POSTED,
      },
      order: { createdAt: 'ASC' },
    });

    let remainingDebt = outstanding;

    // Resolve GL accounts for the ledger entries
    let driverPayableGl: string | undefined;
    let driverDebtGl: string | undefined;
    try {
      driverPayableGl = await this.driverLedgerService.getGlAccountIdByCode(debt.tenantId, '2302');
      driverDebtGl = await this.driverLedgerService.getGlAccountIdByCode(debt.tenantId, '1403');
    } catch (err) {
      this.logger.error(`Failed to resolve GL accounts for auto-settlement: ${err}`);
      return;
    }

    for (const earning of pendingEarnings) {
      if (remainingDebt <= 0) break;

      const finalPayoutBeforeOffset = Number(earning.finalPayout);
      if (finalPayoutBeforeOffset <= 0) continue;

      const offsetAmount = Math.min(finalPayoutBeforeOffset, remainingDebt);
      const remainingPayout = finalPayoutBeforeOffset - offsetAmount;

      earning.finalPayout = remainingPayout;
      earning.status = remainingPayout <= 0 ? DriverEarningStatus.PAID : DriverEarningStatus.POSTED;
      earning.settlementReference = `AUTO-SET-${uuidv4().slice(0, 8)}`;
      await this.driverEarningRepository.save(earning);

      await this.driverLedgerService.recordEntry(
        {
          tenantId: debt.tenantId,
          driverCustomerId: debt.driverCustomerId,
          entryType: DriverLedgerEntryType.DEBT_SETTLEMENT,
          direction: DriverLedgerDirection.CREDIT,
          amount: offsetAmount,
          reference: earning.settlementReference,
          tripId: earning.tripId,
          description: `Auto debt settlement from earning ${earning.id}`,
        },
        driverDebtGl,
        driverPayableGl,
      );

      remainingDebt -= offsetAmount;
    }

    const settledAmount = outstanding - remainingDebt;
    if (settledAmount > 0) {
      debt.outstandingBalance = remainingDebt;
      debt.totalSettled = Number(debt.totalSettled) + settledAmount;

      if (remainingDebt <= 0) {
        debt.status = DriverDebtStatus.SETTLED;
      } else if (remainingDebt < Number(debt.debtThreshold)) {
        debt.status = DriverDebtStatus.ACTIVE;
      }

      await this.driverDebtRepository.save(debt);
    }
  }
}
