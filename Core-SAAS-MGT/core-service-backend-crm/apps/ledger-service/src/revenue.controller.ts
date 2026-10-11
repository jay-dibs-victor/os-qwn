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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RevenueRecognitionService } from './revenue-recognition.service';
import { RecordTripRevenueDto } from './dto/revenue.dto';
import { TripFinancialStatus } from './entities/trip-financial-record.entity';

@ApiTags('Ledger Revenue')
@ApiBearerAuth('JWT-auth')
@Controller('ledger/revenue')
export class RevenueController {
  constructor(
    private readonly revenueRecognitionService: RevenueRecognitionService,
  ) {}

  @Post('trip')
  @ApiOperation({ summary: 'Record trip revenue', description: 'Records revenue for a completed trip, creates journal entries, and optionally credits driver and partner.' })
  @ApiBody({ type: RecordTripRevenueDto, description: 'Trip revenue payload' })
  @ApiResponse({ status: 201, description: 'Revenue recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request – missing or invalid fields' })
  async recordTripRevenue(
    @Body() dto: RecordTripRevenueDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.revenueRecognitionService.recordTripRevenue(dto);
  }

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Get trip financial record', description: 'Retrieve the financial record for a specific trip.' })
  @ApiParam({ name: 'tripId', required: true, type: 'string', description: 'Trip UUID', example: 'trip-uuid-1234' })
  @ApiQuery({ name: 'tenantId', required: false, type: 'string', description: 'Tenant ID (or use x-tenant-id header)', example: 'root-admin' })
  @ApiResponse({ status: 200, description: 'Trip financial record' })
  @ApiResponse({ status: 404, description: 'Trip financial record not found' })
  async getTripFinancialRecord(
    @Param('tripId') tripId: string,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.revenueRecognitionService.getTripFinancialRecord(
      tripId,
      finalTenantId,
    );
  }

  @Get('trips')
  @ApiOperation({ summary: 'List trip financial records', description: 'Paginated list of trip financial records with filters by driver, rider, status, and date range.' })
  @ApiQuery({ name: 'tenantId', required: false, type: 'string', description: 'Tenant ID', example: 'root-admin' })
  @ApiQuery({ name: 'driverId', required: false, type: 'string', description: 'Filter by driver customer ID', example: 'driver-uuid-123' })
  @ApiQuery({ name: 'riderId', required: false, type: 'string', description: 'Filter by rider customer ID', example: 'rider-uuid-456' })
  @ApiQuery({ name: 'status', required: false, enum: TripFinancialStatus, description: 'Filter by financial status' })
  @ApiQuery({ name: 'fromDate', required: false, type: 'string', description: 'Filter: start date', example: '2026-01-01' })
  @ApiQuery({ name: 'toDate', required: false, type: 'string', description: 'Filter: end date', example: '2026-01-31' })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: 'number', description: 'Items per page', example: 25 })
  @ApiResponse({ status: 200, description: 'Paginated list of trip financial records' })
  async listTripFinancialRecords(
    @Query('tenantId') tenantId?: string,
    @Query('driverId') driverId?: string,
    @Query('riderId') riderId?: string,
    @Query('status') status?: TripFinancialStatus,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.revenueRecognitionService.listTripFinancialRecords(
      finalTenantId,
      {
        driverId,
        riderId,
        status,
        fromDate,
        toDate,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      },
    );
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get revenue summary', description: 'Aggregated revenue summary for a tenant with optional date range.' })
  @ApiQuery({ name: 'tenantId', required: false, type: 'string', description: 'Tenant ID', example: 'root-admin' })
  @ApiQuery({ name: 'fromDate', required: false, type: 'string', description: 'Filter: start date', example: '2026-01-01' })
  @ApiQuery({ name: 'toDate', required: false, type: 'string', description: 'Filter: end date', example: '2026-01-31' })
  @ApiResponse({ status: 200, description: 'Revenue summary data' })
  async getRevenueSummary(
    @Query('tenantId') tenantId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.revenueRecognitionService.getRevenueSummary(
      finalTenantId,
      fromDate,
      toDate,
    );
  }
}
