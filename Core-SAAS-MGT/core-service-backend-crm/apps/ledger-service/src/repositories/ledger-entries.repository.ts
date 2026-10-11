import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, Between } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { LedgerEntry, EntrySide } from '../entities/ledger-entry.entity';

@Injectable()
export class LedgerEntriesRepository extends AbstractRepository<LedgerEntry> {
  protected readonly logger = new Logger(LedgerEntriesRepository.name);

  constructor(
    @InjectRepository(LedgerEntry)
    protected readonly ledgerEntryRepository: Repository<LedgerEntry>,
    protected readonly entityManager: EntityManager,
  ) {
    super(ledgerEntryRepository, entityManager);
  }

  async getDailyTotal(subLedgerId: string, tenantId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const entries = await this.find({
      subLedgerId,
      tenantId,
      createdAt: Between(startOfDay, endOfDay),
    });

    return entries.reduce((sum, entry) => {
      // Only count debits for daily limit (standard banking practice)
      if (entry.side === EntrySide.DEBIT) {
        return sum + Number(entry.amount);
      }
      return sum;
    }, 0);
  }

  async getSubLedgerBalance(subLedgerId: string, tenantId: string): Promise<number> {
    const entries = await this.find({
      subLedgerId,
      tenantId,
    });

    return entries.reduce((sum, entry) => {
      const amount = Number(entry.amount);
      if (entry.side === EntrySide.CREDIT) {
        return sum + amount;
      } else {
        return sum - amount;
      }
    }, 0);
  }
}
