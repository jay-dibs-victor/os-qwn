import { Injectable, BadRequestException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Connection, EntityManager } from 'typeorm';
import axios from 'axios';
import { JournalEntry } from './entities/journal-entry.entity';
import { LedgerEntry, EntrySide } from './entities/ledger-entry.entity';
import { GlAccountsRepository } from './repositories/gl-accounts.repository';
import { EventStoreService } from './event-store.service';
import { AccountBalanceOutbox, OutboxStatus } from './entities/account-balance-outbox.entity';

export class PostingEntryDto {
  @ApiProperty({ description: 'GL account ID to post against', example: 'gl-1000-0001' })
  glAccountId: string;

  @ApiProperty({ description: 'Amount for this entry', example: 1000.00 })
  amount: number;

  @ApiProperty({ description: 'Entry side: DEBIT or CREDIT', enum: EntrySide, example: 'DEBIT' })
  side: EntrySide;

  @ApiPropertyOptional({ description: 'Sub-ledger ID (e.g. customer account number)', example: 'ACC-2024-001' })
  subLedgerId?: string;

  @ApiPropertyOptional({ description: 'Sub-ledger type', example: 'CUSTOMER_ACCOUNT' })
  subLedgerType?: string;
}

export class PostingDto {
  @ApiProperty({ description: 'Business reference for the transaction', example: 'PAY-2026-00123' })
  reference: string;

  @ApiProperty({ description: 'Description of the transaction', example: 'Trip payment: trip-uuid-1234' })
  description: string;

  @ApiProperty({ description: 'Posting date (ISO 8601)', example: '2026-05-31T10:30:00Z' })
  postingDate: Date;

  @ApiPropertyOptional({ description: 'Currency code (ISO 4217)', example: 'NGN', default: 'NGN' })
  currency?: string;

  @ApiProperty({ description: 'Tenant ID', example: 'tenant-001' })
  tenantId: string;

  @ApiProperty({ description: 'Array of posting entries (must be balanced: debits = credits)', type: [PostingEntryDto] })
  entries: PostingEntryDto[];
}

@Injectable()
export class PostingEngineService {
  constructor(
    private readonly connection: Connection,
    private readonly glAccountsRepository: GlAccountsRepository,
    private readonly eventStoreService: EventStoreService,
    private readonly configService: ConfigService,
  ) {}

  async postTransaction(dto: PostingDto, manager?: EntityManager) {
    if (!dto.entries || dto.entries.length === 0) {
      throw new BadRequestException('At least one entry is required');
    }
    const debitTotal = dto.entries
      .filter((e) => e.side === EntrySide.DEBIT)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const creditTotal = dto.entries
      .filter((e) => e.side === EntrySide.CREDIT)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    if (Math.abs(debitTotal - creditTotal) > 0.001) {
      throw new BadRequestException('Transaction is not balanced');
    }

    if (manager) {
      return this.executePosting(dto, manager);
    }

    return this.connection.transaction('SERIALIZABLE', async (m) => {
      return this.executePosting(dto, m);
    });
  }

