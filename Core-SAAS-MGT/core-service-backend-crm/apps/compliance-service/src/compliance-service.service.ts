import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmlRule, AmlRuleType, ComplianceSeverity } from './entities/aml-rule.entity';
import { ComplianceAlert } from './entities/compliance-alert.entity';
import { MonitoredTransaction } from './entities/monitored-transaction.entity';
import {
  SuspiciousActivityReport,
  SarStatus,
} from './entities/suspicious-activity-report.entity';
import { AmlRuleEvaluatorService, TransactionContext } from './aml-rule-evaluator.service';
import { ComplianceEventsPublisher } from './compliance-events.publisher';
import { SanctionsScreeningService } from './sanctions-screening.service';

@Injectable()
export class ComplianceServiceService {
  constructor(
    @InjectRepository(AmlRule)
    private readonly amlRuleRepo: Repository<AmlRule>,
    @InjectRepository(MonitoredTransaction)
    private readonly transactionRepo: Repository<MonitoredTransaction>,
    @InjectRepository(ComplianceAlert)
    private readonly alertRepo: Repository<ComplianceAlert>,
    @InjectRepository(SuspiciousActivityReport)
    private readonly sarRepo: Repository<SuspiciousActivityReport>,
    private readonly amlEvaluator: AmlRuleEvaluatorService,
    private readonly sanctionsScreening: SanctionsScreeningService,
    private readonly eventsPublisher: ComplianceEventsPublisher,
  ) {}

  async createRule(dto: {
    name: string;
    type: AmlRuleType;
    severity?: ComplianceSeverity;
    conditions?: Record<string, unknown>;
    tenantId: string;
  }): Promise<AmlRule> {
    const rule = this.amlRuleRepo.create({
      name: dto.name,
      type: dto.type,
      severity: dto.severity ?? ComplianceSeverity.MEDIUM,
      conditions: dto.conditions,
      isEnabled: true,
      tenantId: dto.tenantId,
    });
    return this.amlRuleRepo.save(rule) as unknown as AmlRule;
  }

  async monitorTransaction(dto: {
    transactionId: string;
    customerId: string;
    counterpartyName?: string;
    amount: number;
    tenantId: string;
  }): Promise<{
    transaction: MonitoredTransaction;
    alerts: ComplianceAlert[];
  }> {
    const transaction = this.transactionRepo.create({
      transactionId: dto.transactionId,
      customerId: dto.customerId,
      counterpartyName: dto.counterpartyName,
      amount: dto.amount,
      tenantId: dto.tenantId,
    });
    const savedTx = await this.transactionRepo.save(transaction);

    const rules = await this.amlRuleRepo.find({
      where: { tenantId: dto.tenantId, isEnabled: true },
    });

    const context: TransactionContext = {
      transactionId: dto.transactionId,
      customerId: dto.customerId,
      counterpartyName: dto.counterpartyName,
      amount: dto.amount,
      tenantId: dto.tenantId,
    };

    const matched = this.amlEvaluator.evaluate(context, rules);
    const alerts: ComplianceAlert[] = [];

    for (const alert of matched) {
      const saved = await this.alertRepo.save(alert);
      alerts.push(saved);
      await this.eventsPublisher.publishAlertRaised(saved);
    }

    return { transaction: savedTx, alerts };
  }

  async createSar(dto: {
    customerId: string;
    alertIds: string[];
    narrative: string;
    filedBy: string;
    tenantId: string;
  }): Promise<SuspiciousActivityReport> {
    const report = this.sarRepo.create({
      customerId: dto.customerId,
      alertIds: dto.alertIds,
      narrative: dto.narrative,
      filedBy: dto.filedBy,
      status: SarStatus.FILED,
      tenantId: dto.tenantId,
    });
    const saved = await this.sarRepo.save(report);
    await this.eventsPublisher.publishSarFiled(saved);
    return saved;
  }

  async getDashboard(tenantId: string): Promise<{
    totalAlerts: number;
    bySeverity: Record<string, number>;
  }> {
    const alerts = await this.alertRepo.find({ where: { tenantId } });
    const bySeverity: Record<string, number> = {};

    for (const alert of alerts) {
      const key = alert.severity;
      bySeverity[key] = (bySeverity[key] ?? 0) + 1;
    }

    return {
      totalAlerts: alerts.length,
      bySeverity,
    };
  }
}
