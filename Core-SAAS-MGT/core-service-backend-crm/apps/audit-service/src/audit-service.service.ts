import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditExportService } from './audit-export.service';
import { AuditHashService } from './audit-hash.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { IngestAuditEventDto } from './dto/ingest-audit-event.dto';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { AuditLog, AuditOutcome } from './entities/audit-log.entity';

@Injectable()
export class AuditServiceService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    private readonly hashService: AuditHashService,
    private readonly exportService: AuditExportService,
  ) {}

  async appendLog(dto: CreateAuditLogDto): Promise<AuditLog> {
    const previous = await this.getLastLog(dto.tenantId);
    const previousHash = previous?.hash || 'GENESIS';
    const createdAt = new Date();
    const log = this.auditRepo.create({
      ...dto,
      outcome: dto.outcome ?? AuditOutcome.SUCCESS,
      previousHash,
      createdAt,
    });
    log.hash = this.hashService.calculateHash(log);
    return this.auditRepo.save(log);
  }

  async ingestEvent(dto: IngestAuditEventDto): Promise<AuditLog> {
    const payload = dto.payload || {};
    return this.appendLog({
      eventType: dto.routingKey,
      actorId: (
        payload.actorId || payload.userId || payload.requestedBy || 'system'
      ) as string,
      actorType: (payload.actorType || 'SERVICE') as string,
      action: (payload.action || dto.routingKey) as string,
      resourceType: (
        payload.resourceType || this.resourceTypeFromRoutingKey(dto.routingKey)
      ) as string,
      resourceId: (
        payload.resourceId ||
        payload.id ||
        payload.transactionId ||
        payload.alertId ||
        payload.retryId ||
        'unknown'
      ) as string,
      outcome: this.outcomeFromPayload(payload),
      payload,
      correlationId:
        typeof payload.correlationId === 'string'
          ? payload.correlationId
          : undefined,
      tenantId: dto.tenantId || (payload.tenantId || 'default') as string,
    });
  }

  async list(query: QueryAuditLogDto): Promise<AuditLog[]> {
    const where: Record<string, string> = { tenantId: query.tenantId };
    if (query.actorId) where.actorId = query.actorId;
    if (query.resourceType) where.resourceType = query.resourceType;
    if (query.resourceId) where.resourceId = query.resourceId;
    if (query.correlationId) where.correlationId = query.correlationId;
    return this.auditRepo.find({ where, order: { createdAt: 'ASC' } });
  }

  async forensicReplay(
    resourceType: string,
    resourceId: string,
    tenantId: string,
  ) {
    const logs = await this.auditRepo.find({
      where: { resourceType, resourceId, tenantId },
      order: { createdAt: 'ASC' },
    });

    return {
      resourceType,
      resourceId,
      tenantId,
      chain: logs.map((log) => ({
        at: log.createdAt,
        actorId: log.actorId,
        action: log.action,
        outcome: log.outcome,
        eventType: log.eventType,
        hash: log.hash,
      })),
    };
  }

  async actorTrace(actorId: string, tenantId: string): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { actorId, tenantId },
      order: { createdAt: 'ASC' },
    });
  }

  async verifyHashChain(tenantId: string) {
    const logs = await this.auditRepo.find({
      where: { tenantId },
      order: { createdAt: 'ASC' },
    });
    return {
      tenantId,
      total: logs.length,
      ...this.hashService.verifyChain(logs),
    };
  }

  async exportCsv(tenantId: string): Promise<string> {
    const logs = await this.auditRepo.find({
      where: { tenantId },
      order: { createdAt: 'ASC' },
    });
    return this.exportService.toCsv(logs);
  }

  updateLog(): never {
    throw new MethodNotAllowedException('Audit logs are append-only.');
  }

  deleteLog(): never {
    throw new MethodNotAllowedException('Audit logs are append-only.');
  }

  private async getLastLog(tenantId: string): Promise<AuditLog | null> {
    const logs = await this.auditRepo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: 1,
    });
    return logs[0] || null;
  }

  private resourceTypeFromRoutingKey(routingKey: string): string {
    return routingKey.split('.')[0] || 'event';
  }

  private outcomeFromPayload(payload: Record<string, unknown>): AuditOutcome {
    const status = ((payload.status || payload.outcome || '') as string).toUpperCase();
    if (status.includes('FAIL') || status.includes('REJECT'))
      return AuditOutcome.FAILURE;
    if (status.includes('PENDING')) return AuditOutcome.PENDING;
    return AuditOutcome.SUCCESS;
  }
}
