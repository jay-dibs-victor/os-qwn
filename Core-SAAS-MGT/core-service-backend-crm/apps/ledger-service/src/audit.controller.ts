import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('Ledger Audit')
@ApiBearerAuth('JWT-auth')
@Controller('ledger/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('trail')
  @ApiOperation({ summary: 'List audit trail', description: 'Paginated list of audit trail entries for a tenant.' })
  @ApiQuery({ name: 'tenantId', required: false, type: 'string', description: 'Tenant ID', example: 'root-admin' })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number (default: 0)', example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, type: 'number', description: 'Items per page (default: 20)', example: 20 })
  @ApiResponse({ status: 200, description: 'Paginated audit trail entries' })
  async listAuditTrail(
    @Query('tenantId') tenantId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.auditService.listAuditTrail(
      finalTenantId,
      Number(page || '0'),
      Number(pageSize || '20'),
    );
  }

  @Get('trail/:reference')
  @ApiOperation({ summary: 'Get full audit trail by reference', description: 'Retrieve the complete audit trail for a specific transaction reference.' })
  @ApiParam({ name: 'reference', required: true, type: 'string', description: 'Transaction reference', example: 'PAY-2026-00123' })
  @ApiQuery({ name: 'tenantId', required: false, type: 'string', description: 'Tenant ID', example: 'root-admin' })
  @ApiResponse({ status: 200, description: 'Full audit trail' })
  @ApiResponse({ status: 404, description: 'Reference not found' })
  async getAuditTrail(
    @Param('reference') reference: string,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.auditService.getFullAuditTrail(reference, finalTenantId);
  }

  @Get('gl-impact/:journalId')
  @ApiOperation({ summary: 'Get GL impact of a transaction', description: 'Shows the general ledger impact (debits/credits) of a specific journal entry.' })
  @ApiParam({ name: 'journalId', required: true, type: 'string', description: 'Journal entry ID', example: 'journal-uuid-1234' })
  @ApiQuery({ name: 'tenantId', required: false, type: 'string', description: 'Tenant ID', example: 'root-admin' })
  @ApiResponse({ status: 200, description: 'GL impact details' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  async getGlImpact(
    @Param('journalId') journalId: string,
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.auditService.getTransactionGlImpact(journalId, finalTenantId);
  }

  @Get('balance-sheet')
  @ApiOperation({ summary: 'Get balance sheet', description: 'Retrieve the balance sheet report for a tenant as of a specific date.' })
  @ApiQuery({ name: 'tenantId', required: false, type: 'string', description: 'Tenant ID', example: 'root-admin' })
  @ApiQuery({ name: 'asOfDate', required: false, type: 'string', description: 'As-of date (ISO 8601)', example: '2026-05-31' })
  @ApiResponse({ status: 200, description: 'Balance sheet report' })
  async getBalanceSheet(
    @Query('tenantId') tenantId?: string,
    @Query('asOfDate') asOfDate?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.auditService.getBalanceSheet(
      finalTenantId,
      asOfDate ? new Date(asOfDate) : undefined,
    );
  }

  @Get('profit-loss')
  @ApiOperation({ summary: 'Get profit & loss statement', description: 'Retrieve the profit and loss statement for a tenant over a date range.' })
  @ApiQuery({ name: 'tenantId', required: false, type: 'string', description: 'Tenant ID', example: 'root-admin' })
  @ApiQuery({ name: 'fromDate', required: false, type: 'string', description: 'Start date (ISO 8601)', example: '2026-01-01' })
  @ApiQuery({ name: 'toDate', required: false, type: 'string', description: 'End date (ISO 8601)', example: '2026-05-31' })
  @ApiResponse({ status: 200, description: 'Profit & loss statement' })
  async getProfitAndLoss(
    @Query('tenantId') tenantId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.auditService.getProfitAndLoss(
      finalTenantId,
      fromDate,
      toDate,
    );
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get trial balance', description: 'Retrieve the trial balance report for a tenant.' })
  @ApiQuery({ name: 'tenantId', required: false, type: 'string', description: 'Tenant ID', example: 'root-admin' })
  @ApiResponse({ status: 200, description: 'Trial balance report' })
  async getTrialBalance(
    @Query('tenantId') tenantId?: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const finalTenantId = tenantId || tenantIdHeader;
    if (!finalTenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.auditService.getTrialBalance(finalTenantId);
  }
}
