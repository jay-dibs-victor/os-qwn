import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min, Max, IsObject } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageNumber?: number;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20, example: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Search/filter params as JSON key-value pairs',
    example: { search: 'john', status: 'active' },
  })
  @IsObject()
  @IsOptional()
  searchParams?: Record<string, any>;

  get skip(): number {
    return ((this.pageNumber ?? 1) - 1) * (this.pageSize ?? 20);
  }

  get take(): number {
    return this.pageSize ?? 20;
  }
}

export class PaginatedResponse<T> {
  @ApiProperty({ description: 'Array of items' })
  data: T[];

  @ApiProperty({ description: 'Total number of items matching the query', example: 42 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  pageNumber: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  pageSize: number;

  @ApiProperty({ description: 'Total number of pages', example: 3 })
  totalPages: number;

  constructor(data: T[], total: number, pageNumber: number, pageSize: number) {
    this.data = data;
    this.total = total;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / pageSize) || 1;
  }
}

export class PaginationResult {
  pageNumber: number;
  pageSize: number;
  total: number;
  totalPages: number;

  constructor(total: number, pageNumber: number, pageSize: number) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.total = total;
    this.totalPages = Math.ceil(total / pageSize) || 1;
  }
}

export function paginate<T>(
  result: { data: T[]; total: number },
  query: Record<string, any> = {},
): { data: T[]; total: number; pageNumber: number; pageSize: number; totalPages: number } {
  const pageNumber = Number(query.pageNumber) || 1;
  const pageSize = Number(query.pageSize) || 20;
  return {
    data: result.data,
    total: result.total,
    pageNumber,
    pageSize,
    totalPages: Math.ceil(result.total / pageSize) || 1,
  };
}

export function parsePagination(query: Record<string, any> = {}): { skip: number; take: number } {
  if (query.skip !== undefined) {
    return {
      skip: Number(query.skip) || 0,
      take: Number(query.take) || Number(query.pageSize) || 20,
    };
  }
  if (query.pageNumber !== undefined) {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Number(query.pageSize) || Number(query.take) || 20;
    return { skip: (pageNumber - 1) * pageSize, take: pageSize };
  }
  return { skip: 0, take: Number(query.take) || 20 };
}
