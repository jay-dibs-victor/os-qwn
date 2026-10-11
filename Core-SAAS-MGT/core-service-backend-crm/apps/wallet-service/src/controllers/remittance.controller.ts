import { Controller, Get, Post, Body, Param, Headers, HttpCode, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RemittanceService } from '../services/remittance.service';
import { RemittanceCycle } from '../entities/remittance-schedule.entity';

@ApiTags('Remittance')
@Controller('wallet/remittance')
export class RemittanceController {
  constructor(private readonly remittanceService: RemittanceService) {}

  @Post('schedule')
  @ApiOperation({ summary: 'Create a remittance schedule', description: 'Create a new remittance schedule for a partner with a specified cycle, amount, and due date.' })
  @ApiBody({ schema: { example: { partnerId: 'partner-456', cycle: 'WEEKLY', amount: 50000, dueDate: '2025-06-15' } } })
  @ApiResponse({ status: 201, description: 'Remittance schedule created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid schedule data' })
  @ApiBearerAuth()
  async createSchedule(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { partnerId: string; cycle: RemittanceCycle; amount: number; dueDate: Date },
  ) {
    return this.remittanceService.createSchedule({ tenantId, ...dto });
  }

  @Post(':scheduleId/process')
  @HttpCode(200)
  @ApiOperation({ summary: 'Process a remittance schedule', description: 'Manually process a specific remittance schedule by its ID.' })
  @ApiParam({ name: 'scheduleId', required: true, description: 'Remittance schedule ID' })
  @ApiBody({ schema: { example: { actor: 'admin@queensos.com', tenantId: 'tenant-123' } } })
  @ApiResponse({ status: 200, description: 'Remittance schedule processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async processSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() dto?: { actor?: string; tenantId?: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = dto?.tenantId || tenantIdHeader;
    if (!finalTenantId) throw new BadRequestException('tenantId is required');
    return this.remittanceService.processSchedule(finalTenantId, scheduleId, dto?.actor);
  }

  @Post('process-due')
  @HttpCode(200)
  @ApiOperation({ summary: 'Process due remittances', description: 'Process all remittance schedules that are due for the current tenant.' })
  @ApiBody({ schema: { example: { actor: 'admin@queensos.com' } } })
  @ApiResponse({ status: 200, description: 'Due remittances processed successfully' })
  @ApiBearerAuth()
  async processDueSchedules(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto?: { actor?: string },
  ) {
    return this.remittanceService.processDueSchedules(tenantId, dto?.actor);
  }

  @Post('admin-override')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin override for remittance', description: 'Admin override to process or release a remittance schedule with a reason.' })
  @ApiBody({ schema: { example: { scheduleId: 'schedule-789', reason: 'Manual release approved', actor: 'admin@queensos.com', releaseAmount: 50000 } } })
  @ApiResponse({ status: 200, description: 'Admin override processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid override data' })
  @ApiBearerAuth()
  async adminOverride(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { scheduleId: string; reason: string; actor: string; releaseAmount?: number },
  ) {
    return this.remittanceService.adminOverride({ tenantId, ...dto });
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending remittances', description: 'Retrieve all pending remittance schedules for the current tenant.' })
  @ApiResponse({ status: 200, description: 'Pending remittances retrieved successfully' })
  @ApiBearerAuth()
  async getPendingSchedules(@Headers('x-tenant-id') tenantId: string) {
    return this.remittanceService.getPendingSchedules(tenantId);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all remittance schedules', description: 'Retrieve all remittance schedules for the current tenant, including processed ones.' })
  @ApiResponse({ status: 200, description: 'All remittance schedules retrieved successfully' })
  @ApiBearerAuth()
  async getAllSchedules(@Headers('x-tenant-id') tenantId: string) {
    return this.remittanceService.getAllSchedules(tenantId);
  }

  @Get('schedule/:scheduleId')
  @ApiOperation({ summary: 'Get a remittance schedule', description: 'Retrieve a specific remittance schedule by its ID.' })
  @ApiParam({ name: 'scheduleId', required: true, description: 'Remittance schedule ID' })
  @ApiResponse({ status: 200, description: 'Remittance schedule retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Remittance schedule not found' })
  @ApiBearerAuth()
  async getSchedule(
    @Headers('x-tenant-id') tenantId: string,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.remittanceService.getSchedule(tenantId, scheduleId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get remittance summary', description: 'Retrieve aggregated summary of all remittance schedules for the current tenant.' })
  @ApiResponse({ status: 200, description: 'Remittance summary retrieved successfully' })
  @ApiBearerAuth()
  async getSummary(@Headers('x-tenant-id') tenantId: string) {
    return this.remittanceService.getSummary(tenantId);
  }
}
