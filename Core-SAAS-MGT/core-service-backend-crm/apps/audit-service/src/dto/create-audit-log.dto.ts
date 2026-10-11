import { AuditOutcome } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  tenantId: string;
  eventType: string;
  actorId: string;
  actorType: string;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome?: AuditOutcome;
  payload?: Record<string, unknown>;
  correlationId?: string;
}
