import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BatchItemDto {
  @ApiProperty({ example: 'acc-123', description: 'Source account to debit' })
  @IsString()
  @IsNotEmpty()
  sourceAccountId: string;

  @ApiProperty({ example: 'acc-456', description: 'Target account to credit' })
  @IsString()
  @IsNotEmpty()
  targetAccountId: string;

  @ApiProperty({ example: '058', required: false, description: 'Target bank code for external transfers' })
  @IsString()
  @IsOptional()
  targetBankCode?: string;

  @ApiProperty({ example: 5000, description: 'Amount to transfer' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'USD', default: 'USD', description: 'Currency code (e.g., USD, NGN)' })
  @IsString()
  @IsOptional()
  currency?: string;
}

export class CreateBatchDto {
  @ApiProperty({ example: 'Payroll May 2024', description: 'Batch job name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'tenant-1', description: 'Tenant ID for multi-tenancy' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ example: 'user-789', description: 'User ID who created the batch' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({ type: [BatchItemDto], description: 'Batch payment items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemDto)
  items: BatchItemDto[];
}
