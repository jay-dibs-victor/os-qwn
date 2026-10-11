import { Controller, Get, Post, Body, Param, Delete, Headers, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TenantRemittanceConfigService } from '../services/tenant-remittance-config.service';
import { RemittanceCycle, RemittanceType } from '../entities/tenant-driver-remittance-config.entity';

@ApiTags('Tenant Remittance Config')
@ApiBearerAuth('JWT-auth')
@Controller('tenant-remittance-config')
export class TenantRemittanceConfigController {
  constructor(private readonly configService: TenantRemittanceConfigService) {}

  @Post()
  @ApiOperation({ summary: 'Upsert remittance config', description: 'Create or update a tenant driver remittance configuration.' })
  @ApiBody({ description: 'Remittance configuration payload', schema: {
    example: {
      driverCustomerId: 'driver-uuid-123',
      remittanceCycle: 'WEEKLY',
      remittanceType: 'PERCENTAGE_OF_FARE',
      remittanceValue: 15,
      commissionRate: 0.10,
      dayOfWeek: 5,
      dayOfMonth: 1,
      isActive: true,
    },
  }})
  @ApiResponse({ status: 201, description: 'Config upserted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async upsertConfig(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: {
      driverCustomerId?: string;
      remittanceCycle?: RemittanceCycle;
      remittanceType?: RemittanceType;
      remittanceValue?: number;
      commissionRate?: number;
      dayOfWeek?: number;
      dayOfMonth?: number;
      isActive?: boolean;
    },
  ) {
    return this.configService.upsertConfig({ tenantId, ...dto });
  }

  @Get()
  @ApiOperation({ summary: 'Get all remittance configs', description: 'Retrieve all remittance configurations for a tenant.' })
  @ApiResponse({ status: 200, description: 'List of remittance configurations' })
  async getConfigs(@Headers('x-tenant-id') tenantId: string) {
    return this.configService.getConfigsByTenant(tenantId);
  }

  @Get('driver/:driverCustomerId')
  @ApiOperation({ summary: 'Get driver remittance config', description: 'Retrieve the remittance configuration for a specific driver.' })
  @ApiParam({ name: 'driverCustomerId', required: true, type: 'string', description: 'Driver customer ID', example: 'driver-uuid-123' })
  @ApiResponse({ status: 200, description: 'Driver remittance configuration' })
  @ApiResponse({ status: 404, description: 'Config not found for driver' })
  async getDriverConfig(
    @Headers('x-tenant-id') tenantId: string,
    @Param('driverCustomerId') driverCustomerId: string,
  ) {
    return this.configService.getConfigsByDriver(tenantId, driverCustomerId);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default remittance config', description: 'Retrieve the default remittance configuration for a tenant (config where driverCustomerId is null).' })
  @ApiResponse({ status: 200, description: 'Default remittance configuration' })
  async getDefaultConfig(@Headers('x-tenant-id') tenantId: string) {
    return this.configService.getDefaultConfig(tenantId);
  }

  @Delete(':configId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete remittance config', description: 'Delete a remittance configuration by ID.' })
  @ApiParam({ name: 'configId', required: true, type: 'string', description: 'Configuration ID', example: 'config-uuid-1234' })
  @ApiResponse({ status: 204, description: 'Config deleted successfully' })
  @ApiResponse({ status: 404, description: 'Config not found' })
  async deleteConfig(
    @Headers('x-tenant-id') tenantId: string,
    @Param('configId') configId: string,
  ) {
    await this.configService.deleteConfig(tenantId, configId);
  }

  @Get('due')
  @ApiOperation({ summary: 'Get due remittance configs', description: 'Retrieve remittance configurations that are due for processing.' })
  @ApiResponse({ status: 200, description: 'List of due remittance configurations' })
  async getDueConfigs(@Headers('x-tenant-id') tenantId: string) {
    return this.configService.getDueRemittanceConfigs(tenantId);
  }
}
