import { Injectable } from '@nestjs/common';
import { ComplianceAlert } from './entities/compliance-alert.entity';

@Injectable()
export class ComplianceEventsPublisher {
  async publishAlertRaised(alert: ComplianceAlert): Promise<void> {
    // TODO: emit event to message queue
  }

  async publishSarFiled(report: unknown): Promise<void> {
    // TODO: emit event to message queue
  }
}
