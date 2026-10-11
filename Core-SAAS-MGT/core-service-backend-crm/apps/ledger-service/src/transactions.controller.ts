import { Controller, Get, Post, Body, Query, Headers, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from './entities/journal-entry.entity';
import { PostingEngineService, PostingDto } from './posting-engine.service';

const ROOT_TENANT = 'root-admin';

@ApiTags('Ledger Transactions')
@ApiBearerAuth('JWT-auth')
@Controller('ledger/transactions')
export class TransactionsController {
  constructor(
    private readonly postingEngineService: PostingEngineService,
    @InjectRepository(JournalEntry)
    private readonly journalRepo: Repository<JournalEntry>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Post a new transaction', description: 'Posts a double-entry journal transaction to the ledger. Requires balanced debits and credits.' })
  @ApiBody({ type: PostingDto, description: 'Posting payload with references, entries, and amounts' })
  @ApiResponse({ status: 201, description: 'Transaction posted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request – unbalanced or invalid transaction' })
  async postTransaction(
    @Body() dto: PostingDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const result = await this.postingEngineService.postTransaction(dto);
    return {
      id: result.id,
      reference: result.reference,
      description: result.description,
      postingDate: result.postingDate,
      currency: result.currency,
      totalAmount: result.totalAmount,
      tenantId: result.tenantId,
      createdAt: result.createdAt,
      entries: (result.entries || []).map((entry) => ({
        id: entry.id,
        amount: entry.amount,
        side: entry.side,
        accountId: entry.account?.id,
        subLedgerId: entry.subLedgerId,
        subLedgerType: entry.subLedgerType,
        tenantId: entry.tenantId,
      })),
    };
  }

  @Get()
  @ApiOperation({ summary: 'List transactions', description: 'Paginated list of journal transactions with optional filters by date, reference, sub-ledger, or GL account.' })
  @ApiQuery({ name: 'tenantId', required: false, type: 'string', description: 'Tenant ID', example: 'root-admin' })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number (default: 1)', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: 'number', description: 'Items per page (default: 25)', example: 25 })
  @ApiQuery({ name: 'fromDate', required: false, type: 'string', description: 'Filter: start date (ISO 8601)', example: '2026-01-01' })
  @ApiQuery({ name: 'toDate', required: false, type: 'string', description: 'Filter: end date (ISO 8601)', example: '2026-01-31' })
  @ApiQuery({ name: 'reference', required: false, type: 'string', description: 'Filter by reference (partial match)', example: 'PAY-' })
  @ApiQuery({ name: 'subLedgerId', required: false, type: 'string', description: 'Filter by sub-ledger account ID', example: '6217129210' })
  @ApiQuery({ name: 'glAccountId', required: false, type: 'string', description: 'Filter by GL account ID', example: 'gl-1000-0001' })
  @ApiResponse({ status: 200, description: 'Paginated list of transactions' })
  async listTransactions(
    @Query('tenantId') tenantId?: string,
    @Query('page') pageStr?: string,
    @Query('pageSize') pageSizeStr?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('reference') reference?: string,
    @Query('subLedgerId') subLedgerId?: string,
    @Query('glAccountId') glAccountId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const page = Math.max(1, Number(pageStr || 1));
    const pageSize = Math.max(1, Number(pageSizeStr || 25));

    const qb = this.journalRepo
      .createQueryBuilder('journal')
      .leftJoinAndSelect('journal.entries', 'entry')
      .leftJoinAndSelect('entry.account', 'account');

    if (finalTenantId !== ROOT_TENANT) {
      qb.where('journal.tenantId = :tenantId', { tenantId: finalTenantId });
    }

    if (reference) {
      qb.andWhere('journal.reference ILIKE :reference', { reference: `%${reference}%` });
    }

    if (fromDate) {
      qb.andWhere('journal.postingDate >= :fromDate', { fromDate: new Date(fromDate) });
    }

    if (toDate) {
      qb.andWhere('journal.postingDate <= :toDate', { toDate: new Date(toDate) });
    }

    if (subLedgerId) {
      qb.andWhere('entry.subLedgerId = :subLedgerId', { subLedgerId });
    }

    if (glAccountId) {
      qb.andWhere('account.id = :glAccountId', { glAccountId });
    }

    const totalItems = await qb.getCount();
    const data = await qb
      .orderBy('journal.postingDate', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return {
      data,
      page,
      pageSize,
      totalPages,
      totalItems,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID', description: 'Retrieve a single journal transaction by its unique ID.' })
  @ApiParam({ name: 'id', required: true, type: 'string', description: 'Journal entry ID', example: 'journal-uuid-1234' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(
    @Param('id') id: string,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const where: any = { id };
    if (finalTenantId !== ROOT_TENANT) {
      where.tenantId = finalTenantId;
    }
    const journal = await this.journalRepo.findOne({
      where,
      relations: ['entries', 'entries.account'],
    });
    if (!journal) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }
    return journal;
  }

  @Get('reference/:ref')
  @ApiOperation({ summary: 'Get transaction by reference', description: 'Retrieve a journal transaction by its business reference string.' })
  @ApiParam({ name: 'ref', required: true, type: 'string', description: 'Transaction reference', example: 'PAY-2026-00123' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getByReference(
    @Param('ref') reference: string,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    const where: any = { reference };
    if (finalTenantId !== ROOT_TENANT) {
      where.tenantId = finalTenantId;
    }
    const journal = await this.journalRepo.findOne({
      where,
      relations: ['entries', 'entries.account'],
    });
    if (!journal) {
      throw new NotFoundException(`Transaction with reference ${reference} not found`);
    }
    return journal;
  }
}
