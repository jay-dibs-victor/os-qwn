import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Payload for an internal (book-transfer) between two accounts
 * on the same platform — no external rail required.
 */
export class InternalTransferDto {
  @ApiProperty({ example: '6217129210', description: 'Source account to debit' })
  @IsString()
  @IsNotEmpty()
  sourceAccountId: string;

  @ApiProperty({ example: 'ACC-2024-002', description: 'Destination account to credit' })
  @IsString()
  @IsNotEmpty()
  destinationAccountId: string;

  @ApiProperty({ example: 5000.0, description: 'Amount to transfer' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency code (e.g., USD, NGN)' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 'root-admin', description: 'Tenant ID for multi-tenancy' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiPropertyOptional({ example: 'TXN-REF-001', description: 'Optional idempotency reference' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ example: 'Salary payment', description: 'Transfer description' })
  @IsString()
  @IsOptional()
  description?: string;
}
