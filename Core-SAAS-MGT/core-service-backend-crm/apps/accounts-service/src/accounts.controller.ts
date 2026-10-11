import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/account.dto';
import { AccountStatus } from './entities/account.entity';
import {
  ApplyAccountPostingDto,
  QueryAccountPostingHistoryDto,
} from './dto/account-posting.dto';

@Controller('accounts')
@ApiTags('Account Management')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create Account',
    description: 'Create a new bank account for a customer',
  })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully',
    schema: {
      example: {
        accountNumber: '6217129210',
        customerId: '02bc27b4-f2d7-4b5d-a083-89233f5250e4',
        type: 'CURRENT',
        currency: 'USD',
        status: 'ACTIVE',
        balance: 0,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid account data' })
  async createAccount(@Body() dto: CreateAccountDto) {
    return this.accountsService.createAccount(dto);
  }

  @Get(':accountNumber')
  @ApiOperation({
    summary: 'Get Account Details',
    description: 'Retrieve detailed information about a specific account',
  })
  @ApiParam({
    name: 'accountNumber',
    example: '6217129210',
    description: 'Account number',
  })
  @ApiResponse({
    status: 200,
    description: 'Account details retrieved',
    schema: {
      example: {
        accountNumber: '6217129210',
        customerId: '02bc27b4-f2d7-4b5d-a083-89233f5250e4',
        type: 'CURRENT',
        currency: 'USD',
        status: 'ACTIVE',
        balance: 5000.0,
        createdAt: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getAccount(@Param('accountNumber') accountNumber: string) {
    return this.accountsService.getAccount(accountNumber);
  }

  @Get('customer/:customerId')
  @ApiOperation({
    summary: 'List Customer Accounts',
    description: 'List all accounts for a specific customer',
  })
  @ApiParam({
    name: 'customerId',
    example: '02bc27b4-f2d7-4b5d-a083-89233f5250e4',
    description: 'Customer ID',
  })
  @ApiQuery({
    name: 'tenantId',
    example: 'root-admin',
    description: 'Tenant ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer accounts retrieved',
    schema: {
      example: {
        accounts: [
          { accountNumber: '6217129210', type: 'CURRENT', balance: 5000 },
          { accountNumber: 'ACC-2024-002', type: 'SAVINGS', balance: 10000 },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomerAccounts(
    @Param('customerId') customerId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.accountsService.getCustomerAccounts(customerId, tenantId);
  }

  @Patch(':accountNumber/status')
  @ApiOperation({
    summary: 'Update Account Status',
    description:
      'Update the status of an account (e.g., ACTIVE, SUSPENDED, CLOSED)',
  })
  @ApiParam({
    name: 'accountNumber',
    example: '6217129210',
    description: 'Account number',
  })
  @ApiBody({ schema: { example: { status: 'ACTIVE' } } })
  @ApiResponse({
    status: 200,
    description: 'Account status updated',
    schema: { example: { accountNumber: '6217129210', status: 'ACTIVE' } },
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async updateStatus(
    @Param('accountNumber') accountNumber: string,
    @Body('status') status: AccountStatus,
  ) {
    return this.accountsService.updateStatus(accountNumber, status);
  }

  @Get(':accountNumber/check-restriction')
  @ApiOperation({
    summary: 'Check Account Restriction',
    description: 'Check if account has debit or credit restrictions',
  })
  @ApiParam({
    name: 'accountNumber',
    example: '6217129210',
    description: 'Account number',
  })
  @ApiQuery({
    name: 'type',
    enum: ['DEBIT', 'CREDIT'],
    example: 'DEBIT',
    description: 'Restriction type to check',
  })
  @ApiResponse({
    status: 200,
    description: 'Restriction status retrieved',
    schema: {
      example: {
        accountNumber: '6217129210',
        restrictionType: 'DEBIT',
        isRestricted: false,
        reason: null,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async checkRestriction(
    @Param('accountNumber') accountNumber: string,
    @Query('type') type: 'DEBIT' | 'CREDIT',
  ) {
    return this.accountsService.checkRestriction(accountNumber, type);
  }

  @Get(':accountNumber/check-kyc-limits')
  @ApiOperation({
    summary: 'Check KYC Limits',
    description: 'Verify if a transaction amount is within KYC limits',
  })
  @ApiParam({
    name: 'accountNumber',
    example: '6217129210',
    description: 'Account number',
  })
  @ApiQuery({
    name: 'amount',
    example: 50000,
    description: 'Transaction amount to verify',
  })
  @ApiResponse({
    status: 200,
    description: 'KYC limit check completed',
    schema: {
      example: {
        accountNumber: '6217129210',
        requestedAmount: 50000,
        kycLimit: 100000,
        isAllowed: true,
        remainingLimit: 50000,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async checkKycLimits(
    @Param('accountNumber') accountNumber: string,
    @Query('amount') amount: string,
  ) {
    return this.accountsService.checkKycLimits(accountNumber, Number(amount));
  }

  @ApiOperation({ summary: 'Apply a posting to an account' })
  @ApiParam({ name: 'accountNumber', required: true, type: 'string', description: 'Account number' })
  @ApiBody({ type: ApplyAccountPostingDto })
  @ApiResponse({ status: 201, description: 'Posting applied successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @Post(':accountNumber/postings/apply')
  async applyPosting(
    @Param('accountNumber') accountNumber: string,
    @Body() dto: ApplyAccountPostingDto,
  ) {
    return this.accountsService.applyPosting(accountNumber, dto);
  }

  @ApiOperation({ summary: 'Apply multiple postings in batch' })
  @ApiBody({ description: 'Array of account number and posting pairs', schema: { type: 'array', items: { type: 'object', properties: { accountNumber: { type: 'string', description: 'Account number to apply posting to' }, posting: { $ref: '#/components/schemas/ApplyAccountPostingDto', description: 'Posting details' } } } } })
  @ApiResponse({ status: 201, description: 'Batch posting applied successfully' })
  @ApiResponse({ status: 400, description: 'Invalid batch request' })
  @Post('postings/apply-batch')
  async applyPostingsBatch(
    @Body()
    body: Array<{ accountNumber: string; posting: ApplyAccountPostingDto }>,
  ) {
    return this.accountsService.applyPostingsBatch(body);
  }

  @ApiOperation({ summary: 'List posting history for an account' })
  @ApiParam({ name: 'accountNumber', required: true, type: 'string', description: 'Account number' })
  @ApiResponse({ status: 200, description: 'Posting history retrieved' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @Get(':accountNumber/postings/history')
  async listPostingHistory(
    @Param('accountNumber') accountNumber: string,
    @Query() query: QueryAccountPostingHistoryDto,
  ) {
    return this.accountsService.listPostingHistory(accountNumber, query);
  }

  @ApiOperation({ summary: 'Reconcile account balance' })
  @ApiParam({ name: 'accountNumber', required: true, type: 'string', description: 'Account number' })
  @ApiQuery({ name: 'tenantId', required: true, type: 'string', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Account reconciled successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @Get(':accountNumber/reconcile')
  async reconcileBalance(
    @Param('accountNumber') accountNumber: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.accountsService.reconcileBalance(accountNumber, tenantId);
  }
}