  private async executePosting(dto: PostingDto, manager: EntityManager) {
    const totalAmount = dto.entries
      .filter((e) => e.side === EntrySide.DEBIT)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const journal = new JournalEntry();
    journal.reference = dto.reference;
    journal.description = dto.description;
    if (!dto.postingDate || isNaN(new Date(dto.postingDate).getTime())) {
      journal.postingDate = new Date();
    } else {
      journal.postingDate = dto.postingDate;
    }
    journal.currency = dto.currency || 'NGN';
    journal.totalAmount = totalAmount;
    journal.tenantId = dto.tenantId;
    journal.entries = [];

    for (const entryDto of dto.entries) {
      // 1. PND IS THE FIRST CHECK (Global approach)
      if (
        entryDto.subLedgerId &&
        entryDto.subLedgerType === 'CUSTOMER_ACCOUNT'
      ) {
        try {
          const accountsHost = this.configService.get<string>(
            'ACCOUNTS_SERVICE_HOST',
          );
          const accountsPort = this.configService.get<number>(
            'ACCOUNTS_SERVICE_PORT',
          );
          const accountsUrl = `http://${accountsHost}:${accountsPort}/accounts`;

          await axios.get(
            `${accountsUrl}/${entryDto.subLedgerId}/check-restriction`,
            {
              params: { type: entryDto.side },
            },
          );

          // 2. KYC LIMITS CHECK
          await axios.get(
            `${accountsUrl}/${entryDto.subLedgerId}/check-kyc-limits`,
            {
              params: { amount: entryDto.amount },
            },
          );
        } catch (error: unknown) {
          let message = 'Account restriction check failed';
          if (axios.isAxiosError(error) && error.response) {
            const data = error.response.data as { message?: string };
            message = data.message || message;
          }
          throw new BadRequestException(message);
        }
      }

      const account = await this.glAccountsRepository.findOneNullable({
        id: entryDto.glAccountId,
      });

      if (!account) {
        throw new BadRequestException(
          `GL Account ${entryDto.glAccountId} not found`,
        );
      }

      const ledgerEntry = new LedgerEntry();
      ledgerEntry.amount = entryDto.amount;
      ledgerEntry.side = entryDto.side;
      ledgerEntry.account = account;
      ledgerEntry.subLedgerId = entryDto.subLedgerId;
      ledgerEntry.subLedgerType = entryDto.subLedgerType;
      ledgerEntry.tenantId = dto.tenantId;
      ledgerEntry.journalEntry = journal;

      journal.entries.push(ledgerEntry);

      if (entryDto.side === EntrySide.DEBIT) {
        account.balance = Number(account.balance) + Number(entryDto.amount);
      } else {
        account.balance = Number(account.balance) - Number(entryDto.amount);
      }
      await manager.save(account);

      await this.eventStoreService.appendToStream(
        account.id,
        'ACCOUNT_POSTING',
        {
          amount: entryDto.amount,
          side: entryDto.side,
          journalReference: dto.reference,
          subLedgerId: entryDto.subLedgerId,
        },
        dto.tenantId,
        undefined,
      );
    }

    const savedJournal = await manager.save(journal);

    const outboxRecords = savedJournal.entries
      .filter(
        (e) => e.subLedgerId && e.subLedgerType === 'CUSTOMER_ACCOUNT',
      )
      .map((e) => {
        const record = new AccountBalanceOutbox();
        record.ledgerEntryId = e.id;
        record.accountNumber = e.subLedgerId!;
        record.side = e.side;
        record.amount = Number(e.amount);
        record.reference = savedJournal.reference;
        record.currency = savedJournal.currency;
        record.tenantId = savedJournal.tenantId;
        record.status = OutboxStatus.PENDING;
        record.attempts = 0;
        record.lastError = null;
        return record;
      });

    if (outboxRecords.length) {
      const savedOutbox = await manager.save(AccountBalanceOutbox, outboxRecords);
      try {
        const accountsHost = this.configService.get<string>(
          'ACCOUNTS_SERVICE_HOST',
        );
        const accountsPort = this.configService.get<number>(
          'ACCOUNTS_SERVICE_PORT',
        );
        const accountsUrl = `http://${accountsHost}:${accountsPort}/accounts/postings/apply-batch`;

        await axios.post(
          accountsUrl,
          savedOutbox.map((p) => ({
            accountNumber: p.accountNumber,
            posting: {
              ledgerEntryId: p.ledgerEntryId,
              reference: p.reference,
              side: p.side,
              amount: Number(p.amount),
              tenantId: p.tenantId,
              currency: p.currency,
            },
          })),
        );

        for (const record of savedOutbox) {
          record.status = OutboxStatus.PROCESSED;
          record.lastError = null;
        }
        await manager.save(AccountBalanceOutbox, savedOutbox);
      } catch (error: unknown) {
        let message = 'Account balance apply failed';
        if (axios.isAxiosError(error) && error.response) {
          const data = error.response.data as { message?: string };
          message = data.message || message;
        }
        throw new BadRequestException(message);
      }
    }

    return savedJournal;
  }

  async glsToGls(
    fromGlId: string,
    toGlId: string,
    amount: number,
    reference: string,
    tenantId: string,
  ) {
    return this.postTransaction({
      reference,
      description: `GL to GL Transfer: ${reference}`,
      postingDate: new Date(),
      tenantId,
      entries: [
        { glAccountId: fromGlId, amount, side: EntrySide.CREDIT },
        { glAccountId: toGlId, amount, side: EntrySide.DEBIT },
      ],
    });
  }

  async customerToGls(
    customerId: string,
    glAccountId: string,
    amount: number,
    side: EntrySide,
    reference: string,
    tenantId: string,
  ) {
    return this.postTransaction({
      reference,
      description: `Customer Transaction: ${reference}`,
      postingDate: new Date(),
      tenantId,
      entries: [
        {
          glAccountId,
          amount,
          side,
          subLedgerId: customerId,
          subLedgerType: 'CUSTOMER_ACCOUNT',
        },
      ],
    });
  }
}
