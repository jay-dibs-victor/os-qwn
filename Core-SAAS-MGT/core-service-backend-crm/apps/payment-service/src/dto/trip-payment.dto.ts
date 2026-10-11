import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DriverType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE',
}

export class InitiateTripPaymentDto {
  @ApiProperty({ example: 'trip-uuid', description: 'Trip identifier' })
  @IsNotEmpty()
  @IsString()
  tripId: string;

  @ApiProperty({ example: 'cust-uuid', description: 'Rider customer ID' })
  @IsNotEmpty()
  @IsString()
  riderCustomerId: string;

  @ApiProperty({ example: 'rider@example.com', description: 'Rider email address' })
  @IsNotEmpty()
  @IsString()
  riderEmail: string;

  @ApiProperty({ example: 2500.00, description: 'Trip fare amount' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  fareAmount: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'NG', description: 'ISO 3166-1 alpha-2 country code for gateway routing' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ example: 'driver-uuid', description: 'Driver customer ID' })
  @IsNotEmpty()
  @IsString()
  driverCustomerId: string;

  @ApiPropertyOptional({ enum: DriverType, example: DriverType.INDIVIDUAL, description: 'Driver type' })
  @IsOptional()
  @IsEnum(DriverType)
  driverType?: DriverType;

  @ApiPropertyOptional({ example: 'partner-tenant-uuid', description: 'Partner tenant ID if corporate driver' })
  @IsOptional()
  @IsString()
  partnerTenantId?: string;

