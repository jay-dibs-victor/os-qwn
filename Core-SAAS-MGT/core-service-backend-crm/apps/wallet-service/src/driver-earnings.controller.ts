import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DriverEarningsService } from './driver-earnings.service';
import {
  RecordDriverEarningDto,
  QueryDriverEarningDto,
} from './dto/driver-earnings.dto';

@ApiTags('Driver Earnings')
@Controller('wallet/driver-earnings')
export class DriverEarningsController {
  constructor(
    private readonly driverEarningsService: DriverEarningsService,
  ) {}

  @Post('record')
  @ApiOperation({ summary: 'Record a driver earning', description: 'Record a new earning entry for a driver after a trip completion.' })
  @ApiBody({ type: RecordDriverEarningDto })
  @ApiResponse({ status: 201, description: 'Earning recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required or invalid data' })
  @ApiBearerAuth()
  async recordEarning(
    @Body() dto: RecordDriverEarningDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.driverEarningsService.recordEarning(dto);
  }

  @Post(':id/payout')
  @ApiOperation({ summary: 'Payout a driver', description: 'Process payout for a specific driver earning entry.' })
  @ApiParam({ name: 'id', required: true, description: 'Driver earning ID' })
  @ApiBody({ schema: { example: { driverAccountNumber: 'ACC-DRIVER-001', tenantId: 'tenant-123' } } })
  @ApiResponse({ status: 200, description: 'Payout processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required or invalid data' })
  @ApiBearerAuth()
  async payoutDriver(
    @Param('id') id: string,
    @Body('driverAccountNumber') driverAccountNumber: string,
    @Body('tenantId') tenantId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.driverEarningsService.payoutDriver(
      id,
      driverAccountNumber,
      finalTenantId,
    );
  }

  @Get('driver/:driverCustomerId')
  @ApiOperation({ summary: 'Get driver earnings', description: 'Retrieve earnings for a specific driver with optional status and date filters.' })
  @ApiParam({ name: 'driverCustomerId', required: true, description: 'Driver customer ID' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiQuery({ name: 'status', required: false, description: 'Earning status filter', example: 'PAID' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Start date (ISO 8601)', example: '2025-01-01' })
  @ApiQuery({ name: 'toDate', required: false, description: 'End date (ISO 8601)', example: '2025-12-31' })
  @ApiResponse({ status: 200, description: 'Driver earnings retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async getDriverEarnings(
    @Param('driverCustomerId') driverCustomerId: string,
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.driverEarningsService.getDriverEarnings(
      driverCustomerId,
      finalTenantId,
      { status, fromDate, toDate },
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get earnings summary', description: 'Retrieve aggregated earnings summary across drivers with optional driver filter.' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiQuery({ name: 'driverCustomerId', required: false, description: 'Driver customer ID filter', example: 'driver-789' })
  @ApiResponse({ status: 200, description: 'Earnings summary retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async getEarningsSummary(
    @Query('tenantId') tenantId?: string,
    @Query('driverCustomerId') driverCustomerId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.driverEarningsService.getEarningsSummary(finalTenantId, driverCustomerId);
  }

  @Get()
  @ApiOperation({ summary: 'List all driver earnings', description: 'Retrieve paginated list of driver earnings with optional filters.' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiQuery({ name: 'driverCustomerId', required: false, description: 'Driver customer ID filter', example: 'driver-789' })
  @ApiQuery({ name: 'status', required: false, description: 'Earning status filter', example: 'PAID' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Start date (ISO 8601)', example: '2025-01-01' })
  @ApiQuery({ name: 'toDate', required: false, description: 'End date (ISO 8601)', example: '2025-12-31' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Page size', example: 20 })
  @ApiResponse({ status: 200, description: 'Earnings list retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async listEarnings(
    @Query() query: QueryDriverEarningDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    query.tenantId = query.tenantId || tenantIdHeader!;
    if (!query.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.driverEarningsService.listEarnings(query);
  }
}
