import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditHashService {
  calculateHash(log: AuditLog): string {
    const data = `${log.eventType}|${log.actorId}|${log.action}|${log.resourceType}|${log.resourceId}|${log.outcome}|${JSON.stringify(log.payload)}|${log.previousHash}`;
    return createHash('sha256').update(data).digest('hex');
  }

  verifyChain(logs: AuditLog[]): { valid: boolean; brokenAt?: string } {
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const expectedHash = this.calculateHash(log);
      if (log.hash !== expectedHash) {
        return { valid: false, brokenAt: log.id };
      }
      if (i > 0 && log.previousHash !== logs[i - 1].hash) {
        return { valid: false, brokenAt: log.id };
      }
    }
    return { valid: true };
  }
}
