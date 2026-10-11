import { Controller, Get, Post, Body, Query, Param, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DriverLedgerService } from '../services/driver-ledger.service';
import { RecordDriverLedgerEntryDto, QueryDriverLedgerDto } from '../dto/driver-ledger.dto';

@ApiTags('Driver Ledger')
@Controller('wallet/drivers/ledger')
export class DriverLedgerController {
  constructor(private readonly driverLedgerService: DriverLedgerService) {}

  @Get(':driverCustomerId')
  @ApiOperation({ summary: 'Get driver ledger entries', description: 'Retrieve paginated ledger entries for a driver with optional filters.' })
  @ApiParam({ name: 'driverCustomerId', description: 'Driver customer ID', example: 'cust-drv-001' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiQuery({ name: 'entryType', required: false, description: 'Entry type filter', example: 'TRIP_EARNING' })
  @ApiQuery({ name: 'direction', required: false, description: 'Direction filter', example: 'CREDIT' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Start date (ISO 8601)', example: '2025-01-01' })
  @ApiQuery({ name: 'toDate', required: false, description: 'End date (ISO 8601)', example: '2025-12-31' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Page size', example: 25 })
  @ApiResponse({ status: 200, description: 'Ledger entries retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async getLedger(
    @Param('driverCustomerId') driverCustomerId: string,
    @Query() query: QueryDriverLedgerDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = query.tenantId || tenantIdHeader!;
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.driverLedgerService.getLedger(tenantId, driverCustomerId, query);
  }

  @Get(':driverCustomerId/balance')
  @ApiOperation({ summary: 'Get driver balance', description: 'Get the current running balance for a driver from the ledger.' })
  @ApiParam({ name: 'driverCustomerId', description: 'Driver customer ID', example: 'cust-drv-001' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'Driver balance retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async getBalance(
    @Param('driverCustomerId') driverCustomerId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Query('tenantId') tenantIdQuery?: string,
  ) {
    const tenantId = tenantIdQuery || tenantIdHeader!;
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.driverLedgerService.getBalance(tenantId, driverCustomerId);
  }

  @Post()
  @ApiOperation({ summary: 'Record driver ledger entry', description: 'Record a manual ledger entry for a driver.' })
  @ApiBody({ type: RecordDriverLedgerEntryDto })
  @ApiResponse({ status: 201, description: 'Ledger entry recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid entry data or missing tenantId' })
  @ApiBearerAuth()
  async recordEntry(
    @Body() dto: RecordDriverLedgerEntryDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) throw new BadRequestException('tenantId is required');
    return this.driverLedgerService.recordEntry(dto);
  }
}
