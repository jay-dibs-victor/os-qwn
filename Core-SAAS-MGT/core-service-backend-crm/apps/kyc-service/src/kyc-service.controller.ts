import { BadRequestException, Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { KycServiceService } from './kyc-service.service';

@ApiTags('KYC Service')
@Controller('kyc')
export class KycServiceController {
  constructor(private readonly kycService: KycServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a KYC record', description: 'Initiates a new KYC verification record for a customer.' })
  @ApiBody({ schema: { example: { customerId: 'cust-uuid', tenantId: 'root-admin' } }, description: 'KYC creation payload' })
  @ApiResponse({ status: 201, description: 'KYC record created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() body: { customerId: string; tenantId: string }) {
    return this.kycService.createRecord(body);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify KYC identity', description: 'Verifies a customer identity using BVN and NIN details.' })
  @ApiParam({ name: 'id', required: true, description: 'KYC record ID' })
  @ApiBody({ schema: { example: { bvn: '12345678901', nin: '12345678901', tenantId: 'root-admin' } }, description: 'Identity verification payload' })
  @ApiResponse({ status: 200, description: 'Identity verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'KYC record not found' })
  async verify(
    @Param('id') id: string,
    @Body() body: { bvn: string; nin: string; tenantId: string },
  ) {
    return this.kycService.verifyIdentity(id, body);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit KYC record for review', description: 'Submits the KYC record for official review and processing.' })
  @ApiParam({ name: 'id', required: true, description: 'KYC record ID' })
  @ApiResponse({ status: 200, description: 'KYC record submitted for review' })
  @ApiResponse({ status: 404, description: 'KYC record not found' })
  @ApiResponse({ status: 409, description: 'KYC record already submitted' })
  async submit(@Param('id') id: string) {
    return this.kycService.submit(id);
  }

  @Post(':id/liveness')
  @ApiOperation({ summary: 'Complete liveness check', description: 'Records the liveness detection score for a KYC record.' })
  @ApiParam({ name: 'id', required: true, description: 'KYC record ID' })
  @ApiBody({ schema: { example: { score: 0.95, tenantId: 'root-admin' } }, description: 'Liveness check payload' })
  @ApiResponse({ status: 200, description: 'Liveness check completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid score value' })
  @ApiResponse({ status: 404, description: 'KYC record not found' })
  async liveness(
    @Param('id') id: string,
    @Body() body: { score: number; tenantId: string },
  ) {
    return this.kycService.completeLiveness(id, body);
  }
}
