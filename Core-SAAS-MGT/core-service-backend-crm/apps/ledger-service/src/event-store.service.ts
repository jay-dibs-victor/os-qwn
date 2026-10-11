import { Injectable } from '@nestjs/common';
import { LedgerEventsRepository } from './repositories/ledger-events.repository';
import { LedgerEvent } from './entities/ledger-event.entity';

@Injectable()
export class EventStoreService {
  constructor(
    private readonly ledgerEventsRepository: LedgerEventsRepository,
  ) {}

  async appendToStream(
    streamId: string,
    type: string,
    data: Record<string, any>,
    tenantId: string,
    metadata?: Record<string, any>,
  ) {
    const latestVersion =
      await this.ledgerEventsRepository.getLatestVersion(streamId);

    const event = new LedgerEvent();
    event.streamId = streamId;
    event.type = type;
    event.data = data;
    event.metadata = metadata;
    event.version = latestVersion + 1;
    event.tenantId = tenantId;

    return this.ledgerEventsRepository.create(event);
  }

  async getStream(streamId: string) {
    return this.ledgerEventsRepository.getEventsByStream(streamId);
  }
}
