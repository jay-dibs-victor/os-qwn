import { Controller, Get, Post, Body, Query, Param, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { FraudDetectionService } from '../services/fraud-detection.service';
import { FraudFlagStatus, FraudFlagSeverity } from '../entities/fraud-flag.entity';

export class ReviewFlagDto {
  status: FraudFlagStatus;
  reviewNote?: string;
  reviewedById?: string;
}

@ApiTags('Fraud Detection')
@Controller('wallet/fraud')
export class FraudDetectionController {
  constructor(private readonly fraudDetectionService: FraudDetectionService) {}

  @Get('flags')
  @ApiOperation({ summary: 'List fraud flags', description: 'List all fraud detection flags with optional status filter.' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter', example: 'OPEN' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (1-based)', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Page size', example: 25 })
  @ApiResponse({ status: 200, description: 'Fraud flags retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async listFlags(
    @Query('tenantId') tenantIdQuery?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdQuery || tenantIdHeader!;
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.fraudDetectionService.listFlags(tenantId, status, Number(page || 1), Number(pageSize || 25));
  }

  @Post('evaluate/:driverCustomerId')
  @ApiOperation({ summary: 'Evaluate driver for fraud', description: 'Run fraud detection rules against a driver and generate flags if triggered.' })
  @ApiParam({ name: 'driverCustomerId', description: 'Driver customer ID', example: 'cust-drv-001' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'Fraud evaluation complete' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiBearerAuth()
  async evaluateDriver(
    @Param('driverCustomerId') driverCustomerId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Query('tenantId') tenantIdQuery?: string,
  ) {
    const tenantId = tenantIdQuery || tenantIdHeader!;
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.fraudDetectionService.evaluateDriver(tenantId, driverCustomerId);
  }

  @Post('flags/:id/review')
  @ApiOperation({ summary: 'Review a fraud flag', description: 'Update the status of a fraud flag after review.' })
  @ApiParam({ name: 'id', description: 'Fraud flag ID', example: 'flag-001' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID (also accepted as x-tenant-id header)', example: 'tenant-123' })
  @ApiBody({
    description: 'Review details',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['OPEN', 'INVESTIGATING', 'CONFIRMED', 'DISMISSED'], example: 'DISMISSED', description: 'New status for the flag' },
        reviewNote: { type: 'string', example: 'Reviewed and dismissed - legitimate trips', description: 'Optional review note' },
        reviewedById: { type: 'string', example: 'admin-001', description: 'User ID of reviewer' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Fraud flag reviewed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - tenantId is required' })
  @ApiResponse({ status: 404, description: 'Fraud flag not found' })
  @ApiBearerAuth()
  async reviewFlag(
    @Param('id') id: string,
    @Body() body: { status: FraudFlagStatus; reviewNote?: string; reviewedById?: string },
    @Query('tenantId') tenantIdQuery?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdQuery || tenantIdHeader!;
    if (!tenantId) throw new BadRequestException('tenantId is required');
    return this.fraudDetectionService.reviewFlag(tenantId, id, body.status, body.reviewNote, body.reviewedById);
  }
}
