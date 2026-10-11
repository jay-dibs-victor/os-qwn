export class QueryAuditLogDto {
  tenantId: string;
  actorId?: string;
  resourceType?: string;
  resourceId?: string;
  correlationId?: string;
}
