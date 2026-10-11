import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerSettlementType } from '../entities/partner-settlement.entity';

export class CreatePartnerSettlementDto {
  @ApiPropertyOptional({ description: 'Tenant ID', example: 'tenant-123' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiProperty({ description: 'Partner ID', example: 'partner-456' })
  @IsNotEmpty()
  @IsString()
  partnerId: string;

  @ApiPropertyOptional({ description: 'Settlement type', enum: PartnerSettlementType, example: PartnerSettlementType.COMMISSION })
  @IsOptional()
  @IsEnum(PartnerSettlementType)
  settlementType?: PartnerSettlementType;

  @ApiProperty({ description: 'Settlement amount', example: 15000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Due date (ISO 8601)', example: '2025-06-15' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Settlement description', example: 'Monthly commission settlement' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'External reference', example: 'REF-123' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class SettlePartnerDto {
  @ApiProperty({ description: 'Settlement ID to settle', example: 'settlement-789' })
  @IsNotEmpty()
  @IsString()
  settlementId: string;

  @ApiProperty({ description: 'Partner account number', example: 'ACC-PARTNER-001' })
  @IsNotEmpty()
  @IsString()
  partnerAccountNumber: string;

  @ApiPropertyOptional({ description: 'Partial amount to settle (full if omitted)', example: 15000.0 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Tenant ID', example: 'tenant-123' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiPropertyOptional({ description: 'Settlement description', example: 'Final settlement for July' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class QueryPartnerSettlementDto {
  @ApiPropertyOptional({ description: 'Tenant ID', example: 'tenant-123' })
  @IsOptional()
  @IsString()
  tenantId: string;

  @ApiPropertyOptional({ description: 'Partner ID filter', example: 'partner-456' })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional({ description: 'Settlement status filter', example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;

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
