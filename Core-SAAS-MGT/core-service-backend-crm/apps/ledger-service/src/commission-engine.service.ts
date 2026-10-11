import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import {
  CommissionRule,
  CommissionRuleType,
  CommissionCalculationMethod,
} from './entities/commission-rule.entity';
import {
  CommissionCalculationDto,
  CommissionResultDto,
} from './dto/revenue.dto';

const ROOT_TENANT = 'root-admin';

@Injectable()
export class CommissionEngineService {
  private readonly logger = new Logger(CommissionEngineService.name);

  constructor(
    @InjectRepository(CommissionRule)
    private readonly commissionRuleRepo: Repository<CommissionRule>,
    private readonly configService: ConfigService,
  ) {}

  async calculateCommissions(
    dto: CommissionCalculationDto,
  ): Promise<CommissionResultDto> {
    const rules = await this.commissionRuleRepo.find({
      where: {
        tenantId: dto.tenantId,
        isActive: true,
      },
      order: { priority: 'ASC' },
    });

    const totalAmount = Number(dto.amount);
    let platformCommission = 0;
    let partnerCommission = 0;
    let driverPayout = 0;
    let gatewayFee = 0;

    const breakdown: CommissionResultDto['breakdown'] = [];

    const platformRules = rules.filter(
      (r) => r.ruleType === CommissionRuleType.PLATFORM,
    );
    const partnerRules = rules.filter(
      (r) =>
        r.ruleType === CommissionRuleType.PARTNER &&
        (!r.partnerId || r.partnerId === dto.partnerId),
    );

    for (const rule of platformRules) {
      const commissionAmount = this.applyRule(rule, totalAmount);
      platformCommission += commissionAmount;
      breakdown.push({
        ruleId: rule.id,
        ruleType: rule.ruleType,
        rate: Number(rule.rate),
        amount: commissionAmount,
      });
    }

    const isCorporate = dto.isCorporate && !!dto.partnerId;
    if (isCorporate) {
      for (const rule of partnerRules) {
        const commissionAmount = this.applyRule(rule, totalAmount);
        partnerCommission += commissionAmount;
        breakdown.push({
          ruleId: rule.id,
          ruleType: rule.ruleType,
          rate: Number(rule.rate),
          amount: commissionAmount,
        });
      }
    }

    gatewayFee = Math.round(totalAmount * 0.015 * 100) / 100;

    driverPayout = Math.round(
      (totalAmount - platformCommission - partnerCommission - gatewayFee) * 100,
    ) / 100;

    return {
      totalAmount,
      platformCommission: Math.round(platformCommission * 100) / 100,
      partnerCommission: Math.round(partnerCommission * 100) / 100,
      driverPayout,
      gatewayFee,
      breakdown,
    };
  }

  private applyRule(rule: CommissionRule, amount: number): number {
    switch (rule.calculationMethod) {
      case CommissionCalculationMethod.FLAT:
        return Number(rule.flatAmount || 0);

      case CommissionCalculationMethod.TIERED:
        return this.applyTieredRule(rule, amount);

      case CommissionCalculationMethod.PERCENTAGE:
      default:
        return Math.round(amount * Number(rule.rate) * 100) / 100;
    }
  }

  private applyTieredRule(rule: CommissionRule, amount: number): number {
    if (!rule.tierConfig || rule.tierConfig.length === 0) {
      return Math.round(amount * Number(rule.rate) * 100) / 100;
    }

    const sortedTiers = [...rule.tierConfig].sort(
      (a, b) => a.minAmount - b.minAmount,
    );

    for (const tier of sortedTiers) {
      if (amount >= tier.minAmount && amount <= tier.maxAmount) {
        if (tier.flatAmount) {
          return tier.flatAmount;
        }
        return Math.round(amount * tier.rate * 100) / 100;
      }
    }

    const lastTier = sortedTiers[sortedTiers.length - 1];
    if (lastTier && amount > lastTier.maxAmount) {
      if (lastTier.flatAmount) {
        return lastTier.flatAmount;
      }
      return Math.round(amount * lastTier.rate * 100) / 100;
    }

    return Math.round(amount * Number(rule.rate) * 100) / 100;
  }

  async createCommissionRule(dto: Partial<CommissionRule>): Promise<CommissionRule> {
    const rule = this.commissionRuleRepo.create(dto);
    return this.commissionRuleRepo.save(rule);
  }

  async updateCommissionRule(
    id: string,
    dto: Partial<CommissionRule>,
    tenantId: string,
  ): Promise<CommissionRule> {
    const filter = tenantId !== ROOT_TENANT ? { id, tenantId } : { id };
    await this.commissionRuleRepo.update(filter, dto as any);
    return this.commissionRuleRepo.findOneOrFail({ where: filter });
  }

  async getCommissionRules(tenantId: string, ruleType?: CommissionRuleType) {
    const where: Record<string, any> = {};
    if (tenantId !== ROOT_TENANT) {
      where.tenantId = tenantId;
    }
    if (ruleType) {
      where.ruleType = ruleType;
    }
    return this.commissionRuleRepo.find({
      where,
      order: { priority: 'ASC' },
    });
  }

  async deleteCommissionRule(id: string, tenantId: string): Promise<void> {
    const filter = tenantId !== ROOT_TENANT ? { id, tenantId } : { id };
    await this.commissionRuleRepo.softDelete(filter);
  }
}
