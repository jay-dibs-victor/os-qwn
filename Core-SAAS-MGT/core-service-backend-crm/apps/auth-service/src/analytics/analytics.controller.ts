import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@ApiTags('Analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard/metrics')
  @ApiOperation({
    summary: 'Dashboard KPI Metrics',
    description: `Returns all financial KPI cards for the admin dashboard.
All amounts are sourced directly from GL ledger CREDIT sums — not estimated.

**GL Sources:**
- \`grossVolume\` → GL 4100 Platform Revenue (CREDIT sum)
- \`commission\` → GL 4200 Commission Income (CREDIT sum)
- \`chamaEscrow\` → GL 2300 Chama Escrow Liability (outstanding CREDIT balance)
- \`greenSwapCredits\` → GL 4400 Green Swap Credits ÷ $0.50 per QCoin
- \`chamaLoanIncome\` → GL 4300 Chama Loan Income (2% origination fee)
- \`driverSubIncome\` → GL 4500 Driver Subscription ($29/mo)
- \`partnerSubIncome\` → GL 4600 Partner Subscription ($149/mo)

root-admin sees cross-tenant aggregates; tenant-admin sees their own tenant only.`,
  })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01', description: 'Filter from date (YYYY-MM-DD). Defaults to 90 days ago.' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31', description: 'Filter to date (YYYY-MM-DD). Defaults to today.' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard KPI metrics from GL ledger',
    schema: {
      example: {
        grossVolume: 125480.50,
        commission: 12548.05,
        chamaEscrow: 18750.00,
        greenSwapCredits: 2840,
        chamaLoanIncome: 1240.80,
        driverSubIncome: 3480.00,
        partnerSubIncome: 4470.00,
        totalCustomers: 108,
        driverCount: 40,
        riderCount: 40,
        partnerCount: 28,
        activeUsers: 7,
        dateRange: { startDate: '2026-01-01', endDate: '2026-12-31' },
        _sources: {
          grossVolume: 'GL 4100 Platform Revenue — CREDIT sum',
          commission: 'GL 4200 Commission Income — CREDIT sum',
          chamaEscrow: 'GL 2300 Chama Escrow Liability — CREDIT sum',
          greenSwapCredits: 'GL 4400 Green Swap Credits — CREDIT sum ÷ $0.50',
        },
      },
    },
  })
  async getDashboardMetrics(
    @Req() req: Request,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = req.user as { tenantId: string };
    return this.analyticsService.getDashboardMetrics(user.tenantId, startDate, endDate);
  }

  @Get('charts/revenue')
  @ApiOperation({
    summary: 'Get Revenue Chart Data',
    description: 'Get revenue chart data with year and date range filtering',
  })
  @ApiResponse({ status: 200, description: 'Revenue chart data retrieved successfully' })
  @ApiQuery({ name: 'year', required: false, example: '2026', description: 'Year for filtering' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01', description: 'Start date for filtering (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31', description: 'End date for filtering (YYYY-MM-DD)' })
  async getRevenueChart(
    @Req() req: Request,
    @Query('year') year: string = '2026',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = req.user as { tenantId: string };
    return this.analyticsService.getRevenueChart(user.tenantId, year, startDate, endDate);
  }

  @Get('charts/loans')
  @ApiOperation({
    summary: 'Get Loans Chart Data',
    description: 'Get chama escrow loans chart data with year and date range filtering',
  })
  @ApiResponse({ status: 200, description: 'Loans chart data retrieved successfully' })
  @ApiQuery({ name: 'year', required: false, example: '2026', description: 'Year for filtering' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01', description: 'Start date for filtering (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31', description: 'End date for filtering (YYYY-MM-DD)' })
  async getLoansChart(
    @Req() req: Request,
    @Query('year') year: string = '2026',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = req.user as { tenantId: string };
    return this.analyticsService.getLoansChart(user.tenantId, year, startDate, endDate);
  }

  @Get('charts/customers')
  @ApiOperation({
    summary: 'Get Customers Chart Data',
    description: 'Get customer acquisition trends chart data with year and date range filtering',
  })
  @ApiResponse({ status: 200, description: 'Customers chart data retrieved successfully' })
  @ApiQuery({ name: 'year', required: false, example: '2026', description: 'Year for filtering' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01', description: 'Start date for filtering (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31', description: 'End date for filtering (YYYY-MM-DD)' })
  async getCustomersChart(
    @Req() req: Request,
    @Query('year') year: string = '2026',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = req.user as { tenantId: string };
    return this.analyticsService.getCustomersChart(user.tenantId, year, startDate, endDate);
  }

  @Get('charts/drivers')
  @ApiOperation({
    summary: 'Get Drivers Chart Data',
    description: 'Get driver acquisition and vetting chart data with year and date range filtering',
  })
  @ApiResponse({ status: 200, description: 'Drivers chart data retrieved successfully' })
  @ApiQuery({ name: 'year', required: false, example: '2026', description: 'Year for filtering' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01', description: 'Start date for filtering (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31', description: 'End date for filtering (YYYY-MM-DD)' })
  async getDriversChart(
    @Req() req: Request,
    @Query('year') year: string = '2026',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = req.user as { tenantId: string };
    return this.analyticsService.getDriversChart(user.tenantId, year, startDate, endDate);
  }

  @Get('charts/partners')
  @ApiOperation({
    summary: 'Get Partners Chart Data',
    description: 'Get fleet partners cleared yield chart data with year and date range filtering',
  })
  @ApiResponse({ status: 200, description: 'Partners chart data retrieved successfully' })
  @ApiQuery({ name: 'year', required: false, example: '2026', description: 'Year for filtering' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01', description: 'Start date for filtering (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31', description: 'End date for filtering (YYYY-MM-DD)' })
  async getPartnersChart(
    @Req() req: Request,
    @Query('year') year: string = '2026',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = req.user as { tenantId: string };
    return this.analyticsService.getPartnersChart(user.tenantId, year, startDate, endDate);
  }

  @Get('transactions/recent')
  @ApiOperation({
    summary: 'Recent Ledger Transactions',
    description: `Returns the most recent journal entries from the GL ledger.
Each entry shows the full double-entry audit trail: which GL accounts were debited/credited, reference code, tenant, and amount.

**Reference prefix key:**
- \`FARE-\` → Trip fare collection (DR Rider Receivables / CR Platform Revenue)
- \`COMM-\` → Commission split (DR Revenue / CR Commission Income + Driver Payable)
- \`DSUB-\` → Driver subscription ($29/mo)
- \`PSUB-\` → Partner subscription ($149/mo)
- \`CHMD-\` → Chama member deposit into escrow
- \`CHMP-\` → Chama rotation payout
- \`CLOAN-\` → Chama micro-loan origination fee (2%)
- \`SWAP-\` → Solar battery swap carbon credit`,
  })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Number of transactions to return (max 100)' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01', description: 'Filter from date' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31', description: 'Filter to date' })
  @ApiResponse({
    status: 200,
    description: 'Recent ledger transactions',
    schema: {
      example: [
        {
          id: 'uuid',
          reference: 'FARE-TRIP-ROOT-000001',
          timestamp: '2026-05-30T10:00:00Z',
          type: 'chama',
          message: 'Trip fare: John Doe → Alice Rider',
          amount: '+$42.50',
          status: 'SUCCESS',
          tenantId: 'root-admin',
          glAccount: 'Platform Revenue',
        },
      ],
    },
  })
  async getRecentTransactions(
    @Req() req: Request,
    @Query('limit') limit: string = '10',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = req.user as { tenantId: string };
    return this.analyticsService.getRecentTransactions(
      user.tenantId,
      parseInt(limit),
      startDate,
      endDate,
    );
  }
}
