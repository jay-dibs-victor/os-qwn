import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { GlAccountType, GlAccountStatus } from '../entities/gl-account.entity';

export class CreateGlAccountDto {
  @ApiProperty({ description: 'GL account code (unique)', example: '1101' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'GL account name', example: 'Cash and Cash Equivalents' })
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Accepts both uppercase (ASSET, LIABILITY, INCOME, EXPENSE, EQUITY)
   * and lowercase (asset, liability, income, expense, equity).
   * Swagger shows lowercase values matching the enum.
   */
  @ApiProperty({
    description: 'GL account type — accepts uppercase or lowercase',
    enum: GlAccountType,
    example: 'asset',
  })
  @Transform(({ value }) => String(value).toLowerCase())
  @IsEnum(GlAccountType)
  type: GlAccountType;

  @ApiProperty({ description: 'Tenant ID', example: 'root-admin' })
  @IsString()
  @IsOptional()
  tenantId: string;

  @ApiPropertyOptional({ description: 'Parent GL account UUID for hierarchy', example: 'gl-uuid-parent' })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Currency code (ISO 4217)', example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;
}

export class UpdateGlAccountDto {
  @ApiPropertyOptional({ description: 'Updated GL account name', example: 'Updated Account Name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Updated GL account type', enum: GlAccountType, example: 'liability' })
  @Transform(({ value }) => value ? String(value).toLowerCase() : value)
  @IsEnum(GlAccountType)
  @IsOptional()
  type?: GlAccountType;

  @ApiPropertyOptional({ description: 'Updated currency code', example: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Account status', example: 'ACTIVE', enum: GlAccountStatus })
  @IsString()
  @IsOptional()
  status?: string;
}
