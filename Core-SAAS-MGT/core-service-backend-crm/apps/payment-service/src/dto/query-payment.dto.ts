import { IsEnum, IsOptional, IsString, IsUUID, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentRail, PaymentStatus } from '../constants/enums';

export class QueryPaymentDto {
  @ApiPropertyOptional({ enum: PaymentStatus, description: 'Filter by payment status' })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentRail, description: 'Filter by payment rail' })
  @IsEnum(PaymentRail)
  @IsOptional()
  rail?: PaymentRail;

  @ApiPropertyOptional({ description: 'Tenant ID for multi-tenancy' })
  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Filter by source account number' })
  @IsString()
  @IsOptional()
  sourceAccountId?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number (1-based)' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 25, description: 'Items per page' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pageSize?: number;

  @ApiPropertyOptional({ example: '2026-01-01', description: 'Filter from date (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Filter to date (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  toDate?: string;
}
