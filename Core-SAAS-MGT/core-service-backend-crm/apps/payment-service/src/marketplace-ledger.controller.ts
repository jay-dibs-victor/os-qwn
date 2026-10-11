import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { MarketplaceLedgerService } from './marketplace-ledger.service';
import { LedgerEntityType } from './entities/marketplace-ledger.entity';

@ApiTags('Marketplace Ledger')
@Controller('payments/fleet/ledger')
export class MarketplaceLedgerController {
  constructor(private readonly service: MarketplaceLedgerService) {}

  @Get(':entityType/:entityId/balance')
  @ApiOperation({ summary: 'Get marketplace ledger balance for an entity' })
  @ApiParam({ name: 'entityType', required: true, enum: LedgerEntityType, description: 'Entity type (driver, partner, platform)' })
  @ApiParam({ name: 'entityId', required: true, description: 'Entity ID (driver ID, partner ID, or tenant ID)' })
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Balance retrieved' })
  async getBalance(
    @Headers('x-tenant-id') tenantId: string,
    @Param('entityType') entityType: LedgerEntityType,
    @Param('entityId') entityId: string,
  ) {
    return this.service.getBalance(tenantId || 'root-admin', entityType, entityId);
  }

  @Get(':entityType/:entityId/entries')
  @ApiOperation({ summary: 'List marketplace ledger entries for an entity' })
  @ApiParam({ name: 'entityType', required: true, enum: LedgerEntityType, description: 'Entity type' })
  @ApiParam({ name: 'entityId', required: true, description: 'Entity ID' })
  @ApiQuery({ name: 'skip', required: false, type: 'number', description: 'Number of records to skip (pagination)' })
  @ApiQuery({ name: 'take', required: false, type: 'number', description: 'Number of records to return (pagination)' })
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Entries retrieved' })
  async getEntries(
    @Headers('x-tenant-id') tenantId: string,
    @Param('entityType') entityType: LedgerEntityType,
    @Param('entityId') entityId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.service.getEntries(tenantId || 'root-admin', entityType, entityId, Number(skip) || 0, Number(take) || 50);
  }

  @Get('partners-due')
  @ApiOperation({ summary: 'Get partners due for remittance' })
  @ApiQuery({ name: 'schedule', required: false, enum: ['daily', 'weekly', 'monthly'], description: 'Filter by remittance schedule' })
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Partners due list retrieved' })
  async getPartnersDue(
    @Headers('x-tenant-id') tenantId: string,
    @Query('schedule') schedule?: string,
  ) {
    return this.service.getPartnersDue(tenantId || 'root-admin', schedule);
  }
}
