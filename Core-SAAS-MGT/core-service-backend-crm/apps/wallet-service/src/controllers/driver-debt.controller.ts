import { Controller, Get, Post, Body, Query, Param, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiResponse, ApiParam, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { DriverDebtService } from '../services/driver-debt.service';
import { ManualSettlementDto, UpdateDebtThresholdDto } from '../dto/driver-debt.dto';

/** Internal DTO used by payment-service → wallet-service for cash trip commission debt recording */
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

@ApiTags('Driver Debt')
@Controller('wallet/drivers/debt')
export class DriverDebtController {
  constructor(private readonly driverDebtService: DriverDebtService) {}

  @Get()
  @ApiOperation({ summary: 'List driver debts', description: 'List all driver debt records with optional status filter.' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiQuery({ name: 'status', required: false, description: 'Debt status filter', example: 'ACTIVE' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Page size', example: 25 })
  @ApiResponse({ status: 200, description: 'Debt records retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async listDebts(
    @Query('tenantId') tenantIdQuery?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdQuery || tenantIdHeader!;
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.driverDebtService.listDebts(tenantId, status, Number(page || 1), Number(pageSize || 25));
  }

  @Get(':driverCustomerId')
  @ApiOperation({ summary: 'Get driver debt detail', description: 'Get detailed debt record for a specific driver.' })
  @ApiParam({ name: 'driverCustomerId', description: 'Driver customer ID', example: 'cust-drv-001' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'Debt record retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiResponse({ status: 404, description: 'Debt record not found' })
  @ApiBearerAuth()
  async getDebt(
    @Param('driverCustomerId') driverCustomerId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Query('tenantId') tenantIdQuery?: string,
  ) {
    const tenantId = tenantIdQuery || tenantIdHeader!;
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.driverDebtService.getDebtDetail(tenantId, driverCustomerId);
  }

  @Get(':driverCustomerId/check')
  @ApiOperation({ summary: 'Check driver debt status', description: 'Check if a driver is allowed to take new rides based on debt status.' })
  @ApiParam({ name: 'driverCustomerId', description: 'Driver customer ID', example: 'cust-drv-001' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'Debt check result' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async checkDebt(
    @Param('driverCustomerId') driverCustomerId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Query('tenantId') tenantIdQuery?: string,
  ) {
    const tenantId = tenantIdQuery || tenantIdHeader!;
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.driverDebtService.checkDebtStatus(tenantId, driverCustomerId);
  }

  @Post('settle')
  @ApiOperation({ summary: 'Manually settle driver debt', description: 'Record a manual debt settlement (earnings offset, manual payment, or waiver).' })
  @ApiBody({ type: ManualSettlementDto })
  @ApiResponse({ status: 201, description: 'Debt settled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid settlement data or missing tenantId' })
  @ApiBearerAuth()
  async settleDebt(
    @Body() dto: ManualSettlementDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) throw new BadRequestException('tenantId is required');
    return this.driverDebtService.settleDebt(dto);
  }

  @Post(':driverCustomerId/threshold')
  @ApiOperation({ summary: 'Update driver debt threshold', description: 'Update the debt threshold for a driver.' })
  @ApiParam({ name: 'driverCustomerId', description: 'Driver customer ID', example: 'cust-drv-001' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiBody({ type: UpdateDebtThresholdDto })
  @ApiResponse({ status: 200, description: 'Debt threshold updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - missing tenantId' })
  @ApiBearerAuth()
  async updateThreshold(
    @Param('driverCustomerId') driverCustomerId: string,
    @Body() dto: UpdateDebtThresholdDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Query('tenantId') tenantIdQuery?: string,
  ) {
    const tenantId = tenantIdQuery || tenantIdHeader!;
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.driverDebtService.updateThreshold(tenantId, driverCustomerId, dto.threshold);
  }
}
