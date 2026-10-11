import { Controller, Post, Body, Get, Param, Query, Headers, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostingEngineService, PostingDto } from './posting-engine.service';
import { JournalEntry } from './entities/journal-entry.entity';

const ROOT_TENANT = 'root-admin';

@ApiTags('Ledger Posting')
@ApiBearerAuth('JWT-auth')
@Controller('ledger/posting')
export class PostingController {
  constructor(
    private readonly postingEngineService: PostingEngineService,
    @InjectRepository(JournalEntry)
    private readonly journalRepo: Repository<JournalEntry>,
  ) {}

  @Post('transaction')
  @ApiOperation({
    summary: 'Post a balanced transaction',
    description: `Post a double-entry journal transaction. Every debit must equal every credit (balanced entry).

**GL Account UUIDs** — get them from \`GET /ledger/accounts?tenantId=\` first.

**Example flows:**
- Trip fare: DR Customer Wallet / CR Platform Revenue
- Commission split: DR Revenue / CR Commission Income + Driver Payable
- Paystack settlement: DR Cash at Bank / CR Clearing Account`,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reference', 'description', 'postingDate', 'tenantId', 'entries'],
      properties: {
        reference:   { type: 'string', example: 'TRIP-2026-000001', description: 'Unique transaction reference' },
        description: { type: 'string', example: 'Trip fare: Driver D001 → Rider R001' },
        postingDate: { type: 'string', format: 'date', example: '2026-06-02' },
        currency:    { type: 'string', example: 'USD', default: 'USD' },
        tenantId:    { type: 'string', example: 'root-admin' },
        entries: {
          type: 'array',
          description: 'Balanced debit/credit lines. Total debits MUST equal total credits.',
          items: {
            type: 'object',
            required: ['glAccountId', 'amount', 'side'],
            properties: {
              glAccountId:    { type: 'string', format: 'uuid', description: 'UUID of GL account (from GET /ledger/accounts)' },
              amount:         { type: 'number', example: 42.50 },
              side:           { type: 'string', enum: ['DEBIT', 'CREDIT'], example: 'DEBIT' },
              subLedgerId:    { type: 'string', description: 'Customer/driver/partner UUID for sub-ledger tracking' },
              subLedgerType:  { type: 'string', enum: ['CUSTOMER_ACCOUNT', 'DRIVER_ACCOUNT', 'PARTNER_ACCOUNT'], description: 'Sub-ledger type for granular tracking' },
            },
          },
          example: [
            { glAccountId: 'gl-uuid-1', amount: 42.50, side: 'DEBIT' },
            { glAccountId: 'gl-uuid-2', amount: 42.50, side: 'CREDIT' },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction posted — returns journal entry ID and reference',
    schema: {
      example: {
        id: 'journal-uuid',
        reference: 'TRIP-2026-000001',
        description: 'Trip fare: Driver D001 → Rider R001',
        postingDate: '2026-06-02',
        currency: 'USD',
        totalAmount: 42.50,
        tenantId: 'root-admin',
        createdAt: '2026-06-02T11:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Unbalanced entry (debits ≠ credits) or invalid GL account UUID' })
  async postTransaction(@Body() dto: PostingDto) {
    const result = await this.postingEngineService.postTransaction(dto);
    // Return safe subset to avoid circular JSON serialization
    return {
      id:          result.id,
      reference:   result.reference,
      description: result.description,
      postingDate: result.postingDate,
      currency:    result.currency,
      totalAmount: result.totalAmount,
      tenantId:    result.tenantId,
      createdAt:   result.createdAt,
      entriesCount: result.entries?.length ?? 0,
    };
  }

  @Get('transaction/:id')
  @ApiOperation({ summary: 'Get transaction by ID (direct)', description: 'Retrieve a posted transaction by journal entry ID.' })
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
    const result = await this.journalRepo.findOne({
      where,
      relations: ['entries', 'entries.account'],
    });
    if (!result) return null;
    return {
      id:          result.id,
      reference:   result.reference,
      description: result.description,
      postingDate: result.postingDate,
      currency:    result.currency,
      totalAmount: result.totalAmount,
      tenantId:    result.tenantId,
      createdAt:   result.createdAt,
      entries:     result.entries?.map(e => ({
        id:            e.id,
        amount:        e.amount,
        side:          e.side,
        subLedgerId:   e.subLedgerId,
        subLedgerType: e.subLedgerType,
        account:       e.account ? { id: e.account.id, code: e.account.code, name: e.account.name, type: e.account.type } : undefined,
      })),
    };
  }

  @Get('reference/:ref')
  @ApiOperation({ summary: 'Get transaction by reference (direct)', description: 'Retrieve a posted transaction by reference string.' })
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
    const result = await this.journalRepo.findOne({
      where,
      relations: ['entries', 'entries.account'],
    });
    if (!result) return null;
    return {
      id:          result.id,
      reference:   result.reference,
      description: result.description,
      postingDate: result.postingDate,
      currency:    result.currency,
      totalAmount: result.totalAmount,
      tenantId:    result.tenantId,
      createdAt:   result.createdAt,
      entries:     result.entries?.map(e => ({
        id:            e.id,
        amount:        e.amount,
        side:          e.side,
        subLedgerId:   e.subLedgerId,
        subLedgerType: e.subLedgerType,
        account:       e.account ? { id: e.account.id, code: e.account.code, name: e.account.name, type: e.account.type } : undefined,
      })),
    };
  }
}
