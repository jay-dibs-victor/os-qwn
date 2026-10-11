import { Controller, Post, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RemittanceSchedulerService } from '../services/remittance-scheduler.service';
import { SavingsDisbursementSchedulerService } from '../services/savings-disbursement-scheduler.service';

@ApiTags('Scheduler')
@Controller('wallet/scheduler')
export class SchedulerController {
  constructor(
    private readonly remittanceScheduler: RemittanceSchedulerService,
    private readonly savingsScheduler: SavingsDisbursementSchedulerService,
  ) {}

  @Post('remittance/process-overdue')
  @HttpCode(200)
  @ApiOperation({ summary: 'Process overdue remittances', description: 'Trigger processing of all overdue remittance schedules for the current tenant.' })
  @ApiResponse({ status: 200, description: 'Overdue remittances processed successfully' })
  @ApiBearerAuth()
  async processOverdueRemittances(@Headers('x-tenant-id') tenantId: string) {
    return this.remittanceScheduler.processOverdueRemittances(tenantId);
  }

  @Post('savings/disburse-mature')
  @HttpCode(200)
  @ApiOperation({ summary: 'Disburse mature savings', description: 'Trigger disbursement of all matured driver savings plans for the current tenant.' })
  @ApiResponse({ status: 200, description: 'Mature savings disbursed successfully' })
  @ApiBearerAuth()
  async disburseMatureSavings(@Headers('x-tenant-id') tenantId: string) {
    return this.savingsScheduler.processMaturePlans(tenantId);
  }

  @Post('savings/disburse-weekly')
  @HttpCode(200)
  @ApiOperation({ summary: 'Disburse weekly savings', description: 'Trigger weekly disbursement of driver savings contributions for the current tenant.' })
  @ApiResponse({ status: 200, description: 'Weekly savings disbursed successfully' })
  @ApiBearerAuth()
  async disburseWeeklySavings(@Headers('x-tenant-id') tenantId: string) {
    return this.savingsScheduler.processWeeklyDisbursements(tenantId);
  }

  @Post('savings/disburse-monthly')
  @HttpCode(200)
  @ApiOperation({ summary: 'Disburse monthly savings', description: 'Trigger monthly disbursement of driver savings contributions for the current tenant.' })
  @ApiResponse({ status: 200, description: 'Monthly savings disbursed successfully' })
  @ApiBearerAuth()
  async disburseMonthlySavings(@Headers('x-tenant-id') tenantId: string) {
    return this.savingsScheduler.processMonthlyDisbursements(tenantId);
  }
}
