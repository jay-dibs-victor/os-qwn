import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';
import { PostingEngineService, PostingDto } from './posting-engine.service';
import { JournalEntry } from './entities/journal-entry.entity';

@Injectable()
export class BatchPostingService {
  constructor(
    private readonly connection: Connection,
    private readonly postingEngineService: PostingEngineService,
  ) {}

  async postBatch(batch: PostingDto[]) {
    return this.connection.transaction(
      'SERIALIZABLE',
      async (manager: EntityManager) => {
        const results: JournalEntry[] = [];
        for (const dto of batch) {
          // We use the posting engine's logic but within this shared transaction manager
          results.push(
            await this.postingEngineService.postTransaction(dto, manager),
          );
        }
        return results;
      },
    );
  }
}
