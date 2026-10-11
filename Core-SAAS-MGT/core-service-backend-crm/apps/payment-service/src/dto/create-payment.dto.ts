import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentRail } from '../constants/enums';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Source account number to debit from' })
  @IsString()
  @IsNotEmpty()
  sourceAccountId: string;

  @ApiProperty({ description: 'Target account number to credit to' })
  @IsString()
  @IsNotEmpty()
  targetAccountId: string;

  @ApiProperty({ required: false, description: 'Target bank code for external transfers' })
  @IsString()
  @IsOptional()
  targetBankCode?: string;

  @ApiProperty({ description: 'Amount to transfer' })
  @IsNumber()
  amount: number;

  @ApiProperty({ default: 'USD', description: 'Currency code (e.g., USD, NGN)' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ enum: PaymentRail, description: 'Payment rail to use for processing' })
  @IsEnum(PaymentRail)
  rail: PaymentRail;

  @ApiProperty({ required: false, description: 'Approval ID if payment requires approval' })
  @IsString()
  @IsOptional()
  approvalId?: string;

  @ApiProperty({ description: 'Tenant ID for multi-tenancy' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}
