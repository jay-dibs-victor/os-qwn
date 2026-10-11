import { Controller, Get, Post, Body, Param, Headers, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EscrowService } from '../services/escrow.service';
import { EscrowCycleType } from '../entities/escrow-wallet.entity';

@ApiTags('Escrow')
@ApiBearerAuth('JWT-auth')
@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('wallet')
  @ApiOperation({ summary: 'Create escrow wallet', description: 'Create a new escrow wallet for a partner.' })
  @ApiBody({ description: 'Wallet creation payload', schema: {
    example: { partnerId: 'partner-uuid-123', cycleType: 'WEEKLY', reference: 'WALLET-001' },
  }})
  @ApiResponse({ status: 201, description: 'Escrow wallet created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createWallet(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { partnerId: string; cycleType?: EscrowCycleType; reference?: string },
  ) {
    return this.escrowService.createWallet({ tenantId, ...dto });
  }

  @Post('lock')
  @HttpCode(200)
  @ApiOperation({ summary: 'Lock funds in escrow', description: 'Lock a specified amount in an escrow wallet.' })
  @ApiBody({ description: 'Lock funds payload', schema: {
    example: { walletId: 'wallet-uuid-1234', amount: 5000.00, reference: 'LOCK-001', actor: 'system' },
  }})
  @ApiResponse({ status: 200, description: 'Funds locked successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or invalid wallet' })
  async lockFunds(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { walletId: string; amount: number; reference?: string; actor?: string },
  ) {
    return this.escrowService.lockFunds({ tenantId, ...dto });
  }

  @Post('release')
  @HttpCode(200)
  @ApiOperation({ summary: 'Release funds from escrow', description: 'Release locked funds from an escrow wallet.' })
  @ApiBody({ description: 'Release funds payload', schema: {
    example: { walletId: 'wallet-uuid-1234', amount: 5000.00, reference: 'REL-001', actor: 'system' },
  }})
  @ApiResponse({ status: 200, description: 'Funds released successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient locked balance or invalid wallet' })
  async releaseFunds(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { walletId: string; amount: number; reference?: string; actor?: string },
  ) {
    return this.escrowService.releaseFunds({ tenantId, ...dto });
  }

  @Post('admin-override')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin override on escrow wallet', description: 'Perform an administrative override to adjust escrow wallet balance.' })
  @ApiBody({ description: 'Admin override payload', schema: {
    example: { walletId: 'wallet-uuid-1234', amount: -2000.00, reason: 'Correction', actor: 'admin@queensos.com' },
  }})
  @ApiResponse({ status: 200, description: 'Admin override applied successfully' })
  @ApiResponse({ status: 400, description: 'Invalid override request' })
  async adminOverride(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: { walletId: string; amount: number; reason: string; actor: string },
  ) {
    return this.escrowService.adminOverride({ tenantId, ...dto });
  }

  @Get('wallets')
  @ApiOperation({ summary: 'Get all escrow wallets', description: 'Retrieve all escrow wallets for a tenant.' })
  @ApiResponse({ status: 200, description: 'List of escrow wallets' })
  async getAllWallets(@Headers('x-tenant-id') tenantId: string) {
    return this.escrowService.getAllWallets(tenantId);
  }

  @Get('wallet/:partnerId')
  @ApiOperation({ summary: 'Get escrow wallet by partner', description: 'Retrieve the escrow wallet for a specific partner.' })
  @ApiParam({ name: 'partnerId', required: true, type: 'string', description: 'Partner ID', example: 'partner-uuid-123' })
  @ApiResponse({ status: 200, description: 'Escrow wallet details' })
  @ApiResponse({ status: 404, description: 'Wallet not found for partner' })
  async getWallet(
    @Headers('x-tenant-id') tenantId: string,
    @Param('partnerId') partnerId: string,
  ) {
    return this.escrowService.getWallet(tenantId, partnerId);
  }

  @Get('wallet/id/:walletId')
  @ApiOperation({ summary: 'Get escrow wallet by ID', description: 'Retrieve an escrow wallet by its unique wallet ID.' })
  @ApiParam({ name: 'walletId', required: true, type: 'string', description: 'Escrow wallet ID', example: 'wallet-uuid-1234' })
  @ApiResponse({ status: 200, description: 'Escrow wallet details' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getWalletById(
    @Headers('x-tenant-id') tenantId: string,
    @Param('walletId') walletId: string,
  ) {
    return this.escrowService.getWalletById(tenantId, walletId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get escrow balance summary', description: 'Retrieve aggregated escrow balance summary for a tenant.' })
  @ApiResponse({ status: 200, description: 'Escrow balance summary' })
  async getBalanceSummary(@Headers('x-tenant-id') tenantId: string) {
    return this.escrowService.getBalanceSummary(tenantId);
  }
}
