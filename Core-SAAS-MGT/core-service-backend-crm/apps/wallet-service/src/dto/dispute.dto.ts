import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeType, DisputeRaisedBy, DisputeStatus } from '../entities/payment-dispute.entity';

export class CreateDisputeDto {
  @ApiProperty({ description: 'Tenant ID', example: 'tenant-123' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiProperty({ description: 'Trip ID', example: 'trip-001' })
  @IsNotEmpty()
  @IsString()
  tripId: string;

  @ApiProperty({ description: 'Driver customer ID', example: 'cust-drv-001' })
  @IsNotEmpty()
  @IsString()
  driverCustomerId: string;

  @ApiProperty({ description: 'Rider customer ID', example: 'cust-rdr-001' })
  @IsNotEmpty()
  @IsString()
  riderCustomerId: string;

  @ApiProperty({ description: 'Dispute type', enum: DisputeType, example: DisputeType.CASH_PAYMENT })
  @IsNotEmpty()
  @IsEnum(DisputeType)
  disputeType: DisputeType;

  @ApiProperty({ description: 'Raised by', enum: DisputeRaisedBy, example: DisputeRaisedBy.DRIVER })
  @IsNotEmpty()
  @IsEnum(DisputeRaisedBy)
  raisedBy: DisputeRaisedBy;

  @ApiProperty({ description: 'Disputed amount', example: 5000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  disputedAmount: number;

  @ApiProperty({ description: 'Reason for dispute', example: 'Rider did not pay cash' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Related bank transfer ID', example: 'bt-001' })
  @IsOptional()
  @IsString()
  bankTransferId?: string;

  @ApiPropertyOptional({ description: 'Evidence metadata', example: { screenshot: 'url' } })
  @IsOptional()
  evidence?: Record<string, any>;
}

export class ResolveDisputeDto {
  @ApiProperty({ description: 'Resolution status', enum: [
    DisputeStatus.RESOLVED_DRIVER,
    DisputeStatus.RESOLVED_RIDER,
    DisputeStatus.RESOLVED_SPLIT,
    DisputeStatus.DISMISSED,
  ], example: DisputeStatus.RESOLVED_DRIVER })
  @IsNotEmpty()
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @ApiPropertyOptional({ description: 'Resolution note', example: 'Rider confirmed cash payment' })
  @IsOptional()
  @IsString()
  resolutionNote?: string;

  @ApiPropertyOptional({ description: 'Resolved amount (for split resolution)', example: 2500.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  resolvedAmount?: number;

  @ApiPropertyOptional({ description: 'User ID who resolved', example: 'admin-001' })
  @IsOptional()
  @IsString()
  resolvedById?: string;
}

export class QueryDisputeDto {
  @ApiPropertyOptional({ description: 'Tenant ID', example: 'tenant-123' })
  @IsOptional()
  @IsString()
  tenantId: string;

  @ApiPropertyOptional({ description: 'Status filter', example: 'OPEN' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Dispute type filter', example: 'CASH_PAYMENT' })
  @IsOptional()
  @IsString()
  disputeType?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', example: 25 })
  @IsOptional()
  @IsNumber()
  pageSize?: number;
}
