import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AmlRuleEvaluatorService } from './aml-rule-evaluator.service';
import { ComplianceEventsPublisher } from './compliance-events.publisher';
import { ComplianceServiceService } from './compliance-service.service';
import {
  AmlRule,
  AmlRuleType,
  ComplianceSeverity,
} from './entities/aml-rule.entity';
import { ComplianceAlert } from './entities/compliance-alert.entity';
import { MonitoredTransaction } from './entities/monitored-transaction.entity';
import {
  SarStatus,
  SuspiciousActivityReport,
} from './entities/suspicious-activity-report.entity';
import { SanctionsScreeningService } from './sanctions-screening.service';

describe('ComplianceServiceService', () => {
  let service: ComplianceServiceService;

  const rules: AmlRule[] = [];
  const alerts: ComplianceAlert[] = [];
  const sars: SuspiciousActivityReport[] = [];

  const amlRuleRepo = {
    create: jest.fn((dto) => ({ id: `rule-${rules.length + 1}`, ...dto })),
    save: jest.fn((entity) => {
      rules.push(entity);
      return entity;
    }),
    find: jest.fn(() => rules),
  };
  const transactionRepo = {
    create: jest.fn((dto) => ({
      id: 'txn-row-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...dto,
    })),
    save: jest.fn((entity) => entity),
    count: jest.fn(() => 6),
  };
  const alertRepo = {
    create: jest.fn((dto) => ({
      id: `alert-${alerts.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...dto,
    })),
    save: jest.fn((entity) => {
      alerts.push(entity);
      return entity;
    }),
    find: jest.fn(() => alerts),
  };
  const sarRepo = {
    create: jest.fn((dto) => ({
      id: `sar-${sars.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...dto,
    })),
    save: jest.fn((entity) => {
      const index = sars.findIndex((report) => report.id === entity.id);
      if (index >= 0) sars[index] = entity;
      else sars.push(entity);
      return entity;
    }),
    find: jest.fn(() => sars),
    findOne: jest.fn(({ where }) =>
      sars.find((report) => report.id === where.id),
    ),
  };
  const eventsPublisher = {
    publishAlertRaised: jest.fn(),
    publishSarFiled: jest.fn(),
  };

  beforeEach(async () => {
    rules.length = 0;
    alerts.length = 0;
    sars.length = 0;
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceServiceService,
        AmlRuleEvaluatorService,
        SanctionsScreeningService,
        {
          provide: getRepositoryToken(AmlRule),
          useValue: amlRuleRepo,
        },
        {
          provide: getRepositoryToken(MonitoredTransaction),
          useValue: transactionRepo,
        },
        {
          provide: getRepositoryToken(ComplianceAlert),
          useValue: alertRepo,
        },
        {
          provide: getRepositoryToken(SuspiciousActivityReport),
          useValue: sarRepo,
        },
        {
          provide: ComplianceEventsPublisher,
          useValue: eventsPublisher,
        },
      ],
    }).compile();

    service = module.get<ComplianceServiceService>(ComplianceServiceService);
  });

  it('creates AML rules with default enabled state', async () => {
    const rule = await service.createRule({
      name: 'Large Cash Movement',
      type: AmlRuleType.AMOUNT_THRESHOLD,
      conditions: { threshold: 1000000 },
      tenantId: 'tenant-1',
    });

    expect(rule.isEnabled).toBe(true);
    expect(rule.severity).toBe(ComplianceSeverity.MEDIUM);
  });

  it('raises amount and sanctions alerts when a transaction matches rules', async () => {
    await service.createRule({
      name: 'Large Transfer',
      type: AmlRuleType.AMOUNT_THRESHOLD,
      severity: ComplianceSeverity.HIGH,
      conditions: { threshold: 500000 },
      tenantId: 'tenant-1',
    });
    await service.createRule({
      name: 'Sanctions Stub',
      type: AmlRuleType.SANCTIONS,
      severity: ComplianceSeverity.CRITICAL,
      conditions: {},
      tenantId: 'tenant-1',
    });

    const result = await service.monitorTransaction({
      transactionId: 'txn-1',
      customerId: 'customer-1',
      counterpartyName: 'Blocked Person Holdings',
      amount: 750000,
      tenantId: 'tenant-1',
    });

    expect(result.alerts).toHaveLength(2);
    expect(eventsPublisher.publishAlertRaised).toHaveBeenCalledTimes(2);
  });

  it('files SAR reports and emits SAR events', async () => {
    const report = await service.createSar({
      customerId: 'customer-1',
      alertIds: ['alert-1'],
      narrative: 'Suspicious structuring activity.',
      filedBy: 'compliance-officer',
      tenantId: 'tenant-1',
    });

    expect(report.status).toBe(SarStatus.FILED);
    expect(eventsPublisher.publishSarFiled).toHaveBeenCalledWith(report);
  });

  it('returns dashboard metrics grouped by severity', async () => {
    alerts.push({
      id: 'alert-1',
      transactionId: 'txn-1',
      customerId: 'customer-1',
      ruleId: 'rule-1',
      ruleName: 'Large Transfer',
      severity: ComplianceSeverity.HIGH,
      status: 'OPEN' as any,
      evidence: {},
      retentionUntil: new Date(),
      tenantId: 'tenant-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const dashboard = await service.getDashboard('tenant-1');

    expect(dashboard.totalAlerts).toBe(1);
    expect(dashboard.bySeverity.HIGH).toBe(1);
  });
});
