import { BadRequestException, Controller, Get, Post, Body, Param, Query, Patch, Headers } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GlAccountsService } from './gl-accounts.service';
import { LedgerEntriesRepository } from './repositories/ledger-entries.repository';
import { CreateGlAccountDto, UpdateGlAccountDto } from './dto/gl-account.dto';
import { paginate, parsePagination } from './dto/pagination.dto';

@ApiTags('General Ledger')
@ApiBearerAuth('JWT-auth')
@Controller('ledger/accounts')
export class GlAccountsController {
  constructor(
    private readonly glAccountsService: GlAccountsService,
    private readonly ledgerEntriesRepository: LedgerEntriesRepository,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new GL account',
    description: `Create a GL account in the chart of accounts. Accepts both uppercase (ASSET) and lowercase (asset) type values.

**Standard account code ranges:**
- 1xxx = Assets  
- 2xxx = Liabilities  
- 4xxx = Income/Revenue  
- 5xxx = Expenses  
- 3xxx = Equity`,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['code', 'name', 'type'],
      properties: {
        code:     { type: 'string', example: 'CASH-001', description: 'Unique account code' },
        name:     { type: 'string', example: 'Cash at Bank' },
        type:     { type: 'string', enum: ['asset','liability','income','expense','equity'], example: 'asset', description: 'Accepts uppercase too: ASSET, LIABILITY, etc.' },
        tenantId: { type: 'string', example: 'root-admin', description: 'Can also be passed via x-tenant-id header' },
        currency: { type: 'string', example: 'USD' },
        parentId: { type: 'string', format: 'uuid', description: 'Parent GL account UUID (optional, for hierarchy)' },
      },
      examples: {
        cashAccount:  { summary: 'Asset: Cash at Bank', value: { code: 'CASH-001', name: 'Cash at Bank', type: 'asset', tenantId: 'root-admin', currency: 'USD' } },
        walletLiab:   { summary: 'Liability: Customer Wallet', value: { code: 'CUST-WALLET-001', name: 'Customer NGN Wallet', type: 'liability', tenantId: 'root-admin', currency: 'USD' } },
        tripRevenue:  { summary: 'Income: Trip Revenue', value: { code: 'TRIP-REV-001', name: 'Trip Commission Revenue', type: 'income', tenantId: 'root-admin', currency: 'USD' } },
        driverPay:    { summary: 'Liability: Driver Payable', value: { code: 'DRIV-PAY-001', name: 'Driver Earnings Payable', type: 'liability', tenantId: 'root-admin', currency: 'USD' } },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'GL account created',
    schema: { example: { id: 'uuid', code: 'CASH-001', name: 'Cash at Bank', type: 'asset', tenantId: 'root-admin', balance: 0, currency: 'USD' } },
  })
  @ApiResponse({ status: 400, description: 'Invalid data or missing tenantId' })
  @ApiResponse({ status: 409, description: 'GL account code already exists for this tenant' })
  createGlAccount(
    @Body() dto: CreateGlAccountDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) throw new BadRequestException('tenantId is required');
    return this.glAccountsService.createGlAccount(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List GL accounts by tenant',
    description:
      'Retrieve all GL accounts for a specific tenant with optional pagination.',
  })
  @ApiQuery({
    name: 'tenantId',
    required: true,
    description: 'Tenant ID to filter GL accounts',
    example: 'root-admin',
  })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 50, description: 'Number of records per page' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0, description: 'Number of records to skip (alternative to pageNumber/pageSize)' })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 100, description: 'Number of records to return' })
  @ApiResponse({
    status: 200,
    description: 'GL accounts list retrieved successfully',
    schema: {
      example: {
        data: [
          { id: 'gl-1000-0001', code: '1101', name: 'Cash and Cash Equivalents', type: 'asset', tenantId: 'root-admin', balance: 100000, currency: 'USD' },
          { id: 'gl-2000-0001', code: '2000', name: 'Accounts Payable', type: 'liability', tenantId: 'root-admin', balance: 50000, currency: 'USD' },
        ],
        total: 2,
        pageNumber: 1,
        pageSize: 50,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid tenant ID' })
  async getGlAccounts(
    @Query('tenantId') tenantId?: string,
    @Query() query?: Record<string, any>,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) throw new BadRequestException('tenantId is required');
    const { skip, take } = parsePagination(query || {});
    return paginate(
      await this.glAccountsService.getGlAccounts(finalTenantId, skip, take),
      query || {},
    );
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Get GL account hierarchy trees',
    description:
      'Retrieve the complete chart of accounts organized in a hierarchical tree structure',
  })
  @ApiResponse({
    status: 200,
    description: 'GL account trees retrieved successfully',
    schema: {
      example: {
        assets: {
          id: 'gl-1000',
          code: '1101',
          name: 'Assets',
          children: [
            {
              id: 'gl-1100',
              code: '1100',
              name: 'Current Assets',
              children: [],
            },
          ],
        },
      },
    },
  })
  getGlAccountTrees(
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) throw new BadRequestException('tenantId is required');
    return this.glAccountsService.getGlAccountTrees(finalTenantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get GL account details',
    description: 'Retrieve detailed information about a specific GL account',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'GL Account ID',
    example: 'gl-1000-0001',
  })
  @ApiResponse({
    status: 200,
    description: 'GL account details retrieved successfully',
    schema: {
      example: {
        id: 'gl-1000-0001',
        code: '1101',
        name: 'Cash and Cash Equivalents',
        type: 'asset',
        tenantId: 'root-admin',
        parentId: null,
        currency: 'USD',
        balance: 100000,
        createdAt: '2024-05-23T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'GL account not found' })
  getGlAccount(
    @Param('id') id: string,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) throw new BadRequestException('tenantId is required');
    return this.glAccountsService.getGlAccount(id, finalTenantId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update GL account',
    description: 'Update editable fields of a GL account (name, type, status, currency, etc.)',
  })
  @ApiParam({ name: 'id', required: true, description: 'GL Account ID', example: 'gl-1000-0001' })
  @ApiResponse({ status: 200, description: 'GL account updated successfully' })
  @ApiResponse({ status: 404, description: 'GL account not found' })
  updateGlAccount(
    @Param('id') id: string,
    @Body() dto: UpdateGlAccountDto,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) throw new BadRequestException('tenantId is required');
    return this.glAccountsService.updateGlAccount(id, dto, finalTenantId);
  }

  @Get('sub-ledger/:id/daily-total')
  @ApiOperation({
    summary: 'Get daily total for sub-ledger account',
    description:
      'Calculate and retrieve the daily total balance for a sub-ledger GL account',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Sub-ledger GL Account ID',
    example: 'gl-1100-0001',
  })
  @ApiQuery({
    name: 'tenantId',
    required: true,
    description: 'Tenant ID',
    example: 'root-admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily total calculated successfully',
    schema: {
      example: {
        accountId: 'gl-1100-0001',
        date: '2024-05-23',
        balance: 50000.0,
        currency: 'USD',
        transactionCount: 15,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Sub-ledger account not found' })
  getDailyTotal(
    @Param('id') subLedgerId: string,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) throw new BadRequestException('tenantId is required');
    return this.ledgerEntriesRepository.getDailyTotal(subLedgerId, finalTenantId);
  }

  @Get('sub-ledger/:id/balance')
  @ApiOperation({
    summary: 'Get balance for sub-ledger account',
    description:
      'Calculate and retrieve the balance for a sub-ledger account (Liabilities: Credits - Debits)',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Sub-ledger account ID (NUBAN)',
    example: '1234567890',
  })
  @ApiQuery({
    name: 'tenantId',
    required: true,
    description: 'Tenant ID',
    example: 'root-admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Sub-ledger balance retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Sub-ledger account not found' })
  async getSubLedgerBalance(
    @Param('id') subLedgerId: string,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) throw new BadRequestException('tenantId is required');
    return this.ledgerEntriesRepository.getSubLedgerBalance(subLedgerId, finalTenantId);
  }
}
