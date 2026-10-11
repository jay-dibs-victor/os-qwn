export class IngestAuditEventDto {
  routingKey: string;
  payload?: Record<string, unknown>;
  tenantId?: string;
}
