import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverSavingsPlan, SavingsPlanStatus } from '../entities/driver-savings-plan.entity';

@Injectable()
export class DriverSavingsService {
  private readonly logger = new Logger(DriverSavingsService.name);

  constructor(
    @InjectRepository(DriverSavingsPlan)
    private readonly savingsRepo: Repository<DriverSavingsPlan>,
  ) {}

  async createPlan(dto: {
    tenantId: string;
    driverCustomerId: string;
    targetAmount: number;
    contributionPerTrip: number;
    earlyWithdrawalPenaltyPercent?: number;
    maxEarlyWithdrawalPenalty?: number;
    targetDate?: Date;
  }): Promise<DriverSavingsPlan> {
    const existing = await this.savingsRepo.findOne({
      where: {
        tenantId: dto.tenantId,
        driverCustomerId: dto.driverCustomerId,
        status: SavingsPlanStatus.ACTIVE,
      },
    });
    if (existing) {
      throw new BadRequestException('Driver already has an active savings plan');
    }

    const plan = this.savingsRepo.create({
      tenantId: dto.tenantId,
      driverCustomerId: dto.driverCustomerId,
      targetAmount: dto.targetAmount,
      contributionPerTrip: dto.contributionPerTrip,
      earlyWithdrawalPenaltyPercent: dto.earlyWithdrawalPenaltyPercent ?? 10,
      maxEarlyWithdrawalPenalty: dto.maxEarlyWithdrawalPenalty ?? 500.00,
      targetDate: dto.targetDate,
      currentAmount: 0,
      status: SavingsPlanStatus.ACTIVE,
    });
    return this.savingsRepo.save(plan);
  }

  async recordContribution(dto: {
    tenantId: string;
    planId: string;
    tripId: string;
    amount: number;
  }): Promise<DriverSavingsPlan> {
    const plan = await this.savingsRepo.findOne({ where: { id: dto.planId, tenantId: dto.tenantId } });
    if (!plan) throw new NotFoundException('Savings plan not found');
    if (plan.status !== SavingsPlanStatus.ACTIVE) {
      throw new BadRequestException('Savings plan is not active');
    }

    plan.currentAmount = Number(plan.currentAmount) + Number(dto.amount);
    plan.totalContributions = Number(plan.totalContributions) + 1;
    plan.contributionHistory = [
      ...(plan.contributionHistory || []),
      {
        tripId: dto.tripId,
        amount: Number(dto.amount),
        timestamp: new Date().toISOString(),
        runningTotal: Number(plan.currentAmount),
      },
    ];

    if (plan.currentAmount >= plan.targetAmount) {
      plan.status = SavingsPlanStatus.TARGET_MET;
      plan.completedAt = new Date();
    }

    return this.savingsRepo.save(plan);
  }

  async earlyWithdrawal(dto: {
    tenantId: string;
    planId: string;
    amount: number;
    reason?: string;
    actor?: string;
  }): Promise<{ plan: DriverSavingsPlan; penalty: number; netAmount: number }> {
    const plan = await this.savingsRepo.findOne({ where: { id: dto.planId, tenantId: dto.tenantId } });
    if (!plan) throw new NotFoundException('Savings plan not found');
    if (plan.status !== SavingsPlanStatus.ACTIVE && plan.status !== SavingsPlanStatus.TARGET_MET) {
      throw new BadRequestException('Plan cannot be withdrawn from');
    }
    if (plan.currentAmount < dto.amount) {
      throw new BadRequestException(`Insufficient savings: ${plan.currentAmount} < ${dto.amount}`);
    }

    const penaltyPercent = plan.earlyWithdrawalPenaltyPercent;
    const maxPenalty = plan.maxEarlyWithdrawalPenalty;
    const rawPenalty = (Number(dto.amount) * Number(penaltyPercent)) / 100;
    const penalty = Math.min(rawPenalty, Number(maxPenalty));
    const netAmount = Number(dto.amount) - penalty;

    plan.currentAmount = Number(plan.currentAmount) - Number(dto.amount);
    plan.totalPenaltiesPaid = Number(plan.totalPenaltiesPaid) + penalty;
    plan.totalWithdrawn = Number(plan.totalWithdrawn) + netAmount;
    plan.status = SavingsPlanStatus.EARLY_WITHDRAWN;

    return { plan: await this.savingsRepo.save(plan), penalty, netAmount };
  }

  async getPlans(tenantId: string, driverCustomerId?: string): Promise<DriverSavingsPlan[]> {
    const where: any = { tenantId };
    if (driverCustomerId) where.driverCustomerId = driverCustomerId;
    return this.savingsRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getPlan(tenantId: string, planId: string): Promise<DriverSavingsPlan> {
    const plan = await this.savingsRepo.findOne({ where: { id: planId, tenantId } });
    if (!plan) throw new NotFoundException('Savings plan not found');
    return plan;
  }

  async cancelPlan(tenantId: string, planId: string, reason?: string): Promise<DriverSavingsPlan> {
    const plan = await this.savingsRepo.findOne({ where: { id: planId, tenantId } });
    if (!plan) throw new NotFoundException('Savings plan not found');
    plan.status = SavingsPlanStatus.CANCELLED;
    return this.savingsRepo.save(plan);
  }

  async getSummary(tenantId: string): Promise<{
    totalPlans: number;
    activePlans: number;
    totalSaved: number;
    totalTarget: number;
    totalPenalties: number;
  }> {
    const plans = await this.savingsRepo.find({ where: { tenantId } });
    return {
      totalPlans: plans.length,
      activePlans: plans.filter(p => p.status === SavingsPlanStatus.ACTIVE).length,
      totalSaved: plans.reduce((s, p) => s + Number(p.currentAmount), 0),
      totalTarget: plans.reduce((s, p) => s + Number(p.targetAmount), 0),
      totalPenalties: plans.reduce((s, p) => s + Number(p.totalPenaltiesPaid), 0),
    };
  }
}
