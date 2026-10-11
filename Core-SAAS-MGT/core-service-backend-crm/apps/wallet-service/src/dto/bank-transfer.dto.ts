import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordCashPaymentDto {
  @ApiProperty({ description: 'Tenant ID', example: 'tenant-123' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiProperty({ description: 'Trip ID', example: 'trip-001' })
  @IsNotEmpty()
  @IsString()
  tripId: string;

  @ApiProperty({ description: 'Driver customer ID', example: 'cust-drv-001' })
  @IsNotEmpty()
  @IsString()
  driverCustomerId: string;

  @ApiProperty({ description: 'Rider customer ID', example: 'cust-rdr-001' })
  @IsNotEmpty()
  @IsString()
  riderCustomerId: string;

  @ApiProperty({ description: 'Trip fare amount paid in cash', example: 5000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  fareAmount: number;

  @ApiProperty({ description: 'Platform commission amount', example: 500.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  commissionAmount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Additional metadata', example: { paymentMethod: 'cash' } })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class InitiateBankTransferDto {
  @ApiProperty({ description: 'Tenant ID', example: 'tenant-123' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiProperty({ description: 'Trip ID', example: 'trip-001' })
  @IsNotEmpty()
  @IsString()
  tripId: string;

  @ApiProperty({ description: 'Driver customer ID', example: 'cust-drv-001' })
  @IsNotEmpty()
  @IsString()
  driverCustomerId: string;

  @ApiProperty({ description: 'Rider customer ID', example: 'cust-rdr-001' })
  @IsNotEmpty()
  @IsString()
  riderCustomerId: string;

  @ApiProperty({ description: 'Transfer amount', example: 5000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export enum ConfirmationParty {
  DRIVER = 'DRIVER',
  RIDER = 'RIDER',
}

export class ConfirmBankTransferDto {
  @ApiProperty({ description: 'Tenant ID', example: 'tenant-123' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiProperty({ description: 'Bank transfer ID', example: 'bt-001' })
  @IsNotEmpty()
  @IsString()
  bankTransferId: string;

  @ApiProperty({ description: 'Confirmation party', enum: ConfirmationParty, example: ConfirmationParty.DRIVER })
  @IsNotEmpty()
  @IsEnum(ConfirmationParty)
  confirmedBy: ConfirmationParty;

  @ApiProperty({ description: 'Confirmed amount', example: 5000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  confirmedAmount: number;

  @ApiPropertyOptional({ description: 'Optional note', example: 'Payment received via GTBank' })
  @IsOptional()
  @IsString()
  note?: string;
}
