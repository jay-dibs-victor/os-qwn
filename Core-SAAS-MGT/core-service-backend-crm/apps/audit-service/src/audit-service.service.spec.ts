import { MethodNotAllowedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditExportService } from './audit-export.service';
import { AuditHashService } from './audit-hash.service';
import { AuditServiceService } from './audit-service.service';
import { AuditLog, AuditOutcome } from './entities/audit-log.entity';

describe('AuditServiceService', () => {
  let service: AuditServiceService;
  const logs: AuditLog[] = [];

  const auditRepo = {
    create: jest.fn((dto) => ({
      id: `audit-${logs.length + 1}`,
      updatedAt: dto.createdAt,
      ...dto,
    })),
    save: jest.fn((entity) => {
      logs.push(entity);
      return entity;
    }),
    find: jest.fn(({ where, order, take }) => {
      let result = logs.filter((log) =>
        Object.entries(where || {}).every(([key, value]) => log[key] === value),
      );
      if (order?.createdAt === 'DESC') {
        result = [...result].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
      } else {
        result = [...result].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );
      }
      return typeof take === 'number' ? result.slice(0, take) : result;
    }),
  };

  beforeEach(async () => {
    logs.length = 0;
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditServiceService,
        AuditHashService,
        AuditExportService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: auditRepo,
        },
      ],
    }).compile();

    service = module.get<AuditServiceService>(AuditServiceService);
  });

  it('appends logs with tamper-evident hash chaining', async () => {
    const first = await service.appendLog({
      eventType: 'payment.completed',
      actorId: 'system',
      actorType: 'system',
      action: 'payment.completed',
      resourceType: 'payment',
      resourceId: 'pay-1',
      payload: { amount: 1000 },
      tenantId: 'tenant-1',
    });
    const second = await service.appendLog({
      eventType: 'reversal.completed',
      actorId: 'officer-1',
      actorType: 'officer',
      action: 'reversal.completed',
      resourceType: 'payment',
      resourceId: 'pay-1',
      payload: { reversalId: 'rev-1' },
      tenantId: 'tenant-1',
    });

    expect(first.previousHash).toBe('GENESIS');
    expect(second.previousHash).toBe(first.hash);
    await expect(service.verifyHashChain('tenant-1')).resolves.toMatchObject({
      valid: true,
      total: 2,
    });
  });

  it('ingests service events into audit logs', async () => {
    const log = await service.ingestEvent({
      routingKey: 'compliance.alert.raised',
      payload: {
        actorId: 'compliance-service',
        alertId: 'alert-1',
        transactionId: 'txn-1',
        tenantId: 'tenant-1',
        status: 'OPEN',
      },
    });

    expect(log.eventType).toBe('compliance.alert.raised');
    expect(log.resourceType).toBe('compliance');
    expect(log.resourceId).toBe('txn-1');
    expect(log.outcome).toBe(AuditOutcome.SUCCESS);
  });

  it('replays a resource timeline and exports CSV', async () => {
    await service.appendLog({
      eventType: 'kyc.submitted',
      actorId: 'customer-1',
      actorType: 'customer',
      action: 'submit',
      resourceType: 'kyc',
      resourceId: 'kyc-1',
      payload: {},
      tenantId: 'tenant-1',
    });

    const replay = await service.forensicReplay('kyc', 'kyc-1', 'tenant-1');
    const csv = await service.exportCsv('tenant-1');

    expect(replay.chain).toHaveLength(1);
    expect(csv).toContain('eventType');
    expect(csv).toContain('kyc.submitted');
  });

  it('detects a broken hash chain', async () => {
    await service.appendLog({
      eventType: 'payment.completed',
      actorId: 'system',
      actorType: 'system',
      action: 'payment.completed',
      resourceType: 'payment',
      resourceId: 'pay-1',
      payload: { amount: 1000 },
      tenantId: 'tenant-1',
    });
    logs[0].payload = { amount: 999999 };

    await expect(service.verifyHashChain('tenant-1')).resolves.toMatchObject({
      valid: false,
      brokenAt: 'audit-1',
    });
  });

  it('rejects update and delete operations', () => {
    expect(() => service.updateLog()).toThrow(MethodNotAllowedException);
    expect(() => service.deleteLog()).toThrow(MethodNotAllowedException);
  });
});
