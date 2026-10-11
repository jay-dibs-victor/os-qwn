import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { LedgerEvent } from '../entities/ledger-event.entity';

@Injectable()
export class LedgerEventsRepository extends AbstractRepository<LedgerEvent> {
  protected readonly logger = new Logger(LedgerEventsRepository.name);

  constructor(
    @InjectRepository(LedgerEvent)
    repository: Repository<LedgerEvent>,
    entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async getLatestVersion(streamId: string): Promise<number> {
    const latest = await this.repository.findOne({
      where: { streamId },
      order: { version: 'DESC' },
    });
    return latest ? latest.version : 0;
  }

  async getEventsByStream(streamId: string): Promise<LedgerEvent[]> {
    return this.repository.find({
      where: { streamId },
      order: { version: 'ASC' },
    });
  }
}
