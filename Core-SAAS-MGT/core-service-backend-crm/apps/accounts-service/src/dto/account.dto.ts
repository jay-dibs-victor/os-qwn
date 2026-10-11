import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { AccountType, KycTier } from '../entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ description: 'Account display name or label', example: 'John Checking Account' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Account type (CHECKING, SAVINGS, etc.)', enum: AccountType })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiPropertyOptional({ description: 'Currency code (e.g., USD, NGN)', example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'KYC tier for transaction limits' })
  @IsEnum(KycTier)
  @IsOptional()
  kycTier?: KycTier;

  @ApiProperty({ description: 'Customer ID who owns the account', example: '02bc27b4-f2d7-4b5d-a083-89233f5250e4' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ description: 'Tenant ID for multi-tenancy', example: 'root-admin' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiPropertyOptional({ description: 'GL account ID to link (for accounting)', example: '1101' })
  @IsString()
  @IsOptional()
  glAccountId?: string;
}
