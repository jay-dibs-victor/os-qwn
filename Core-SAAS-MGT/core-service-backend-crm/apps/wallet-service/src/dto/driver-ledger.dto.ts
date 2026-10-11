import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverLedgerEntryType, DriverLedgerDirection } from '../entities/driver-ledger.entity';

export class RecordDriverLedgerEntryDto {
  @ApiProperty({ description: 'Tenant ID', example: 'tenant-123' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiProperty({ description: 'Driver customer ID', example: 'cust-drv-001' })
  @IsNotEmpty()
  @IsString()
  driverCustomerId: string;

  @ApiProperty({ description: 'Entry type', enum: DriverLedgerEntryType, example: DriverLedgerEntryType.TRIP_EARNING })
  @IsNotEmpty()
  @IsEnum(DriverLedgerEntryType)
  entryType: DriverLedgerEntryType;

  @ApiProperty({ description: 'Direction', enum: DriverLedgerDirection, example: DriverLedgerDirection.CREDIT })
  @IsNotEmpty()
  @IsEnum(DriverLedgerDirection)
  direction: DriverLedgerDirection;

  @ApiProperty({ description: 'Entry amount', example: 5000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Reference (auto-generated if omitted)', example: 'DRV-LDG-abc123' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: 'Related trip ID', example: 'trip-001' })
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiPropertyOptional({ description: 'Related dispute ID', example: 'disp-001' })
  @IsOptional()
  @IsString()
  disputeId?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Earnings for trip ABC' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class QueryDriverLedgerDto {
  @ApiPropertyOptional({ description: 'Tenant ID', example: 'tenant-123' })
  @IsOptional()
  @IsString()
  tenantId: string;

  @ApiPropertyOptional({ description: 'Entry type filter', example: 'TRIP_EARNING' })
  @IsOptional()
  @IsString()
  entryType?: string;

  @ApiPropertyOptional({ description: 'Direction filter', example: 'CREDIT' })
  @IsOptional()
  @IsString()
  direction?: string;

  @ApiPropertyOptional({ description: 'Start date (ISO 8601)', example: '2025-01-01' })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)', example: '2025-12-31' })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', example: 25 })
  @IsOptional()
  @IsNumber()
  pageSize?: number;
}
