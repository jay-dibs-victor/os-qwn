import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { CommissionEngineService } from './commission-engine.service';
import { CommissionRule, CommissionRuleType } from './entities/commission-rule.entity';
import { CommissionCalculationDto } from './dto/revenue.dto';

@ApiTags('Ledger Commissions')
@ApiBearerAuth('JWT-auth')
@Controller('ledger/commissions')
export class CommissionController {
  constructor(
    private readonly commissionEngineService: CommissionEngineService,
  ) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate commissions', description: 'Calculate platform, partner, and driver commissions for a given trip amount.' })
  @ApiBody({ type: CommissionCalculationDto, description: 'Commission calculation payload' })
  @ApiResponse({ status: 201, description: 'Commission calculated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async calculate(
    @Body() dto: CommissionCalculationDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.commissionEngineService.calculateCommissions(dto);
  }

  @Post('rules')
  @ApiOperation({ summary: 'Create commission rule', description: 'Create a new commission rule (platform, partner, driver, or subscription).' })
  @ApiBody({ type: CommissionRule, description: 'Commission rule payload' })
  @ApiResponse({ status: 201, description: 'Commission rule created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createRule(
    @Body() dto: Partial<CommissionRule>,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.commissionEngineService.createCommissionRule(dto);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List commission rules', description: 'Retrieve all commission rules for a tenant, optionally filtered by rule type.' })
  @ApiQuery({ name: 'tenantId', required: false, type: 'string', description: 'Tenant ID', example: 'root-admin' })
  @ApiQuery({ name: 'ruleType', required: false, enum: CommissionRuleType, description: 'Filter by rule type' })
  @ApiResponse({ status: 200, description: 'List of commission rules' })
  async listRules(
    @Query('tenantId') tenantId?: string,
    @Query('ruleType') ruleType?: CommissionRuleType,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.commissionEngineService.getCommissionRules(
      finalTenantId,
      ruleType,
    );
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update commission rule', description: 'Update an existing commission rule by ID.' })
  @ApiParam({ name: 'id', required: true, type: 'string', description: 'Commission rule ID', example: 'rule-uuid-1234' })
  @ApiBody({ type: CommissionRule, description: 'Updated commission rule fields' })
  @ApiResponse({ status: 200, description: 'Commission rule updated successfully' })
  @ApiResponse({ status: 404, description: 'Commission rule not found' })
  async updateRule(
    @Param('id') id: string,
    @Body() dto: Partial<CommissionRule>,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.commissionEngineService.updateCommissionRule(id, dto, finalTenantId);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Delete commission rule', description: 'Permanently delete a commission rule by ID.' })
  @ApiParam({ name: 'id', required: true, type: 'string', description: 'Commission rule ID', example: 'rule-uuid-1234' })
  @ApiResponse({ status: 200, description: 'Commission rule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Commission rule not found' })
  async deleteRule(
    @Param('id') id: string,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.commissionEngineService.deleteCommissionRule(id, finalTenantId);
  }
}
