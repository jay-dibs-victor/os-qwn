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
import { PartnerSettlementService } from './partner-settlement.service';
import {
  CreatePartnerSettlementDto,
  SettlePartnerDto,
  QueryPartnerSettlementDto,
} from './dto/partner-settlement.dto';

@ApiTags('Partner Settlements')
@Controller('wallet/partner-settlements')
export class PartnerSettlementController {
  constructor(
    private readonly partnerSettlementService: PartnerSettlementService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a settlement', description: 'Create a new partner settlement record.' })
  @ApiBody({ type: CreatePartnerSettlementDto })
  @ApiResponse({ status: 201, description: 'Settlement created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required or invalid data' })
  @ApiBearerAuth()
  async createSettlement(
    @Body() dto: CreatePartnerSettlementDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.partnerSettlementService.createSettlement(dto);
  }

  @Post('settle')
  @ApiOperation({ summary: 'Settle a partner', description: 'Process settlement payment to a partner for a specific settlement record.' })
  @ApiBody({ type: SettlePartnerDto })
  @ApiResponse({ status: 200, description: 'Partner settled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required or invalid data' })
  @ApiBearerAuth()
  async settlePartner(
    @Body() dto: SettlePartnerDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.partnerSettlementService.settlePartner(dto);
  }

  @Get('partner/:partnerId/balance')
  @ApiOperation({ summary: 'Get partner balance', description: 'Retrieve the current balance for a specific partner.' })
  @ApiParam({ name: 'partnerId', required: true, description: 'Partner ID' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'Partner balance retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async getPartnerBalance(
    @Param('partnerId') partnerId: string,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.partnerSettlementService.getPartnerBalance(
      partnerId,
      finalTenantId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List partner settlements', description: 'Retrieve paginated list of partner settlements with optional filters.' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiQuery({ name: 'partnerId', required: false, description: 'Partner ID filter', example: 'partner-456' })
  @ApiQuery({ name: 'status', required: false, description: 'Settlement status filter', example: 'PENDING' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Start date (ISO 8601)', example: '2025-01-01' })
  @ApiQuery({ name: 'toDate', required: false, description: 'End date (ISO 8601)', example: '2025-12-31' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Page size', example: 20 })
  @ApiResponse({ status: 200, description: 'Settlements list retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async listSettlements(
    @Query() query: QueryPartnerSettlementDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    query.tenantId = query.tenantId || tenantIdHeader!;
    if (!query.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.partnerSettlementService.listSettlements(query);
  }
}
