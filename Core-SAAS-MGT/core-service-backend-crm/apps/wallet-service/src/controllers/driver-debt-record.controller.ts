import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { DriverDebtService } from '../services/driver-debt.service';

export class RecordCommissionDto {
  @ApiProperty({ description: 'Tenant ID', example: 'tenant-123' })
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @ApiProperty({ description: 'Driver customer ID', example: 'cust-drv-001' })
  @IsNotEmpty()
  @IsString()
  driverCustomerId: string;

  @ApiProperty({ description: 'Commission amount owed by driver', example: 250.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  commissionAmount: number;

  @ApiProperty({ description: 'Trip ID the commission relates to', example: 'trip-uuid' })
  @IsNotEmpty()
  @IsString()
  tripId: string;
}

@ApiTags('Driver Debt Recording')
@Controller('wallet/driver-debt')
export class DriverDebtRecordController {
  constructor(private readonly driverDebtService: DriverDebtService) {}

  @Post('record-commission')
  @ApiOperation({ summary: 'Record commission debt for cash trip', description: 'Called by payment-service after a cash trip to record the commission as driver debt.' })
  @ApiBody({ type: RecordCommissionDto })
  @ApiResponse({ status: 201, description: 'Commission debt recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - missing required fields' })
  async recordCommission(@Body() dto: RecordCommissionDto) {
    if (!dto.tenantId || !dto.driverCustomerId) {
      throw new BadRequestException('tenantId and driverCustomerId are required');
    }
    return this.driverDebtService.recordCommissionDebt(
      dto.tenantId,
      dto.driverCustomerId,
      dto.commissionAmount,
      dto.tripId,
    );
  }
}
