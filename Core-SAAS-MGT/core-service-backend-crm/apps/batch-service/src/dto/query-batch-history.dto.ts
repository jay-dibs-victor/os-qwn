import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BatchJobStatus } from '../entities/batch-job.entity';

export class QueryBatchHistoryDto {
  @ApiPropertyOptional({ example: 'root-admin' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiPropertyOptional({ enum: BatchJobStatus })
  @IsEnum(BatchJobStatus)
  @IsOptional()
  status?: BatchJobStatus;

  @ApiPropertyOptional({ example: 'Payroll' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsDateString()
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 25, default: 25 })
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number;
}
