import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { AccountPostingSide } from '../entities/account-posting-log.entity';

/**
 * Payload sent by the ledger-service (via outbox) to apply a single
 * balance movement to an account.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyAccountPostingDto {
  @ApiProperty({ description: 'Idempotency key — maps to ledger_entries.id', example: 'entry-uuid-1234' })
  @IsString()
  @IsNotEmpty()
  ledgerEntryId: string;

  @ApiProperty({ description: 'Reference/description for the posting', example: 'Trip fare payment' })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty({ description: 'Posting side (DEBIT or CREDIT)', enum: AccountPostingSide })
  @IsEnum(AccountPostingSide)
  side: AccountPostingSide;

  @ApiProperty({ description: 'Amount to post (must be >= 0)', minimum: 0, example: 2500.00 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code (defaults to account currency)', example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Tenant ID for multi-tenancy', example: 'root-admin' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}

/**
 * Query params for listing posting history on an account.
 */
export class QueryAccountPostingHistoryDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  pageSize?: number;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsEnum(AccountPostingSide)
  @IsOptional()
  side?: AccountPostingSide;

  @IsString()
  @IsOptional()
  fromDate?: string;

  @IsString()
  @IsOptional()
  toDate?: string;
}
