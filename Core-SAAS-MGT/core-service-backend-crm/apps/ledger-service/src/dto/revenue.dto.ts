import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
} from 'class-validator';

export class RecordTripRevenueDto {
  @ApiProperty({ description: 'Unique trip identifier', example: 'trip-001' })
  @IsNotEmpty()
  @IsString()
  tripId: string;

  @ApiProperty({ description: 'Driver customer account ID', example: '02bc27b4-f2d7-4b5d-a083-89233f5250e4' })
  @IsNotEmpty()
  @IsString()
  driverCustomerId: string;

  @ApiProperty({ description: 'Rider customer account ID', example: '3b1cde6f-1d03-43f4-80d5-fc5767d78e3e' })
  @IsNotEmpty()
  @IsString()
  riderCustomerId: string;

  @ApiProperty({ description: 'Total fare amount for the trip', example: 2500.00, minimum: 0.01 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  totalFare: number;

  @ApiPropertyOptional({ description: 'Platform commission rate (decimal)', example: 0.10 })
  @IsOptional()
  @IsNumber()
  platformCommissionRate?: number;

  @ApiPropertyOptional({ description: 'Platform commission amount', example: 250.00 })
  @IsOptional()
  @IsNumber()
  platformCommissionAmount?: number;

  @ApiPropertyOptional({ description: 'Partner commission rate (decimal)', example: 0.05 })
  @IsOptional()
  @IsNumber()
  partnerCommissionRate?: number;

  @ApiPropertyOptional({ description: 'Partner commission amount', example: 125.00 })
  @IsOptional()
  @IsNumber()
  partnerCommissionAmount?: number;

  @ApiPropertyOptional({ description: 'Partner tenant ID if trip involves a partner', example: '1001000008' })
  @IsOptional()
  @IsString()
  partnerTenantId?: string;

  @ApiPropertyOptional({ description: 'Payment gateway fee', example: 50.00 })
  @IsOptional()
  @IsNumber()
  gatewayFee?: number;

  @ApiPropertyOptional({ description: 'Driver payout amount', example: 2075.00 })
  @IsOptional()
  @IsNumber()
  driverPayout?: number;

  @ApiPropertyOptional({ description: 'Currency code (ISO 4217)', example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Whether the driver is a corporate driver', example: false })
  @IsOptional()
  @IsBoolean()
  isCorporateDriver?: boolean;

  @ApiPropertyOptional({ description: 'Paystack payment reference', example: 'paystack-ref-001' })
  @IsOptional()
  @IsString()
  paystackReference?: string;

  @ApiProperty({ description: 'Tenant ID', example: 'root-admin' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;
}

export class TripRevenueResponse {
  @ApiProperty({ description: 'Whether the revenue recording was successful', example: true })
  success: boolean;

  @ApiProperty({ description: 'Result message', example: 'Revenue recorded successfully' })
  message: string;

  @ApiProperty({ description: 'Trip ID', example: 'trip-uuid-1234' })
  tripId: string;

  @ApiProperty({ description: 'Financial status of the trip', example: 'REVENUE_POSTED' })
  status: string;

  @ApiProperty({ description: 'Created journal entries', example: [{ reference: 'REV-2026-001', id: 'journal-uuid-1234', description: 'Trip Revenue: trip-uuid-1234' }] })
  journalEntries: Array<{
    reference: string;
    id: string;
    description: string;
  }>;

  @ApiProperty({ description: 'Financial summary of the trip' })
  financialSummary: {
    totalFare: number;
    platformCommission: number;
    partnerCommission: number;
    driverPayout: number;
    gatewayFee: number;
  };
}

export class CommissionCalculationDto {
  @ApiProperty({ description: 'Amount to calculate commission on', example: 2500.00, minimum: 0.01 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Platform commission rate override', example: 0.15 })
  @IsOptional()
  @IsNumber()
  platformRate?: number;

  @ApiPropertyOptional({ description: 'Partner commission rate override', example: 0.05 })
  @IsOptional()
  @IsNumber()
  partnerRate?: number;

  @ApiPropertyOptional({ description: 'Whether this is a corporate trip', example: false })
  @IsOptional()
  @IsBoolean()
  isCorporate?: boolean;

  @ApiPropertyOptional({ description: 'Partner ID for partner commission calculation', example: '1001000008' })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional({ description: 'Driver ID for driver-specific commission rules', example: 'DRV-001' })
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiProperty({ description: 'Tenant ID', example: 'root-admin' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;
}

export class CommissionResultDto {
  @ApiProperty({ description: 'Total amount', example: 2500.00 })
  totalAmount: number;

  @ApiProperty({ description: 'Platform commission amount', example: 250.00 })
  platformCommission: number;

  @ApiProperty({ description: 'Partner commission amount', example: 125.00 })
  partnerCommission: number;

  @ApiProperty({ description: 'Driver payout amount', example: 2125.00 })
  driverPayout: number;

  @ApiProperty({ description: 'Gateway fee', example: 50.00 })
  gatewayFee: number;

  @ApiProperty({ description: 'Detailed breakdown of applied commission rules', example: [{ ruleId: 'rule-uuid-1234', ruleType: 'PLATFORM', rate: 0.10, amount: 250.00 }] })
  breakdown: Array<{
    ruleId: string;
    ruleType: string;
    rate: number;
    amount: number;
  }>;
}
