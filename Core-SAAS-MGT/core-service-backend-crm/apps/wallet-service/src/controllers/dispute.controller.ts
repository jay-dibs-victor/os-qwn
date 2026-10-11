import { Controller, Get, Post, Body, Query, Param, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { DisputeService } from '../services/dispute.service';
import { CreateDisputeDto, ResolveDisputeDto, QueryDisputeDto } from '../dto/dispute.dto';

@ApiTags('Payment Disputes')
@Controller('wallet/disputes')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment dispute', description: 'Create a new payment dispute for a cash ride or bank transfer.' })
  @ApiBody({ type: CreateDisputeDto })
  @ApiResponse({ status: 201, description: 'Dispute created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid dispute data or missing tenantId' })
  @ApiBearerAuth()
  async createDispute(
    @Body() dto: CreateDisputeDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) throw new BadRequestException('tenantId is required');
    return this.disputeService.createDispute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List payment disputes', description: 'List all payment disputes with optional filters.' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter', example: 'OPEN' })
  @ApiQuery({ name: 'disputeType', required: false, description: 'Dispute type filter', example: 'CASH_PAYMENT' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Page size', example: 25 })
  @ApiResponse({ status: 200, description: 'Disputes retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async listDisputes(
    @Query() query: QueryDisputeDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    query.tenantId = query.tenantId || tenantIdHeader!;
    if (!query.tenantId) throw new BadRequestException('tenantId is required');
    return this.disputeService.listDisputes(query.tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute details', description: 'Get details of a specific payment dispute by ID.' })
  @ApiParam({ name: 'id', description: 'Dispute ID', example: 'disp-001' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'Dispute retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  @ApiBearerAuth()
  async getDispute(
    @Param('id') id: string,
    @Query('tenantId') tenantIdQuery?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdQuery || tenantIdHeader!;
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.disputeService.getDispute(id, tenantId);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve a dispute', description: 'Resolve a dispute with a final status (driver wins, rider wins, split, or dismissed).' })
  @ApiParam({ name: 'id', description: 'Dispute ID', example: 'disp-001' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiBody({ type: ResolveDisputeDto })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid resolution data or missing tenantId' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  @ApiBearerAuth()
  async resolveDispute(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @Query('tenantId') tenantIdQuery?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdQuery || tenantIdHeader!;
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.disputeService.resolveDispute(id, tenantId, dto);
  }
}
