import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class QueryJournalHistoryDto {
  @ApiPropertyOptional({ example: 'root-admin' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsDateString()
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({ example: 'PAY-' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ example: '1101' })
  @IsString()
  @IsOptional()
  glAccountId?: string;

  @ApiPropertyOptional({ example: '6217129210' })
  @IsString()
  @IsOptional()
  subLedgerId?: string;

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
