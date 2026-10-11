import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReversalReason, ReversalType } from '../entities/reversal-record.entity';

export class CreateReversalDto {
  @ApiPropertyOptional({ enum: ReversalType, example: ReversalType.FULL_REVERSAL, description: 'Type of reversal' })
  @IsEnum(ReversalType)
  @IsOptional()
  type?: ReversalType;

  @ApiPropertyOptional({ example: 'txn-uuid', description: 'Original transaction ID to reverse' })
  @IsString()
  @IsOptional()
  originalTransactionId?: string;

  @ApiPropertyOptional({ example: 'txn-uuid', description: 'Alternative transaction identifier' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ enum: ReversalReason, example: ReversalReason.DUPLICATE_PAYMENT, description: 'Reason for the reversal' })
  @IsEnum(ReversalReason)
  reason: ReversalReason;

  @ApiPropertyOptional({ example: 'Customer reported duplicate charge', description: 'Detailed reason description' })
  @IsString()
  @IsOptional()
  reasonDescription?: string;

  @ApiPropertyOptional({ example: 5000.00, description: 'Amount to reverse (for partial reversals)' })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({ example: 'root-admin', description: 'Tenant identifier' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ example: 'user-uuid', description: 'User ID who requested the reversal' })
  @IsString()
  @IsNotEmpty()
  requestedBy: string;
}
