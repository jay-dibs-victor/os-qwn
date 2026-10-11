import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentAccountEntityType } from '../entities/payment-account.entity';

export class CreatePaymentAccountDto {
  @ApiProperty({ example: 'root-admin' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiProperty({ enum: PaymentAccountEntityType })
  @IsNotEmpty()
  @IsEnum(PaymentAccountEntityType)
  entityType: PaymentAccountEntityType;

  @ApiProperty({ example: 'DRV-001' })
  @IsNotEmpty()
  @IsString()
  entityId: string;

  @ApiPropertyOptional({ example: '044' })
  @IsOptional()
  @IsString()
  bankCode?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiPropertyOptional({ example: 'SUB_mock_subaccount' })
  @IsOptional()
  @IsString()
  subaccountCode?: string;

  @ApiPropertyOptional({ example: 'RCP_mock_recipient' })
  @IsOptional()
  @IsString()
  recipientCode?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
