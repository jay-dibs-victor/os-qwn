import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum QCoinExchangeDirection {
  BUY_QCOIN = 'BUY_QCOIN',
  SELL_QCOIN = 'SELL_QCOIN',
}

export class WalletTransferDto {
  @ApiProperty({ description: 'Source account number', example: '6217129210' })
  @IsNotEmpty()
  @IsString()
  fromAccountNumber: string;

  @ApiProperty({ description: 'Destination account number', example: 'ACC-002' })
  @IsNotEmpty()
  @IsString()
  toAccountNumber: string;

  @ApiProperty({ description: 'Transfer amount', example: 5000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Transfer description', example: 'Payment for services' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tenant ID', example: 'tenant-123' })
  @IsOptional()
  @IsString()
  tenantId: string;
}

export class WalletFundingDto {
  @ApiProperty({ description: 'Account number to fund', example: '6217129210' })
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @ApiProperty({ description: 'Funding amount', example: 10000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Funding description', example: 'Wallet top-up' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tenant ID', example: 'tenant-123' })
  @IsOptional()
  @IsString()
  tenantId: string;
}

export class WalletWithdrawalDto {
  @ApiProperty({ description: 'Account number to withdraw from', example: '6217129210' })
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @ApiProperty({ description: 'Withdrawal amount', example: 5000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Withdrawal description', example: 'Cash withdrawal' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tenant ID', example: 'tenant-123' })
  @IsOptional()
  @IsString()
  tenantId: string;
}

export class QCoinExchangeDto {
  @ApiProperty({ description: 'Customer ID', example: 'cust-456' })
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @ApiProperty({ description: 'Exchange direction', enum: QCoinExchangeDirection, example: QCoinExchangeDirection.BUY_QCOIN })
  @IsNotEmpty()
  @IsEnum(QCoinExchangeDirection)
  direction: QCoinExchangeDirection;

  @ApiProperty({ description: 'Fiat amount to exchange', example: 10000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  fiatAmount: number;

  @ApiProperty({ description: 'QCoin amount to exchange', example: 1000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  qcoinAmount: number;

  @ApiPropertyOptional({ description: 'Fiat currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  fiatCurrency?: string;

  @ApiPropertyOptional({ description: 'QCoin currency code', example: 'QCOIN' })
  @IsOptional()
  @IsString()
  qcoinCurrency?: string;

  @ApiPropertyOptional({ description: 'Exchange description', example: 'QCoin purchase' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tenant ID', example: 'tenant-123' })
  @IsOptional()
  @IsString()
  tenantId: string;
}

export class QueryWalletTransactionHistoryDto {
  @ApiPropertyOptional({ description: 'Tenant ID', example: 'tenant-123' })
  @IsOptional()
  @IsString()
  tenantId: string;

  @ApiPropertyOptional({ description: 'Transaction type filter', example: 'TRANSFER' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Transaction status filter', example: 'POSTED' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Account number filter', example: '6217129210' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ description: 'Transaction reference filter', example: 'REF-123' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: 'Start date filter (ISO 8601)', example: '2025-01-01' })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'End date filter (ISO 8601)', example: '2025-12-31' })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', example: 20 })
  @IsOptional()
  @IsNumber()
  pageSize?: number;
}
