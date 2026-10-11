import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  ReversalRecord,
  ReversalStatus,
  ReversalType,
} from './entities/reversal-record.entity';
import { CreateReversalDto } from './dto/create-reversal.dto';
import { QueryReversalHistoryDto } from './dto/query-reversal-history.dto';
import { ConfigService } from '@nestjs/config';
import { ReversalEventsPublisher } from './reversal-events.publisher';
import axios from 'axios';

interface LedgerEntryResponse {
  id: string;
  amount: number;
  side: 'DEBIT' | 'CREDIT';
  subLedgerId?: string;
  subLedgerType?: string;
  account: { id: string };
}

interface JournalEntryResponse {
  id: string;
  reference: string;
  totalAmount?: number;
  currency?: string;
  entries: LedgerEntryResponse[];
}

@Injectable()
export class ReversalServiceService {
  private readonly logger = new Logger(ReversalServiceService.name);

  constructor(
    @InjectRepository(ReversalRecord)
    private readonly reversalRepo: Repository<ReversalRecord>,
    private readonly configService: ConfigService,
    private readonly eventsPublisher: ReversalEventsPublisher,
  ) {}

  async createReversal(dto: CreateReversalDto, bypassApproval = false) {
    const originalTxId = dto.originalTransactionId || dto.transactionId;
    if (!originalTxId) {
      throw new BadRequestException(
        'originalTransactionId or transactionId is required',
      );
    }

    const ledgerHost = this.configService.get<string>('LEDGER_SERVICE_HOST');
    const ledgerPort = this.configService.get<number>('LEDGER_SERVICE_PORT');
    const ledgerUrl = `http://${ledgerHost}:${ledgerPort}/ledger/posting/transaction`;

    // 1. Fetch original transaction from ledger
    let originalTx: JournalEntryResponse;
    try {
      const response = await axios.get<JournalEntryResponse>(
        `${ledgerUrl}/${originalTxId}`,
      );
      originalTx = response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to fetch original transaction: ${message}`);
      throw new NotFoundException(
        `Original transaction ${originalTxId} not found in ledger.`,
      );
    }

    if (!originalTx) {
      throw new NotFoundException(
        `Original transaction ${originalTxId} not found.`,
      );
    }

    // 2. Validate partial reversal / total amount limits
    const type = dto.type || ReversalType.FULL_REVERSAL;
    const origAmount = Number(
      originalTx.totalAmount ??
        originalTx.entries
          .filter((e) => e.side === 'DEBIT')
          .reduce((sum, e) => sum + Number(e.amount), 0),
    );
    let reversalAmount = dto.amount ?? origAmount;

    if (reversalAmount <= 0) {
      throw new BadRequestException(
        'Reversal amount must be greater than zero.',
      );
    }
    if (reversalAmount > origAmount) {
      throw new BadRequestException(
        'Reversal amount cannot exceed original transaction amount.',
      );
    }

    if (
      type === ReversalType.PARTIAL_REVERSAL ||
      type === ReversalType.CHARGEBACK
    ) {
      if (dto.amount !== undefined) {
        reversalAmount = dto.amount;
        if (reversalAmount <= 0) {
          throw new BadRequestException(
            'Reversal amount must be greater than zero.',
          );
        }
        if (reversalAmount > origAmount) {
          throw new BadRequestException(
            'Reversal amount cannot exceed original transaction amount.',
          );
        }
      }
    }

    // Ensure sum of all completed/pending reversals does not exceed original transaction amount
    const existingReversals = await this.reversalRepo.find({
      where: {
        originalTransactionId: originalTxId,
        status: In([
          ReversalStatus.COMPLETED,
          ReversalStatus.PENDING,
          ReversalStatus.APPROVED,
        ]),
      },
    });
    const totalReversed = existingReversals.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );
    if (totalReversed + reversalAmount > origAmount) {
      throw new BadRequestException(
        `Total reversed amount (${totalReversed + reversalAmount}) would exceed the original transaction amount (${origAmount}).`,
      );
    }

    // 3. Create & Save Reversal Record
    const record = this.reversalRepo.create({
      originalTransactionId: originalTxId,
      reason: dto.reason,
      reasonDescription: dto.reasonDescription,
      amount: reversalAmount,
      currency: originalTx.currency ?? 'NGN',
      tenantId: dto.tenantId,
      requestedBy: dto.requestedBy,
      type: type,
      status: ReversalStatus.PENDING,
    });

    const savedRecord = await this.reversalRepo.save(record);
    this.eventsPublisher.publishInitiated(savedRecord);

    if (type === ReversalType.CHARGEBACK) {
      this.eventsPublisher.publishChargebackCreated(savedRecord);
    }

    // 4. Execution Gate
    if (savedRecord.amount <= 100000 || bypassApproval) {
      await this.executeReversal(savedRecord, originalTx);
    }

    const loadedRecord = await this.reversalRepo.findOne({
      where: { id: savedRecord.id },
    });
    return {
      ...(loadedRecord || savedRecord),
      transactionId: (loadedRecord || savedRecord).originalTransactionId,
    };
  }

  async executeReversal(
    record: ReversalRecord,
    originalTx: JournalEntryResponse,
  ) {
    this.logger.log(`Executing reversal for record ${record.id}`);

    const ledgerHost = this.configService.get<string>('LEDGER_SERVICE_HOST');
    const ledgerPort = this.configService.get<number>('LEDGER_SERVICE_PORT');
    const ledgerUrl = `http://${ledgerHost}:${ledgerPort}/ledger/posting/transaction`;

    // Proportional leg scaling for partial reversals
    const origAmount = Number(
      originalTx.totalAmount ??
        originalTx.entries
          .filter((e) => e.side === 'DEBIT')
          .reduce((sum, e) => sum + Number(e.amount), 0),
    );
    const scale = origAmount > 0 ? record.amount / origAmount : 1;

    // Invert the legs
    const reversedEntries = originalTx.entries.map(
      (entry: LedgerEntryResponse) => ({
        glAccountId: entry.account.id,
        amount: Number((entry.amount * scale).toFixed(2)),
        side: entry.side === 'DEBIT' ? 'CREDIT' : 'DEBIT',
        subLedgerId: entry.subLedgerId,
        subLedgerType: entry.subLedgerType,
      }),
    );

    const prefix = record.type === ReversalType.CHARGEBACK ? 'CB' : 'REV';

    try {
      const response = await axios.post<{ id: string }>(ledgerUrl, {
        reference: `${prefix}-${record.originalTransactionId.substring(0, 8)}`,
        description: `Reversal of ${record.originalTransactionId}. Reason: ${record.reason}`,
        postingDate: new Date(),
        currency: record.currency,
        tenantId: record.tenantId,
        entries: reversedEntries,
      });

      record.reversalTransactionId = response.data.id;
      record.status = ReversalStatus.COMPLETED;
      const finalRecord = await this.reversalRepo.save(record);
      this.eventsPublisher.publishCompleted(finalRecord);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Reversal execution failed: ${message}`);
      record.status = ReversalStatus.FAILED;
      const finalRecord = await this.reversalRepo.save(record);
      this.eventsPublisher.publishFailed(finalRecord, message);
      throw new BadRequestException('Failed to post reversal to ledger.');
    }
  }

  async getReversal(id: string) {
    const record = await this.reversalRepo.findOne({
      where: [{ id }, { originalTransactionId: id }],
    });
    if (!record) throw new NotFoundException('Reversal record not found');
    return {
      ...record,
      transactionId: record.originalTransactionId,
    };
  }

  async listHistory(query: QueryReversalHistoryDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 25;

    const qb = this.reversalRepo
      .createQueryBuilder('reversal')
      .where('reversal.tenantId = :tenantId', { tenantId: query.tenantId })
      .orderBy('reversal.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('reversal.status = :status', { status: query.status });
    }
    if (query.type) {
      qb.andWhere('reversal.type = :type', { type: query.type });
    }
    if (query.originalTransactionId) {
      qb.andWhere('reversal.originalTransactionId = :originalTransactionId', {
        originalTransactionId: query.originalTransactionId,
      });
    }
    if (query.fromDate) {
      qb.andWhere('reversal.createdAt >= :fromDate', {
        fromDate: new Date(query.fromDate),
      });
    }
    if (query.toDate) {
      qb.andWhere('reversal.createdAt <= :toDate', {
        toDate: new Date(query.toDate),
      });
    }

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    return {
      data,
      page,
      pageSize,
      totalPages,
      totalItems,
      hasMore: page < totalPages,
    };
  }
}
