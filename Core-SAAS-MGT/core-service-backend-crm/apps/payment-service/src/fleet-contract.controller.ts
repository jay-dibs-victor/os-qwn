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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import type { CreateFleetContractDto } from './fleet-contract.service';
import { FleetContractService } from './fleet-contract.service';

@ApiTags('Fleet Contracts')
@Controller('payments/fleet/contracts')
export class FleetContractController {
  constructor(private readonly service: FleetContractService) {}

  @Post()
  @ApiOperation({ summary: 'Create a fleet contract between partner and driver' })
  @ApiBody({ schema: {
    type: 'object',
    required: ['tenantId', 'partnerId', 'driverId', 'remittanceSchedule', 'payoutStrategy', 'rateValue'],
    properties: {
      tenantId: { type: 'string', example: 'root-admin', description: 'Tenant ID' },
      partnerId: { type: 'string', example: '1001000008', description: 'Partner customer ID' },
      driverId: { type: 'string', example: 'DRV-001', description: 'Driver customer ID' },
      vehicleId: { type: 'string', example: 'VH-12345', description: 'Vehicle ID (optional)' },
      remittanceSchedule: { type: 'string', enum: ['daily', 'weekly', 'monthly'], example: 'daily', description: 'Remittance frequency' },
      payoutStrategy: { type: 'string', enum: ['fixed_amount', 'percentage_split'], example: 'percentage_split', description: 'Payout calculation strategy' },
      rateValue: { type: 'number', example: 40, description: 'Rate value — percentage (for percentage_split) or fixed amount (for fixed_amount)' },
    },
  } })
  @ApiResponse({ status: 201, description: 'Fleet contract created' })
  @ApiResponse({ status: 400, description: 'Invalid contract data' })
  async create(@Body() dto: CreateFleetContractDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all fleet contracts' })
  @ApiHeader({ name: 'x-tenant-id', required: false, description: 'Tenant ID (defaults to root-admin)' })
  @ApiResponse({ status: 200, description: 'Fleet contracts retrieved' })
  async findAll(@Headers('x-tenant-id') tenantId: string) {
    return this.service.findAll(tenantId || 'root-admin');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fleet contract by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Fleet contract UUID' })
  @ApiResponse({ status: 200, description: 'Fleet contract found' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a fleet contract' })
  @ApiParam({ name: 'id', required: true, description: 'Fleet contract UUID' })
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      partnerId: { type: 'string', example: '1001000008', description: 'Partner customer ID' },
      driverId: { type: 'string', example: 'DRV-001', description: 'Driver customer ID' },
      vehicleId: { type: 'string', example: 'VH-12345', description: 'Vehicle ID' },
      remittanceSchedule: { type: 'string', enum: ['daily', 'weekly', 'monthly'], example: 'daily' },
      payoutStrategy: { type: 'string', enum: ['fixed_amount', 'percentage_split'], example: 'percentage_split' },
      rateValue: { type: 'number', example: 40, description: 'Rate value' },
      isActive: { type: 'boolean', example: true },
    },
  } })
  @ApiResponse({ status: 200, description: 'Fleet contract updated' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateFleetContractDto>,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a fleet contract' })
  @ApiParam({ name: 'id', required: true, description: 'Fleet contract UUID' })
  @ApiResponse({ status: 200, description: 'Contract deactivated' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async deactivate(@Param('id') id: string) {
    await this.service.deactivate(id);
    return { success: true, message: 'Contract deactivated' };
  }

  @Get('driver/:driverId/active')
  @ApiOperation({ summary: 'Get active fleet contract for a driver' })
  @ApiParam({ name: 'driverId', required: true, description: 'Driver customer ID' })
  @ApiQuery({ name: 'partnerId', required: false, description: 'Optional partner tenant ID filter' })
  @ApiHeader({ name: 'x-tenant-id', required: false, description: 'Tenant ID (defaults to root-admin)' })
  @ApiResponse({ status: 200, description: 'Active contract found or null' })
  async findActiveForDriver(
    @Headers('x-tenant-id') tenantId: string,
    @Param('driverId') driverId: string,
    @Query('partnerId') partnerId?: string,
  ) {
    return this.service.findActiveForDriver(tenantId || 'root-admin', driverId, partnerId);
  }
}