  @ApiProperty({ example: 'root-admin', description: 'Tenant identifier' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiPropertyOptional({ example: 0.10, description: 'Platform commission rate (decimal)' })
  @IsOptional()
  @IsNumber()
  platformCommissionRate?: number;

  @ApiPropertyOptional({ example: 0.05, description: 'Partner commission rate (decimal)' })
  @IsOptional()
  @IsNumber()
  partnerCommissionRate?: number;

  @ApiPropertyOptional({ example: '044', description: 'Driver bank code for Paystack subaccount/transfer' })
  @IsOptional()
  @IsString()
  driverBankCode?: string;

  @ApiPropertyOptional({ example: '0123456789', description: 'Driver bank account number' })
  @IsOptional()
  @IsString()
  driverAccountNumber?: string;

  @ApiPropertyOptional({ example: '044', description: 'Partner bank code for Paystack subaccount/transfer' })
  @IsOptional()
  @IsString()
  partnerBankCode?: string;

  @ApiPropertyOptional({ example: '9876543210', description: 'Partner bank account number' })
  @IsOptional()
  @IsString()
  partnerAccountNumber?: string;
}

export class VerifyTripPaymentDto {
  @ApiProperty({ example: 'paystack-ref-uuid', description: 'Paystack transaction reference' })
  @IsNotEmpty()
  @IsString()
  paystackReference: string;

  @ApiProperty({ example: 'trip-uuid', description: 'Trip identifier' })
  @IsNotEmpty()
  @IsString()
  tripId: string;

  @ApiProperty({ example: 'root-admin', description: 'Tenant identifier' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;
}

export class CompleteTripPaymentDto {
  @ApiProperty({ example: 'paystack-ref-uuid', description: 'Paystack transaction reference' })
  @IsNotEmpty()
  @IsString()
  paystackReference: string;

  @ApiProperty({ example: 'trip-uuid', description: 'Trip identifier' })
  @IsNotEmpty()
  @IsString()
  tripId: string;

  @ApiProperty({ example: 'root-admin', description: 'Tenant identifier' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiProperty({ example: 'driver-uuid', description: 'Driver customer ID' })
  @IsNotEmpty()
  @IsString()
  driverCustomerId: string;

  @ApiPropertyOptional({ example: '044', description: 'Driver bank code for Paystack transfer' })
  @IsOptional()
  @IsString()
  driverBankCode?: string;

  @ApiPropertyOptional({ example: '0123456789', description: 'Driver bank account number' })
  @IsOptional()
  @IsString()
  driverAccountNumber?: string;

  @ApiPropertyOptional({ example: 'partner-uuid', description: 'Partner ID for corporate drivers' })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional({ example: '9876543210', description: 'Partner bank account number' })
  @IsOptional()
  @IsString()
  partnerAccountNumber?: string;
}

export class TripCommissionBreakdown {
  totalFare: number;
  platformCommissionRate: number;
  platformCommissionAmount: number;
  partnerCommissionRate: number;
  partnerCommissionAmount: number;
  driverPayout: number;
  gatewayFee: number;
  netSettlement: number;
}

export class TripPaymentResponse {
  success: boolean;
  message: string;
  tripId: string;
  paymentReference: string;
  authorizationUrl?: string;
  accessCode?: string;
  status: string;
  commissionBreakdown?: TripCommissionBreakdown;
  journalEntries?: Array<{
    reference: string;
    description: string;
    id: string;
  }>;
  debtReference?: string;
  journalEntryId?: string;
  transfers?: Array<{
    recipient: string;
    amount: number;
    reference: string;
    status: string;
    transferCode?: string;
  }>;
}

export class CashTripPaymentDto {
  @ApiProperty({ example: 'trip-uuid', description: 'Trip identifier' })
  @IsNotEmpty()
  @IsString()
  tripId: string;

  @ApiProperty({ example: 'driver-uuid', description: 'Driver customer ID' })
  @IsNotEmpty()
  @IsString()
  driverCustomerId: string;

  @ApiProperty({ example: 2500.00, description: 'Trip fare amount collected in cash by driver' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  fareAmount: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'NG', description: 'ISO 3166-1 alpha-2 country code for gateway routing' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ enum: DriverType, example: DriverType.INDIVIDUAL, description: 'Driver type' })
  @IsOptional()
  @IsEnum(DriverType)
  driverType?: DriverType;

  @ApiPropertyOptional({ example: 'partner-tenant-uuid', description: 'Partner tenant ID if corporate driver' })
  @IsOptional()
  @IsString()
  partnerTenantId?: string;

  @ApiProperty({ example: 'root-admin', description: 'Tenant identifier' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiPropertyOptional({ example: 0.10, description: 'Platform commission rate (decimal)' })
  @IsOptional()
  @IsNumber()
  platformCommissionRate?: number;

  @ApiPropertyOptional({ example: 0.05, description: 'Partner commission rate (decimal)' })
  @IsOptional()
  @IsNumber()
  partnerCommissionRate?: number;

  @ApiPropertyOptional({ example: 'rider@example.com', description: 'Rider email address' })
  @IsOptional()
  @IsString()
  riderEmail?: string;
}

export class WalletTripPaymentDto {
  @ApiProperty({ example: 'trip-uuid', description: 'Trip identifier' })
  @IsNotEmpty()
  @IsString()
  tripId: string;

  @ApiProperty({ example: 'cust-uuid', description: 'Rider customer ID' })
  @IsNotEmpty()
  @IsString()
  riderCustomerId: string;

  @ApiProperty({ example: 2500.00, description: 'Trip fare amount' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  fareAmount: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'NG', description: 'ISO 3166-1 alpha-2 country code for gateway routing' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ example: 'driver-uuid', description: 'Driver customer ID' })
  @IsNotEmpty()
  @IsString()
  driverCustomerId: string;

  @ApiPropertyOptional({ enum: DriverType, example: DriverType.INDIVIDUAL, description: 'Driver type' })
  @IsOptional()
  @IsEnum(DriverType)
  driverType?: DriverType;

  @ApiPropertyOptional({ example: 'partner-tenant-uuid', description: 'Partner tenant ID if corporate driver' })
  @IsOptional()
  @IsString()
  partnerTenantId?: string;

  @ApiProperty({ example: 'root-admin', description: 'Tenant identifier' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiPropertyOptional({ example: 0.10, description: 'Platform commission rate (decimal)' })
  @IsOptional()
  @IsNumber()
  platformCommissionRate?: number;

  @ApiPropertyOptional({ example: 0.05, description: 'Partner commission rate (decimal)' })
  @IsOptional()
  @IsNumber()
  partnerCommissionRate?: number;

  @ApiPropertyOptional({ example: 'rider@example.com', description: 'Rider email address' })
  @IsOptional()
  @IsString()
  riderEmail?: string;
}
