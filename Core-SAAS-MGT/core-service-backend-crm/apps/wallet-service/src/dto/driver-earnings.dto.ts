import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordDriverEarningDto {
  @ApiPropertyOptional({ description: 'Tenant ID', example: 'tenant-123' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiProperty({ description: 'Driver customer ID', example: 'driver-789' })
  @IsNotEmpty()
  @IsString()
  driverCustomerId: string;

  @ApiProperty({ description: 'Trip ID', example: 'trip-456' })
  @IsNotEmpty()
  @IsString()
  tripId: string;

  @ApiProperty({ description: 'Total trip fare', example: 2500.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  tripFare: number;

  @ApiProperty({ description: 'Platform commission amount', example: 250.0 })
  @IsNumber()
  platformCommission: number;

  @ApiProperty({ description: 'Partner commission amount', example: 100.0 })
  @IsNumber()
  partnerCommission: number;

  @ApiProperty({ description: 'Net earnings after deductions', example: 2150.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  netEarnings: number;

  @ApiPropertyOptional({ description: 'Bonus amount', example: 500.0 })
  @IsOptional()
  @IsNumber()
  bonusAmount?: number;

  @ApiPropertyOptional({ description: 'Penalty amount', example: 200.0 })
  @IsOptional()
  @IsNumber()
  penaltyAmount?: number;

  @ApiPropertyOptional({ description: 'Subscription deduction', example: 150.0 })
  @IsOptional()
  @IsNumber()
  subscriptionDeduction?: number;

  @ApiPropertyOptional({ description: 'Lease deduction', example: 300.0 })
  @IsOptional()
  @IsNumber()
  leaseDeduction?: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Settlement reference', example: 'STL-001' })
  @IsOptional()
  @IsString()
  settlementReference?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class QueryDriverEarningDto {
  @ApiPropertyOptional({ description: 'Tenant ID', example: 'tenant-123' })
  @IsOptional()
  @IsString()
  tenantId: string;

  @ApiPropertyOptional({ description: 'Driver customer ID filter', example: 'driver-789' })
  @IsOptional()
  @IsString()
  driverCustomerId?: string;

  @ApiPropertyOptional({ description: 'Earning status filter', example: 'PAID' })
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
