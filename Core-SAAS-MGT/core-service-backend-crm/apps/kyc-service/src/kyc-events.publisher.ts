import { Injectable } from '@nestjs/common';
import { KycRecord } from './entities/kyc-record.entity';

@Injectable()
export class KycEventsPublisher {
  async publishSubmitted(record: KycRecord): Promise<void> {
    // TODO: emit event to message queue
  }

  async publishApproved(record: KycRecord): Promise<void> {
    // TODO: emit event to message queue
  }

  async publishRejected(record: KycRecord): Promise<void> {
    // TODO: emit event to message queue
  }
}
