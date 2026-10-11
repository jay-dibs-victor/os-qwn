import {
  Controller, Post, Get, Body, Param, Query,
  Headers, BadRequestException,
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
import { CoinRewardService } from '../coin-reward.service';
import { EntityType } from '../entities/coin-wallet.entity';

@ApiTags('Coin Reward')
@ApiBearerAuth('JWT-auth')
@Controller('ledger/coin-reward')
export class CoinRewardController {
  constructor(private readonly coinRewardService: CoinRewardService) {}

  @Post('award-trip')
  @ApiOperation({ summary: 'Award trip coins', description: 'Award coins to both rider and driver for completing a trip.' })
  @ApiBody({ description: 'Award trip coins payload', schema: {
    example: { tripId: 'trip-uuid-1234', tenantId: 'root-admin', riderCustomerId: 'rider-uuid-456', driverCustomerId: 'driver-uuid-789' },
  }})
  @ApiResponse({ status: 201, description: 'Coins awarded successfully' })
  @ApiResponse({ status: 400, description: 'Missing required fields' })
  async awardTripCoins(
    @Body() dto: { tripId: string; tenantId: string; riderCustomerId: string; driverCustomerId: string },
  ) {
    if (!dto.tripId || !dto.tenantId || !dto.riderCustomerId || !dto.driverCustomerId) {
      throw new BadRequestException('Missing required fields: tripId, tenantId, riderCustomerId, driverCustomerId');
    }
    return this.coinRewardService.awardTripCoins(
      dto.tripId, dto.tenantId, dto.riderCustomerId, dto.driverCustomerId,
    );
  }

  @Get('balance/:entityType/:entityId')
  @ApiOperation({ summary: 'Get coin balance', description: 'Get the coin balance for a specific entity (rider/driver/tenant).' })
  @ApiParam({ name: 'entityType', required: true, type: 'string', enum: EntityType, description: 'Entity type (RIDER, DRIVER, or TENANT)' })
  @ApiParam({ name: 'entityId', required: true, type: 'string', description: 'Entity UUID', example: 'rider-uuid-456' })
  @ApiResponse({ status: 200, description: 'Coin balance' })
  @ApiResponse({ status: 400, description: 'Invalid entity type' })
  async getBalance(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const et = entityType.toUpperCase() as EntityType;
    if (!Object.values(EntityType).includes(et)) {
      throw new BadRequestException(`Invalid entityType: ${entityType}`);
    }
    return this.coinRewardService.getCoinBalance(entityId, et);
  }

  @Get('wallet/:entityType/:entityId')
  @ApiOperation({ summary: 'Get coin wallet', description: 'Retrieve the full coin wallet details for an entity.' })
  @ApiParam({ name: 'entityType', required: true, type: 'string', enum: EntityType, description: 'Entity type (RIDER, DRIVER, or TENANT)' })
  @ApiParam({ name: 'entityId', required: true, type: 'string', description: 'Entity UUID', example: 'driver-uuid-789' })
  @ApiResponse({ status: 200, description: 'Coin wallet details' })
  @ApiResponse({ status: 400, description: 'Invalid entity type' })
  async getWallet(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const et = entityType.toUpperCase() as EntityType;
    if (!Object.values(EntityType).includes(et)) {
      throw new BadRequestException(`Invalid entityType: ${entityType}`);
    }
    const wallet = await this.coinRewardService.getWalletByEntity(entityId, et);
    if (!wallet) {
      return { exists: false, entityId, entityType: et, balance: 0 };
    }
    return wallet;
  }

  @Get('transactions/:walletId')
  @ApiOperation({ summary: 'List coin transactions', description: 'Paginated list of coin transactions for a wallet.' })
  @ApiParam({ name: 'walletId', required: true, type: 'string', description: 'Coin wallet ID', example: 'wallet-uuid-1234' })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number (default: 0)', example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, type: 'number', description: 'Items per page (default: 20)', example: 20 })
  @ApiResponse({ status: 200, description: 'Paginated list of coin transactions' })
  async listTransactions(
    @Param('walletId') walletId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.coinRewardService.listCoinTransactions(
      walletId,
      Number(page || '0'),
      Number(pageSize || '20'),
    );
  }

  @Get('wallets')
  @ApiOperation({ summary: 'List all coin wallets', description: 'Retrieve all coin wallets for a tenant.' })
  @ApiResponse({ status: 200, description: 'List of coin wallets' })
  @ApiResponse({ status: 400, description: 'x-tenant-id header required' })
  async listAllWallets(@Headers('x-tenant-id') tenantId?: string) {
    if (!tenantId) throw new BadRequestException('x-tenant-id header required');
    return this.coinRewardService.listAllWallets(tenantId);
  }
}
