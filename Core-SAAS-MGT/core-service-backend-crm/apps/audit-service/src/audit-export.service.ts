import { Injectable } from '@nestjs/common';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditExportService {
  toCsv(logs: AuditLog[]): string {
    const header = 'id,createdAt,eventType,tenantId,actorId,actorType,action,resourceType,resourceId,outcome,correlationId,hash,previousHash';
    const rows = logs.map((l) =>
      [
        l.id,
        l.createdAt?.toISOString(),
        l.eventType,
        l.tenantId,
        l.actorId,
        l.actorType,
        l.action,
        l.resourceType,
        l.resourceId,
        l.outcome,
        l.correlationId,
        l.hash,
        l.previousHash,
      ]
        .map((v) => `"${String(v ?? '')}"`)
        .join(','),
    );
    return [header, ...rows].join('\n');
  }
}
