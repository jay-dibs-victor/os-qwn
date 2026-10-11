import { Controller, Get, Post, Body, Query, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletServiceService } from './wallet-service.service';
import {
  WalletTransferDto,
  WalletFundingDto,
  WalletWithdrawalDto,
  QCoinExchangeDto,
  QueryWalletTransactionHistoryDto,
} from './dto/wallet.dto';

@ApiTags('Wallet Service')
@Controller('wallet')
export class WalletServiceController {
  constructor(private readonly walletService: WalletServiceService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'List wallet transactions', description: 'Retrieve paginated wallet transaction history with optional filters for type, status, account, date range, and reference.' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiQuery({ name: 'type', required: false, description: 'Transaction type filter', example: 'TRANSFER' })
  @ApiQuery({ name: 'status', required: false, description: 'Transaction status filter', example: 'POSTED' })
  @ApiQuery({ name: 'accountNumber', required: false, description: 'Account number filter', example: '6217129210' })
  @ApiQuery({ name: 'reference', required: false, description: 'Transaction reference filter', example: 'REF-123' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Start date (ISO 8601)', example: '2025-01-01' })
  @ApiQuery({ name: 'toDate', required: false, description: 'End date (ISO 8601)', example: '2025-12-31' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Page size', example: 20 })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async listHistory(
    @Query() query: QueryWalletTransactionHistoryDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    query.tenantId = query.tenantId || tenantIdHeader!;
    if (!query.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.walletService.listHistory(query);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer between wallets', description: 'Transfer funds from one wallet account to another within the same tenant.' })
  @ApiBody({ type: WalletTransferDto })
  @ApiResponse({ status: 201, description: 'Transfer completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid transfer data or missing tenantId' })
  @ApiBearerAuth()
  async transfer(
    @Body() dto: WalletTransferDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.walletService.walletTransfer(dto);
  }

  @Post('funding')
  @ApiOperation({ summary: 'Fund a wallet', description: 'Add funds to a specified wallet account.' })
  @ApiBody({ type: WalletFundingDto })
  @ApiResponse({ status: 201, description: 'Wallet funded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid funding data or missing tenantId' })
  @ApiBearerAuth()
  async fund(
    @Body() dto: WalletFundingDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.walletService.walletFunding(dto);
  }

  @Post('withdrawal')
  @ApiOperation({ summary: 'Withdraw from wallet', description: 'Withdraw funds from a specified wallet account.' })
  @ApiBody({ type: WalletWithdrawalDto })
  @ApiResponse({ status: 201, description: 'Withdrawal processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid withdrawal data or missing tenantId' })
  @ApiBearerAuth()
  async withdraw(
    @Body() dto: WalletWithdrawalDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.walletService.walletWithdrawal(dto);
  }

  @Post('qcoin-exchange')
  @ApiOperation({ summary: 'Exchange QCoin', description: 'Buy or sell QCoin using fiat currency.' })
  @ApiBody({ type: QCoinExchangeDto })
  @ApiResponse({ status: 201, description: 'QCoin exchange completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid exchange data or missing tenantId' })
  @ApiBearerAuth()
  async qcoinExchange(
    @Body() dto: QCoinExchangeDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.walletService.qcoinExchange(dto);
  }
}
