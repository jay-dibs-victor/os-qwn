import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverSavingsPlan, SavingsPlanStatus } from '../entities/driver-savings-plan.entity';
import { DriverEarningsService } from '../driver-earnings.service';

@Injectable()
export class SavingsDisbursementSchedulerService {
  private readonly logger = new Logger(SavingsDisbursementSchedulerService.name);

  constructor(
    @InjectRepository(DriverSavingsPlan)
    private readonly savingsRepo: Repository<DriverSavingsPlan>,
    private readonly earningsService: DriverEarningsService,
  ) {}

  async processMaturePlans(tenantId?: string): Promise<{ disbursed: number; failed: number }> {
    const where: any = { status: SavingsPlanStatus.TARGET_MET };
    if (tenantId) where.tenantId = tenantId;
    const maturePlans = await this.savingsRepo.find({ where });
    let disbursed = 0;
    let failed = 0;

    for (const plan of maturePlans) {
      try {
        const amount = Number(plan.currentAmount);
        await this.earningsService.recordEarning({
          tenantId: plan.tenantId,
          driverCustomerId: plan.driverCustomerId,
          tripId: `SAVINGS_DISBURSE_${plan.id}`,
          tripFare: amount,
          platformCommission: 0,
          partnerCommission: 0,
          netEarnings: amount,
          metadata: { savingsPlanId: plan.id, disbursementType: 'TARGET_MET' },
        });
        await this.savingsRepo.update(plan.id, {
          currentAmount: 0,
          totalWithdrawn: Number(plan.totalWithdrawn) + amount,
          status: SavingsPlanStatus.EARLY_WITHDRAWN,
        });
        disbursed++;
        this.logger.log(`Disbursed ₦${amount} to driver ${plan.driverCustomerId} from plan ${plan.id}`);
      } catch (err) {
        this.logger.error(`Failed to disburse plan ${plan.id}: ${(err as Error).message}`);
        failed++;
      }
    }
    return { disbursed, failed };
  }

  async processWeeklyDisbursements(tenantId?: string): Promise<{ disbursed: number; failed: number }> {
    return this.processMaturePlans(tenantId);
  }

  async processMonthlyDisbursements(tenantId?: string): Promise<{ disbursed: number; failed: number }> {
    const where: any = { status: SavingsPlanStatus.ACTIVE };
    if (tenantId) where.tenantId = tenantId;
    const activePlans = await this.savingsRepo.find({ where });
    let disbursed = 0;
    let failed = 0;

    for (const plan of activePlans) {
      if (Number(plan.currentAmount) <= 0) continue;
      try {
        const monthlyAmount = Number(plan.currentAmount) * 0.25;
        const actualAmount = Math.min(monthlyAmount, Number(plan.currentAmount));
        await this.earningsService.recordEarning({
          tenantId: plan.tenantId,
          driverCustomerId: plan.driverCustomerId,
          tripId: `SAVINGS_MONTHLY_${plan.id}_${Date.now()}`,
          tripFare: actualAmount,
          platformCommission: 0,
          partnerCommission: 0,
          netEarnings: actualAmount,
          metadata: { savingsPlanId: plan.id, disbursementType: 'MONTHLY' },
        });
        plan.currentAmount = Number(plan.currentAmount) - actualAmount;
        plan.totalWithdrawn = Number(plan.totalWithdrawn) + actualAmount;
        await this.savingsRepo.save(plan);
        disbursed++;
      } catch (err) {
        this.logger.error(`Failed monthly disbursement for plan ${plan.id}: ${(err as Error).message}`);
        failed++;
      }
    }
    return { disbursed, failed };
  }
}
