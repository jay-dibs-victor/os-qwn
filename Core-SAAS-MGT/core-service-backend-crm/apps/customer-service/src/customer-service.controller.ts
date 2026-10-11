import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerServiceService } from './customer-service.service';
import {
  CustomerAccountKind,
  CustomerProfileType,
} from './entities/customer-account.entity';
import { CreateCustomerAccountDto } from './dto/customer-account.dto';

@Controller('customer-accounts')
@ApiTags('Customer Accounts')
export class CustomerServiceController {
  constructor(private readonly customerService: CustomerServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create customer account' })
  @ApiResponse({ status: 201, description: 'Customer account created' })
  async create(
    @Body() body: CreateCustomerAccountDto & Record<string, unknown>,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.customerService.create(body, tenantIdHeader);
  }

  @Get()
  @ApiOperation({ summary: 'List customer accounts' })
  @ApiResponse({ status: 200, description: 'List of customer accounts' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID for filtering' })
  @ApiQuery({ name: 'kind', required: false, enum: CustomerAccountKind, description: 'Filter by account kind' })
  @ApiQuery({ name: 'profileType', required: false, enum: CustomerProfileType, description: 'Filter by profile type' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for customer lookup' })
  async list(
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
    @Query('kind') kind?: CustomerAccountKind,
    @Query('profileType') profileType?: CustomerProfileType,
    @Query('search') search?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    return this.customerService.list({
      tenantId: finalTenantId,
      kind,
      profileType,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer account' })
  @ApiParam({ name: 'id', required: true, description: 'Customer account ID' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Customer account details' })
  @ApiResponse({ status: 400, description: 'Tenant ID is required' })
  async getById(
    @Param('id') id: string,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.customerService.getById(id, tenantId || tenantIdHeader);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer account' })
  @ApiParam({ name: 'id', required: true, description: 'Customer account ID' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Customer account updated' })
  @ApiResponse({ status: 400, description: 'Tenant ID is required' })
  async update(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.customerService.update(id, body, tenantId || tenantIdHeader);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer account' })
  @ApiParam({ name: 'id', required: true, description: 'Customer account ID' })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Customer account deleted' })
  @ApiResponse({ status: 400, description: 'Tenant ID is required' })
  async remove(
    @Param('id') id: string,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    return this.customerService.remove(id, tenantId || tenantIdHeader);
  }
}
