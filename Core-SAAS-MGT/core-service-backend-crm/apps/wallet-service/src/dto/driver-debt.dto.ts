import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SettlementMethod {
  EARNING_OFFSET = 'EARNING_OFFSET',
  MANUAL_PAYMENT = 'MANUAL_PAYMENT',
  WAIVER = 'WAIVER',
}

export class ManualSettlementDto {
  @ApiProperty({ description: 'Tenant ID', example: 'tenant-123' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiProperty({ description: 'Driver customer ID', example: 'cust-drv-001' })
  @IsNotEmpty()
  @IsString()
  driverCustomerId: string;

  @ApiProperty({ description: 'Settlement amount', example: 2000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Settlement method', enum: SettlementMethod, example: SettlementMethod.MANUAL_PAYMENT })
  @IsNotEmpty()
  @IsEnum(SettlementMethod)
  method: SettlementMethod;

  @ApiPropertyOptional({ description: 'Description', example: 'Driver paid debt via bank transfer' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateDebtThresholdDto {
  @ApiProperty({ description: 'New debt threshold amount', example: 10000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  threshold: number;
}
