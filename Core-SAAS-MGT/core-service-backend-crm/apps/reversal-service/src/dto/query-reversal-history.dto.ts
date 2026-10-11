import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ReversalStatus, ReversalType } from '../entities/reversal-record.entity';

export class QueryReversalHistoryDto {
  @ApiProperty({ example: 'root-admin' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiPropertyOptional({ enum: ReversalStatus })
  @IsEnum(ReversalStatus)
  @IsOptional()
  status?: ReversalStatus;

  @ApiPropertyOptional({ enum: ReversalType })
  @IsEnum(ReversalType)
  @IsOptional()
  type?: ReversalType;

  @ApiPropertyOptional({ example: 'txn-uuid-here' })
  @IsString()
  @IsOptional()
  originalTransactionId?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pageSize?: number;
}
