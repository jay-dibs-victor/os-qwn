import { Controller, Get, Post, Body, Param, Query, Headers, HttpCode, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DriverSavingsService } from '../services/driver-savings.service';

@ApiTags('Driver Savings')
@Controller('wallet/driver-savings')
export class DriverSavingsController {
  constructor(private readonly savingsService: DriverSavingsService) {}

  @Post('plan')
  @ApiOperation({ summary: 'Create a savings plan', description: 'Create a new driver savings plan with target amount, contribution per trip, and optional early withdrawal penalties.' })
  @ApiBody({ schema: { example: { driverCustomerId: '17884a63-1cca-4f94-a2b3-fee47863483c', targetAmount: 500.00, contributionPerTrip: 50.00, earlyWithdrawalPenaltyPercent: 10, maxEarlyWithdrawalPenalty: 500.00, targetDate: '2025-12-31' } } })
  @ApiResponse({ status: 201, description: 'Savings plan created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid plan data' })
  @ApiBearerAuth()
  async createPlan(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: {
      driverCustomerId: string;
      targetAmount: number;
      contributionPerTrip: number;
      earlyWithdrawalPenaltyPercent?: number;
      maxEarlyWithdrawalPenalty?: number;
      targetDate?: Date;
    },
  ) {
    return this.savingsService.createPlan({ tenantId, ...dto });
  }

  @Post('contribute')
  @HttpCode(200)
  @ApiOperation({ summary: 'Record a contribution', description: 'Record a contribution towards a driver savings plan from a specific trip.' })
  @ApiBody({ schema: { example: { planId: '3f7c2b8e-1a5d-4e9f-8c6b-2a3d7e8f9b0c', tripId: 'trip-789', amount: 5000 } } })
  @ApiResponse({ status: 200, description: 'Contribution recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid contribution data' })
  @ApiBearerAuth()
  async recordContribution(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { planId: string; tripId: string; amount: number },
  ) {
    return this.savingsService.recordContribution({ tenantId, ...dto });
  }

  @Post('early-withdrawal')
  @HttpCode(200)
  @ApiOperation({ summary: 'Process early withdrawal', description: 'Process an early withdrawal from a savings plan with optional penalty.' })
  @ApiBody({ schema: { example: { planId: '3f7c2b8e-1a5d-4e9f-8c6b-2a3d7e8f9b0c', amount: 100000, reason: 'Emergency', actor: 'admin@queensos.com' } } })
  @ApiResponse({ status: 200, description: 'Early withdrawal processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid withdrawal data' })
  @ApiBearerAuth()
  async earlyWithdrawal(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { planId: string; amount: number; reason?: string; actor?: string },
  ) {
    return this.savingsService.earlyWithdrawal({ tenantId, ...dto });
  }

  @Post('cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel a savings plan', description: 'Cancel an existing driver savings plan with an optional reason.' })
  @ApiBody({ schema: { example: { planId: '3f7c2b8e-1a5d-4e9f-8c6b-2a3d7e8f9b0c', tenantId: 'root-admin', reason: 'Driver request' } } })
  @ApiResponse({ status: 200, description: 'Savings plan cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required or invalid data' })
  @ApiBearerAuth()
  async cancelPlan(
    @Body() dto: { planId: string; tenantId?: string; reason?: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = dto.tenantId || tenantIdHeader;
    if (!finalTenantId) throw new BadRequestException('tenantId is required');
    return this.savingsService.cancelPlan(finalTenantId, dto.planId, dto?.reason);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all savings plans', description: 'Retrieve all driver savings plans, optionally filtered by driver customer ID.' })
  @ApiQuery({ name: 'driverCustomerId', required: false, description: 'Driver customer ID filter', example: 'driver-789' })
  @ApiResponse({ status: 200, description: 'Savings plans retrieved successfully' })
  @ApiBearerAuth()
  async getPlans(
    @Headers('x-tenant-id') tenantId: string,
    @Query('driverCustomerId') driverCustomerId?: string,
  ) {
    return this.savingsService.getPlans(tenantId, driverCustomerId);
  }

  @Get('plans/:driverCustomerId')
  @ApiOperation({ summary: 'Get driver savings plans', description: 'Retrieve savings plans for a specific driver by customer ID.' })
  @ApiParam({ name: 'driverCustomerId', required: true, description: 'Driver customer ID' })
  @ApiResponse({ status: 200, description: 'Driver savings plans retrieved successfully' })
  @ApiBearerAuth()
  async getDriverPlans(
    @Headers('x-tenant-id') tenantId: string,
    @Param('driverCustomerId') driverCustomerId: string,
  ) {
    return this.savingsService.getPlans(tenantId, driverCustomerId);
  }

  @Get('plan/:planId')
  @ApiOperation({ summary: 'Get a savings plan', description: 'Retrieve a specific driver savings plan by its ID.' })
  @ApiParam({ name: 'planId', required: true, description: 'Savings plan ID' })
  @ApiResponse({ status: 200, description: 'Savings plan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Savings plan not found' })
  @ApiBearerAuth()
  async getPlan(
    @Headers('x-tenant-id') tenantId: string,
    @Param('planId') planId: string,
  ) {
    return this.savingsService.getPlan(tenantId, planId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get savings summary', description: 'Retrieve aggregated summary of all driver savings plans.' })
  @ApiResponse({ status: 200, description: 'Savings summary retrieved successfully' })
  @ApiBearerAuth()
  async getSummary(@Headers('x-tenant-id') tenantId: string) {
    return this.savingsService.getSummary(tenantId);
  }
}
